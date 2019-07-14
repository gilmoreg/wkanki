import AnkiConnectAdapter from "./AnkiConnectAdapter";
import './index.css';
import Modal from "./Modal";
import { NewWaniKaniPage } from "./Dom";

const run = async () => {
    const wkPage = await NewWaniKaniPage();
    const ankiConnectAdapter = new AnkiConnectAdapter();
    const modal = new Modal(ankiConnectAdapter, wkPage);

    const supplementalInfo = document.querySelector('#supplement-info') as HTMLElement;
    const information = document.querySelector('#information') as HTMLElement;
    const buttonHTML = `<div class="wkanki_show_modal"><button id="wkanki_show_modal">Add to Anki</button></div>`;
    if (supplementalInfo) {
        supplementalInfo.insertAdjacentHTML('beforeend', buttonHTML);
    }
    if (information) {
        information.insertAdjacentHTML('afterend', buttonHTML);
    }
    const button = document.querySelector('#wkanki_show_modal') as HTMLElement;
    button && button.addEventListener('click', () => modal.show());
};

run();