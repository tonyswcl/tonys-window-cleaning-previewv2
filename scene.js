/* =========================================================
   Hero 3D scene — floating glass water droplets (Three.js)
   Crystal Clean theme. Lightweight, mobile-friendly,
   respects prefers-reduced-motion.
   ========================================================= */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('bg');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas) {
  let renderer, scene, camera, droplets = [], frameId, env;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const clock = new THREE.Clock();

  function init() {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 16);

    // Environment for realistic glass refraction
    const pmrem = new THREE.PMREMGenerator(renderer);
    env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;

    // Lights for sparkle highlights
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(5, 8, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xbae6fd, 1.2);
    fill.position.set(-6, -3, 4);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    // Water-like glass material
    const glassMat = new THREE.MeshPhysicalMaterial({
      transmission: 1,
      thickness: 1.2,
      roughness: 0.04,
      ior: 1.33,           // water
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.4,
      attenuationColor: new THREE.Color(0xbae6fd),
      attenuationDistance: 4,
      color: new THREE.Color(0xeaf7ff),
    });

    const tintMat = glassMat.clone();
    tintMat.attenuationColor = new THREE.Color(0x7dd3fc);
    tintMat.attenuationDistance = 2.5;

    const count = window.innerWidth < 760 ? 9 : 16;
    const sphereGeo = new THREE.SphereGeometry(1, 48, 48);

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(sphereGeo, Math.random() > 0.6 ? tintMat : glassMat);
      const s = THREE.MathUtils.randFloat(0.5, 1.7);
      mesh.scale.setScalar(s);
      mesh.position.set(
        THREE.MathUtils.randFloatSpread(22),
        THREE.MathUtils.randFloatSpread(14),
        THREE.MathUtils.randFloat(-6, 6)
      );
      mesh.userData = {
        speed: THREE.MathUtils.randFloat(0.15, 0.5),
        amp: THREE.MathUtils.randFloat(0.3, 1),
        phase: Math.random() * Math.PI * 2,
        baseY: mesh.position.y,
        baseX: mesh.position.x,
        spin: THREE.MathUtils.randFloat(-0.2, 0.2),
      };
      droplets.push(mesh);
      scene.add(mesh);
    }

    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onPointerMove(e) {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  function animate() {
    frameId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth parallax
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    camera.position.x += (pointer.x * 1.6 - camera.position.x) * 0.05;
    camera.position.y += (-pointer.y * 1.0 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    for (const d of droplets) {
      const u = d.userData;
      d.position.y = u.baseY + Math.sin(t * u.speed + u.phase) * u.amp;
      d.position.x = u.baseX + Math.cos(t * u.speed * 0.7 + u.phase) * (u.amp * 0.4);
      d.rotation.y += u.spin * 0.01;
      d.rotation.x += u.spin * 0.006;
    }

    renderer.render(scene, camera);
  }

  // Pause rendering when hero is off-screen (perf)
  function setupVisibilityPause() {
    const hero = document.getElementById('hero');
    if (!('IntersectionObserver' in window) || !hero) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          if (!frameId) animate();
        } else {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
      });
    }, { threshold: 0.02 });
    io.observe(hero);
  }

  try {
    init();
    if (reduceMotion) {
      renderer.render(scene, camera); // single static frame
    } else {
      animate();
      setupVisibilityPause();
    }
  } catch (err) {
    // Graceful fallback: CSS gradient hero already shows if WebGL fails
    console.warn('3D hero unavailable, using gradient fallback.', err);
    canvas.style.display = 'none';
  }
}
