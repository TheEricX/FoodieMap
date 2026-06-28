# Responsive UI Design Notes

FoodieMap uses responsive UI patterns, but the mobile experience is not a compressed copy of the desktop layout. Desktop and mobile share the same data model, filters, routes, and dialogs, while the screen structure changes to fit the task and available space.

## Core Principle

- Desktop favors overview and parallel controls.
- Mobile favors the current task, short controls, and hidden secondary surfaces.
- Map View is the first mobile-optimized screen. List View, Discovery, and detail/edit flows should follow the same principle in future passes.

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
- Bottom navigation switches primary views: Map View, List View, Discovery.

The goal is to make the common mobile flow fast:

1. Search or add a spot.
2. Pick a system category or custom list.
3. Inspect the map.
4. Tap a marker.
5. Open selected spot details only when needed.

## Control Placement Rules

- Put primary mobile actions close to the workflow. `+ Add` belongs next to search because adding a spot and searching the current category are both high-frequency map actions.
- Keep category switches compact and stable. Selected state should not change control size.
- Put secondary or broader navigation in drawers or bottom navigation, not in the main map surface.
- Do not rely on partially clipped controls to imply horizontal scrolling. If a control is important, make it visible or put it behind an explicit drawer/menu.
- Dangerous or low-frequency actions should stay deeper in dialogs, menus, or detail screens.

## Future Mobile Passes

Apply the same split-layout thinking to the remaining views:

- List View: mobile-first list rows, compact filters, row actions behind a menu.
- Discovery: single-column public list cards, sticky search/sort, compact hero.
- Detail/Edit: full-screen mobile form, grouped sections, fixed save action, safer destructive actions.
- Admin: card-based users, collapsed filters, action menus.

When adding new features, decide both desktop and mobile placement. Do not assume a new desktop sidebar control should appear directly on mobile.
