# User ID Overlay – Design

## Goal
Clicking a user row in the table opens a profile-style overlay with all Firestore fields for that user. Close via X or backdrop click. URL is routable via a named overlay outlet.

## Decisions
- Open: table row click → navigate overlay outlet to `user/:id`
- Display: modal overlay over the current shell (table/toolbar remain visible behind backdrop)
- Data: fresh load from Firestore via document ID (`getUserById`)
- Avatar edit pencil: visual only (no handler)
- UI language: English
- Colors: existing Material rose/cyclam primary tokens

## Routing
- Named outlet `overlay`
- Route: `{ path: 'user/:id', component: UserId, outlet: 'overlay' }`
- Open: `navigate([{ outlets: { overlay: ['user', id] } }])`
- Close: `navigate([{ outlets: { overlay: null } }])`
- Existing sidenav route `user` (primary) stays unchanged

## UI
- Dimmed backdrop; centered card (max ~460px; full width with margin down to 320px)
- Primary-colored header band
- Circular avatar placeholder overlapping header; pencil badge bottom-right
- Name (first + last); email as subtitle
- Field list: Email, Date of birth, Street, House number, ZIP, City; optional ID meta
- States: loading, not found / error, success
- Responsive: single column; address fields may use two columns from ~480px

## Out of scope
- Photo upload / edit profile
- Editing user fields from the overlay
