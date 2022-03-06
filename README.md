# `<jwplayer-video>`

A custom element (web component) for the JW player.

The element API matches the HTML5 `<video>` tag, so it can be easily swapped with other media, and be compatible with other UI components that work with the video tag.

One of the goals was to have `<jwplayer-video>` seamlessly integrate with [Media Chrome](https://github.com/muxinc/media-chrome).

> 🙋 Looking for a YouTube video element? Check out [`<youtube-video>`](https://github.com/muxinc/youtube-video-element).

## Example

```html
<html>
  <head>
    <script
      type="module"
      src="https://unpkg.com/jwplayer-video-element@0"
    ></script>
  </head>
  <body>
    <jwplayer-video
      controls
      src="https://cdn.jwplayer.com/players/C8YE48zj-IxzuqJ4M.html"
    ></jwplayer-video>
  </body>
</html>
```

## Installing

`<jwplayer-video>` is packaged as a javascript module (es6) only, which is supported by all evergreen browsers and Node v12+.

### Loading into your HTML using `<script>`

```html
<head>
  <script
    type="module"
    src="https://unpkg.com/jwplayer-video-element@0"
  ></script>
</head>
```

### Adding to your app via `npm`

```bash
npm install jwplayer-video-element --save
```

Or yarn

```bash
yarn add jwplayer-video-element
```

Include in your app javascript (e.g. src/App.js)

```js
import 'jwplayer-video-element';
```

This will register the custom elements with the browser so they can be used as HTML.
