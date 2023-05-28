import Billboard from "./Billboard";
import BillboardManager from "./BillboardManager";
import { AnimationController } from "./anim";
import Component from "./web/Component";

if (!customElements.get("billboard-ticker")) {
    customElements.define("billboard-ticker", Component);
}

// for a no-js approach while still using divs
window.addEventListener(
    "load",
    () => {
        const divBillboardTickers =
            document.querySelectorAll(`[billboard-ticker]`);

        for (const ticker of divBillboardTickers) {
            new Billboard(ticker as HTMLElement);
        }
    },
    {
        once: true,
    }
);

AnimationController.start();

export function getBillboard(element: HTMLElement): Billboard | null {
    return BillboardManager.getBillboard(element);
}

export { Billboard };
