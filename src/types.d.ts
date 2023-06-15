interface Rect {
    width: number;
    height: number;
}

interface Positionable {
    position: vec2;
}

type vec2 = {
    x: number;
    y: number;
};

type DirectionalCount = {
    horizontal: number;
    vertical: number;
};

namespace Ouroboros {
    type Options = {
        autoplay: boolean;
        direction: "up" | "right" | "down" | "left" | string | number;
        speed: number;
    };
}

namespace Ticker {
    type Sizes = {
        ticker: Rect;
        item: Rect;
    };

    type Properties = {
        speed: number;
        direction: number;
    };

    type FrameData = {
        items: { [id: string]: vec2 };
    };
}
