const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const bedrockClient = new BedrockRuntimeClient({ region: 'us-east-1' });

// Exact copy of generateNarrative logic
async function testNarrative() {
  console.log('=== Testing Narrative Generation (exact Lambda logic) ===');
  
  const originalStory = 'I saw a ghost in the old mansion.';
  const location = { latitude: 40.7128, longitude: -74.0060, address: 'New York, NY' };
  const encounterTime = '2024-01-27T00:00:00Z';
  
  const prompt = `You are a master horror storyteller. Transform the following paranormal encounter into an atmospheric horror narrative while maintaining all factual details (location, time, people involved).

Original Story:
${originalStory}

Location: ${location.address}
Time: ${encounterTime}

Requirements:
- Maintain all factual details from the original story
- Add atmospheric horror elements (sensory details, tension, dread)
- Use vivid, evocative language
- Keep the narrative between 500-2000 words
- End with a chilling conclusion

Enhanced Horror Narrative:`;

  const requestBody = {
    messages: [{
      role: 'user',
      content: [{ text: prompt }],
    }],
    inferenceConfig: {
      max_new_tokens: 4096,
      temperature: 0.7,
      top_p: 0.9,
    },
  };

  const command = new InvokeModelCommand({
    modelId: 'amazon.nova-pro-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(requestBody),
  });

  try {
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    if (responseBody.output && responseBody.output.message && responseBody.output.message.content) {
      const content = responseBody.output.message.content;
      if (Array.isArray(content) && content.length > 0 && content[0].text) {
        const enhancedStory = content[0].text;
        console.log('✅ Narrative generated successfully');
        console.log('Length:', enhancedStory.length);
        return enhancedStory;
      }
    }
    
    throw new Error('Invalid response format from Nova');
  } catch (error) {
    console.error('❌ Narrative generation failed:', error.message);
    throw error;
  }
}

// Exact copy of generateIllustration logic
async function testIllustration(enhancedStory) {
  console.log('\n=== Testing Illustration Generation (exact Lambda logic) ===');
  
  const encounterId = 'test-123';
  const location = { latitude: 40.7128, longitude: -74.0060, address: 'New York, NY' };
  const minIllustrations = 1;
  
  // Extract scenes
  const sentences = enhancedStory
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);
  
  const scenes = sentences.length > 0 ? [sentences.slice(0, 3).join('. ')] : [enhancedStory];
  console.log(`Generating ${scenes.length} illustration(s)`);
  
  // Build prompt with 512 char limit
  const locationDesc = location.address.substring(0, 30);
  const basePrompt = 'Scene 1 (opening): Dark horror scene: ';
  const suffix = `. Cinematic lighting, moody shadows, eerie atmosphere, photorealistic, high detail, paranormal, ${locationDesc}. Horror aesthetic.`;
  const maxSceneLength = 512 - basePrompt.length - suffix.length - 10;
  const sceneText = scenes[0].substring(0, Math.max(50, maxSceneLength));
  const prompt = (basePrompt + sceneText + suffix).substring(0, 512);
  
  console.log('Prompt length:', prompt.length);
  
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
      seed: 12345,
    },
  };

  const command = new InvokeModelCommand({
    modelId: 'amazon.titan-image-generator-v2:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(requestBody),
  });

  try {
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    if (responseBody.images && Array.isArray(responseBody.images) && responseBody.images.length > 0) {
      const base64Image = responseBody.images[0];
      if (!base64Image) {
        throw new Error('No image data in response');
      }
      
      const imageBuffer = Buffer.from(base64Image, 'base64');
      console.log('✅ Illustration generated successfully');
      console.log('Image size:', imageBuffer.length, 'bytes');
      return true;
    }
    
    throw new Error('Invalid response format from Titan Image Generator');
  } catch (error) {
    console.error('❌ Illustration generation failed:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

async function main() {
  try {
    const enhancedStory = await testNarrative();
    await testIllustration(enhancedStory);
    console.log('\n✅ Complete flow works!');
  } catch (error) {
    console.log('\n❌ Flow failed:', error.message);
    process.exit(1);
  }
}

main();
