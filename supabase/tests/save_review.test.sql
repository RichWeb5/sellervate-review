-- save_review runs as the caller, so it must obey the same rules as a direct insert.
begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

create function pg_temp.act_as(profile uuid)
returns void
language sql
as $$
  select set_config('request.jwt.claims', json_build_object('sub', profile, 'role', 'authenticated')::text, true);
$$;

set local role authenticated;

-- Marta leads Voltra; reply 10 is Dani's unreviewed Voltra reply from the seed.
select pg_temp.act_as('a1000000-0000-4000-8000-000000000001');
select lives_ok(
  $$select public.save_review('e1000000-0000-4000-8000-000000000010', 4::smallint, 'Good diagnosis', array['c1000000-0000-4000-8000-000000000004'::uuid, 'c1000000-0000-4000-8000-000000000005'::uuid])$$,
  'lead saves a review with two flags');
select lives_ok(
  $$select public.save_review('e1000000-0000-4000-8000-000000000010', 3::smallint, '  ', array['c1000000-0000-4000-8000-000000000005'::uuid])$$,
  'saving again updates the same review');
select results_eq(
  $$select r.score::int, r.note, count(f.*)::int from public.reviews r left join public.review_flags f on f.review_id = r.id
    where r.reply_id = 'e1000000-0000-4000-8000-000000000010' group by r.id$$,
  $$values (3, null::text, 1)$$,
  'score and flags are replaced, blank notes are stored as empty');

-- Nuria leads Hearth only.
select pg_temp.act_as('a1000000-0000-4000-8000-000000000002');
select throws_ok(
  $$select public.save_review('e1000000-0000-4000-8000-000000000011', 5::smallint, null, array[]::uuid[])$$,
  '42501', null, 'a lead cannot review a reply from a brand they do not lead');

select * from finish();
rollback;
