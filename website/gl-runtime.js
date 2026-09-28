/*
  WebGL runtime -- owns the capability gate and the three.js download for every
  3D scene on the page.

  Why this exists: vendor/three.min.js is ~670 KB and was loaded unconditionally
  from index.html on every visit, including the mobile and reduced-motion visits
  where hero3d.js gates itself off and never touches THREE at all. Moving the
  download behind the same gate the scenes already use means those visitors now
  fetch ~155 KB brotli LESS than before, on exactly the devices Lighthouse
  weights hardest.

  Scenes ask for `LordGenGL.whenReady()` and get either the THREE namespace or
  null. Null is a normal outcome, not an error -- it means "this visitor does not
  get 3D", and the CSS hero background in styles.css is the whole visual.

  The loader injects a classic <script> with a RELATIVE src. Both details are
  load-bearing: the pinned r160 build is a UMD global (see vendor/THREE_LICENSE.txt)
  rather than an ES module, and a relative path is what keeps the page working when
  opened straight off disk via file://, which README.md documents as the primary
  run mode.
*/
(function () {
  const MOBILE_QUERY = '(max-width: 860px)';
  const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
  const THREE_SRC = 'vendor/three.min.js';

  // Feature-detect on a scratch canvas, never on a canvas a renderer will later
  // want. A canvas binds one context for its lifetime, so probing the real one
  // leaves THREE.WebGLRenderer unable to attach to it afterward. (This comment
  // is carried over from hero3d.js, where the bug was originally found.)
  function supportsWebGL() {
    try {
      const probe = document.createElement('canvas');
      return !!(probe.getContext('webgl') || probe.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  function gatePasses() {
    if (window.matchMedia(MOBILE_QUERY).matches) return false;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return false;
    return supportsWebGL();
  }

  let loadPromise = null;

  function loadThree() {
    if (loadPromise) return loadPromise;

    loadPromise = new Promise(function (resolve, reject) {
      if (typeof THREE !== 'undefined') {
        resolve(THREE);
        return;
      }
      const script = document.createElement('script');
      script.src = THREE_SRC;
      script.async = false;
      script.onload = function () {
        if (typeof THREE !== 'undefined') resolve(THREE);
        else reject(new Error('three.min.js loaded but THREE is undefined'));
      };
      script.onerror = function () {
        reject(new Error('three.min.js failed to load'));
      };
      document.head.appendChild(script);
    });

    return loadPromise;
  }

  /*
    Resolves with the THREE namespace, or null when this visitor does not get 3D
    -- gated off, or the download failed. Never rejects: a scene that cannot run
    is a normal branch here, and making callers write try/catch around a
    progressive enhancement invites one of them to forget and break the page.
  */
  function whenReady() {
    if (!gatePasses()) return Promise.resolve(null);
    return loadThree().catch(function (err) {
      if (window.console && console.warn) console.warn('[gl-runtime]', err.message);
      return null;
    });
  }

  window.LordGenGL = {
    whenReady: whenReady,
    gatePasses: gatePasses,
    supportsWebGL: supportsWebGL,
    MOBILE_QUERY: MOBILE_QUERY,
    REDUCED_MOTION_QUERY: REDUCED_MOTION_QUERY
  };
})();
