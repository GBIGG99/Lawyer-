import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { DocumentAnalysisResult, MultiDocumentAnalysisResult } from '../types';
import { FileText, User, AlertTriangle, HelpCircle, ZoomIn, ZoomOut, RotateCcw, Filter, Tag, BookOpen, Layers } from 'lucide-react';

interface CrossDossierGraphProps {
  files: DocumentAnalysisResult[];
  multiDocResult?: MultiDocumentAnalysisResult | null;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'dossier' | 'entity' | 'argument' | 'discrepancy';
  detail?: string;
  category?: string; // entity sub-type (witness, judge, etc.)
  connectionsCount?: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  type: 'dossier-entity' | 'dossier-argument' | 'discrepancy-dossier' | 'argument-entity';
}

export default function CrossDossierGraph({ files, multiDocResult }: CrossDossierGraphProps): React.JSX.Element {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  
  // Filtering states
  const [showDossiers, setShowDossiers] = useState(true);
  const [showEntities, setShowEntities] = useState(true);
  const [showArguments, setShowArguments] = useState(true);
  const [showDiscrepancies, setShowDiscrepancies] = useState(true);
  const [highlightSharedOnly, setHighlightSharedOnly] = useState(false);

  // Generate Graph Data
  const { nodes, links } = useMemo(() => {
    const rawNodes: GraphNode[] = [];
    const rawLinks: GraphLink[] = [];

    // 1. Map Dossiers
    files.forEach(f => {
      const docId = f.id || f.fileName;
      rawNodes.push({
        id: docId,
        label: f.fileName,
        type: 'dossier',
        detail: f.strategicSummary || 'Dossier uploaded and parsed in active defense session.'
      });

      // 2. Map Key Arguments for each Dossier
      (f.keyArguments || []).forEach((arg, idx) => {
        const argId = `${docId}-arg-${idx}`;
        rawNodes.push({
          id: argId,
          label: arg.length > 45 ? arg.substring(0, 45) + '...' : arg,
          type: 'argument',
          detail: arg
        });
        
        rawLinks.push({
          source: docId,
          target: argId,
          type: 'dossier-argument'
        });
      });

      // 3. Map Identified Entities
      (f.identifiedEntities || []).forEach(ent => {
        const entId = `ent-${ent.value.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        
        // Find or create entity node
        let existingNode = rawNodes.find(n => n.id === entId);
        if (!existingNode) {
          existingNode = {
            id: entId,
            label: ent.value,
            type: 'entity',
            category: ent.type,
            detail: `Identified evidentiary target [${ent.type.toUpperCase()}] critical to defense architecture.`
          };
          rawNodes.push(existingNode);
        }

        rawLinks.push({
          source: docId,
          target: entId,
          type: 'dossier-entity'
        });
      });
    });

    // 4. Map Cross-Document Discrepancies if available
    if (multiDocResult && multiDocResult.crossDocumentDiscrepancies) {
      multiDocResult.crossDocumentDiscrepancies.forEach((disc, idx) => {
        const discId = `disc-${idx}`;
        rawNodes.push({
          id: discId,
          label: disc.topic,
          type: 'discrepancy',
          detail: disc.details
        });

        (disc.filesInvolved || []).forEach(fileName => {
          const matchingFile = files.find(f => f.fileName === fileName);
          const dossierId = matchingFile ? (matchingFile.id || matchingFile.fileName) : fileName;
          
          if (!rawNodes.some(n => n.id === dossierId)) {
            rawNodes.push({
              id: dossierId,
              label: fileName,
              type: 'dossier'
            });
          }

          rawLinks.push({
            source: discId,
            target: dossierId,
            type: 'discrepancy-dossier'
          });
        });
      });
    }

    // 5. Connect Arguments to Entities semantically (if argument text mentions entity label)
    rawNodes.filter(n => n.type === 'argument').forEach(argNode => {
      rawNodes.filter(n => n.type === 'entity').forEach(entNode => {
        if (argNode.detail && argNode.detail.toLowerCase().includes(entNode.label.toLowerCase())) {
          rawLinks.push({
            source: argNode.id,
            target: entNode.id,
            type: 'argument-entity'
          });
        }
      });
    });

    // 6. Calculate connections count for each node (for sizing & filtering)
    rawNodes.forEach(node => {
      const connections = rawLinks.filter(l => {
        const srcId = typeof l.source === 'string' ? l.source : (l.source as any).id;
        const tgtId = typeof l.target === 'string' ? l.target : (l.target as any).id;
        return srcId === node.id || tgtId === node.id;
      });
      node.connectionsCount = connections.length;
    });

    return { nodes: rawNodes, links: rawLinks };
  }, [files, multiDocResult]);

  // Filtered nodes and links based on checkboxes
  const filteredData = useMemo(() => {
    // Collect active node types
    const activeTypes = new Set<string>();
    if (showDossiers) activeTypes.add('dossier');
    if (showEntities) activeTypes.add('entity');
    if (showArguments) activeTypes.add('argument');
    if (showDiscrepancies) activeTypes.add('discrepancy');

    // Filter nodes
    let displayNodes = nodes.filter(n => activeTypes.has(n.type));

    // Filter by shared entities if checked (only entities connected to more than 1 dossier, or dossiers themselves)
    if (highlightSharedOnly) {
      const sharedEntityIds = new Set<string>();
      
      // Find entities with links to multiple distinct dossiers
      nodes.filter(n => n.type === 'entity').forEach(ent => {
        const connectedDossiers = new Set<string>();
        links.forEach(l => {
          const sId = typeof l.source === 'string' ? l.source : l.source.id;
          const tId = typeof l.target === 'string' ? l.target : l.target.id;
          
          if (sId === ent.id) {
            const tgtNode = nodes.find(n => n.id === tId);
            if (tgtNode && tgtNode.type === 'dossier') connectedDossiers.add(tId);
          } else if (tId === ent.id) {
            const srcNode = nodes.find(n => n.id === sId);
            if (srcNode && srcNode.type === 'dossier') connectedDossiers.add(sId);
          }
        });

        if (connectedDossiers.size > 1) {
          sharedEntityIds.add(ent.id);
        }
      });

      // Keep dossiers, shared entities, discrepancies, and key arguments directly connected to those
      displayNodes = displayNodes.filter(n => {
        if (n.type === 'dossier' || n.type === 'discrepancy') return true;
        if (n.type === 'entity' && sharedEntityIds.has(n.id)) return true;
        
        // If it's an argument, check if it's connected to a shared entity
        if (n.type === 'argument') {
          return links.some(l => {
            const sId = typeof l.source === 'string' ? l.source : l.source.id;
            const tId = typeof l.target === 'string' ? l.target : l.target.id;
            return (sId === n.id && sharedEntityIds.has(tId)) || (tId === n.id && sharedEntityIds.has(sId));
          });
        }
        return false;
      });
    }

    const activeNodeIds = new Set(displayNodes.map(n => n.id));

    // Filter links
    const displayLinks = links.filter(l => {
      const srcId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const tgtId = typeof l.target === 'string' ? l.target : (l.target as any).id;
      return activeNodeIds.has(srcId) && activeNodeIds.has(tgtId);
    });

    return { nodes: displayNodes.map(n => ({ ...n })), links: displayLinks.map(l => ({ ...l })) };
  }, [nodes, links, showDossiers, showEntities, showArguments, showDiscrepancies, highlightSharedOnly]);

  // SVG Render and Simulation setup using D3
  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 500;
    const svg = d3.select(svgRef.current);
    
    // Clear previous render
    svg.selectAll('*').remove();

    const dataNodes = filteredData.nodes as GraphNode[];
    const dataLinks = filteredData.links as GraphLink[];

    if (dataNodes.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#71717a')
        .attr('font-size', '14px')
        .attr('font-family', 'ui-sans-serif, system-ui')
        .text('No matching active nodes in defense matrix. Modify filters above.');
      return;
    }

    // Create a master group for Zooming
    const g = svg.append('g').attr('class', 'graph-content');

    // Setup Zoom
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);

    // Force Simulation Setup
    const simulation = d3.forceSimulation<GraphNode>(dataNodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(dataLinks)
        .id(d => d.id)
        .distance(d => {
          if (d.type === 'discrepancy-dossier') return 140;
          if (d.type === 'dossier-argument') return 100;
          return 120;
        }))
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(45));

    // Arrowhead markers for visual link directions
    const defs = svg.append('defs');
    
    // Normal connection arrow
    defs.append('marker')
      .attr('id', 'arrow-normal')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#27272a');

    // Warning discrepancy arrow
    defs.append('marker')
      .attr('id', 'arrow-warning')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#f97316');

    // Render Links
    const link = g.append('g')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(dataLinks)
      .join('line')
      .attr('stroke-width', d => {
        if (d.type === 'discrepancy-dossier') return 2;
        if (d.type === 'argument-entity') return 1.5;
        return 1.2;
      })
      .attr('stroke', d => {
        if (d.type === 'discrepancy-dossier') return '#f97316'; // orange discrepancy
        if (d.type === 'dossier-argument') return '#3f3f46'; // slate gray
        if (d.type === 'argument-entity') return '#ef4444'; // red relation
        return '#059669'; // dossier-entity (emerald green)
      })
      .attr('stroke-dasharray', d => {
        if (d.type === 'argument-entity') return '4,4';
        return 'none';
      })
      .attr('marker-end', d => {
        return d.type === 'discrepancy-dossier' ? 'url(#arrow-warning)' : 'url(#arrow-normal)';
      });

    // Render Nodes (Groups)
    const node = g.append('g')
      .selectAll('g')
      .data(dataNodes)
      .join('g')
      .attr('class', 'node-group')
      .style('cursor', 'grab')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
      })
      .on('mouseover', (event, d) => {
        setHoveredNode(d);
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
      });

    // Helper functions for node colors
    const getNodeColor = (type: string, category?: string) => {
      switch (type) {
        case 'dossier': return '#10b981'; // Emerald Green
        case 'discrepancy': return '#f97316'; // Vivid Orange
        case 'argument': return '#ef4444'; // Crimson Red
        case 'entity':
          if (category === 'judge') return '#fbbf24'; // Golden Yellow
          if (category === 'witness') return '#60a5fa'; // Blue
          if (category === 'adversary') return '#a78bfa'; // Purple
          return '#e4e4e7'; // Cool White
        default: return '#71717a';
      }
    };

    // Node circles/shapes
    node.append('circle')
      .attr('r', d => {
        if (d.type === 'dossier') return 18;
        if (d.type === 'discrepancy') return 16;
        if (d.type === 'entity' && d.connectionsCount && d.connectionsCount > 2) return 15;
        return 12;
      })
      .attr('fill', d => getNodeColor(d.type, d.category))
      .attr('stroke', '#09090b')
      .attr('stroke-width', 2.5)
      .attr('shadow-md', 'true');

    // Node icon representations / overlay letter
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .attr('fill', '#09090b')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text(d => {
        if (d.type === 'dossier') return 'D';
        if (d.type === 'discrepancy') return '⚡';
        if (d.type === 'argument') return 'A';
        if (d.type === 'entity') {
          if (d.category === 'judge') return 'J';
          if (d.category === 'witness') return 'W';
          return 'E';
        }
        return '';
      });

    // Node label tags
    node.append('text')
      .attr('dx', d => {
        if (d.type === 'dossier') return 24;
        return 18;
      })
      .attr('dy', '.35em')
      .attr('font-size', '9px')
      .attr('font-weight', d => d.type === 'dossier' ? 'bold' : 'normal')
      .attr('fill', '#e4e4e7')
      .attr('font-family', 'ui-sans-serif, system-ui')
      .text(d => d.label)
      .clone(true).lower()
      .attr('fill', 'none')
      .attr('stroke', '#09090b')
      .attr('stroke-width', 3);

    // Simulation Tick Updates
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // D3 Drag actions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      d3.select(event.sourceEvent.currentTarget).style('cursor', 'grabbing');
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      d3.select(event.sourceEvent.currentTarget).style('cursor', 'grab');
    }

    // Zoom Buttons actions
    window.zoomInMatrix = () => {
      svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.3);
    };

    window.zoomOutMatrix = () => {
      svg.transition().duration(300).call(zoomBehavior.scaleBy, 0.7);
    };

    window.resetZoomMatrix = () => {
      svg.transition().duration(300).call(zoomBehavior.transform, d3.zoomIdentity);
    };

    return () => {
      simulation.stop();
    };
  }, [filteredData]);

  // Clean UI node type descriptors
  const getNodeTypeBadge = (type: string, category?: string) => {
    switch (type) {
      case 'dossier': return <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase rounded-md flex items-center gap-1"><FileText className="w-3 h-3" /> Dossier Hub</span>;
      case 'discrepancy': return <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-black uppercase rounded-md flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Contradiction</span>;
      case 'argument': return <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase rounded-md flex items-center gap-1"><Tag className="w-3 h-3" /> Key Argument</span>;
      case 'entity':
        return <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase rounded-md flex items-center gap-1"><User className="w-3 h-3" /> Entity ({category || 'other'})</span>;
      default: return null;
    }
  };

  return (
    <div className="law-card p-6 border-zinc-800 bg-zinc-950/40 flex flex-col gap-6" id="cross-dossier-visualizer">
      
      {/* Header and Filter HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-emerald-500" />
            <h3 className="etched-label !text-emerald-500">Evidence Link Matrix</h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Cross-Dossier Connections</span>
        </div>
        
        {/* Force options */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[10px] text-zinc-400 font-black uppercase tracking-widest cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={highlightSharedOnly} 
              onChange={() => setHighlightSharedOnly(!highlightSharedOnly)}
              className="accent-emerald-500 w-3.5 h-3.5 border-zinc-800 bg-zinc-950 rounded cursor-pointer"
            />
            Shared Bridging Only
          </label>
          <div className="w-px h-4 bg-zinc-800 hidden sm:block"></div>
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button 
              onClick={() => (window as any).zoomInMatrix?.()}
              className="p-1.5 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => (window as any).zoomOutMatrix?.()}
              className="p-1.5 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => (window as any).resetZoomMatrix?.()}
              className="p-1.5 text-zinc-400 hover:text-white transition-all cursor-pointer border-l border-zinc-800 ml-1 pl-2"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
        
        {/* Interactive Filters & Legend sidebar */}
        <div className="flex flex-col gap-6 bg-zinc-900/30 border border-zinc-800/40 rounded-2xl p-5 lg:col-span-1">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 tracking-wider">
              <Filter className="w-3.5 h-3.5" />
              <span>Visible Nodes</span>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-3 text-xs text-zinc-300 font-medium cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showDossiers} 
                  onChange={() => setShowDossiers(!showDossiers)}
                  className="accent-emerald-500 rounded"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>Dossiers ({nodes.filter(n => n.type === 'dossier').length})</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-zinc-300 font-medium cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showEntities} 
                  onChange={() => setShowEntities(!showEntities)}
                  className="accent-yellow-500 rounded"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
                <span>Entities ({nodes.filter(n => n.type === 'entity').length})</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-zinc-300 font-medium cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showArguments} 
                  onChange={() => setShowArguments(!showArguments)}
                  className="accent-red-500 rounded"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                <span>Key Arguments ({nodes.filter(n => n.type === 'argument').length})</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-zinc-300 font-medium cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showDiscrepancies} 
                  onChange={() => setShowDiscrepancies(!showDiscrepancies)}
                  className="accent-orange-500 rounded"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0"></span>
                <span>Contradictions ({nodes.filter(n => n.type === 'discrepancy').length})</span>
              </label>
            </div>
          </div>

          <div className="border-t border-zinc-800/60 pt-4 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Evidence Legend</span>
            </div>
            <div className="text-[10px] text-zinc-500 space-y-1 font-medium">
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Solid line: Dossier connections</p>
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Highlight line: Contradiction linkages</p>
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 border border-dashed border-red-500 rounded-full"></span> Dashed line: Semantic matches</p>
            </div>
          </div>

          <div className="border-t border-zinc-800/60 pt-4 flex-grow flex flex-col justify-end">
            <p className="text-[10px] text-zinc-600 leading-relaxed italic">
              Drag nodes to rearrange. Scroll or pinch to zoom. Click any node to drill down into corresponding cross-case intelligence details.
            </p>
          </div>
        </div>

        {/* Dynamic D3 Interactive Area */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div 
            ref={containerRef} 
            className="flex-grow bg-[#09090b] border border-zinc-800 rounded-2xl overflow-hidden relative min-h-[400px] h-full"
          >
            {/* HUD scanline and overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]"></div>
            
            <svg 
              ref={svgRef} 
              width="100%" 
              height="100%" 
              viewBox="0 0 800 500" 
              className="w-full h-full select-none"
            />

            {/* Float Tooltip */}
            {hoveredNode && (
              <div className="absolute top-4 right-4 bg-zinc-950/90 border border-zinc-800 rounded-xl p-3 max-w-xs z-30 shadow-2xl backdrop-blur-md animate-in fade-in duration-200">
                <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest block mb-1">Evidentiary Node</span>
                <p className="text-xs font-bold text-white mb-1 truncate">{hoveredNode.label}</p>
                <div className="flex items-center justify-between gap-4 mt-2">
                  <span className="text-[9px] text-zinc-500">{hoveredNode.connectionsCount || 0} link(s)</span>
                  <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[8px] text-zinc-400 font-bold uppercase rounded">{hoveredNode.type}</span>
                </div>
              </div>
            )}
          </div>

          {/* Drill-down Detail Drawer */}
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-2xl p-5 min-h-[100px] flex items-center justify-center">
            {selectedNode ? (
              <div className="w-full space-y-3 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">{selectedNode.label}</h4>
                    {getNodeTypeBadge(selectedNode.type, selectedNode.category)}
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase">UID: {selectedNode.id.substring(0, 10)}</span>
                </div>
                <div className="p-3 bg-zinc-950/50 border border-zinc-900 rounded-xl">
                  <p className="text-xs text-zinc-400 leading-relaxed italic">
                    "{selectedNode.detail || 'No auxiliary strategic insights specified for this evidentiary coordinate.'}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2 opacity-50">
                <HelpCircle className="w-5 h-5 text-zinc-600 mx-auto animate-pulse" />
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">
                  Select a coordinate in the Link Matrix above to drill down.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

// Global declaration for TypeScript zoom actions window methods
declare global {
  interface Window {
    zoomInMatrix?: () => void;
    zoomOutMatrix?: () => void;
    resetZoomMatrix?: () => void;
  }
}
