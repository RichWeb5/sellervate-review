-- Proves the RLS rules against throwaway fixtures; everything is rolled back.
begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

create function pg_temp.act_as(profile uuid)
returns void
language sql
as $$
  select set_config('request.jwt.claims', json_build_object('sub', profile, 'role', 'authenticated')::text, true);
$$;

insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-00000000000a', 'lead-a@test.local'),
  ('00000000-0000-4000-8000-00000000000b', 'specialist-a@test.local'),
  ('00000000-0000-4000-8000-00000000000c', 'specialist-b@test.local');
insert into public.profiles (id, full_name, email)
select id, email, email from auth.users where email like '%@test.local';
insert into public.brands (id, slug, name, accent_color, voice_summary, procedures) values
  ('10000000-0000-4000-8000-000000000001', 'test-a', 'Brand A', '#111111', '-', '-'),
  ('10000000-0000-4000-8000-000000000002', 'test-b', 'Brand B', '#222222', '-', '-');
insert into public.brand_memberships (brand_id, profile_id, role) values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000a', 'lead'),
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000b', 'specialist'),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-00000000000c', 'specialist');
insert into public.conversations (id, brand_id, subject, customer_name, customer_message, opened_at) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '-', '-', '-', now()),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '-', '-', '-', now());
insert into public.replies (id, conversation_id, brand_id, author_id, body, sent_at) values
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000b', '-', now()),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-00000000000c', '-', now());
insert into public.criteria (id, brand_id, label, description, severity) values
  ('40000000-0000-4000-8000-000000000001', null, 'Shared', '-', 'critical'),
  ('40000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'Brand B only', '-', 'minor');

set local role authenticated;

select pg_temp.act_as('00000000-0000-4000-8000-00000000000a');
select is((select count(*) from public.brands), 1::bigint, 'lead sees only the brand they lead');
select is((select count(*) from public.replies), 1::bigint, 'lead sees replies in their brand only');
select lives_ok(
  $$insert into public.reviews (id, reply_id, reviewer_id, score) values ('50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000a', 2)$$,
  'lead reviews a reply in their brand');
select lives_ok(
  $$insert into public.review_flags (review_id, criterion_id) values ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001')$$,
  'lead flags with a shared criterion');
select throws_ok(
  $$insert into public.reviews (reply_id, reviewer_id, score) values ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-00000000000a', 5)$$,
  '42501', null, 'lead cannot review another brand''s reply');
select throws_ok(
  $$insert into public.review_flags (review_id, criterion_id) values ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002')$$,
  'P0001', null, 'lead cannot flag with another brand''s criterion');

select pg_temp.act_as('00000000-0000-4000-8000-00000000000b');
select is((select count(*) from public.replies), 1::bigint, 'specialist sees only their own replies');
select is((select count(*) from public.reviews), 1::bigint, 'specialist sees the review on their reply');
select is((select count(*) from public.replies where brand_id = '10000000-0000-4000-8000-000000000002'), 0::bigint,
  'specialist sees nothing from another brand');
update public.reviews set score = 5;
select is((select score from public.reviews), 2::smallint, 'specialist cannot change their score');
select lives_ok(
  $$insert into public.review_acknowledgements (review_id, profile_id) values ('50000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000b')$$,
  'specialist acknowledges their review');
select throws_ok(
  $$insert into public.reviews (reply_id, reviewer_id, score) values ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000b', 5)$$,
  '42501', null, 'specialist cannot write a review');

select pg_temp.act_as('00000000-0000-4000-8000-00000000000c');
select is((select count(*) from public.reviews), 0::bigint, 'specialist from another brand sees no reviews');

reset role;
set local role anon;
select throws_ok($$select count(*) from public.replies$$, '42501', null, 'anonymous visitors cannot read replies');

select * from finish();
rollback;
