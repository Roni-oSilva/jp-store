-- JP STORE — links de demonstração de USO ÚNICO
-- Rode no Supabase: SQL Editor > New query > cole tudo > Run.
-- Cada link só pode ser liberado por um aparelho: o primeiro que abrir fica com o acesso.

create table if not exists public.demo_links (
  token text primary key,
  note text not null default '',
  created_at timestamptz not null default now(),
  redeemed_at timestamptz,
  device_id text,
  revoked boolean not null default false
);

alter table public.demo_links enable row level security;

drop policy if exists "demo_links_admin_all" on public.demo_links;
create policy "demo_links_admin_all" on public.demo_links for all using (public.is_admin()) with check (public.is_admin());

-- Resgata o link. Retorna: ok | used | revoked | invalid
create or replace function public.redeem_demo_link(p_token text, p_device text) returns text
language plpgsql security definer set search_path = public as $$
declare r public.demo_links;
begin
  if p_token is null or p_device is null or length(p_device) < 8 then return 'invalid'; end if;
  select * into r from public.demo_links where token = p_token for update;
  if not found then return 'invalid'; end if;
  if r.revoked then return 'revoked'; end if;
  if r.device_id is null then
    update public.demo_links set device_id = p_device, redeemed_at = now() where token = p_token;
    return 'ok';
  end if;
  if r.device_id = p_device then return 'ok'; end if;
  return 'used';
end $$;

revoke all on function public.redeem_demo_link(text, text) from public;
grant execute on function public.redeem_demo_link(text, text) to anon, authenticated;

-- Cria um link novo (somente administradores). Retorna o token.
create or replace function public.create_demo_link(p_note text default '') returns text
language plpgsql security definer set search_path = public as $$
declare t text;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  t := encode(gen_random_bytes(16), 'hex');
  insert into public.demo_links (token, note) values (t, coalesce(p_note, ''));
  return t;
end $$;

revoke all on function public.create_demo_link(text) from public;
grant execute on function public.create_demo_link(text) to authenticated;
