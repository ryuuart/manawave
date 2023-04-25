import { wrappedDiv, moveElements, isDOMList } from "../dom";
export default class Template {
    private originalParent: HTMLElement | null;

    original: Parameters<typeof wrappedDiv>[0];
    element: HTMLElement;

    constructor(element: Parameters<typeof wrappedDiv>[0]) {
        // Track the original for restoration
        this.original = element;
        if (isDOMList(this.original))
            this.originalParent = this.original[0].parentElement;
        else this.originalParent = this.original.parentElement;

        // Element represents the element to be repeated (the template if you will)
        this.element = wrappedDiv(this.original);
        this.element.classList.add("ticker-element-temp");
    }

    restore() {
        moveElements(this.original, this.originalParent!);
    }
}
