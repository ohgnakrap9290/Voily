import { useMemo } from "react";
import { layoutGraph } from "../utils/graph";

const WIDTH = 1000;
const HEIGHT = 720;

export default function WordGraph({ words, onSelectWord, selectedWord }) {
  const graph = useMemo(() => layoutGraph(words, WIDTH, HEIGHT), [words]);

  if (!words.length) {
    return (
      <div className="graph-empty">
        <div className="empty-orbit" />
        <h3>아직 반복된 단어가 없어요</h3>
        <p>선택한 기간에 같은 단어가 두 번 이상 나타나면 이곳에 연결됩니다.</p>
      </div>
    );
  }

  return (
    <svg
      className="word-graph"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="반복 단어와 날짜 연결 그래프"
    >
      <g className="graph-edges">
        {graph.edges.map((edge) => (
          <line
            key={edge.id}
            x1={edge.source.x}
            y1={edge.source.y}
            x2={edge.target.x}
            y2={edge.target.y}
          />
        ))}
      </g>
      <g>
        {graph.nodes.map((node) =>
          node.type === "word" ? (
            <g
              className={`graph-node word-node ${
                selectedWord === node.label ? "is-selected" : ""
              }`}
              key={node.id}
              onClick={() => onSelectWord(node.occurrence)}
              role="button"
              tabIndex="0"
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  onSelectWord(node.occurrence);
                }
              }}
            >
              <circle cx={node.x} cy={node.y} r={node.radius} />
              <text x={node.x} y={node.y + node.radius + 18}>
                {node.label}
              </text>
              <title>
                {node.label}: {node.occurrence.totalCount}회
              </title>
            </g>
          ) : (
            <g className="graph-node date-node" key={node.id}>
              <circle cx={node.x} cy={node.y} r={node.radius} />
              <text x={node.x} y={node.y - 13}>
                {node.label}
              </text>
              <title>{node.fullLabel}</title>
            </g>
          ),
        )}
      </g>
    </svg>
  );
}
