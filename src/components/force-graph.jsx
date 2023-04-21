// @ts-nocheck
import { useState, useCallback, memo } from "react";
import { ForceGraph2D } from "react-force-graph";

const NODE_REL_SIZE = 2;

/**
 * props: {nodes, links, width: number, height: number, setSelectedTaskID: fn}
 */
const ForceGraph = (props) => {
  const [highlightNodeIDs, setHighlightNodeIDs] = useState(new Set());

  const updateHighlight = () => {
    setHighlightNodeIDs(highlightNodeIDs);
  };

  const selectSubtree = (node) => {
    highlightNodeIDs.clear();
    if (node) {
      highlightNodeIDs.add(node.id);
      node.descendentIDs.forEach((descendentID) =>
        highlightNodeIDs.add(descendentID)
      );
    }

    updateHighlight();
  };

  const isLinkHighlighted = useCallback(
    (link) => {
      if (highlightNodeIDs.size == 0) {
        return link.targetNode.type == "ARBITRARY_TASK";
      }
      return (
        highlightNodeIDs.has(link.source.id) ||
        highlightNodeIDs.has(link.target.id)
      );
    },
    [highlightNodeIDs]
  );

  const getColor = (node) => {
    const borderColor = "rgba(255, 255, 255, 1)";
    const mutedBorderColor = "rgba(255, 255, 255, 0.3)";
    let rgb =
      node.status == "success" ? "rgba(119, 240, 101, " : "rgba(84, 132, 227, ";
    if (node.status == "failed") rgb = "rgba(224, 76, 76, ";
    if (node.status == "paused") rgb = "rgba(227, 170, 84, ";
    if (node.parentID == -1) rgb = "rgba(242, 29, 207, ";
    if (highlightNodeIDs.has(node.id)) return [rgb + "1)", borderColor];
    if (highlightNodeIDs.size > 0 && !highlightNodeIDs.has(node.id))
      return [rgb + "0.05)", mutedBorderColor];
    return [rgb + "1)", borderColor];
  };

  const paintNode = useCallback(
    (node, ctx) => {
      const [color, borderColor] = getColor(node);
      const r = NODE_REL_SIZE;

      // circle for base tasks
      if (node.type == "ROOT" || node.type == "ARBITRARY_TASK") {
        ctx.beginPath();
        // innerRadius, outerRadius, startAngle, endAngle
        ctx.arc(node.x, node.y, r * 1.1, 0, 2 * Math.PI, false);
        ctx.fillStyle = borderColor;
        ctx.fill();
        ctx.beginPath();
        // innerRadius, outerRadius, startAngle, endAngle
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
      }

      // triangle for execution tasks
      else if (node.type == "EXECUTE_FUNCTION") {
        const triangleR = r * 1;
        ctx.fillStyle = borderColor;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y - triangleR * 1.1);
        ctx.lineTo(node.x - triangleR * 1.1, node.y + triangleR * 1.1);
        ctx.lineTo(node.x + triangleR * 1.1, node.y + triangleR * 1.1);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y - triangleR);
        ctx.lineTo(node.x - triangleR, node.y + triangleR);
        ctx.lineTo(node.x + triangleR, node.y + triangleR);
        ctx.fill();
      }

      // square for other tasks
      else {
        const squareR = r * 1;
        ctx.fillStyle = borderColor;
        ctx.fillRect(
          node.x - squareR * 1.1,
          node.y - squareR * 1.1,
          squareR * 2 * 1.1,
          squareR * 2 * 1.1
        );
        ctx.fillStyle = color;
        ctx.fillRect(
          node.x - squareR,
          node.y - squareR,
          squareR * 2,
          squareR * 2
        );
      }
    },
    [highlightNodeIDs]
  );

  return (
    <ForceGraph2D
      graphData={{ nodes: props.nodes, links: props.links }}
      dagMode={"radialin"}
      dagLevelDistance={30}
      autoPauseRedraw={true}
      nodeCanvasObject={paintNode}
      nodeId="id"
      nodeLabel="name"
      width={props.width}
      height={props.height}
      nodeRelSize={NODE_REL_SIZE}
      linkDirectionalParticleColor={() => "rgba(252, 254, 255, 0.77)"}
      linkDirectionalParticleSpeed={0.003}
      linkDirectionalParticles={1}
      linkDirectionalParticleWidth={(link) => (isLinkHighlighted(link) ? 3 : 0)}
      linkColor={(link) =>
        link.targetNode.type == "ARBITRARY_TASK" &&
        (highlightNodeIDs.has(link.source) || !highlightNodeIDs.size)
          ? "rgba(252, 254, 255, 0.77)"
          : "rgba(252, 254, 255, 0.3)"
      }
      linkWidth={(link) => (link.targetNode.type == "ARBITRARY_TASK" ? 2 : 1)}
      linkCurvature={0}
      d3AlphaMin={0.01}
      minZoom={0.7}
      maxZoom={10}
      warmupTicks={1000}
      onBackgroundClick={() => {
        selectSubtree(null);
        props.setSelectedTaskID(null);
      }}
      onNodeClick={(node) => {
        selectSubtree(node);
        props.setSelectedTaskID(node.id);
      }}
    />
  );
};

export default memo(ForceGraph, (prevProps, nextProps) => {
  return (
    prevProps.nodes.length == nextProps.nodes.length &&
    prevProps.links.length == nextProps.links.length &&
    (prevProps.nodes.length == 0 ||
      prevProps.nodes[0].id == nextProps.nodes[0].id)
  );
});
