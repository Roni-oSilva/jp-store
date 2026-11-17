-- JP STORE — schema Supabase
-- Execute no Supabase: SQL Editor > New query > cole tudo > Run.

create extension if not exists "pgcrypto";

-- ───────── PROFILES (admins) ─────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role) values (new.id, new.email, 'customer')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ───────── CATEGORIES ─────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ───────── PRODUCTS ─────────
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  promo_price numeric(10,2) check (promo_price is null or promo_price >= 0),
  category_id uuid references public.categories(id) on delete set null,
  is_featured boolean not null default false,
  is_on_sale boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort_order int not null default 0
);
create index if not exists product_images_product_idx on public.product_images(product_id);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  color text not null,
  color_hex text,
  stock int not null default 0 check (stock >= 0),
  unique (product_id, size, color)
);
create index if not exists product_variants_product_idx on public.product_variants(product_id);

-- ───────── BANNERS ─────────
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  subtitle text not null default '',
  button_text text not null default 'EXPLORAR COLEÇÃO',
  link text not null default '/loja',
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- ───────── STORE SETTINGS (linha única) ─────────
create table if not exists public.store_settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'JP STORE',
  tagline text not null default 'SEU ESTILO. SUA IDENTIDADE.',
  whatsapp_number text not null default '',   -- somente dígitos com DDI, ex.: 55DDDNUMERO (preenchido no painel)
  instagram text not null default 'jpstoremodamasculina',
  email text not null default '',
  address text not null default '',
  free_shipping_from numeric(10,2),
  shipping_fee numeric(10,2) not null default 0,
  sizes jsonb not null default '["P","M","G","GG","XG"]'::jsonb,
  colors jsonb not null default '[{"name":"Preto","hex":"#111111"},{"name":"Branco","hex":"#f5f5f5"},{"name":"Cinza","hex":"#6b6b70"}]'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values (1) on conflict (id) do nothing;

-- ───────── ORDERS (registro opcional; criado quando o cliente abre o WhatsApp) ─────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  city text not null,
  neighborhood text not null default '',
  address text not null default '',
  delivery_method text not null check (delivery_method in ('entrega','retirada')),
  notes text not null default '',
  items jsonb not null,
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  status text not null default 'enviado_whatsapp',
  created_at timestamptz not null default now()
);

-- ───────── RLS ─────────
alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.products         enable row level security;
alter table public.product_images   enable row level security;
alter table public.product_variants enable row level security;
alter table public.banners          enable row level security;
alter table public.store_settings   enable row level security;
alter table public.orders           enable row level security;

-- profiles: usuário lê o próprio; ninguém altera role pelo cliente (promova admin via SQL)
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles for select using (id = auth.uid() or public.is_admin());

-- leitura pública do catálogo
drop policy if exists "categories_read" on public.categories;
create policy "categories_read" on public.categories for select using (true);
drop policy if exists "products_read" on public.products;
create policy "products_read" on public.products for select using (is_active or public.is_admin());
drop policy if exists "images_read" on public.product_images;
create policy "images_read" on public.product_images for select using (true);
drop policy if exists "variants_read" on public.product_variants;
create policy "variants_read" on public.product_variants for select using (true);
drop policy if exists "banners_read" on public.banners;
create policy "banners_read" on public.banners for select using (is_active or public.is_admin());
drop policy if exists "settings_read" on public.store_settings;
create policy "settings_read" on public.store_settings for select using (true);

-- escrita somente admin
do $$
declare t text;
begin
  foreach t in array array['categories','products','product_images','product_variants','banners','store_settings']
  loop
    execute format('drop policy if exists "%s_admin_write" on public.%I', t, t);
    execute format('create policy "%s_admin_write" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end $$;

-- pedidos: qualquer visitante pode registrar; somente admin lê/altera/exclui
drop policy if exists "orders_insert_public" on public.orders;
create policy "orders_insert_public" on public.orders for insert
  with check (status = 'enviado_whatsapp' and total >= 0 and jsonb_typeof(items) = 'array');
drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all" on public.orders for all using (public.is_admin()) with check (public.is_admin());

-- ───────── STORAGE ─────────
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "storage_public_read" on storage.objects;
create policy "storage_public_read" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "storage_admin_insert" on storage.objects;
create policy "storage_admin_insert" on storage.objects for insert with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "storage_admin_update" on storage.objects;
create policy "storage_admin_update" on storage.objects for update using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "storage_admin_delete" on storage.objects;
create policy "storage_admin_delete" on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());

-- ───────── CATEGORIAS INICIAIS (apenas estrutura, sem produtos) ─────────
insert into public.categories (name, slug, sort_order) values
  ('Camisetas','camisetas',1),
  ('Oversized','oversized',2),
  ('Calças','calcas',3),
  ('Bermudas','bermudas',4),
  ('Moletons','moletons',5),
  ('Jaquetas','jaquetas',6),
  ('Bonés','bones',7),
  ('Acessórios','acessorios',8)
on conflict (slug) do nothing;

-- ───────── TORNAR-SE ADMIN ─────────
-- 1) Crie seu usuário em Authentication > Users (e-mail + senha).
-- 2) Rode (trocando o e-mail):
--    update public.profiles set role = 'admin' where email = 'SEU_EMAIL@exemplo.com';
