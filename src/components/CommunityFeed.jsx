import { useEffect, useState } from "react";
import { getPublicPosts, likePublicPost, reportPublicPost } from "../utils/community";
import { isFirebaseConfigured } from "../utils/firebaseConfig";

const PERIODS = [
  ["day", "당일"],
  ["week", "이번 주"],
  ["month", "이번 달"],
  ["year", "올해"],
  ["all", "전체"],
];

export default function CommunityFeed() {
  const [period, setPeriod] = useState("day");
  const [sort, setSort] = useState("popular");
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    getPublicPosts(period, sort)
      .then(setPosts)
      .catch((error) => setMessage(error.message));
  }, [period, sort]);

  async function like(postId) {
    const changed = await likePublicPost(postId);
    if (changed) {
      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? { ...post, likeCount: (post.likeCount ?? 0) + 1 }
            : post,
        ),
      );
    }
  }

  async function report(postId) {
    const changed = await reportPublicPost(postId);
    if (changed) setPosts((current) => current.filter((post) => post.id !== postId));
  }

  return (
    <div className="page community-page">
      <div className="page-title">
        <p className="eyebrow">PUBLIC FEED</p>
        <h1>공개 피드</h1>
        <p>다른 사람이 공개로 올린 짧은 목소리와 이야기를 볼 수 있습니다.</p>
      </div>

      {!isFirebaseConfigured && (
        <p className="empty-copy">
          Firebase 설정 후 공개 피드를 사용할 수 있습니다.
        </p>
      )}

      <div className="feed-toolbar">
        <div>
          {PERIODS.map(([value, label]) => (
            <button
              className={period === value ? "active" : ""}
              key={value}
              onClick={() => setPeriod(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div>
          <button
            className={sort === "popular" ? "active" : ""}
            onClick={() => setSort("popular")}
          >
            좋아요순
          </button>
          <button
            className={sort === "latest" ? "active" : ""}
            onClick={() => setSort("latest")}
          >
            최신순
          </button>
        </div>
      </div>

      <div className="public-post-list">
        {posts.map((post) => (
          <article className="public-post panel" key={post.id}>
            <div className="public-post__meta">
              <time>{post.date}</time>
              <span>{post.visibility === "text" ? "텍스트" : post.visibility === "audio" ? "음성" : "텍스트+음성"}</span>
            </div>
            {post.transcript && <p>{post.transcript}</p>}
            {post.audioUrl && <audio controls preload="metadata" src={post.audioUrl} />}
            <div className="public-post__actions">
              <button onClick={() => like(post.id)}>좋아요 {post.likeCount ?? 0}</button>
              <button onClick={() => report(post.id)}>신고</button>
            </div>
          </article>
        ))}
        {isFirebaseConfigured && posts.length === 0 && (
          <p className="empty-copy">아직 공개된 기록이 없습니다.</p>
        )}
      </div>

      {message && <p className="status-message">{message}</p>}
    </div>
  );
}
