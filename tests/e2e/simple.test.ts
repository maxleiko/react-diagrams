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

describe('simple test', async () => {
  itShould('demo-simple', 'should delete a link and create a new one', async (page, helper) => {
    // get the existing link
    const link = await helper.link('12');
    await expect(await link.exists()).toBeTruthy();

    // remove it
    await link.select();
    await page.keyboard.press('Del');

    await expect(await link.exists()).toBeFalsy();

    // create a new link
    const node1 = await helper.node('6');
    const node2 = await helper.node('9');

    const port1 = await node1.port('7');
    const port2 = await node2.port('10');

    const newlink = await port1.link(port2);
    await expect(await newlink.exists()).toBeTruthy();
  });
});
