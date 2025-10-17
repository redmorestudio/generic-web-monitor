/**
 * Authorization helper - Run this first!
 */
function authorizeScript() {
  // This forces the authorization prompt
  console.log("Authorizing script for user:", Session.getActiveUser().getEmail());
  
  // Touch various services to request permissions
  try {
    // Spreadsheet permission
    const testSheet = SpreadsheetApp.create("_temp_auth_test");
    SpreadsheetApp.openById(testSheet.getId());
    // Don't worry about cleanup - just getting permissions
    
    // Script app permission
    console.log("Script URL would be:", ScriptApp.getService().getUrl() || "Not deployed yet");
    
    // Properties permission
    PropertiesService.getScriptProperties().setProperty("auth_test", new Date().toISOString());
    
    console.log("✅ Authorization complete! Now try deploying as Web App.");
    return "Success - you can now deploy!";
  } catch (error) {
    console.error("Authorization error:", error);
    return error.toString();
  }
}

/**
 * Simple test function to verify auth
 */
function testConnection() {
  return {
    user: Session.getActiveUser().getEmail(),
    timezone: Session.getScriptTimeZone(),
    authTest: "If you see this, auth worked!"
  };
}