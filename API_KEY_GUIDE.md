# API Key Management Guide for AI Competitor Monitor

## 🔐 Security Best Practices

### Never Do This:
- ❌ Never put API keys directly in code
- ❌ Never commit API keys to git
- ❌ Never share API keys in documentation
- ❌ Never use API keys in client-side code

### Always Do This:
- ✅ Store API keys in Google Apps Script Properties
- ✅ Use environment-specific storage
- ✅ Rotate keys regularly
- ✅ Revoke compromised keys immediately

## 🚀 Setup Instructions

### Option 1: Script Properties UI (Recommended)
1. Open your Google Apps Script project
2. Go to Project Settings → Script Properties
3. Add property: `CLAUDE_API_KEY` = `your-api-key`
4. Save

### Option 2: One-Time Setup Function
1. Edit `SetupApiKey.js` and add your API key
2. Run `setupApiKeyOnce()` function once
3. Delete the file or remove the API key from code
4. Verify with `verifyApiKeySetup()`

### Option 3: Manual Script Run
```javascript
// Run this in Script Editor console once
PropertiesService.getScriptProperties()
  .setProperty('CLAUDE_API_KEY', 'your-actual-api-key');
```

## 📋 Verification

Run this function to check if API key is properly set:
```javascript
verifyApiKeySetup()
```

Expected result:
```javascript
{
  setup: true,
  connection: true,
  message: 'API key is set and working!'
}
```

## 🔄 Key Rotation

When you need to update the API key:
1. Generate new key from Anthropic Console
2. Update in Script Properties
3. Test with `verifyApiKeySetup()`
4. Revoke old key

## 🛡️ Additional Security

### For Production:
- Use separate API keys for dev/staging/production
- Set up usage alerts in Anthropic Console
- Monitor API usage regularly
- Use least-privilege principle

### Access Control:
- Only project owners should set API keys
- Use Google Apps Script's built-in authentication
- Don't share Script Properties access

## 🚨 If Key is Compromised

1. Immediately revoke the key in Anthropic Console
2. Generate a new key
3. Update Script Properties
4. Check logs for unauthorized usage
5. Review security practices

## 📝 Code Usage

Your code correctly retrieves the key:
```javascript
const apiKey = PropertiesService
  .getScriptProperties()
  .getProperty('CLAUDE_API_KEY');
```

This keeps the key secure and out of your codebase!
