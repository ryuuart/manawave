import PlaybackObject from "./anim/PlaybackObject";
import { convertDirection, mergeOOptions } from "./dom/attributes";
import { Dimensions, MeasurementBox } from "./dom/measure";
import TickerSystem from "./ticker/system";
import styles from "./dom/styles/ouroboros.module.css";
import { AnimationController } from "./anim";
import { debounce } from "./utils/debounce";

export class Ouroboros extends PlaybackObject {
    private simulation!: TickerSystem;
    private dimensions: Dimensions;

    private _selector: Parameters<Document["querySelector"]>[0] | HTMLElement;
    private _options?: Partial<Ouroboros.Options>;

    constructor(
        selector: Parameters<Document["querySelector"]>[0] | HTMLElement,
        options?: Partial<Ouroboros.Options>
    ) {
        super();

        this._selector = selector;
        this._options = options;
        this.dimensions = new Dimensions();

        this.start();
    }

    onStart() {
        let element: HTMLElement;
        if (this._selector instanceof HTMLElement) element = this._selector;
        else element = document.querySelector(this._selector) as HTMLElement;

        if (element) {
            const mBox = new MeasurementBox(...element.children);

            const template = document.createDocumentFragment();
            template.append(...element.children);

            mBox.startMeasuringFrom(element);

            this.dimensions.setEntry(
                "root",
                element,
                debounce((rect: Rect) => {
                    if (this.simulation)
                        this.simulation.updateSize({ ticker: rect });
                }, 150)
            );

            this.dimensions.setEntry(
                "item",
                mBox,
                debounce((rect: Rect) => {
                    if (this.simulation)
                        this.simulation.updateSize({ item: rect });
                }, 150)
            );

            const tSizes = {
                ticker: this.dimensions.get("root")!,
                item: this.dimensions.get("item")!,
            };

            element.classList.add(styles.ouroboros);
            const currOptions = mergeOOptions(element, this._options);

            const tAttributes = {
                speed: currOptions.speed,
                direction: convertDirection(currOptions.direction),
            };

            const tContext = {
                dom: {
                    root: element,
                    template,
                },
                sizes: tSizes,
                attributes: tAttributes,
            };

            this.simulation = new TickerSystem(tContext);

            AnimationController.registerSystem(this.simulation);
            this.simulation.start();
            if (!currOptions.autoplay) this.simulation.pause();
        } else {
            throw new Error("Element not found for Ouroboros.");
        }
    }

    onStop() {
        this.simulation.stop();
        AnimationController.deregisterSystem(this.simulation);
    }
}
