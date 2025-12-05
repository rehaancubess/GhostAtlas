const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({ region: 'us-east-1' });

const requestBody = {
  taskType: 'TEXT_IMAGE',
  textToImageParams: {
    text: 'Atmospheric scene depicting: The chill of the spring night clung to the air. Cinematic lighting, dramatic shadows, mysterious atmosphere, photorealistic style, high detail, mysterious location. Moody aesthetic.',
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

console.log('Request body:', JSON.stringify(requestBody, null, 2));

const command = new InvokeModelCommand({
  modelId: 'amazon.titan-image-generator-v2:0',
  contentType: 'application/json',
  accept: 'application/json',
  body: JSON.stringify(requestBody),
});

client.send(command)
  .then(response => {
    console.log('Success! Response received');
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log('Has images:', responseBody.images && responseBody.images.length > 0);
  })
  .catch(error => {
    console.error('Error:', error.message);
    console.error('Error name:', error.name);
  });
