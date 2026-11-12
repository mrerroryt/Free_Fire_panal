MIKU PREMIUM PORTAL — FIXED BUILD (ANDROID GUIDE)

IMPORTANT: This ZIP has Firebase Web Config already inserted in public/app.js. The old preview/demo login has been removed from this build.

1. Download this ZIP and extract it in your Android Files app.
2. Open the extracted miku_portal_free_spark folder, then open public.
3. Open your GitHub repository in Chrome and choose Add file > Upload files.
4. Upload ALL THREE files inside public: index.html, styles.css and app.js. Upload them to the repository ROOT (not into another public folder).
5. If GitHub asks to replace existing files, choose replace/commit changes for all three. This is important: the old index.html must be overwritten.
6. GitHub repository > Settings > Pages > Build and deployment: Deploy from a branch, branch main, folder /(root), Save. Wait for deployment.
7. Open the exact Pages URL shown by GitHub Settings > Pages. Do not use a different repository URL.
8. In Chrome, open the Pages URL, tap ⋮ > Settings > Site settings > Storage > Clear (or open the URL in an Incognito tab) so the old page is not cached.
9. Firebase Console > Authentication > Sign-in method: enable Email/Password.
10. Firestore Database > Rules: publish the firestore.rules file included in this ZIP.
11. Owner record must be in collection `admin` (singular), document ID = owner's Firebase Authentication UID, with field role (string) = owner.

LOGIN NOTES
- Admin Login accepts the actual Firebase owner email OR an ID alias. Member Login uses the member ID created by the portal owner.
- The Firebase project in this build is miku-portal. If you use a different Firebase project, replace the config values in public/app.js with that project's Web App config.
- The preview-only demo login has been removed; real Firebase authentication is required.
- The BigBasket panel is a harmless visual animation and opens the official BigBasket website only. It does not run spyware, scan devices, access accounts, or bypass security.
- Member alias emails do not receive password reset emails. Reset passwords manually in Firebase Authentication.
- Never upload service-account JSON, private keys, passwords, or recovery codes to GitHub.
- Designed for Firebase Spark free plan and GitHub Pages.


IMPORTANT - Firebase API key error
The Firebase config values currently embedded in public/app.js match the config pasted by the owner on 2026-11-12. Re-uploading this same key cannot by itself fix auth/api-key-not-valid. If the error continues, the key may be invalid/deleted or restricted in Google Cloud credentials, or it may not belong to this Firebase project. Check Firebase Console > Project settings > General > Your apps and compare the Web app config. In Google Cloud Console > APIs & Services > Credentials, check that the matching API key exists and is not restricted in a way that blocks Identity Toolkit. Also ensure Identity Toolkit API is enabled for this project. These checks do not require upgrading Firebase to Blaze or adding billing. Never share passwords or service-account private keys.
