const LIMITS = {
  week: 20,
  month: 30,
  year: 50,
  all: 50,
};

export function buildWordOccurrences(records) {
  const occurrences = new Map();

  records.forEach((record) => {
    const counts = record.words.reduce((map, word) => {
      map.set(word, (map.get(word) ?? 0) + 1);
      return map;
    }, new Map());

    counts.forEach((count, word) => {
      if (!occurrences.has(word)) {
        occurrences.set(word, {
          word,
          totalCount: 0,
          dates: new Map(),
        });
      }

      const occurrence = occurrences.get(word);
      occurrence.totalCount += count;

      if (!occurrence.dates.has(record.date)) {
        occurrence.dates.set(record.date, {
          date: record.date,
          count: 0,
          recordIds: [],
        });
      }

      const dateEntry = occurrence.dates.get(record.date);
      dateEntry.count += count;
      dateEntry.recordIds.push(record.id);
    });
  });

  return [...occurrences.values()]
    .filter((item) => item.totalCount >= 2)
    .map((item) => ({
      ...item,
      dates: [...item.dates.values()].sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .sort(
      (a, b) =>
        b.totalCount - a.totalCount ||
        b.dates.length - a.dates.length ||
        a.word.localeCompare(b.word, "ko"),
    );
}

export function buildGraphData(records, period) {
  const allWords = buildWordOccurrences(records);
  return {
    allWords,
    visibleWords: allWords.slice(0, LIMITS[period]),
    limit: LIMITS[period],
  };
}

export function layoutGraph(words, width, height) {
  if (!words.length) return { nodes: [], edges: [] };

  const centerX = width / 2;
  const centerY = height / 2;
  const shortestSide = Math.min(width, height);
  const nodes = [];
  const edges = [];
  const maxCount = Math.max(...words.map((item) => item.totalCount));
  const ringCounts = [];
  let remaining = words.length;
  let ringIndex = 0;

  while (remaining > 0) {
    const capacity = ringIndex === 0 ? 1 : ringIndex * 8;
    const count = Math.min(capacity, remaining);
    ringCounts.push(count);
    remaining -= count;
    ringIndex += 1;
  }

  const maxGraphRadius = shortestSide * 0.39;
  let wordOffset = 0;

  ringCounts.forEach((itemsInRing, ring) => {
    const ringRadius =
      ring === 0 ? 0 : (ring / Math.max(ringCounts.length - 1, 1)) * maxGraphRadius;

    for (let indexInRing = 0; indexInRing < itemsInRing; indexInRing += 1) {
      const item = words[wordOffset + indexInRing];
      const angle =
        (Math.PI * 2 * indexInRing) / itemsInRing - Math.PI / 2 + ring * 0.18;
      const x = centerX + Math.cos(angle) * ringRadius;
      const y = centerY + Math.sin(angle) * ringRadius;
      const wordRadius = 16 + (item.totalCount / maxCount) * 13;
      const orbitRadius = wordRadius + 18 + Math.min(item.dates.length, 6);
      const wordId = `word-${item.word}`;

      nodes.push({
        id: wordId,
        type: "word",
        x,
        y,
        radius: wordRadius,
        label: item.word,
        occurrence: item,
      });

      item.dates.forEach((date, dateIndex) => {
        const dateAngle =
          angle + (Math.PI * 2 * dateIndex) / Math.max(item.dates.length, 1);
        const dateId = `${wordId}-${date.date}`;
        const dateX = x + Math.cos(dateAngle) * orbitRadius;
        const dateY = y + Math.sin(dateAngle) * orbitRadius;

        nodes.push({
          id: dateId,
          type: "date",
          x: dateX,
          y: dateY,
          radius: 6 + Math.min(date.count, 4),
          label: formatDateLabel(date.date),
          fullLabel: date.date,
        });
        edges.push({
          id: `${wordId}:${dateId}`,
          source: { x, y },
          target: { x: dateX, y: dateY },
        });
      });
    }

    wordOffset += itemsInRing;
  });

  return { nodes, edges };
}

function formatDateLabel(dateString) {
  const [, month, day] = dateString.split("-");
  return `${Number(month)}/${Number(day)}`;
}
