import { useEffect, useState } from "react";

export default function RecordCard({ record, onDelete, compact = false }) {
  const [audioUrl, setAudioUrl] = useState("");

  useEffect(() => {
    if (!record.audioBlob) return undefined;

    const url = URL.createObjectURL(record.audioBlob);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [record.audioBlob]);

  return (
    <article className={`record-card ${compact ? "record-card--compact" : ""}`}>
      <div className="record-card__heading">
        <time dateTime={record.date}>{record.date}</time>
        {onDelete && (
          <button className="text-button danger" onClick={() => onDelete(record.id)}>
            삭제
          </button>
        )}
      </div>
      <p>{record.transcript}</p>
      {!compact && record.words.length > 0 && (
        <div className="word-chips">
          {[...new Set(record.words)].map((word) => (
            <span key={word}>{word}</span>
          ))}
        </div>
      )}
      {!compact && audioUrl && <audio controls src={audioUrl} />}
    </article>
  );
}
