import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || 'us-east-1',
});

interface GenerateNarrativeInput {
  originalStory: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  encounterTime: string;
}

interface GenerateNarrativeOutput {
  enhancedStory: string;
}

/**
 * Generate an enhanced horror narrative from an original encounter story
 * using AWS Bedrock with Amazon Nova Pro model.
 * 
 * @param input - The original encounter data
 * @returns Enhanced horror narrative (max 10,000 chars)
 * @throws Error if generation fails after retries
 */
export async function generateNarrative(
  input: GenerateNarrativeInput
): Promise<GenerateNarrativeOutput> {
  const { originalStory, location, encounterTime } = input;

  // Build the prompt template
  const prompt = buildPrompt(originalStory, location, encounterTime);

  // Invoke Bedrock with retry logic
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const enhancedStory = await invokeClaude(prompt, attempt);
      
      // Validate the response
      if (!enhancedStory || enhancedStory.trim().length === 0) {
        throw new Error('Generated narrative is empty');
      }

      // Enforce max length
      const truncatedStory = enhancedStory.substring(0, 10000);

      return { enhancedStory: truncatedStory };
    } catch (error) {
      lastError = error as Error;
      console.error(
        `Narrative generation attempt ${attempt + 1} failed:`,
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
    `Failed to generate narrative after ${maxRetries + 1} attempts: ${
      lastError?.message
    }`
  );
}

/**
 * Build the prompt template for Claude
 */
function buildPrompt(
  originalStory: string,
  location: { latitude: number; longitude: number; address?: string },
  encounterTime: string
): string {
  // Only include address if available, never GPS coordinates
  const locationContext = location.address
    ? `Location context: ${location.address}`
    : 'Location context: (location details omitted)';

  return `You are an expert editor specializing in paranormal narratives. Your job is to enhance the user's story while preserving their exact sequence of events, structure, and personal voice.

Original Story:
${originalStory}

${locationContext}
Time: ${encounterTime}

CRITICAL REQUIREMENTS:
- PRESERVE the user's exact story structure and flow - do NOT reorganize or reframe how they tell it
- KEEP their opening exactly as they wrote it - do NOT create a new beginning
- MAINTAIN all factual details, names, events, and descriptions exactly as provided
- If the story is brief or basic, expand it naturally by adding atmospheric details that fit their narrative
- DO NOT add new plot points, characters, or events that weren't in the original
- DO NOT include GPS coordinates or numeric location data

ENHANCEMENT GUIDELINES:
- Improve sentence flow and readability where needed
- Add sensory details (sounds, smells, textures, visual atmosphere) that enhance existing moments
- Deepen the emotional impact and tension of moments they already described
- Use more evocative and vivid language while keeping their voice
- Add subtle horror atmosphere (shadows, silence, unease) without changing what happened
- If they wrote 2 sentences, expand to a paragraph; if they wrote 3 paragraphs, expand to 5-8 paragraphs
- Target length: 500-2000 words depending on original length

TONE: Keep it authentic to their experience - spooky and atmospheric, but grounded in their reality.

Enhanced Story:`;
}

/**
 * Invoke Amazon Nova Pro model via Bedrock
 */
async function invokeClaude(
  prompt: string,
  attempt: number
): Promise<string> {
  const modelId = 'amazon.nova-pro-v1:0';

  // Prepare the request body for Nova
  const requestBody = {
    messages: [
      {
        role: 'user',
        content: [{ text: prompt }],
      },
    ],
    inferenceConfig: {
      max_new_tokens: 4096,
      temperature: 0.7,
      top_p: 0.9,
    },
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(requestBody),
  });

  // Set timeout to 60 seconds (Nova can be slower, especially under load)
  const timeoutMs = 60000;
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Bedrock invocation timed out after ${timeoutMs}ms`));
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

    // Extract the generated text from Nova's response
    if (responseBody.output && responseBody.output.message && responseBody.output.message.content) {
      const content = responseBody.output.message.content;
      if (Array.isArray(content) && content.length > 0 && content[0].text) {
        return content[0].text;
      }
    }

    throw new Error('Invalid response format from Nova');
  } catch (error) {
    console.error(`Bedrock invocation failed (attempt ${attempt + 1}):`, error);
    throw error;
  }
}
