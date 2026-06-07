# VOILY 공개 피드 Firebase 설정

1. Firebase 프로젝트를 만듭니다.
2. Authentication에서 익명 로그인을 활성화합니다.
   - Firebase Console > Authentication > Sign-in method > Anonymous
3. Firestore Database를 만듭니다.
4. Firebase Storage를 활성화합니다.
5. Firebase 웹 앱 설정값을 Vercel 환경변수에 넣습니다.
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
6. `firestore.rules` 내용을 Firestore Rules에 배포합니다.
7. `storage.rules` 내용을 Storage Rules에 배포합니다.
8. Vercel을 다시 배포합니다.

기본 기록은 계속 사용자 기기 안에만 저장됩니다. 사용자가 보관함에서 `공개`
버튼을 누르고 미리보기 모달에서 확인한 기록만 온라인에 올라갑니다. 업로드할 때
사용자는 공개 범위를 직접 선택합니다.

- 텍스트만 공개
- 음성만 공개
- 텍스트와 음성 모두 공개

업로드 전 부적절한 단어 검사는 현재 브라우저에서 먼저 실행됩니다. 다만
브라우저 검사는 우회될 수 있으므로 실제 서비스 수준으로 운영하려면 Firebase
Cloud Functions 같은 서버 검증을 추가해야 합니다.
