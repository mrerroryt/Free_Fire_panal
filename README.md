# MIKU Premium Portal

GitHub Pages + Firebase Authentication + Cloud Firestore member portal.

## Deploy
Upload `index.html`, `styles.css`, and `app.js` to the repository root. Publish `firestore.rules` in Firebase Console > Firestore Database > Rules.

## Firebase setup
- Enable Email/Password in Firebase Authentication.
- Add `mrerroryt.github.io` to Authentication > Settings > Authorized domains.
- In Firestore, create `admin/{OWNER_UID}` with `role: "owner"`.
- Use the existing Firebase Web App config in `app.js`.

## Session persistence
The app explicitly configures `browserLocalPersistence` and restores the signed-in dashboard with `onAuthStateChanged` after reload. The session remains in the same browser profile unless the user logs out or clears site data.

## Design
Cherry blossom effects appear on login only. The dashboard uses a dark emerald/black/champagne-gold theme and decorative floating dollar symbols. No ratings or reviews feature is included. BigBasket is a visual-only simulation, not malware or a device scanner.

## Free tier
The app is designed for Firebase Spark + GitHub Pages. Do not add service-account private keys to client-side files.
