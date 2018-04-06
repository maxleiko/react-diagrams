import { ElementHandle, Page } from 'puppeteer';
import * as _ from 'lodash';

export class E2EElement {
  helper: E2EHelper;
  page: Page;
  element: ElementHandle;
  id: string;

  constructor(helper: E2EHelper, page: Page, element: ElementHandle, id: string) {
    this.page = page;
    this.element = element;
    this.id = id;
    this.helper = helper;
  }
}

export class E2ENode extends E2EElement {
  async port(id: string): Promise<E2EPort> {
    return new E2EPort(this.helper, this.page, (await this.element.$(`div[data-name="${id}"]`))!, id, this);
  }

  async model(): Promise<any> {
    return await this.page.evaluate((id) => {
      // tslint:disable-next-line
      return (window as any)['diagram_instance']
        .getDiagramModel()
        .getNode(id)
        .serialize();
    }, this.id);
  }
}

export class E2EPort extends E2EElement {
  parent: E2ENode;

  constructor(helper: E2EHelper, page: Page, element: ElementHandle, id: string, parent: E2ENode) {
    super(helper, page, element, id);
    this.parent = parent;
  }

  async link(port: E2EPort): Promise<E2ELink> {
    const currentLinks = _.flatMap((await this.parent.model()).ports, 'links');

    const bounds = (await this.element.boundingBox())!;

    // click on this port
    this.page.mouse.move(bounds.x, bounds.y);
    this.page.mouse.down();

    const bounds2 = (await port.element.boundingBox())!;

    // drag to other port
    this.page.mouse.move(bounds2.x, bounds2.y);
    this.page.mouse.up();

    // get the parent to get the link
    return await this.helper.link(_.difference(_.flatMap((await this.parent.model()).ports, 'links'), currentLinks)[0]);
  }

  async linkToPoint(x: number, y: number): Promise<E2ELink> {
    const currentLinks = _.flatMap((await this.parent.model()).ports, 'links');

    const bounds = (await this.element.boundingBox())!;

    // click on this port
    this.page.mouse.move(bounds.x, bounds.y);
    this.page.mouse.down();

    // drag to point
    this.page.mouse.move(x, y);
    this.page.mouse.up();

    // get the parent to get the link
    return await this.helper.link(_.difference(_.flatMap((await this.parent.model()).ports, 'links'), currentLinks)[0]);
  }
}

export class E2ELink extends E2EElement {
  async model(): Promise<any> {
    return await this.page.evaluate((id) => {
      // tslint:disable-next-line
      return (window as any)['diagram_instance']
        .getDiagramModel()
        .getLink(id)
        .serialize();
    }, this.id);
  }

  async exists(): Promise<boolean> {
    return await this.page.evaluate((id) => {
      return !!document.querySelector(`path[srd-id="${id}"]`);
    }, this.id);
  }

  async select(): Promise<any> {
    const point = await this.page.evaluate((id) => {
      const path = document.querySelector(`path[srd-id="${id}"]`) as SVGPathElement;
      return path.getPointAtLength(path.getTotalLength() / 2);
    }, this.id);
    await this.page.keyboard.down('Shift');
    await this.page.mouse.move(point.x, point.y);
    await this.page.mouse.down();
    await this.page.keyboard.up('Shift');
  }
}

export class E2EHelper {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async link(id: any): Promise<E2ELink> {
    const selector = await this.page.waitForSelector(`.srd-link[srd-id="${id}"]`);
    return new E2ELink(this, this.page, selector, id);
  }

  async node(id: any): Promise<E2ENode> {
    const selector = await this.page.waitForSelector(`.srd-node[srd-id="${id}"]`);
    return new E2ENode(this, this.page, selector, id);
  }
}
