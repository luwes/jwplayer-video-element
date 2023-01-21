# `<jwplayer-video>`

A custom element (web component) for the JW player.

The element API matches the HTML5 `<video>` tag, so it can be easily swapped with other media, and be compatible with other UI components that work with the video tag.

One of the goals was to have `<jwplayer-video>` seamlessly integrate with [Media Chrome](https://github.com/muxinc/media-chrome).

> 🙋 Looking for a YouTube video element? Check out [`<youtube-video>`](https://github.com/muxinc/youtube-video-element).

## Example ([CodeSandbox](https://codesandbox.io/s/jwplayer-video-element-gm5qd1))

<!-- prettier-ignore -->
```html
<script type="module" src="https://cdn.jsdelivr.net/npm/jwplayer-video-element@0.2/+esm"></script>
<jwplayer-video controls src="https://cdn.jwplayer.com/players/C8YE48zj-IxzuqJ4M.html"></jwplayer-video>
```

## Installing

`<jwplayer-video>` is packaged as a javascript module (es6) only, which is supported by all evergreen browsers and Node v12+.

### Loading into your HTML using `<script>`

<!-- prettier-ignore -->
```html
<script type="module" src="https://cdn.jsdelivr.net/npm/jwplayer-video-element@0.2/+esm"></script>
```

### Adding to your app via `npm`

```bash
npm install jwplayer-video-element --save
```

Include in your app javascript (e.g. src/App.js)

```js
import 'jwplayer-video-element';
```

This will register the custom elements with the browser so they can be used as HTML.

## Related

- [Media Chrome](https://github.com/muxinc/media-chrome) Your media player's dancing suit. 🕺
- [`<mux-video>`](https://github.com/muxinc/elements/tree/main/packages/mux-video) A Mux-flavored HTML5 video element w/ hls.js and Mux data builtin.
- [`<youtube-video>`](https://github.com/muxinc/youtube-video-element) A web component for the YouTube player.
- [`<vimeo-video>`](https://github.com/luwes/vimeo-video-element) A web component for the Vimeo player.
- [`<wistia-video>`](https://github.com/luwes/wistia-video-element) A web component for the Wistia player.
- [`<hls-video>`](https://github.com/muxinc/hls-video-element) A web component for playing HTTP Live Streaming (HLS) videos.
- [`castable-video`](https://github.com/muxinc/castable-video) Cast your video element to the big screen with ease!
- [`<mux-player>`](https://github.com/muxinc/elements/tree/main/packages/mux-player) The official Mux-flavored video player web component.
