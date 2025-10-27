# Topper Web SDK

This web SDK is designed to help developers to integrate Topper into their web applications.

## Installation

```bash
# Using yarn
$ yarn add @uphold/topper-web-sdk

# Using npm
$ npm install @uphold/topper-web-sdk
```

## Usage

### Creating an instance

First, create an instance of `TopperWebSdk`:

```javascript
import { TopperWebSdk } from '@uphold/topper-web-sdk';

const topper = new TopperWebSdk();
```

Where a `config` object can be passed to the constructor:

| Property           | Default Value | Values                                         |
| ------------------ | ------------- | ---------------------------------------------- |
| environment        | `production`  | `production`, `sandbox`                        |
| initial_screen     |               | `authentication`                               |
| is_android_webview | `false`       | `true`, `false`                                |
| is_ios_webview     | `false`       | `true`, `false`                                |
| locale             | `en`          | `en`, `en-US`, `pt`, `pt-BR`, `es`, `es-ES`    |
| theme              | `dark`        | `dark`, `light`                                |
| variant            | `new-tab`     | `new-tab`, `same-tab`, `iframe`                |

> [!IMPORTANT]  
> The parameters `is_ios_app` and `is_android_app` have been **renamed** to `is_ios_webview` and `is_android_webview`.
> The legacy parameters are still supported but **deprecated**.
> Please migrate to the new parameter names to ensure compatibility in future major versions.

### Initiate Topper

```javascript
import { TOPPER_ENVIRONMENTS, TOPPER_VARIANTS, TopperWebSdk } from '@uphold/topper-web-sdk';

// Open in a new tab (default).
const topper = new TopperWebSdk();

topper.initialize({ bootstrapToken: <bootstrap token> });

// Open in an iframe.
const topper = new TopperWebSdk({ variant: TOPPER_VARIANTS.IFRAME });
const topperIframe = document.getElementById('topper-iframe');

topper.initialize({ bootstrapToken: <bootstrap token>, iframeElement: topperIframe });

// Open in the same tab.
const topper = new TopperWebSdk({ variant: TOPPER_VARIANTS.SAME_TAB });

topper.initialize({ bootstrapToken: <bootstrap token> });

// Open sandbox environment.
const topper = new TopperWebSdk({ environment: TOPPER_ENVIRONMENTS.SANDBOX });

topper.initialize({ bootstrapToken: <bootstrap token> });

// Open with specific locale.
const topper = new TopperWebSdk({ locale: TOPPER_LOCALES.PT });

// Open with light theme.
const topper = new TopperWebSdk({ theme: TOPPER_THEMES.LIGHT });

topper.initialize({ bootstrapToken: <bootstrap token> });

// Override initial config if needed.
const topper = new TopperWebSdk();

topper.initialize({ bootstrapToken: <bootstrap token>, config: { variant: TOPPER_VARIANTS.SAME_TAB } });
```

### Event Handling

Listen to single events like order placed or all events:

Single event:

```javascript
const topper = new TopperWebSdk();

topper.on(TOPPER_EVENTS.ORDER_PLACED, ({ data }) => {});

topper.initialize({ bootstrapToken: <bootstrap token> });
``` 

All events:

```javascript
const topper = new TopperWebSdk();

topper.on(TOPPER_EVENTS.ALL, ({ data, name }) => {});

topper.initialize({ bootstrapToken: <bootstrap token> });
``` 

### Multiple instances

You can initiate Topper on multiple instances, and listen to events like:

```javascript
const topperIframe1 = new TopperWebSdk({ variant: TOPPER_VARIANTS.IFRAME });
const topperIframe2 = new TopperWebSdk({ variant: TOPPER_VARIANTS.IFRAME });

const topperIframe1Element = document.getElementById('topper-iframe-1');
const topperIframe2Element = document.getElementById('topper-iframe-2');

topperIframe1.on(TOPPER_WEB_SDK_EVENTS.ORDER_PLACED, ({ data }) => {});
topperIframe2.on(TOPPER_WEB_SDK_EVENTS.ORDER_PLACED, ({ data }) => {});

topperIframe1.initialize({ bootstrapToken: <bootstrap token>, iframeElement: topperIframe1Element });
topperIframe2.initialize({ bootstrapToken: <bootstrap token>, iframeElement: topperIframe2Element });
```

### Triggering Events

Used by `@uphold/topper-web` to trigger events:

Trigger events:

```javascript
TopperWebSdk.triggerEvent(TOPPER_EVENTS.ORDER_PLACED, data);
```

## Issues

For reporting issues, bugs, or feature requests, please use the [GitHub Issues page](https://github.com/uphold/topper-web-sdk/issues).

## Release process

The release of a version is automated via the release GitHub workflow. Run it by clicking the "Run workflow" button.

## License

This project is licensed under the MIT License. See the LICENSE file in the GitHub repository for more details.
