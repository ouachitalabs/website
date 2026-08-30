import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

const canvas = document.querySelector("#terrain-canvas");
const container = document.querySelector(".terrain");

if (canvas && container) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  const field = new THREE.Group();
  const lines = [];
  const lineCount = 43;
  const pointCount = 160;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection?.saveData === true;
  const pointer = new THREE.Vector2(0.52, 0.45);
  const pointerTarget = new THREE.Vector2(0.52, 0.45);
  const clock = new THREE.Clock();

  camera.position.set(0, 5.1, 9.2);
  camera.lookAt(0, 0.1, 0);
  field.rotation.z = -0.1;
  scene.add(field);

  // The Ouachitas are long, parallel ridges that have been folded and
  // compressed—not a collection of isolated peaks. Layered waves and a
  // localized bend approximate that structure without tracing the source map.
  const ridge = (x, z) => {
    const fold = 0.82 * Math.sin(x * 0.43) + 0.24 * Math.sin((x - z) * 0.82);
    const phase = z * 2.05 + x * 0.36 + fold;
    const strata = Math.pow(0.5 + 0.5 * Math.cos(phase), 5.5) * 0.86;
    const secondary = Math.pow(0.5 + 0.5 * Math.cos(phase * 0.51 + 1.2), 8) * 0.24;
    const westernLift = Math.exp(-0.13 * ((x + 2.7) ** 2 + (z + 0.5) ** 2)) * 0.32;
    const easternBend = Math.exp(-0.16 * ((x - 2.1) ** 2 + (z - 0.35) ** 2)) * 0.25;
    return strata + secondary + westernLift + easternBend - 0.28;
  };

  for (let row = 0; row < lineCount; row += 1) {
    const z = THREE.MathUtils.lerp(-4, 4, row / (lineCount - 1));
    const positions = new Float32Array(pointCount * 3);

    for (let point = 0; point < pointCount; point += 1) {
      const x = THREE.MathUtils.lerp(-6.2, 6.2, point / (pointCount - 1));
      const offset = point * 3;
      positions[offset] = x;
      positions[offset + 1] = ridge(x, z);
      positions[offset + 2] = z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const isWaterLine = row === 11 || row === 31;
    const material = new THREE.LineBasicMaterial({
      color: isWaterLine ? 0x345fd8 : row % 6 === 0 ? 0x5f6957 : 0x173c32,
      transparent: true,
      opacity: isWaterLine ? 0.26 : row % 6 === 0 ? 0.2 : 0.14,
    });

    const line = new THREE.Line(geometry, material);
    line.userData.z = z;
    field.add(line);
    lines.push(line);
  }

  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  };

  const updatePointer = (event) => {
    pointerTarget.x = event.clientX / window.innerWidth;
    pointerTarget.y = event.clientY / window.innerHeight;
  };

  const draw = (elapsed = 0) => {
    pointer.lerp(pointerTarget, 0.035);
    const pointerX = THREE.MathUtils.lerp(-4.8, 4.8, pointer.x);
    const pointerZ = THREE.MathUtils.lerp(-3.5, 3.5, pointer.y);

    for (const line of lines) {
      const positions = line.geometry.attributes.position;
      const z = line.userData.z;

      for (let point = 0; point < pointCount; point += 1) {
        const x = positions.getX(point);
        const distance = (x - pointerX) ** 2 + (z - pointerZ) ** 2;
        const pressure = Math.exp(-distance * 0.62) * 0.2;
        const breath = Math.sin(elapsed * 0.24 + x * 0.31 + z * 0.47) * 0.018;
        positions.setY(point, ridge(x, z) + pressure + breath);
      }

      positions.needsUpdate = true;
    }

    field.rotation.y = (pointer.x - 0.5) * 0.04;
    renderer.render(scene, camera);
  };

  let animationFrame;
  const animate = () => {
    draw(clock.getElapsedTime());
    animationFrame = requestAnimationFrame(animate);
  };

  resize();

  if (reducedMotion || saveData) {
    draw(0);
  } else {
    window.addEventListener("pointermove", updatePointer, { passive: true });
    animate();
  }

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (reducedMotion || saveData) return;

    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
    } else {
      clock.getDelta();
      animate();
    }
  });
}
