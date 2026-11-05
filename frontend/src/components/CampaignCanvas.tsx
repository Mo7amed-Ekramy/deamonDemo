import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Handle,
  MarkerType,
  Panel,
  Position,
  ReactFlow,
  useNodesState,
  useReactFlow,
  useViewport,
} from "@xyflow/react";
import type {
  Edge,
  Node,
  NodeProps,
  ReactFlowInstance,
  Viewport,
  XYPosition,
} from "@xyflow/react";
import {
  ArrowUpRight,
  Calendar,
  Clapperboard,
  Compass,
  Grip,
  LayoutGrid,
  Maximize2,
  Minus,
  Plus,
  Sparkles,
  Type,
} from "lucide-react";
import type { Project } from "../data/workspace";
import "@xyflow/react/dist/style.css";

type CardKind =
  "project" | "strategy" | "copy" | "visual" | "reel" | "schedule" | "learning";
type CardData = {
  kind: CardKind;
  title: string;
  subtitle: string;
  eyebrow: string;
  status: string;
  changed: boolean;
  active: boolean;
  open: (id: string) => void;
};
type CampaignNode = Node<CardData, "campaign">;
interface CanvasSnapshot {
  positions: Record<string, XYPosition>;
  viewport?: Viewport;
  size?: { width: number; height: number };
}
const positions: Record<string, XYPosition> = {
  overview: { x: 0, y: 0 },
  strategy: { x: -350, y: -190 },
  copy: { x: 0, y: -260 },
  visual: { x: 350, y: -170 },
  reel: { x: 350, y: 170 },
  schedule: { x: 0, y: 250 },
  learning: { x: -350, y: 160 },
};
function readSnapshot(key: string): CanvasSnapshot {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    const valid = (p: unknown): p is XYPosition =>
      !!p &&
      typeof p === "object" &&
      Number.isFinite((p as XYPosition).x) &&
      Number.isFinite((p as XYPosition).y);
    const savedPositions = Object.fromEntries(
      Object.entries(value?.positions || {}).filter(
        ([id, p]) => id in positions && valid(p),
      ),
    );
    const v = value?.viewport,
      zoom = value?.viewport?.zoom;
    const size = value?.size;
    return {
      positions: savedPositions as Record<string, XYPosition>,
      ...(valid(v) && Number.isFinite(zoom) && zoom >= 0.2 && zoom <= 1.6
        ? { viewport: { x: v.x, y: v.y, zoom } }
        : {}),
      ...(Number.isFinite(size?.width) &&
      size.width > 0 &&
      Number.isFinite(size?.height) &&
      size.height > 0
        ? { size: { width: size.width, height: size.height } }
        : {}),
    };
  } catch {
    return { positions: {} };
  }
}
const icons = {
  project: Sparkles,
  strategy: Compass,
  copy: Type,
  visual: LayoutGrid,
  reel: Clapperboard,
  schedule: Calendar,
  learning: Sparkles,
};
const Card = memo(function Card({ id, data }: NodeProps<CampaignNode>) {
  const Icon = icons[data.kind];
  return (
    <div
      className={`canvas-card canvas-card-${data.kind} ${data.active ? "is-active" : ""} ${data.changed ? "is-updated" : ""}`}
    >
      {[Position.Left, Position.Right, Position.Top, Position.Bottom].map(
        (p) => (
          <span key={p}>
            <Handle
              id={`in-${p}`}
              type="target"
              position={p}
              isConnectable={false}
            />
            <Handle
              id={`out-${p}`}
              type="source"
              position={p}
              isConnectable={false}
            />
          </span>
        ),
      )}
      <div className="canvas-card-handle">
        <span className="canvas-card-icon">
          <Icon size={17} />
        </span>
        <span className="canvas-card-eyebrow">{data.eyebrow}</span>
        <Grip className="canvas-grip" size={14} aria-label="Drag card" />
      </div>
      <button
        className="canvas-card-content nodrag"
        onClick={() => data.open(id)}
        aria-pressed={data.active}
      >
        {data.kind === "visual" && (
          <div className="canvas-visual-sample">
            <span>MADE FOR YOUR BRAND</span>
            <em>
              A little
              <br />
              possibility.
            </em>
            <span>CREATIVE CONCEPT</span>
          </div>
        )}
        <strong>{data.title}</strong>
        <span className="canvas-card-subtitle">{data.subtitle}</span>
        <span className="canvas-card-bottom">
          <span>{data.status}</span>
          <ArrowUpRight size={14} aria-hidden="true" />
        </span>
      </button>
    </div>
  );
});
const nodeTypes = { campaign: Card };

function CanvasControls({ arrange }: { arrange: () => void }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();
  const duration = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 250;
  return (
    <Panel position="bottom-center" className="campaign-canvas-controls">
      <button
        aria-label="Zoom out"
        onClick={() => void zoomOut({ duration: duration() })}
        title="Zoom out"
      >
        <Minus />
      </button>
      <span className="canvas-zoom" aria-live="polite">
        {Math.round(zoom * 100)}%
      </span>
      <button
        aria-label="Zoom in"
        onClick={() => void zoomIn({ duration: duration() })}
        title="Zoom in"
      >
        <Plus />
      </button>
      <span className="canvas-control-divider" />
      <button
        aria-label="Fit all campaign cards"
        onClick={() =>
          void fitView({ padding: 0.18, maxZoom: 1, duration: duration() })
        }
        title="Fit all cards"
      >
        <Maximize2 />
      </button>
      <button
        aria-label="Arrange campaign cards"
        onClick={arrange}
        title="Arrange cards"
      >
        <LayoutGrid />
      </button>
    </Panel>
  );
}

export function CampaignCanvas({
  project,
  selected,
  onSelect,
}: {
  project: Project;
  selected: string;
  onSelect: (id: string) => void;
}) {
  const key = `daemon.canvas.v1:${project.id}`;
  const [saved] = useState(() => readSnapshot(key));
  const cached = useRef(saved);
  const instance = useRef<ReactFlowInstance<CampaignNode> | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const [small] = useState(
    () => window.matchMedia("(max-width: 700px)").matches,
  );
  const [saveError, setSaveError] = useState(false);
  const latest = project.plan.changes.at(-1);
  const approved = project.plan.approvedVersion === project.plan.version;
  const makeNodes = useCallback((): CampaignNode[] => {
    const definitions: {
      id: string;
      kind: CardKind;
      title: string;
      subtitle: string;
      eyebrow: string;
      status: string;
    }[] = [
      {
        id: "overview",
        kind: "project",
        title: project.name,
        subtitle: project.campaign,
        eyebrow: "YOUR PROJECT",
        status: `Shared plan · v${project.plan.version}`,
      },
      {
        id: "strategy",
        kind: "strategy",
        title: "Campaign strategy",
        subtitle:
          project.id === "morrow-coffee"
            ? "Your everyday autumn ritual"
            : "Your next chapter",
        eyebrow: "THE DIRECTION",
        status: approved ? "Approved" : "Ready to review",
      },
      {
        id: "copy",
        kind: "copy",
        title: "Ad copy",
        subtitle: `3 ${project.plan.language} captions`,
        eyebrow: "THE WORDS",
        status: "Preview ready",
      },
      {
        id: "visual",
        kind: "visual",
        title: "Visual concepts",
        subtitle: "Feed + story",
        eyebrow: "THE LOOK",
        status: "Preview ready",
      },
      ...(project.plan.reel
        ? [
            {
              id: "reel",
              kind: "reel" as const,
              title: "Product reel",
              subtitle: "15s storyboard",
              eyebrow: "THE MOTION",
              status: "Preview ready",
            },
          ]
        : []),
      {
        id: "schedule",
        kind: "schedule",
        title: "Publishing",
        subtitle: `${project.plan.days}-day plan`,
        eyebrow: "THE ROLLOUT",
        status: approved ? "Plan approved" : "Awaiting approval",
      },
      {
        id: "learning",
        kind: "learning",
        title: "Results & learning",
        subtitle: "Insights for your next campaign",
        eyebrow: "WHAT COMES NEXT",
        status: "After the campaign runs",
      },
    ];
    return definitions.map((d) => ({
      id: d.id,
      type: "campaign",
      position: cached.current.positions[d.id] || positions[d.id],
      dragHandle: ".canvas-card-handle",
      deletable: false,
      data: {
        ...d,
        active: d.id === selected,
        changed: latest?.node === d.id,
        open: onSelect,
      },
    }));
  }, [project, selected, latest?.node, approved, onSelect]);
  const [nodes, setNodes, onNodesChange] =
    useNodesState<CampaignNode>(makeNodes());
  useEffect(() => {
    const next = makeNodes();
    setNodes((current) =>
      next.map((n) => ({
        ...n,
        position: current.find((c) => c.id === n.id)?.position || n.position,
      })),
    );
  }, [makeNodes, setNodes]);
  const edges: Edge[] = useMemo(() => {
    const targets = [
      ["strategy", "left", "right"],
      ["copy", "top", "bottom"],
      ["visual", "right", "left"],
      ...(project.plan.reel ? [["reel", "right", "left"]] : []),
      ["schedule", "bottom", "top"],
      ["learning", "left", "right"],
    ];
    return targets.map(([id, from, to]) => ({
      id: `project-${id}`,
      source: "overview",
      target: id,
      sourceHandle: `out-${from}`,
      targetHandle: `in-${to}`,
      type: "default",
      selectable: false,
      focusable: false,
      deletable: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
        color: "var(--canvas-line)",
      },
      style: { stroke: "var(--canvas-line)", strokeWidth: 1.3 },
      className: id === "learning" ? "canvas-future-edge" : undefined,
    }));
  }, [project.plan.reel]);
  function save(viewport?: Viewport) {
    if (!instance.current) return;
    const currentPositions = Object.fromEntries(
      instance.current.getNodes().map((n) => [n.id, n.position]),
    );
    cached.current = {
      positions: { ...cached.current.positions, ...currentPositions },
      viewport: viewport || instance.current.getViewport(),
      size: {
        width: container.current?.clientWidth || innerWidth,
        height: container.current?.clientHeight || innerHeight,
      },
    };
    try {
      localStorage.setItem(key, JSON.stringify(cached.current));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }
  function arrange() {
    cached.current.positions = { ...positions };
    setNodes((current) =>
      current.map((n) => ({ ...n, position: positions[n.id] })),
    );
    requestAnimationFrame(() => {
      void instance.current
        ?.fitView({
          padding: 0.18,
          maxZoom: 1,
          duration: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? 0
            : 300,
        })
        .then(() => save());
    });
  }
  return (
    <div
      className="campaign-canvas"
      ref={container}
      role="region"
      aria-label="Free movement campaign canvas"
    >
      <div className="canvas-heading">
        <span>CAMPAIGN WORKSPACE</span>
        <h2>Everything, connected.</h2>
      </div>
      <ReactFlow<CampaignNode>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={(changes) => {
          onNodesChange(changes);
          if (
            changes.some(
              (change) => change.type === "position" && !change.dragging,
            )
          )
            requestAnimationFrame(() => save());
        }}
        onInit={(flow) => {
          instance.current = flow;
          if (saved.viewport && saved.size && container.current)
            void flow.setViewport({
              ...saved.viewport,
              x:
                saved.viewport.x +
                (container.current.clientWidth - saved.size.width) / 2,
              y:
                saved.viewport.y +
                (container.current.clientHeight - saved.size.height) / 2,
            });
          else if (small) void flow.setCenter(120, 85, { zoom: 0.8 });
        }}
        defaultViewport={saved.viewport || { x: 0, y: 0, zoom: 0.8 }}
        fitView={!saved.viewport && !small}
        fitViewOptions={{ padding: 0.18, maxZoom: 1 }}
        minZoom={0.2}
        maxZoom={1.6}
        panOnScroll
        zoomOnScroll
        zoomActivationKeyCode={["Meta", "Control"]}
        panOnDrag
        zoomOnPinch
        preventScrolling
        nodesConnectable={false}
        edgesReconnectable={false}
        connectOnClick={false}
        deleteKeyCode={null}
        edgesFocusable={false}
        snapToGrid
        snapGrid={[20, 20]}
        onNodeDragStop={() => save()}
        onMoveEnd={(_, viewport) => save(viewport)}
        onPaneClick={() => onSelect("")}
        aria-label="Campaign canvas. Drag the background to move, use the controls to zoom, and drag card headers to arrange."
        proOptions={{ hideAttribution: false }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="var(--dc-border)"
          gap={22}
          size={1}
        />
        <CanvasControls arrange={arrange} />
      </ReactFlow>
      <div className="canvas-hint">
        {saveError
          ? "Layout stays in this tab; browser storage is unavailable."
          : "Drag to explore · Pinch or Ctrl/⌘ + scroll to zoom"}
      </div>
    </div>
  );
}
