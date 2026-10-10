---
name: a11y-check
description: The accessibility checklist for any step that adds or changes UI in Mise (target WCAG 2.2 AA). Use when building a page, component, form, dialog or theme, and before calling a UI step done.
---

# Accessibility check for a UI step

Lint (`jsx-a11y-x`) and the axe scan catch markup and colour problems. This list covers what they
can't see. Go through it for every UI change, and say in the step summary which items applied.

## Markup

- [ ] Native elements first: `<button>` for actions, `<Link>`/`<a>` for navigation, a `<label>` for
      every form field. ARIA only where no native element fits.
- [ ] Headings in order, no skipped levels.

## A new page

- [ ] Exactly one `<h1>`.
- [ ] A `head` title like `About · Mise`.
- [ ] The page returns a fragment and renders inside the layout's `<main>` (in `src/routes/__root.tsx`).
- [ ] Its path is added to the `pages` list in `e2e/accessibility.spec.ts`.
- [ ] From step 22 (dark theme): the axe scan runs in both themes.

## Keyboard

- [ ] Everything works with Tab, Enter, Space and Esc. Actually try it in the browser.
- [ ] Focus is always visible.
- [ ] A dialog keeps focus inside and returns it to the opener when it closes.
- [ ] The flow is added to `e2e/keyboard.spec.ts`.

## Changes are announced

- [ ] A form error is tied to its field (`aria-describedby`, `aria-invalid`), and the first invalid
      field gets focus on submit.
- [ ] Status messages and toasts are in a live region (`role="status"` or `aria-live`).

## Meaning without colour or motion

- [ ] Colour is never the only signal (add text or an icon with a label).
- [ ] Animations and transitions respect `prefers-reduced-motion`.

## Tests

- [ ] Tests find elements by role and accessible name (`getByRole('button', { name: ... })`), the
      way assistive technology does. This also proves the name exists.
- [ ] `pnpm lint` and `pnpm test:e2e` pass (the axe scan is in `e2e/accessibility.spec.ts`).
