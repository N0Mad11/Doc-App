# AI Workflow Note

## Tools used
Claude (chat) for planning, scaffolding, debugging and deployment

## How I used it
- Planning: I summarized what was needed and what I wanted to prioritize in the build. As I have no prior experience in this type of project, I made Claude to write me a step-by-step walkthrough in developing the application
- Implementation: To save time, Claude wrote most of the code from my requirements. I reviewed each piece before using it: [e.g. read through the code, ran it, checked that it matched the requirement, asked for changes when it did not]. I chose the scope (what to cut: real-time collaboration, comments, version history).
- Debugging: After deploying to Vercel, the app showed "Missing Supabase configuration." Claude explained that Vite reads `VITE_` variables at build time, so they must exist when the build runs and a redeploy is needed after changing them. When I added `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, Vercel warned that `VITE_`-prefixed values must be removed for some unexplained reason. I ran out of time during this error and just proceeded with the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as a config variable instead of the `VITE_SUPABASE_ANON_KEY` being a secret variable.

## What I verified myself
- Two-user manual test of sharing (owner, editor, viewer)
- Unit tests for permissions and import logic
- Reviewed the RLS policies and confirmed no service-role key is used in the client; only the public anon key is exposed

## Where AI was wrong or needed correction
- The first set of RLS policies referenced each other, which risked an "infinite recursion" error in Postgres. Claude corrected this with security-definer helper functions, and I applied the fix to my database. Other than this, the development was kept simple so there weren't that much gaps or corrections that was need to make.
- Takeaway: AI output may look good and complete but it always isn't the case. I always treat the output of AIs as draft and always test it before relying on it.

## What I would do differently
I started building before setting up GitHub, Vercel, and Supabase. Account verification and linking the services took time away from the build, and that isn't including the time I took in debugging the deployment process. Next time I would create and verify all accounts and connect the tools before the timer starts, and keep a short log of AI prompts as I go so this note is easier to write.