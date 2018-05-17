import { DefaultLinkModel, DefaultPortModel, DefaultNodeModel } from '../../../src';

describe('DefaultNodeModel', () => {
  describe('.delete()', () => {
    it('auto-remove ports', () => {
      const node = new DefaultNodeModel();
      const p0 = node.addInPort('p0');
      const p1 = node.addInPort('p1');
      const p2 = node.addInPort('p2');
      const p3 = node.addOutPort('p3');
      const p4 = node.addOutPort('p4');
      const p5 = node.addOutPort('p5');
      const p6 = node.addOutPort('p6');

      expect(node.portsMap.get(p0.id)).toBe(p0);
      expect(node.portsMap.get(p1.id)).toBe(p1);
      expect(node.portsMap.get(p2.id)).toBe(p2);
      expect(node.portsMap.get(p3.id)).toBe(p3);
      expect(node.portsMap.get(p4.id)).toBe(p4);
      expect(node.portsMap.get(p5.id)).toBe(p5);
      expect(node.portsMap.get(p6.id)).toBe(p6);

      node.delete();

      expect(node.ports.length).toEqual(0);
      expect(p0.parent).toBeNull();
      expect(p1.parent).toBeNull();
      expect(p2.parent).toBeNull();
      expect(p3.parent).toBeNull();
      expect(p4.parent).toBeNull();
      expect(p5.parent).toBeNull();
      expect(p6.parent).toBeNull();
    });
  });
});
