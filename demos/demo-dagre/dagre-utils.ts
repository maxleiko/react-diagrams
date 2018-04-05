// @ts-ignore
import * as dagre from 'dagre';
import * as _ from 'lodash';

const size = {
  width: 60,
  height: 60
};

export function distributeElements(model: any) {
  const clonedModel = _.cloneDeep(model);
  const nodes = distributeGraph(clonedModel);
  nodes.forEach((node: any) => {
    const modelNode = clonedModel.nodes.find((item: any) => item.id === node.id);
    modelNode.x = node.x;
    modelNode.y = node.y;
  });
  return clonedModel;
}

function distributeGraph(model: any) {
  const nodes = mapElements(model);
  const edges = mapEdges(model);
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({});
  graph.setDefaultEdgeLabel(() => ({}));
  //add elements to dagre graph
  nodes.forEach((node: any) => {
    graph.setNode(node.id, node.metadata);
  });
  edges.forEach((edge: any) => {
    if (edge.from && edge.to) {
      graph.setEdge(edge.from, edge.to);
    }
  });
  //auto-distribute
  dagre.layout(graph);
  return graph.nodes().map((node: any) => graph.node(node));
}

function mapElements(model: any) {
  // dagre compatible format
  return model.nodes.map((node: any) => ({ id: node.id, metadata: { ...size, id: node.id } }));
}

function mapEdges(model: any) {
  // returns links which connects nodes
  // we check are there both from and to nodes in the model. Sometimes links can be detached
  return model.links
    .map((link: any) => ({
      from: link.source,
      to: link.target
    }))
    .filter(
      (item: any) =>
        model.nodes.find((node: any) => node.id === item.from) && model.nodes.find((node: any) => node.id === item.to)
    );
}
