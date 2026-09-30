/*
  Hero 3D scene -- a small, bounded canvas (not full-page) rendering the
  LordGen mark's own 5-bar rhythm as a slowly rotating, pointer-reactive
  geometric cluster with thin connecting lines. Gets `THREE` from
  gl-runtime.js, which owns the capability gate and downloads
  vendor/three.min.js only when that gate passes (see vendor/THREE_LICENSE.txt
  for why that's a pinned r160 classic script, not an ES module).

  Bails cheaply and silently -- leaving the canvas empty -- whenever the
  runtime declines to supply THREE (mobile width, reduced motion, no WebGL,
  or the download failed). In every bail case the already-built CSS hero
  background (styles.css) is the entire visual; there is nothing else to
  fall back to here.
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
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

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

    scene.add(new THREE.AmbientLight(0xf0e2bc, 0.35));
    const key = new THREE.PointLight(0xc9a24b, 18, 30);
    key.position.set(3, 4, 6);
    scene.add(key);
    const rim = new THREE.PointLight(0xe8e6e1, 7, 30);
    rim.position.set(-4, -2, 4);
    scene.add(rim);

    /*
      Environment map for real metal response.

      Point lights alone give metal nothing to reflect, which is why the bars
      previously read as flat gold shapes rather than as metal. PMREM needs a
      source; RoomEnvironment lives in examples/jsm and is NOT in the pinned
      r160 UMD build, so the source is built here by hand -- a tiny
      equirectangular ramp (ink at the bottom, gold above, two bright studio
      strips) run through PMREMGenerator. Costs one 64x32 texture and no
      downloads.
    */
    function buildEnvironment() {
      const W = 64, H = 32;
      const data = new Float32Array(W * H * 4);
      for (let y = 0; y < H; y++) {
        const v = y / (H - 1);
        // vertical ramp: ink below the horizon, warm gold above
        let r = 0.04 + v * 0.55;
        let g = 0.035 + v * 0.42;
        let b = 0.03 + v * 0.18;
        for (let x = 0; x < W; x++) {
          const u = x / (W - 1);
          // two soft highlight strips -- the specular the chamfers catch
          const s1 = Math.exp(-Math.pow((u - 0.22) / 0.06, 2)) * Math.exp(-Math.pow((v - 0.78) / 0.16, 2));
          const s2 = Math.exp(-Math.pow((u - 0.68) / 0.09, 2)) * Math.exp(-Math.pow((v - 0.62) / 0.2, 2));
          const s = s1 * 2.6 + s2 * 1.4;
          const i = (y * W + x) * 4;
          data[i] = r + s;
          data[i + 1] = g + s * 0.92;
          data[i + 2] = b + s * 0.72;
          data[i + 3] = 1;
        }
      }
      const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat, THREE.FloatType);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.needsUpdate = true;

      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      const envRT = pmrem.fromEquirectangular(tex);
      tex.dispose();
      pmrem.dispose();
      return envRT.texture;
    }

    scene.environment = buildEnvironment();

    const group = new THREE.Group();
    scene.add(group);

    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc9a24b, metalness: 0.92, roughness: 0.24,
      envMapIntensity: 1.15
    });
    const leafMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf0e2bc, metalness: 0.55, roughness: 0.18,
      clearcoat: 0.3, clearcoatRoughness: 0.25,
      emissive: 0xf0e2bc, emissiveIntensity: 0.16,
      envMapIntensity: 1.3
    });
    const barGeometryCache = {};

    /*
      Chamfered bars, not boxes. The bevel is the whole point: a hard 90-degree
      edge catches no specular, so a box renders as a flat silhouette however
      good the lighting is. A small chamfer picks up a bright line along every
      edge, which is what separates "rendered" from "modelled". ExtrudeGeometry
      is core API; RoundedBoxGeometry is not in the UMD build.
    */
    function barGeometry(h) {
      if (!barGeometryCache[h]) {
        const w = BAR_WIDTH * UNIT;
        const hh = h * UNIT;
        const bevel = Math.min(0.014, w * 0.16);
        const shape = new THREE.Shape();
        shape.moveTo(-w / 2 + bevel, -hh / 2 + bevel);
        shape.lineTo(w / 2 - bevel, -hh / 2 + bevel);
        shape.lineTo(w / 2 - bevel, hh / 2 - bevel);
        shape.lineTo(-w / 2 + bevel, hh / 2 - bevel);
        shape.closePath();
        barGeometryCache[h] = new THREE.ExtrudeGeometry(shape, {
          depth: w - bevel * 2,
          bevelEnabled: true,
          bevelSize: bevel,
          bevelThickness: bevel,
          bevelSegments: 2,
          curveSegments: 1
        });
        barGeometryCache[h].translate(0, 0, -(w - bevel * 2) / 2);
      }
      return barGeometryCache[h];
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

    /*
      Atmosphere: halo and dust. (Shafts are CSS -- see below.)

      All three are additive planes/sprites fed by canvas-generated textures
      rather than custom GLSL. Deliberate: EffectComposer (real bloom) and
      god-ray passes live in examples/jsm and are not in the r160 UMD build,
      and a hand-written shader here would be one more thing that can fail
      silently on a machine I cannot test. Canvas gradients are deterministic,
      inspectable, and cost one small texture each.
    */
    /*
      Additive blending onto a TRANSPARENT canvas needs custom factors.

      Plain THREE.AdditiveBlending adds source alpha into destination alpha as
      well as colour. The renderer here runs with alpha:true over the CSS hero
      glow, so that turns the canvas opaque wherever a glow element is drawn --
      and a dim, nearly-black opaque patch reads on screen as a dark rectangle
      sitting on top of the background. It looks like a rendering bug because
      it is one.

      These factors add colour (src*srcAlpha + dst) while leaving destination
      alpha untouched, which is what "glow over a transparent canvas" actually
      means.
    */
    function additiveOverAlpha(material) {
      material.blending = THREE.CustomBlending;
      material.blendSrc = THREE.SrcAlphaFactor;
      material.blendDst = THREE.OneFactor;
      material.blendSrcAlpha = THREE.ZeroFactor;
      material.blendDstAlpha = THREE.OneFactor;
      return material;
    }

    function radialTexture(stops) {
      const S = 128;
      const c = document.createElement('canvas');
      c.width = c.height = S;
      const g = c.getContext('2d').createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
      const ctx = c.getContext('2d');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, S, S);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    const atmosphere = new THREE.Group();
    scene.add(atmosphere);

    // Halo behind the emissive centre member -- stands in for bloom.
    const haloTexture = radialTexture([
      [0, 'rgba(240,226,188,0.55)'],
      [0.35, 'rgba(201,162,75,0.22)'],
      [1, 'rgba(201,162,75,0)']
    ]);
    const halo = new THREE.Sprite(additiveOverAlpha(new THREE.SpriteMaterial({
      map: haloTexture, depthWrite: false, transparent: true, opacity: 0.9
    })));
    halo.scale.set(3.2, 3.2, 1);
    halo.position.set(0, BAR_HEIGHTS[CENTER_INDEX] * UNIT * 0.72, -0.4);
    atmosphere.add(halo);

    // Dust motes. 320 points, one shared 32px sprite, no per-frame allocation.
    const DUST = 320;
    const dustPositions = new Float32Array(DUST * 3);
    const dustPhase = new Float32Array(DUST);
    for (let i = 0; i < DUST; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 7;
      dustPositions[i * 3 + 1] = Math.random() * 4.6 - 0.6;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 0.5;
      dustPhase[i] = Math.random() * Math.PI * 2;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dust = new THREE.Points(dustGeometry, additiveOverAlpha(new THREE.PointsMaterial({
      size: 0.035,
      map: radialTexture([[0, 'rgba(240,226,188,0.9)'], [1, 'rgba(240,226,188,0)']]),
      transparent: true, depthWrite: false, opacity: 0.5, sizeAttenuation: true
    })));
    atmosphere.add(dust);

    /*
      Light shafts are done in CSS, not here -- see .hero-3d::after in fx.css.

      They were built as additive GL planes first and rendered as a dark
      quadrilateral over the mark. Additive geometry on an alpha:true canvas
      composites against the page unpredictably: the canvas gains alpha where
      the glow is drawn, so a dim beam turns into an opaque patch that hides
      the CSS hero glow behind it. CSS mix-blend-mode: screen has no such
      problem, costs no draw calls, and keeps the GL budget for the geometry.
    */

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
    let elapsed = 0;
    let autoRotationY = group.rotation.y;

    function frame(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      autoRotationY += dt * 0.18;
      group.rotation.y = autoRotationY;

      // Atmosphere. elapsed drives everything; no allocation inside the loop.
      elapsed += dt;
      halo.material.opacity = 0.78 + Math.sin(elapsed * 0.9) * 0.14;
      // Dust drifts upward and wraps, so the field never empties.
      const dpos = dustGeometry.attributes.position.array;
      for (let i = 0; i < DUST; i++) {
        const y = i * 3 + 1;
        dpos[y] += dt * (0.045 + (i % 7) * 0.006);
        if (dpos[y] > 4.0) dpos[y] = -0.6;
        dpos[i * 3] += Math.sin(elapsed * 0.25 + dustPhase[i]) * dt * 0.012;
      }
      dustGeometry.attributes.position.needsUpdate = true;

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

  // The gate and the three.js download both live in gl-runtime.js now. A null
  // THREE is the ordinary "this visitor gets no 3D" branch, not a failure.
  function boot() {
    if (!window.LordGenGL) return;
    window.LordGenGL.whenReady().then(function (three) {
      if (three) init();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
