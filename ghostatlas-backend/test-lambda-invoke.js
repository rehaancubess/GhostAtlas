const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const client = new LambdaClient({ region: 'us-east-1' });

async function testOrchestrator() {
  console.log('Testing Enhancement Orchestrator Lambda...');
  
  const payload = {
    Records: [{
      body: JSON.stringify({
        encounterId: 'test-' + Date.now(),
        originalStory: 'I saw a ghost in the old mansion.',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: 'New York, NY'
        },
        encounterTime: '2024-01-27T00:00:00Z'
      })
    }]
  };

  const command = new InvokeCommand({
    FunctionName: 'ghostatlas-enhancement-orchestrator-dev',
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify(payload)
  });

  try {
    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.Payload));
    
    console.log('\n=== Lambda Response ===');
    console.log('StatusCode:', response.StatusCode);
    console.log('FunctionError:', response.FunctionError || 'none');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (response.FunctionError) {
      console.log('\n❌ Lambda execution failed');
      return false;
    } else {
      console.log('\n✅ Lambda execution succeeded');
      return true;
    }
  } catch (error) {
    console.error('\n❌ Failed to invoke Lambda:', error.message);
    return false;
  }
}

testOrchestrator();
