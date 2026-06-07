import { useRef, useState } from "react";
import { extractKoreanWords } from "../utils/words";

function todayString() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Recorder({ onSave }) {
  const [date, setDate] = useState(todayString);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [message, setMessage] = useState("");
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const chunksRef = useRef([]);
  const stopResolveRef = useRef(null);

  async function startRecording() {
    setMessage("");
    setAudioBlob(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        let recordedAudio = null;
        if (chunksRef.current.length > 0) {
          recordedAudio = new Blob(chunksRef.current, { type: recorder.mimeType });
          setAudioBlob(recordedAudio);
        }
        stream.getTracks().forEach((track) => track.stop());
        stopResolveRef.current?.(recordedAudio);
        stopResolveRef.current = null;
      };
      recorder.start();

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "ko-KR";
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.onresult = (event) => {
          let newText = "";
          for (let index = event.resultIndex; index < event.results.length; index += 1) {
            if (event.results[index].isFinal) {
              newText += event.results[index][0].transcript;
            }
          }
          if (newText) {
            setTranscript((current) => `${current}${current ? " " : ""}${newText}`);
          }
        };
        recognition.onerror = () => {
          setMessage("자동 받아쓰기를 사용할 수 없습니다. 직접 내용을 입력해 주세요.");
        };
        recognition.start();
        recognitionRef.current = recognition;
      } else {
        setMessage("이 브라우저는 자동 받아쓰기를 지원하지 않습니다. 직접 입력할 수 있습니다.");
      }

      setIsRecording(true);
    } catch {
      setMessage("마이크를 열 수 없습니다. 권한을 확인하거나 직접 내용을 입력해 주세요.");
    }
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);

    if (mediaRecorderRef.current?.state !== "inactive") {
      return new Promise((resolve) => {
        stopResolveRef.current = resolve;
        mediaRecorderRef.current.stop();
      });
    }

    return Promise.resolve(audioBlob);
  }

  async function save() {
    const cleanTranscript = transcript.trim();
    if (!cleanTranscript) {
      setMessage("저장할 내용을 입력해 주세요.");
      return;
    }

    const savedAudio = isRecording ? await stopRecording() : audioBlob;

    await onSave({
      id: createId(),
      date,
      createdAt: new Date().toISOString(),
      transcript: cleanTranscript,
      words: extractKoreanWords(cleanTranscript),
      ...(savedAudio ? { audioBlob: savedAudio } : {}),
    });

    setTranscript("");
    setAudioBlob(null);
    setMessage("기록을 저장했습니다.");
  }

  return (
    <section className="recorder panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">NEW VOICE NOTE</p>
          <h2>오늘의 목소리를 남겨보세요</h2>
        </div>
        <input
          aria-label="기록 날짜"
          className="date-input"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      <button
        className={`record-button ${isRecording ? "is-recording" : ""}`}
        onClick={isRecording ? stopRecording : startRecording}
      >
        <span className="record-button__visual">
          <span className="record-button__dot" />
        </span>
        <span className="record-button__label">
          <strong>{isRecording ? "녹음 멈추기" : "눌러서 녹음"}</strong>
          <small>{isRecording ? "녹음 내용을 저장할 수 있어요" : "마이크 권한이 필요해요"}</small>
        </span>
      </button>

      <label className="transcript-field">
        <span>받아쓰기</span>
        <textarea
          value={transcript}
          onChange={(event) => setTranscript(event.target.value)}
          placeholder="음성이 글로 나타납니다. 자동 받아쓰기가 안 되면 직접 입력하거나 붙여넣으세요."
          rows={7}
        />
      </label>

      <div className="recorder__footer">
        <p className="status-message">{message}</p>
        <button className="primary-button" onClick={save}>
          기록 저장
        </button>
      </div>
    </section>
  );
}
