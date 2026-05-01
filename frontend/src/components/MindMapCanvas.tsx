"use client";

import React, { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface MindMapCanvasProps {
  nodes: Node[];
  edges: Edge[];
}

export default function MindMapCanvas({
  nodes: initialNodes,
  edges: initialEdges,
}: MindMapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update when new data arrives
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div
      id="mind-map-canvas"
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesDraggable={true}
        panOnScroll={true}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(124,58,237,0.08)" gap={24} size={1} />
        <Controls
          style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            overflow: "hidden",
          }}
        />
        <MiniMap
          style={{
            background: "rgba(10,10,18,0.85)",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          nodeColor="rgba(124,58,237,0.5)"
          maskColor="rgba(10,10,18,0.7)"
        />
      </ReactFlow>
    </div>
  );
}
