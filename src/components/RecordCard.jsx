import { useEffect, useState } from "react";

export default function RecordCard({
  record,
  onDelete,
  onToggleFavorite,
  onPublish,
  variant = "today",
}) {
  const [audioUrl, setAudioUrl] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!record.audioBlob) return undefined;

    const url = URL.createObjectURL(record.audioBlob);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [record.audioBlob]);

  if (variant === "archive") {
    return (
      <article className={`record-card record-card--archive ${isExpanded ? "is-expanded" : ""}`}>
        <div className="record-card__row">
          <div className="record-card__date">
            <time dateTime={record.date}>{record.date}</time>
            <small>{new Date(record.createdAt).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}</small>
          </div>
          <div className="record-card__actions">
            {audioUrl ? (
              <audio controls preload="metadata" src={audioUrl} />
            ) : (
              <span className="no-audio">음성 없음</span>
            )}
            <button
              className="icon-button publish-button"
              onClick={() => onPublish(record)}
              aria-label="공개 업로드"
            >
              ↑
            </button>
            <button
              className={`icon-button favorite-button ${record.favorite ? "active" : ""}`}
              onClick={() => onToggleFavorite(record)}
              aria-label={record.favorite ? "즐겨찾기 해제" : "즐겨찾기"}
            >
              {record.favorite ? "★" : "☆"}
            </button>
            <button
              className="icon-button more-button"
              onClick={() => setIsExpanded((current) => !current)}
              aria-label={isExpanded ? "내용 닫기" : "내용 보기"}
            >
              ···
            </button>
            <button
              className="icon-button delete-button"
              onClick={() => onDelete(record.id)}
              aria-label="기록 삭제"
            >
              ×
            </button>
          </div>
        </div>
        {isExpanded && (
          <div className="record-card__details">
            <p>{record.transcript}</p>
            {record.words.length > 0 && (
              <div className="word-chips">
                {[...new Set(record.words)].map((word) => (
                  <span key={word}>{word}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </article>
    );
  }

  return (
    <article className="record-card record-card--today">
      <div className="record-card__heading">
        <time dateTime={record.createdAt}>
          {new Date(record.createdAt).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
      <p>{record.transcript}</p>
      {audioUrl && <audio controls preload="metadata" src={audioUrl} />}
    </article>
  );
}
