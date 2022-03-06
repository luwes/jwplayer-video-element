import { publicPromise } from './utils.js';

/**
 * Video Base Element
 * The goal is to create an element that works just like the video element
 * but can be extended/sub-classed, because native elements cannot be
 * extended today across browsers.
 */

/*
  Copyright (c) 2020 Mux, Inc.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
 */

class VideoBaseElement extends HTMLElement {
  constructor() {
    super();
    // This promise should be resolved by the consumer of this class
    // when the native element is available.
    this.loadComplete = publicPromise();

    this.querySelectorAll(':scope > track').forEach(async (track) => {
      if (!this.loadComplete.resolved) await this.loadComplete;

      this.nativeEl?.append(track.cloneNode());
    });

    // Watch for child adds/removes and update the native element if necessary
    const mutationCallback = async (mutationsList) => {
      if (!this.loadComplete.resolved) await this.loadComplete;

      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          // Child being removed
          mutation.removedNodes.forEach((node) => {
            this.nativeEl?.querySelector(`track[src="${node.src}"]`)?.remove();
          });

          mutation.addedNodes.forEach((node) => {
            if (node.tagName === 'TRACK') {
              this.nativeEl?.append(node.cloneNode());
            }
          });
        }
      }
    };

    const observer = new MutationObserver(mutationCallback);
    observer.observe(this, { childList: true, subtree: false });
  }

  get nativeEl() {
    return this.querySelector('video');
  }

  // observedAttributes is required to trigger attributeChangedCallback
  // for any attributes on the custom element.
  // Attributes need to be the lowercase word, e.g. crossorigin, not crossOrigin
  static get observedAttributes() {
    let attrs = [];

    // Instead of manually creating a list of all observed attributes,
    // observe any getter/setter prop name (lowercased)
    Object.getOwnPropertyNames(this.prototype).forEach((propName) => {
      let isFunc = false;

      // Non-func properties throw errors because it's not an instance
      try {
        if (typeof this.prototype[propName] === 'function') {
          isFunc = true;
        }
      } catch (e) {
        // ignore
      }

      // Exclude functions and constants
      if (!isFunc && propName !== propName.toUpperCase()) {
        attrs.push(propName.toLowerCase());
      }
    });

    // Include any attributes from the super class (recursive)
    const supAttrs = Object.getPrototypeOf(this).observedAttributes;

    if (supAttrs) {
      attrs = attrs.concat(supAttrs);
    }

    return attrs;
  }

  // We need to handle sub-class custom attributes differently from
  // attrs meant to be passed to the internal native el.
  async attributeChangedCallback(attrName, oldValue, newValue) {
    if (!this.loadComplete.resolved) await this.loadComplete;

    // Find the matching prop for custom attributes
    const ownProps = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    const propName = arrayFindAnyCase(ownProps, attrName);

    // Check if this is the original custom native elemnt or a subclass
    const isBaseElement =
      Object.getPrototypeOf(this.constructor)
        .toString()
        .indexOf('function HTMLElement') === 0;

    // If this is a subclass custom attribute we want to set the
    // matching property on the subclass
    if (propName && !isBaseElement) {
      // Boolean props should never start as null
      if (typeof this[propName] == 'boolean') {
        // null is returned when attributes are removed i.e. boolean attrs
        if (newValue === null) {
          this[propName] = false;
        } else {
          // The new value might be an empty string, which is still true
          // for boolean attributes
          this[propName] = true;
        }
      } else {
        this[propName] = newValue;
      }
    } else {
      // When this is the original Custom Element, or the subclass doesn't
      // have a matching prop, pass it through.
      if (newValue === null) {
        this.nativeEl.removeAttribute(attrName);
      } else {
        // Ignore a few that don't need to be passed through just in case
        // it creates unexpected behavior.
        if (['id', 'class'].indexOf(attrName) === -1) {
          this.nativeEl.setAttribute(attrName, newValue);
        }
      }
    }
  }
}

// Map all native element properties to the custom element
// so that they're applied to the native element.
// Skipping HTMLElement because of things like "attachShadow"
// causing issues. Most of those props still need to apply to
// the custom element.
// But includign EventTarget props because most events emit from
// the native element.
let nativeElProps = [];

// Can't check typeof directly on element prototypes without
// throwing Illegal Invocation errors, so creating an element
// to check on instead.
const nativeElTest = document.createElement('video');

// Deprecated props throw warnings if used, so exclude them
const deprecatedProps = [
  'webkitDisplayingFullscreen',
  'webkitSupportsFullscreen',
];

// Walk the prototype chain up to HTMLElement.
// This will grab all super class props in between.
// i.e. VideoElement and MediaElement
for (
  let proto = Object.getPrototypeOf(nativeElTest);
  proto && proto !== HTMLElement.prototype;
  proto = Object.getPrototypeOf(proto)
) {
  Object.keys(proto).forEach((key) => {
    if (deprecatedProps.indexOf(key) === -1) {
      nativeElProps.push(key);
    }
  });
}

// For the video element we also want to pass through all event listeners
// because all the important events happen there.
nativeElProps = nativeElProps.concat(Object.keys(EventTarget.prototype));

// Passthrough native el functions from the custom el to the native el
nativeElProps.forEach((prop) => {
  const type = typeof nativeElTest[prop];

  if (type == 'function') {
    // Function
    VideoBaseElement.prototype[prop] = async function () {
      if (!this.loadComplete.resolved) await this.loadComplete;
      return this.nativeEl[prop].apply(this.nativeEl, arguments);
    };
  } else {
    // Getter
    let config = {
      get() {
        return this.nativeEl?.[prop];
      },
    };

    if (prop !== prop.toUpperCase()) {
      // Setter (not a CONSTANT)
      config.set = async function (val) {
        if (!this.loadComplete.resolved) await this.loadComplete;
        this.nativeEl[prop] = val;
      };
    }

    Object.defineProperty(VideoBaseElement.prototype, prop, config);
  }
});

function arrayFindAnyCase(arr, word) {
  let found = null;

  arr.forEach((item) => {
    if (item.toLowerCase() == word.toLowerCase()) {
      found = item;
    }
  });

  return found;
}

export default VideoBaseElement;
