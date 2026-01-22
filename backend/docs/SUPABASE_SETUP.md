# 🗄️ Supabase Setup

Quick guide to configure Supabase in your local environment.

## Quick Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the setup to complete (2-3 minutes)

### 2. Get Credentials

In your project dashboard:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Important**: Use the `service_role` key, not the `anon` key.

### 3. Configure Environment Variables

Create a `.env` file in the backend root:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
JWT_SECRET=your-jwt-secret-here
```

### 4. Run Migrations

Apply database migrations:

```bash
# Option 1: Using Supabase CLI (recommended)
supabase db push

# Option 2: Manually from the dashboard
# Go to SQL Editor and run the files in supabase/migrations/
```

### 5. Verify Configuration

Start the server:

```bash
npm run dev
```

If you see `✅ All required environment variables are set`, the configuration is correct.

## Troubleshooting

- **Connection error**: Verify that `SUPABASE_URL` has the correct format (https://...)
- **Authentication error**: Make sure you're using `service_role` key, not `anon` key
- **Migrations fail**: Verify that your project has admin permissions
