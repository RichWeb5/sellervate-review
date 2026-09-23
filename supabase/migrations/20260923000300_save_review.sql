-- Direct key so the API can embed a reply's brand; the composite key still guarantees it matches the conversation.
alter table public.replies
  add constraint replies_brand_id_fkey foreign key (brand_id) references public.brands (id) on delete restrict;

-- Saves a review and its flags in one transaction, so a failure never leaves a score without its reasons.
-- security invoker: it runs as the signed-in lead, so every RLS rule on reviews and flags still applies.
create function public.save_review(
  target_reply uuid,
  new_score smallint,
  new_note text,
  flagged_criteria uuid[]
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_review uuid;
begin
  insert into public.reviews (reply_id, reviewer_id, score, note)
  values (target_reply, (select auth.uid()), new_score, nullif(trim(new_note), ''))
  on conflict (reply_id, reviewer_id)
  do update set score = excluded.score, note = excluded.note
  returning id into saved_review;

  delete from public.review_flags
  where review_id = saved_review and not (criterion_id = any (flagged_criteria));

  insert into public.review_flags (review_id, criterion_id)
  select saved_review, criterion
  from unnest(flagged_criteria) as criterion
  on conflict do nothing;

  return saved_review;
end;
$$;

revoke execute on function public.save_review from public, anon;
grant execute on function public.save_review to authenticated;
