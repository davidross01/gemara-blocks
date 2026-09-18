import { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import { Map as MapIcon, X, Maximize2, Minimize2 } from "lucide-react";
import type { AnalyzedSegment, SugyaTree } from "@/lib/segmentation/types";
import { CATEGORIES } from "@/lib/categories";
import { MECHANISM_LABELS, MOVE_TYPE_LABELS } from "@/lib/segmentation/labels";
import { useViewerStore } from "@/stores/viewerStore";

function SegmentNode({ data }: { data: { segment: AnalyzedSegment; active: boolean } }) {
  const seg = data.segment;
  const meta = CATEGORIES[seg.category];
  const Icon = meta.icon;
  const conf = Math.round(seg.combinedConfidence * 100);
  const provisional = Boolean(seg.provisional);
  const fatal = seg.severity === "fatal";
  // Provisional claims (hava-amina lineage) get a dashed outline so the
  // reader can see at a glance which nodes are "only tentatively true".
  const borderStyle = provisional ? "dashed" : "solid";
  return (
    <div
      data-cat={seg.category}
      data-active={data.active ? "true" : "false"}
      data-provisional={provisional ? "true" : "false"}
      className="flow-node rounded-xl border bg-card px-3 py-2 text-left shadow-sm transition"
      style={{
        minWidth: 180,
        maxWidth: 220,
        borderColor: data.active ? meta.hex : `color-mix(in oklab, ${meta.hex} 35%, var(--rule))`,
        borderStyle,
        borderWidth: fatal ? 2 : 1,
        boxShadow: data.active ? `0 0 0 3px color-mix(in oklab, ${meta.hex} 25%, transparent)` : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: meta.hex }} />
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide" style={{ color: meta.hex }}>
        <Icon className="h-3 w-3" />
        <span className="cb-label">{meta.label}</span>
        <span className="ml-auto text-ink-soft">{conf}%</span>
      </div>
      {(seg.moveType || seg.mechanism || provisional || fatal || seg.unresolved) && (
        <div className="mt-1 flex flex-wrap items-center gap-1 text-[9px] leading-none text-ink-soft">
          {seg.moveType && seg.moveType !== "memra" && (
            <span className="cb-label rounded-sm bg-paper-soft px-1 py-0.5">
              {MOVE_TYPE_LABELS[seg.moveType]}
            </span>
          )}
          {seg.mechanism && (
            <span className="cb-label rounded-sm bg-paper-soft px-1 py-0.5 italic">
              {MECHANISM_LABELS[seg.mechanism]}
            </span>
          )}
          {provisional && (
            <span className="cb-label rounded-sm px-1 py-0.5" style={{ color: "var(--c-difficulty)" }}>
              provisional
            </span>
          )}
          {fatal && (
            <span className="cb-label rounded-sm px-1 py-0.5" style={{ color: "var(--c-refutation)" }}>
              fatal
            </span>
          )}
          {seg.unresolved && (
            <span className="cb-label rounded-sm px-1 py-0.5" style={{ color: "var(--c-inquiry)" }}>
              teiku
            </span>
          )}
        </div>
      )}
      <div
        className="font-hebrew mt-1 text-right text-[13px] leading-snug text-ink line-clamp-2"
        dir="rtl"
        style={{ unicodeBidi: "isolate" }}
      >
        <bdi className="cb-label">{seg.hebrew.slice(0, 60)}</bdi>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: meta.hex }} />
    </div>
  );
}

const nodeTypes = { segment: SegmentNode };

function Inner({ tree, fullscreen, onToggleFullscreen }: { tree: SugyaTree; fullscreen: boolean; onToggleFullscreen: () => void }) {
  const active = useViewerStore((s) => s.activeBlockId);
  const setActive = useViewerStore((s) => s.setActive);
  const rf = useReactFlow();
  const [showMiniMap, setShowMiniMap] = useState(false);

  const { nodes, edges } = useMemo(() => {
    // Layout: column per level, ordered by appearance
    const byLevel: Record<number, AnalyzedSegment[]> = {};
    tree.segments.forEach((s) => {
      (byLevel[s.level] ??= []).push(s);
    });
    const positions: Record<string, { x: number; y: number }> = {};
    Object.entries(byLevel).forEach(([lv, list]) => {
      const y = Number(lv) * 130;
      list.forEach((s, i) => {
        const x = (i - (list.length - 1) / 2) * 260;
        positions[s.id] = { x, y };
      });
    });
    const nodes: Node[] = tree.segments.map((s) => ({
      id: s.id,
      type: "segment",
      position: positions[s.id],
      data: { segment: s, active: active === s.id },
    }));
    const edges: Edge[] = tree.segments
      .filter((s) => s.parentId)
      .map((s) => {
        const parent = tree.byId[s.parentId!];
        const color = CATEGORIES[parent.category].hex;
        return {
          id: `${s.parentId}-${s.id}`,
          source: s.parentId!,
          target: s.id,
          type: "smoothstep",
          animated: active === s.id || active === s.parentId,
          style: { stroke: color, strokeWidth: 2, opacity: 0.7 },
        };
      });
    return { nodes, edges };
  }, [tree, active]);

  useEffect(() => {
    if (!active) return;
    const node = nodes.find((n) => n.id === active);
    if (node) rf.setCenter(node.position.x + 100, node.position.y + 40, { duration: 400, zoom: 1 });
  }, [active, nodes, rf]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      onNodeClick={(_, n) => setActive(n.id)}
      proOptions={{ hideAttribution: true }}
      minZoom={0.3}
      maxZoom={1.5}
    >
      <Background gap={24} color="var(--rule)" />
      <Controls position="bottom-right" showInteractive={false} />
      <button
        type="button"
        onClick={onToggleFullscreen}
        aria-label={fullscreen ? "Exit full screen" : "Open Sugya Flow Full Screen"}
        title={fullscreen ? "Exit Full Screen" : "Open Sugya Flow Full Screen"}
        className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-md border border-rule bg-card px-2 py-1 text-[11px] text-ink-soft shadow-sm hover:text-ink"
      >
        {fullscreen ? (
          <><Minimize2 className="h-3.5 w-3.5" /> Exit Full Screen</>
        ) : (
          <><Maximize2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Expand</span> Sugya Flow</>
        )}
      </button>
      {showMiniMap ? (
        <div className="absolute bottom-3 left-3 z-10 overflow-hidden rounded-md border border-rule bg-card shadow-md">
          <button
            type="button"
            onClick={() => setShowMiniMap(false)}
            aria-label="Hide mini map"
            className="absolute right-1 top-1 z-20 rounded bg-card/90 p-1 text-ink-soft hover:text-ink"
          >
            <X className="h-3 w-3" />
          </button>
          <MiniMap
            pannable
            zoomable
            maskColor="rgba(0,0,0,0.05)"
            position="bottom-left"
            style={{ position: "relative", margin: 0, width: 180, height: 120 }}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowMiniMap(true)}
          aria-label="Show mini map"
          className="absolute bottom-3 left-3 z-10 hidden items-center gap-1.5 rounded-md border border-rule bg-card px-2 py-1 text-[11px] text-ink-soft shadow-sm hover:text-ink sm:flex"
        >
          <MapIcon className="h-3 w-3" /> Mini map
        </button>
      )}
    </ReactFlow>
  );
}

export function FlowMap({ tree }: { tree: SugyaTree }) {
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-paper">
        <ReactFlowProvider>
          <Inner tree={tree} fullscreen onToggleFullscreen={() => setFullscreen(false)} />
        </ReactFlowProvider>
      </div>
    );
  }
  return (
    <ReactFlowProvider>
      <Inner tree={tree} fullscreen={false} onToggleFullscreen={() => setFullscreen(true)} />
    </ReactFlowProvider>
  );
}