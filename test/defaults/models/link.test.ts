import { DefaultNodeModel, DefaultLinkModel, DefaultPortModel } from '../../../src';

describe('DefaultLinkModel', () => {
  describe('port.link(otherPort)', () => {
    it('sets link.sourcePort & link.targetPort to port & otherPort respectively', () => {
      const sender = new DefaultNodeModel();
      const output = sender.addOutPort('out');

      const receiver = new DefaultNodeModel();
      const input = receiver.addInPort('in');

      const link = output.link(input);

      expect(link.sourcePort).toBe(output);
      expect(link.targetPort).toBe(input);
    });

    it('throws error when port.maximumLinks is reached', () => {
      const sender = new DefaultNodeModel();
      const output = new DefaultPortModel(false, 'out', undefined, 1);
      sender.addPort(output);

      const receiver = new DefaultNodeModel();
      const input = receiver.addInPort('in');

      const link0 = output.link(input);
      expect(link0.sourcePort).toBe(output);
      expect(link0.targetPort).toBe(input);

      expect(() => output.link(input)).toThrow('Port "out" cannot have more links (max: 1)');
    });

    it('throws error when otherPort.maximumLinks is reached', () => {
      const sender = new DefaultNodeModel();
      const output = sender.addInPort('in');

      const receiver = new DefaultNodeModel();
      const input = new DefaultPortModel(true, 'in', undefined, 1);
      receiver.addPort(input);

      const link0 = output.link(input);
      expect(link0.sourcePort).toBe(output);
      expect(link0.targetPort).toBe(input);

      expect(() => output.link(input)).toThrow('Port "in" cannot have more links (max: 1)');
    });

    it('adds link to both ports', () => {
      const sender = new DefaultNodeModel();
      const output = sender.addOutPort('out');

      const receiver = new DefaultNodeModel();
      const input = receiver.addInPort('in');

      const link = output.link(input);

      expect(output.links[0]).toBe(link);
      expect(input.links[0]).toBe(link);
    });
  });

  describe('', () => {
    it('throws error when port.maximumLinks is reached', () => {
      const sender = new DefaultNodeModel();
      const output = new DefaultPortModel(false, 'out', undefined, 1);
      sender.addPort(output);

      const receiver = new DefaultNodeModel();
      const input = receiver.addInPort('in');

      const link0 = output.link(input);
      expect(link0.sourcePort).toBe(output);
      expect(link0.targetPort).toBe(input);

      expect(() => output.link(input)).toThrow('Port "out" cannot have more links (max: 1)');
    });
  });
});
