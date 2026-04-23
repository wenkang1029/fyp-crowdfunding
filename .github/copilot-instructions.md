# Project: Donation-Based Crowdfunding System (SJAM KMT)

## Stack
- Backend: Laravel 10 · REST API · MySQL · Laravel Sanctum
- Frontend: React.js (Vite) · Tailwind CSS [or whatever you use]
- LLM: Google AI Studio (Gemini API) — Phase 2 only
- Roles: system_admin · ngo_admin · donor

## Architecture Rules
- Laravel: Route → Controller (thin) → Service (logic) → Model
- React: Page → Component → Hook (logic) → Service (API calls)
- API responses always use: { success, data, message }
- Never write business logic in Controllers or React components

## Dev Principles (always follow — see docs/dev-principles.md)
- DRY · KISS · YAGNI · SOLID · Low coupling · HCI

## Before Every Task
1. Check docs/progress/plan.md for current status
2. Check docs/progress/completed.md for what exists
3. Only build what is in the current phase

## After Every Task
1. Remind me to update completed.md with what changed
2. Remind me to update plan.md status
3. Give me a git commit message in this format:
   type(scope): description
   types: feat / fix / refactor / docs / test
   example: feat(campaign): add store and update methods to CampaignService