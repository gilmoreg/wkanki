export interface IWaniKaniPage {
  challenge(): string
  answer(): string
  type(): Promise<string>
}

class WaniKaniPage implements IWaniKaniPage {
  pageType: string

  challenge(): string {
    throw new Error("Method not implemented.");
  }
  answer(): string {
    throw new Error("Method not implemented.");
  }
  type(): Promise<string> {
    return getType(getPageType());
  }
}

export class KanjiLesson extends WaniKaniPage implements IWaniKaniPage {
  private getMeanings(): string {
    const synonyms = document.querySelector('##supplement-kan-meaning>div>div>div') as HTMLElement;
    if (!synonyms || !synonyms.innerHTML || synonyms.innerHTML === '(None)') return '';
    return synonyms.innerHTML;
  }

  challenge(): string {
    const character = document.querySelector('#character');
    return character && character.innerHTML || '';
  }

  answer(): string {
    const reading = document.querySelector('#supplement-kan-reading span:lang(ja)') as HTMLElement;
    const meaning = document.querySelector('#meaning') as HTMLElement;
    const meanings = this.getMeanings();
    const meaningMnemonic = document.querySelector('#supplement-kan-meaning-mne') as HTMLElement;
    const meaningHint = document.querySelector('#supplement-kan-meaning-hnt') as HTMLElement;
    const readingMnemonic = document.querySelector('#supplement-kan-reading-mne') as HTMLElement;
    const readingHint = document.querySelector('#supplement-kan-reading-hnt') as HTMLElement;
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
    const synonyms = document.querySelector('#supplement-voc-synonyms') as HTMLElement;
    if (!synonyms || !synonyms.innerHTML || synonyms.innerHTML === '(None)') return '';
    return synonyms.innerHTML;
  }

  challenge(): string {
    const character = document.querySelector('#character');
    return character && character.innerHTML || '';
  }

  answer(): string {
    const reading = document.querySelector('#supplement-voc-reading div:lang(ja)') as HTMLElement;
    const meaning = document.querySelector('#meaning') as HTMLElement;
    const meanings = this.getMeanings();
    const meaningExplanation = document.querySelector('#supplement-voc-meaning-exp') as HTMLElement;
    const readingExplanation = document.querySelector('#supplement-voc-reading-exp') as HTMLElement;
    const pos = document.querySelector('#supplement-voc-part-of-speech') as HTMLElement;
    return `
      <span>${reading && reading.innerText}</span>
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

  challenge(): string {
    const character = document.querySelector('.kanji-icon') as HTMLElement;
    return character && character.innerText || '';
  }

  answer(): string {
    const meaning = createMeaning();

    const readingElements: Array<HTMLElement> = Array.from(document.querySelectorAll('p:lang(ja)'));
    if (!readingElements) this.error('no reading elements');
    const readings = createReadings(readingElements);

    const mnemonicElements: Array<HTMLElement> = Array.from(document.querySelectorAll('.mnemonic-content p'));
    if (!mnemonicElements || mnemonicElements.length < 1) this.error('no mnemonic elements');
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

  challenge(): string {
    const character = document.querySelector('.vocabulary-icon') as HTMLElement;
    return character && character.innerText || '';
  }

  answer(): string {
    const meaning = createMeaning();

    const readingElements: Array<HTMLElement> = Array.from(document.querySelectorAll('.vocabulary-reading p:lang(ja)'));
    if (!readingElements) this.error('no reading elements');
    const readings = createReadings(readingElements);

    const mnemonicElements: Array<HTMLElement> = Array.from(document.querySelectorAll('.mnemonic-content p'));
    if (!mnemonicElements || mnemonicElements.length < 1) this.error('no mnemonic elements');
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

const createMeaning = (): string => {
  const header = document.querySelector('.span12 header h1');
  const meaningMatches = header.innerHTML.match(/^.+<\/span>\s(.+)$/m);
  return meaningMatches[1];
};

const createReadings = (readingElements: Array<HTMLElement>) => readingElements
  .filter(el => !el.innerText.includes('None'))
  .map(el => {
    const wkCanon = !el.parentElement.classList.contains('muted-content');
    return wkCanon ? el.innerText : `<span style="opacity: 0.3">${el.innerText}</span>`;
  })
  .join(', ');

const waitForClass = (node: HTMLElement): Promise<void> =>
  new Promise((resolve) => {
    setInterval(() => {
      console.log(node.classList);
      if (node.classList.length > 0) {
        resolve();
      }
    }, 1);
  });

const getPageType = (): string =>
  window.location.href.match(/.+lesson\/session/) ? 'lesson' : 'page';

const getType = async (pageType: string): Promise<string> => {
  // Lesson
  if (pageType === 'lesson') {
    const mainInfo = document.querySelector('#main-info') as HTMLElement;
    if (!mainInfo) throw new Error('unable to get page type');

    await waitForClass(mainInfo);

    if (mainInfo.classList.contains('vocabulary')) return 'vocabulary';
    if (mainInfo.classList.contains('kanji')) return 'kanji';
    throw new Error('unsupported lesson type')
  }

  // Item
  const pageRegex = /https:\/\/www.wanikani.com\/(.+)\/.+/;
  const matches = pageRegex.exec(window.location.href);
  if (!matches || matches.length < 2) {
    throw new Error('url not recognized')
  }
  return matches[1];
}

export async function NewWaniKaniPage(): Promise<IWaniKaniPage> {
  const pageType = getPageType();
  const type = await getType(pageType);

  if (pageType === 'lesson') {
    switch (type) {
      case 'kanji': return new KanjiLesson();
      case 'vocabulary': return new VocabLesson();
      default: throw new Error('unsupported lesson type');
    }
  }

  switch (type) {
    case 'kanji': return new KanjiPage();
    case 'vocabulary': return new VocabPage();
    default: throw new Error('unsupported page type');
  }
}