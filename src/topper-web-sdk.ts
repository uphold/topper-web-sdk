import { Config } from './interfaces';
import { Environments, Events, Handlers, Sources, Urls, Variants } from './enums';
import { EventHandler, Handler } from 'types';
import { InternalEvents } from './enums/internal-events';
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
      active_flow: null,
      environment: Environments.PRODUCTION,
      initial_screen: null,
      is_android_app: false,
      is_android_webview: false,
      is_ios_app: false,
      is_ios_webview: false,
      variant: Variants.NEW_TAB,
      ...config
    };
  }

  static getMainWindow() {
    return window.self !== window.top ? window.parent : window.opener;
  }

  static handle<T = any>(handlerName: Handlers, data?: any): Promise<T> {
    const mainWindow = this.getMainWindow();

    mainWindow.postMessage(
      {
        name: InternalEvents.RESOLVE_HANDLER,
        payload: { data, handlerName },
        source: Sources.HANDLER
      },
      '*'
    );

    return new Promise((resolve, reject) => {
      const handleResponse = (event: MessageEvent) => {
        if (
          event.data.name === InternalEvents.RESOLVE_HANDLER &&
          event.data.payload &&
          event.data.source === Sources.HANDLER
        ) {
          window.removeEventListener('message', handleResponse);

          if (event.data.payload.error) {
            reject(event.data.payload.error);

            return;
          }

          resolve(event.data.payload);
        }
      };

      window.addEventListener('message', handleResponse);
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

  private setConfig(config: Config): void {
    this.config = { ...this.config, ...config };
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

      if (
        event.data.name === InternalEvents.RESOLVE_HANDLER &&
        event.data.payload &&
        event.data.source === Sources.HANDLER
      ) {
        this.resolveHandler(event.data.payload.handlerName as Handlers, event.data.payload.data);
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
    bootstrapTokens,
    config,
    iframeElement
  }: {
    bootstrapToken?: string;
    bootstrapTokens?: string[];
    iframeElement?: HTMLIFrameElement;
    config?: Config;
  }): void {
    if (this.isInitialized) {
      throw new Error('This TopperWebSdk instance was already initialized.');
    }

    this.isInitialized = true;

    if (config) {
      this.setConfig(config);
    }

    const baseUrl = this.config.environment === Environments.SANDBOX ? Urls.SANDBOX : Urls.PRODUCTION;
    const bt = bootstrapTokens ? bootstrapTokens.join(';') : bootstrapToken;
    const isTopperSelfEmbed = window.location.href.includes(Urls.WEBSITE);

    const queryParams = {
      bt,
      ...(this.config.active_flow && { active_flow: this.config.active_flow }),
      ...(isTopperSelfEmbed && { embed: 1 }),
      ...(this.eventHandlers &&
        Object.keys(this.eventHandlers).length && { events: Object.keys(this.eventHandlers).join(',') }),
      ...(this.handlers && Object.keys(this.handlers).length && { handlers: Object.keys(this.handlers).join(',') }),
      ...(this.config.is_android_app && { is_android_app: 1 }),
      ...(this.config.is_android_webview && { is_android_webview: 1 }),
      ...(this.config.is_ios_app && { is_ios_app: 1 }),
      ...(this.config.is_ios_webview && { is_ios_webview: 1 }),
      ...(this.config.initial_screen && { initial_screen: this.config.initial_screen }),
      ...(this.config.locale && { locale: this.config.locale }),
      ...(this.config.theme && { theme: this.config.theme })
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
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function.');
    }

    this.handlers[handlerName] = handler;
  }

  async resolveHandler(handlerName: Handlers, data?: any) {
    const handler = this.handlers[handlerName];

    if (!handler) {
      throw new Error(`Handler "${handlerName}" is not registered.`);
    }

    try {
      const handlerResult = await handler(data);

      this.targetWindow?.postMessage(
        {
          name: InternalEvents.RESOLVE_HANDLER,
          payload: handlerResult,
          source: Sources.HANDLER
        },
        '*'
      );
    } catch (error) {
      this.targetWindow?.postMessage(
        {
          name: InternalEvents.RESOLVE_HANDLER,
          payload: {
            error: {
              message: error instanceof Error ? error.message : String(error),
              name: error instanceof Error ? error.name : 'Error'
            }
          },
          source: Sources.HANDLER
        },
        '*'
      );
    }
  }
}

export { TopperWebSdk };
