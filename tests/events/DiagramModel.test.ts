import { DiagramModel, DefaultNodeModel } from "../../src/main";

describe("DiagramModel Events", () => {

	let model: DiagramModel;

	beforeEach(() => model = new DiagramModel());
	afterEach(() => model.clearListeners());

	test("NodeEvent should fire when new node is added", () => {
		return new Promise((resolve) => {
			model.addListener({
				nodesUpdated: (event) => {
					expect(event.isCreated).toEqual(true);
					resolve();
				}
			});

			model.addNode(new DefaultNodeModel());
		});
	});

	test("NodeEvent should fire when new node is removed", () => {
		return new Promise((resolve) => {
			const node = new DefaultNodeModel();
			model.addNode(node);
			model.addListener({
				nodesUpdated: (event) => {
					expect(event.isRemoved).toEqual(true);
					resolve();
				}
			});
			model.removeNode(node);
		});
	});

	test("LinkEvent should fire when a link is added (connected)", () => {
		return new Promise((resolve) => {
			const node1 = new DefaultNodeModel();
			const node1Out = node1.addOutPort("out");
			model.addNode(node1);

			const node2 = new DefaultNodeModel();
			const node2In = node2.addInPort("in");
			model.addNode(node2);

			model.addListener({
				linksUpdated: (event) => {
					expect(event.isCreated).toEqual(true);
					expect(event.isConnected).toEqual(true);
					resolve();
				}
			});

			const link = node1Out.link(node2In);
			model.addLink(link);
		});
	});

	test("LinkEvent should fire when a link is added (not connected)", () => {
		return new Promise((resolve) => {
			const node1 = new DefaultNodeModel();
			const node1Out = node1.addOutPort("out");
			model.addNode(node1);

			const node2 = new DefaultNodeModel();
			model.addNode(node2);

			model.addListener({
				linksUpdated: (event) => {
					expect(event.isCreated).toEqual(true);
					expect(event.isConnected).toBeUndefined();
					resolve();
				}
			});

			const link = node1Out.createLinkModel();
			link.setSourcePort(node1Out);
			model.addLink(link);
		});
	});

	test("LinkEvent should fire when a link is removed", () => {
		return new Promise((resolve) => {
			const node1 = new DefaultNodeModel();
			const node1Out = node1.addOutPort("out");
			model.addNode(node1);

			const node2 = new DefaultNodeModel();
			const node2In = node2.addInPort("in");
			model.addNode(node2);

			const link = node1Out.link(node2In);
			model.addLink(link);

			model.addListener({
				linksUpdated: (event) => {
					expect(event.isRemoved).toEqual(true);
					resolve();
				}
			});

			model.removeLink(link);
		});
	});

	// TODO add more tests
});
