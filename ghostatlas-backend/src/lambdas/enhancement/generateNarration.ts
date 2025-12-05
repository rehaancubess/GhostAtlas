import {
  PollyClient,
  SynthesizeSpeechCommand,
  Engine,
  OutputFormat,
  TextType,
  VoiceId,
} from '@aws-sdk/client-polly';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const pollyClient = new PollyClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

interface GenerateNarrationInput {
  encounterId: string;
  enhancedStory: string;
}

interface GenerateNarrationOutput {
  narrationUrl: string;
}

/**
 * Generate voice narration from an enhanced narrative
 * using AWS Polly with Long-form voice engine (Ruth voice).
 * Long-form voices are highly expressive and emotionally adept,
 * perfect for captivating horror narration.
 * 
 * @param input - The enhanced narrative and encounter ID
 * @returns CloudFront URL of the generated narration MP3
 * @throws Error if generation fails after retries
 */
export async function generateNarration(
  input: GenerateNarrationInput
): Promise<GenerateNarrationOutput> {
  const { encounterId, enhancedStory } = input;

  // Split story into chunks if needed (Polly has a 3000 char limit for SSML)
  const chunks = splitIntoChunks(enhancedStory, 2800); // Leave room for SSML tags

  // Invoke Polly with retry logic
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Generate audio for each chunk
      const audioBuffers: Buffer[] = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const ssmlText = buildSSML(chunks[i]);
        const audioBuffer = await invokePolly(ssmlText, attempt, i);
        audioBuffers.push(audioBuffer);
      }

      // Concatenate audio buffers if multiple chunks
      const finalAudio = Buffer.concat(audioBuffers);

      // Save to S3
      const s3Key = `encounters/${encounterId}/narration.mp3`;
      await saveToS3(finalAudio, s3Key);

      // Build CloudFront URL
      const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN;
      if (!cloudfrontDomain) {
        throw new Error('CLOUDFRONT_DOMAIN environment variable not set');
      }

      const narrationUrl = `https://${cloudfrontDomain}/${s3Key}`;

      return { narrationUrl };
    } catch (error) {
      lastError = error as Error;
      console.error(
        `Narration generation attempt ${attempt + 1} failed:`,
        error
      );

      // Don't retry on the last attempt
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s
        const backoffMs = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  // All retries failed, throw the last error
  throw new Error(
    `Failed to generate narration after ${maxRetries + 1} attempts: ${
      lastError?.message
    }`
  );
}

/**
 * Split text into chunks to handle Polly's character limit
 */
function splitIntoChunks(text: string, maxChunkSize: number): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let currentChunk = '';

  // Split by sentences to avoid cutting mid-sentence
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= maxChunkSize) {
      currentChunk += sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * Build SSML template for Polly
 * Long-form engine supports many SSML tags for expressive narration
 */
function buildSSML(text: string): string {
  return `<speak>
  <prosody rate="95%">
    ${escapeXML(text)}
  </prosody>
  <break time="1s"/>
</speak>`;
}

/**
 * Escape XML special characters for SSML
 */
function escapeXML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Invoke Polly to synthesize speech
 */
async function invokePolly(
  ssmlText: string,
  attempt: number,
  chunkIndex: number
): Promise<Buffer> {
  const command = new SynthesizeSpeechCommand({
    Engine: 'long-form' as Engine, // Use Long-form engine for expressive, emotionally adept narration
    OutputFormat: OutputFormat.MP3,
    SampleRate: '24000', // 24 kHz sample rate for Long-form engine
    Text: ssmlText,
    TextType: TextType.SSML,
    VoiceId: 'Ruth' as VoiceId, // Female long-form voice for horror narration
  });

  // Set timeout to 15 seconds
  const timeoutMs = 15000;
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Polly invocation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const response = await Promise.race([
      pollyClient.send(command),
      timeoutPromise,
    ]);

    if (!response.AudioStream) {
      throw new Error('No audio stream in Polly response');
    }

    // Convert stream to buffer
    const audioBuffer = await streamToBuffer(response.AudioStream as Readable);

    console.log(
      `Successfully generated narration chunk ${chunkIndex} (${audioBuffer.length} bytes)`
    );

    return audioBuffer;
  } catch (error) {
    console.error(
      `Polly invocation failed (attempt ${attempt + 1}, chunk ${chunkIndex}):`,
      error
    );
    throw error;
  }
}

/**
 * Convert a readable stream to a buffer
 */
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Save the generated audio to S3
 */
async function saveToS3(audioBuffer: Buffer, s3Key: string): Promise<void> {
  const bucketName = process.env.MEDIA_BUCKET;
  if (!bucketName) {
    throw new Error('MEDIA_BUCKET environment variable not set');
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: audioBuffer,
    ContentType: 'audio/mpeg',
    CacheControl: 'public, max-age=86400', // 24 hours
  });

  try {
    await s3Client.send(command);
    console.log(`Successfully saved narration to S3: ${s3Key}`);
  } catch (error) {
    console.error('Failed to save narration to S3:', error);
    throw error;
  }
}
