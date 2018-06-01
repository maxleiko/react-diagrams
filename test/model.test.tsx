import { DefaultDiagramModel, DiagramEngine } from '../src';

const model = require('./fixtures/model.json');

describe('DefaultDiagramModel', () => {
  describe('JSON.parse/stringify', () => {
    it('complete model', () => {
      const modelStr = JSON.stringify(model);
      const dModel = new DefaultDiagramModel();
      const engine = new DiagramEngine(dModel);
      engine.installDefaultFactories();
      dModel.fromJSON(model, engine);
      expect(JSON.parse(JSON.stringify(dModel))).toEqual({
        id: '6d309342-c6e3-425c-bfa7-4785bf13b7fc',
        locked: false,
        type: 'srd-base',
        selected: false,
        parent: null,
        offsetX: 0,
        offsetY: 0,
        zoom: 100,
        gridSize: 0,
        allowCanvasTranslation: true,
        allowCanvasZoom: true,
        allowLooseLinks: false,
        inverseZoom: false,
        smartRouting: false,
        deleteKeys: [46, 8],
        maxNumberPointsPerLink: null,
        links: [
          {
            id: 'b53de09d-9c19-458b-9790-d5f08a96750a',
            locked: false,
            type: 'srd-default-link',
            selected: false,
            parent: '6d309342-c6e3-425c-bfa7-4785bf13b7fc',
            sourcePort: '20ccfb5e-862a-48b9-aa75-ce4d8aa298fb',
            sourcePortParent: 'f248f48b-5c55-44c0-8382-ae89f4464e4b',
            targetPort: 'a7d93811-74d3-4abf-8a1b-bc9c1a528201',
            targetPortParent: '3260f731-7297-4027-997b-cc788a17c990',
            points: [],
            labels: [],
            width: 3,
            color: 'rgb(255, 255, 255, 0.6)',
            curvyness: 50
          }
        ],
        nodes: [
          {
            id: 'f248f48b-5c55-44c0-8382-ae89f4464e4b',
            locked: false,
            type: 'srd-default-node',
            selected: false,
            parent: '6d309342-c6e3-425c-bfa7-4785bf13b7fc',
            x: 100,
            y: 100,
            ports: [
              {
                id: '20ccfb5e-862a-48b9-aa75-ce4d8aa298fb',
                locked: false,
                type: 'srd-default-port',
                selected: false,
                parent: 'f248f48b-5c55-44c0-8382-ae89f4464e4b',
                name: 'Out',
                x: 32,
                y: 25,
                maximumLinks: null,
                links: ['b53de09d-9c19-458b-9790-d5f08a96750a'],
                in: false
              }
            ],
            name: 'Node 1',
            color: 'rgb(0,192,255)'
          },
          {
            id: '3260f731-7297-4027-997b-cc788a17c990',
            locked: false,
            type: 'srd-default-node',
            selected: false,
            parent: '6d309342-c6e3-425c-bfa7-4785bf13b7fc',
            x: 400,
            y: 100,
            ports: [
              {
                id: 'a7d93811-74d3-4abf-8a1b-bc9c1a528201',
                locked: false,
                type: 'srd-default-port',
                selected: false,
                parent: '3260f731-7297-4027-997b-cc788a17c990',
                name: 'In',
                x: 2,
                y: 25,
                maximumLinks: null,
                links: ['b53de09d-9c19-458b-9790-d5f08a96750a'],
                in: true
              }
            ],
            name: 'Node 2',
            color: 'rgb(192,255,0)'
          }
        ]
      });
    });
  });
});
