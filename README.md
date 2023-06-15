[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

# Nuxt Analytics

A Nuxt library for tracking custom events, page views, content/component views and identify visitors. Easily enable/disable channels and adapt event names and payload formats.

- [📖 &nbsp;Read the documentation](https://moirei.github.io/nuxt-analytics/)

## Features

- For [**Nuxt 3**](https://nuxt.com)
- ☑ Track custom events
- ☑ Track custom page views
- ☑ Track click or seen events on any element/component
- ☑ Auto track page views
- ☑ Per channel/event formatting with [Adapters](https://moirei.github.io/nuxt-analytics/guide/adapters)
- ☑ **9** inbuilt channels
- ☑ **2** inbuilt adapters
- ☑ Custom channels and adapters
- ☑ Queue system to avoid data loss with [p-queue](https://github.com/sindresorhus/p-queue)
- ☑ Analytics event hooks
- ☐ Typed event names and props
- ☐ Improved performance with [Partytown](https://partytown.builder.io/)
- [... and more](https://moirei.github.io/nuxt-analytics/)

## Quick Setup

1. Add `nuxt-analytics` dependency to your project

```bash
# Using pnpm
pnpm add -D @moirei/nuxt-analytics

# Using yarn
yarn add --dev @moirei/nuxt-analytics

# Using npm
npm install --save-dev @moirei/nuxt-analytics
```

2. Add `nuxt-analytics` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: ["@moirei/nuxt-analytics"],
});
```

## 💻 Development

- Clone repository
- Install dependencies using `yarn install`
- Prepare using `yarn prepare`

[npm-version-src]: https://img.shields.io/npm/v/@moirei/nuxt-analytics/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@moirei/nuxt-analytics
[npm-downloads-src]: https://img.shields.io/npm/dm/@moirei/nuxt-analytics.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@moirei/nuxt-analytics
[license-src]: https://img.shields.io/github/license/nuxt/content.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://github.com/nuxt/content/blob/main/LICENSE
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
[volta-src]: https://user-images.githubusercontent.com/904724/209143798-32345f6c-3cf8-4e06-9659-f4ace4a6acde.svg
[volta-href]: https://volta.net/nuxt/content?utm_source=readme_nuxt_content
