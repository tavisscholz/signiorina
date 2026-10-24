# Rolling back Everyday · Events · Weddings (v2)

Nothing here touches stored orders, inquiries or payments. There is no database migration to
undo and no blanket data rollback is ever needed.

## 1. Turn the flag off (minutes, no code change)

1. Vercel → Project → Settings → Environment Variables: delete
   `NEXT_PUBLIC_FLAG_THREE_JOURNEY_ARCHITECTURE_V2` for the affected environment (or set it to
   anything other than `true`).
2. Deployments → the latest deployment for that environment → **Redeploy** (the flag is read
   at build time).
3. Verify:
   - `/` shows the original homepage; the header reads Weddings · Gatherings · Corporate ·
     Cabin Delivery · About · FAQ with the Order Online / Plan Your Gathering buttons.
   - `/everyday` → `/order`, `/events` → `/gatherings`, `/events/plan?…` → `/inquire?…` (estimate
     attached), `/weddings/build?…` → `/weddings?…` (estimator restored). All 307.
   - `/order`, `/gatherings`, `/weddings` return 200 with their estimators.
   - `/sitemap.xml` lists the original routes.
4. Regression checks: one checkout to confirmation (test mode or a real card + refund), one
   `/inquire` submission, one wedding estimate → "Start planning with this estimate".

Links created while the flag was on keep working after this step (they redirect to the
closest original page), and submissions made through the planners stay in the inquiry store.

## 2. Remove the code (only if the flag-off build itself must go)

The work lives on `feature/signiorina-three-journeys-v2`. If it was never merged, there is
nothing to remove. If it was merged into the production branch:

```bash
git checkout claude/confident-keller-fnabw9
git log --oneline --first-parent    # find the merge commit
git revert -m 1 <merge-commit>      # a new commit; history is not rewritten
git push origin claude/confident-keller-fnabw9
```

The pre-change state is commit `6424d4bae4db0826bfe946b4812d9aa91020e174` (local tag
`pre-three-journeys-v2`). After reverting, check the same items as in step 1.

## 3. Content

There is no CMS. Everything the feature added lives in code and config
(`src/config/journeys.ts`, `flags.ts`, the `eventPackages` / `weddingPresets` /
`eventOccasions` / `weddingMoments` blocks in `src/config/events.ts`), so reverting the code
restores the prior content.

## 4. Records

Keep everything in the inquiry and order stores. Planner submissions carry an extra
`planner` field and may have no `message`; both are optional in the inquiry type, so older
code reads them without error.

## Side effects outside the code

- Vercel environment variables added for previews (remove them when done reviewing).
- The pushed branch `feature/signiorina-three-journeys-v2` (delete it on GitHub when no longer
  needed).
- Search engines may have crawled `/everyday`, `/events` or `/weddings/build` if the flag was
  on in production; with the flag off those URLs redirect, so no further action is needed.
