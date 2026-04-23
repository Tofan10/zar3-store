# ZAR3 Hardware Store

Full e-commerce store with admin panel, built with Next.js + Supabase.

## Setup Guide (Step by Step)

---

### Step 1 — Supabase Setup

1. Go to https://supabase.com and create a free account
2. Click **New Project**, name it `zar3-store`
3. Once created, go to **SQL Editor** and paste the entire content of `supabase-schema.sql` and click **Run**
4. Go to **Settings > API** and copy:
   - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

### Step 2 — GitHub Setup

1. Create a new repo at https://github.com/new (name it `zar3-store`)
2. Upload all files from this folder to the repo (drag & drop or git push)

---

### Step 3 — Vercel Setup

1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New Project** → import your `zar3-store` repo
3. Before deploying, go to **Environment Variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL       = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  = your-anon-key
SUPABASE_SERVICE_ROLE_KEY      = your-service-role-key
ADMIN_SECRET                   = choose-a-strong-password
```

4. Click **Deploy** — done!

---

## URLs After Deploy

| Page | URL |
|------|-----|
| Store (customers) | `https://your-site.vercel.app/store` |
| Admin login | `https://your-site.vercel.app/admin` |
| Admin dashboard | `https://your-site.vercel.app/admin/dashboard` |

---

## Admin Panel Features

- **Products**: Add, edit, delete products with images, price, stock, specs
- **Categories**: Add/edit/delete categories with custom icons and slugs
- **Toggles**: Active (visible/hidden in store) and Featured (shown at top)
- **Image Upload**: Upload product images directly — stored in Supabase Storage
- **Specs**: JSON format for flexible product specifications

## Store Features

- Homepage with category cards + featured products
- Separate page per category (`/store/category/pc-builds`)
- Each product has a WhatsApp button with pre-filled order message
- Facebook page link on every product
- Out of stock products shown but WhatsApp button disabled

---

## Local Development

```bash
# 1. Copy env file
cp .env.example .env.local
# Fill in your Supabase keys in .env.local

# 2. Install dependencies
npm install

# 3. Run dev server
npm run dev

# Open http://localhost:3000
```
