MIKU PORTAL — ANDROID / GITHUB PAGES GUIDE

WHAT'S INCLUDED
- index.html, styles.css, app.js: upload these three files to the ROOT of your GitHub repository.
- firestore.rules: publish these rules in Firebase Console > Firestore Database > Rules.
- Firebase Email/Password Authentication is used; no billing upgrade is required for this code.

UPLOAD FROM ANDROID
1. Download and extract MIKU_PORTAL_REFRESH_FIXED_PREMIUM.zip.
2. Open https://github.com/mrerroryt/Free_Fire_panal
3. Choose Add file > Upload files.
4. Upload index.html, styles.css and app.js directly into the repository ROOT (not inside another folder).
5. Commit changes and wait for GitHub Pages to publish.
6. Open the site, sign in once, then refresh. The signed-in dashboard should restore automatically in the same browser.

FIREBASE CHECK
- Firebase Authentication > Sign-in method: Email/Password must be enabled.
- Firebase Authentication > Settings > Authorized domains: include mrerroryt.github.io.
- Firestore collection `admin`: owner document ID must be the owner's Firebase Auth UID and contain role = "owner" (string).
- Publish firestore.rules in Firestore Database > Rules.
- Keep using the existing Firebase project/config in app.js. Do not paste passwords or service-account keys into public files.

SESSION FIX
This build explicitly sets Firebase browserLocalPersistence and restores the member/owner dashboard with onAuthStateChanged after a page reload. It persists only in the same browser profile; clearing site data, private/incognito mode, or explicitly logging out ends the session.

DESIGN
- Cherry blossom effect is limited to the login page.
- Dashboard uses dark emerald, black and champagne gold with floating dollar-symbol decoration.
- No ratings, reviews, rating page or rating chart are included.
- BigBasket panel is a harmless visual simulation only; it does not scan devices, run malware or access accounts.
