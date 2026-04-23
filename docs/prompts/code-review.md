# Prompt: Code Review

Read docs/dev-principles.md first.

Review the code I am about to paste against these principles.

Report only:
1. DRY violations (repeated logic)
2. SOLID violations (especially single responsibility)
3. Missing error handling
4. Security issues (unvalidated input, missing auth middleware)
5. Anything that will cause problems when LLM modules are added later
6. HCI issues (missing loading/error states in React)

Be concise — bullet points only.
Do not rewrite the code unless I ask.