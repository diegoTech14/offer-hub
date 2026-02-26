# Supabase Waitlist Setup Instructions

## 1. Create Database Table

1. Go to your Supabase Dashboard: https://app.supabase.com/project/gansgupugtfgndnlesma
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase-setup.sql`
5. Click **Run** to execute the SQL script

This will:
- Create the `waitlist` table
- Set up indexes for better performance
- Enable Row Level Security (RLS)
- Create policies to allow public inserts (for the waitlist form)
- Add automatic timestamp updates

## 2. Verify Table Creation

1. Go to **Table Editor** in the left sidebar
2. You should see the `waitlist` table
3. Check that the table has these columns:
   - `id` (uuid, primary key)
   - `email` (varchar, unique)
   - `name` (varchar, nullable)
   - `company` (varchar, nullable)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

## 3. Configure CORS (if needed)

1. Go to **Settings** → **API**
2. Scroll to **CORS Origins**
3. Add these origins:
   - `http://localhost:3000` (for local development)
   - `https://offer-hub.tech` (for production)
   - `https://*.vercel.app` (for Vercel preview deployments)

## 4. Environment Variables

The following environment variables are already configured in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://gansgupugtfgndnlesma.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

⚠️ **Important**: Add these same variables to your Vercel project settings:
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add both variables for Production, Preview, and Development

## 5. Test the Waitlist

1. Run the development server: `npm run dev`
2. Navigate to the Community page
3. Scroll to the waitlist form
4. Submit a test email
5. Check the `waitlist` table in Supabase to verify the entry was created

## Security Notes

- The table uses Row Level Security (RLS)
- Anonymous users can only INSERT (submit to waitlist)
- Only authenticated users can SELECT (view waitlist entries)
- Emails are unique - duplicates will be rejected automatically
