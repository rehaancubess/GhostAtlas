const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({ region: 'us-east-1' });

async function testNova() {
  console.log('Testing Nova Pro...');
  const command = new InvokeModelCommand({
    modelId: 'amazon.nova-pro-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      messages: [{
        role: 'user',
        content: [{ text: 'Say hello in one sentence' }]
      }],
      inferenceConfig: {
        max_new_tokens: 100,
        temperature: 0.7
      }
    })
  });

  try {
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log('✅ Nova Pro works!');
    console.log('Response:', responseBody.output.message.content[0].text);
    return true;
  } catch (error) {
    console.error('❌ Nova Pro failed:', error.message);
    return false;
  }
}

async function testTitan() {
  console.log('\nTesting Titan Image Generator V2...');
  const command = new InvokeModelCommand({
    modelId: 'amazon.titan-image-generator-v2:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      taskType: 'TEXT_IMAGE',
      textToImageParams: {
        text: 'A dark spooky house'
      },
      imageGenerationConfig: {
        numberOfImages: 1,
        quality: 'standard',
        height: 512,
        width: 512,
        cfgScale: 7.0,
        seed: 42
      }
    })
  });

  try {
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log('✅ Titan Image Generator works!');
    console.log('Generated', responseBody.images?.length || 0, 'image(s)');
    return true;
  } catch (error) {
    console.error('❌ Titan Image Generator failed:', error.message);
    return false;
  }
}

async function main() {
  const novaWorks = await testNova();
  const titanWorks = await testTitan();
  
  console.log('\n=== Summary ===');
  console.log('Nova Pro:', novaWorks ? '✅' : '❌');
  console.log('Titan Image:', titanWorks ? '✅' : '❌');
  
  process.exit(novaWorks && titanWorks ? 0 : 1);
}

main();
