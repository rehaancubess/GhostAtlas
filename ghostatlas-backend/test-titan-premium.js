const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({ region: 'us-east-1' });

async function testTitanPremium() {
  console.log('Testing Titan with PREMIUM quality and 1024x1024...');
  const command = new InvokeModelCommand({
    modelId: 'amazon.titan-image-generator-v2:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      taskType: 'TEXT_IMAGE',
      textToImageParams: {
        text: 'A dark spooky house',
        negativeText: 'cartoon, anime, bright colors, cheerful, low quality, text, watermark, signature',
      },
      imageGenerationConfig: {
        numberOfImages: 1,
        quality: 'premium',
        height: 1024,
        width: 1024,
        cfgScale: 7.0,
        seed: 42
      }
    })
  });

  try {
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log('✅ Titan PREMIUM works!');
    console.log('Generated', responseBody.images?.length || 0, 'image(s)');
    return true;
  } catch (error) {
    console.error('❌ Titan PREMIUM failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

testTitanPremium();
