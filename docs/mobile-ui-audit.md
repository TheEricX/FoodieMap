# Mobile UI audit

## Scope

This audit covers the supplied iPhone Safari screenshot and the local signed-in application at 320, 375, 390, 430, and 768 CSS-pixel widths. Automated checks run in Chromium touch emulation and WebKit; visual baselines cover the 390 × 844 mobile viewport and desktop.

## Findings and resolution

| ID | Severity | Finding | Resolution | Regression coverage |
| --- | --- | --- | --- | --- |
| MOB-001 | P0 | On **My Places → List**, the filter row could overlap the first list action and saved-place content. | The mobile list grid now gives its header, filter bar, and scrollable results separate rows. | Responsive geometry checks assert an 8px separation at five mobile widths; visual snapshot covers the saved-place list. |
| MOB-002 | P1 | Content at the bottom of a long saved-place list could sit behind the fixed mobile navigation. | The list detail area retains bottom safe-area padding and the test asserts that visible actions stay above navigation. | Responsive geometry check at five mobile widths. |
| MOB-003 | P1 | Selecting an empty Favorites category could look like a broken blank map because it used the account-empty layout and hid category controls. | Empty filters now retain the category controls, explain why there are no results, and offer a one-tap return to all places. | Mobile interaction test covers Favorites with no matching restaurants. |
| TEST-001 | P1 | Smoke tests treated the List subview as a separate bottom-navigation destination and expected its old Chinese label. | The tests now model Map and List as one **My Places** workspace and assert the current localized label. | Mobile and desktop smoke suites. |

## Acceptance criteria

- No horizontal overflow from 320px through 768px.
- The list header, filters, and results remain separate, with no visual or hit-target overlap.
- All visible list actions remain reachable above the bottom navigation.
- The same list geometry passes Chromium touch emulation and WebKit.

## Manual device follow-up

Before a production release, verify the deployed build once on a physical iPhone Safari device with browser chrome expanded and collapsed. This is the only remaining device-specific check because its dynamic safe-area dimensions are not exposed by desktop automation.
