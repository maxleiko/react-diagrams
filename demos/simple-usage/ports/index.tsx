import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  DiagramWidget,
} from 'storm-react-diagrams';
import * as React from 'react';

export default () => {
  // 1) setup the diagram engine
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  // 2) setup the diagram model
  const model = new DiagramModel();

  // 3-A) create a default node
  const emitter = new DefaultNodeModel('Emitter', 'rgb(168,192,255)');
  emitter.addOutPort('text');
  const emitterJson = emitter.addOutPort('json');
  emitter.setPosition(100, 100);

  // 3-B) create a default node
  const proxy = new DefaultNodeModel('Proxy', 'rgb(168,255,192)');
  const proxyIn = proxy.addInPort('in');
  const proxyOut = proxy.addOutPort('out');
  proxy.setPosition(250, 100);

  // 3-C) create another default node
  const receiver = new DefaultNodeModel('Receiver', 'rgb(255,168,0)');
  const receiverJson = receiver.addInPort('json');
  receiver.addInPort('text');
  receiver.setPosition(400, 100);

  // link the ports
  const link0 = emitterJson.link(proxyIn);
  const link1 = proxyOut.link(receiverJson);

  // 4) add the models to the root graph
  model.addAll(emitter, receiver, proxy, link0, link1);

  // 5) load model into engine
  engine.model = model;

  // 6) render the diagram!
  return <DiagramWidget className="srd-demo-canvas" engine={engine} />;
};
