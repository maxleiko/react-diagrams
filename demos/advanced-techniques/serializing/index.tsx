import * as React from 'react';
import { DiagramEngine, DiagramWidget, DefaultDiagramModel } from '@leiko/react-diagrams';
import { DemoWorkspace } from '../../DemoWorkspace';
const modelJson = require('./model.json');

export default () => {
  const model = new DefaultDiagramModel();
  const engine = new DiagramEngine(model);
  engine.installDefaultFactories();

  // load model from JSON model
  model.fromJSON(modelJson, engine);

  const serialize = () => {
    // stringify then parse (in order to have a good view in console without MobX typings)
    console.log(JSON.parse(JSON.stringify(model)));
  };
  const deserialize = () => {
    // load default model
    const newModel = new DefaultDiagramModel();
    newModel.fromJSON(modelJson, engine);
    engine.model = newModel;
  };

  const Header = () => (
    <div>
      <button onClick={serialize}>Serialize</button>
      <button onClick={deserialize}>Deserialize</button>
    </div>
  );

  return (
    <DemoWorkspace header={<Header />}>
      <DiagramWidget engine={engine} />
    </DemoWorkspace>
  );
};
