# Firebase setup for VOILY public feed

1. Create a Firebase project.
2. Enable Anonymous sign-in in Authentication.
3. Create Firestore Database.
4. Enable Firebase Storage.
5. Copy Firebase web app config into Vercel environment variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
6. Publish `firestore.rules` to Firestore rules.
7. Publish `storage.rules` to Storage rules.
8. Redeploy Vercel.

The app keeps private records local. Only records explicitly uploaded from the
preview modal are public, and users choose whether to publish text, audio, or both.

Client-side banned-word checks are included before upload. For production-grade
moderation, add a Firebase Cloud Function or another server-side moderation step
because client-side checks can be bypassed.
