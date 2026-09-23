-- Invented demo data. Dates are relative to the moment you run `pnpm db:reset`,
-- so "yesterday's replies" is always yesterday, whenever this repo gets cloned.

create function pg_temp.days_ago(days int, at_hour int default 10, at_minute int default 0)
returns timestamptz
language sql
as $$
  select date_trunc('day', now()) - make_interval(days => days) + make_interval(hours => at_hour, mins => at_minute);
$$;

-- People. Every account signs in with the password `review-demo`; the app's user switcher does this for you.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
  extensions.crypt('review-demo', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(),
  '', '', '', ''
from (values
  ('a1000000-0000-4000-8000-000000000001'::uuid, 'marta@sellervate.test'),
  ('a1000000-0000-4000-8000-000000000002'::uuid, 'nuria@sellervate.test'),
  ('a1000000-0000-4000-8000-000000000003'::uuid, 'dani@sellervate.test'),
  ('a1000000-0000-4000-8000-000000000004'::uuid, 'aisha@sellervate.test'),
  ('a1000000-0000-4000-8000-000000000005'::uuid, 'tomas@sellervate.test')
) as u (id, email);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users u
where u.email like '%@sellervate.test';

insert into public.profiles (id, full_name, email) values
  ('a1000000-0000-4000-8000-000000000001', 'Marta Ruiz', 'marta@sellervate.test'),
  ('a1000000-0000-4000-8000-000000000002', 'Nuria Campos', 'nuria@sellervate.test'),
  ('a1000000-0000-4000-8000-000000000003', 'Dani Ortega', 'dani@sellervate.test'),
  ('a1000000-0000-4000-8000-000000000004', 'Aisha Bello', 'aisha@sellervate.test'),
  ('a1000000-0000-4000-8000-000000000005', 'Tomás Vidal', 'tomas@sellervate.test');

-- Brands. Voltra and Boxwell want opposite things from the same specialist; that contrast is the point.

insert into public.brands (id, slug, name, accent_color, voice_summary, procedures) values
(
  'b1000000-0000-4000-8000-000000000001', 'voltra', 'Voltra', '#1f7a8c',
  'Electric scooters. Warm, patient and technical. Half the complaints are setup or usage issues, so a good reply diagnoses before it offers a return.',
  E'1. Open the order history before replying: model, purchase date, previous tickets.\n2. Diagnose first: ask for the error code and walk through the battery reset before offering a return.\n3. Returns: 30 days from delivery. Outside that, warranty repair (2 years).\n4. Never quote range beyond spec: S2 is 35 km, V4 Pro is 60 km, both in eco mode.\n5. Firmware updates only through the Voltra app, never by sideloading.'
),
(
  'b1000000-0000-4000-8000-000000000002', 'boxwell', 'Boxwell', '#9a6a36',
  'Packaging supplies for small businesses. Fast, exact, three lines. Customers are buyers on a deadline, not people looking for a chat.',
  E'1. Confirm SKU, quantity and dispatch date from the order. No greetings beyond one line.\n2. Pallet quantities: BX-200 mailer boxes 400 per pallet, BX-310 shipping boxes 250 per pallet.\n3. Dispatch cut-off is 14:00 for next-day delivery.\n4. First reply within 1 hour during business hours.\n5. Damaged goods: ask for one photo, then credit or resend the same day.'
),
(
  'b1000000-0000-4000-8000-000000000003', 'hearth', 'Hearth', '#7b4b8c',
  'Specialty coffee subscriptions and grinders. Friendly and knowledgeable, like a good barista who remembers your order.',
  E'1. Check the subscription and order history before answering anything about deliveries.\n2. Grinders carry a 2-year warranty; burr replacements are free inside it.\n3. Subscriptions can be paused for up to 3 months from the account page; we can do it for them.\n4. Offer a brew tip only when it answers the question.'
);

insert into public.brand_memberships (brand_id, profile_id, role) values
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'lead'),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'lead'),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000002', 'lead'),
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000003', 'specialist'),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000003', 'specialist'),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000004', 'specialist'),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000004', 'specialist'),
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000005', 'specialist'),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000005', 'specialist');

-- Rubric. Shared criteria apply everywhere; each brand adds what only it cares about.

insert into public.criteria (id, brand_id, label, description, severity, position) values
  ('c1000000-0000-4000-8000-000000000001', null, 'Wrong information', 'Told the customer something untrue about their product, order or policy.', 'critical', 1),
  ('c1000000-0000-4000-8000-000000000002', null, 'Skipped the order history', 'Answered without checking what the customer actually bought or already asked.', 'critical', 2),
  ('c1000000-0000-4000-8000-000000000003', null, 'Answered a different question', 'The reply is fine on its own but does not address what the customer asked.', 'major', 3),
  ('c1000000-0000-4000-8000-000000000004', null, 'Customer will write again', 'Technically correct, but leaves an open question that brings them back.', 'major', 4),
  ('c1000000-0000-4000-8000-000000000005', null, 'Wrong tone for the brand', 'The voice does not match how this brand talks to its customers.', 'minor', 5),
  ('c1000000-0000-4000-8000-000000000006', null, 'Too slow', 'First reply took longer than the brand expects.', 'minor', 6),
  ('c1000000-0000-4000-8000-000000000007', 'b1000000-0000-4000-8000-000000000001', 'Offered a return before diagnosing', 'Went to a return or refund without trying the reset or asking for the error code.', 'major', 10),
  ('c1000000-0000-4000-8000-000000000008', 'b1000000-0000-4000-8000-000000000002', 'Not concise', 'Longer than three lines, or padded with pleasantries.', 'major', 10),
  ('c1000000-0000-4000-8000-000000000009', 'b1000000-0000-4000-8000-000000000003', 'Missed the subscription context', 'Ignored the customer''s active subscription when it changes the answer.', 'major', 10);

-- Conversations and the reply that went out. One reply per conversation keeps the demo readable.

create temp table seed_people (key text primary key, id uuid not null);
insert into seed_people values
  ('marta', 'a1000000-0000-4000-8000-000000000001'),
  ('nuria', 'a1000000-0000-4000-8000-000000000002'),
  ('dani',  'a1000000-0000-4000-8000-000000000003'),
  ('aisha', 'a1000000-0000-4000-8000-000000000004'),
  ('tomas', 'a1000000-0000-4000-8000-000000000005');

create temp table seed_replies (
  n int primary key,
  brand text not null,
  author text not null,
  days_ago int not null,
  sent_hour int not null,
  response_minutes int not null,
  customer text not null,
  subject text not null,
  message text not null,
  body text not null
);

insert into seed_replies values
-- Voltra: diagnose first, know the model, never oversell range.
(1, 'voltra', 'tomas', 29, 9, 40, 'Liam Carter', 'Scooter won''t turn on',
$$Hi, my S2 won't turn on since this morning. Charged it overnight, the light on the charger goes green but nothing happens when I press the power button. I need it for work. Can I get a replacement?$$,
$$Hi Liam, sorry to hear that! I've gone ahead and started a return for you, you'll get an email with the label shortly. Once we receive the scooter we'll send out a replacement. Thanks for your patience!$$),
(2, 'voltra', 'dani', 28, 11, 25, 'Sofia Marín', 'Error E07 on the display',
$$My V4 Pro shows E07 and won't accelerate. Lights and display work fine. What does this mean?$$,
$$Hi Sofia,

E07 means the controller isn't getting a signal from the throttle. It usually happens when the cable connector works loose on a bumpy ride.

Could you try this?
1. Turn the scooter off and fold it.
2. Open the small cover under the handlebar stem and push the throttle connector all the way in.
3. Turn it back on and hold the brake for 3 seconds before accelerating.

If E07 is still there, reply with a photo of the connector and I'll book a repair under your warranty (you're covered until March 2027).

Best,
Dani$$),
(3, 'voltra', 'tomas', 26, 16, 180, 'Oliver Grant', 'Range much lower than advertised',
$$Bought the S2 last month and I'm getting maybe 25 km a charge. Your site says more. Is mine faulty?$$,
$$Hi Oliver, the S2 should do around 50 km on a full charge, so 25 km does sound low. It might be a faulty battery. I can arrange a replacement battery for you, just confirm your address. Cheers, Tomás$$),
(4, 'voltra', 'dani', 21, 10, 30, 'Priya Nair', 'Rear brake squeaking',
$$Rear brake squeaks every time I stop. Is that normal? The scooter is 3 weeks old.$$,
$$Hi Priya,

A squeak in the first few weeks is normal while the disc and pads bed in. It usually goes away after about 50 km.

If it's still there after that, a quarter turn of the adjustment screw on the caliper sorts it. There's a 2-minute video in the Voltra app under Maintenance > Brakes.

Dani$$),
(5, 'voltra', 'tomas', 19, 14, 95, 'Emma Walsh', 'Where is my replacement charger?',
$$You promised me a replacement charger two weeks ago and I still have nothing. Ticket #4471.$$,
$$Hi Emma, your charger has been shipped and should arrive in the next couple of days. Thanks for waiting! Tomás$$),
(6, 'voltra', 'tomas', 14, 9, 35, 'Marco Ferri', 'Flat front tyre',
$$Front tyre went flat, I think I rode over glass. Do you sell replacements?$$,
$$Hi Marco,

Sorry about the tyre. I can see you have the S2 you bought in May, so the one you need is the 8.5-inch inner tube. It's in stock at €14.90, link below.

If you'd rather not change it yourself, any bike shop can do it in ten minutes. It's a standard Schrader valve.

Tomás$$),
(7, 'voltra', 'dani', 12, 12, 20, 'Hannah Scholz', 'Firmware update stopped at 60%',
$$The app said there was an update, I started it and it stopped at 60%. Now the scooter shows a spanner icon.$$,
$$Hi Hannah,

Don't worry, the spanner icon means the scooter kept its previous firmware and is safe to ride.

To retry: keep your phone within a metre of the scooter, turn off battery saving on the phone, and start the update again from the Voltra app. It takes about 6 minutes. Please don't use an update file from outside the app, that's what damages controllers.

If it stops at the same point again, tell me and I'll push the update from our side.

Dani$$),
(8, 'voltra', 'tomas', 8, 11, 40, 'Jonas Berg', 'Beeping when folded',
$$It beeps three times whenever I fold it. Really annoying. Can I turn that off?$$,
$$Hi Jonas,

Those three beeps remind you the scooter is still on while folded. If you switch it off before folding, the beeping stops.

The reminder itself can't be disabled, but you can turn the volume down in the Voltra app under Settings > Sounds.

Tomás$$),
(9, 'voltra', 'dani', 7, 15, 45, 'Clara Dupont', 'Folding latch is loose',
$$The folding latch has a lot of play now and the stem wobbles when I ride. Is this covered by the warranty?$$,
$$Hi Clara,

Great question! Our batteries are covered for 2 years and we recommend charging to 80% to extend their life. You can check battery health in the Voltra app.

Dani$$),
(10, 'voltra', 'dani', 1, 9, 20, 'Ben Okafor', 'Charger light stays red',
$$The charger light stays red all night and the battery is stuck at 40%. The scooter is two months old.$$,
$$Hi Ben,

A red light that never turns green usually means the charger isn't making a proper connection. Could you check the charging port on the scooter for dirt or moisture, and try a different wall socket?

If it's still red after that, send me a photo of the label on the charger and I'll ship a replacement. You're well within warranty.

Dani$$),
(11, 'voltra', 'tomas', 1, 10, 50, 'Laura Kim', 'Return: too heavy for my daughter',
$$I bought the S2 for my daughter but it's too heavy for her to carry up the stairs. It was delivered 10 days ago. Can I return it?$$,
$$Hi Laura,

Of course. You're inside the 30-day window, so I've started the return and you'll get a prepaid label by email today. Please fold it and use the original box if you still have it.

The refund goes back to your card within 5 days of the scooter reaching us.

Tomás$$),
(12, 'voltra', 'tomas', 1, 13, 110, 'Marcus Reid', 'Cuts out on hills, want a refund',
$$My V4 Pro cuts out when I go up steep hills. It turns back on after a minute. Is it broken? I want a refund.$$,
$$Hi Marcus, sorry about that. I've issued a full refund, it should show in 5 to 7 days. You can keep the scooter. Tomás$$),
(13, 'voltra', 'dani', 1, 16, 35, 'Noah Silva', 'Riding in the rain',
$$Is the S2 waterproof? It's been raining every day here.$$,
$$Hi Noah,

The S2 is rated IPX4, so splashes and light rain are fine, but it isn't waterproof. Avoid puddles deeper than a couple of centimetres and don't leave it outside in the rain.

After a wet ride, wipe it down and let it dry before charging.

Dani$$),

-- Boxwell: SKU, quantity, date. Three lines.
(14, 'boxwell', 'aisha', 27, 9, 12, 'Tom Hughes', 'Status of BX-88213',
$$Hi, where is order BX-88213? We need it for Thursday.$$,
$$Hi Tom, BX-88213 (2 pallets of BX-200) left our warehouse today. Delivery tomorrow before 12:00, DPD tracking 15502247.
Aisha$$),
(15, 'boxwell', 'dani', 25, 11, 30, 'Rachel Moore', 'Quote for mailer boxes',
$$Can I get a price for 1,200 BX-200 mailer boxes?$$,
$$Hi there, and thanks so much for reaching out to Boxwell! It's great to hear from you. I'd be really happy to help you with a quote for our BX-200 mailer boxes, they're one of our most popular products and customers love how sturdy they are. For 1,200 units the price would be €0.42 per box, so €504 in total. They come 400 to a pallet, so that would be three pallets. Please let me know if there's anything else at all I can help you with, and have a wonderful day! Best wishes, Dani$$),
(16, 'boxwell', 'aisha', 20, 14, 25, 'Ana Costa', 'BX-200 per pallet',
$$How many BX-200 per pallet? We need 2,000.$$,
$$Hi Ana, BX-200 ships 500 per pallet, so 4 pallets for 2,000. Order before 14:00 for next-day delivery.
Aisha$$),
(17, 'boxwell', 'dani', 15, 10, 18, 'Kevin Doyle', 'Crushed delivery, BX-90117',
$$Half a pallet arrived crushed. Order BX-90117.$$,
$$Hi Kevin, sorry about that. Send me one photo of the damage and I'll resend the crushed boxes today, or credit them if you prefer.
Dani$$),
(18, 'boxwell', 'aisha', 13, 8, 540, 'Sara Lindqvist', 'Invoice copy for BX-89002',
$$Please send a copy of the invoice for BX-89002, our accountant needs it today.$$,
$$Hi Sara, the invoice for BX-89002 is attached.
Aisha$$),
(19, 'boxwell', 'dani', 6, 12, 22, 'Leo Martins', 'New delivery address',
$$Can you deliver BX-91544 to our new unit instead? 14 Harbour Road.$$,
$$Hi Leo, done. BX-91544 now goes to 14 Harbour Road, delivery Friday as planned.
Dani$$),
(20, 'boxwell', 'aisha', 1, 9, 15, 'Jamal Wright', 'Is BX-310 back in stock?',
$$Is BX-310 back in stock? Need 500.$$,
$$Hi Jamal, BX-310 is in stock. 500 is 2 pallets (250 each), next-day if ordered before 14:00.
Aisha$$),
(21, 'boxwell', 'dani', 1, 11, 28, 'Mia Novak', 'Wrong size delivered',
$$Ordered BX-310, got BX-200. Order BX-92210.$$,
$$Hi Mia, you're right, we picked the wrong SKU. BX-310 goes out today for delivery tomorrow, and the driver will collect the BX-200 at the same time.
Dani$$),
(22, 'boxwell', 'aisha', 1, 14, 40, 'Oscar Hale', 'Discount above 10 pallets?',
$$Do you do a discount above 10 pallets?$$,
$$Hi Oscar, thanks so much for getting in touch! We really appreciate loyal customers like you. We do sometimes offer discounts on larger orders, it depends on a few things. Let me check with the team and get back to you as soon as I can. Have a lovely day!
Aisha$$),
(23, 'boxwell', 'dani', 1, 16, 12, 'Ella Brooks', 'Courier time for returns',
$$What time does the courier come for the returns tomorrow?$$,
$$Hi Ella, the courier collects between 09:00 and 13:00 tomorrow. Please put the return sheet on top of the boxes.
Dani$$),

-- Hearth: knows your subscription, a tip only when it helps.
(24, 'hearth', 'aisha', 27, 10, 35, 'Grace Liu', 'Pause my subscription',
$$We're travelling for six weeks. Can I pause my coffee subscription?$$,
$$Hi Grace,

Of course! I've paused your Ethiopia Guji subscription from the next delivery, and it will restart on its own in six weeks. You can change the date any time from your account page.

Have a great trip,
Aisha$$),
(25, 'hearth', 'tomas', 23, 15, 60, 'Daniel Park', 'Grinder burrs worn out',
$$My Hearth Mill grinder is 18 months old and the grind is uneven now. Are the burrs covered?$$,
$$Hi Daniel, unfortunately the warranty on the Hearth Mill is 1 year, so the burrs aren't covered. You can buy a replacement set on our site for €39. Tomás$$),
(26, 'hearth', 'aisha', 16, 9, 20, 'Ruth Adler', 'New beans taste bitter',
$$The new Colombia beans taste really bitter in my French press.$$,
$$Hi Ruth,

The Colombia Huila is roasted a touch darker than your usual Guji, so it extracts faster. Try a coarser grind and three and a half minutes instead of four. That usually takes the bitterness out.

If you still don't enjoy it, I can swap your next bag back to the Guji.

Aisha$$),
(27, 'hearth', 'tomas', 9, 11, 30, 'Pete Evans', 'October bag never arrived',
$$My October bag didn't arrive.$$,
$$Hi Pete,

I checked your order: the courier marked the October bag as delivered to your safe place on the 4th. If it isn't there, I'll send a new one today, no problem.

Tomás$$),
(28, 'hearth', 'aisha', 1, 10, 25, 'Lucy Shaw', 'Switch to ground coffee',
$$Can I switch my subscription from whole bean to ground for espresso?$$,
$$Hi Lucy,

Done. Your next bag of Guji ships on Thursday, ground for espresso.

Aisha$$),
(29, 'hearth', 'tomas', 1, 12, 45, 'Sam Patel', 'Gift subscription',
$$Can I buy a 3-month subscription as a gift?$$,
$$Hi Sam, yes. Our grinders come with a 2-year warranty and free burr replacement. Tomás$$),
(30, 'hearth', 'aisha', 1, 15, 30, 'Megan Ross', 'Cancel my subscription',
$$I'd like to cancel, money is tight at the moment.$$,
$$Hi Megan,

I understand. Before you cancel: you can pause for up to 3 months at no cost, and it picks up again after that. If you'd still rather cancel, just reply and I'll do it straight away.

Aisha$$);

insert into public.conversations (id, brand_id, source, external_id, subject, customer_name, customer_message, opened_at)
select
  ('d1000000-0000-4000-8000-' || lpad(s.n::text, 12, '0'))::uuid,
  b.id, 'manual', null, s.subject, s.customer, s.message,
  pg_temp.days_ago(s.days_ago, s.sent_hour) - make_interval(mins => s.response_minutes)
from seed_replies s
join public.brands b on b.slug = s.brand;

insert into public.replies (id, conversation_id, brand_id, author_id, body, sent_at, response_minutes)
select
  ('e1000000-0000-4000-8000-' || lpad(s.n::text, 12, '0'))::uuid,
  ('d1000000-0000-4000-8000-' || lpad(s.n::text, 12, '0'))::uuid,
  b.id, p.id, s.body, pg_temp.days_ago(s.days_ago, s.sent_hour), s.response_minutes
from seed_replies s
join public.brands b on b.slug = s.brand
join seed_people p on p.key = s.author;

-- Reviews on everything older than yesterday, so the queue has work and the trend has history.

create temp table seed_criteria (key text primary key, id uuid not null);
insert into seed_criteria values
  ('wrong_info',          'c1000000-0000-4000-8000-000000000001'),
  ('skipped_history',     'c1000000-0000-4000-8000-000000000002'),
  ('different_question',  'c1000000-0000-4000-8000-000000000003'),
  ('write_again',         'c1000000-0000-4000-8000-000000000004'),
  ('wrong_tone',          'c1000000-0000-4000-8000-000000000005'),
  ('too_slow',            'c1000000-0000-4000-8000-000000000006'),
  ('voltra_return',       'c1000000-0000-4000-8000-000000000007'),
  ('boxwell_concise',     'c1000000-0000-4000-8000-000000000008'),
  ('hearth_subscription', 'c1000000-0000-4000-8000-000000000009');

create temp table seed_reviews (
  n int primary key,
  reviewer text not null,
  score smallint not null,
  flags text[] not null,
  acknowledged boolean not null,
  note text
);

insert into seed_reviews values
(1, 'marta', 2, '{skipped_history,voltra_return}', true,
 $$Order history shows this S2 was delivered 14 months ago, so it's outside the 30-day window and should have been a warranty case. We also never asked him to try the battery reset, which fixes most of these.$$),
(2, 'marta', 5, '{}', true,
 $$This is the standard. Diagnoses, gives steps the customer can actually follow, and already knows the warranty date.$$),
(3, 'marta', 1, '{wrong_info,voltra_return}', true,
 $$The S2 is rated 35 km in eco mode, not 50. We told a customer his scooter is faulty when it probably isn't, and promised him a battery. This is how we lose the account.$$),
(4, 'marta', 4, '{}', true,
 $$Right answer and friendly. Could have said what to do if it gets worse, but fine.$$),
(5, 'marta', 2, '{skipped_history,wrong_info}', true,
 $$The order history shows the replacement was never created. Second time this month he answered without opening the order. Talked it through with him on Monday.$$),
(6, 'marta', 4, '{}', true,
 $$Much better. Checked the order, knew the model, gave him two options. Exactly what we talked about.$$),
(7, 'marta', 5, '{}', true,
 $$Calm, exact, and warned her off sideloading. Keeping this one for onboarding.$$),
(8, 'marta', 4, '{}', false,
 $$Clear and correct.$$),
(9, 'marta', 3, '{different_question,write_again}', false,
 $$She asked about the folding latch and got an answer about batteries. Looks like a pasted macro. A wobbly stem is a safety issue and she will be back tomorrow.$$),
(14, 'marta', 5, '{}', true,
 $$Exactly the Boxwell reply. Order, date, tracking, done.$$),
(15, 'marta', 3, '{boxwell_concise,wrong_tone}', true,
 $$Numbers are right, but this is a Voltra reply written for a Boxwell buyer. Price, pallets, dispatch date. Three lines.$$),
(16, 'marta', 2, '{wrong_info}', true,
 $$It's 400 per pallet, so she will order 4 pallets and end up 400 boxes short. Being exact is the whole job for this brand.$$),
(17, 'marta', 4, '{}', true,
 $$Short and follows the damaged goods procedure.$$),
(18, 'marta', 3, '{too_slow}', false,
 $$The reply itself is perfect, but it went out nine hours later and they said they needed it today.$$),
(19, 'marta', 5, '{}', false,
 $$Perfect. Three weeks ago this would have been ten lines.$$),
(24, 'nuria', 5, '{}', true,
 $$Did it for her and told her when it restarts. Lovely.$$),
(25, 'nuria', 2, '{wrong_info,skipped_history}', true,
 $$The Hearth Mill has a 2-year warranty and burrs are free inside it. We were about to charge a customer for something we owe him.$$),
(26, 'nuria', 5, '{}', true,
 $$Knew her usual coffee from the subscription, and the tip actually answers the question.$$),
(27, 'nuria', 4, '{}', false,
 $$Checked the order first this time. Good.$$);

insert into public.reviews (id, reply_id, reviewer_id, score, note, created_at, updated_at)
select
  ('f1000000-0000-4000-8000-' || lpad(r.n::text, 12, '0'))::uuid,
  ('e1000000-0000-4000-8000-' || lpad(r.n::text, 12, '0'))::uuid,
  p.id, r.score, r.note,
  pg_temp.days_ago(s.days_ago - 1, 9),
  pg_temp.days_ago(s.days_ago - 1, 9)
from seed_reviews r
join seed_replies s on s.n = r.n
join seed_people p on p.key = r.reviewer;

insert into public.review_flags (review_id, criterion_id)
select ('f1000000-0000-4000-8000-' || lpad(r.n::text, 12, '0'))::uuid, c.id
from seed_reviews r
cross join lateral unnest(r.flags) as flag (key)
join seed_criteria c on c.key = flag.key;

insert into public.review_acknowledgements (review_id, profile_id, acknowledged_at)
select
  ('f1000000-0000-4000-8000-' || lpad(r.n::text, 12, '0'))::uuid,
  p.id,
  pg_temp.days_ago(s.days_ago - 1, 17)
from seed_reviews r
join seed_replies s on s.n = r.n
join seed_people p on p.key = s.author
where r.acknowledged;
