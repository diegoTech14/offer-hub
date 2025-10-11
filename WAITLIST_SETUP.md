# Waitlist Setup Instructions

## Current Status

The waitlist feature is **100% functional** using in-memory storage. Data persists during server runtime but is lost on restart.

## For Production Use

To persist waitlist data permanently, create the table in Supabase:

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  comments TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
```

### Option 2: Via Migration File

The migration file is located at:
```
backend/supabase/migrations/20250111000001_create_waitlist.sql
```

If you're using Supabase CLI:
```bash
cd backend
supabase db push
```

## Testing

The waitlist form is located at the bottom of the homepage (`/`).

### Test the endpoint manually:

```bash
curl -X POST http://localhost:4000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","comments":"Interested!"}'
```

### Features:
- ✅ Email validation
- ✅ Duplicate email detection
- ✅ Name and email required
- ✅ Comments optional
- ✅ Success/error toast notifications
- ✅ Auto-reset form on success
- ✅ Beautiful gradient design matching brand colors

## Backend Endpoints

- `POST /api/waitlist` - Add user to waitlist
- `GET /api/waitlist/count` - Get total waitlist count

## Fallback Behavior

Without the Supabase table, the system uses in-memory storage:
- Data stored in Node.js process memory
- Lost on server restart
- Perfect for development/testing
- Automatic switch to Supabase once table is created

