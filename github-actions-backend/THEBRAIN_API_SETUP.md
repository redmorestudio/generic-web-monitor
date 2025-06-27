# TheBrain API Integration Setup

## Required GitHub Secrets

To enable TheBrain API sync, you need to add the following secrets to your GitHub repository:

### 1. THEBRAIN_API_KEY
Your TheBrain API key for authentication.

### 2. THEBRAIN_BRAIN_ID
The ID of the brain where thoughts will be created.

## How to Add Secrets

1. Go to your repository on GitHub
2. Click on **Settings** (in the repository menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret:
   - Name: `THEBRAIN_API_KEY`
   - Value: Your API key
   - Click **Add secret**
6. Repeat for `THEBRAIN_BRAIN_ID`

## Testing the Integration

1. Go to the **Actions** tab in your repository
2. Select **3. Sync & Deploy** workflow
3. Click **Run workflow**
4. The workflow will:
   - Run baseline analysis
   - Create thoughts and links via API
   - Deploy to GitHub Pages

## What Gets Created

The sync creates:
- Root "AI Competitive Monitor" thought
- Main categories (Companies, Changes, Architecture, Insights)
- All 52+ monitored companies organized by type
- Recent high-value changes
- System architecture visualization
- AI-generated insights

## Troubleshooting

If the sync fails:
1. Check that both secrets are set correctly
2. Verify the Brain ID is correct
3. Check the workflow logs for specific error messages

The workflow will show a warning if credentials are missing and skip the sync step.
