import { SuperVideoElement } from 'super-media-element';
import { loadScript, promisify, PublicPromise } from './utils.js';

const templateLightDOM = document.createElement('template');
templateLightDOM.innerHTML = `
<style class="jw-style">
  .jw-no-controls [class*="jw-controls"],
  .jw-no-controls .jw-title {
    display: none !important;
  }
</style>
<div class="jwplayer"></div>
`;

const templateShadowDOM = document.createElement('template');
templateShadowDOM.innerHTML = `
<style>
  :host {
    width: 100%;
  }
</style>
`;

class JWPlayerVideoElement extends SuperVideoElement {
  static template = templateShadowDOM;

  constructor() {
    super();
    this.shadowRoot.append(templateShadowDOM.content.cloneNode(true));

    this.loadComplete = new PublicPromise();
  }

  get nativeEl() {
    return this.querySelector('.jw-video');
  }

  async load() {
    if (this.hasLoaded) this.loadComplete = new PublicPromise();
    this.hasLoaded = true;

    this.loadComplete.then(() => {
      this.volume = 1;
    });

    // Wait 1 tick to allow other attributes to be set.
    await Promise.resolve();

    // e.g. https://cdn.jwplayer.com/players/C8YE48zj-IxzuqJ4M.html
    const MATCH_SRC = /jwplayer\.com\/players\/(\w+)(?:-(\w+))?/i;
    const [, videoId, playerId] = this.src.match(MATCH_SRC);
    const mediaUrl = `https://cdn.jwplayer.com/v2/media/${videoId}`;
    const media = await (await fetch(mediaUrl)).json();
    const scriptUrl = `https://content.jwplatform.com/libraries/${playerId}.js`;
    const JW = await loadScript(scriptUrl, 'jwplayer');

    // Sadly the JW player setup/render will not work in the shadow DOM.
    this.querySelector('.jw-style')?.remove();
    this.querySelector('.jwplayer')?.remove();
    this.append(templateLightDOM.content.cloneNode(true));

    this.api = JW(this.querySelector('.jwplayer')).setup({
      width: '100%',
      height: '100%',
      preload: this.getAttribute('preload') ?? 'metadata',
      ...media,
    });

    await promisify(this.api.on, this.api)('ready');

    this.api.getContainer().classList.toggle('jw-no-controls', !this.controls);

    this.dispatchEvent(new Event('loadcomplete'));
    this.loadComplete.resolve();
  }

  async attributeChangedCallback(attrName, oldValue, newValue) {
    // This is required to come before the await for resolving loadComplete.
    if (attrName === 'src' && newValue) {
      this.load();
      return;
    }

    super.attributeChangedCallback(attrName, oldValue, newValue);

    // Don't await super.attributeChangedCallback above, it would resolve later.
    await this.loadComplete;

    switch (attrName) {
      case 'controls':
        this.api
          .getContainer()
          .classList.toggle('jw-no-controls', !this.controls);
        break;
      case 'muted':
        this.muted = this.getAttribute('muted') != null;
        break;
    }
  }

  get paused() {
    return this.nativeEl?.paused ?? true;
  }

  get src() {
    return this.getAttribute('src');
  }

  set src(val) {
    if (this.src == val) return;
    this.setAttribute('src', val);
  }

  set controls(val) {
    if (this.controls == val) return;

    if (val) {
      this.setAttribute('controls', '');
    } else {
      // Remove boolean attribute if false, 0, '', null, undefined.
      this.removeAttribute('controls');
    }
  }

  get controls() {
    return this.getAttribute('controls') != null;
  }
}

if (
  globalThis.customElements.get('jwplayer-video') ||
  globalThis.JWPlayerVideoElement
) {
  console.debug(
    'JWPlayerVideoElement: <jwplayer-video> defined more than once.'
  );
} else {
  globalThis.JWPlayerVideoElement = JWPlayerVideoElement;
  globalThis.customElements.define('jwplayer-video', JWPlayerVideoElement);
}

export default JWPlayerVideoElement;
