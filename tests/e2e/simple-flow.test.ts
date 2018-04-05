import 'jest';
import * as puppeteer from 'puppeteer';
import { E2EHelper } from './E2EHelper';

let browser: any;

async function itShould(demo: string, directive: any, test: (page: puppeteer.Page, helper: E2EHelper) => any) {
  it(directive, async () => {
    const page = await browser.newPage();
    await page.goto('file://' + __dirname + '/../../dist/e2e/' + demo + '/index.html');
    const helper = new E2EHelper(page);
    await test(page, helper);
    await page.close();
  });
}

beforeAll(async () => {
  if (process.env.CIRCLECI) {
    console.log('using CircleCI');

    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } else {
    browser = await puppeteer.launch({
      headless: false
    });
  }
});

afterAll(() => {
  browser.close();
});

describe('simple flow test', async () => {
  itShould('demo-simple-flow', 'drag link to port adds a link', async (_page, helper) => {
    // create a new link
    const node1 = await helper.node('6');
    const node2 = await helper.node('9');

    const port1 = await node1.port('7');
    const port2 = await node2.port('10');

    const newlink = await port1.link(port2);
    await expect(await newlink.exists()).toBeTruthy();
  });

  itShould('demo-simple-flow', 'drag link to node does not add a link', async (_page, helper) => {
    // create a new link
    const node1 = await helper.node('6');
    const node2 = await helper.node('9');

    const port1 = await node1.port('7');

    const node2Bounds = await node2.element.boundingBox();

    const newlink = await port1.linkToPoint(node2Bounds.x, node2Bounds.y);
    await expect(await newlink.exists()).toBeFalsy();
  });
});
