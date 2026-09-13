import { motion } from "../config.js";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export async function initSculpture(getMode, isCurrent) {
  const host = document.querySelector("[data-sculpture]");
  if (!host) return () => {};
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
  const loader = new THREE.TextureLoader();
  const sources = [...document.querySelectorAll("[data-texture]")].map(
    (image) => image.dataset.texture,
  );
  const loaded = await Promise.allSettled(
    sources.map((source) => loader.loadAsync(source)),
  );
  const textures = loaded
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
  if (!textures.length || !isCurrent()) {
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
  for (let i = 0; i < 5; i++) {
    const panel = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(3.7, 2.48, 0.065),
      new THREE.MeshStandardMaterial({
        color: 0x475337,
        metalness: 0.6,
        roughness: 0.3,
      }),
    );
    const surface = new THREE.Mesh(
      new THREE.PlaneGeometry(3.65, 2.43),
      new THREE.MeshBasicMaterial({
        map: textures[i % textures.length],
        side: THREE.DoubleSide,
      }),
    );
    surface.position.z = 0.038;
    panel.add(body, surface);
    group.add(panel);
    panels.push(panel);
  }
  const progress = { value: 0, entry: 0 };
  const pointer = new THREE.Vector2(),
    smooth = new THREE.Vector2();
  let width = 1,
    height = 1,
    visible = true,
    raf = 0,
    disposed = false;
  const resize = () => {
    const box = host.getBoundingClientRect();
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(host);
  resize();
  const move = (event) => {
    const box = host.getBoundingClientRect();
    pointer.set(
      ((event.clientX - box.left) / width) * 2 - 1,
      ((event.clientY - box.top) / height) * 2 - 1,
    );
  };
  const resetPointer = () => pointer.set(0, 0);
  document.querySelector(".hero").addEventListener("pointermove", move);
  document
    .querySelector(".hero")
    .addEventListener("pointerleave", resetPointer);
  const draw = () => {
    raf = 0;
    if (disposed || !visible || document.hidden || getMode() === "reduced")
      return;
    smooth.lerp(pointer, 0.035);
    group.rotation.set(
      -0.11 - smooth.y * 0.055,
      -0.38 + smooth.x * 0.085,
      -0.22 + progress.value * 0.16,
    );
    group.position.set(0.2 + progress.value * 0.3, 0.35, 0);
    panels.forEach((panel, i) => {
      const n = i - 2;
      panel.position.set(
        n * (0.39 + progress.value * 0.62),
        n * (0.32 + progress.value * 0.39),
        n * 0.24 - (1 - progress.entry) * (3 + i * 0.3),
      );
      panel.rotation.set(
        n * 0.025,
        n * 0.035,
        n * (0.04 + progress.value * 0.08),
      );
    });
    light.position.x = 3 + smooth.x;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(draw);
  };
  const wake = () => {
    if (!raf && !disposed && visible && !document.hidden)
      raf = requestAnimationFrame(draw);
  };
  const visibility = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (!visible) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else wake();
    },
    { rootMargin: "60px" },
  );
  visibility.observe(host);
  const tabVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else wake();
  };
  document.addEventListener("visibilitychange", tabVisibility);
  host.append(renderer.domElement);
  host.classList.add("is-ready");
  const entrance = gsap.to(progress, {
    entry: 1,
    duration: motion.sculptureEntry,
    ease: "power3.out",
  });
  const scroll = ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: () => `+=${window.innerHeight * motion.sculptureScrollScreens}`,
    pin: window.innerHeight >= 700,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      progress.value = self.progress;
      wake();
    },
  });
  wake();
  const cleanDistortion = initDistortion(getMode);
  function cleanup() {
    if (disposed) return;
    disposed = true;
    entrance.kill();
    scroll.kill();
    cancelAnimationFrame(raf);
    visibility.disconnect();
    sizeObserver.disconnect();
    document.removeEventListener("visibilitychange", tabVisibility);
    document.querySelector(".hero")?.removeEventListener("pointermove", move);
    document
      .querySelector(".hero")
      ?.removeEventListener("pointerleave", resetPointer);
    scene.traverse((object) => {
      object.geometry?.dispose();
      if (object.material) object.material.dispose();
    });
    cleanDistortion();
    textures.forEach((texture) => texture.dispose());
    renderer.dispose();
    renderer.domElement.remove();
    host.classList.remove("is-ready");
  }
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
    if (destroyed || document.hidden || !active) return;
    uniforms.uStrength.value += (target - uniforms.uStrength.value) * 0.09;
    uniforms.uTime.value += 0.025;
    renderer.render(scene, camera);
    canvas.style.opacity = String(Math.min(1, uniforms.uStrength.value * 70));
    if (target || uniforms.uStrength.value > 0.0002)
      frame = requestAnimationFrame(draw);
    else {
      canvas.remove();
      active = null;
    }
  };
  document.querySelectorAll("[data-project-link]").forEach((link) => {
    const enter = async () => {
      if (getMode() !== "full") return;
      const token = ++generation;
      const image = link.querySelector("img");
      try {
        if (!cache.has(image.src))
          cache.set(
            image.src,
            new THREE.TextureLoader().loadAsync(image.src).then((texture) => {
              texture.colorSpace = THREE.SRGBColorSpace;
              return texture;
            }),
          );
        const texture = await cache.get(image.src);
        if (destroyed || token !== generation) return;
        const rect = link.getBoundingClientRect();
        const imageAspect = image.naturalWidth / image.naturalHeight,
          viewAspect = rect.width / rect.height;
        uniforms.uScale.value.set(
          viewAspect < imageAspect ? viewAspect / imageAspect : 1,
          viewAspect > imageAspect ? imageAspect / viewAspect : 1,
        );
        renderer.setSize(rect.width, rect.height);
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
    if (document.hidden) {
      target = 0;
      clearTimeout(settleTimer);
      cancelAnimationFrame(frame);
      frame = 0;
      canvas.remove();
      active = null;
    }
  };
  document.addEventListener("visibilitychange", stop);
  return () => {
    destroyed = true;
    generation++;
    clearTimeout(settleTimer);
    cancelAnimationFrame(frame);
    bindings.forEach((fn) => fn());
    document.removeEventListener("visibilitychange", stop);
    cache.forEach((promise) =>
      promise.then((texture) => texture.dispose()).catch(() => {}),
    );
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    canvas.remove();
  };
}
