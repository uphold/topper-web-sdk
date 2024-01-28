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

| Property       | Default Value | Values                             |
| -------------- | ------------- | ---------------------------------- |
| environment    | `production`  | `production`, `sandbox`            |
| is_android_app | `false`       | `true`, `false`                    |
| is_ios_app     | `false`       | `true`, `false`                    |
| theme          | `dark`        | `dark`, `light`                    |
| variant        | `new-tab`     | `new-tab`, `same-tab`, `iframe`    |

### Initiate Topper

```javascript
import { TOPPER_ENVIRONMENTS, TOPPER_VARIANTS, TopperWebSdk } from '@uphold/topper-web-sdk';

// Open in a new tab (default).
const topper = new TopperWebSdk();

topper.initialize({ bootstrapToken: 'XXXX' });

// Open in an iframe.
const topper = new TopperWebSdk({ variant: TOPPER_VARIANTS.IFRAME });
const topperIframe = document.getElementById('topper-iframe');

topper.initialize({ bootstrapToken: 'XXXX', iframeElement: topperIframe });

// Open in the same tab.
const topper = new TopperWebSdk({ variant: TOPPER_VARIANTS.SAME_TAB });

topper.initialize({ bootstrapToken: 'XXXX' });

// Open sandbox environment.
const topper = new TopperWebSdk({ environment: TOPPER_ENVIRONMENTS.SANDBOX });

topper.initialize({ bootstrapToken: 'XXXX' });

// Open with light theme.
const topper = new TopperWebSdk({ theme: TOPPER_THEMES.LIGHT });

topper.initialize({ bootstrapToken: 'XXXX' });

// Override initial config if needed.
const topper = new TopperWebSdk();

topper.initialize({ bootstrapToken: 'XXXX', config: { variant: TOPPER_VARIANTS.SAME_TAB } });
```

### Event Handling

Listen to single events like order placed or all events:

```javascript
// Single event.
topper.on(TOPPER_EVENTS.ORDER_PLACED, ({ data }) => {});

// All events.
topper.on(TOPPER_EVENTS.ALL, ({ data, name }) => {});
```

### Multiple instances

You can initiate Topper on multiple instances, and listen to events like:

```javascript
const topperIframe1 = new TopperWebSdk({ variant: TOPPER_VARIANTS.IFRAME });
const topperIframe2 = new TopperWebSdk({ variant: TOPPER_VARIANTS.IFRAME });

const topperIframe1Element = document.getElementById('topper-iframe-1');
const topperIframe2Element = document.getElementById('topper-iframe-2');

topperIframe1.initialize({ bootstrapToken: 'XXXX', iframeElement: topperIframe1Element });
topperIframe2.initialize({ bootstrapToken: 'XXXX', iframeElement: topperIframe2Element });

topperIframe1.on(TOPPER_WEB_SDK_EVENTS.ORDER_PLACED, ({ data }) => {});
topperIframe2.on(TOPPER_WEB_SDK_EVENTS.ORDER_PLACED, ({ data }) => {});
```

### Triggering Events

Used by `@uphold/topper-web` to trigger events:

Trigger events:

```javascript
TopperWebSdk.triggerEvent(TOPPER_EVENTS.ORDER_PLACED, data);
```

## Additional Information

For more detailed information, refer to the official [documentation](https://docs.topperpay.com/web-sdk). This guide covers basic usage and setup.

## Issues

For reporting issues, bugs, or feature requests, please use the [GitHub Issues page](https://github.com/uphold/topper-web-sdk/issues).

## Release process

The release of a version is automated via the release GitHub workflow. Run it by clicking the "Run workflow" button.

## License

This project is licensed under the MIT License. See the LICENSE file in the GitHub repository for more details.
