# Separation of Concerns Analysis & Refactoring Recommendations

## Overview
This document outlines separation of concerns violations and provides recommendations for splitting components into more focused, maintainable pieces.

---

## 1. VisitCalendar Component

### Current Issues
- **Calendar logic mixed with UI**: Date calculations (`getDaysInMonth`, `getFirstDayOfMonth`) are embedded in the component
- **Date formatting**: Month/year formatting logic is inline
- **Business logic**: Past date validation mixed with rendering
- **Complex rendering**: Calendar grid generation is a large function within the component

### Recommended Split

#### Extract to `utils/dateUtils.ts`:
```typescript
// Date calculation utilities
export function getDaysInMonth(date: Date): number
export function getFirstDayOfMonth(date: Date): number // Monday-based
export function formatDateString(date: Date): string // "YYYY-MM-DD"
export function formatMonthYear(date: Date, locale: string = "nl"): string
export function isDateInPast(dateStr: string): boolean
export function getTodayDateString(): string
```

#### Extract to `components/CalendarGrid.tsx`:
```typescript
// Pure presentational component for the calendar grid
interface CalendarGridProps {
  currentMonth: Date
  selectedDate: string
  todayStr: string
  visitDates: Set<string>
  onDateClick: (day: number) => void
}
```

#### Extract to `components/CalendarHeader.tsx`:
```typescript
// Calendar navigation header
interface CalendarHeaderProps {
  currentMonth: Date
  onPrevMonth: () => void
  onNextMonth: () => void
}
```

#### Refactored `VisitCalendar.tsx`:
- Orchestrates state and data fetching
- Uses extracted utilities
- Composes CalendarHeader and CalendarGrid
- Handles date selection coordination

---

## 2. BookingModal Component

### Current Issues
- **Form state + validation + business rules**: All mixed together
- **Hardcoded business rules**: Restricted times (12:00-13:00, 17:00-18:00) embedded in component
- **Time parsing logic**: Mixed with conflict detection
- **Firebase operations**: Directly in component (though this is acceptable, could be extracted)

### Recommended Split

#### Extract to `utils/timeUtils.ts`:
```typescript
export function parseTime(timeStr: string): number // minutes since midnight
export function calculateDepartureTime(arrivalTime: string, durationMinutes: number): string
export function formatDuration(minutes: number): string
```

#### Extract to `utils/visitValidation.ts`:
```typescript
// Business rules for visit validation
export const RESTRICTED_PERIODS = [
  { start: 12 * 60, end: 13 * 60, label: "12:00-13:00" },
  { start: 17 * 60, end: 18 * 60, label: "17:00-18:00" }
] as const

export function checkRestrictedTimeOverlap(
  startTime: number,
  endTime: number
): { overlaps: boolean; periods: string[] }

export function checkVisitConflict(
  date: string,
  time: string,
  durationMinutes: number,
  existingVisits: Visit[],
  excludeVisitId?: string
): { hasConflict: boolean; conflictingVisits: Visit[] }
```

#### Extract to `hooks/useVisitForm.ts`:
```typescript
// Form state management hook
export function useVisitForm(initialDate?: string, editingVisit?: Visit) {
  // Form state
  // Form reset logic
  // Validation logic using extracted utilities
  // Returns form state, handlers, validation errors
}
```

#### Extract to `components/VisitForm.tsx`:
```typescript
// Pure form UI component
interface VisitFormProps {
  formState: VisitFormState
  errors: VisitFormErrors
  isSubmitting: boolean
  onChange: (field: string, value: string | number) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}
```

#### Refactored `BookingModal.tsx`:
- Modal wrapper and portal logic
- Composes VisitForm
- Handles submission orchestration
- Uses useVisitForm hook

---

## 3. DailyAgenda Component

### Current Issues
- **CRUD operations**: Delete logic directly in component
- **Data filtering**: Mixed with presentation
- **Modal state**: Should be lifted or extracted
- **Date formatting**: Duplicated logic

### Recommended Split

#### Extract to `hooks/useDailyVisits.ts`:
```typescript
// Filters visits by date
export function useDailyVisits(selectedDate: string) {
  const { visits, isLoading, error } = useVisits()
  const dailyVisits = useMemo(() => 
    visits.filter(visit => visit.date === selectedDate),
    [visits, selectedDate]
  )
  return { dailyVisits, isLoading, error }
}
```

#### Extract to `hooks/useVisitActions.ts`:
```typescript
// CRUD operations for visits
export function useVisitActions() {
  const deleteVisit = async (visitId: string) => { ... }
  // Could add update, create here too
  return { deleteVisit }
}
```

#### Extract to `components/EmptyVisitsState.tsx`:
```typescript
// Empty state presentation
interface EmptyVisitsStateProps {
  isLoading: boolean
  error: Error | null
}
```

#### Refactored `DailyAgenda.tsx`:
- Orchestrates data fetching and actions
- Composes EmptyVisitsState and VisitCard list
- Handles modal state (or lift to parent)
- Uses extracted hooks

---

## 4. VisitCard Component

### Current Issues
- **Time calculations**: `calculateDepartureTime` embedded
- **Duration formatting**: `summarizeDuration` embedded
- **Styling**: Inline styles mixed with logic

### Recommended Split

#### Move utilities to `utils/timeUtils.ts`:
```typescript
// Already extracted above, reuse here
export function calculateDepartureTime(...)
export function formatDuration(...)
```

#### Extract to `components/VisitDetailItem.tsx`:
```typescript
// Reusable detail row component
interface VisitDetailItemProps {
  icon: React.ReactNode
  label: string
  value: string
}
```

#### Refactored `VisitCard.tsx`:
- Pure presentation component
- Uses extracted utilities
- Composes VisitDetailItem
- Only handles click handlers

---

## 5. AppLayout Component

### Current Issues
- **Authentication logic**: Mixed with layout
- **Auth state management**: Could be extracted

### Recommended Split

#### Extract to `hooks/useAuth.ts`:
```typescript
// Authentication state management
export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Init and observe auth
  }, [])
  
  return { userId, error, isAuthenticating: userId === null && error === null }
}
```

#### Extract to `components/AppHeader.tsx`:
```typescript
// Header component
interface AppHeaderProps {
  title: string
  description: string
}
```

#### Extract to `components/AppFooter.tsx`:
```typescript
// Footer component
interface AppFooterProps {
  userId: string | null
}
```

#### Refactored `AppLayout.tsx`:
- Pure layout component
- Uses useAuth hook
- Composes AppHeader and AppFooter
- Handles auth error display

---

## 6. Additional Utilities Needed

### `utils/dateFormatting.ts`:
```typescript
// Centralized date formatting
export function formatDateLong(dateStr: string, locale: string = "nl"): string
export function formatDateShort(dateStr: string): string
```

### `hooks/useVisitModal.ts`:
```typescript
// Modal state management
export function useVisitModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null)
  // ... handlers
}
```

---

## File Structure After Refactoring

```
src/
├── components/
│   ├── calendar/
│   │   ├── CalendarGrid.tsx
│   │   ├── CalendarHeader.tsx
│   │   └── VisitCalendar.tsx (refactored)
│   ├── forms/
│   │   ├── VisitForm.tsx
│   │   └── BookingModal.tsx (refactored)
│   ├── visits/
│   │   ├── VisitCard.tsx (refactored)
│   │   ├── VisitDetailItem.tsx
│   │   ├── EmptyVisitsState.tsx
│   │   └── DailyAgenda.tsx (refactored)
│   ├── layout/
│   │   ├── AppHeader.tsx
│   │   ├── AppFooter.tsx
│   │   └── AppLayout.tsx (refactored)
│   └── OfflineToast.tsx (unchanged)
├── hooks/
│   ├── useAuth.ts (new)
│   ├── useVisitForm.ts (new)
│   ├── useDailyVisits.ts (new)
│   ├── useVisitActions.ts (new)
│   ├── useVisitModal.ts (new)
│   ├── useVisits.ts (unchanged)
│   ├── useCurrentUserId.ts (unchanged)
│   └── useOfflineStatus.ts (unchanged)
└── utils/
    ├── dateUtils.ts (new)
    ├── dateFormatting.ts (new)
    ├── timeUtils.ts (new)
    ├── visitValidation.ts (new)
    └── sanitize.ts (unchanged)
```

---

## Benefits of This Refactoring

1. **Testability**: Pure utilities and hooks are easier to test
2. **Reusability**: Extracted utilities can be used across components
3. **Maintainability**: Business rules centralized in one place
4. **Readability**: Smaller, focused components are easier to understand
5. **Type Safety**: Better TypeScript inference with smaller functions
6. **Performance**: Easier to optimize with smaller, memoizable pieces

---

## Priority Order for Refactoring

1. **High Priority**:
   - Extract date/time utilities (used everywhere)
   - Extract visit validation logic (critical business rules)
   - Extract form state hook (BookingModal is complex)

2. **Medium Priority**:
   - Split Calendar components
   - Extract visit actions hook
   - Extract auth hook

3. **Low Priority**:
   - Extract VisitDetailItem (nice-to-have)
   - Split layout components (already reasonably separated)

---

## Migration Strategy

1. Start with utilities (non-breaking)
2. Extract hooks one at a time
3. Refactor components incrementally
4. Test after each extraction
5. Remove duplicate code as you go

