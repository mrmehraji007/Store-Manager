# Store Manager V10 — Cloud Sync Setup

This version keeps the Store Manager interface from V8 and adds shared cloud sync using Supabase.

## What it does
- Same Items / Purchase / Issue / Monthly Report data on multiple phones.
- Login required before cloud data is read or changed.
- Upload current phone data to cloud.
- Download cloud data to the phone.
- Live sync: changes made on one phone can appear on another open phone.
- Existing V8 local data is kept until you choose **Upload Current Data**.

## One-time setup
1. Create a Supabase project.
2. Open the project's SQL Editor.
3. Paste and run `supabase_schema.sql`.
4. In Supabase Auth, create/enable an email-password user. You can use the same account on multiple phones for the simplest setup.
5. In the Store Manager app, tap **Cloud Setup**.
6. Enter:
   - Project URL: `https://YOURPROJECT.supabase.co`
   - Publishable key (or legacy anon key): from the Supabase project API/Data API settings.
   - Login email/password.
7. Tap **Save Setup**, then **Login**.
8. On the phone containing your existing V8 data, tap **Upload Current Data** once.
9. Open the same V9 app on the other phone, enter the same cloud setup/login, and tap **Get Cloud Data** if it does not load automatically.

## Important
- The frontend must use only the publishable/anon key. Never put a Supabase `service_role` or secret key in this HTML.
- The included SQL enables Row Level Security and grants access only to authenticated users.
- The included policy intentionally makes one shared store (`id=1`) visible to every authenticated user of the project. If you later want separate staff permissions/workspaces, the schema should be upgraded to store/team membership and role-based RLS.
