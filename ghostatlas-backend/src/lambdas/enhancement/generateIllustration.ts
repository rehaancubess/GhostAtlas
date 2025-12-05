import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || 'us-east-1',
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

interface GenerateIllustrationInput {
  encounterId: string;
  enhancedStory: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

interface GenerateIllustrationOutput {
  illustrationUrls: string[];
}

/**
 * Generate a single spooky illustration from an enhanced narrative
 * using AWS Bedrock with Amazon Titan Image Generator V2 model.
 * Updated to generate only 1 image instead of 3-5.
 * 
 * @param input - The enhanced narrative and encounter data
 * @returns Array of CloudFront URLs for the generated illustration
 * @throws Error if generation fails after retries
 */
export async function generateIllustration(
  input: GenerateIllustrationInput
): Promise<GenerateIllustrationOutput> {
  const { encounterId, enhancedStory, location } = input;

  // Get configuration for number of images - default to 1
  const minIllustrations = parseInt(process.env.MIN_ILLUSTRATIONS || '1', 10);
  const maxIllustrations = parseInt(process.env.MAX_ILLUSTRATIONS || '1', 10);

  // Extract scenes from the narrative
  const scenes = extractScenes(enhancedStory, minIllustrations, maxIllustrations);
  console.log(`Generating ${scenes.length} illustrations for encounter ${encounterId}`);

  const illustrationUrls: string[] = [];
  const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN;
  if (!cloudfrontDomain) {
    throw new Error('CLOUDFRONT_DOMAIN environment variable not set');
  }

  // Use a consistent seed base for visual coherence across images
  const baseSeed = Math.floor(Math.random() * 4294967295);

  // Generate each illustration
  for (let i = 0; i < scenes.length; i++) {
    const scenePrompt = buildScenePrompt(scenes[i], location, i);
    const maxRetries = 2;
    let lastError: Error | null = null;
    let success = false;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Use seed variation for consistency but uniqueness
        const seed = baseSeed + i * 1000;
        const imageBuffer = await invokeStableDiffusion(scenePrompt, seed);

        // Save to S3 with index
        const s3Key = `encounters/${encounterId}/illustrations/${i}.png`;
        await saveToS3(imageBuffer, s3Key);

        // Build CloudFront URL
        const illustrationUrl = `https://${cloudfrontDomain}/${s3Key}`;
        illustrationUrls.push(illustrationUrl);
        
        console.log(`Successfully generated illustration ${i + 1}/${scenes.length}`);
        success = true;
        break;
      } catch (error) {
        lastError = error as Error;
        console.error(
          `Illustration ${i} generation attempt ${attempt + 1} failed:`,
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

    // If this image failed after all retries, continue if we have minimum images
    if (!success) {
      console.error(`Failed to generate illustration ${i} after retries`);
      if (illustrationUrls.length < minIllustrations) {
        throw new Error(
          `Failed to generate minimum ${minIllustrations} illustrations. Only generated ${illustrationUrls.length}`
        );
      }
      // Otherwise, continue with what we have
      break;
    }
  }

  if (illustrationUrls.length === 0) {
    throw new Error('Failed to generate any illustrations');
  }

  console.log(`Successfully generated ${illustrationUrls.length} illustrations`);
  return { illustrationUrls };
}

/**
 * Extract key visual elements from the narrative for image generation
 * Creates a concise scene description rather than using story text directly
 */
function extractScenes(
  enhancedStory: string,
  minScenes: number,
  maxScenes: number
): string[] {
  // Extract key visual elements from the story
  // Look for descriptive passages about setting, atmosphere, and key moments
  
  // Split into sentences
  const sentences = enhancedStory
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  if (sentences.length === 0) {
    return ['A dark, mysterious paranormal encounter'];
  }

  // Find sentences with visual/atmospheric keywords
  const visualKeywords = [
    'dark', 'shadow', 'light', 'night', 'fog', 'mist', 'room', 'door', 
    'window', 'figure', 'silhouette', 'appeared', 'saw', 'looked', 
    'stood', 'walked', 'house', 'building', 'forest', 'road', 'path'
  ];
  
  const visualSentences = sentences.filter(s => 
    visualKeywords.some(keyword => s.toLowerCase().includes(keyword))
  );
  
  // Use visual sentences if found, otherwise use first few sentences
  const relevantSentences = visualSentences.length > 0 
    ? visualSentences.slice(0, 3)
    : sentences.slice(0, 3);
  
  // Create a concise scene description (max 200 chars before adding style prompts)
  let sceneDesc = relevantSentences.join('. ');
  if (sceneDesc.length > 200) {
    sceneDesc = sceneDesc.substring(0, 200);
    // Truncate at last complete word
    const lastSpace = sceneDesc.lastIndexOf(' ');
    if (lastSpace > 150) {
      sceneDesc = sceneDesc.substring(0, lastSpace);
    }
  }
  
  return [sceneDesc];
}

/**
 * Build a visual scene description for image generation
 * Titan Image Generator V2 has a 512 character limit for prompts
 * Creates a proper image prompt rather than using story text directly
 */
function buildScenePrompt(
  sceneText: string,
  location: { latitude: number; longitude: number; address?: string },
  sceneIndex: number
): string {
  // Extract location type if available
  const locationDesc = location.address
    ? extractLocationType(location.address)
    : 'mysterious location';

  // Extract key visual elements from the scene text
  const visualElements = extractVisualElements(sceneText);
  
  // Build a concise visual prompt (not story text)
  const prompt = `Dark atmospheric horror scene: ${visualElements} at ${locationDesc}. Cinematic lighting, dramatic shadows, eerie fog, mysterious atmosphere, photorealistic style, high detail, moody aesthetic, haunting composition.`;
  
  // Ensure it fits within 512 char limit
  if (prompt.length <= 512) {
    return prompt;
  }
  
  // If too long, use a simpler version
  const simplePrompt = `Horror scene: ${visualElements.substring(0, 100)} at ${locationDesc}. Dark, cinematic lighting, dramatic shadows, mysterious atmosphere, photorealistic, high detail.`;
  
  return simplePrompt.substring(0, 512);
}

/**
 * Extract location type from address for better image prompts
 */
function extractLocationType(address: string): string {
  const lower = address.toLowerCase();
  
  // Check for specific location types
  if (lower.includes('house') || lower.includes('home')) return 'an old house';
  if (lower.includes('building') || lower.includes('apartment')) return 'an abandoned building';
  if (lower.includes('road') || lower.includes('street') || lower.includes('highway')) return 'a dark road';
  if (lower.includes('forest') || lower.includes('woods')) return 'a dark forest';
  if (lower.includes('cemetery') || lower.includes('graveyard')) return 'a cemetery';
  if (lower.includes('church') || lower.includes('chapel')) return 'an old church';
  if (lower.includes('hospital')) return 'an abandoned hospital';
  if (lower.includes('school')) return 'an empty school';
  if (lower.includes('park')) return 'a dark park';
  if (lower.includes('bridge')) return 'a foggy bridge';
  if (lower.includes('tunnel')) return 'a dark tunnel';
  if (lower.includes('basement') || lower.includes('cellar')) return 'a dark basement';
  if (lower.includes('attic')) return 'a dusty attic';
  
  // Default to generic location
  return 'a mysterious location';
}

/**
 * Extract key visual elements from scene text for image generation
 */
function extractVisualElements(sceneText: string): string {
  const lower = sceneText.toLowerCase();
  const elements: string[] = [];
  
  // Look for figures/entities
  if (lower.includes('figure') || lower.includes('silhouette') || lower.includes('shadow')) {
    elements.push('shadowy figure');
  } else if (lower.includes('woman') || lower.includes('lady')) {
    elements.push('ghostly woman');
  } else if (lower.includes('man') || lower.includes('person')) {
    elements.push('mysterious figure');
  } else if (lower.includes('child') || lower.includes('kid')) {
    elements.push('ghostly child');
  }
  
  // Look for atmospheric elements
  if (lower.includes('fog') || lower.includes('mist')) {
    elements.push('thick fog');
  }
  if (lower.includes('dark') || lower.includes('darkness')) {
    elements.push('deep darkness');
  }
  if (lower.includes('light') && (lower.includes('flicker') || lower.includes('dim'))) {
    elements.push('flickering lights');
  }
  
  // Look for setting details
  if (lower.includes('door')) {
    elements.push('ominous doorway');
  }
  if (lower.includes('window')) {
    elements.push('dark windows');
  }
  if (lower.includes('stairs') || lower.includes('staircase')) {
    elements.push('creaking stairs');
  }
  if (lower.includes('mirror')) {
    elements.push('eerie mirror');
  }
  
  // If we found elements, combine them
  if (elements.length > 0) {
    return elements.slice(0, 3).join(', '); // Max 3 elements
  }
  
  // Fallback: generic horror scene
  return 'eerie paranormal presence, dark shadows, unsettling atmosphere';
}

/**
 * Invoke Amazon Titan Image Generator V2 model via Bedrock
 */
async function invokeStableDiffusion(
  prompt: string,
  seed: number
): Promise<Buffer> {
  const modelId = 'amazon.titan-image-generator-v2:0';

  // Log prompt details for debugging
  console.log('Prompt length:', prompt.length);
  console.log('Prompt:', prompt);
  
  // Prepare the request body for Titan Image Generator
  const requestBody = {
    taskType: 'TEXT_IMAGE',
    textToImageParams: {
      text: prompt,
      negativeText: 'cartoon, anime, bright colors, cheerful, low quality, text, watermark, signature',
    },
    imageGenerationConfig: {
      numberOfImages: 1,
      quality: 'premium',
      height: 1024,
      width: 1024,
      cfgScale: 7.0,
      seed: seed, // Use provided seed for consistency
    },
  };
  
  console.log('Request body:', JSON.stringify(requestBody, null, 2));
  
  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(requestBody),
  });

  // Set timeout to 40 seconds (Titan can be slow)
  const timeoutMs = 40000;
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        new Error(`Titan Image Generator invocation timed out after ${timeoutMs}ms`)
      );
    }, timeoutMs);
  });

  try {
    const response = await Promise.race([
      bedrockClient.send(command),
      timeoutPromise,
    ]);

    // Parse the response
    const responseBody = JSON.parse(
      new TextDecoder().decode(response.body)
    );

    // Extract the base64 image from the response
    if (
      responseBody.images &&
      Array.isArray(responseBody.images) &&
      responseBody.images.length > 0
    ) {
      const base64Image = responseBody.images[0];
      if (!base64Image) {
        throw new Error('No image data in response');
      }

      // Convert base64 to buffer
      return Buffer.from(base64Image, 'base64');
    }

    throw new Error('Invalid response format from Titan Image Generator');
  } catch (error) {
    console.error(
      `Titan Image Generator invocation failed:`,
      error
    );
    throw error;
  }
}

/**
 * Save the generated image to S3
 */
async function saveToS3(imageBuffer: Buffer, s3Key: string): Promise<void> {
  const bucketName = process.env.MEDIA_BUCKET;
  if (!bucketName) {
    throw new Error('MEDIA_BUCKET environment variable not set');
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: imageBuffer,
    ContentType: 'image/png',
    CacheControl: 'public, max-age=86400', // 24 hours
  });

  try {
    await s3Client.send(command);
    console.log(`Successfully saved illustration to S3: ${s3Key}`);
  } catch (error) {
    console.error('Failed to save illustration to S3:', error);
    throw error;
  }
}
