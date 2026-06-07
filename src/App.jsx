import { useEffect, useMemo, useState } from "react";
import Recorder from "./components/Recorder";
import RecordCard from "./components/RecordCard";
import WordDetail from "./components/WordDetail";
import WordGraph from "./components/WordGraph";
import { buildGraphData } from "./utils/graph";
import { filterRecordsByPeriod } from "./utils/periods";
import {
  deleteRecord as removeStoredRecord,
  getRecords,
  saveRecord,
} from "./utils/storage";

const NAV_ITEMS = [
  { id: "home", label: "기록", icon: "record" },
  { id: "graph", label: "그래프", icon: "graph" },
  { id: "records", label: "보관함", icon: "archive" },
];

const PERIODS = [
  { id: "week", label: "주간" },
  { id: "month", label: "월간" },
  { id: "year", label: "연간" },
  { id: "all", label: "전체" },
];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [records, setRecords] = useState([]);
  const [period, setPeriod] = useState("month");
  const [selectedWord, setSelectedWord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getRecords()
      .then(setRecords)
      .catch((error) => {
        console.error("Failed to load local records.", error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const periodRecords = useMemo(
    () => filterRecordsByPeriod(records, period),
    [records, period],
  );
  const graphData = useMemo(
    () => buildGraphData(periodRecords, period),
    [periodRecords, period],
  );

  useEffect(() => {
    if (
      selectedWord &&
      !graphData.allWords.some((item) => item.word === selectedWord.word)
    ) {
      setSelectedWord(null);
    }
  }, [graphData.allWords, selectedWord]);

  async function addRecord(record) {
    await saveRecord(record);
    setRecords((current) =>
      [record, ...current].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  }

  async function deleteRecord(id) {
    await removeStoredRecord(id);
    setRecords((current) => current.filter((record) => record.id !== id));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand" onClick={() => setScreen("home")}>
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          <span>Voily</span>
        </button>
        <nav aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => (
            <button
              className={screen === item.id ? "active" : ""}
              key={item.id}
              onClick={() => setScreen(item.id)}
            >
              <span className={`nav-icon nav-icon--${item.icon}`} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main>
        {screen === "home" && (
          <div className="page home-page">
            <section className="hero">
              <p className="eyebrow">VOICE, MEMORY, CONNECTION</p>
              <h1>말로 남긴 하루가<br />천천히 연결됩니다.</h1>
              <p>목소리는 이 브라우저 안에만 머물고, 반복된 단어는 작은 별자리로 나타납니다.</p>
            </section>
            <Recorder onSave={addRecord} />
            <section className="recent-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">RECENT</p>
                  <h2>최근 기록</h2>
                </div>
                {records.length > 3 && (
                  <button className="text-button" onClick={() => setScreen("records")}>
                    모두 보기
                  </button>
                )}
              </div>
              <div className="record-list">
                {records.slice(0, 3).map((record) => (
                  <RecordCard key={record.id} record={record} compact />
                ))}
                {!isLoading && records.length === 0 && (
                  <p className="empty-copy">아직 저장된 기록이 없습니다.</p>
                )}
              </div>
            </section>
          </div>
        )}

        {screen === "graph" && (
          <div className="page graph-page">
            <div className="graph-heading">
              <div>
                <p className="eyebrow">WORD CONSTELLATION</p>
                <h1>반복된 말의 연결</h1>
              </div>
              <div className="period-filter" aria-label="기간 선택">
                {PERIODS.map((item) => (
                  <button
                    className={period === item.id ? "active" : ""}
                    key={item.id}
                    onClick={() => setPeriod(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="graph-layout">
              <section className="graph-canvas panel">
                <div className="graph-meta">
                  <span>기록 {periodRecords.length}개</span>
                  <span>반복 단어 {graphData.allWords.length}개</span>
                  {graphData.allWords.length > graphData.limit && (
                    <span>상위 {graphData.limit}개 표시</span>
                  )}
                </div>
                <WordGraph
                  words={graphData.visibleWords}
                  onSelectWord={setSelectedWord}
                  selectedWord={selectedWord?.word}
                />
              </section>
              <WordDetail
                occurrence={selectedWord}
                occurrences={graphData.allWords}
                records={periodRecords}
                onClose={() => setSelectedWord(null)}
                onSelect={setSelectedWord}
              />
            </div>
          </div>
        )}

        {screen === "records" && (
          <div className="page records-page">
            <div className="page-title">
              <p className="eyebrow">ARCHIVE</p>
              <h1>모든 기록</h1>
              <p>이 브라우저에 저장된 {records.length}개의 목소리 기록입니다.</p>
            </div>
            <div className="record-list record-list--full">
              {records.map((record) => (
                <RecordCard
                  key={record.id}
                  record={record}
                  onDelete={deleteRecord}
                />
              ))}
              {!isLoading && records.length === 0 && (
                <p className="empty-copy">아직 저장된 기록이 없습니다.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
