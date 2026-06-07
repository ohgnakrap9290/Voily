import { useState } from "react";

export default function PublishModal({ record, onClose, onPublish, isFirebaseReady }) {
  const [visibility, setVisibility] = useState("text");
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!record) return null;

  async function submit() {
    setMessage("");
    setIsSubmitting(true);
    try {
      await onPublish(record, visibility);
      setMessage("공개 피드에 올렸습니다.");
      setTimeout(onClose, 700);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const showsText = visibility === "text" || visibility === "both";
  const showsAudio = visibility === "audio" || visibility === "both";

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="publish-modal panel">
        <button className="modal-close" onClick={onClose} aria-label="닫기">×</button>
        <p className="eyebrow">PUBLIC UPLOAD</p>
        <h2>공개 업로드 미리보기</h2>
        <p className="privacy-copy">
          선택한 내용만 공개됩니다. 개인 이름, 전화번호, 주소, 학교, 회사 등 식별 정보가
          들어간 기록은 올리지 않는 것이 안전합니다.
        </p>

        <div className="visibility-options">
          {[
            ["text", "텍스트만"],
            ["audio", "음성만"],
            ["both", "둘 다"],
          ].map(([value, label]) => (
            <button
              className={visibility === value ? "active" : ""}
              key={value}
              onClick={() => setVisibility(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="publish-preview">
          <time>{record.date}</time>
          {showsText && <p>{record.transcript}</p>}
          {showsAudio && (
            record.audioBlob ? <p className="preview-audio">녹음 파일이 함께 공개됩니다.</p>
              : <p className="warning-copy">이 기록에는 저장된 음성이 없습니다.</p>
          )}
        </div>

        {!isFirebaseReady && (
          <p className="warning-copy">
            Firebase 환경변수를 설정해야 공개 업로드를 사용할 수 있습니다.
          </p>
        )}

        <label className="confirm-row">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
          />
          <span>선택한 내용이 온라인에 공개되는 것을 확인했습니다.</span>
        </label>

        <div className="modal-actions">
          <p className="status-message">{message}</p>
          <button
            className="primary-button"
            disabled={!confirmed || isSubmitting || !isFirebaseReady}
            onClick={submit}
          >
            {isSubmitting ? "업로드 중" : "공개하기"}
          </button>
        </div>
      </section>
    </div>
  );
}
