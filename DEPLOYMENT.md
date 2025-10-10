# Deployment Guide - Edge Function Migration

## What Changed

✅ **Removed:** Node.js Express backend (`src/Backend/`)
✅ **Added:** Supabase Edge Function (`supabase/functions/upsert-profile/`)
✅ **Updated:** Frontend now calls Edge Function directly

## Benefits

- ✨ No need to run/maintain a separate Node server
- 🔒 Service role key stored securely in Supabase secrets
- ⚡ Fast cold starts, hosted by Supabase
- 💰 Serverless pricing (pay per invocation)

## Deploy Steps

### 1. Install Supabase CLI

```powershell
npm install -g supabase
```

### 2. Link Your Project

```powershell
supabase link --project-ref nrkqwgixfhnmezddynjq
```

When prompted, enter your Supabase database password.

### 3. Deploy the Edge Function

```powershell
supabase functions deploy upsert-profile
```

### 4. Set Environment Secrets

```powershell
supabase secrets set SUPABASE_URL=https://nrkqwgixfhnmezddynjq.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ya3F3Z2l4ZmhubWV6ZGR5bmpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc0Mjk5NCwiZXhwIjoyMDc1MzE4OTk0fQ.vIsPmXKX2f_PHp_cJaIVYd8iDkwslSRaKj1NnXPbH9Q
supabase secrets set MSAL_CLIENT_ID=88547770-3672-4160-a82e-cf7fd41af342
supabase secrets set MSAL_TENANT_ID=common
```

### 5. Create the Profiles Table

If you haven't already, run this SQL in Supabase SQL Editor:

```sql
create table if not exists public.profiles (
  id text primary key,
  email text,
  display_name text,
  given_name text, 
  surname text,
  job_title text,
  department text,
  office_location text,
  preferred_language text,
  mobile_phone text,
  photo_url text,
  created_at timestamptz default now(),
  last_seen timestamptz,
  is_active boolean default true,
  roles text[],
  metadata jsonb
);

create unique index if not exists profiles_email_idx on public.profiles (lower(email));
```

### 6. Test the App

```powershell
npm run dev
```

- Go to http://localhost:5173
- Click "Sign in with Microsoft"
- Profile should be saved to Supabase!

## Verify Deployment

After deploying, your Edge Function will be available at:
```
https://nrkqwgixfhnmezddynjq.supabase.co/functions/v1/upsert-profile
```

You can test it manually:
```powershell
curl -X POST https://nrkqwgixfhnmezddynjq.supabase.co/functions/v1/upsert-profile `
  -H "Authorization: Bearer YOUR_ID_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"id":"test-id","email":"test@example.com","display_name":"Test"}'
```

## Troubleshooting

**Function not found:**
- Run `supabase functions list` to verify deployment
- Check project ref with `supabase projects list`

**401 Unauthorized:**
- Verify MSAL secrets are set correctly
- Check that id_token is being sent from frontend

**500 Error:**
- Check function logs: `supabase functions logs upsert-profile`
- Verify SUPABASE_SERVICE_ROLE_KEY is correct

**Table doesn't exist:**
- Run the SQL from step 5 in Supabase SQL Editor

## Clean Up

Removed files (no longer needed):
- `src/Backend/` (entire folder)
- `tsconfig.backend.json`
- `npm run start:backend` script
- Express, jose, cross-env dependencies (can remove if not used elsewhere)
