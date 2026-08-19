/*
  Hero 3D scene -- a small, bounded canvas (not full-page) rendering the
  LordGen mark's own 5-bar rhythm as a slowly rotating, pointer-reactive
  geometric cluster with thin connecting lines. Uses the globally-loaded
  `THREE` from vendor/three.min.js (see vendor/THREE_LICENSE.txt for why
  that's a pinned r160 classic script, not an ES module).

  Bails cheaply and silently -- leaving the canvas empty -- whenever THREE
  is unavailable, the viewport is mobile-width, the user prefers reduced
  motion, or WebGL isn't supported. In every bail case the already-built
  CSS hero background (styles.css) is the entire visual; there is nothing
  else to fall back to here.
*/
(function () {
  const MOBILE_QUERY = '(max-width: 860px)';
  const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
  const COARSE_POINTER_QUERY = '(pointer: coarse)';

  // Bar geometry lifted directly from the inline logo SVG in index.html:
  // 5 bars at x = 0, 22, 44, 66, 88 (14 wide, 8 gap), heights 60/84/108/84/60,
  // gold except the center (leaf), on a shared base plate.
  const BAR_HEIGHTS = [60, 84, 108, 84, 60];
  const BAR_X = [0, 22, 44, 66, 88];
  const BAR_WIDTH = 14;
  const CENTER_INDEX = 2;
  const UNIT = 0.045; // SVG px -> scene units

  function init() {
    if (typeof THREE === 'undefined') return;
    if (window.matchMedia(MOBILE_QUERY).matches) return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    // Feature-detect on a scratch canvas, never on the real one -- a canvas
    // can only bind one context for its lifetime, so probing #heroCanvas
    // directly here would leave THREE.WebGLRenderer unable to attach its
    // own context to it afterward.
    let supportsWebGL = false;
    try {
      const probe = document.createElement('canvas');
      supportsWebGL = !!(probe.getContext('webgl') || probe.getContext('experimental-webgl'));
    } catch (e) {
      supportsWebGL = false;
    }
    if (!supportsWebGL) return;

    const wrap = canvas.parentElement;
    let width = wrap.clientWidth;
    let height = wrap.clientHeight;
    if (width < 10 || height < 10) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 9);
    camera.lookAt(0, 0.4, 0);

    scene.add(new THREE.AmbientLight(0xf0e2bc, 0.55));
    const key = new THREE.PointLight(0xc9a24b, 22, 30);
    key.position.set(3, 4, 6);
    scene.add(key);
    const rim = new THREE.PointLight(0xe8e6e1, 8, 30);
    rim.position.set(-4, -2, 4);
    scene.add(rim);

    const group = new THREE.Group();
    scene.add(group);

    const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xc9a24b, metalness: 0.35, roughness: 0.42 });
    const leafMaterial = new THREE.MeshStandardMaterial({ color: 0xf0e2bc, metalness: 0.15, roughness: 0.35 });
    const barGeometryCache = {};

    function barGeometry(h) {
      const key = h;
      if (!barGeometryCache[key]) {
        barGeometryCache[key] = new THREE.BoxGeometry(BAR_WIDTH * UNIT, h * UNIT, BAR_WIDTH * UNIT);
      }
      return barGeometryCache[key];
    }

    const centerX = (BAR_X[0] + BAR_WIDTH / 2 + BAR_X[BAR_X.length - 1] + BAR_WIDTH / 2) / 2;
    const barTops = [];

    BAR_HEIGHTS.forEach((h, i) => {
      const mesh = new THREE.Mesh(barGeometry(h), i === CENTER_INDEX ? leafMaterial : goldMaterial);
      const x = (BAR_X[i] + BAR_WIDTH / 2 - centerX) * UNIT;
      const y = (h * UNIT) / 2;
      mesh.position.set(x, y, 0);
      group.add(mesh);
      barTops.push(new THREE.Vector3(x, h * UNIT, 0));
    });

    // Base plate, matching the SVG's baseline rect.
    const baseWidth = (BAR_X[BAR_X.length - 1] + BAR_WIDTH - BAR_X[0]) * UNIT;
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth, 6 * UNIT, BAR_WIDTH * UNIT),
      goldMaterial
    );
    base.position.set(0, -3 * UNIT, 0);
    group.add(base);

    // Sparse connecting lines between bar tops -- the "network" read.
    const linePositions = [];
    for (let i = 0; i < barTops.length - 1; i++) {
      linePositions.push(barTops[i].x, barTops[i].y, barTops[i].z);
      linePositions.push(barTops[i + 1].x, barTops[i + 1].y, barTops[i + 1].z);
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x8a6a24, transparent: true, opacity: 0.55 });
    group.add(new THREE.LineSegments(lineGeometry, lineMaterial));

    group.rotation.y = -0.35;
    group.rotation.x = 0.08;

    const allowParallax = !window.matchMedia(COARSE_POINTER_QUERY).matches;
    const pointerTarget = new THREE.Vector2(0, 0);
    const pointerCurrent = new THREE.Vector2(0, 0);

    if (allowParallax) {
      window.addEventListener('pointermove', (e) => {
        pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointerTarget.y = (e.clientY / window.innerHeight) * 2 - 1;
      });
    }

    let rafId = null;
    let running = false;
    let lastTime = performance.now();
    let autoRotationY = group.rotation.y;

    function frame(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      autoRotationY += dt * 0.18;
      group.rotation.y = autoRotationY;

      if (allowParallax) {
        pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.04;
        pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.04;
        group.rotation.y += pointerCurrent.x * 0.12; // bounded offset on top of autonomous drift, never compounds
        camera.position.x = pointerCurrent.x * 0.6;
        camera.position.y = 0.4 - pointerCurrent.y * 0.3;
        camera.lookAt(0, 0.4, 0);
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    // A reduced-motion toggle mid-session should stop the loop immediately,
    // not just be checked once at load.
    const reducedMotionMedia = window.matchMedia(REDUCED_MOTION_QUERY);
    const handleReducedMotionChange = (e) => {
      if (e.matches) {
        stop();
        renderer.clear();
      } else {
        start();
      }
    };
    if (reducedMotionMedia.addEventListener) {
      reducedMotionMedia.addEventListener('change', handleReducedMotionChange);
    }

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = wrap.clientWidth;
        height = wrap.clientHeight;
        if (width < 10 || height < 10) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }, 120);
    });

    start();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
