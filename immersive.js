const timelineItems = [
  {
    year: "986-1001",
    title: "The Pillow Book",
    description:
      "A long-form diary tradition that established serialized personal publishing centuries before modern blogs.",
    image:
      "https://images.unsplash.com/photo-1504198266285-165a74cfde2c?auto=format&fit=crop&w=1400&q=80",
  },
  {
    year: "1520",
    title: "Der Kleidernarr",
    description:
      "Portrait culture and print-era circulation started recognizable identity storytelling across Europe.",
    image:
      "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=1400&q=80",
  },
  {
    year: "1994",
    title: "Open Diary",
    description:
      "Public personal journals moved online and introduced persistent entries, comments, and audience memory.",
    image:
      "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=1400&q=80",
  },
  {
    year: "1997",
    title: "Weblog Term",
    description:
      "The label weblog standardized the format and gave internet writing a new publishing category.",
    image:
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1400&q=80",
  },
  {
    year: "1998",
    title: "Blogger DNA",
    description:
      "Template-led tools reduced technical friction and accelerated creator-first content workflows.",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80",
  },
  {
    year: "1999",
    title: "LiveJournal Era",
    description:
      "Communities and profile identity began blending social behavior with publishing rhythms.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80",
  },
  {
    year: "2000",
    title: "Mass Blogging",
    description:
      "Blog networks scaled content distribution and turned personal writing into discoverable media.",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1400&q=80",
  },
  {
    year: "2000",
    title: "Comment Culture",
    description:
      "Threaded responses transformed publishing into two-way conversation and community retention.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
  },
  {
    year: "2000",
    title: "Portal To Next Wall",
    description:
      "This final station is reserved for the upcoming wall-transition logic and next-epoch animation.",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80",
  },
];

const epochEl = document.getElementById("epoch");
const titleEl = document.getElementById("artifact-title");
const descriptionEl = document.getElementById("artifact-description");
const timelineScale = document.getElementById("timeline-scale");
const canvas = document.getElementById("three-canvas");

const DEPENDENCY_ERROR =
  "GSAP, ScrollTrigger, and Three.js must be loaded before immersive.js can initialize.";

function notifyDependencyFailure(message) {
  console.error(message);
  if (descriptionEl) {
    descriptionEl.textContent = "Interactive scene dependencies failed to load. Check network/CDN access and refresh.";
  }
}

function loadExternalScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));
    document.head.appendChild(script);
  });
}

async function ensureDependencies() {
  try {
    if (!window.THREE) {
      const mod = await import("https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js");
      window.THREE = mod;
    }

    if (!window.gsap) {
      await loadExternalScript("https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js");
    }

    if (!window.ScrollTrigger) {
      await loadExternalScript("https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js");
    }
  } catch (error) {
    notifyDependencyFailure(`${DEPENDENCY_ERROR} ${error?.message || ""}`.trim());
    return false;
  }

  if (!window.gsap || !window.ScrollTrigger || !window.THREE) {
    notifyDependencyFailure(DEPENDENCY_ERROR);
    return false;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);
  return true;
}

const state = {
  progress: 0,
  targetProgress: 0,
  activeIndex: -1,
  heroVisible: false,
  heroTargetVisible: false,
  heroAnimating: false,
  pendingIndex: -1,
  mouseX: 0,
  mouseY: 0,
  targetMouseX: 0,
  targetMouseY: 0,
  sceneOffsetX: 0,
  sceneOffsetY: 0,
  targetSceneOffsetX: 0,
  targetSceneOffsetY: 0,
};

let scene;
let camera;
let renderer;
let cardsGroup;
let animationFrame;
let timelineCursor;
let timelineProgress;

const layout = {
  cardSpacing: 7.6,
  depthBase: -10.5,
  cardSize: 2.7,
  laneX: 2.05,
  focusWindow: 7.2,
  nearWindow: 3.3,
  postCameraFade: 1.1,
  farCullDistance: 13.5,
  headingSwitchGap: 1.7,
  heroShowZMin: -8.5,
  heroShowZMax: -0.35,
  heroHideZMin: -9.4,
  heroHideZMax: 0.4,
  parallaxX: 0.32,
  parallaxY: 0.12,
};

const timelineRefs = [];

function buildTimeline() {
  const line = document.createElement("div");
  line.className = "timeline-line";
  timelineScale.appendChild(line);

  timelineProgress = document.createElement("div");
  timelineProgress.className = "timeline-progress";
  timelineScale.appendChild(timelineProgress);

  timelineCursor = document.createElement("div");
  timelineCursor.className = "timeline-cursor";
  timelineScale.appendChild(timelineCursor);

  timelineItems.forEach((item, index) => {
    const ratio = timelineItems.length === 1 ? 0.5 : index / (timelineItems.length - 1);

    const point = document.createElement("button");
    point.type = "button";
    point.className = "timeline-point";
    point.style.left = `${ratio * 100}%`;
    point.setAttribute("aria-label", `Jump to ${item.title}`);

    point.addEventListener("click", () => {
      const target = ratio;
      const trigger = ScrollTrigger.getById("museum-progress");
      if (!trigger) {
        return;
      }
      const y = trigger.start + target * (trigger.end - trigger.start);
      window.scrollTo({ top: y, behavior: "smooth" });
    });

    const label = document.createElement("span");
    label.className = "timeline-label";
    label.textContent = item.year;
    label.style.left = `${ratio * 100}%`;

    timelineScale.append(point, label);
    timelineRefs.push({ point, label });
  });
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function setHeroVisibility(visible) {
  if (!state.heroAnimating && visible === state.heroVisible) {
    return;
  }
  if (state.heroAnimating && visible === state.heroTargetVisible) {
    return;
  }

  state.heroTargetVisible = visible;
  gsap.killTweensOf([epochEl, titleEl, descriptionEl]);
  state.heroAnimating = true;

  if (!visible) {
    gsap.to([epochEl, titleEl, descriptionEl], {
      autoAlpha: 0,
      y: -4,
      duration: 0.22,
      stagger: 0.02,
      ease: "power3.out",
      onComplete: () => {
        state.heroVisible = false;
        state.heroAnimating = false;
        state.heroTargetVisible = false;
        if (state.pendingIndex >= 0) {
          const nextIndex = state.pendingIndex;
          state.pendingIndex = -1;
          updateActiveInfo(nextIndex);
          setHeroVisibility(true);
        }
      },
    });
    return;
  }

  state.heroVisible = true;
  gsap.fromTo(
    [epochEl, titleEl, descriptionEl],
    { autoAlpha: 0, y: 8 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.34,
      stagger: 0.03,
      ease: "power3.out",
      onComplete: () => {
        state.heroAnimating = false;
        state.heroTargetVisible = true;
        playTextEntryAnimation(state.activeIndex);
      },
    },
  );
}

function setTitleWords(text) {
  const words = text.split(/\s+/).filter(Boolean);
  titleEl.innerHTML = words.map((word) => `<span class="title-word">${word}</span>`).join(" ");
}

function createCardMaterial(texture) {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uMap: { value: texture },
      uOpacity: { value: 0.88 },
      uContrast: { value: 1.26 },
      uBrightness: { value: 0.04 },
      uGloss: { value: 0.22 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform float uOpacity;
      uniform float uContrast;
      uniform float uBrightness;
      uniform float uGloss;
      uniform vec2 uMouse;
      varying vec2 vUv;

      void main() {
        vec4 tex = texture2D(uMap, vUv);
        vec3 color = tex.rgb;
        color = (color - 0.5) * uContrast + 0.5;
        color += uBrightness;

        vec2 glossOrigin = vec2(0.5 + uMouse.x * 0.18, 0.36 + uMouse.y * 0.14);
        vec2 delta = vUv - glossOrigin;
        float gloss = exp(-dot(delta, delta) * 32.0) * uGloss;

        float edge = smoothstep(0.95, 0.18, abs(vUv.x - 0.5) * 2.0);
        color += gloss + edge * 0.08;

        gl_FragColor = vec4(color, tex.a * uOpacity);
      }
    `,
  });
}

function createFallbackTexture(label) {
  const size = 1024;
  const artboard = document.createElement("canvas");
  artboard.width = size;
  artboard.height = size;

  const ctx = artboard.getContext("2d");
  if (!ctx) {
    return null;
  }

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#6f5b3d");
  gradient.addColorStop(1, "#2c2419");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.lineWidth = 10;
  ctx.strokeRect(34, 34, size - 68, size - 68);

  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = "600 72px Instrument Sans, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const shortLabel = label.length > 24 ? `${label.slice(0, 24)}...` : label;
  ctx.fillText(shortLabel, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(artboard);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createCardTexture(url, label) {
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  return new Promise((resolve) => {
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        resolve(texture);
      },
      undefined,
      () => {
        const fallback = createFallbackTexture(label);
        if (fallback) {
          resolve(fallback);
          return;
        }
        // Last-resort tiny data texture, so the scene still renders.
        const pixel = new Uint8Array([176, 147, 105, 255]);
        const fallbackData = new THREE.DataTexture(pixel, 1, 1);
        fallbackData.colorSpace = THREE.SRGBColorSpace;
        fallbackData.needsUpdate = true;
        resolve(fallbackData);
      },
    );
  });
}

async function buildCards() {
  const textures = await Promise.all(
    timelineItems.map((item) => createCardTexture(item.image, item.title)),
  );

  cardsGroup = new THREE.Group();
  scene.add(cardsGroup);

  textures.forEach((texture, index) => {
    const material = createCardMaterial(texture);

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(layout.cardSize, layout.cardSize, 1, 1), material);
    const depth = layout.depthBase - index * layout.cardSpacing;
    const side = index % 2 === 0 ? -1 : 1;
    const laneX = side * layout.laneX;

    plane.position.set(laneX, 0.18, depth);
    plane.rotation.y = side * -0.06;
    plane.userData = {
      index,
      baseX: laneX,
      baseY: plane.position.y,
      baseZ: depth,
      side,
      material,
    };

    cardsGroup.add(plane);
  });
}

function setupScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x7d6746, 8, 52);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 130);
  camera.position.set(0, 0.2, 0);

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const ambient = new THREE.AmbientLight(0xf2e7d4, 0.8);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xfff3dd, 1.5);
  key.position.set(2.8, 3.6, 6.2);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xb9dbff, 0.45);
  fill.position.set(-6.4, 1.4, 1.5);
  scene.add(fill);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.MeshStandardMaterial({
      color: 0xbaa27c,
      roughness: 0.95,
      metalness: 0.02,
      transparent: true,
      opacity: 0.72,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.1;
  floor.position.z = -27;
  scene.add(floor);
}

function playTextEntryAnimation(index) {
  const variant = index % 4;
  const tl = gsap.timeline();
  const titleWords = titleEl.querySelectorAll(".title-word");
  gsap.killTweensOf([epochEl, titleWords, descriptionEl]);
  gsap.set(titleWords, { autoAlpha: 0, y: 0, x: 0, rotationX: 0, skewX: 0, scale: 1 });
  gsap.set([epochEl, descriptionEl], { autoAlpha: 1, y: 0, x: 0 });

  if (variant === 0) {
    tl.fromTo(titleWords, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.04, ease: "power3.out" })
      .fromTo(descriptionEl, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, "-=0.22");
  } else if (variant === 1) {
    tl.fromTo(titleWords, { autoAlpha: 0, scale: 0.98, y: 8 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.44, stagger: 0.038, ease: "expo.out" })
      .fromTo(descriptionEl, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, "-=0.22");
  } else if (variant === 2) {
    tl.fromTo(titleWords, { autoAlpha: 0, x: 10 }, { autoAlpha: 1, x: 0, duration: 0.38, stagger: 0.035, ease: "power3.out" })
      .fromTo(descriptionEl, { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.28, ease: "power2.out" }, "-=0.2");
  } else {
    tl.fromTo(titleWords, { autoAlpha: 0, y: -10, rotationX: -10, transformOrigin: "50% 0%" }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.4, stagger: 0.038, ease: "back.out(1.35)" })
      .fromTo(descriptionEl, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" }, "-=0.2");
  }
}

function updateActiveInfo(index) {
  if (index === state.activeIndex) {
    return;
  }

  state.activeIndex = index;
  const data = timelineItems[index];
  epochEl.textContent = data.year;
  setTitleWords(data.title);
  descriptionEl.textContent = data.description;
  gsap.set([epochEl, titleEl, descriptionEl], { clearProps: "filter" });

  timelineRefs.forEach((ref, refIndex) => {
    const active = refIndex === index;
    ref.point.classList.toggle("active", active);
    ref.label.classList.toggle("active", active);
  });
}

function setupScroll() {
  const scrollDistance = window.innerHeight * 10.5;
  document.body.style.height = `${scrollDistance + window.innerHeight}px`;

  ScrollTrigger.create({
    id: "museum-progress",
    trigger: document.body,
    start: "top top",
    end: `+=${scrollDistance}`,
    scrub: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      state.targetProgress = self.progress;
    },
  });
}

function handlePointerMove(event) {
  state.targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
  state.targetMouseY = -((event.clientY / window.innerHeight) * 2 - 1);
  state.targetSceneOffsetX = state.targetMouseX * layout.parallaxX;
  state.targetSceneOffsetY = state.targetMouseY * layout.parallaxY;
}

function handlePointerLeave() {
  state.targetMouseX = 0;
  state.targetMouseY = 0;
  state.targetSceneOffsetX = 0;
  state.targetSceneOffsetY = 0;
}

function render() {
  state.progress += (state.targetProgress - state.progress) * 0.07;
  state.mouseX += (state.targetMouseX - state.mouseX) * 0.08;
  state.mouseY += (state.targetMouseY - state.mouseY) * 0.08;
  state.sceneOffsetX += (state.targetSceneOffsetX - state.sceneOffsetX) * 0.06;
  state.sceneOffsetY += (state.targetSceneOffsetY - state.sceneOffsetY) * 0.06;

  const depthTravel = (timelineItems.length - 1) * layout.cardSpacing + 12;
  const travel = state.progress * depthTravel;
  cardsGroup.position.z = travel;
  cardsGroup.position.x = state.sceneOffsetX;
  cardsGroup.position.y = state.sceneOffsetY * 0.18;
  camera.position.x = -state.sceneOffsetX * 0.22;
  camera.position.y = 0.2 - state.sceneOffsetY * 0.12;
  camera.lookAt(state.sceneOffsetX * 0.3, 0.15 + state.sceneOffsetY * 0.25, -12);

  if (timelineCursor) {
    timelineCursor.style.left = `${state.progress * 100}%`;
  }
  if (timelineProgress) {
    timelineProgress.style.width = `${state.progress * 100}%`;
  }

  const depthCursor = camera.position.z - cardsGroup.position.z;
  const laneX = (window.innerWidth > 1280 ? 2.2 : 1.9) * (window.innerWidth < 900 ? 0.88 : 1);
  let heroCandidateIndex = -1;
  let heroCandidateZ = -999;

  cardsGroup.children.forEach((plane) => {
    const distance = Math.abs(plane.userData.baseZ - depthCursor);
    const focus = clamp01(1 - distance / layout.focusWindow);
    const near = clamp01(1 - distance / layout.nearWindow);
    const worldZ = plane.userData.baseZ + cardsGroup.position.z;
    const farFade = clamp01(1 - Math.max(0, -worldZ - layout.farCullDistance) / 6);

    plane.position.x = plane.userData.side * laneX;
    plane.position.y = plane.userData.baseY;
    plane.rotation.y = plane.userData.side * (-0.05 + near * 0.02);
    plane.scale.setScalar(0.82 + near * 0.64);

    let opacity = (0.16 + focus * 0.84) * farFade;
    if (near > 0.72) {
      opacity = 1;
    }
    if (worldZ > 0.6) {
      const pastCameraFade = Math.max(
        0,
        1 - (worldZ - 0.6) / layout.postCameraFade,
      );
      opacity *= pastCameraFade;
    }

    if (worldZ <= layout.heroShowZMax && worldZ > heroCandidateZ) {
      heroCandidateZ = worldZ;
      heroCandidateIndex = plane.userData.index;
    }

    plane.userData.material.uniforms.uOpacity.value = opacity;
    plane.userData.material.uniforms.uContrast.value = 1.1 + near * 0.35;
    plane.userData.material.uniforms.uBrightness.value = 0.015 + near * 0.06;
    plane.userData.material.uniforms.uGloss.value = 0.16 + near * 0.46;
    plane.userData.material.uniforms.uMouse.value.set(state.mouseX, state.mouseY);
  });

  const heroInShowWindow =
    heroCandidateIndex >= 0 &&
    heroCandidateZ >= layout.heroShowZMin &&
    heroCandidateZ <= layout.heroShowZMax;
  const heroInKeepWindow =
    heroCandidateIndex >= 0 &&
    heroCandidateZ >= layout.heroHideZMin &&
    heroCandidateZ <= layout.heroHideZMax;
  const heroShouldShow = state.heroVisible || state.heroAnimating ? heroInKeepWindow : heroInShowWindow;

  if (heroShouldShow) {
    if (heroCandidateIndex !== state.activeIndex) {
      if (state.heroVisible || state.heroAnimating) {
        state.pendingIndex = heroCandidateIndex;
        if (state.heroVisible) {
          setHeroVisibility(false);
        }
      } else {
        updateActiveInfo(heroCandidateIndex);
        setHeroVisibility(true);
      }
    } else if (!state.heroVisible && !state.heroAnimating) {
      setHeroVisibility(true);
    }
  } else {
    state.pendingIndex = -1;
    setHeroVisibility(false);
  }

  timelineRefs.forEach((ref, index) => {
    const plane = cardsGroup.children[index];
    if (!plane) {
      return;
    }
    const worldZ = plane.userData.baseZ + cardsGroup.position.z;
    const intensity = clamp01(1 - Math.abs(worldZ + 2.2) / 8.5);
    const activeBoost = index === state.activeIndex ? 0.18 : 0;
    ref.point.style.opacity = `${0.35 + intensity * 0.65}`;
    ref.label.style.opacity = `${0.5 + intensity * 0.5}`;
    ref.point.style.transform = `translate(-50%, -50%) scale(${0.92 + intensity * 0.28 + activeBoost})`;
  });

  renderer.render(scene, camera);
  animationFrame = requestAnimationFrame(render);
}

function handleResize() {
  if (!camera || !renderer) {
    return;
  }

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  ScrollTrigger.refresh();
}

async function init() {
  const ready = await ensureDependencies();
  if (!ready) {
    return;
  }

  buildTimeline();
  setupScene();
  await buildCards();
  setupScroll();
  updateActiveInfo(0);
  setHeroVisibility(false);
  render();

  window.addEventListener("resize", handleResize);
  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("pointerleave", handlePointerLeave);
}

init().catch((error) => {
  console.error("Failed to initialize immersive timeline", error);
  descriptionEl.textContent = "Could not load the immersive gallery assets. Please refresh the page.";
});

window.addEventListener("beforeunload", () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  renderer?.dispose();
  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("pointerleave", handlePointerLeave);
});