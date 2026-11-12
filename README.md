# MIKU Premium Portal — Firebase Spark / GitHub Pages

## Upload to GitHub (Android)
1. Extract this ZIP.
2. Open your repository: https://github.com/mrerroryt/Free_Fire_panal
3. Upload the **contents** of this folder (`index.html`, `styles.css`, `app.js`, and `firestore.rules`) to the repository root. Do not upload an extra nested folder.
4. Commit the changes. GitHub Pages should publish from `main` / root.

## Firebase setup
- Project: `miku-portal`
- Authentication → Sign-in method → Email/Password must be enabled.
- Authentication → Settings → Authorized domains must include `mrerroryt.github.io`.
- Firestore collection `admin`: document ID = owner's Firebase Authentication UID; field `role` (string) = `owner`.
- Firestore → Rules: paste the contents of `firestore.rules` and Publish.

The Firebase web config is already included in `app.js`. Do not upload service-account JSON, private keys, or passwords.

## What's in this build
- Firebase Email/Password member and owner login.
- Browser-local Firebase Auth persistence, so refresh should restore the signed-in session on the same browser.
- Owner can create member IDs, search members, ban and unban.
- 30-day member validity starts at first successful login.
- Live activity count based on authenticated users' last-seen heartbeat (online means activity within the last 2 minutes; it may take up to 45 seconds to refresh).
- Member reviews are stored in Firestore as pending. Owner approves or hides them. Only approved, real member reviews contribute to the verified average and rating distribution chart.
- No invented customer endorsements or fake live-user count are presented as real.
- BigBasket is a visual-only simulation; the official website link is separate. No phone scan, spyware, virus, or security bypass is performed.

## Important notes
- This project uses Firebase Spark-compatible client SDK features; it does not use Cloud Functions, Firebase Admin SDK, or paid Google Cloud services.
- Owner-created member accounts use a secondary Firebase Auth app instance so the owner stays signed in.
- Member aliases use `@members.mikuportal.com`; password reset emails are not configured. Reset/reissue passwords manually from Firebase Authentication.
- Firestore rules are essential. Publish the included rules before testing presence/reviews.
- The browser calculates the 30-day expiry. This is a starter portal, not a high-assurance paid-membership or billing system.
