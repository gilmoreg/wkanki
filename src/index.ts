import AnkiConnectAdapter from "./AnkiConnectAdapter";
import './index.css';
import Modal from "./Modal";
import Dom from "./Dom";

const dom = new Dom();
const ankiConnectAdapter = new AnkiConnectAdapter();
const modal = new Modal(ankiConnectAdapter, dom);

const supplementalInfo = document.querySelector('#supplement-info') as HTMLElement;
if (supplementalInfo) {
    const buttonHTML = `<div class="wkanki_show_modal"><button id="wkanki_show_modal">Add to Anki</button></div>`;
    supplementalInfo.insertAdjacentHTML('beforeend', buttonHTML);
    const button = document.querySelector('#wkanki_show_modal') as HTMLElement;
    button.addEventListener('click', () => modal.show());
}

modal.update().then(() => modal.show());