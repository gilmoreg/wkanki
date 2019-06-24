export interface IDom {
  getCharacter(): string
  getMeaning(): string
  getMeanings(): string
  getMeaningExplanation(): string
  getReading(): string
  getReadingExplanation(): string
  getMeaningHint(): string
  getReadingHint(): string
  getPartOfSpeech(): string
  getRadicalMnemonic(): string
  getLessonType(): string
}

export default class Dom implements IDom {
  getCharacter(): string {
    const character = document.querySelector('#character');
    return character && character.innerHTML || '';
  }

  getMeaning(): string {
    const meaning = document.querySelector('#meaning') as HTMLElement;
    return meaning && meaning.innerText || '';
  }

  getMeanings(): string {
    const synonyms = document.querySelector('#supplement-voc-synonyms') as HTMLElement;
    if (!synonyms || !synonyms.innerHTML || synonyms.innerHTML === '(None)') return '';
    return synonyms.innerHTML;
  }

  getMeaningExplanation(): string {
    const meaningExplanation = document.querySelector('#supplement-voc-meaning-exp');
    return meaningExplanation && meaningExplanation.innerHTML || '';
  }

  getReading(): string {
    const reading = document.querySelector('#supplement-voc-reading div:lang(ja)') as HTMLElement;
    return reading && reading.innerText || '';
  }

  getReadingExplanation(): string {
    const readingExplanation = document.querySelector('#supplement-voc-reading-exp');
    return readingExplanation && readingExplanation.innerHTML || '';
  }

  getMeaningHint(): string {
    const meaningHint = document.querySelector('#supplement-kan-meaning-hnt') as HTMLElement;
    return meaningHint && meaningHint.innerText || '';
  }

  getReadingHint(): string {
    const readingHint = document.querySelector('#supplement-kan-reading-hnt') as HTMLElement;
    return readingHint && readingHint.innerText || '';
  }

  getPartOfSpeech(): string {
    const pos = document.querySelector('#supplement-voc-part-of-speech');
    return pos && pos.innerHTML || '';
  }

  getRadicalMnemonic(): string {
    const mnemonic = document.querySelector('#supplement-rad-name-mne');
    return mnemonic && mnemonic.innerHTML || '';
  }

  getLessonType(): string {
    const mainInfo = document.querySelector('#main-info');
    if (!mainInfo) return '';
    return mainInfo.classList[0];
  }
}