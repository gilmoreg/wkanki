import { IDom } from "./Dom";
import { IAnkiConnectAdapter } from "./AnkiConnectAdapter";
import { Note } from "./types";

export interface IModal {
  show(): void
  hide(): void
  update(e: Event): void
  updatePreview(e: Event | null): void
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
const vocabColor = '161, 0, 241';
const frontFontSize = 64;
const backFontSize = 16;

const generateStyles = (fontSize: number, color: string) => `color: rgb(255, 255, 255); font-family: &quot;Hiragino Kaku Gothic Pro&quot;, Meiryo, &quot;Source Han Sans Japanese&quot;, NotoSansCJK, TakaoPGothic, &quot;Yu Gothic&quot;, &quot;ヒラギノ角ゴ Pro W3&quot;, メイリオ, Osaka, &quot;MS PGothic&quot;, &quot;ＭＳ Ｐゴシック&quot;, sans-serif; font-size: ${fontSize}px; text-align: center; background-color: rgb(${color});`;

const generateHTML = (text: string, fontSize: number, color: string) => `<span style="${generateStyles(fontSize, color)}">${text}</span>`;

const generateBackHTML = (text: string) => {
  const html = text
    .replace(/class="highlight-kanji"/g, `style="background-color: rgb(${kanjiColor});"`)
    .replace(/class="highlight-vocabulary"/g, `style="background-color: rgb(${vocabColor});"`)
    .replace(/class="highlight-radical"/g, `style="background-color: rgb(${radicalColor});"`);
  return `<div style="font-size: ${backFontSize};">${html}</div>`;
}

export default class Modal implements IModal {
  ankiConnectAdapter: IAnkiConnectAdapter
  dom: IDom
  modal: HTMLElement;

  // Elements
  select: HTMLSelectElement;
  front: HTMLInputElement;
  back: HTMLTextAreaElement;
  frontPreview: HTMLElement;
  backPreview: HTMLElement;

  constructor(ankiConnectAdapter: IAnkiConnectAdapter, dom: IDom) {
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
    this.modal = document.querySelector('#wkanki_modal') as HTMLElement;
    this.select = document.querySelector('#wkanki_decks') as HTMLSelectElement;
    this.front = document.querySelector('#wkanki_front') as HTMLInputElement;
    this.back = document.querySelector('#wkanki_back') as HTMLTextAreaElement;
    this.frontPreview = document.querySelector('#wkanki_preview-front') as HTMLElement;
    this.backPreview = document.querySelector('#wkanki_preview-back') as HTMLElement;
    this.front.addEventListener('input', this.updatePreview);
    this.back.addEventListener('input', this.updatePreview);
    this.updateDecks();
  }

  show(): void {
    const lessonType = this.dom.getLessonType();
    // Radicals not supported
    if (lessonType === 'radical') return;
    this.update(null);
    this.modal.style.display = 'block';
  }

  hide(): void {
    this.modal.style.display = 'none';
  }

  private insert(): void {
    const body = document.querySelector('body');
    if (!body) {
      return;
    }
    body.insertAdjacentHTML('afterend', modalTemplate);
    const close = document.querySelector('.wkanki_close') as HTMLElement;
    close && close.addEventListener('click', this.hide);
    const submit = document.querySelector('#wkanki_submit') as HTMLButtonElement;
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

  update(e: Event | null): void {
    console.log('update', e && e.target);
    e && e.stopPropagation();
    const meanings = this.dom.getMeanings();
    const backHTML = `
      <span>${this.dom.getReading()}</span>
      <p>
        ${this.dom.getMeaning()}${(meanings !== '' ? `, ${meanings}` : '')}
      </p>
      <p>
        ${this.dom.getMeaningExplanation()}&nbsp;
        ${this.dom.getReadingExplanation()}
      </p>
    `;
    this.front.value = this.dom.getCharacter();
    this.back.value = generateBackHTML(backHTML);
    this.updatePreview(e);
  }

  updatePreview(e: Event | null): void {
    e && e.stopPropagation();
    const color = this.dom.getLessonType() === 'vocabulary' ? vocabColor : kanjiColor;
    this.frontPreview.innerHTML = generateHTML(this.front.value, frontFontSize, color);
    this.backPreview.innerHTML = this.back.value;
  }

  async addCard(e: Event): Promise<boolean> {
    e.preventDefault();
    const success = await this.ankiConnectAdapter.addNote({
      deckName: this.select.value,
      front: this.frontPreview.innerHTML,
      back: this.backPreview.innerHTML,
      tags: []
    });
    if (success) {
      this.hide();
    } else {
      console.error(success);
    }
    return success;
  }
}