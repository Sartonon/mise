# Design: Night bento

The look Mise is built towards. It was picked from five design directions mocked up in a Claude Design
canvas ("Mise palette designs", the "Night bento" board). Every UI step follows this page; step 22c
puts the foundations (palette, fonts, header) into the app.

## In one sentence

A dark, warm evening dashboard: rounded "bento" tiles on a deep indigo background, saffron for the one
thing that matters most, big rounded display type, and pill-shaped controls.

## Colour

- **Palette:** `saffron` (Saffron & Indigo) from `src/styles/palettes.css`. No new colours: only the
  existing roles (`background`, `card`, `foreground`, `muted-foreground`, `primary`, `primary-foreground`,
  `secondary`, `secondary-foreground`, `border`, `ring`).
- **Dark first:** the mock-ups are designed in dark mode (indigo background, saffron primary). Light mode
  stays and must look right too (cream background, indigo primary). With no saved choice the page still
  follows the system setting, as step 22 decided.
- **One loud tile per screen:** the most important tile (for example "Tonight") is filled with `primary`
  and uses `primary-foreground` text. Everything else sits on `card`.

## Type

- **Display:** Unbounded (500, 700), for the page `<h1>`, tile headings and big numbers (servings).
  Slightly tight tracking (`-0.02em`).
- **Text:** DM Sans (400, 500, 700), for everything else. 16px base.
- **Labels:** small uppercase eyebrows with wide tracking (`0.12em`, 13px, bold), such as "Tonight · Wed 14".

## Shapes and layout

- **Bento grid:** a 12-column grid with 16px gaps. Tiles span 4, 5, 7, 8 or 12 columns and stack to full
  width below 960px.
- **Tiles:** `card` background, 1px `border`, 28px radius, 28px padding.
- **Inner cards** (a recipe in a list): `background` colour inside the tile, 20px radius, 18px padding,
  with a rounded square "blob" (56px, 18px radius, `secondary`) holding the recipe's initial.
- **Pills:** buttons, links styled as buttons, nav items, inputs and tag chips are fully rounded
  (`999px`), at least 44px high. The primary action ("New recipe") is a filled `primary` pill.
- **Header:** one rounded pill bar on `card` holding the lowercase "mise" wordmark (Unbounded, `primary`),
  the nav (current page: `secondary` pill) and the Dark toggle and New recipe button.
- **Planner:** a table with separated rounded cells (14px radius); today's column is shaded `secondary`
  and its heading uses `primary`. Empty slots are dashed rounded "+" buttons.
- **Servings scaler:** round 56px − and + buttons either side of a big Unbounded number, inside a pill.

## Screens in the mock-up

- **Home:** a greeting `<h1>` ("Good evening. Dinner is chana masala."), then tiles: Tonight (the loud
  tile), Shopping list with a progress bar, the week planner, Recipes (search, sort, tag chips, cards,
  pagination) and a featured recipe with the servings scaler.
- **Recipes, recipe detail, planner, shopping list, about and the recipe form** use the same tiles, pills and
  type; they're built in their own plan steps.

## Accessibility

The target is still WCAG 2.2 AA (see the `a11y-check` skill). The palette's contrast was already checked in
step 20b and step 22. State is never shown by colour alone (the current nav item is a filled pill, a
pressed chip is filled and bold, a ticked item is struck through).
