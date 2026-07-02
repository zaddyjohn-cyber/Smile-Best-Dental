/* ============================================
   SMILE BEST DENTAL — THREE.JS HERO
   3D Tooth Scene with Particles
   ============================================ */

function initThreeHero() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || window.innerWidth <= 768) return;
  if (typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // ── LIGHTING ──
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x4A90D9, 2.5);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xC9963A, 1.2);
  fillLight.position.set(-4, -2, 3);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
  rimLight.position.set(0, 5, -4);
  scene.add(rimLight);

  const pointLight = new THREE.PointLight(0x4A90D9, 1.5, 12);
  pointLight.position.set(-2, 2, 3);
  scene.add(pointLight);

  // ── TOOTH GEOMETRY ──
  // Molar-like shape using a rounded box + bumps
  const toothGroup = new THREE.Group();
  scene.add(toothGroup);

  // Crown (top bulb of molar)
  const crownGeo = new THREE.SphereGeometry(1, 48, 32);
  // Squish it into molar proportions
  crownGeo.scale(1.1, 0.75, 0.9);

  const toothMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xF8F8FF,
    metalness: 0.05,
    roughness: 0.08,
    transmission: 0.1,
    thickness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 0.9,
    envMapIntensity: 1.5,
  });

  const crown = new THREE.Mesh(crownGeo, toothMaterial);
  crown.position.y = 0.2;
  toothGroup.add(crown);

  // Cusps (bumps on top of molar)
  const cuspPositions = [
    [-0.45, 0.65, -0.3], [0.45, 0.65, -0.3],
    [-0.45, 0.65, 0.3], [0.45, 0.65, 0.3],
    [0, 0.7, 0],
  ];

  cuspPositions.forEach(([x, y, z]) => {
    const cuspGeo = new THREE.SphereGeometry(0.22, 20, 16);
    const cusp = new THREE.Mesh(cuspGeo, toothMaterial);
    cusp.position.set(x, y, z);
    toothGroup.add(cusp);
  });

  // Root (elongated below)
  const rootGeo = new THREE.CylinderGeometry(0.18, 0.06, 1.2, 24);
  rootGeo.translate(0, -0.6, 0);
  const rootMat = new THREE.MeshPhysicalMaterial({
    color: 0xF0EAE0,
    metalness: 0.02,
    roughness: 0.3,
    clearcoat: 0.4,
  });

  [-0.25, 0, 0.25].forEach((xOffset) => {
    const root = new THREE.Mesh(rootGeo, rootMat);
    root.position.x = xOffset * (xOffset !== 0 ? 1.2 : 1);
    root.position.y = -0.7;
    toothGroup.add(root);
  });

  toothGroup.scale.set(0, 0, 0);

  // ── PARTICLE RING (orbit) ──
  const ringCount = 120;
  const ringGeo = new THREE.BufferGeometry();
  const ringPositions = new Float32Array(ringCount * 3);
  const ringSizes = new Float32Array(ringCount);

  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2;
    const radius = 2.8 + (Math.random() - 0.5) * 0.6;
    const heightOffset = (Math.random() - 0.5) * 0.8;
    ringPositions[i * 3]     = Math.cos(angle) * radius;
    ringPositions[i * 3 + 1] = heightOffset;
    ringPositions[i * 3 + 2] = Math.sin(angle) * radius;
    ringSizes[i] = Math.random() * 3 + 1;
  }

  ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
  ringGeo.setAttribute('size', new THREE.BufferAttribute(ringSizes, 1));

  const ringMat = new THREE.PointsMaterial({
    color: 0xC9963A,
    size: 0.04,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
  });

  const particleRing = new THREE.Points(ringGeo, ringMat);
  scene.add(particleRing);

  // ── BACKGROUND PARTICLES (deep field) ──
  const bgCount = 600;
  const bgGeo = new THREE.BufferGeometry();
  const bgPos = new Float32Array(bgCount * 3);

  for (let i = 0; i < bgCount; i++) {
    bgPos[i * 3]     = (Math.random() - 0.5) * 30;
    bgPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
    bgPos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 8;
  }

  bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));

  const bgMat = new THREE.PointsMaterial({
    color: 0x4A90D9,
    size: 0.025,
    transparent: true,
    opacity: 0.4,
  });

  const bgParticles = new THREE.Points(bgGeo, bgMat);
  scene.add(bgParticles);

  // ── ENTRY ANIMATION ──
  setTimeout(() => {
    gsap.to(toothGroup.scale, {
      x: 1, y: 1, z: 1,
      duration: 1.8,
      ease: 'elastic.out(1, 0.6)',
      delay: 0.3,
    });
  }, 2400);

  // ── MOUSE PARALLAX ──
  let targetX = 0, targetY = 0;

  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 0.6;
    targetY = (e.clientY / window.innerHeight - 0.5) * -0.4;
  });

  // ── ANIMATION LOOP ──
  const clock = new THREE.Clock();

  function animate() {
    const elapsed = clock.getElapsedTime();

    // Smooth camera parallax
    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY * 0.5 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    // Tooth slow rotation
    toothGroup.rotation.y = elapsed * 0.3 + targetX * 0.8;
    toothGroup.rotation.x = Math.sin(elapsed * 0.2) * 0.08 + targetY * 0.3;

    // Particle ring orbits
    particleRing.rotation.y = elapsed * 0.18;
    particleRing.rotation.x = Math.sin(elapsed * 0.1) * 0.05;

    // Background drift
    bgParticles.rotation.y = elapsed * 0.04;

    // Point light orbit
    pointLight.position.x = Math.cos(elapsed * 0.5) * 3;
    pointLight.position.z = Math.sin(elapsed * 0.5) * 3;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  // ── RESIZE ──
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  try { initThreeHero(); } catch(e) { console.warn('Three.js hero:', e); }
});
