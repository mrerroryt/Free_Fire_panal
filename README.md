# MIKU Premium Portal — Firebase Spark starter

This project is designed to use Firebase Authentication and Cloud Firestore on the no-cost Spark plan. It does not use Cloud Functions or Firebase Admin SDK.

## Firebase configuration
`public/app.js` already contains the Firebase web config supplied for project `miku-portal`.

## Important: owner record
The owner account must already exist in Firebase Authentication. In Firestore, create a document manually:
- Collection: `admin` (singular)
- Document ID: the owner's Firebase Authentication UID
- Field: `role` (string) = `owner`

The Firestore rules deny client writes to `admin` documents. Keep this record owner-controlled.

## Enable Authentication
Firebase Console → Authentication → Sign-in method → Email/Password → Enable.

## Deploy
For Firebase Hosting, use a computer with Node.js and Firebase CLI:
1. `npm install -g firebase-tools`
2. `firebase login`
3. `firebase use --add` and select `miku-portal`
4. `firebase deploy --only firestore:rules,hosting`

If using Android only, you can still edit files in a code editor, but Firebase Hosting deployment is easiest from a computer or a supported cloud development environment. GitHub Pages can host the static frontend, but deploy Firestore rules separately using Firebase CLI.

## Free-plan limitations
- No Cloud Functions in this Spark-only design.
- Member creation is done from the owner dashboard using a secondary Firebase Auth app instance.
- Because member IDs use internal alias addresses rather than real inboxes, password resets must be handled manually from Firebase Authentication (or by creating a new member ID/password); the portal does not pretend to send reset emails.
- Ban status and membership expiry are enforced by the portal UI and Firestore rules for profile access; this is not equivalent to disabling a Firebase Auth account server-side.
- BigBasket panel is a visual demo only. It does not scan, bypass, or modify accounts. The button opens the official BigBasket website.
- Membership starts at first successful login and is set to 30 days. The browser calculates the expiry timestamp; do not use this as a high-assurance billing or access-control system.

## Safety
Never upload service-account JSON files, private keys, or passwords to GitHub. The downloaded service-account JSON is not needed by this Spark-only project.
