declare enum Environments {
    PRODUCTION = "production",
    SANDBOX = "sandbox"
}

declare enum Events {
    ALL = "*",
    ORDER_PLACED = "orderPlaced",
    WIDGET_CONTINUE_BUTTON_CLICKED = "widgetContinueButtonClicked"
}

declare enum Themes {
    DARK = "dark",
    LIGHT = "light"
}

declare enum Urls {
    PRODUCTION = "https://app.topperpay.com",
    SANDBOX = "http://localhost:3000",
    WEBSITE = "https://www.topperpay.com/"
}

declare enum Variants {
    IFRAME = "iframe",
    NEW_TAB = "new-tab",
    SAME_TAB = "same-tab"
}

interface Config {
    environment?: Environments;
    is_android_app?: boolean;
    is_ios_app?: boolean;
    theme?: Themes;
    variant?: Variants;
}

interface EventPayload {
    name?: string;
    data: any;
}

type EventHandler = (event: EventPayload) => void;

declare class TopperWebSdk {
    private eventHandlers;
    private handleMessage;
    private isInitialized;
    private targetWindow;
    config: Config;
    constructor(config?: Config);
    static triggerEvent(eventName: Events, data?: any): void;
    private triggerEvent;
    private setConfig;
    private initializeMessageListener;
    dispose(): void;
    initialize({ bootstrapToken, config, iframeElement }: {
        bootstrapToken: string;
        iframeElement?: HTMLIFrameElement;
        config?: Config;
    }): void;
    on(eventName: Events, handler: EventHandler): void;
}

export { Environments as TOPPER_ENVIRONMENTS, Events as TOPPER_EVENTS, Themes as TOPPER_THEMES, Urls as TOPPER_URLS, Variants as TOPPER_VARIANTS, TopperWebSdk };
