import { IDom, Dom } from "./Dom";

export interface IWaniKaniPage {
  challenge(): string
  answer(): string
}

class WaniKaniPage implements IWaniKaniPage {
  protected dom: IDom

  constructor(dom: IDom = new Dom()) {
    this.dom = dom;
    this.challenge = this.challenge.bind(this);
    this.answer = this.answer.bind(this);
  }

  challenge(): string {
    throw new Error("Method not implemented.");
  }
  answer(): string {
    throw new Error("Method not implemented.");
  }

  createMeaning(): string {
    const header = this.dom.querySelector('.span12 header h1');
    const meaningMatches = header.innerHTML.match(/^.+<\/span>\s(.+)$/m);
    return meaningMatches[1];
  };
}

export class KanjiLesson extends WaniKaniPage implements IWaniKaniPage {
  constructor(dom: IDom) {
    super(dom);
  }

  private getMeanings(): string {
    const synonyms = this.dom.querySelector('#supplement-kan-meaning>div>div>div') as HTMLElement;
    if (!synonyms || !synonyms.innerHTML || synonyms.innerHTML === '(None)') return '';
    return synonyms.innerHTML;
  }

  challenge(): string {
    const character = this.dom.querySelector('#character');
    return character && character.innerHTML || '';
  }

  answer(): string {
    const reading = this.dom.querySelector('#supplement-kan-reading span:lang(ja)') as HTMLElement;
    const meaning = this.dom.querySelector('#meaning') as HTMLElement;
    const meanings = this.getMeanings();
    const meaningMnemonic = this.dom.querySelector('#supplement-kan-meaning-mne') as HTMLElement;
    const meaningHint = this.dom.querySelector('#supplement-kan-meaning-hnt') as HTMLElement;
    const readingMnemonic = this.dom.querySelector('#supplement-kan-reading-mne') as HTMLElement;
    const readingHint = this.dom.querySelector('#supplement-kan-reading-hnt') as HTMLElement;
    return `
        <span>${reading && reading.innerText}</span>
        <p>
          ${meaning && meaning.innerText}${(meanings !== '' ? `, ${meanings}` : '')}
        </p>
        <p>
          ${meaningMnemonic && meaningMnemonic.innerHTML}
          ${meaningHint && meaningHint.innerHTML}
          ${readingMnemonic && readingMnemonic.innerHTML}
          ${readingHint && readingHint.innerHTML}
        </p>
      `;
  }
}

export class VocabLesson extends WaniKaniPage implements IWaniKaniPage {
  private getMeanings(): string {
    const synonyms = this.dom.querySelector('#supplement-voc-synonyms') as HTMLElement;
    if (!synonyms || !synonyms.innerHTML || synonyms.innerHTML === '(None)') return '';
    return synonyms.innerHTML;
  }

  constructor(dom: IDom) {
    super(dom);
  }

  challenge(): string {
    const character = this.dom.querySelector('#character');
    return character && character.innerHTML || '';
  }

  answer(): string {
    var readings = '';
    const readingElements = this.dom.querySelectorAll('.pronunciation-variant');
    if (readingElements && readingElements.length) {
      readings = readingElements.map(el => el.innerHTML).join(',');
    }

    const meaning = this.dom.querySelector('#meaning') as HTMLElement;
    const meanings = this.getMeanings();
    const meaningExplanation = this.dom.querySelector('#supplement-voc-meaning-exp') as HTMLElement;
    const readingExplanation = this.dom.querySelector('#supplement-voc-reading-exp') as HTMLElement;
    const pos = this.dom.querySelector('#supplement-voc-part-of-speech') as HTMLElement;
    return `
        <span>${readings}</span>
        <p>
          ${meaning && meaning.innerText}${(meanings !== '' ? `, ${meanings}` : '')}
        </p>
        <p>
          ${meaningExplanation && meaningExplanation.innerHTML}
          ${readingExplanation && readingExplanation.innerHTML}
        </p>
        <p>
          Part of speech: ${pos && pos.innerHTML}
        </p>
    `;
  }
}

export class KanjiPage extends WaniKaniPage implements IWaniKaniPage {
  private error(message: string) {
    const errorMessage = `cannot parse kanji page: ${message}`;
    throw new Error(errorMessage);
  }

  constructor(dom: IDom) {
    super(dom);
  }

  challenge(): string {
    const character = this.dom.querySelector('.kanji-icon') as HTMLElement;
    return character && character.innerText || '';
  }

  answer(): string {
    const meaning = this.createMeaning();

    const readingElements = this.dom.querySelectorAll('p:lang(ja)');
    const readings = createReadings(readingElements);

    const mnemonicElements = this.dom.querySelectorAll('.mnemonic-content p');
    const mnemonics = mnemonicElements.map(el => el.innerHTML).join(' ');

    return `
        <p>${meaning}</p>
        <p>
          ${readings}
        </p>
        <p>
          ${mnemonics}
        </p>
      `;
  }
}

export class VocabPage extends WaniKaniPage implements IWaniKaniPage {
  private error(message: string) {
    const errorMessage = `cannot parse vocab page: ${message}`;
    throw new Error(errorMessage);
  }

  constructor(dom: IDom) {
    super(dom);
  }

  challenge(): string {
    const character = this.dom.querySelector('.vocabulary-icon') as HTMLElement;
    return character && character.innerText || '';
  }

  answer(): string {
    const meaning = this.createMeaning(); // This is not capturing "Alternative meanings" in VocabPage (but those are all caps)

    const readingElements: Array<HTMLElement> = this.dom.querySelectorAll('.vocabulary-reading p:lang(ja)');
    if (!readingElements) this.error('no reading elements');
    const readings = createReadings(readingElements);

    const mnemonicElements: Array<HTMLElement> = this.dom.querySelectorAll('.mnemonic-content p');
    if (!mnemonicElements || mnemonicElements.length < 1) this.error('no mnemonic elements');
    const mnemonics = mnemonicElements.map(el => el.innerHTML).join(' ');

    return `
      <p>
        ${readings}
      </p>
      <p>
        ${meaning}
      </p>
      <p>
        ${mnemonics}
      </p>
    `;
  }
}
/*
Currently an issue with some vocab pages where you might see 
<section class="vocabulary-reading">
          <h2>Reading</h2>
          <p lang="ja">
            けいと
            <button type="button" class="audio-btn audio-idle"></button>
            <audio>
              <source src="https://cdn.wanikani.com/subjects/audio/3416-%E6%AF%9B%E7%B3%B8.mp3?1525117045" type="audio/mpeg">
              <source src="https://cdn.wanikani.com/subjects/audio/3416-%E6%AF%9B%E7%B3%B8.ogg?1525117045" type="audio/ogg">
            </audio>
</p>        </section>
*/
const createReadings = (readingElements: Array<HTMLElement>) =>
  readingElements
    .filter(el => !el.innerText.includes('None'))
    .map(el => {
      const wkCanon = !el.parentElement || !el.parentElement.classList.contains('muted-content');
      return wkCanon ? el.innerText : `<span style="opacity: 0.3">${el.innerText}</span>`;
    })
    .join(', ');

export async function NewWaniKaniPage(dom: IDom = new Dom()): Promise<IWaniKaniPage> {
  const pageType = dom.pageType();
  const itemType = await dom.itemType();

  if (pageType === 'lesson') {
    switch (itemType) {
      case 'kanji': return new KanjiLesson(dom);
      case 'vocabulary': return new VocabLesson(dom);
      default: throw new Error('unsupported lesson type');
    }
  }

  switch (itemType) {
    case 'kanji': return new KanjiPage(dom);
    case 'vocabulary': return new VocabPage(dom);
    default: throw new Error('unsupported page type');
  }
}
