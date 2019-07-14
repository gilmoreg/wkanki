import AnkiConnectAdapter, { IAnkiConnectAdapter } from "./AnkiConnectAdapter";
import { IWaniKaniPage, NewWaniKaniPage } from "./WKPage";
import { Dom, IDom } from "./Dom";

export interface IModal {
  show(): Promise<void>
  hide(): void
  update(e: Event | null): Promise<void>
  updatePreview(e: Event | null): Promise<void>
}

const modalTemplate = `
  <div id="wkanki_modal" class="wkanki_modal">
    <!-- Modal content -->
    <div class="wkanki_modal-content">
      <span class="wkanki_close">&times;</span>
      <form>
        <p>
          <label for="wkanki_decks">Anki Deck: </label>
          <select id="wkanki_decks"></select>
        </p>
        <p>
          <label for="wkanki_front">Front: </label>
        </p>
        <p>
          <input type="text" id="wkanki_front">
        </p>
        <p>
          <label for="wkanki_back">Back: </label>
          <textarea rows="13" cols="43" id="wkanki_back"></textarea>
        </p>
        <p class="wkanki_modal-footer">
          <button id="wkanki_submit">Add</button>
        </p>
      </form>
      <div class="wkanki_modal-content-preview">
        <p>Front:</p>
        <div id="wkanki_preview-front"></div>
        <p>Back:</p>
        <div id="wkanki_preview-back"></div>
      </div>
    </div>
  </div>
`;

const radicalColor = '214, 241, 255';
const kanjiColor = '255, 214, 241';
const kanjiBackgroundColor = '241, 0, 161';
const vocabColor = '161, 0, 241';
const vocabBackgroundColor = '241,214,240';
const frontFontSize = 64;
const backFontSize = 16;

const generateStyles = (fontSize: number, color: string) => `color: rgb(255, 255, 255); font-family: &quot;Hiragino Kaku Gothic Pro&quot;, Meiryo, &quot;Source Han Sans Japanese&quot;, NotoSansCJK, TakaoPGothic, &quot;Yu Gothic&quot;, &quot;ヒラギノ角ゴ Pro W3&quot;, メイリオ, Osaka, &quot;MS PGothic&quot;, &quot;ＭＳ Ｐゴシック&quot;, sans-serif; font-size: ${fontSize}px; text-align: center; background-color: rgb(${color}); line-height: normal;`;

const generateHTML = (text: string, fontSize: number, color: string) => `<span style="${generateStyles(fontSize, color)}">${text}</span>`;

const generateBackHTML = (text: string) => {
  const html = text
    .replace(/class="highlight-kanji"/g, `style="background-color: rgb(${kanjiColor});"`)
    .replace(/class="kanji-highlight"/g, `style="background-color: rgb(${kanjiColor});"`)
    .replace(/class="highlight-vocabulary"/g, `style="background-color: rgb(${vocabBackgroundColor});"`)
    .replace(/class="vocabulary-highlight"/g, `style="background-color: rgb(${vocabBackgroundColor});"`)
    .replace(/class="highlight-radical"/g, `style="background-color: rgb(${radicalColor});"`)
    .replace(/class="radical-highlight"/g, `style="background-color: rgb(${radicalColor});"`);
  return `<div style="font-size: ${backFontSize};">${html}</div>`;
}

export default class Modal implements IModal {
  ankiConnectAdapter: IAnkiConnectAdapter
  dom: IDom
  modal: HTMLElement;
  page: IWaniKaniPage;

  // Elements
  select: HTMLSelectElement;
  front: HTMLInputElement;
  back: HTMLTextAreaElement;
  frontPreview: HTMLElement;
  backPreview: HTMLElement;

  constructor(ankiConnectAdapter: IAnkiConnectAdapter = new AnkiConnectAdapter(), dom: IDom = new Dom()) {
    this.ankiConnectAdapter = ankiConnectAdapter;
    this.dom = dom;
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.insert = this.insert.bind(this);
    this.update = this.update.bind(this);
    this.updateDecks = this.updateDecks.bind(this);
    this.updatePreview = this.updatePreview.bind(this);
    this.addCard = this.addCard.bind(this);
    this.insert();
    this.modal = this.dom.querySelector('#wkanki_modal') as HTMLElement;
    this.select = this.dom.querySelector('#wkanki_decks') as HTMLSelectElement;
    this.front = this.dom.querySelector('#wkanki_front') as HTMLInputElement;
    this.back = this.dom.querySelector('#wkanki_back') as HTMLTextAreaElement;
    this.frontPreview = this.dom.querySelector('#wkanki_preview-front') as HTMLElement;
    this.backPreview = this.dom.querySelector('#wkanki_preview-back') as HTMLElement;
    this.front.addEventListener('input', this.updatePreview);
    this.back.addEventListener('input', this.updatePreview);
    this.updateDecks();
  }

  async show(): Promise<void> {
    const lessonType = await this.dom.itemType();
    // Radicals not supported
    if (lessonType === 'radical') return;
    this.update(null);
    this.modal.style.display = 'block';
  }

  hide(): void {
    this.modal.style.display = 'none';
  }

  private insert(): void {
    const body = this.dom.querySelector('body');
    if (!body) {
      return;
    }
    body.insertAdjacentHTML('afterend', modalTemplate);
    const close = this.dom.querySelector('.wkanki_close') as HTMLElement;
    close && close.addEventListener('click', this.hide);
    const submit = this.dom.querySelector('#wkanki_submit') as HTMLButtonElement;
    submit && submit.addEventListener('click', this.addCard);
  }

  private async updateDecks(): Promise<void> {
    const deckNames = await this.ankiConnectAdapter.getDeckNames()
    if (!deckNames) { return; }
    const html = deckNames
      .map(d => `<option value="${d}">${d}</option>`)
      .join();
    this.select.innerHTML = html;
  }

  async update(e: Event | null): Promise<void> {
    e && e.stopPropagation();
    this.page = await NewWaniKaniPage();
    this.front.value = this.page.challenge();
    this.back.value = generateBackHTML(this.page.answer());
    this.updatePreview(e);
  }

  async updatePreview(e: Event | null): Promise<void> {
    e && e.stopPropagation();
    const type = await this.dom.itemType();
    const color = type === 'vocabulary' ? vocabColor : kanjiBackgroundColor;
    this.frontPreview.innerHTML = generateHTML(this.front.value, frontFontSize, color);
    this.backPreview.innerHTML = this.back.value;
  }

  async addCard(e: Event): Promise<boolean> {
    e.preventDefault();
    const result = await this.ankiConnectAdapter.addNote({
      deckName: this.select.value,
      front: this.frontPreview.innerHTML,
      back: this.backPreview.innerHTML,
      tags: []
    });
    if (result) {
      this.hide();
    } else {
      console.error(result);
    }
    return result;
  }
}