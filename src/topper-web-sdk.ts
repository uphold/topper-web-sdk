import { Config } from './interfaces';
import { Environments, Events, Handlers, Sources, Urls, Variants } from './enums';
import { EventHandler, Handler } from 'types';
import isPromise from 'utils/isPromise';
import queryString from 'query-string';

class TopperWebSdk {
  private eventHandlers: { [key in Events]?: EventHandler[] } = {};
  private handlers: { [key in Handlers]?: Handler } = {};
  private handleMessage: ((event: MessageEvent) => void) | null = null;
  private isInitialized: boolean = false;
  private targetWindow: Window | null = null;

  public config: Config;

  constructor(config: Config = {}) {
    this.config = {
      environment: Environments.PRODUCTION,
      is_android_app: false,
      is_ios_app: false,
      use_assets: false,
      variant: Variants.NEW_TAB,
      ...config
    };
  }

  static getMainWindow() {
    return window.self !== window.top ? window.parent : window.opener;
  }

  static resolveHandler(handlerName: Handlers): Promise<void> {
    const mainWindow = this.getMainWindow();

    mainWindow.postMessage(
      {
        name: Events.RESOLVE_HANDLER,
        payload: handlerName,
        source: Sources.HANDLER
      },
      '*'
    );

    return new Promise(resolve => {
      window.addEventListener('message', event => {
        if (event.data.name === Events.RESOLVE_HANDLER && event.data.payload && event.data.source === Sources.HANDLER) {
          resolve(event.data.payload);
        }
      });
    });
  }

  static triggerEvent(eventName: Events, data?: any): void {
    const mainWindow = this.getMainWindow();

    if (!mainWindow) {
      return;
    }

    mainWindow.postMessage(
      {
        name: eventName,
        payload: data,
        source: Sources.EVENT
      },
      '*'
    );
  }

  private triggerEvent(name: Events, payload?: any): void {
    this.eventHandlers[Events.ALL]?.forEach(handler => handler({ data: payload, name }));

    this.eventHandlers[name]?.forEach(handler => handler({ data: payload }));
  }

  private initializeMessageListener(): void {
    this.handleMessage = (event: MessageEvent) => {
      const allowedOrigins = [Urls.PRODUCTION, Urls.SANDBOX];

      if (!allowedOrigins.includes(event.origin as Urls) || event.source !== this.targetWindow) {
        return;
      }

      if (event.data.name && event.data.source === Sources.EVENT) {
        this.triggerEvent(event.data.name as Events, event.data.payload);
      }

      if (event.data.name === Events.RESOLVE_HANDLER && event.data.payload && event.data.source === Sources.HANDLER) {
        this.resolveHandler(event.data.payload as Handlers);
      }
    };

    window.addEventListener('message', this.handleMessage);
  }

  dispose(): void {
    window.removeEventListener('message', this.handleMessage as EventListener, false);
    this.eventHandlers = {};
  }

  initialize({ bootstrapToken, iframeElement }: { bootstrapToken: string; iframeElement?: HTMLIFrameElement }): void {
    if (this.isInitialized) {
      throw new Error('This TopperWebSdk instance was already initialized.');
    }

    this.isInitialized = true;

    const baseUrl = this.config.environment === Environments.SANDBOX ? Urls.SANDBOX : Urls.PRODUCTION;
    const isTopperSelfEmbed = window.location.href.includes(Urls.WEBSITE);

    const queryParams = {
      bt: bootstrapToken,
      ...(isTopperSelfEmbed && { embed: 1 }),
      ...(this.config.theme && { theme: this.config.theme }),
      ...(this.config.is_android_app && { is_android_app: 1 }),
      ...(this.config.is_ios_app && { is_ios_app: 1 }),
      ...(this.config.use_assets && { use_assets: 1 })
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

  registerHandler(handlerName: Handlers, handler: Handler): void {
    if (!(typeof handler === 'function' || isPromise(handler))) {
      throw new Error('Handler must be a Promise or an async function.');
    }

    this.handlers[handlerName] = handler;
  }

  async resolveHandler(handlerName: Handlers) {
    const handler = this.handlers[handlerName];

    const handlerResult = isPromise(handler) ? await handler : await handler?.();

    this.targetWindow?.postMessage(
      {
        name: Events.RESOLVE_HANDLER,
        payload: handlerResult,
        source: Sources.HANDLER
      },
      '*'
    );
  }
}

export { TopperWebSdk };
