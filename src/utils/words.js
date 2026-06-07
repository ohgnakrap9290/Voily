const STOPWORDS = new Set([
  "오늘",
  "그냥",
  "진짜",
  "너무",
  "약간",
  "그리고",
  "근데",
  "나는",
  "내가",
  "나",
  "내",
  "이거",
  "저거",
  "조금",
  "좀",
  "것",
  "수",
  "있다",
  "없다",
  "했다",
  "하는",
  "해서",
  "되다",
  "같다",
  "정말",
  "아무튼",
  "그래서",
  "하지만",
  "그런데",
  "이제",
  "지금",
]);

const PARTICLES = [
  "으로부터",
  "에게서",
  "에서",
  "에게",
  "한테",
  "까지",
  "부터",
  "처럼",
  "보다",
  "으로",
  "라고",
  "이라",
  "는",
  "은",
  "이",
  "가",
  "을",
  "를",
  "과",
  "와",
  "도",
  "에",
  "의",
  "만",
  "로",
];

function normalizeWord(word) {
  let normalized = word;

  for (const particle of PARTICLES) {
    if (normalized.length - particle.length >= 2 && normalized.endsWith(particle)) {
      normalized = normalized.slice(0, -particle.length);
      break;
    }
  }

  return normalized;
}

export function extractKoreanWords(transcript) {
  const tokens = transcript.match(/[가-힣]{2,}/g) ?? [];

  return tokens
    .map(normalizeWord)
    .filter((word) => word.length >= 2 && !STOPWORDS.has(word));
}
