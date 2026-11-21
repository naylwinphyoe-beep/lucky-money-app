# Tazaungdaing Lucky Money — Starter v1.0

A starter web app for a 30-person staff lucky-money campaign. Employee login is Employee ID + password. Draws are random from finite prize inventory, and the database enforces one draw per employee per campaign.

## Important status
This is a source-code starter, not a deployed or production-audited service. Admin campaign/prize editing and payment-status controls are not yet in the web dashboard; manage initial data in Supabase for this first prototype. Do not publish the site or enter real staff data until you have configured secrets, tested the SQL and reviewed access controls.

## Requirements
- Node.js 20+
- Supabase project

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. Copy `.env.example` to `.env.local` and fill in the Supabase URL, service-role key, a random SESSION_SECRET (32+ characters), and a strong ADMIN_PASSWORD.
4. Install packages with `npm install`.
5. Create employees with bcrypt password hashes. Example hash generation: `node -e "const b=require('bcryptjs'); console.log(b.hashSync('Choose-A-Password',12))"`.
6. Insert a campaign and prize inventory in Supabase. Example SQL:

```sql
insert into campaigns(name,is_active,expires_at,max_draws)
values ('Tazaungdaing 2026', true, '2026-11-25T23:59:00+06:30', 30);
-- Use the campaign id returned above:
insert into prizes(campaign_id,amount,quantity) values
('PASTE-CAMPAIGN-UUID',5000,10),
('PASTE-CAMPAIGN-UUID',10000,10),
('PASTE-CAMPAIGN-UUID',20000,5),
('PASTE-CAMPAIGN-UUID',30000,3),
('PASTE-CAMPAIGN-UUID',50000,2);
```
7. Run `npm run dev` and open http://localhost:3000.

Admin login: Employee ID `ADMIN`, password from `ADMIN_PASSWORD`.

## Security notes
- Never put the Supabase service-role key in browser code or commit `.env.local`.
- Use HTTPS in production and a strong random SESSION_SECRET.
- The current starter has a shared admin password; replace it with individual admin authentication before production.
- For employee identity assurance, distribute initial passwords privately and require password changes before launch. Employee ID + password prevents casual reuse but does not prove who is physically using the account; OTP or a staff-specific one-time link can strengthen assurance.
- Payment is manual. Confirm the Result ID and amount in the database before transferring money. Marking paid should be added as an audited admin action in the next iteration.
- Have the SQL reviewed and test simultaneous draw attempts before real use.
