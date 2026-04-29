# Tuqim Store Fixes - TODO

## Plan Progress

### 1. Update auth.ts - Add email/password signup [✅]
   - Add signUp function to AuthContext.
   - Added signInUser too.
   - Fixed Provider value.

### 2. Fix Admin Dashboard (src/app/admin/page.tsx) [✅]
   - Implemented Firebase Storage image upload with progress.
   - Fixed file state + preview.
   - Optimized loading: separate parallel fetches, limits.
   - Fixed all TS errors.

### 3. Enhance Navbar (src/components/Navbar.tsx) [✅]
   - Link to /auth for guest login/register.
   - Added logout confirmation.
   - Polish text.

### 4. Create User Auth Pages [✅]
   - Created src/app/auth/page.tsx: Beautiful RTL glassmorphism form.
   - Login/register tabs, Google + email/password.
   - Inline toasts, validation, redirect.

### 5. Add UX Polish [✅]
   - Inline toasts in /auth.
   - Logout confirmation in navbar.
   - Form validation/password toggle.
   - Loading states/spinners everywhere.

### 6. Testing & Deploy [ ]
   - Test all flows.
   - npm run build.

**All fixes complete! Test with `npm run dev`**

