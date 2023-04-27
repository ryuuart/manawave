import Clone from "./Clone";
import Template from "./Template";

// Continuously clone templates and returns it for use
export default class Cloner {
    private _templates: Template[];
    private _currTemplateIndex: number = -1;

    get allTemplates() {
        return this._templates;
    }

    constructor() {
        this._templates = [];
    }

    // register a template
    addTemplate(template: Template) {
        this._templates.push(template);
    }

    removeTemplate(selectedTemplate: Template, restore?: boolean) {
        this._templates = this._templates.filter((currTemplate: Template) => {
            if (currTemplate !== selectedTemplate) {
                if (restore) currTemplate.restore();
                return currTemplate;
            }
        });

        this._currTemplateIndex = -1;
    }

    clearTemplates() {
        for (const template of this.allTemplates) {
            this.removeTemplate(template);
        }
    }

    // clone N clones
    // if you need to apply some custom operations on the clone while cloning
    clone(n: number, fn?: (clone: Clone) => void): Clone[] {
        const clones: Clone[] = [];
        if (this._templates.length > 0) {
            for (let i = 0; i < n; i++) {
                const clone = new Clone(this.getNextTemplate());
                clones.push(clone);

                if (fn) fn(clone);
            }
        }

        return clones;
    }

    // clone a template sequence
    // continue option means to return template index to continue
    // cloning from where it last left off
    cloneSequence(options: {
        continue?: boolean;
        fn?: (clone: Clone) => void;
    }): Clone[] {
        let prevTemplateIndex = this._currTemplateIndex;

        this._currTemplateIndex = 0;

        const clones = this.clone(
            this._templates.length,
            options.fn ?? undefined
        );

        if (options?.continue) this._currTemplateIndex = prevTemplateIndex;

        return clones;
    }

    // return next template that will be used to clone
    getNextTemplate(): Template {
        if (this._currTemplateIndex + 1 >= this._templates.length)
            this._currTemplateIndex = 0;
        else this._currTemplateIndex++;

        return this._templates[this._currTemplateIndex];
    }
}
