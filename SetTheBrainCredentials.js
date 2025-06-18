/**
 * Set TheBrain API credentials in Script Properties
 * This is needed when the UI can't handle more than 50 properties
 */
function setTheBrainCredentials() {
  try {
    const props = PropertiesService.getScriptProperties();
    
    // Set TheBrain API Key
    props.setProperty('THEBRAIN_API_KEY', 'f99d97ccb7ed045c7f5b773e72bd50f461dd77c52c24a9c00496e235fcd11c80');
    console.log('✅ TheBrain API Key set successfully');
    
    // Set Default Brain ID
    props.setProperty('THEBRAIN_DEFAULT_BRAIN_ID', 'ffa43994-e9b6-45f5-b494-203b7c6451b9');
    console.log('✅ TheBrain Default Brain ID set successfully');
    
    // Verify the properties were set
    const verifyKey = props.getProperty('THEBRAIN_API_KEY');
    const verifyBrain = props.getProperty('THEBRAIN_DEFAULT_BRAIN_ID');
    
    console.log('📊 Verification:');
    console.log('API Key:', verifyKey ? '***' + verifyKey.slice(-4) : 'NOT SET');
    console.log('Brain ID:', verifyBrain || 'NOT SET');
    
    // Test TheBrain status
    const status = getTheBrainStatus();
    console.log('🧠 TheBrain Status:', JSON.stringify(status, null, 2));
    
    return {
      success: true,
      message: 'TheBrain credentials set successfully',
      apiKeySet: !!verifyKey,
      brainIdSet: !!verifyBrain,
      status: status
    };
    
  } catch (error) {
    console.error('❌ Error setting TheBrain credentials:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Test TheBrain integration after setting credentials
 */
function testTheBrainIntegration() {
  try {
    console.log('🧠 Testing TheBrain Integration...');
    
    // Check status
    const status = getTheBrainStatus();
    console.log('Status:', JSON.stringify(status, null, 2));
    
    if (!status.success) {
      return {
        success: false,
        error: 'TheBrain not properly configured',
        status: status
      };
    }
    
    // Test creating a thought
    const testThought = createTheBrainThought({
      name: 'AI Monitor Test - ' + new Date().toISOString(),
      type: 'test',
      notes: 'Test thought created by AI Competitive Monitor to verify integration',
      color: '#00ff88'
    });
    
    console.log('Test thought result:', JSON.stringify(testThought, null, 2));
    
    // Test search
    const searchResult = searchTheBrain('AI Monitor');
    console.log('Search result:', JSON.stringify(searchResult, null, 2));
    
    return {
      success: true,
      message: 'TheBrain integration tested successfully',
      status: status,
      testThought: testThought,
      searchResult: searchResult
    };
    
  } catch (error) {
    console.error('❌ Error testing TheBrain integration:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Run this function to set up TheBrain integration
 */
function setupTheBrainIntegration() {
  console.log('🚀 Setting up TheBrain integration...');
  
  // Set credentials
  const credResult = setTheBrainCredentials();
  console.log('Credentials result:', credResult);
  
  if (credResult.success) {
    // Test integration
    const testResult = testTheBrainIntegration();
    console.log('Test result:', testResult);
    
    return {
      success: true,
      message: 'TheBrain integration setup complete',
      credentials: credResult,
      test: testResult
    };
  }
  
  return credResult;
}
