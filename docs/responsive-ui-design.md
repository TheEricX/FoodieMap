# Dual-Shell Responsive UI Architecture

FoodieMap uses a shared business core with separate desktop and mobile presentation shells. The mobile experience is not a compressed desktop layout: both shells share data, routes, content components, validation, and commands while navigation and surface containers adapt to the task and available space.

## Architecture

```text
i18n.mjs         bilingual dictionaries, language normalization, and interpolation
map-link-core.mjs Google/Apple Maps URL parsing, coordinate validation, and paste sanitization
map-geometry.mjs relative marker placement, pan limits, and food placeholder images
map-interactions.mjs map pan, wheel/pinch zoom, pointer ownership, and DOM transforms
ui-core.mjs       pure layout, search, validation, and presentation rules
ui-shell.mjs      DOM adapter that activates one shell and labels surfaces
ui-components.mjs shared empty, guidance, loading, and error components
ui-swipe-dismiss.mjs shared mobile task drag-dismiss controller
ui-dialogs.mjs    accessible confirmation and destructive-action controller
data-client.mjs   shared authenticated API request and error boundary
domain-core.mjs   restaurant, dish, list, recipe, and share normalization plus collection selectors
view-templates.mjs shared Recipe, Restaurant, and List presentation templates
list-view-templates.mjs shared system-list, private-list, and Discovery detail templates
account-share-templates.mjs public share, share history, and Admin user templates
form-templates.mjs shared form rows, dish editors, share pickers, and connected-app templates
map-view-templates.mjs shared map markers, list filters, recent rows, and selected-spot metadata
ui-tokens.css     shared breakpoints, target sizes, spacing, and layers
ui-shell.css      desktop/mobile shell ownership and container behavior
app.js            product state, API orchestration, rendering, and commands
```

The desktop top navigation and mobile bottom navigation are separate DOM containers. Only the active shell is exposed in layout and the accessibility tree. Dialog content remains shared, but each dialog receives a presentation label:

- `desktop-modal` or `desktop-drawer`
- `mobile-task` or `mobile-sheet`

Do not move navigation or surface responsibilities back into generic `.top-nav` or `.modal-card` media-query overrides.

## Layout Modes

- Mobile: `<= 900px`
- Compact desktop: `901px–1380px`
- Desktop: `>= 1381px`

JavaScript must use `classifyLayoutMode()` rather than user-agent detection. CSS and JavaScript use the same boundaries.

## Core Principle

- Desktop favors overview and parallel controls.
- Mobile favors the current task, short controls, and hidden secondary surfaces.
- Map, Lists, Recipes, Discovery, Settings, authentication, and detail/edit flows all use the same shell and surface rules.

## Shared Interaction Rules

- Browser-native confirmation dialogs are not used. `ui-dialogs.mjs` owns confirmation, focus, Escape, backdrop cancellation, labels, and destructive tone.
- Restaurant, List, and Recipe forms capture a baseline when opened. Close, Cancel, and mobile swipe dismissal must confirm before losing changed values.
- Restaurant and Recipe mobile task dismissal uses `ui-swipe-dismiss.mjs`; new full-screen task flows must use the same controller instead of introducing view-specific pointer listeners.
- Mobile form surfaces are full-screen tasks; desktop form surfaces are modals. Their fields and validation remain shared.
- Empty guidance is rendered as text. A button is included only when an actual command is available.
- UI rendering code reads the layout mode from `ui-shell.mjs`; it must not query viewport width, user agent, or device brand directly.
- All API calls pass through `data-client.mjs`, so both shells receive identical authentication and error behavior.
- Both shells use `i18n.mjs` for the same complete English/Chinese dictionary, fallback rules, and parameter interpolation.
- Map-link parsing and coordinate validation live in `map-link-core.mjs`; DOM autofill, backend short-link resolution, and API calls stay in `app.js`.
- Relative map geometry and placeholder image generation live in `map-geometry.mjs`; `map-interactions.mjs` owns pointer/touch pan, wheel/pinch zoom, map transform state, and interactive-target exclusion. View rendering stays in `app.js`.
- API payloads are normalized by `domain-core.mjs`; view code must not duplicate defaults, rating bounds, nested item normalization, or collection ordering.
- Repeated rows and details belong in `view-templates.mjs`. Event binding stays in `app.js`, keeping templates free of global state and direct DOM access.
- Lists and Discovery compose those shared rows through `list-view-templates.mjs`; list management commands are expressed as `data-list-action` hooks and bound by the orchestrator.
- Public Share Pack, Recipe Share, connected history, and Admin rows use `account-share-templates.mjs`; authentication, API calls, and confirmations remain outside the template layer.
- Repeated form rows and selection controls use `form-templates.mjs`; upload, save, revoke, and destructive commands remain in the orchestrator.
- Map markers, list filters, recent rows, and selected-spot metadata use `map-view-templates.mjs`; map positioning and selection remain in the orchestrator.

## Desktop Layout

Desktop keeps the full workbench visible:

- Fixed topbar with primary navigation, search, location, language, settings, and account controls.
- Left sidebar with profile state, add actions, system filters, custom lists, and data tools.
- Map content area with nearest list, full map, zoom controls, and selected spot card inside the map stage.
- List and Discovery views use wider panels and side-by-side reading layouts when space allows.

Use desktop space to keep context visible. Avoid hiding important controls behind menus when there is room to show them clearly.

## Mobile Map View Layout

Mobile Map View is intentionally different:

- Topbar is compact.
- Search and `+ Add` share one row. `+ Add` opens the important add actions: manual new spot and Google link paste/auto-detection.
- System filters are short, fixed-size pills: `All`, `Visited`, `Want`, `Favs`.
- Custom lists are behind the `Lists` drawer in the same category row.
- The sidebar is hidden on mobile Map View.
- The map gets the remaining vertical space.
- Selected spot details use a bottom tab and bottom sheet instead of a desktop floating card.
- Bottom navigation switches primary views: Map View, List View, Recipes, Discovery.
- Location consent appears as a compact inline strip below the active map category, never as an automatic system prompt on page load.
- Without location, the map remains a usable saved-spots board: restaurant markers stay visible while the user marker, distance rings, distance labels, and center-on-user control are removed.

The goal is to make the common mobile flow fast:

1. Search or add a spot.
2. Pick a system category or custom list.
3. Inspect the map.
4. Tap a marker.
5. Open selected spot details only when needed.

## Control Placement Rules

- Put primary mobile actions close to the workflow. `+ Add` belongs next to search because adding a spot and searching the current category are both high-frequency map actions.
- Keep category switches compact and stable. Selected state should not change control size.
- Keep location recovery contextual. The topbar location icon reopens the flow; detailed browser permission steps belong in a bottom sheet, not permanently in the map surface.
- Put secondary or broader navigation in drawers or bottom navigation, not in the main map surface.
- Do not rely on partially clipped controls to imply horizontal scrolling. If a control is important, make it visible or put it behind an explicit drawer/menu.
- Dangerous or low-frequency actions should stay deeper in dialogs, menus, or detail screens.
- Each mobile page has at most one visually dominant action. Secondary actions use menus, sheets, or lower-emphasis controls.
- Page-level horizontal scrolling is prohibited. Maps, explicit carousels, and compact metadata scrollers are the only intentional horizontal interaction regions.
- Mobile targets are at least 44px. Desktop controls may be denser but retain keyboard focus treatment.

## Feature Checklist

Every new feature must define:

- Desktop entry point and desktop container.
- Mobile entry point and mobile container.
- Shared command, validation, loading, empty, error, and permission states.
- Keyboard behavior and 44px mobile target behavior.
- Tests at 390px, 430px, 750px, 1024px, 1280px, 1440px, and 1720px where relevant.

Do not assume a desktop sidebar control should appear directly on mobile.

## Completion Boundary

The dual-shell migration covers all current primary views and shared form surfaces. `app.js` remains the orchestration entry point because the project intentionally has no framework or build step, but viewport policy, data transport, domain normalization, reusable templates, state panels, confirmation behavior, and shell ownership are now external modules. New presentation behavior belongs in those modules instead of new device branches in `app.js`.
