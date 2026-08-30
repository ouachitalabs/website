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
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  const field = new THREE.Group();
  const ribbons = [];
  const ribbonCount = 38;
  const segmentCount = 150;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection?.saveData === true;
  const pointer = new THREE.Vector2(0.6, 0.5);
  const pointerTarget = pointer.clone();
  const clock = new THREE.Clock();

  const colorStops = [
    new THREE.Color("#d57a46"),
    new THREE.Color("#e7ad68"),
    new THREE.Color("#dce8d8"),
    new THREE.Color("#4d826f"),
    new THREE.Color("#315fd5"),
  ];

  camera.position.set(0, 0.2, 11.8);
  camera.lookAt(0, 0, 0);
  field.rotation.z = -0.09;
  scene.add(field);

  const skyLight = new THREE.HemisphereLight(0xe9f0e5, 0x071915, 2.1);
  const warmLight = new THREE.DirectionalLight(0xffc987, 3.4);
  const lakeLight = new THREE.PointLight(0x527cff, 4.5, 18);
  warmLight.position.set(-3.5, 5, 8);
  lakeLight.position.set(4.5, -2.5, 6);
  scene.add(skyLight, warmLight, lakeLight);

  const colorAt = (amount) => {
    const scaled = THREE.MathUtils.clamp(amount, 0, 1) * (colorStops.length - 1);
    const index = Math.min(Math.floor(scaled), colorStops.length - 2);
    return colorStops[index].clone().lerp(colorStops[index + 1], scaled - index);
  };

  const ridgePoint = (x, row, elapsed, interaction = 0) => {
    // Parallel bands spread apart at the edges and compress through the
    // center, echoing the folded, fan-like strata visible from above.
    const distanceFromFold = Math.min(1, Math.abs(x + 0.15) / 5.8);
    const spread = 0.24 + 0.88 * Math.pow(distanceFromFold, 1.25);
    const mainFold = Math.sin(x * 0.37 + elapsed * 0.07) * 0.86;
    const secondaryFold = Math.sin(x * 0.78 - row * 0.9 - elapsed * 0.045) * 0.17;
    const rake = x * -0.055;
    const y = row * 3.25 * spread + mainFold + secondaryFold + rake + interaction;
    const z = row * -0.55 + Math.cos(x * 0.31 + row * 0.7) * 0.34;
    return { y, z };
  };

  const buildRibbon = (index) => {
    const row = THREE.MathUtils.lerp(-1, 1, index / (ribbonCount - 1));
    const positions = new Float32Array(segmentCount * 2 * 3);
    const colors = new Float32Array(segmentCount * 2 * 3);
    const indices = [];
    const centerPositions = new Float32Array(segmentCount * 3);
    const baseColor = colorAt(index / (ribbonCount - 1));
    const stripWidth = index % 7 === 0 ? 0.075 : 0.045;

    for (let point = 0; point < segmentCount; point += 1) {
      const x = THREE.MathUtils.lerp(-7.2, 7.2, point / (segmentCount - 1));
      const position = ridgePoint(x, row, 0);
      const fade = Math.sin(Math.PI * (point / (segmentCount - 1)));
      const color = baseColor.clone().lerp(new THREE.Color("#ffffff"), 0.1 * fade);

      for (let side = 0; side < 2; side += 1) {
        const vertex = (point * 2 + side) * 3;
        positions[vertex] = x;
        positions[vertex + 1] = position.y + (side === 0 ? -stripWidth : stripWidth);
        positions[vertex + 2] = position.z;
        colors[vertex] = color.r;
        colors[vertex + 1] = color.g;
        colors[vertex + 2] = color.b;
      }

      centerPositions[point * 3] = x;
      centerPositions[point * 3 + 1] = position.y;
      centerPositions[point * 3 + 2] = position.z + 0.01;

      if (point < segmentCount - 1) {
        const a = point * 2;
        const b = a + 1;
        const c = a + 2;
        const d = a + 3;
        indices.push(a, b, c, b, d, c);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(indices);

    const material = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      transparent: true,
      opacity: index % 7 === 0 ? 0.88 : 0.7,
      side: THREE.DoubleSide,
      depthWrite: false,
      roughness: 0.3,
      metalness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.18,
      emissive: baseColor,
      emissiveIntensity: 0.16,
    });

    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, material);
    field.add(mesh);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(centerPositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: baseColor,
      transparent: true,
      opacity: index % 7 === 0 ? 0.92 : 0.54,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    field.add(line);

    return { mesh, line, row, stripWidth };
  };

  for (let index = 0; index < ribbonCount; index += 1) {
    ribbons.push(buildRibbon(index));
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
    const pointerX = THREE.MathUtils.lerp(-5.4, 5.4, pointer.x);
    const pointerY = THREE.MathUtils.lerp(2.4, -2.4, pointer.y);

    for (const ribbon of ribbons) {
      const meshPositions = ribbon.mesh.geometry.attributes.position;
      const linePositions = ribbon.line.geometry.attributes.position;

      for (let point = 0; point < segmentCount; point += 1) {
        const x = linePositions.getX(point);
        const influence = Math.exp(-((x - pointerX) ** 2) * 0.42);
        const natural = ridgePoint(x, ribbon.row, elapsed);
        const interaction = influence * (pointerY - natural.y) * 0.09;
        const position = ridgePoint(x, ribbon.row, elapsed, interaction);

        linePositions.setY(point, position.y);
        linePositions.setZ(point, position.z + 0.01);

        for (let side = 0; side < 2; side += 1) {
          const vertex = point * 2 + side;
          meshPositions.setY(vertex, position.y + (side === 0 ? -ribbon.stripWidth : ribbon.stripWidth));
          meshPositions.setZ(vertex, position.z);
        }
      }

      meshPositions.needsUpdate = true;
      linePositions.needsUpdate = true;
    }

    field.rotation.y = (pointer.x - 0.5) * 0.08;
    field.rotation.x = (pointer.y - 0.5) * -0.035;
    renderer.render(scene, camera);
  };

  let animationFrame;
  const animate = () => {
    draw(clock.getElapsedTime());
    animationFrame = requestAnimationFrame(animate);
  };

  resize();
  container.classList.add("is-webgl");

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
