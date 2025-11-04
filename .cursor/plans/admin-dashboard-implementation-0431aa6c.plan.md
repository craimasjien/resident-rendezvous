<!-- 0431aa6c-04be-4816-a2bf-0518929b90c2 85bcb0fb-ea3f-4842-a614-90149a28301f -->
# Admin Dashboard Implementation Plan

## Overview

Add administrator functionality with Firebase email/password authentication for admins, while preserving anonymous authentication for normal users. Create protected routes and components for admin-only features.

## Implementation Steps

### 1. Type Definitions

- **File**: `src/types/user.ts` (new)
- Define `UserRole` type: `'user' | 'administrator'`
- Define `User` interface: `{ id: string; email: string; username: string; name: string; role: UserRole }`
- Define `UserWriteData` type (omit `id`)

### 2. Firebase Collections

- **File**: `src/firebase/usersCollection.ts` (new)
- Create Firestore converter for User type
- Create `getUsersCollection()` function
- Collection path: `users`

### 3. Firebase Authentication Updates

- **File**: `src/firebaseClient.ts`
- Add `signInWithEmailAndPassword(email, password)` function
- Add `signOut()` function
- Update `observeAuth` to handle both anonymous and email/password users
- Keep `initAnonymousAuth()` for normal users

### 4. Authentication Hooks

- **File**: `src/hooks/useAuth.ts`
- Update to support both anonymous and email/password auth
- Add `isAdmin` boolean to return value
- Add `signOut` function to return value

- **File**: `src/hooks/useUserRole.ts` (new)
- Fetch user role from Firestore `users` collection
- Return `{ role: UserRole | null, isLoading: boolean }`
- Handle cases where user document doesn't exist (defaults to 'user')

- **File**: `src/hooks/useRequireAdmin.ts` (new)
- Check if current user is admin
- Redirect to `/login` if not admin
- Used for protecting admin routes/actions

### 5. Authentication Components

- **File**: `src/components/auth/LoginForm.tsx` (new)
- Email/password login form
- Error handling for invalid credentials
- Redirect to `/dashboard` on success
- Use Firebase Auth `signInWithEmailAndPassword`

### 6. Dashboard Components

- **File**: `src/components/dashboard/Dashboard.tsx` (new)
- Visit statistics (total visits, visits by date range, etc.)
- System settings section (placeholder for now)
- Sign out button
- Admin-only UI elements

### 7. Routes

- **File**: `src/routes/login.tsx` (new)
- Login page route
- Show `LoginForm` component
- Redirect to `/dashboard` if already logged in as admin
- Allow anonymous users to still access (don't require auth)

- **File**: `src/routes/dashboard.tsx` (new)
- Admin dashboard route
- Protected with `useRequireAdmin` hook
- Show `Dashboard` component
- Redirect to `/login` if not admin

### 8. Firestore Security Rules

- **File**: `firestore.rules`
- Add `users` collection rules:
- Read: Only authenticated users can read their own user document
- Admins can read all user documents
- Write: Only admins can create/update user documents
- Update `visits` collection rules:
- Admins can read all visits
- Admins can update/delete any visit
- Normal users keep existing permissions (own visits only)

### 9. Navigation Updates

- **File**: `src/components/layout/AppHeader.tsx`
- Add admin menu item/link to dashboard (only visible to admins)
- Show login link if not admin, logout if admin

### 10. App Initialization

- **File**: `src/main.tsx`
- Keep anonymous auth initialization
- Don't auto-sign-in email/password users

## Technical Notes

- Anonymous users continue to work as before (can create/edit/delete own visits)
- Admin users authenticate via email/password through Firebase Auth
- User role stored in Firestore `users` collection, linked to Firebase Auth UID
- Password is handled by Firebase Auth (not stored in Firestore)
- Admin routes protected at component level using `useRequireAdmin` hook
- Firestore rules enforce role-based access at database level

### To-dos

- [ ] Create user type definitions (UserRole, User interface) in src/types/user.ts
- [ ] Create Firestore users collection utilities in src/firebase/usersCollection.ts
- [ ] Add email/password sign in and sign out functions to src/firebaseClient.ts
- [ ] Update useAuth hook to support both auth types and expose isAdmin and signOut
- [ ] Create useUserRole hook to fetch user role from Firestore
- [ ] Create useRequireAdmin hook for protecting admin routes
- [ ] Create LoginForm component for admin authentication
- [ ] Create Dashboard component with statistics and settings
- [ ] Create /login route page
- [ ] Create /dashboard route page with admin protection
- [ ] Update Firestore security rules for users collection and admin visit permissions
- [ ] Add admin navigation links to AppHeader component