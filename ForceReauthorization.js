/**
 * Force re-authorization by using UrlFetchApp
 * Run this function to trigger the authorization prompt
 */
function forceReauthorization() {
  try {
    // This should trigger the authorization dialog
    const testUrl = 'https://www.google.com';
    console.log('Attempting to fetch:', testUrl);
    
    const response = UrlFetchApp.fetch(testUrl, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const code = response.getResponseCode();
    console.log('Success! Response code:', code);
    
    return {
      success: true,
      message: 'Authorization successful! You can now fetch external URLs.',
      responseCode: code
    };
    
  } catch (error) {
    console.error('Authorization needed:', error.toString());
    
    return {
      success: false,
      error: error.toString(),
      message: 'Please authorize the script when prompted, then run this function again.'
    };
  }
}
