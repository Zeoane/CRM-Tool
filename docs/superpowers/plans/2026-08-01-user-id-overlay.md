# User ID Overlay Implementation Plan

> **For agentic workers:** Implement tasks in order. Spec: `docs/superpowers/specs/2026-08-01-user-id-overlay-design.md`

**Goal:** Routed overlay profile card for a Firestore user, opened from the table.

**Files**
- Create: `simple-crm/src/app/user-id/user-id.ts|html|scss`
- Modify: `user.service.ts`, `app.routes.ts`, `app.ts`, `app.html`, `app.scss`

## Task 1: Service + route
- Add `getUserById(id)` using Firestore `doc` + `getDoc` (or `docData`)
- Register `{ path: 'user/:id', component: UserId, outlet: 'overlay' }` before/alongside primary `user`

## Task 2: UserId component
- Read `:id` from route; load user; show loading/error/card
- Backdrop + close clear overlay outlet
- Profile card layout with project colors; pencil badge non-interactive

## Task 3: Wire table + shell
- Row click → open overlay route
- `<router-outlet name="overlay" />` always in shell
- Row cursor pointer styles
- Avoid wiping overlay on drawer-close only when intentional (closing drawer may reset to `/`)
