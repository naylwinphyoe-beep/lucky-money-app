-- Run this in Supabase SQL Editor. Keep the service-role key server-side only.
create extension if not exists pgcrypto;
create table if not exists employees (
 employee_id text primary key,
 full_name text not null,
 password_hash text not null,
 is_active boolean not null default true,
 created_at timestamptz not null default now()
);
create table if not exists campaigns (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 is_active boolean not null default false,
 expires_at timestamptz,
 max_draws integer not null default 30 check (max_draws > 0),
 created_at timestamptz not null default now()
);
create table if not exists prizes (
 id uuid primary key default gen_random_uuid(),
 campaign_id uuid not null references campaigns(id) on delete cascade,
 amount integer not null check (amount > 0),
 quantity integer not null check (quantity >= 0),
 claimed integer not null default 0 check (claimed >= 0),
 is_active boolean not null default true,
 check (claimed <= quantity)
);
create table if not exists draws (
 result_id text primary key default ('LM-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
 campaign_id uuid not null references campaigns(id),
 employee_id text not null references employees(employee_id),
 prize_id uuid not null references prizes(id),
 amount integer not null,
 payment_status text not null default 'PENDING' check (payment_status in ('PENDING','PAID')),
 paid_at timestamptz,
 created_at timestamptz not null default now(),
 unique(campaign_id, employee_id)
);
-- Atomic server-side draw: prevents duplicate draws and overspending prize inventory.
create or replace function draw_lucky_prize(p_employee_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare c campaigns%rowtype; p prizes%rowtype; d draws%rowtype; n integer;
begin
 select * into c from campaigns where is_active = true order by created_at desc limit 1 for update;
 if not found or (c.expires_at is not null and now() > c.expires_at) then raise exception 'CAMPAIGN_CLOSED'; end if;
 if not exists(select 1 from employees where employee_id=p_employee_id and is_active=true) then raise exception 'EMPLOYEE_INVALID'; end if;
 if exists(select 1 from draws where campaign_id=c.id and employee_id=p_employee_id) then raise exception 'ALREADY_DRAWN'; end if;
 select count(*) into n from draws where campaign_id=c.id;
 if n >= c.max_draws then raise exception 'CAMPAIGN_LIMIT_REACHED'; end if;
 select * into p from prizes where campaign_id=c.id and is_active=true and claimed < quantity order by random() limit 1 for update skip locked;
 if not found then raise exception 'NO_PRIZES_LEFT'; end if;
 update prizes set claimed=claimed+1 where id=p.id;
 insert into draws(campaign_id,employee_id,prize_id,amount) values(c.id,p_employee_id,p.id,p.amount) returning * into d;
 return jsonb_build_object('result_id',d.result_id,'amount',d.amount,'employee_id',d.employee_id,'created_at',d.created_at);
end; $$;
revoke all on function draw_lucky_prize(text) from public, anon, authenticated;
grant execute on function draw_lucky_prize(text) to service_role;
-- Enable RLS. The application uses the service-role key only in server routes.
alter table employees enable row level security;
alter table campaigns enable row level security;
alter table prizes enable row level security;
alter table draws enable row level security;
