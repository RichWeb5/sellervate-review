-- Authorisation lives here. The app talks to Postgres as the signed-in user, so every rule below
-- holds whether a request comes from our pages or straight at the API with a stolen token.

-- Helpers sit in a schema PostgREST does not expose, so they cannot be called as RPCs.
-- security definer lets them read memberships without recursing through RLS on that table.

grant usage on schema private to authenticated;

create function private.is_brand_member(target_brand uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.brand_memberships m
    where m.brand_id = target_brand and m.profile_id = (select auth.uid())
  );
$$;

create function private.is_brand_lead(target_brand uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.brand_memberships m
    where m.brand_id = target_brand
      and m.profile_id = (select auth.uid())
      and m.role = 'lead'
  );
$$;

-- A lead sees every reply in the brands they lead; a specialist sees only their own.
create function private.can_read_reply(target_reply uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.replies r
    where r.id = target_reply
      and (r.author_id = (select auth.uid()) or private.is_brand_lead(r.brand_id))
  );
$$;

create function private.leads_reply_brand(target_reply uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.replies r
    where r.id = target_reply and private.is_brand_lead(r.brand_id)
  );
$$;

create function private.shares_a_brand_with(target_profile uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.brand_memberships mine
    join public.brand_memberships theirs on theirs.brand_id = mine.brand_id
    where mine.profile_id = (select auth.uid()) and theirs.profile_id = target_profile
  );
$$;

grant execute on all functions in schema private to authenticated;

-- Nobody reaches these tables without signing in.
revoke all on all tables in schema public from anon;

alter table public.brands enable row level security;
alter table public.profiles enable row level security;
alter table public.brand_memberships enable row level security;
alter table public.conversations enable row level security;
alter table public.replies enable row level security;
alter table public.criteria enable row level security;
alter table public.reviews enable row level security;
alter table public.review_flags enable row level security;
alter table public.review_acknowledgements enable row level security;

create policy "members read their brands"
on public.brands for select to authenticated
using (private.is_brand_member(id));

create policy "people read colleagues from shared brands"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or private.shares_a_brand_with(id));

create policy "people read their memberships and leads read their brand's"
on public.brand_memberships for select to authenticated
using (profile_id = (select auth.uid()) or private.is_brand_lead(brand_id));

create policy "leads read conversations in their brands, specialists the ones they answered"
on public.conversations for select to authenticated
using (
  private.is_brand_lead(brand_id)
  or exists (
    select 1 from public.replies r
    where r.conversation_id = conversations.id and r.author_id = (select auth.uid())
  )
);

create policy "leads read their brand's replies, specialists their own"
on public.replies for select to authenticated
using (author_id = (select auth.uid()) or private.is_brand_lead(brand_id));

create policy "members read shared and brand criteria"
on public.criteria for select to authenticated
using (brand_id is null or private.is_brand_member(brand_id));

create policy "readers of a reply read its reviews"
on public.reviews for select to authenticated
using (private.can_read_reply(reply_id));

create policy "leads review replies in their brands"
on public.reviews for insert to authenticated
with check (reviewer_id = (select auth.uid()) and private.leads_reply_brand(reply_id));

create policy "reviewers edit their own reviews"
on public.reviews for update to authenticated
using (reviewer_id = (select auth.uid()))
with check (reviewer_id = (select auth.uid()) and private.leads_reply_brand(reply_id));

create policy "reviewers delete their own reviews"
on public.reviews for delete to authenticated
using (reviewer_id = (select auth.uid()));

-- Score and note are the only editable columns; moving a review to another reply is not an edit.
revoke update on public.reviews from authenticated;
grant update (score, note) on public.reviews to authenticated;

create policy "readers of a review read its flags"
on public.review_flags for select to authenticated
using (
  exists (select 1 from public.reviews rv where rv.id = review_id and private.can_read_reply(rv.reply_id))
);

create policy "reviewers manage flags on their reviews"
on public.review_flags for all to authenticated
using (exists (select 1 from public.reviews rv where rv.id = review_id and rv.reviewer_id = (select auth.uid())))
with check (exists (select 1 from public.reviews rv where rv.id = review_id and rv.reviewer_id = (select auth.uid())));

create policy "readers of a review see whether it was acknowledged"
on public.review_acknowledgements for select to authenticated
using (
  exists (select 1 from public.reviews rv where rv.id = review_id and private.can_read_reply(rv.reply_id))
);

create policy "authors acknowledge reviews of their own replies"
on public.review_acknowledgements for insert to authenticated
with check (
  profile_id = (select auth.uid())
  and exists (
    select 1
    from public.reviews rv
    join public.replies r on r.id = rv.reply_id
    where rv.id = review_id and r.author_id = (select auth.uid())
  )
);
