import * as React from 'react';
import { observer } from 'mobx-react';
import { DiagramEngine, DiagramModel, DefaultNodeModel, DiagramWidget, DefaultPointModel } from 'storm-react-diagrams';

import { DemoWorkspace } from '../../DemoWorkspace';

interface CheckBoxProps {
  id: string;
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default () => {
  // 1) setup the diagram engine
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  const model = new DiagramModel();
  // lock model by default
  model.locked = true;

  // sample for link with simple line (no additional points)
  const node1 = new DefaultNodeModel('Node 1', 'rgb(0,192,255)');
  const port1 = node1.addOutPort('Out');
  node1.setPosition(150, 50);

  const node2 = new DefaultNodeModel('Node 2', 'rgb(192,255,0)');
  const port2 = node2.addInPort('In');
  node2.setPosition(350, 50);

  const link1 = port1.link(port2)!;

  model.addAll(node1, node2, link1);

  // sample for link with complex line (additional points)
  const node3 = new DefaultNodeModel('Node 3', 'rgb(0,192,255)');
  const port3 = node3.addOutPort('Out');
  node3.setPosition(100, 150);

  const node4 = new DefaultNodeModel('Node 4', 'rgb(192,255,0)');
  const port4 = node4.addInPort('In');
  node4.setPosition(400, 150);

  const link2 = port3.link(port4)!;

  link2.addPoint(new DefaultPointModel(350, 225));
  link2.addPoint(new DefaultPointModel(200, 225));

  model.addAll(node3, node4, link2);

  engine.model = model;

  const CheckBox = ({ id, title, checked, onChange }: CheckBoxProps) => (
    <>
      <label htmlFor={id} style={{ paddingLeft: 5, paddingRight: 5 }}>
        {title}
      </label>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginRight: 15 }}
      />
    </>
  );

  const Header = observer(() => (
    <>
      <CheckBox id="model" title="Lock model" checked={model.locked} onChange={(checked) => (model.locked = checked)} />
      <CheckBox
        id="loose-links"
        title="Allow loose links"
        checked={model.allowLooseLinks}
        onChange={(checked) => (model.allowLooseLinks = checked)}
      />
      <CheckBox
        id="canvas-translation"
        title="Allow canvas translation"
        checked={model.allowCanvasTranslation}
        onChange={(checked) => (model.allowCanvasTranslation = checked)}
      />
      <CheckBox
        id="canvas-zoom"
        title="Allow canvas zoom"
        checked={model.allowCanvasZoom}
        onChange={(checked) => (model.allowCanvasZoom = checked)}
      />
      {model.selectedEntities.length === 1 && (
        <CheckBox
          id="selection"
          title="Lock selected element"
          checked={model.selectedEntities[0].locked}
          onChange={(checked) => (model.selectedEntities[0].locked = checked)}
        />
      )}
    </>
  ));

  return (
    <DemoWorkspace header={<Header />}>
      <DiagramWidget engine={engine} />
    </DemoWorkspace>
  );
};
