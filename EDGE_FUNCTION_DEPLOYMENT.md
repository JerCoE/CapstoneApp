# Edge Function Deployment Guide

## Prerequisites
- Supabase CLI installed
- Logged in to Supabase CLI
- Environment variables configured in Supabase project

## Deployment Steps

### Step 1: Install Supabase CLI (if not already installed)
```powershell
# Using npm
npm install -g supabase

# Or using Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 2: Login to Supabase
```powershell
supabase login
```
This will open a browser window for authentication.

### Step 3: Link to Your Supabase Project
```powershell
# Run this from the project root directory
supabase link --project-ref <your-project-ref>
```

To find your project ref:
1. Go to your Supabase dashboard
2. Look at the URL: `https://supabase.com/dashboard/project/<project-ref>`
3. Or go to Settings → General → Reference ID

### Step 4: Set Environment Variables (One-Time Setup)
These environment variables need to be set in your Supabase project:

```powershell
# Set the environment variables in Supabase dashboard:
# Go to: Project Settings → Edge Functions → Secrets

# Required variables:
# - SUPABASE_URL (auto-set by Supabase)
# - SUPABASE_SERVICE_ROLE_KEY (auto-set by Supabase)
# - MSAL_CLIENT_ID (your Azure AD app client ID)
# - MSAL_TENANT_ID (your Azure AD tenant ID)
```

**How to set secrets:**
1. Go to Supabase Dashboard
2. Select your project
3. Go to Settings → Edge Functions
4. Add secrets:
   - `MSAL_CLIENT_ID`: `<your-azure-app-client-id>`
   - `MSAL_TENANT_ID`: `<your-azure-tenant-id>`

### Step 5: Deploy the Edge Function
```powershell
# Deploy the microsoft-sync function
supabase functions deploy microsoft-sync

# Or deploy all functions
supabase functions deploy
```

### Step 6: Verify Deployment
```powershell
# List all deployed functions
supabase functions list
```

You should see `microsoft-sync` in the list.

### Step 7: Test the Function
You can test it using the Supabase dashboard:
1. Go to Database → Functions
2. Find `microsoft-sync`
3. Click "Invoke" to test

Or test from your app by logging in with Microsoft SSO.

## Checking Function Logs

To view real-time logs:
```powershell
supabase functions logs microsoft-sync --follow
```

Or view logs in Supabase Dashboard:
1. Go to Edge Functions
2. Click on `microsoft-sync`
3. View the Logs tab

## Common Issues

### Issue: "Project ref not found"
**Solution:** Make sure you've linked your project correctly with `supabase link`

### Issue: "Environment variables not set"
**Solution:** Check that MSAL_CLIENT_ID and MSAL_TENANT_ID are set in the Supabase dashboard under Settings → Edge Functions → Secrets

### Issue: "Function not found"
**Solution:** Make sure you're in the correct directory and the function folder exists at `supabase/functions/microsoft-sync/`

## Rollback
If you need to rollback to a previous version:
```powershell
# Redeploy the previous version from git
git checkout <previous-commit>
supabase functions deploy microsoft-sync
git checkout admin
```

## Updated Role Assignment Logic

After deployment, the Edge Function will:
- ✅ Assign `['employee']` role to ALL new users by default
- ✅ Add any additional roles from request body (e.g., `['employee', 'admin']`)
- ✅ Preserve existing roles for returning users
- ✅ Never override roles on subsequent logins

### Examples:

**New user (no roles in body):**
```
Result: ['employee']
```

**New user (roles: ['admin'] in body):**
```
Result: ['employee', 'admin']
```

**Returning user (existing roles: ['admin']):**
```
Result: ['admin'] (preserved, not changed)
```

**Returning user (existing roles: ['employee', 'manager']):**
```
Result: ['employee', 'manager'] (preserved, not changed)
```
