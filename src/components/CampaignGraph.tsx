'use client';

import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, EventObject } from 'cytoscape';
import {
  GraphElements,
  GraphNodeData,
  GraphEdgeData,
  buildEvidenceGraph,
} from '@/lib/graph-builder';
import { ParsedEmailData, ThreatAnalysis, CampaignDnaResult } from '@/types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle,
  X,
  Network,
  Radio,
  Layers,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CampaignGraphProps {
  email: ParsedEmailData;
  threat: ThreatAnalysis;
  campaign: CampaignDnaResult;
}

export const CampaignGraph: React.FC<CampaignGraphProps> = ({
  email,
  threat,
  campaign,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdgeData | null>(null);
  const [neighbors, setNeighbors] = useState<Array<{ type: string; label: string }>>([]);
  const [layoutMode, setLayoutMode] = useState<'chain' | 'cluster'>('chain');

  useEffect(() => {
    if (!containerRef.current) return;

    const graphData: GraphElements = buildEvidenceGraph(email, threat, campaign);

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...graphData.nodes, ...graphData.edges],
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'font-size': '10px',
            'font-family': 'ui-monospace, monospace',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-wrap': 'wrap',
            color: '#94a3b8',
            'background-color': '#0d1520',
            'border-width': 2,
            'border-color': '#1b2838',
            width: 38,
            height: 38,
          },
        },
        // Campaign Node (Central Hexagon)
        {
          selector: 'node[type = "campaign"]',
          style: {
            'background-color': '#080e16',
            'border-color': '#10b981',
            'border-width': 3,
            width: 58,
            height: 58,
            shape: 'hexagon',
            color: '#34d399',
            'font-weight': 'bold',
            'font-size': '11px',
          },
        },
        // Current Email Node (Active Incident)
        {
          selector: 'node[type = "email"][?isCurrent]',
          style: {
            'background-color': '#e11d48',
            'border-color': '#fb7185',
            'border-width': 3,
            width: 46,
            height: 46,
            shape: 'round-rectangle',
            color: '#fb7185',
            'font-weight': 'bold',
          },
        },
        // Historical Email Node
        {
          selector: 'node[type = "email"][!isCurrent]',
          style: {
            'background-color': '#0d1520',
            'border-color': '#14b8a6',
            shape: 'round-rectangle',
            width: 38,
            height: 38,
            color: '#2dd4bf',
          },
        },
        // Domain Node
        {
          selector: 'node[type = "domain"]',
          style: {
            'background-color': '#0d1520',
            'border-color': '#f59e0b',
            shape: 'ellipse',
            width: 38,
            height: 38,
            color: '#fbbf24',
          },
        },
        // IP Node
        {
          selector: 'node[type = "ip"]',
          style: {
            'background-color': '#0d1520',
            'border-color': '#f43f5e',
            shape: 'diamond',
            width: 38,
            height: 38,
            color: '#fb7185',
          },
        },
        // URL Node
        {
          selector: 'node[type = "url"]',
          style: {
            'background-color': '#0d1520',
            'border-color': '#8b5cf6',
            shape: 'tag',
            width: 34,
            height: 34,
            color: '#c084fc',
          },
        },
        // Edges
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#1b2838',
            'target-arrow-color': '#1b2838',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 0.8,
            opacity: 0.85,
          },
        },
        // Edge Strengths
        {
          selector: 'edge[strength = "HIGH"]',
          style: {
            width: 2.5,
            'line-color': '#10b981',
            'target-arrow-color': '#10b981',
            opacity: 0.95,
          },
        },
        {
          selector: 'edge[strength = "MEDIUM"]',
          style: {
            width: 2,
            'line-color': '#f59e0b',
            'target-arrow-color': '#f59e0b',
            opacity: 0.85,
          },
        },
        {
          selector: 'edge[strength = "LOW"]',
          style: {
            width: 1.5,
            'line-color': '#475569',
            'target-arrow-color': '#475569',
            opacity: 0.65,
          },
        },
        // Selection State
        {
          selector: ':selected',
          style: {
            'border-color': '#34d399',
            'border-width': 4,
            'line-color': '#34d399',
            'target-arrow-color': '#34d399',
          },
        },
      ],
      layout:
        layoutMode === 'chain'
          ? {
              // Follow-the-evidence chain: Email -> Sender/Domain -> URL -> IP -> Incident -> Campaign
              name: 'breadthfirst',
              directed: true,
              roots: graphData.nodes
                .filter((n) => (n.data as GraphNodeData).type === 'email' && (n.data as any).isCurrent)
                .map((n) => (n.data as GraphNodeData).id),
              spacingFactor: 1.15,
              padding: 40,
              fit: true,
              avoidOverlap: true,
            }
          : {
              name: 'cose',
              idealEdgeLength: () => 95,
              nodeOverlap: 25,
              refresh: 20,
              fit: true,
              padding: 40,
              randomize: false,
              componentSpacing: 100,
              nodeRepulsion: () => 400000,
              edgeElasticity: () => 100,
              nestingFactor: 5,
              gravity: 80,
              numIter: 1000,
              initialTemp: 200,
              coolingFactor: 0.95,
              minTemp: 1.0,
            },
    });

    cy.on('tap', 'node', (evt: EventObject) => {
      const node = evt.target;
      setSelectedEdge(null);
      setSelectedNode(node.data() as GraphNodeData);
      setNeighbors(
        node
          .neighborhood('node')
          .map((n: any) => ({ type: String(n.data('type')), label: String(n.data('label')) })),
      );
    });

    cy.on('tap', 'edge', (evt: EventObject) => {
      const edge = evt.target;
      setSelectedNode(null);
      setSelectedEdge(edge.data() as GraphEdgeData);
    });

    cy.on('tap', (evt: EventObject) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        setSelectedEdge(null);
        setNeighbors([]);
      }
    });

    cyRef.current = cy;

    const handleResize = () => {
      if (cyRef.current) {
        cyRef.current.resize();
        cyRef.current.fit(undefined, 30);
      }
    };

    window.addEventListener('resize', handleResize);

    const timer = setTimeout(() => {
      if (cyRef.current) {
        cyRef.current.resize();
        cyRef.current.fit(undefined, 40);
      }
    }, 150);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [email, threat, campaign, layoutMode]);

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.25);
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
    }
  };

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 40);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3.5"
    >
      {/* Top Controls & Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-cyber-panel border border-cyber-border p-3 rounded-xl text-xs font-mono shadow-panel">
        {/* Node Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-cyber-textDim uppercase font-bold text-[10px]">Node Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyber-crimson border border-cyber-crimsonBright" />
            <span className="text-cyber-textPrimary">Current Case</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyber-surface border border-cyber-emerald" />
            <span className="text-cyber-textPrimary">Campaign</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyber-surface border border-cyber-teal" />
            <span className="text-cyber-textPrimary">Historical Case</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyber-surface border border-cyber-amber" />
            <span className="text-cyber-textPrimary">Domain</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rotate-45 bg-cyber-surface border border-cyber-crimson" />
            <span className="text-cyber-textPrimary">IP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyber-surface border border-cyber-violet" />
            <span className="text-cyber-textPrimary">URL</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-md bg-cyber-surface hover:bg-cyber-panelHover text-cyber-textPrimary border border-cyber-border transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-md bg-cyber-surface hover:bg-cyber-panelHover text-cyber-textPrimary border border-cyber-border transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyber-surface hover:bg-cyber-panelHover text-cyber-textPrimary border border-cyber-border transition-colors text-xs font-semibold"
            title="Fit View to Canvas"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyber-emerald" />
            <span>Fit View</span>
          </button>
          <button
            onClick={() => setLayoutMode((m) => (m === 'chain' ? 'cluster' : 'chain'))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyber-surface hover:bg-cyber-panelHover text-cyber-textPrimary border border-cyber-border transition-colors text-xs font-semibold"
            title="Switch between the evidence chain and the infrastructure cluster view"
          >
            <Layers className="w-3.5 h-3.5 text-cyber-emerald" />
            <span>{layoutMode === 'chain' ? 'Evidence Chain' : 'Cluster View'}</span>
          </button>
        </div>
      </div>

      {/* Graph Viewport Canvas */}
      <div className="corner-bracket relative bg-cyber-black/95 border border-cyber-border rounded-xl overflow-hidden h-[540px] shadow-panel">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* In-Canvas Prompt */}
        {!selectedNode && !selectedEdge && (
          <div className="absolute bottom-3 left-3 bg-cyber-panel/90 backdrop-blur-md border border-cyber-border px-3 py-1.5 rounded-md text-[11px] font-mono text-cyber-textSecondary pointer-events-none shadow-panel">
            💡 Click any <strong className="text-cyber-emerald">node</strong> or <strong className="text-cyber-emerald">edge</strong> to inspect correlation evidence
          </div>
        )}

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 w-80 sm:w-96 max-h-[480px] overflow-y-auto bg-cyber-panel/95 backdrop-blur-xl border border-cyber-border rounded-xl p-4 shadow-2xl z-20 font-mono text-xs"
          >
            <div className="flex items-start justify-between gap-2 border-b border-cyber-border/80 pb-2.5 mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyber-emerald tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald" />
                  Node Telemetry · {selectedNode.type}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-cyber-textPrimary mt-0.5 whitespace-pre-wrap font-mono">
                  {selectedNode.label}
                </h4>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 text-cyber-textMuted hover:text-cyber-textPrimary rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {Object.entries(selectedNode.details).map(([key, val]) => (
                <div key={key} className="bg-cyber-surface/90 p-2.5 rounded-md border border-cyber-border">
                  <span className="text-[9px] uppercase text-cyber-textDim block mb-0.5">{key}</span>
                  <span className="text-cyber-textPrimary break-words select-all text-xs">{String(val)}</span>
                </div>
              ))}
            </div>

            {neighbors.length > 0 && (
              <div className="mt-3 pt-3 border-t border-cyber-border/80">
                <span className="text-[10px] uppercase text-cyber-textDim block mb-1.5">
                  Directly connected evidence ({neighbors.length})
                </span>
                <div className="space-y-1">
                  {neighbors.map((n, idx) => (
                    <div
                      key={`${n.type}-${n.label}-${idx}`}
                      className="flex items-start gap-2 bg-cyber-surface/90 border border-cyber-border rounded-md px-2 py-1.5"
                    >
                      <span className="text-[9px] uppercase font-bold text-cyber-emerald shrink-0 w-16">
                        {n.type}
                      </span>
                      <span className="text-[11px] text-cyber-textPrimary break-words">{n.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Selected Edge (Relationship) Details Drawer */}
        {selectedEdge && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 w-80 sm:w-96 max-h-[480px] overflow-y-auto bg-cyber-panel/95 backdrop-blur-xl border border-cyber-emerald/50 rounded-xl p-4 shadow-2xl z-20 font-mono text-xs"
          >
            <div className="flex items-start justify-between gap-2 border-b border-cyber-border/80 pb-2.5 mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyber-emerald tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald" />
                  Relationship Correlation
                </span>
                <h4 className="text-sm font-bold text-cyber-textPrimary mt-0.5">
                  Why are these connected?
                </h4>
              </div>
              <button
                onClick={() => setSelectedEdge(null)}
                className="p-1 text-cyber-textMuted hover:text-cyber-textPrimary rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between bg-cyber-surface/90 p-2.5 rounded-md border border-cyber-border">
                <span className="text-cyber-textDim text-[10px] uppercase">Connection Strength</span>
                <span
                  className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${
                    selectedEdge.strength === 'HIGH'
                      ? 'bg-cyber-crimsonDark/30 text-cyber-crimsonBright border-cyber-crimson/50'
                      : selectedEdge.strength === 'MEDIUM'
                      ? 'bg-cyber-amberDark/30 text-cyber-amberBright border-cyber-amber/50'
                      : 'bg-cyber-surface text-cyber-textMuted border-cyber-border'
                  }`}
                >
                  {selectedEdge.strength}
                </span>
              </div>

              <div className="bg-cyber-surface/90 p-2.5 rounded-md border border-cyber-border">
                <span className="text-[10px] text-cyber-textDim uppercase block mb-0.5">Relationship Type</span>
                <span className="text-cyber-emerald font-bold">{selectedEdge.relationship}</span>
              </div>

              {selectedEdge.evidence && selectedEdge.evidence.length > 0 && (
                <div className="bg-cyber-surface/90 p-2.5 rounded-md border border-cyber-border">
                  <span className="text-[10px] text-cyber-textDim uppercase block mb-1.5">
                    Verifiable Evidence Signals:
                  </span>
                  <div className="space-y-1">
                    {selectedEdge.evidence.map((ev, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-cyber-textPrimary text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5 text-cyber-emerald shrink-0 mt-0.5" />
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-cyber-surface/90 p-2.5 rounded-md border border-cyber-border">
                <span className="text-[10px] text-cyber-textDim uppercase block mb-0.5">Forensic Rationale</span>
                <p className="text-cyber-textSecondary leading-relaxed text-[11px] font-sans">
                  {selectedEdge.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
