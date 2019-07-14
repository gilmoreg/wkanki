import './index.css';
import Modal from "./Modal";
import { Dom } from './Dom';
import AnkiConnectAdapter from './AnkiConnectAdapter';

const dom = new Dom();
const ankiConnectAdapter = new AnkiConnectAdapter();
const modal = new Modal(ankiConnectAdapter, dom);

const supplementalInfo = dom.querySelector('#supplement-info');
const information = dom.querySelector('#information');
const buttonHTML = `<div class="wkanki_show_modal"><button id="wkanki_show_modal">Add to Anki</button></div>`;
if (supplementalInfo) {
    supplementalInfo.insertAdjacentHTML('beforeend', buttonHTML);
}
if (information) {
    information.insertAdjacentHTML('afterend', buttonHTML);
}
const button = dom.querySelector('#wkanki_show_modal');
button && button.addEventListener('click', () => modal.show());
