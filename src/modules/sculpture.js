import { motion } from "../config.js";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { drawSpecialtyCard } from "./specialty-art.js";
import {
  sampleSculpture,
  settleValue,
  sculptureStages,
  sculptureCameraDistance,
} from "./sculpture-sequence.js";
gsap.registerPlugin(ScrollTrigger);

export async function initSculpture(getMode, isCurrent) {
  const host = document.querySelector("[data-sculpture]");
  if (!host) return () => {};
  const hero = host.closest(".hero");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
  } catch {
    return () => {};
  }
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, motion.maxPixelRatio),
  );
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x101010, 0);
  renderer.domElement.setAttribute("aria-hidden", "true");
  await document.fonts.ready;
  if (!isCurrent()) {
    renderer.dispose();
    return () => {};
  }
  const cards = [...host.querySelectorAll("[data-specialty]")].map((card) => ({
    number: card.querySelector("[data-specialty-number]").textContent.trim(),
    title: [...card.querySelectorAll("[data-specialty-title] span")].map(
      (line) => line.textContent.trim(),
    ),
    description: card
      .querySelector("[data-specialty-description]")
      .textContent.trim(),
    tag: card.querySelector("[data-specialty-tag]").textContent.trim(),
    symbol: card.querySelector("[data-specialty-symbol]").getAttribute("d"),
  }));
  const textures = [];
  try {
    for (const card of cards) {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 800;
      if (!canvas.getContext("2d")) throw new Error("Canvas unavailable");
      textures.push(new THREE.CanvasTexture(canvas));
    }
    if (cards.length !== sampleSculpture(0).panels.length) {
      throw new Error("The sculpture needs three specialty cards");
    }
  } catch {
    textures.forEach((texture) => texture.dispose());
    renderer.dispose();
    return () => {};
  }
  textures.forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 11.8);
  const group = new THREE.Group();
  scene.add(group);
  const ambient = new THREE.AmbientLight(0xffffff, 2.3);
  const light = new THREE.DirectionalLight(0xe8ffc1, 4.2);
  light.position.set(3, 5, 7);
  scene.add(ambient, light);
  const panels = [];
  for (let i = 0; i < textures.length; i++) {
    const panel = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(3.7, 2.48, 0.065),
      new THREE.MeshStandardMaterial({
        color: 0x475337,
        metalness: 0.6,
        roughness: 0.3,
        transparent: true,
      }),
    );
    const surface = new THREE.Mesh(
      new THREE.PlaneGeometry(3.65, 2.43),
      new THREE.MeshBasicMaterial({
        map: textures[i],
        side: THREE.DoubleSide,
        transparent: true,
      }),
    );
    surface.position.z = 0.038;
    panel.add(body, surface);
    group.add(panel);
    panels.push(panel);
  }
  const rings = new THREE.Group();
  scene.add(rings);
  for (let i = 0; i < 2; i++) {
    const points = Array.from({ length: 96 }, (_, n) => {
      const angle = (n / 96) * Math.PI * 2;
      return new THREE.Vector3(
        Math.cos(angle) * 4.35,
        Math.sin(angle) * 2.9,
        0,
      );
    });
    const ring = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({
        color: 0xd2ff5a,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      }),
    );
    ring.rotation.set(0.2 + i * 0.75, i * 0.4, -0.25);
    rings.add(ring);
  }
  const progress = { value: 0, entry: 0 };
  const pointer = new THREE.Vector2(),
    smooth = new THREE.Vector2();
  let width = 1,
    height = 1,
    visible = true,
    raf = 0,
    disposed = false,
    target = 0,
    lastFrame = 0;
  let entrance;
  const canDraw = () =>
    !disposed && visible && !document.hidden && getMode() === "full";
  const resize = () => {
    const box = host.getBoundingClientRect();
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    renderer.setSize(width, height);
    camera.aspect = width / height;
    // Keep the entire orbit inside the camera on narrower desktop viewports.
    camera.position.z = sculptureCameraDistance(camera.aspect);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, motion.maxPixelRatio),
    );
    wake();
  };
  const sizeObserver = new ResizeObserver(resize);
  const move = (event) => {
    const box = host.getBoundingClientRect();
    pointer.set(
      THREE.MathUtils.clamp(
        ((event.clientX - box.left) / width) * 2 - 1,
        -1,
        1,
      ),
      THREE.MathUtils.clamp(
        ((event.clientY - box.top) / height) * 2 - 1,
        -1,
        1,
      ),
    );
    wake();
  };
  const resetPointer = () => {
    pointer.set(0, 0);
    wake();
  };
  hero.addEventListener("pointermove", move);
  hero.addEventListener("pointerleave", resetPointer);
  const draw = (time) => {
    raf = 0;
    if (!canDraw()) {
      lastFrame = 0;
      return;
    }
    const delta = lastFrame ? (time - lastFrame) / 1000 : 1 / 60;
    lastFrame = time;
    progress.value = settleValue(
      progress.value,
      target,
      delta,
      motion.sculptureSettle,
    );
    smooth.x = settleValue(smooth.x, pointer.x, delta, 8);
    smooth.y = settleValue(smooth.y, pointer.y, delta, 8);
    const pose = sampleSculpture(progress.value);
    const pointerWeight = 1 - pose.progress;
    group.rotation.set(
      pose.rotation[0] - smooth.y * 0.09 * pointerWeight,
      pose.rotation[1] + smooth.x * 0.14 * pointerWeight,
      pose.rotation[2],
    );
    group.position.set(0.15, 0.15, 0);
    panels.forEach((panel, i) => {
      const item = pose.panels[i];
      panel.position.set(
        item.position[0],
        item.position[1],
        item.position[2] - (1 - progress.entry) * (3 + i * 0.3),
      );
      panel.rotation.fromArray(item.rotation);
      panel.scale.setScalar(item.scale);
      panel.visible = item.opacity > 0.001;
      panel.children.forEach((mesh) => {
        mesh.material.opacity = item.opacity;
      });
    });
    rings.rotation.set(
      pose.progress * 0.5,
      pose.progress * -0.7,
      pose.progress * 0.8,
    );
    rings.children.forEach((ring) => {
      ring.material.opacity = 0.18 * progress.entry * (1 - pose.progress);
    });
    light.position.x = 3 + smooth.x;
    renderer.render(scene, camera);
    // Reveal only after a real frame; the static artwork covers loading/failure.
    host.classList.add("is-ready");
    host.dataset.sceneStage = sculptureStages[pose.stage].toLowerCase();
    host.dataset.sceneProgress = String(pose.progress);
    if (
      progress.value !== target ||
      smooth.x !== pointer.x ||
      smooth.y !== pointer.y ||
      entrance?.isActive()
    )
      raf = requestAnimationFrame(draw);
    else lastFrame = 0;
  };
  const wake = () => {
    if (!raf && canDraw()) raf = requestAnimationFrame(draw);
  };
  sizeObserver.observe(host);
  resize();
  const visibility = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (!visible) {
        cancelAnimationFrame(raf);
        raf = 0;
        lastFrame = 0;
        entrance?.pause();
      } else {
        if (canDraw()) entrance?.resume();
        wake();
      }
    },
    { rootMargin: "60px" },
  );
  visibility.observe(host);
  const tabVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
      lastFrame = 0;
      entrance?.pause();
      pointer.set(0, 0);
    } else {
      if (canDraw()) entrance?.resume();
      wake();
    }
  };
  document.addEventListener("visibilitychange", tabVisibility);
  host.append(renderer.domElement);
  entrance = gsap.to(progress, {
    entry: 1,
    duration: motion.sculptureEntry,
    ease: "power3.out",
    paused: !canDraw(),
    onUpdate: wake,
  });
  const scrollMedia = gsap.matchMedia();
  scrollMedia.add(
    { tall: "(min-height: 700px)", short: "(max-height: 699px)" },
    (context) => {
      const update = (self) => {
        target = self.progress;
        if (target > 0.01 && progress.entry < 1) entrance.progress(1);
        wake();
      };
      const scroll = ScrollTrigger.create({
        id: "home-sculpture",
        trigger: hero,
        start: "top top",
        end: () => `+=${window.innerHeight * motion.sculptureScrollScreens}`,
        pin: context.conditions.tall,
        anticipatePin: 1,
        refreshPriority: 1,
        invalidateOnRefresh: true,
        onUpdate: update,
        onRefresh: update,
      });
      target = scroll.progress;
      progress.value = target;
      if (target > 0) {
        entrance.progress(1);
      }
      return () => scroll.kill();
    },
  );
  const updateTheme = () => {
    const style = getComputedStyle(document.documentElement);
    const colors = {
      surface: style.getPropertyValue("--surface").trim() || "#181c15",
      text: style.getPropertyValue("--paper").trim(),
      accent: style.getPropertyValue("--lime").trim(),
      line: style.getPropertyValue("--line").trim(),
    };
    textures.forEach((texture, i) => {
      drawSpecialtyCard(texture.image.getContext("2d"), cards[i], colors);
      texture.needsUpdate = true;
    });
    panels.forEach((panel) =>
      panel.children[0].material.color.set(colors.accent),
    );
    rings.children.forEach((ring) => ring.material.color.set(colors.accent));
    wake();
  };
  document.addEventListener("portfolio:theme", updateTheme);
  updateTheme();
  ScrollTrigger.refresh();
  wake();
  const cleanDistortion = initDistortion(getMode);
  function cleanup() {
    if (disposed) return;
    disposed = true;
    entrance.kill();
    scrollMedia.revert();
    cancelAnimationFrame(raf);
    visibility.disconnect();
    sizeObserver.disconnect();
    document.removeEventListener("visibilitychange", tabVisibility);
    document.removeEventListener("portfolio:theme", updateTheme);
    window.removeEventListener("pagehide", cleanup);
    renderer.domElement.removeEventListener("webglcontextlost", lostContext);
    hero.removeEventListener("pointermove", move);
    hero.removeEventListener("pointerleave", resetPointer);
    scene.traverse((object) => {
      object.geometry?.dispose();
      if (object.material) object.material.dispose();
    });
    cleanDistortion();
    textures.forEach((texture) => texture.dispose());
    renderer.dispose();
    renderer.domElement.remove();
    host.classList.remove("is-ready");
    delete host.dataset.sceneStage;
    delete host.dataset.sceneProgress;
  }
  const lostContext = (event) => {
    event.preventDefault();
    cleanup();
  };
  renderer.domElement.addEventListener("webglcontextlost", lostContext);
  window.addEventListener("pagehide", cleanup, { once: true });
  return cleanup;
}

function initDistortion(getMode) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
  } catch {
    return () => {};
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, motion.maxPixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(),
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uTexture: { value: null },
    uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    uStrength: { value: 0 },
    uTime: { value: 0 },
    uScale: { value: new THREE.Vector2(1, 1) },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader:
      "varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.0);}",
    fragmentShader:
      "uniform sampler2D uTexture; uniform vec2 uPointer; uniform float uStrength; uniform float uTime; uniform vec2 uScale; varying vec2 vUv; void main(){vec2 uv=(vUv-.5)*uScale+.5;float d=distance(vUv,uPointer);float wave=sin(d*24.-uTime*2.)*exp(-d*5.)*uStrength;uv+=vec2(wave,wave*.5); gl_FragColor=texture2D(uTexture,uv); #include <colorspace_fragment> }"
        .replace(" #include", "\n#include")
        .replace("> }", ">\n}"),
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  scene.add(new THREE.Mesh(geometry, material));
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.opacity = "0";
  let active,
    frame = 0,
    target = 0,
    destroyed = false,
    generation = 0;
  let settleTimer;
  const pulse = () => {
    target = 0.025;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      target = 0;
    }, 180);
  };
  const cache = new Map(),
    bindings = [];
  const draw = () => {
    frame = 0;
    if (destroyed || document.hidden || !active || getMode() !== "full") return;
    uniforms.uStrength.value += (target - uniforms.uStrength.value) * 0.09;
    uniforms.uTime.value += 0.025;
    renderer.render(scene, camera);
    canvas.style.opacity = String(Math.min(1, uniforms.uStrength.value * 70));
    if (target || uniforms.uStrength.value > 0.0002)
      frame = requestAnimationFrame(draw);
    else {
      canvas.remove();
      active = null;
      uniforms.uStrength.value = 0;
    }
  };
  document.querySelectorAll("[data-project-link]").forEach((link) => {
    const enter = async () => {
      if (getMode() !== "full" || document.hidden || destroyed) return;
      const token = ++generation;
      const image = link.querySelector("img");
      if (!image || !image.complete || !image.naturalWidth) return;
      const source = image.currentSrc || image.src;
      try {
        if (!cache.has(source))
          cache.set(
            source,
            new THREE.TextureLoader().loadAsync(source).then((texture) => {
              texture.colorSpace = THREE.SRGBColorSpace;
              return texture;
            }),
          );
        const texture = await cache.get(source);
        if (
          destroyed ||
          token !== generation ||
          document.hidden ||
          getMode() !== "full"
        )
          return;
        const rect = link.getBoundingClientRect();
        if (
          !rect.width ||
          !rect.height ||
          rect.bottom < 0 ||
          rect.top > innerHeight
        )
          return;
        const imageAspect = image.naturalWidth / image.naturalHeight;
        // A tilted cover's bounding rect is projected; use its layout dimensions
        // so the distortion canvas and DOM image keep the same size/UV mapping.
        const layoutWidth = link.clientWidth,
          layoutHeight = link.clientHeight;
        const aspect = layoutWidth / layoutHeight;
        uniforms.uScale.value.set(
          aspect < imageAspect ? aspect / imageAspect : 1,
          aspect > imageAspect ? imageAspect / aspect : 1,
        );
        renderer.setSize(layoutWidth, layoutHeight);
        uniforms.uStrength.value = 0;
        canvas.style.opacity = "0";
        uniforms.uTexture.value = texture;
        active = link;
        pulse();
        link.append(canvas);
        if (!frame) frame = requestAnimationFrame(draw);
      } catch {
        /* The DOM image remains the visual fallback. */
      }
    };
    const leave = () => {
      generation++;
      target = 0;
      clearTimeout(settleTimer);
    };
    const move = (event) => {
      const box = link.getBoundingClientRect();
      uniforms.uPointer.value.set(
        (event.clientX - box.left) / box.width,
        1 - (event.clientY - box.top) / box.height,
      );
      if (active === link) pulse();
      else enter();
    };
    link.addEventListener("pointerenter", enter);
    link.addEventListener("pointerleave", leave);
    link.addEventListener("pointermove", move);
    bindings.push(() => {
      link.removeEventListener("pointerenter", enter);
      link.removeEventListener("pointerleave", leave);
      link.removeEventListener("pointermove", move);
    });
  });
  const stop = () => {
    generation++;
    target = 0;
    clearTimeout(settleTimer);
    cancelAnimationFrame(frame);
    frame = 0;
    canvas.remove();
    active = null;
    uniforms.uStrength.value = 0;
    canvas.style.opacity = "0";
  };
  const visibility = () => {
    if (document.hidden) stop();
  };
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("scroll", stop, { passive: true });
  window.addEventListener("resize", stop, { passive: true });
  const cleanup = () => {
    if (destroyed) return;
    destroyed = true;
    generation++;
    clearTimeout(settleTimer);
    cancelAnimationFrame(frame);
    bindings.forEach((fn) => fn());
    document.removeEventListener("visibilitychange", visibility);
    window.removeEventListener("scroll", stop);
    window.removeEventListener("resize", stop);
    canvas.removeEventListener("webglcontextlost", lostContext);
    cache.forEach((promise) =>
      promise.then((texture) => texture.dispose()).catch(() => {}),
    );
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    canvas.remove();
  };
  const lostContext = (event) => {
    event.preventDefault();
    cleanup();
  };
  canvas.addEventListener("webglcontextlost", lostContext);
  return cleanup;
}
