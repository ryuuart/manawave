export default class Lifecycle {
    private _onCreated: (element: HTMLElement) => void;
    private _onDestroyed: (element: HTMLElement) => void;
    private _each: (element: HTMLElement) => void;

    constructor() {
        this._onCreated = () => {};
        this._onDestroyed = () => {};
        this._each = () => {};
    }

    get onCreated() {
        return this._onCreated;
    }
    get onDestroyed() {
        return this._onDestroyed;
    }
    get each() {
        return this._each;
    }

    set onCreated(callback: (element: HTMLElement) => void) {
        this._onCreated = callback;
    }
    set onDestroyed(callback: (element: HTMLElement) => void) {
        this._onDestroyed = callback;
    }
    set each(callback: (element: HTMLElement) => void) {
        this._each = callback;
    }
}
