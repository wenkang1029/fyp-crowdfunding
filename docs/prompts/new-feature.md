# Prompt: New Feature

@workspace

Before starting, read:
- docs/progress/plan.md
- docs/progress/completed.md
- docs/dev-principles.md
- docs/modules/[RELEVANT MODULE FILE]

## Task
I want to implement: [FEATURE NAME]

## Scope
Only implement what is described. Do not add extra fields, methods, 
or components beyond what is asked.

## Affected files (current)
[list the files you expect to change]

## Rules
- Follow all principles in docs/dev-principles.md
- Laravel: keep controllers thin, put logic in Services
- React: keep pages thin, put logic in hooks and services
- Output one file at a time — wait for my approval before the next
- If you need a new DB migration, show it to me first and wait
- When done, give me:
  1. A summary of what was changed
  2. The git commit message to use
  3. A reminder of what to update in plan.md and completed.md