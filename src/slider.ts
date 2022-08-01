import { debounce } from "./interaction";
import { clearArray } from "./helpers";
import { Controls } from "./animation";

export interface SliderOptions {
  autoplay: boolean;
  direction: "right" | "left" | "up" | "down" | number;
  speed: number;
}

/**
 * The HTML Slider that Billboard sets up and manipulates
 */
export class Slider {
  tickerHTMLElement: HTMLElement;
  tickerItems: NodeList;
  content: HTMLElement;
  clones: HTMLElement[] = [];
  currentRepetitions: number = 0;
  contentBoundingBox: DOMRect;
  animations: Animation[] = [];
  playback: Controls;
  private styles: HTMLStyleElement;

  /**
   * Setup an individual slider
   * @param {string} id  - The HTML ID that will be selected as the slider container
   * @param {SliderOptions} options The options provided for the slider
   */
  constructor(public id: string = "billboard", public options: SliderOptions) {
    // Set up options
    const DEFAULT_OPTIONS: SliderOptions = {
      autoplay: true,
      direction: "right",
      speed: 1,
    };

    if (!options) {
      this.options = DEFAULT_OPTIONS;
    } else {
      this.options = Object.assign(this.options, DEFAULT_OPTIONS);
    }

    // Find billboard element
    this.tickerHTMLElement = document.getElementById(id)!;

    if (!this.tickerHTMLElement) {
      throw "Billboard Ticker Element not found. Make sure your IDs are correctly defined.";
    }

    this.tickerItems = this.tickerHTMLElement.querySelectorAll(`#${id} > *`)!;

    if (!this.tickerItems.length) {
      throw "Make sure there is something to repeat in the billboard";
    }

    if (this.options.autoplay) {
      this.setup();
    }
  }

  /**
   * Set the slider container up and wrap the repeatable elements into a content wrapper element.
   *
   * The content wrapper element will be used as a template to be cloned multiple times. It's also
   * the single source of truth in terms of dimensions from the starting point.
   */
  setup() {
    // Reset
    this.destroy();

    // Setup required CSS
    this.styles = document.createElement("style");
    document.head.appendChild(this.styles);
    this.styles.sheet?.insertRule(
      `
      #${this.id} {
        overflow: hidden;
        white-space: nowrap;
        position: relative;
      }
      `
    );

    // Create a content wrapper to determine the total width and repetitions we need to fill the ticker
    this.content = document.createElement("div");
    if (this.options.direction === "up" || this.options.direction === "down") {
      this.content.style.display = "block";
    } else {
      this.content.style.display = "inline-block";
    }

    // Fill the base content wrapper
    this.tickerItems.forEach((e) => {
      this.content.append(e);
    });

    this.contentBoundingBox = this.content.getBoundingClientRect();

    this.tickerHTMLElement.append(this.content);
    this.tickerHTMLElement.style.height = `${this.content.clientHeight}px`;

    // Calculate the number of repetitions needed
    this.clone(this.getRepititions());

    // Attach events that should update our slider
    this.setupEvents();

    // Animate
    this.animate();

    // Setup playback controls
    this.playback = new Controls(this.animations);
  }

  /**
   * Reusable method to calculate the current amount of
   * content repetitions required for the screen
   *
   * @returns The amount of times the content repeats
   */
  getRepititions() {
    let tickerDimension = this.tickerHTMLElement.clientWidth;
    let contentDimension = this.content.clientWidth;

    switch (this.options.direction) {
      case "up":
        tickerDimension = this.tickerHTMLElement.clientHeight;
        contentDimension = this.content.clientHeight;
        break;
      case "down":
        tickerDimension = this.tickerHTMLElement.clientHeight;
        contentDimension = this.content.clientHeight;
        break;
    }

    const repetitions = Math.ceil(tickerDimension / contentDimension);

    this.currentRepetitions = repetitions;

    return repetitions;
  }

  /**
   * Stretch and repeat the content across the width of the slider
   * @param {number} amount The amount of times to clone
   */
  clone(amount: number) {
    // Offset it depending on direction

    let sign = 0;
    let axis = "translateX";
    let dimension = this.content.clientWidth;

    switch (this.options.direction) {
      case "right":
        sign = -1;
        break;
      case "up":
        axis = "translateY";
        dimension = this.content.clientHeight;
        break;
      case "down":
        sign = -1;
        axis = "translateY";
        dimension = this.content.clientHeight;
        break;
    }

    this.content.style.transform = `${axis}(${sign * dimension}px)`;

    for (let i = 0; i < amount; i++) {
      const clone = this.content.cloneNode(true) as HTMLElement;
      clone.style.transform = `${axis}(${sign * dimension}px)`;
      this.clones.push(clone);
      this.tickerHTMLElement.append(clone);
    }
  }

  /**
   * Animate the slider based on the width of the content
   */
  animate() {
    /**
     * Wrapper to animate the individual elements consistently
     *
     * @param e The HTML Element to animate
     * @returns An Animation object
     */
    const elementAnimate = (e) => {
      let sign = 1;
      let axis = "translateX";
      let dimension = this.content.clientWidth;

      switch (this.options.direction) {
        case "left":
          sign = -1;
          break;
        case "up":
          sign = -1;
          axis = "translateY";
          dimension = this.content.clientHeight;
          break;
        case "down":
          axis = "translateY";
          dimension = this.content.clientHeight;
          break;
      }
      return e.animate([{ transform: `${axis}(${sign * dimension}px)` }], {
        duration: 10 * dimension * (1 / this.options.speed), // has to scale with width to keep speed consistent
        iterations: Infinity,
        composite: "add",
      });
    };

    // Setup new animation entirely or update the existing one
    if (!this.animations.length) {
      Array.from(this.tickerHTMLElement.children).forEach((e) => {
        this.animations.push(elementAnimate(e));
      });
    } else {
      Array.from(this.tickerHTMLElement.children).forEach((e) => {
        if (!e.getAnimations().length) {
          this.animations.push(elementAnimate(e));
        } else {
          e.getAnimations()[0].currentTime = 0;
        }
      });
    }
  }

  /**
   * Update the content clones if the screen is bigger.
   */
  refresh() {
    const previousRepetitions = this.currentRepetitions;

    const delta = this.getRepititions() - previousRepetitions;

    if (delta > 0) {
      this.clone(delta);
      this.animate();
    }
  }

  /**
   * Set up events that should update the slider when occurred
   */
  setupEvents() {
    window.addEventListener(
      "resize",
      debounce(() => {
        this.refresh();
      }, 250)
    );
  }

  /**
   * Deletes all modifications and resets the slider
   * to original HTML state.
   *
   * Must support graceful degredation / progressive enhancement
   */
  destroy() {
    // Clear animations
    if (!!this.animations.length) {
      this.animations.forEach((e) => {
        e.cancel();
      });

      clearArray(this.animations);
    }

    // Delete clones
    if (!!this.clones.length) {
      this.clones.forEach((e) => {
        e.remove();
      });
    }

    // Delete content and reset html to original
    if (!!this.content) {
      Array.from(this.content.children).forEach((e) => {
        this.tickerHTMLElement.appendChild(e);
      });

      this.tickerHTMLElement.removeAttribute("style");

      this.content.remove();
    }

    // Delete custom injected styles
    if (!!this.styles) {
      this.styles.remove();
    }
  }
}
