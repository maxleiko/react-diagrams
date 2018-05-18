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
      const output = new DefaultPortModel(false, 'out', 1);
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
      const input = new DefaultPortModel(true, 'in', 1);
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

  it('links are cleared when a middle node is deleted', () => {
    const sender = new DefaultNodeModel();
    const senderOut = sender.addOutPort('out');

    const proxy = new DefaultNodeModel();
    const proxyIn = proxy.addInPort('in');
    const proxyOut = proxy.addOutPort('out');

    const receiver = new DefaultNodeModel();
    const receiverIn = receiver.addInPort('in');

    const leftLink = senderOut.link(proxyIn);
    const rightLink = proxyOut.link(receiverIn);

    expect(sender.ports[0].links[0]).toBe(leftLink);
    expect(proxy.portsMap.get(proxyIn.id).links[0]).toBe(leftLink);
    expect(proxy.portsMap.get(proxyOut.id).links[0]).toBe(rightLink);
    expect(receiver.ports[0].links[0]).toBe(rightLink);

    proxy.delete();

    expect(sender.ports[0].links.length).toEqual(0);
    expect(receiver.ports[0].links.length).toEqual(0);
  });
});
