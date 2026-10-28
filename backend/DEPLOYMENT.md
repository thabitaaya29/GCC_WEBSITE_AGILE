# Deployed GCC homepage backend

- Supabase project: gcc-homepage
- Project ref: svyulvjezdzgooywntyl
- Region: Singapore (ap-southeast-1)
- Quoted project cost: $0/month (Free)
- Dashboard: https://supabase.com/dashboard/project/svyulvjezdzgooywntyl
- REST base: https://svyulvjezdzgooywntyl.supabase.co/rest/v1
- Read: /homepage_content?id=eq.home&select=id,content,updated_at
- Frontend environment values: frontend.env.example (publishable only).

Initial schema migration gcc_homepage_content_v1 applied successfully. Initial content is the explicitly labeled example from homepage.example.json; no final PO copy is claimed. Hosted smoke verification passed: public read succeeds; POST/PATCH/DELETE probes with the publishable key are denied. SQL security and performance advisors returned no findings. The local suite has32 passing tests and tsc --noEmit succeeds.

Frontend integration is still owned by the frontend teammate: fetch the API, show example notice, render loading/error/retry states, keep the journey anchor and route contract. No frontend source files were changed by this backend delivery.

Do not expose SUPABASE_SECRET_KEY in frontend, Git or screenshots. To update content later, use the trusted command documented in README.md. No secret key is stored in this repository or supplied as part of the frontend handoff. Hosted maintenance-command writes require the maintainer's own private secret key; HTTP transport is locally tested, while the first hosted example was inserted through the authorized Supabase connection.
