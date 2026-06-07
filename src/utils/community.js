import {
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, getAnonymousUser, storage } from "./firebase.js";
import { isFirebaseConfigured } from "./firebaseConfig.js";
import { checkPublicPostSafety } from "./moderation.js";

const COLLECTION_NAME = "publicPosts";
const PERIOD_DAYS = {
  day: 1,
  week: 7,
  month: 31,
  year: 366,
  all: null,
};

function getPeriodStart(period) {
  if (period === "all") return null;
  const date = new Date();
  date.setDate(date.getDate() - PERIOD_DAYS[period] + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isVisibleInPeriod(post, period) {
  const start = getPeriodStart(period);
  if (!start) return true;
  return new Date(post.uploadedAt) >= start;
}

export async function publishRecord(record, visibility) {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase 설정이 필요합니다.");
  }

  const safety = checkPublicPostSafety(record.transcript);
  if (!safety.safe) {
    throw new Error("부적절한 단어가 포함되어 공개 업로드할 수 없습니다.");
  }

  const user = await getAnonymousUser();
  let audioUrl = "";
  let audioPath = "";
  const shouldUploadAudio = visibility === "audio" || visibility === "both";

  if (shouldUploadAudio && !record.audioBlob) {
    throw new Error("음성 공개를 선택하려면 녹음 파일이 있어야 합니다.");
  }

  const postRef = doc(collection(db, COLLECTION_NAME));

  if (shouldUploadAudio) {
    audioPath = `public-audio/${user.uid}/${postRef.id}.webm`;
    const audioRef = ref(storage, audioPath);
    await uploadBytes(audioRef, record.audioBlob, {
      contentType: record.audioBlob.type || "audio/webm",
    });
    audioUrl = await getDownloadURL(audioRef);
  }

  await setDoc(postRef, {
    ownerId: user.uid,
    date: record.date,
    createdAt: record.createdAt,
    uploadedAt: new Date().toISOString(),
    uploadedAtServer: serverTimestamp(),
    visibility,
    transcript: visibility === "text" || visibility === "both" ? record.transcript : "",
    words: visibility === "text" || visibility === "both" ? record.words : [],
    audioUrl,
    audioPath,
    likeCount: 0,
    likedBy: [],
    reportCount: 0,
    reportedBy: [],
  });

  return postRef.id;
}

export async function getPublicPosts(period, sort) {
  if (!isFirebaseConfigured) return [];

  const snapshot = await getDocs(
    query(collection(db, COLLECTION_NAME), orderBy("uploadedAt", "desc"), limit(150)),
  );
  const posts = snapshot.docs
    .map((document) => ({ id: document.id, ...document.data() }))
    .filter((post) => isVisibleInPeriod(post, period))
    .filter((post) => (post.reportCount ?? 0) < 3);

  return posts.sort((a, b) => {
    if (sort === "popular") {
      return (b.likeCount ?? 0) - (a.likeCount ?? 0)
        || b.uploadedAt.localeCompare(a.uploadedAt);
    }
    return b.uploadedAt.localeCompare(a.uploadedAt);
  });
}

export async function likePublicPost(postId) {
  if (!isFirebaseConfigured) throw new Error("Firebase 설정이 필요합니다.");
  const user = await getAnonymousUser();
  const postRef = doc(db, COLLECTION_NAME, postId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(postRef);
    if (!snapshot.exists()) throw new Error("기록을 찾을 수 없습니다.");
    const likedBy = snapshot.data().likedBy ?? [];
    if (likedBy.includes(user.uid)) return false;
    transaction.update(postRef, {
      likedBy: [...likedBy, user.uid],
      likeCount: increment(1),
    });
    return true;
  });
}

export async function reportPublicPost(postId) {
  if (!isFirebaseConfigured) throw new Error("Firebase 설정이 필요합니다.");
  const user = await getAnonymousUser();
  const postRef = doc(db, COLLECTION_NAME, postId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(postRef);
    if (!snapshot.exists()) throw new Error("기록을 찾을 수 없습니다.");
    const reportedBy = snapshot.data().reportedBy ?? [];
    if (reportedBy.includes(user.uid)) return false;
    transaction.update(postRef, {
      reportedBy: [...reportedBy, user.uid],
      reportCount: increment(1),
    });
    return true;
  });
}
