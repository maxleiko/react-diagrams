import { DefaultLinkModel, DefaultPortModel } from '../../../src';

describe('DefaultPortModel', () => {
  describe('.delete()', () => {
    it('auto-remove links from opposite ports', () => {
      const output = new DefaultPortModel(false, 'out');
      const in0 = new DefaultPortModel(true, 'in-0');
      const in1 = new DefaultPortModel(true, 'in-1');
      const in2 = new DefaultPortModel(true, 'in-2');

      const link0 = output.link(in0);
      const link1 = output.link(in1);
      const link2 = output.link(in2);

      output.delete();

      expect(output.links.length).toEqual(0);
    });
  });
});
