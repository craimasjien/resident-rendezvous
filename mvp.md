# Resident Rendezvous MVP Plan

## Vision

Deliver a simple, friendly web app that lets the family coordinate visits with Grandmother without wrestling with overlapping calendars, logins, or confusing tooling.

## Primary Objectives

- Enable quick visit scheduling from any device, even for non-technical family members.
- Ensure everyone sees the same up-to-date agenda in real time.
- Protect Grandmother's privacy while allowing lightweight collaboration.

## Success Metrics

- Schedule and confirm the first week of visits within 48 hours of launch.
- Keep visit conflicts under 10% of total bookings (tracked via client-side validation events).
- Maintain sub-1 second perceived latency for visit list updates after a booking (using Firestore listeners).

## Tech Stack and Services

- Frontend: TanStack Start (React + Vite) with TypeScript.
- Styling: Bulma CSS + `bulma-calendar` for inline calendar UI.
- Data: Firebase Firestore (multi-user, near real time).
- Auth: Firebase anonymous auth (`signInAnonymously`) to identify visitors without full accounts.
- Utilities: Lucide React icons (optional), date-fns (optional) for formatting.

## Delivery Milestones

| Phase | Target Window | Key Outcomes |
| --- | --- | --- |
| Phase 0 - Project Setup | Day 0-1 | Repo scaffolding, Bulma wired in, Firebase config available as environment variables. |
| Phase 1 - Data Model & Auth | Day 1 | Shared `Visit` interface, Firestore paths defined, anonymous auth tested. |
| Phase 2 - Calendar & Agenda UI | Day 2 | Calendar + agenda shell rendered with placeholder data and responsive columns. |
| Phase 3 - Booking & Real-Time Data | Day 3-4 | Booking modal persists visits, Firestore listeners stream updates. |
| Phase 4 - Interaction & Ownership | Day 4 | My-visit highlighting, edit/delete for visit owners, basic conflict detection. |
| Phase 5 - Polish & Ops | Day 5 | QA pass, mobile polish, documentation, security review of Firestore rules. |

## Feature Overview

- Calendar view: Inline date picker (Bulma calendar) always visible on desktop, collapsible on mobile.
- Daily agenda: Card-based list of visits, quick empty state message, CTA to schedule a visit.
- Booking modal: Collect visitor name, date, time, duration, optional description.
- Ownership cues: Highlight bookings created by the active anonymous user.
- Real-time sync: Listener keeps agenda current without page refreshes.

## Phase Playbooks

### Phase 0 - Project Setup

- Initialize TanStack Start project and confirm development server boots.
- Add Bulma CDN link inside the document `<head>` and verify global styles load.
- Create `firebaseClient.ts` (or similar) to configure Firebase SDK with environment variables.
- Add anonymous auth bootstrap (call `signInAnonymously` on app start and surface errors).
- Draft `AppLayout` using Bulma `hero`, `section`, and `container` components to center content.

### Phase 1 - Data Model and Structure

- Define the shared `Visit` TypeScript interface (see Appendix) in a `types/visit.ts` module.
- Document Firestore collection path at `/artifacts/__app_id/public/data/visits` and store in a constant.
- Decide on time zones (recommend storing visits in local time strings and optionally storing UTC for comparisons).
- Add a lint rule or TypeScript check to ensure all Firestore writes conform to the interface.

### Phase 2 - Calendar and Agenda Shell

- Import `bulma-calendar` CSS and JS via CDN (CSS in `<head>`, JS before `</body>` or dynamic import in component).
- Build a responsive two-column layout: `is-one-third` for the calendar, `is-two-thirds` for the agenda.
- Create `VisitCalendar.tsx` that exposes `selectedDate` and `onDateChange` props.
- Initialize the calendar inside a `useEffect` and bridge the `select` event to update React state.
- Stub `DailyAgenda.tsx` to render mock visit cards and the "Schedule a Visit" button.

### Phase 3 - Booking Flow and Real-Time Data

- Implement `useVisits` hook that subscribes to Firestore with `onSnapshot` and maps documents to `Visit` objects.
- Build `BookingModal.tsx` with controlled fields for name, date, time, duration, optional notes.
- Validate required fields and friendly error messages before calling `addDoc`.
- Convert date/time fields into the canonical `Visit` format before persistence.
- After submission, close the modal, reset the form, and rely on the Firestore listener to refresh state.

### Phase 4 - Interaction and Ownership

- In `DailyAgenda`, filter visits by the currently selected date (use `selectedDate.toISOString().slice(0, 10)` for comparisons).
- Highlight visits belonging to the active user with Bulma modifiers (e.g., `is-success is-light`).
- Provide edit/delete controls (icon buttons) that are only visible for user-owned visits.
- Support editing by pre-filling the booking modal, then calling `updateDoc` with optimistic UI state.
- Implement conflict detection before saving: flag overlapping time ranges and block duplicates unless confirmed.

### Phase 5 - Polish, Security, and Launch Readiness

- Verify layout on narrow screens; stack calendar above agenda when the viewport is < 1024px.
- Display the anonymous `userId` prominently (in a footer) for coordination across family members.

## Collaboration and Operations Recommendations

- Maintain a shared environment file template (`.env.example`) with Firebase config placeholders.
- Use short feedback cycles: async updates via chat, plus a weekly 15-minute sync to review visit metrics.
- Create lightweight PR templates emphasizing UX, data integrity, and accessibility checks.
- Track bugs and feature ideas in a shared issue board; tag items by phase to keep scope tight.

## Testing and QA Approach

- Unit tests: Validate Firestore data transformers, conflict detection, and modal form validation logic.
- Integration smoke tests: Use Playwright or Cypress to exercise booking flow, editing, and deletion against Firestore emulator.
- Accessibility checks: Run lighthouse/axe scans to confirm calendar and modal controls are keyboard and screen-reader friendly.
- Manual regression: Test across mobile Safari and desktop Chrome before each milestone sign-off.

## Security, Privacy, and Reliability

- Restrict Firestore write access by user ID; prevent anonymous users from modifying others' visits.
- Log minimal personal data (visitor name only) and avoid storing sensitive health information.
- Add client-side guards against script injection by sanitizing optional description fields.
- Set Firestore document TTL or archival strategy if old visits should be hidden automatically.
- Implement basic offline messaging (toast) when the network is lost so users know their booking status.

## Risks and Mitigations

- **Bulma calendar API drift:** Pin the CDN version (`6.1.19`) and wrap initialization in error handling.
- **Time zone mismatches:** Standardize on ISO date strings and show local time when rendering.
- **Anonymous auth friction:** Provide a "Regenerate my ID" action in settings if someone loses their identifier.
- **Conflict detection gaps:** Write unit tests around overlap logic and display warnings before rejecting saves.

## Appendix

### Visit Interface

```typescript
export interface Visit {
  id: string; // Firestore document ID
  date: string; // yyyy-MM-dd
  time: string; // HH:mm (24-hour)
  visitorName: string;
  description?: string; // Optional note, sanitized before render
  durationMinutes: number;
  userId: string; // Anonymous auth UID for ownership checks
}
```

### Firestore Collection Reference

- Root collection path: `/artifacts/__app_id/public/data/visits`
- Recommended helper: `const VISITS_PATH = 'artifacts/' + appId + '/public/data/visits';`

### Calendar Initialization Snippet

```typescript
useEffect(() => {
  const [calendar] = bulmaCalendar.attach('#inline-calendar-container', {
    displayMode: 'inline',
    color: 'primary'
  });

  calendar.on('select', datepicker => {
    onDateChange(datepicker.data.value());
  });

  return () => calendar?.destroy();
}, [onDateChange]);
```