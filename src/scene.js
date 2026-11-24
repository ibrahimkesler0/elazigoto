import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

/**
 * Gold Oto Kiralama — Continuous Full-Site Scroll-Choreographed 3D Stage
 * Uses SPHERICAL camera choreography (yaw, pitch, dist) + screen-space car framing
 * so the camera orbits smoothly around the BMW M4 across all 8 sections without
 * ever clipping through the vehicle or crowding editorial content.
 */

export const PAINT_PRESETS = [
  { id: "gold", name: "Gold Şampanya", hex: "#c8a146", metalness: 0.72, roughness: 0.22 },
  { id: "obsidian", name: "Obsidyen Siyah", hex: "#1b1f29", metalness: 0.8, roughness: 0.16 },
  { id: "pearl", name: "Alpin Beyaz", hex: "#e8ebf0", metalness: 0.32, roughness: 0.18 },
  { id: "sapphire", name: "Gece Safiri", hex: "#143466", metalness: 0.74, roughness: 0.2 },
  { id: "emerald", name: "Fırat Zümrüt", hex: "#0f4736", metalness: 0.72, roughness: 0.21 },
];

export const CAMERA_PRESETS = {
  front: { yaw: 0.58, pitch: 0.17, dist: 6.45 },
  side: { yaw: 1.57, pitch: 0.13, dist: 6.7 },
  rear: { yaw: 2.58, pitch: 0.18, dist: 6.4 },
  top: { yaw: 0.78, pitch: 0.84, dist: 7.4 },
  spin: { yaw: 0.58, pitch: 0.17, dist: 6.5, autoSpin: true },
};

/**
 * Spherical camera keyframes per [data-stage] chapter:
 * - yaw: horizontal orbit angle around car (0 = straight front +Z, PI/2 = right side, PI = straight rear -Z)
 * - pitch: vertical elevation angle in radians
 * - dist: distance from car center (always safely outside the 4.65m car!)
 * - screenShiftX: shifts lookAt along camera-right vector:
 *     negative screenShiftX -> car appears on the RIGHT side of screen (leaves LEFT open for text)
 *     positive screenShiftX -> car appears on the LEFT side of screen (leaves RIGHT open for text)
 * - screenShiftY: vertical lookAt height
 */
const STAGE_KEYS = {
  hero: {
    yaw: 0.54,
    pitch: 0.16,
    dist: 7.55,
    shiftX: -1.68, // Car cleanly framed on the right with breathing room from hero text
    shiftY: 0.56,
    mobileDist: 6.5,
    mobileShiftX: 0.0,
    mobileShiftY: -0.45, // Lifts car cleanly into the upper-mid hero showcase window
    headlight: 2.3,
    taillight: 0.9,
    ringOpacity: 0.72,
    highwaySpeed: 0.0,
    rimIntensity: 24,
  },
  showroom: {
    yaw: 0.58,
    pitch: 0.17,
    dist: 6.45,
    shiftX: 0.0, // Car dead-center hero showcase
    shiftY: 0.54,
    mobileDist: 6.65,
    mobileShiftX: 0.0,
    mobileShiftY: 0.22, // Keeps entire car + ring cleanly above the compact mobile dock
    headlight: 2.2,
    taillight: 1.4,
    ringOpacity: 0.95,
    highwaySpeed: 0.0,
    rimIntensity: 28,
  },
  filo: {
    yaw: 1.32,
    pitch: 0.18,
    dist: 8.5,
    shiftX: 1.95, // Car cleanly framed on the LEFT half; Fleet cards on RIGHT
    shiftY: 0.55,
    mobileDist: 7.6,
    mobileShiftX: 0.0,
    mobileShiftY: 0.45,
    headlight: 1.7,
    taillight: 1.3,
    ringOpacity: 0.42,
    highwaySpeed: 0.22,
    rimIntensity: 22,
  },
  hizmetler: {
    yaw: 0.48,
    pitch: 0.14,
    dist: 8.35,
    shiftX: -1.85, // Car cleanly framed on the RIGHT half; Services cards on LEFT
    shiftY: 0.52,
    mobileDist: 7.4,
    mobileShiftX: 0.0,
    mobileShiftY: 0.45,
    headlight: 3.1,
    taillight: 1.4,
    ringOpacity: 0.18,
    highwaySpeed: 1.0,
    rimIntensity: 28,
  },
  surec: {
    yaw: 2.12,
    pitch: 0.78, // Elevated architectural studio top-3/4 view
    dist: 8.6,
    shiftX: 0.0,
    shiftY: 0.32,
    mobileDist: 7.6,
    mobileShiftX: 0.0,
    mobileShiftY: 0.35,
    headlight: 1.5,
    taillight: 2.0,
    ringOpacity: 0.85,
    highwaySpeed: 0.12,
    rimIntensity: 24,
  },
  yorumlar: {
    yaw: 2.52, // Sculpted Rear 3/4 showcasing crimson taillights
    pitch: 0.18,
    dist: 8.45,
    shiftX: 1.95, // Car cleanly framed on the LEFT half; Reviews Swiper on RIGHT
    shiftY: 0.56,
    mobileDist: 7.5,
    mobileShiftX: 0.0,
    mobileShiftY: 0.45,
    headlight: 1.0,
    taillight: 3.4,
    ringOpacity: 0.42,
    highwaySpeed: 0.0,
    rimIntensity: 26,
  },
  sss: {
    yaw: 3.72, // Opposite Rear-Right 3/4 view
    pitch: 0.2,
    dist: 8.5,
    shiftX: -1.9, // Car cleanly framed on the RIGHT half; FAQ accordion on LEFT
    shiftY: 0.55,
    mobileDist: 7.6,
    mobileShiftX: 0.0,
    mobileShiftY: 0.45,
    headlight: 1.4,
    taillight: 2.6,
    ringOpacity: 0.48,
    highwaySpeed: 0.0,
    rimIntensity: 22,
  },
  iletisim: {
    yaw: 5.72, // Completes full 360° circle smoothly back to Front 3/4 salute!
    pitch: 0.22,
    dist: 8.75,
    shiftX: 0.0,
    shiftY: 0.55,
    mobileDist: 7.8,
    mobileShiftX: 0.0,
    mobileShiftY: 0.45,
    headlight: 2.8,
    taillight: 1.1,
    ringOpacity: 0.72,
    highwaySpeed: 0.0,
    rimIntensity: 26,
  },
};

function smoothstep(t) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function createStudioEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x06070a);

  const room = new THREE.Mesh(
    new THREE.BoxGeometry(42, 22, 42),
    new THREE.MeshStandardMaterial({ color: 0x090b10, roughness: 0.92, side: THREE.BackSide })
  );
  room.position.y = 6;
  envScene.add(room);

  // Balanced automotive studio softboxes (sleek reflections without harsh glare blowouts)
  const stripMatWhite = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.35, 2.3, 2.18) });
  const stripMatGold = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.35, 1.78, 0.78) });
  const stripMatCool = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.85, 1.1, 1.75) });

  const overhead1 = new THREE.Mesh(new THREE.PlaneGeometry(16, 1.6), stripMatWhite);
  overhead1.position.set(0, 9.8, -2.8);
  overhead1.rotation.x = Math.PI / 2;
  envScene.add(overhead1);

  const overhead2 = new THREE.Mesh(new THREE.PlaneGeometry(16, 1.4), stripMatGold);
  overhead2.position.set(0, 9.8, 3.4);
  overhead2.rotation.x = Math.PI / 2;
  envScene.add(overhead2);

  const sideGoldL = new THREE.Mesh(new THREE.PlaneGeometry(22, 2.0), stripMatGold);
  sideGoldL.position.set(-15, 3.2, 0);
  sideGoldL.rotation.y = Math.PI / 2;
  envScene.add(sideGoldL);

  const sideWhiteR = new THREE.Mesh(new THREE.PlaneGeometry(22, 2.0), stripMatWhite);
  sideWhiteR.position.set(15, 3.5, 0);
  sideWhiteR.rotation.y = -Math.PI / 2;
  envScene.add(sideWhiteR);

  const backCool = new THREE.Mesh(new THREE.PlaneGeometry(18, 2.8), stripMatCool);
  backCool.position.set(0, 4.0, -16);
  envScene.add(backCool);

  const frontWarm = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.6), stripMatWhite);
  frontWarm.position.set(0, 4.4, 16);
  frontWarm.rotation.y = Math.PI;
  envScene.add(frontWarm);

  const renderTarget = pmrem.fromScene(envScene, 0.045);
  pmrem.dispose();
  return renderTarget.texture;
}

function createContactShadowTexture() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  const grad = ctx.createRadialGradient(size / 2, size / 2, size * 0.08, size / 2, size / 2, size * 0.48);
  grad.addColorStop(0, "rgba(0,0,0,0.92)");
  grad.addColorStop(0.55, "rgba(0,0,0,0.62)");
  grad.addColorStop(0.82, "rgba(0,0,0,0.18)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createBokehParticleTexture() {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255, 240, 192, 1)");
  grad.addColorStop(0.35, "rgba(232, 196, 99, 0.72)");
  grad.addColorStop(0.75, "rgba(212, 175, 55, 0.16)");
  grad.addColorStop(1, "rgba(212, 175, 55, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createFloorGridTexture() {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#08090d";
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(212, 175, 55, 0.045)";
  ctx.lineWidth = 1;
  const step = 64;
  for (let i = 0; i <= size; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function initCarStage(canvas, callbacks = {}) {
  const { onProgress, onReady, onChapterChange, onError } = callbacks;
  if (!canvas) return null;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
  } catch (err) {
    onError?.(err);
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07080b);
  scene.fog = new THREE.FogExp2(0x07080b, 0.042);

  const envTexture = createStudioEnvironment(renderer);
  scene.environment = envTexture;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 120);

  // --- Studio Lights ---
  const hemi = new THREE.HemisphereLight(0xf6ecd2, 0x0a0d16, 0.42);
  scene.add(hemi);

  const keyLight = new THREE.DirectionalLight(0xfff4dd, 1.75);
  keyLight.position.set(5.5, 7.5, 5.5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 24;
  keyLight.shadow.camera.left = -4.5;
  keyLight.shadow.camera.right = 4.5;
  keyLight.shadow.camera.top = 4.5;
  keyLight.shadow.camera.bottom = -4.5;
  keyLight.shadow.bias = -0.0006;
  scene.add(keyLight);

  const goldRim = new THREE.SpotLight(0xe6be5c, 24, 24, Math.PI / 3.3, 0.76, 1.4);
  goldRim.position.set(-5.2, 4.6, -4.4);
  scene.add(goldRim);

  const coolFill = new THREE.DirectionalLight(0x6e8fd4, 0.65);
  coolFill.position.set(-6, 3, 4);
  scene.add(coolFill);

  // --- Car Rig & Floor ---
  const carRig = new THREE.Group();
  scene.add(carRig);

  const floorTex = createFloorGridTexture();
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    color: 0x0b0d13,
    roughness: 0.28,
    metalness: 0.58,
    envMapIntensity: 0.72,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(3.3, 6.0),
    new THREE.MeshBasicMaterial({
      map: createContactShadowTexture(),
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.008;
  carRig.add(shadowPlane);

  // Illuminated Gold Turntable Rings
  const ringGroup = new THREE.Group();
  carRig.add(ringGroup);

  const outerRingMat = new THREE.MeshBasicMaterial({
    color: 0xd4af37,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const outerRing = new THREE.Mesh(new THREE.RingGeometry(2.68, 2.725, 128), outerRingMat);
  outerRing.rotation.x = -Math.PI / 2;
  outerRing.position.y = 0.012;
  ringGroup.add(outerRing);

  const innerRingMat = new THREE.MeshBasicMaterial({
    color: 0xf4dc92,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const innerRing = new THREE.Mesh(new THREE.RingGeometry(2.35, 2.368, 96), innerRingMat);
  innerRing.rotation.x = -Math.PI / 2;
  innerRing.position.y = 0.011;
  ringGroup.add(innerRing);

  const arcMat = new THREE.MeshBasicMaterial({
    color: 0xffdf7d,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const arcMesh = new THREE.Mesh(new THREE.RingGeometry(2.65, 2.75, 64, 1, 0, Math.PI * 0.45), arcMat);
  arcMesh.rotation.x = -Math.PI / 2;
  arcMesh.position.y = 0.015;
  ringGroup.add(arcMesh);

  // --- Highway Motion Light Ribbons ---
  const streakCount = 26;
  const streakGroup = new THREE.Group();
  scene.add(streakGroup);
  const streaks = [];
  const streakGeo = new THREE.PlaneGeometry(0.042, 2.8);
  for (let i = 0; i < streakCount; i++) {
    const isGold = i % 3 !== 0;
    const mat = new THREE.MeshBasicMaterial({
      color: isGold ? 0xe8c463 : 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const m = new THREE.Mesh(streakGeo, mat);
    m.rotation.x = -Math.PI / 2;
    const lane = (Math.random() - 0.5) * 14;
    const safeX = Math.abs(lane) < 1.95 ? (lane >= 0 ? 2.2 + Math.random() * 4 : -2.2 - Math.random() * 4) : lane;
    const z = (Math.random() - 0.5) * 34;
    m.position.set(safeX, 0.02 + Math.random() * 0.05, z);
    m.scale.set(0.6 + Math.random() * 0.9, 0.5 + Math.random() * 1.4, 1);
    m.userData = { speed: 12 + Math.random() * 14, baseOpacity: isGold ? 0.38 : 0.16 };
    streakGroup.add(m);
    streaks.push(m);
  }

  // --- Soft Circular Bokeh Champagne-Gold Dust Motes ---
  const pCount = 190;
  const pPositions = new Float32Array(pCount * 3);
  const pSpeeds = new Float32Array(pCount);
  for (let i = 0; i < pCount; i++) {
    pPositions[i * 3] = (Math.random() - 0.5) * 18;
    pPositions[i * 3 + 1] = 0.35 + Math.random() * 6.5;
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 18;
    pSpeeds[i] = 0.4 + Math.random() * 0.9;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      map: createBokehParticleTexture(),
      color: 0xf4d889,
      size: 0.11,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  scene.add(particles);

  // --- Headlight & Taillight Glow Accent Lights ---
  const headlightGlow = new THREE.PointLight(0xfff4d8, 0, 7, 1.8);
  headlightGlow.position.set(0, 0.72, 2.75);
  carRig.add(headlightGlow);

  const taillightGlow = new THREE.PointLight(0xff2228, 0, 6.5, 1.8);
  taillightGlow.position.set(0, 0.78, -2.75);
  carRig.add(taillightGlow);

  // --- Material References for Live Paint & Lighting ---
  const paintMaterials = [];
  const headlightMaterials = [];
  const taillightMaterials = [];
  let carModelRoot = null;

  const targetPaintColor = new THREE.Color(PAINT_PRESETS[0].hex);
  const currentPaintColor = new THREE.Color(PAINT_PRESETS[0].hex);
  let targetPaintMetal = PAINT_PRESETS[0].metalness;
  let targetPaintRough = PAINT_PRESETS[0].roughness;
  let headlightsEnabled = true;

  // --- Load Sketchfab CC-BY-4.0 BMW M4 Competition GLB ---
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  gltfLoader.load(
    "/models/bmw-m4.glb",
    (gltf) => {
      const model = gltf.scene;

      model.traverse((child) => {
        if (!child.isMesh) return;
        child.castShadow = true;
        child.receiveShadow = true;

        const mat = child.material;
        if (!mat) return;
        const name = mat.name || "";

        if (name === "Mesheszx1Mtl") {
          const phys = new THREE.MeshPhysicalMaterial({
            color: currentPaintColor.clone(),
            metalness: targetPaintMetal,
            roughness: targetPaintRough,
            clearcoat: 1.0,
            clearcoatRoughness: 0.08,
            reflectivity: 0.95,
            envMapIntensity: 1.55,
          });
          child.material = phys;
          paintMaterials.push(phys);
        } else if (name === "Mesheslivery1Mtl" || name === "Meshesbody151Mtl") {
          const phys = new THREE.MeshPhysicalMaterial({
            map: mat.map || null,
            color: mat.color ? mat.color.clone() : new THREE.Color(0xffffff),
            metalness: 0.48,
            roughness: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.08,
            envMapIntensity: 1.4,
          });
          child.material = phys;
        } else if (name === "Mesheswindows1Mtl" || name === "Meshesheadlight51Mtl") {
          child.material = new THREE.MeshPhysicalMaterial({
            color: name === "Mesheswindows1Mtl" ? 0x05070c : 0x10141c,
            metalness: 0.12,
            roughness: 0.05,
            transparent: true,
            opacity: name === "Mesheswindows1Mtl" ? 0.74 : 0.36,
            clearcoat: 1.0,
            clearcoatRoughness: 0.04,
            envMapIntensity: 1.9,
          });
        } else if (name === "Meshesled111Mtl" || name === "Mesheslight51Mtl") {
          const hl = new THREE.MeshStandardMaterial({
            map: mat.map || null,
            color: 0xffffff,
            emissive: new THREE.Color(0xfff4da),
            emissiveIntensity: 2.2,
            roughness: 0.14,
            metalness: 0.1,
          });
          child.material = hl;
          headlightMaterials.push(hl);
        } else if (name === "Meshesredlight1Mtl") {
          const tl = new THREE.MeshStandardMaterial({
            color: 0xcc1118,
            emissive: new THREE.Color(0xff141c),
            emissiveIntensity: 1.4,
            roughness: 0.16,
            metalness: 0.2,
          });
          child.material = tl;
          taillightMaterials.push(tl);
        } else if (name === "Caliper1Mtl") {
          child.material = new THREE.MeshStandardMaterial({
            color: 0xd9b145,
            metalness: 0.85,
            roughness: 0.22,
            envMapIntensity: 1.5,
          });
        } else if (name === "Mesheschrome51Mtl" || name === "Meshesm8rim1Mtl") {
          mat.metalness = 0.88;
          mat.roughness = 0.16;
          mat.envMapIntensity = 1.5;
        } else if (name === "Meshesm8rim0011Mtl") {
          mat.metalness = 0.05;
          mat.roughness = 0.78;
          mat.envMapIntensity = 0.42;
        } else if (name === "Meshesblack161Mtl" || name === "Meshespillars1Mtl") {
          mat.metalness = 0.35;
          mat.roughness = 0.25;
          mat.envMapIntensity = 1.15;
        } else {
          mat.envMapIntensity = 1.05;
        }
      });

      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxHorizontal = Math.max(size.x, size.z);
      const scale = 4.65 / (maxHorizontal || 1);

      const wrapper = new THREE.Group();
      wrapper.add(model);
      model.position.set(-center.x, -box.min.y, -center.z);
      wrapper.scale.setScalar(scale);

      if (size.x > size.z) {
        wrapper.rotation.y = Math.PI / 2;
      }

      carModelRoot = wrapper;
      carRig.add(wrapper);

      onProgress?.(100);
      onReady?.();
    },
    (xhr) => {
      if (xhr.total > 0) {
        const pct = Math.min(99, Math.round((xhr.loaded / xhr.total) * 100));
        onProgress?.(pct);
      }
    },
    (err) => {
      console.error("3D car model load error:", err);
      onError?.(err);
      onReady?.();
    }
  );

  // --- Scroll Section Choreography Measurement ---
  let sections = [];
  let currentChapter = "hero";

  function measureSections() {
    const els = Array.from(document.querySelectorAll("[data-stage]"));
    sections = els.map((el) => {
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const height = Math.max(el.offsetHeight, 300);
      return {
        id: el.dataset.stage,
        el,
        top,
        center: top + height * 0.42,
        height,
      };
    });
  }

  // --- Pointer Parallax & Showroom Interactive Orbit ---
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let isDragging = false;
  let lastPointerX = 0;
  let lastPointerY = 0;

  let showroomOverride = false;
  let autoSpinShowroom = false;
  let showroomTargetYaw = CAMERA_PRESETS.front.yaw;
  let showroomTargetPitch = CAMERA_PRESETS.front.pitch;
  let showroomTargetDist = CAMERA_PRESETS.front.dist;

  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;

      if (isDragging) {
        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        autoSpinShowroom = false;
        showroomOverride = true;
        showroomTargetYaw -= dx * 0.0085;
        showroomTargetPitch = Math.max(0.08, Math.min(0.95, showroomTargetPitch + dy * 0.005));
      }
    },
    { passive: true }
  );

  window.addEventListener("pointerup", () => {
    isDragging = false;
  });

  function attachOrbitZone(zoneEl) {
    if (!zoneEl) return;
    zoneEl.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button, a, input")) return;
      isDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      if (!showroomOverride) {
        showroomTargetYaw = curYaw;
        showroomTargetPitch = curPitch;
        showroomTargetDist = isMobile ? STAGE_KEYS.showroom.mobileDist : STAGE_KEYS.showroom.dist;
      }
      showroomOverride = true;
      autoSpinShowroom = false;
      zoneEl.style.cursor = "grabbing";
    });
    window.addEventListener("pointerup", () => {
      zoneEl.style.cursor = "grab";
    });
  }

  // --- Live Spherical Camera State ---
  let curYaw = STAGE_KEYS.hero.yaw;
  let curPitch = STAGE_KEYS.hero.pitch;
  let curDist = STAGE_KEYS.hero.dist;
  let curShiftX = STAGE_KEYS.hero.shiftX;
  let curShiftY = STAGE_KEYS.hero.shiftY;

  let curHeadlight = STAGE_KEYS.hero.headlight;
  let curTaillight = STAGE_KEYS.hero.taillight;
  let curRingOpacity = STAGE_KEYS.hero.ringOpacity;
  let curHighwaySpeed = 0;
  let curRimIntensity = STAGE_KEYS.hero.rimIntensity;

  const lookTarget = new THREE.Vector3();
  const rightVec = new THREE.Vector3();
  let isMobile = window.innerWidth < 960;
  let portraitMult = 1;

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    isMobile = w < 960;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Portrait phones have narrow horizontal FOV; boost vertical FOV and scale distance
    // dynamically so 100% of the 4.65m BMW M4 fits side-to-side even in full Yan profile!
    const isPortrait = camera.aspect < 1.0;
    camera.fov = isPortrait ? 46 : isMobile ? 40 : 35;
    portraitMult = isPortrait ? Math.max(1.0, 0.98 / Math.max(camera.aspect, 0.42)) : 1.0;
    camera.updateProjectionMatrix();
    measureSections();
  }
  window.addEventListener("resize", resize);
  window.addEventListener("load", measureSections);
  resize();

  // Snap initial spherical values so first frame opens cleanly on mobile & desktop
  curDist = (isMobile ? STAGE_KEYS.hero.mobileDist : STAGE_KEYS.hero.dist) * portraitMult;
  curShiftX = isMobile ? STAGE_KEYS.hero.mobileShiftX : STAGE_KEYS.hero.shiftX;
  curShiftY = isMobile ? STAGE_KEYS.hero.mobileShiftY : STAGE_KEYS.hero.shiftY;

  function sampleScrollStage() {
    if (!sections.length) return STAGE_KEYS.hero;

    const anchorY = window.scrollY + window.innerHeight * 0.44;

    let activeIdx = 0;
    for (let i = 0; i < sections.length; i++) {
      if (anchorY >= sections[i].top) activeIdx = i;
    }
    const activeId = sections[activeIdx].id;
    if (activeId !== currentChapter) {
      currentChapter = activeId;
      onChapterChange?.(activeId);
      if (activeId !== "showroom") {
        showroomOverride = false;
        autoSpinShowroom = false;
      }
    }

    let idxA = 0;
    let idxB = 0;
    let t = 0;

    if (anchorY <= sections[0].center) {
      idxA = idxB = 0;
      t = 0;
    } else if (anchorY >= sections[sections.length - 1].center) {
      idxA = idxB = sections.length - 1;
      t = 0;
    } else {
      for (let i = 0; i < sections.length - 1; i++) {
        if (anchorY >= sections[i].center && anchorY <= sections[i + 1].center) {
          idxA = i;
          idxB = i + 1;
          const span = Math.max(1, sections[i + 1].center - sections[i].center);
          t = smoothstep((anchorY - sections[i].center) / span);
          break;
        }
      }
    }

    const a = STAGE_KEYS[sections[idxA].id] || STAGE_KEYS.hero;
    const b = STAGE_KEYS[sections[idxB].id] || STAGE_KEYS.hero;

    return {
      yaw: lerp(a.yaw, b.yaw, t),
      pitch: lerp(a.pitch, b.pitch, t),
      dist: lerp(isMobile ? a.mobileDist : a.dist, isMobile ? b.mobileDist : b.dist, t) * portraitMult,
      shiftX: lerp(isMobile ? a.mobileShiftX : a.shiftX, isMobile ? b.mobileShiftX : b.shiftX, t),
      shiftY: lerp(isMobile ? a.mobileShiftY : a.shiftY, isMobile ? b.mobileShiftY : b.shiftY, t),
      headlight: lerp(a.headlight, b.headlight, t),
      taillight: lerp(a.taillight, b.taillight, t),
      ringOpacity: lerp(a.ringOpacity, b.ringOpacity, t),
      highwaySpeed: lerp(a.highwaySpeed, b.highwaySpeed, t),
      rimIntensity: lerp(a.rimIntensity, b.rimIntensity, t),
    };
  }

  let tabHidden = false;
  document.addEventListener("visibilitychange", () => {
    tabHidden = document.hidden;
  });

  const clock = new THREE.Clock();

  function tick() {
    requestAnimationFrame(tick);
    if (tabHidden) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.elapsedTime;
    const damp = 1 - Math.exp(-dt * (reduceMotion ? 10 : 5.8));
    const paintDamp = 1 - Math.exp(-dt * 7.5);

    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;

    const s = sampleScrollStage();

    let goalYaw = s.yaw;
    let goalPitch = s.pitch;
    let goalDist = s.dist;
    let goalShiftX = s.shiftX;
    let goalShiftY = s.shiftY;

    if (currentChapter === "showroom" && showroomOverride) {
      if (autoSpinShowroom && !reduceMotion) {
        showroomTargetYaw += dt * 0.42;
      }
      goalYaw = showroomTargetYaw;
      goalPitch = showroomTargetPitch;
      goalDist = showroomTargetDist * portraitMult;
      goalShiftX = 0;
      goalShiftY = isMobile ? STAGE_KEYS.showroom.mobileShiftY : 0.54;
    } else if (!reduceMotion) {
      // Gentle living showcase motion + pointer parallax
      goalYaw += Math.sin(elapsed * 0.42) * 0.045 + pointer.x * 0.075;
      goalPitch = Math.max(0.09, Math.min(0.95, goalPitch - pointer.y * 0.035));
    }

    // Smoothly interpolate spherical coordinates (guaranteed collision-free orbit!)
    curYaw += (goalYaw - curYaw) * damp;
    curPitch += (goalPitch - curPitch) * damp;
    curDist += (goalDist - curDist) * damp;
    curShiftX += (goalShiftX - curShiftX) * damp;
    curShiftY += (goalShiftY - curShiftY) * damp;

    // Place camera on sphere around car origin (0, curShiftY, 0)
    const cosP = Math.cos(curPitch);
    const camX = Math.sin(curYaw) * cosP * curDist;
    const camY = curShiftY + Math.sin(curPitch) * curDist;
    const camZ = Math.cos(curYaw) * cosP * curDist;

    // Camera-right vector on XZ plane = (cos(yaw), 0, -sin(yaw))
    rightVec.set(Math.cos(curYaw), 0, -Math.sin(curYaw));

    // Shift both camera and lookTarget sideways by curShiftX so the car frames cleanly left/right
    // without distorting perspective or clipping!
    camera.position.set(
      camX + rightVec.x * curShiftX,
      Math.max(0.32, camY),
      camZ + rightVec.z * curShiftX
    );
    lookTarget.set(
      rightVec.x * curShiftX,
      curShiftY,
      rightVec.z * curShiftX
    );
    camera.lookAt(lookTarget);

    // Subtle suspension breathing during highway motion chapter
    if (carModelRoot && !reduceMotion) {
      const roadPulse = curHighwaySpeed * Math.sin(elapsed * 9.5) * 0.007;
      carModelRoot.position.y = Math.max(0, roadPulse);
      carModelRoot.rotation.z = curHighwaySpeed * Math.sin(elapsed * 3.1) * 0.004;
    }

    // Live body paint color lerping
    if (paintMaterials.length) {
      currentPaintColor.lerp(targetPaintColor, paintDamp);
      for (const m of paintMaterials) {
        m.color.copy(currentPaintColor);
        m.metalness += (targetPaintMetal - m.metalness) * paintDamp;
        m.roughness += (targetPaintRough - m.roughness) * paintDamp;
      }
    }

    // Headlights & Taillights dynamic glow
    const hlTarget = headlightsEnabled ? s.headlight : 0.12;
    const tlTarget = headlightsEnabled ? s.taillight : 0.22;
    curHeadlight += (hlTarget - curHeadlight) * damp;
    curTaillight += (tlTarget - curTaillight) * damp;

    for (const m of headlightMaterials) m.emissiveIntensity = curHeadlight;
    for (const m of taillightMaterials) m.emissiveIntensity = curTaillight;
    headlightGlow.intensity = curHeadlight * 1.35;
    taillightGlow.intensity = curTaillight * 1.25;

    // Rim light intensity
    curRimIntensity += (s.rimIntensity - curRimIntensity) * damp;
    goldRim.intensity = curRimIntensity;

    // Turntable rings & sweeping highlight arc
    curRingOpacity += (s.ringOpacity - curRingOpacity) * damp;
    outerRingMat.opacity = curRingOpacity * 0.6;
    innerRingMat.opacity = curRingOpacity * 0.22;
    arcMat.opacity = curRingOpacity * 0.88;
    if (!reduceMotion) {
      arcMesh.rotation.z = -elapsed * 0.55;
    }

    // Highway floor grid motion & light-speed ribbons
    curHighwaySpeed += (s.highwaySpeed - curHighwaySpeed) * damp;
    if (!reduceMotion && curHighwaySpeed > 0.01) {
      floorTex.offset.y -= dt * curHighwaySpeed * 1.55;
    }

    for (const st of streaks) {
      st.material.opacity = curHighwaySpeed * st.userData.baseOpacity;
      if (curHighwaySpeed > 0.01 && !reduceMotion) {
        st.position.z -= dt * st.userData.speed * (0.4 + curHighwaySpeed);
        if (st.position.z < -17) st.position.z = 17;
      }
    }

    // Soft floating bokeh dust motes
    const posArr = pGeo.attributes.position.array;
    for (let i = 0; i < pCount; i++) {
      const idx = i * 3;
      if (!reduceMotion) {
        posArr[idx + 1] += Math.sin(elapsed * pSpeeds[i] + i) * 0.0011;
        posArr[idx + 2] -= dt * (0.1 + curHighwaySpeed * 7.2) * pSpeeds[i];
        if (posArr[idx + 2] < -9) posArr[idx + 2] = 9;
      }
    }
    pGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  tick();

  return {
    attachOrbitZone,
    measureSections,
    setPaint(presetId) {
      const preset = PAINT_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;
      targetPaintColor.set(preset.hex);
      targetPaintMetal = preset.metalness;
      targetPaintRough = preset.roughness;
    },
    setCameraPreset(presetKey) {
      const preset = CAMERA_PRESETS[presetKey];
      if (!preset) return;
      showroomOverride = true;
      autoSpinShowroom = Boolean(preset.autoSpin);
      if (!preset.autoSpin) {
        // Choose shortest angular path from curYaw to preset.yaw (mod 2*PI)
        const twoPi = Math.PI * 2;
        const delta = ((((preset.yaw - curYaw) % twoPi) + Math.PI * 3) % twoPi) - Math.PI;
        showroomTargetYaw = curYaw + delta;
      } else {
        showroomTargetYaw = curYaw;
      }
      showroomTargetPitch = preset.pitch;
      showroomTargetDist = preset.dist;
    },
    setHeadlights(on) {
      headlightsEnabled = Boolean(on);
    },
    getHeadlights() {
      return headlightsEnabled;
    },
  };
}
