# MIKU Firebase-ready private portal

## Preview
Open `public/index.html` from a local static server. Click **Preview design with demo code** and enter `2323`. This is a UI-only preview, not a real member/admin login. Preview mode does not grant administrator access.

## Firebase setup
1. Create a Firebase project and add a Web App.
2. Paste its config into `public/app.js` (`firebaseConfig`).
3. Enable Authentication → Sign-in method → Email/Password.
4. Create a Firestore database.
5. Install Firebase CLI: `npm install -g firebase-tools`; then `firebase login`.
6. In this folder run `firebase use --add` and select your project.
7. Deploy backend and rules: `firebase deploy --only functions,firestore:rules`.
8. Deploy site: `firebase deploy --only hosting`.

## First admin
1. Create the owner account in Firebase Console → Authentication → Users.
2. Copy its UID.
3. Create a service-account key in Project settings → Service accounts; store it OUTSIDE this project.
4. Set `GOOGLE_APPLICATION_CREDENTIALS` to that key path.
5. From this project folder run `npm install`, then `node scripts/set-admin.js YOUR_UID`.
6. Sign out and back in. The Admin tab checks the Firebase custom claim `admin:true`. Regular users cannot grant themselves admin from the browser.

## Features
- Member login by User ID and password; server maps IDs to Firebase Auth email aliases.
- Admin creates member accounts, lists users, bans/unbans, and resets passwords.
- First successful login starts a 30-day membership. Expired/banned accounts are denied.
- Passwords are held by Firebase Authentication, never stored as plaintext in Firestore.
- Admin actions are callable Cloud Functions with custom-claim checks.
- Firestore client writes are denied by security rules.
- BigBasket panel is a visual demo and opens the official BigBasket site only after enabling the button. No virus, device scan, or security bypass runs.

## Before production
- Set `PREVIEW_MODE=false` in `public/app.js`.
- Replace `CONTACT_ADMIN_URL` with your support address/contact link.
- Keep the `LOGIN_EMAIL_DOMAIN` constant identical in `public/app.js` and `functions/index.js`.
- Enable Firebase App Check, review auth quotas, and monitor billing.
- Never commit service-account keys, passwords, or private credentials to GitHub.
- Firebase Hosting serves `public`; GitHub Pages only serves static frontend and will not deploy Cloud Functions.
