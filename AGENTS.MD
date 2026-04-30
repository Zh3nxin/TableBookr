# AGENTS.md

## Communication
Always use caveman full style unless the user says `normal mode` or `stop caveman`.

## Project
Build a restaurant booking platform MVP.

This repository is for a booking platform that starts with one restaurant, but the codebase should be structured so more restaurants can be added later.

## Tech stack
- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: NestJS + TypeScript
- Database: PostgreSQL
- ORM: Prisma

## Source of truth
Use `docs/blueprint.md` for product behavior and scope.
Use `docs/DESIGN.md` for visual and UI design rules.
If they conflict, `blueprint.md` controls behavior and `DESIGN.md` controls presentation.

## Frontend implementation rules

For frontend implementation, the Stitch-exported HTML and PNG are the primary visual reference for the current screen.

When implementing a Stitch-designed screen:
- inspect the exported HTML carefully before coding
- use the PNG as a visual reference to match layout, spacing, hierarchy, and styling
- do not fall back to old existing components if they do not match the Stitch design
- prefer adapting or rewriting components so the final UI matches the Stitch reference closely

## Verification requirements

After implementing a frontend screen:
- run the app locally
- use Playwright to open the implemented screen
- compare the rendered result against the Stitch PNG and exported HTML
- verify layout, spacing, typography, and interaction states
- fix major visual mismatches before considering the task complete

## Source priority

For frontend work, use sources in this priority order:
1. `docs/blueprint.md` for product behavior and flow
2. Stitch-exported HTML and PNG for the exact screen structure and visual layout
3. `docs/DESIGN.md` for reusable visual system rules
4. existing local components only if they match the design intent

Do not reuse old components just because they already exist if doing so causes the UI to drift away from the Stitch design.

## Current scope
Only work on **Phase 1**.

### Phase 1 includes
- database schema
- Prisma models and migrations
- backend restaurant/settings module
- availability logic
- public booking API
- public booking page

### Phase 1 does NOT include
- admin dashboard
- admin auth
- accept/reject admin flows
- manual admin booking creation
- opening hours admin UI
- closed dates admin UI
- email sending
- reminders
- cancellation flow
- auto-complete jobs
- POS integration
- table assignment
- multi-restaurant admin UI
- payments

## Architecture rules
- Build for one restaurant first, but keep the data model multi-restaurant-ready
- Use `restaurant_id` where relevant
- Keep the backend modular
- Do not introduce microservices
- Do not add unnecessary abstractions for future features outside Phase 1

## Booking rules for Phase 1
- Booking slots are 30-minute intervals
- Booking duration is fixed at 2 hours
- Max online booking size is 16 guests
- Minimum lead time is 1 hour
- Opening hours determine valid booking start times
- Closed dates must block booking
- Capacity is checked across all affected overlapping slots
- If all affected slots stay at 0–99 guests, slot status is `available`
- If any affected slot becomes 100–120 guests, slot status is `pending`
- If any affected slot becomes above 120 guests, slot status is `blocked`

## Public API expectations
Implement only the public Phase 1 flow:
- fetch restaurant public booking settings
- fetch availability for a date and guest count
- create booking

Do not implement cancellation, reminders, or admin APIs yet unless explicitly asked.

## Frontend expectations
Implement only the public booking experience for Phase 1:
- guest count selection
- date picker
- available time slots
- name/email/phone form
- submit booking
- result state for confirmed / pending / blocked

## Coding expectations
- Prefer simple, readable code over premature optimization
- Reuse shared types where practical
- Keep validation strict
- Add clear comments only where logic is non-obvious
- Avoid adding features not requested in Phase 1

## Delivery expectations
When implementing:
1. define or update the Prisma schema first
2. implement backend booking/availability logic
3. expose public API routes
4. build the public booking page
5. keep changes small and consistent with the blueprint
