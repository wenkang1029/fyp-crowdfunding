# AidWise UI/UX Design System

## Brand Identity
* **Name:** AidWise
* **Vibe:** Apple-inspired, premium, trustworthy, clean, minimalist.
* **Core Philosophy:** Content first. Interfaces should feel lightweight, breathable, and effortless.

## Tailwind CSS Guidelines

### 1. Typography
* **Font Family:** 'Inter' (sans-serif).
* **Headings:** Use bold weights (`font-semibold` or `font-bold`) and tight tracking (`tracking-tight`). 
* **Text Colors:** Primary text is `text-aidwise-text`. Avoid harsh black (`text-black`).

### 2. Colors & Backgrounds
* **Page Background:** Always `bg-aidwise-light`.
* **Cards/Containers:** Always pure white `bg-white`.
* **Primary Actions:** Use `bg-aidwise-blue text-white` for primary buttons.

### 3. Geometry & Spacing (The Apple Look)
* **Borders:** Extremely subtle. Use `border border-aidwise-border/50`.
* **Corners:** Generous radii. Use `rounded-2xl` for cards, `rounded-xl` for buttons, and `rounded-lg` for small inputs.
* **Shadows:** Avoid harsh shadows. Use `shadow-apple` for standard cards and `shadow-apple-lg` for modals/popups.
* **Padding:** Use generous whitespace. Cards should typically have `p-6` or `p-8`.

### 4. Components
* **Inputs:** Light gray background `bg-gray-100` or transparent with a subtle border. No heavy outlines until focused.
* **Navigation (Glassmorphism):** Navbars should use `bg-white/80 backdrop-blur-md` to blur the content scrolling underneath them.