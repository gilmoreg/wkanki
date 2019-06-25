import { Note } from './types';

const AnkiConnectURL = 'http://localhost:8765';

export interface IAnkiConnectAdapter {
    getDeckNames(): Promise<string[]>
    addNote(note: Note): Promise<boolean>
}

type AnkiConnectAddNoteContract = {
    action: string,
    version: Number,
    params: {
        note: {
            deckName: string,
            modelName: string,
            fields: {
                Front: string,
                Back: string,
            },
            options: {
                allowDuplicate: boolean
            },
            tags: string[],
        }
    }
}

type AnkiConnectResponseContract = {
    error: string
    result: any
};

const createAKConnectAddNoteContract = (note: Note): AnkiConnectAddNoteContract => ({
    action: 'addNote',
    version: 6,
    params: {
        note: {
            deckName: note.deckName,
            modelName: 'Basic',
            fields: {
                Front: note.front,
                Back: note.back,
            },
            options: {
                allowDuplicate: true,
            },
            tags: note.tags,
        }
    }
});

export default class AnkiConnectAdapter implements IAnkiConnectAdapter {
    private ankiConnectRequest(body: any): Promise<AnkiConnectResponseContract> {
        return fetch(AnkiConnectURL, {
            method: 'POST',
            body: JSON.stringify(body),
        })
            .then(res => res.json());
    }

    getDeckNames(): Promise<string[]> {
        return this.ankiConnectRequest({ action: 'deckNames', version: 6 })
            .then(res => res.result as string[])
            .catch(err => {
                console.error(err);
                return [];
            });
    }

    addNote(note: Note): Promise<boolean> {
        return this.ankiConnectRequest(createAKConnectAddNoteContract(note))
            .then(res => !!res)
            .catch(err => {
                console.error(err);
                return false;
            });
    }
}