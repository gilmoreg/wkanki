import { IDom } from "./Dom";
import { IAnkiConnectAdapter } from "./AnkiConnectAdapter";

export interface IModal {
  show(): void
  hide(): void
  update(): Promise<void>
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
          <textarea rows="4" cols="43" id="wkanki_back"></textarea>
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
    .replace('class="highlight-kanji"', `style="background-color: rgb(${kanjiColor});"`)
    .replace('class="highlight-vocabulary"', `style="background-color: rgb(${vocabColor});"`)
    .replace('class="highlight-radical"', `style="background-color: rgb(${radicalColor});"`);
  return html;
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
    this.insert();
    this.modal = document.querySelector('#wkanki_modal') as HTMLElement;
    this.select = document.querySelector('#wkanki_decks') as HTMLSelectElement;
    this.front = document.querySelector('#wkanki_front') as HTMLInputElement;
    this.back = document.querySelector('#wkanki_back') as HTMLTextAreaElement;
    this.frontPreview = document.querySelector('#wkanki_preview-front') as HTMLElement;
    this.backPreview = document.querySelector('#wkanki_preview-back') as HTMLElement;
  }

  show(): void {
    const lessonType = this.dom.getLessonType();
    // Radicals not supported
    if (lessonType === 'radical') return;
    this.update().then(() => this.modal.style.display = 'block');
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
  }

  async update(): Promise<void> {
    const deckNames = await this.ankiConnectAdapter.getDeckNames()
    if (!deckNames) { return; }
    const defaultOption = 'Wanikani Lvl 31'; // TODO localstorage setting
    const html = deckNames
      .map(d => `<option value=${d}${defaultOption === d ? ' selected' : ''}>${d}</option>`)
      .join();
    this.select.innerHTML = html;
    this.front.value = this.dom.getCharacter();

    const color = this.dom.getLessonType() === 'vocabulary' ? vocabColor : kanjiColor;

    const meanings = this.dom.getMeanings();
    const backHTML = this.dom.getReading() + '<br /><br />' +
      this.dom.getMeaning() +
      (meanings !== '' ? `, ${meanings}` : '') + '<br /><br />' +
      this.dom.getMeaningExplanation() + ' ' +
      this.dom.getReadingExplanation();
    this.back.value = generateBackHTML(backHTML);

    this.frontPreview.innerHTML = generateHTML(this.front.value, frontFontSize, color);
    this.backPreview.innerHTML = backHTML;
  }
}