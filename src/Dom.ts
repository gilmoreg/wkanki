export interface IDom {
  pageType(): string
  itemType(): Promise<string>
  querySelector(query: string): HTMLElement
  querySelectorAll(query: string): HTMLElement[]
}

const waitForClass = (node: HTMLElement): Promise<void> =>
  new Promise((resolve) => {
    const interval = setInterval(() => {
      if (node.classList.length > 0) {
        clearInterval(interval);
        resolve();
      }
    }, 1);
  });

export class Dom implements IDom {
  private dom: HTMLDocument;
  private win: Window;

  constructor(dom: HTMLDocument = document, win: Window = window) {
    this.dom = dom;
    this.win = win;
    this.pageType = this.pageType.bind(this);
    this.itemType = this.itemType.bind(this);
    this.querySelector = this.querySelector.bind(this);
    this.querySelectorAll = this.querySelectorAll.bind(this);
  }

  pageType(): string {
    return this.win.location.href.match(/.+lesson\/session/) ? 'lesson' : 'page';
  }

  async itemType(): Promise<string> {
    const pageType = this.pageType();
    if (pageType === 'lesson') {
      const mainInfo = this.dom.querySelector('#main-info') as HTMLElement;
      if (!mainInfo) throw new Error('unable to get page type');

      await waitForClass(mainInfo);

      if (mainInfo.classList.contains('vocabulary')) return 'vocabulary';
      if (mainInfo.classList.contains('kanji')) return 'kanji';
      throw new Error('unsupported lesson type')
    }
    // Item
    const pageRegex = /https:\/\/www.wanikani.com\/(.+)\/.+/;
    const matches = pageRegex.exec(this.win.location.href);
    if (!matches || matches.length < 2) {
      throw new Error('url not recognized')
    }
    return matches[1];
  }

  querySelector(query: string): HTMLElement {
    const element = this.dom.querySelector(query) as HTMLElement;
    if (!element) throw new Error(`unable to get element for query ${query}`);
    return element;
  }

  querySelectorAll(query: string): HTMLElement[] {
    const elements: HTMLElement[] = Array.from(this.dom.querySelectorAll(query));
    if (!elements || elements.length === 0) throw new Error(`unable to get elements for query ${query}`);
    return elements;
  }
}
