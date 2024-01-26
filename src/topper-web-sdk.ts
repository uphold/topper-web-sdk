import { Config } from './interfaces';
import { Environments, Events, Urls, Variants } from './enums';
import { EventHandler } from 'types';
import queryString from 'query-string';

const TOPPER_WEB_SDK_EVENT_SOURCE = '@topper-web-sdk';

class TopperWebSdk {
  private eventHandlers: { [key in Events]?: EventHandler[] } = {};
  private handleMessage: ((event: MessageEvent) => void) | null = null;
  private isInitialized: boolean = false;
  private targetWindow: Window | null = null;

  public config: Config;

  constructor(config: Config = {}) {
    this.config = {
      environment: Environments.PRODUCTION,
      is_android_app: false,
      is_ios_app: false,
      variant: Variants.NEW_TAB,
      ...config
    };
  }

  static triggerEvent(eventName: Events, data?: any): void {
    const mainWindow = window.self !== window.top ? window.parent : window.opener;

    if (!mainWindow) {
      return;
    }

    mainWindow.postMessage(
      {
        name: eventName,
        payload: data,
        source: TOPPER_WEB_SDK_EVENT_SOURCE
      },
      '*'
    );
  }

  private triggerEvent(name: Events, payload?: any): void {
    this.eventHandlers[Events.ALL]?.forEach(handler => handler({ data: payload, name }));

    this.eventHandlers[name]?.forEach(handler => handler({ data: payload }));
  }

  private setConfig(config: Config): void {
    this.config = { ...this.config, ...config };
  }

  private initializeMessageListener(): void {
    this.handleMessage = (event: MessageEvent) => {
      const allowedOrigins = [Urls.PRODUCTION, Urls.SANDBOX];

      if (!allowedOrigins.includes(event.origin as Urls) || event.source !== this.targetWindow) {
        return;
      }

      if (event.data.name && event.data.source === TOPPER_WEB_SDK_EVENT_SOURCE) {
        this.triggerEvent(event.data.name as Events, event.data.payload);
      }
    };

    window.addEventListener('message', this.handleMessage);
  }

  dispose(): void {
    window.removeEventListener('message', this.handleMessage as EventListener, false);
    this.eventHandlers = {};
  }

  initialize({
    bootstrapToken,
    config = {},
    iframeElement
  }: {
    bootstrapToken: string;
    iframeElement?: HTMLIFrameElement;
    config?: Config;
  }): void {
    if (this.isInitialized) {
      throw new Error('This TopperWebSdk instance was already initialized.');
    }

    this.isInitialized = true;
    this.setConfig(config);

    const baseUrl = this.config.environment === Environments.SANDBOX ? Urls.SANDBOX : Urls.PRODUCTION;
    const isTopperSelfEmbed = window.location.href === Urls.WEBSITE;

    const queryParams = {
      bt: bootstrapToken,
      ...(isTopperSelfEmbed && { embed: 1 }),
      ...(this.config.theme && { theme: this.config.theme }),
      ...(this.config.is_android_app && { is_android_app: 1 }),
      ...(this.config.is_ios_app && { is_ios_app: 1 })
    };

    const url = queryString.stringifyUrl({ query: queryParams, url: `${baseUrl}/` });

    if (this.config.variant === Variants.IFRAME) {
      if (!iframeElement) {
        throw new Error('iframeElement is required for iframe variant');
      }

      iframeElement.src = url;
      this.targetWindow = iframeElement.contentWindow;
    } else if (this.config.variant === Variants.NEW_TAB) {
      this.targetWindow = window.open(url, '_blank');
    } else if (this.config.variant === Variants.SAME_TAB) {
      window.location.href = url;

      return;
    }

    this.initializeMessageListener();
  }

  on(eventName: Events, handler: EventHandler): void {
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }

    this.eventHandlers[eventName]?.push(handler);
  }
}

export { TopperWebSdk };
