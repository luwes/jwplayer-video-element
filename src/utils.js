export async function loadScript(src, globalName) {
  if (globalName && self[globalName]) {
    return self[globalName];
  }
  return new Promise(function (resolve, reject) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(self[globalName]);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function promisify(fn) {
  return (...args) =>
    new Promise((resolve) => {
      fn(...args, (...res) => {
        if (res.length > 1) resolve(res);
        else resolve(res[0]);
      });
    });
}

/**
 * A utility to create Promises with convenient public resolve and reject methods.
 * @return {Promise}
 */
export function publicPromise() {
  let resolvePromise;
  let rejectPromise;

  let promise = new Promise(function (resolve, reject) {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  promise.resolve = (...args) => (
    (promise.resolved = true), resolvePromise(...args), promise
  );
  promise.reject = (...args) => (rejectPromise(...args), promise);

  return promise;
}
