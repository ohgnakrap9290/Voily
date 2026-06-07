export default function WordDetail({
  occurrence,
  occurrences,
  records,
  onClose,
  onSelect,
}) {
  if (!occurrence) {
    return (
      <aside className="detail-panel panel detail-panel--empty">
        <p className="eyebrow">WORD DETAIL</p>
        <h3>{occurrences.length ? "반복된 단어" : "단어를 선택하세요"}</h3>
        {occurrences.length ? (
          <div className="all-word-list">
            {occurrences.map((item) => (
              <button key={item.word} onClick={() => onSelect(item)}>
                <span>{item.word}</span>
                <small>{item.totalCount}회</small>
              </button>
            ))}
          </div>
        ) : (
          <p>같은 단어가 두 번 이상 나타나면 날짜별 횟수와 관련 기록을 볼 수 있습니다.</p>
        )}
      </aside>
    );
  }

  const recordIds = new Set(
    occurrence.dates.flatMap((dateEntry) => dateEntry.recordIds),
  );
  const relatedRecords = records.filter((record) => recordIds.has(record.id));

  return (
    <aside className="detail-panel panel">
      <button className="detail-panel__close" onClick={onClose} aria-label="닫기">
        ×
      </button>
      <p className="eyebrow">WORD DETAIL</p>
      <h2>{occurrence.word}</h2>
      <p className="detail-total">
        선택한 기간에 <strong>{occurrence.totalCount}회</strong>
      </p>

      <div className="detail-section">
        <h3>나타난 날짜</h3>
        <ul className="date-count-list">
          {occurrence.dates.map((date) => (
            <li key={date.date}>
              <time>{date.date}</time>
              <span>{date.count}회</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="detail-section">
        <h3>관련 기록</h3>
        <div className="detail-records">
          {relatedRecords.map((record) => (
            <article key={record.id}>
              <time>{record.date}</time>
              <p>{record.transcript}</p>
            </article>
          ))}
        </div>
      </div>
    </aside>
  );
}
