# Development Principles

All code in this project must follow these principles strictly.
Agents must check against these before suggesting any implementation.

## DRY — Don't Repeat Yourself
- Repeated logic belongs in a Service class (Laravel) or custom hook (React)
- Never copy-paste a block of code — abstract it
- Shared UI patterns go in `components/`, not repeated per page

## KISS — Keep It Simple, Stupid
- The simplest solution that works is the right solution
- Avoid clever code — write code a junior can read
- If an explanation is needed, the code is too complex

## YAGNI — You Ain't Gonna Need It
- Only build what is in plan.md right now
- Do not add fields, features, or abstractions "just in case"
- Future modules are in plan.md — they get built in their phase

## SOLID
- **S** — One class/component does one thing only
- **O** — Extend behaviour via new classes, not by editing existing ones
- **L** — Subclasses must work wherever the parent is used
- **I** — Don't force a class to implement methods it doesn't need
- **D** — Depend on abstractions (interfaces/services), not concrete classes

## High Cohesion, Low Coupling
- Each module owns its own logic — it does not reach into another module's internals
- Modules communicate through service classes or API contracts, not direct imports
- A change in one module should not break another

## Clean Architecture
- Laravel: Route → Controller (thin) → Service (logic) → Model (data)
- React: Page → Component (UI) → Hook (logic) → Service (API call)
- No business logic in Controllers or UI components

## HCI (Human-Computer Interaction)
- Every user action must have feedback (loading, success, error states)
- Error messages must be human-readable, not raw API errors
- Forms must validate on the frontend before hitting the API
- Mobile-responsive by default