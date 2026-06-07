import { useMemo, useRef, useState } from "react";
import { layoutGraph } from "../utils/graph";

const WIDTH = 1000;
const HEIGHT = 720;
const MIN_SCALE = 0.7;
const MAX_SCALE = 3.5;

function clampScale(scale) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

export default function WordGraph({ words, onSelectWord, selectedWord }) {
  const graph = useMemo(() => layoutGraph(words, WIDTH, HEIGHT), [words]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const pointersRef = useRef(new Map());
  const gestureRef = useRef(null);

  function clientToGraphDelta(deltaX, deltaY, element) {
    const bounds = element.getBoundingClientRect();
    return {
      x: deltaX * (WIDTH / bounds.width),
      y: deltaY * (HEIGHT / bounds.height),
    };
  }

  function handlePointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const pointers = [...pointersRef.current.values()];
    if (pointers.length === 1) {
      gestureRef.current = {
        type: "pan",
        start: pointers[0],
        viewport,
      };
    } else if (pointers.length === 2) {
      gestureRef.current = {
        type: "pinch",
        distance: Math.hypot(
          pointers[1].x - pointers[0].x,
          pointers[1].y - pointers[0].y,
        ),
        scale: viewport.scale,
      };
    }
  }

  function handlePointerMove(event) {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const pointers = [...pointersRef.current.values()];
    const gesture = gestureRef.current;

    if (pointers.length === 1 && gesture?.type === "pan") {
      const delta = clientToGraphDelta(
        pointers[0].x - gesture.start.x,
        pointers[0].y - gesture.start.y,
        event.currentTarget,
      );
      setViewport({
        ...gesture.viewport,
        x: gesture.viewport.x + delta.x,
        y: gesture.viewport.y + delta.y,
      });
    } else if (pointers.length === 2) {
      const distance = Math.hypot(
        pointers[1].x - pointers[0].x,
        pointers[1].y - pointers[0].y,
      );
      if (gesture?.type !== "pinch") {
        gestureRef.current = { type: "pinch", distance, scale: viewport.scale };
        return;
      }
      setViewport((current) => ({
        ...current,
        scale: clampScale(gesture.scale * (distance / gesture.distance)),
      }));
    }
  }

  function handlePointerEnd(event) {
    pointersRef.current.delete(event.pointerId);
    const pointers = [...pointersRef.current.values()];
    gestureRef.current = pointers.length === 1
      ? { type: "pan", start: pointers[0], viewport }
      : null;
  }

  function zoomBy(amount) {
    setViewport((current) => ({
      ...current,
      scale: clampScale(current.scale + amount),
    }));
  }

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
    <div className="graph-interaction">
      <div className="graph-controls" aria-label="그래프 확대 축소">
        <button onClick={() => zoomBy(-0.3)} aria-label="축소">−</button>
        <button
          className="graph-reset"
          onClick={() => setViewport({ x: 0, y: 0, scale: 1 })}
        >
          초기화
        </button>
        <button onClick={() => zoomBy(0.3)} aria-label="확대">+</button>
      </div>
      <svg
        className="word-graph"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="반복 단어와 날짜 연결 그래프"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onWheel={(event) => {
          event.preventDefault();
          zoomBy(event.deltaY > 0 ? -0.15 : 0.15);
        }}
      >
        <g
          transform={`translate(${viewport.x} ${viewport.y}) translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${viewport.scale}) translate(${-WIDTH / 2} ${-HEIGHT / 2})`}
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
        </g>
      </svg>
    </div>
  );
}
