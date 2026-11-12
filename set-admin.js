// Run locally; NEVER commit service-account credentials to GitHub.
// GOOGLE_APPLICATION_CREDENTIALS must point to a service-account JSON outside this repo.
// Usage: node scripts/set-admin.js FIREBASE_AUTH_UID
const {initializeApp,applicationDefault}=require("firebase-admin/app");
const {getAuth}=require("firebase-admin/auth");
const uid=process.argv[2];if(!uid){console.error("Usage: node scripts/set-admin.js FIREBASE_AUTH_UID");process.exit(1);}
initializeApp({credential:applicationDefault()});
getAuth().setCustomUserClaims(uid,{admin:true}).then(()=>{console.log("Admin role granted. Sign out and back in.");process.exit(0);}).catch(e=>{console.error(e);process.exit(1);});
