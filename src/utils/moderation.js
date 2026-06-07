import { extractKoreanWords } from "./words.js";

const BANNED_WORDS = new Set([
  "씨발",
  "시발",
  "ㅅㅂ",
  "병신",
  "개새끼",
  "꺼져",
  "죽어",
  "자살",
  "섹스",
]);

export function checkPublicPostSafety(transcript) {
  const normalizedText = transcript.replace(/\s+/g, "").toLowerCase();
  const extractedWords = extractKoreanWords(transcript);
  const matchedWords = [...BANNED_WORDS].filter(
    (word) => normalizedText.includes(word) || extractedWords.includes(word),
  );

  return {
    safe: matchedWords.length === 0,
    matchedWords,
  };
}
