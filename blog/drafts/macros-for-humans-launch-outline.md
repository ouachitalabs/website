# Macros for Humans launch package

These are working outlines for two linked posts. The announcement should be published first and link to the technical deep dive. The technical post should link back to the announcement and to the original 2025 architecture post.

## Post 1: Introducing Macros for Humans

### Job of the post

Explain the problem in ordinary language, show the range from precise logging to useful estimates, establish why SMS is the product rather than a novelty, and invite readers to try it. Technical details should be limited to a single link to the deep dive.

### Reader

Someone who has tried to count calories or macros, found the process tedious, and either quit or logs inconsistently. They may be highly precise with weighed food, or they may only have a photo and a rough description.

### Outline

1. Open with the first subscriber who is not family. Keep the milestone in perspective, but explain why it made the product feel real.
2. Describe the logging ritual: search, compare duplicate database results, convert units, enter a quantity, save, and repeat for every ingredient.
3. State the actual problem: people do not need more nutrition data; they need help turning the information they already have into a usable log.
4. Introduce the product in one sentence: text descriptions, measurements, labels, or photos; receive a concise log and running totals.
5. Show the accuracy ladder:
   - Weighed ingredients, brands, and labels for precise logs.
   - Recipes and memory for repeated meals and leftovers.
   - Photos and rough descriptions for transparent estimates when life is messy.
   - Plain-language corrections instead of edit screens.
6. Explain why estimates matter: an unmeasured coffee or restaurant meal should not invalidate the entire day. Consistency is more useful than performative precision.
7. Explain why SMS matters: no install, dashboard, new habit, or proprietary chat surface. The message thread is the interface and history.
8. Be explicit about whom it is for: anyone frustrated by calorie or macro tracking, not only bodybuilders or people who weigh every gram.
9. Give price and trial details: seven days free, then $5/month or $50/year.
10. Close with two links: start a trial, or read the technical deep dive.

## Post 2: The fourth version of Macros for Humans has no app

### Job of the post

Tell the honest engineering story behind the product. The durable-object architecture is interesting, but the real lesson is that the successful architecture followed the interface decision. This should read like a Hacker News build post, not product documentation or an introduction to agents.

### Reader

John twelve months ago: an experienced Python/web/data engineer who can build the obvious full-stack version, is curious about agents and Cloudflare, but has not yet learned that the product's interaction model matters more than the choice of mobile framework.

### Outline

1. Open with the first unrelated paying subscriber and the irony that the version someone bought is the first version with no downloadable app.
2. Walk through the real revision history:
   - July 2025: FastAPI, PostgreSQL, React Native, and Expo for an Android-only MVP.
   - September: convert the mobile client to Flutter.
   - November: rewrite it in React Native/Expo and publish the Android version.
   - January 2026: move toward a React web app backed by FastAPI, Supabase/Postgres, pgvector, BAML, and a large RAG specification.
   - April: start again around SMS, Cloudflare Workers, and Durable Objects.
3. Revisit the old architecture post. The extraction/search/re-ranking pipeline was clever and worked, but still ended in a confirmation UI. The system optimized the middle of a workflow whose beginning and end were still too expensive.
4. Explain the interface decision and its cost. SMS removes installation, navigation, and most data-entry UI, but gives up charts, rich controls, streaming, and easy structured editing.
5. Introduce Durable Objects only when the SMS requirements demand them: identity, per-user state, ordered events, retries, asynchronous processing, and memory.
6. Follow an inbound message:
   - Verify Twilio signature and resolve the phone number.
   - Check enrollment/subscription.
   - Copy MMS media to an isolated R2 prefix and delete the Twilio copy.
   - Route to the Durable Object named for that user.
   - Deduplicate by MessageSid, enqueue in SQLite, arm an alarm, and return immediately.
   - Drain the inbox serially, run the agent, persist the audit trail, and send the final SMS.
7. Explain the per-user state capsule: SQLite for authoritative nutrition state and R2 for photos plus memory.md.
8. Explain the agent/tool tradeoff: model for interpretation, USDA and web lookup for evidence, SQLite for durable facts and arithmetic, narrow file tools for durable preferences. Mention the consciously broad SQL tool and how a per-user database constrains its blast radius.
9. Explain context management: one local-day session, compact user/assistant replay, omitted historical tool results, SQLite as source of truth, explicit recent-message lookup, durable memory outside the transcript.
10. Name the Durable Object tradeoffs: easy serialization and isolation versus Cloudflare coupling, awkward cross-user queries, per-object throughput limits, and migrations across many independently waking databases.
11. Name the SMS tradeoffs: webhook timeouts, retries, ordering, media handling, limited presentation, carrier/compliance work, and the lack of end-to-end encryption.
12. End with what John from twelve months ago should hear: prototype the interaction before the platform, charge sooner, let deterministic systems own facts, and do not build a dashboard until users demand one.
13. Close with the milestone and links to the announcement and trial.

## Revision checklist

- Confirm whether to say the Android version was publicly listed or simply available through Google Play.
- Decide whether the first subscriber anecdote should include the exact weekend/date.
- Add current product screenshots only if they clarify the SMS experience; do not reuse old app UI in the announcement.
- Re-read both posts aloud for phrases that sound more polished than John's normal writing.
- Verify price and trial copy immediately before merge.
- Replace the first-draft HTML comments only after John has made the posts his own.
