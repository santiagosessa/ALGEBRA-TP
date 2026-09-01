// Cartesian 3D Explorer - Interactive Geometry in R³ for Algebra & Analytical Geometry
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export class Cartesian3DExplorer {
  constructor(containerElement, options = {}) {
    this.container = typeof containerElement === "string" 
      ? document.querySelector(containerElement) 
      : containerElement;

    if (!this.container) {
      console.error("Cartesian3DExplorer: Container element not found.");
      return;
    }

    this.options = Object.assign({
      autoRotate: false,
      initialScene: "interseccion",
      onSceneChange: null
    }, options);

    this.currentSceneKey = this.options.initialScene;
    this.layers = {
      plane: true,
      line: true,
      normal: true,
      points: true,
      grid: true
    };

    this.layerGroups = {
      plane: new THREE.Group(),
      line: new THREE.Group(),
      normal: new THREE.Group(),
      points: new THREE.Group(),
      grid: new THREE.Group()
    };

    this.init();
  }

  init() {
    this.createDOM();
    this.initThree();
    this.setupControls();
    this.setupEventListeners();
    this.loadScene(this.currentSceneKey);
    this.animate();
  }

  createDOM() {
    this.container.classList.add("cartesian-3d-wrapper");
    this.container.innerHTML = `
      <div class="c3d-header">
        <div class="c3d-title-group">
          <div class="c3d-badge">3D INTERACTIVO · R³</div>
          <select class="c3d-scene-select" aria-label="Seleccionar gráfico 3D">
            <option value="interseccion">01 · Intersección Recta-Plano: r ∩ π = {I}</option>
            <option value="angulo">02 · Ángulo Recta-Plano (α = 6,38° vs β = 83,62°)</option>
            <option value="parametro_paralelo">03.a · Parámetro m: Recta Paralela al Plano (m = 2/3)</option>
            <option value="parametro_incompatible">03.b · Parámetro m: Sistema Incompatible (S = ∅)</option>
            <option value="proyectantes">04 · Tres Planos Proyectantes Intersecándose en R³</option>
            <option value="auditoria">05 · Auditoría Técnica: Solución I ∈ π vs Error P ∉ π</option>
          </select>
        </div>
        <div class="c3d-header-actions">
          <button class="c3d-btn c3d-btn-autorotate" title="Activar/Desactivar giro automático">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            <span>Auto-Giro</span>
          </button>
          <button class="c3d-btn c3d-btn-close" title="Cerrar visor 3D">✕</button>
        </div>
      </div>

      <div class="c3d-viewport">
        <canvas class="c3d-canvas"></canvas>
      </div>
    `;

    this.canvas = this.container.querySelector(".c3d-canvas");
    this.sceneSelect = this.container.querySelector(".c3d-scene-select");
    this.autoRotateBtn = this.container.querySelector(".c3d-btn-autorotate");
    this.closeBtn = this.container.querySelector(".c3d-btn-close");
  }

  initThree() {
    const width = this.canvas.clientWidth || 800;
    const height = this.canvas.clientHeight || 550;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x061118);
    this.scene.fog = new THREE.FogExp2(0x061118, 0.015);

    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    this.camera.position.set(18, 14, 22);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // Lighting
    const ambient = new THREE.AmbientLight(0xdcf0ee, 1.4);
    this.scene.add(ambient);

    const dirLight1 = new THREE.DirectionalLight(0xfff3d6, 2.6);
    dirLight1.position.set(20, 35, 25);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight2.position.set(-20, -10, -20);
    this.scene.add(dirLight2);

    // Layer Groups
    Object.values(this.layerGroups).forEach(group => this.scene.add(group));
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.rotateSpeed = 0.85;
    this.controls.zoomSpeed = 1.0;
    this.controls.panSpeed = 0.8;
    this.controls.target.set(3, 2, -2);
    this.controls.autoRotate = this.options.autoRotate;
    this.controls.autoRotateSpeed = 1.2;
    this.controls.maxDistance = 80;
    this.controls.minDistance = 2;
  }

  setupEventListeners() {
    this.sceneSelect.addEventListener("change", e => {
      this.loadScene(e.target.value);
    });

    this.autoRotateBtn.addEventListener("click", () => {
      this.controls.autoRotate = !this.controls.autoRotate;
      this.autoRotateBtn.classList.toggle("is-active", this.controls.autoRotate);
    });

    this.closeBtn.addEventListener("click", () => {
      this.hide();
    });

    window.addEventListener("resize", () => this.onResize());
    new ResizeObserver(() => this.onResize()).observe(this.container);
  }

  onResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const width = this.canvas.clientWidth || this.container.clientWidth;
    const height = this.canvas.clientHeight || (this.container.clientHeight - 40);
    if (width <= 0 || height <= 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  setCameraView(presetKey, duration = 0.8) {
    const targetPos = new THREE.Vector3();
    const targetLook = new THREE.Vector3(3, 2, -2);

    if (presetKey === "iso") {
      targetPos.set(16, 13, 20);
    } else if (presetKey === "xy") {
      targetPos.set(0.01, 28, 0.01);
    } else if (presetKey === "xz") {
      targetPos.set(0.01, 0.01, 28);
    } else if (presetKey === "yz") {
      targetPos.set(28, 0.01, 0.01);
    } else {
      targetPos.set(18, 14, 22);
    }

    if (window.gsap) {
      window.gsap.to(this.camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: duration,
        ease: "power2.out",
        onUpdate: () => this.controls.update()
      });
      window.gsap.to(this.controls.target, {
        x: targetLook.x,
        y: targetLook.y,
        z: targetLook.z,
        duration: duration,
        ease: "power2.out"
      });
    } else {
      this.camera.position.copy(targetPos);
      this.controls.target.copy(targetLook);
      this.controls.update();
    }
  }

  clearSceneGroups() {
    Object.values(this.layerGroups).forEach(group => {
      while (group.children.length > 0) {
        const obj = group.children[0];
        group.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      }
    });
  }

  // -----------------------------------------------------------
  // 3D GEOMETRIC PRIMITIVES & BUILDERS
  // -----------------------------------------------------------
  buildCoordinateAxes(size = 14) {
    const g = this.layerGroups.grid;

    // Ground Grid at Y = 0
    const gridHelper = new THREE.GridHelper(size * 2, size * 2, 0x38bdf8, 0x183c4c);
    gridHelper.position.y = -0.01;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.35;
    g.add(gridHelper);

    // Axis Lines & Arrows
    const xAxis = this.createArrow(new THREE.Vector3(-size, 0, 0), new THREE.Vector3(1, 0, 0), size * 2, 0xf87171, "+X");
    const yAxis = this.createArrow(new THREE.Vector3(0, -size * 0.6, 0), new THREE.Vector3(0, 1, 0), size * 1.6, 0x4ade80, "+Z");
    const zAxis = this.createArrow(new THREE.Vector3(0, 0, -size), new THREE.Vector3(0, 0, 1), size * 2, 0x38bdf8, "+Y");

    g.add(xAxis);
    g.add(yAxis);
    g.add(zAxis);

    // Origin Sphere
    const oGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const oMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const oMesh = new THREE.Mesh(oGeo, oMat);
    g.add(oMesh);
  }

  createArrow(origin, dir, length, colorHex, label) {
    const group = new THREE.Group();
    const normalizedDir = dir.clone().normalize();
    const arrow = new THREE.ArrowHelper(normalizedDir, origin, length, colorHex, 0.7, 0.35);
    group.add(arrow);

    if (label) {
      const tipPos = origin.clone().add(normalizedDir.clone().multiplyScalar(length + 0.5));
      const sprite = this.createTextSprite(label, { color: colorHex, fontSize: 28, bold: true });
      sprite.position.copy(tipPos);
      sprite.scale.set(1.4, 0.7, 1);
      group.add(sprite);
    }
    return group;
  }

  createLineCylinder(p1, p2, colorHex, radius = 0.09) {
    const v1 = p1.clone();
    const v2 = p2.clone();
    const distance = v1.distanceTo(v2);
    const position = v1.clone().add(v2).multiplyScalar(0.5);

    const geometry = new THREE.CylinderGeometry(radius, radius, distance, 12);
    const material = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.2,
      metalness: 0.4,
      emissive: colorHex,
      emissiveIntensity: 0.35
    });

    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.copy(position);

    const orientation = new THREE.Matrix4();
    const offsetRotation = new THREE.Matrix4();
    orientation.lookAt(v1, v2, new THREE.Vector3(0, 1, 0));
    offsetRotation.makeRotationX(Math.PI / 2);
    orientation.multiply(offsetRotation);
    cylinder.applyMatrix4(orientation);

    return cylinder;
  }

  createPointBeacon(pos, colorHex, labelText, dropLines = true) {
    const group = new THREE.Group();
    group.position.copy(pos);

    // Inner Sphere
    const sphereGeo = new THREE.SphereGeometry(0.24, 20, 20);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.85,
      roughness: 0.1,
      metalness: 0.8
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphere);

    // Outer Glow Halo
    const haloGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    group.add(halo);

    // Label Sprite
    if (labelText) {
      const sprite = this.createTextSprite(labelText, {
        color: colorHex,
        fontSize: 26,
        bold: true
      });
      sprite.position.set(0, 0.85, 0);
      sprite.scale.set(3.0, 1.0, 1);
      group.add(sprite);
    }

    // Coordinate Drop Lines
    if (dropLines) {
      const dropMat = new THREE.LineDashedMaterial({
        color: colorHex,
        dashSize: 0.3,
        gapSize: 0.2,
        transparent: true,
        opacity: 0.7
      });

      const pGround = new THREE.Vector3(pos.x, 0, pos.z);
      const geomY = new THREE.BufferGeometry().setFromPoints([pos, pGround]);
      const lineY = new THREE.Line(geomY, dropMat);
      lineY.computeLineDistances();
      this.layerGroups.points.add(lineY);

      const ringGeo = new THREE.RingGeometry(0.15, 0.3, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.copy(pGround);
      this.layerGroups.points.add(ring);
    }

    return group;
  }

  createPlaneMesh(normalVec, pointOnPlane, sizeX = 18, sizeZ = 18, colorHex = 0x0284c7, opacity = 0.42) {
    const group = new THREE.Group();
    const geom = new THREE.PlaneGeometry(sizeX, sizeZ, 12, 12);
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      transparent: true,
      opacity: opacity,
      side: THREE.DoubleSide,
      roughness: 0.15,
      metalness: 0.25,
      depthWrite: false
    });

    const plane = new THREE.Mesh(geom, mat);

    // Align plane normal with normalVec
    const normal = normalVec.clone().normalize();
    const up = new THREE.Vector3(0, 0, 1);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
    plane.quaternion.copy(quaternion);
    plane.position.copy(pointOnPlane);
    group.add(plane);

    // Glowing Wireframe border
    const edgeGeom = new THREE.EdgesGeometry(geom);
    const edgeMat = new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edgeGeom, edgeMat);
    wireframe.quaternion.copy(quaternion);
    wireframe.position.copy(pointOnPlane);
    group.add(wireframe);

    return group;
  }

  createTextSprite(text, opts = {}) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext("2d");

    const fontSize = opts.fontSize || 28;
    const color = typeof opts.color === "number" ? `#${opts.color.toString(16).padStart(6, "0")}` : (opts.color || "#ffffff");
    const bgColor = opts.bgColor || "rgba(8, 27, 36, 0.88)";
    const borderColor = typeof opts.borderColor === "number" ? `#${opts.borderColor.toString(16).padStart(6, "0")}` : (opts.borderColor || color);

    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    
    const r = 14;
    ctx.beginPath();
    ctx.moveTo(r, 6);
    ctx.arcTo(512 - 6, 6, 512 - 6, 160 - 6, r);
    ctx.arcTo(512 - 6, 160 - 6, 6, 160 - 6, r);
    ctx.arcTo(6, 160 - 6, 6, 6, r);
    ctx.arcTo(6, 6, 512 - 6, 6, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = `${opts.bold ? "bold " : ""}${fontSize}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 80);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    return new THREE.Sprite(spriteMat);
  }

  // -----------------------------------------------------------
  // SCENE BUILDERS
  // -----------------------------------------------------------
  loadScene(sceneKey) {
    this.currentSceneKey = sceneKey;
    if (this.sceneSelect) {
      this.sceneSelect.value = sceneKey;
    }
    this.clearSceneGroups();
    this.buildCoordinateAxes(16);

    switch (sceneKey) {
      case "interseccion":
        this.buildSceneInterseccion();
        break;
      case "angulo":
        this.buildSceneAngulo();
        break;
      case "parametro_paralelo":
        this.buildSceneParametroParalelo();
        break;
      case "parametro_incompatible":
        this.buildSceneParametroIncompatible();
        break;
      case "proyectantes":
        this.buildSceneProyectantes();
        break;
      case "auditoria":
        this.buildSceneAuditoria();
        break;
      default:
        this.buildSceneInterseccion();
    }

    if (typeof this.options.onSceneChange === "function") {
      this.options.onSceneChange(sceneKey);
    }
  }

  // 1. Intersección r ∩ π = {I}
  buildSceneInterseccion() {
    const toThree = (x, y, z) => new THREE.Vector3(x, z, y);

    // Plane 2x - y + z - 6 = 0 -> Normal n=(2, -1, 1), Point P_plane=(3, 0, 0)
    const normalMath = new THREE.Vector3(2, -1, 1);
    const nThree = toThree(normalMath.x, normalMath.y, normalMath.z);
    const pCenterThree = toThree(4.5, 2.6, -3.3);

    const planeObj = this.createPlaneMesh(nThree, pCenterThree, 26, 26, 0x0284c7, 0.42);
    this.layerGroups.plane.add(planeObj);

    // Normal Vector n=(2, -1, 1) starting from plane center
    const nArrow = this.createArrow(pCenterThree, nThree, 4.5, 0x38bdf8, "n = (2, -1, 1)");
    this.layerGroups.normal.add(nArrow);

    // Line r: P0(-1, 2, 0) + lambda*(3, 1, -2)
    const pStart = toThree(-1 + 3 * (-1), 2 + 1 * (-1), -2 * (-1));
    const pEnd = toThree(-1 + 3 * 5, 2 + 1 * 5, -2 * 5);
    const lineMesh = this.createLineCylinder(pStart, pEnd, 0xf0b36c, 0.12);
    this.layerGroups.line.add(lineMesh);

    // Base point P0(-1, 2, 0)
    const p0Three = toThree(-1, 2, 0);
    const p0Beacon = this.createPointBeacon(p0Three, 0xf0b36c, "P0(-1, 2, 0) ∈ r", true);
    this.layerGroups.points.add(p0Beacon);

    // Intersection point I(9, 16/3, -20/3)
    const IThree = toThree(9, 16/3, -20/3);
    const IBeacon = this.createPointBeacon(IThree, 0x4ade80, "I(9, 16/3, -20/3) ∈ π ∩ r", true);
    this.layerGroups.points.add(IBeacon);

    this.controls.target.copy(pCenterThree);
    this.camera.position.set(16, 12, 18);
    this.controls.update();
  }

  // 2. Ángulo Recta-Plano
  buildSceneAngulo() {
    const toThree = (x, y, z) => new THREE.Vector3(x, z, y);

    const nMath = new THREE.Vector3(1, -2, 2);
    const nThree = toThree(nMath.x, nMath.y, nMath.z);
    const planeObj = this.createPlaneMesh(nThree, new THREE.Vector3(0, 0, 0), 20, 20, 0x0284c7, 0.38);
    this.layerGroups.plane.add(planeObj);

    // Normal Vector n = (1, -2, 2)
    const nArrow = this.createArrow(new THREE.Vector3(0, 0, 0), nThree, 6, 0x38bdf8, "n = (1, -2, 2)");
    this.layerGroups.normal.add(nArrow);

    // Direction Vector d = (1, 2, 2)
    const dMath = new THREE.Vector3(1, 2, 2);
    const dThree = toThree(dMath.x, dMath.y, dMath.z);
    const dArrow = this.createArrow(new THREE.Vector3(0, 0, 0), dThree, 6, 0xf0b36c, "d = (1, 2, 2)");
    this.layerGroups.line.add(dArrow);

    // Projected Vector d_proj on plane: (8/9, 20/9, 16/9)
    const dProjMath = new THREE.Vector3(8/9, 20/9, 16/9);
    const dProjThree = toThree(dProjMath.x, dProjMath.y, dProjMath.z);
    const dProjArrow = this.createArrow(new THREE.Vector3(0, 0, 0), dProjThree, 5.5, 0x4ade80, "d_proj [en π]");
    this.layerGroups.line.add(dProjArrow);

    // Perpendicular drop from d to d_proj
    const dropLine = this.createLineCylinder(dThree.clone().multiplyScalar(6/3), dProjThree.clone().multiplyScalar(5.5/3), 0xf87171, 0.05);
    this.layerGroups.line.add(dropLine);

    // Badges in 3D
    const betaSprite = this.createTextSprite("β ≈ 83,62° (con la Normal)", { color: 0x38bdf8, fontSize: 24 });
    betaSprite.position.set(1.5, 3.2, 0.5);
    betaSprite.scale.set(2.8, 0.9, 1);
    this.layerGroups.points.add(betaSprite);

    const alphaSprite = this.createTextSprite("α ≈ 6,38° (con el Plano)", { color: 0x4ade80, fontSize: 24 });
    alphaSprite.position.set(2.8, 1.5, 2.5);
    alphaSprite.scale.set(2.8, 0.9, 1);
    this.layerGroups.points.add(alphaSprite);

    this.controls.target.set(1.5, 1.5, 1.5);
    this.camera.position.set(13, 11, 15);
    this.controls.update();
  }

  // 3.a Parámetro m (Paralelo)
  buildSceneParametroParalelo() {
    const toThree = (x, y, z) => new THREE.Vector3(x, z, y);

    // Normal n = (3, 1, -2)
    const nMath = new THREE.Vector3(3, 1, -2);
    const nThree = toThree(nMath.x, nMath.y, nMath.z);

    const planeObj = this.createPlaneMesh(nThree, new THREE.Vector3(0, 0, 0), 22, 22, 0x059669, 0.38);
    this.layerGroups.plane.add(planeObj);

    const nArrow = this.createArrow(new THREE.Vector3(0, 0, 0), nThree, 6, 0x38bdf8, "n = (3, 1, -2)");
    this.layerGroups.normal.add(nArrow);

    // Direction Vector d = (2/3, 6, 4) perpendicular to n
    const dMath = new THREE.Vector3(2/3, 6, 4);
    const dThree = toThree(dMath.x, dMath.y, dMath.z);
    const dArrow = this.createArrow(new THREE.Vector3(0, 0, 0), dThree, 6.5, 0xf0b36c, "d = (2/3, 6, 4) [m=2/3]");
    this.layerGroups.line.add(dArrow);

    // Line r through P(0, 2, 1) parallel to plane
    const pCenter = toThree(0, 2, 1);
    const pStart = pCenter.clone().add(dThree.clone().multiplyScalar(-1.5));
    const pEnd = pCenter.clone().add(dThree.clone().multiplyScalar(1.5));
    const lineMesh = this.createLineCylinder(pStart, pEnd, 0xf0b36c, 0.1);
    this.layerGroups.line.add(lineMesh);

    const badge = this.createTextSprite("r ∥ π ⟺ d ⟂ n (d · n = 0)", { color: 0x4ade80, fontSize: 24 });
    badge.position.set(0, 4.2, 0);
    badge.scale.set(3.2, 1.0, 1);
    this.layerGroups.points.add(badge);

    this.controls.target.set(0, 2, 1);
    this.camera.position.set(14, 12, 16);
    this.controls.update();
  }

  // 3.b Parámetro m (Incompatible)
  buildSceneParametroIncompatible() {
    const toThree = (x, y, z) => new THREE.Vector3(x, z, y);

    const nMath = new THREE.Vector3(3, 1, -2);
    const nThree = toThree(nMath.x, nMath.y, nMath.z);

    const planeObj = this.createPlaneMesh(nThree, new THREE.Vector3(0, 0, 0), 22, 22, 0xe11d48, 0.32);
    this.layerGroups.plane.add(planeObj);

    const nArrow = this.createArrow(new THREE.Vector3(0, 0, 0), nThree, 6, 0x38bdf8, "n = (3, 1, -2)");
    this.layerGroups.normal.add(nArrow);

    // Vector attempting d = k*n with k=6 -> (18, 6, -12) vs required d=(m, 6, 4)
    const dTarget = toThree(18, 6, -12);
    const dGiven = toThree(2, 6, 4);

    const dArrow1 = this.createArrow(new THREE.Vector3(0, 0, 0), dTarget, 5.5, 0x38bdf8, "6·n = (18, 6, -12)");
    const dArrow2 = this.createArrow(new THREE.Vector3(0, 0, 0), dGiven, 5.5, 0xf87171, "d = (m, 6, 4) [Contradicción]");
    this.layerGroups.line.add(dArrow1);
    this.layerGroups.line.add(dArrow2);

    const badge = this.createTextSprite("6/1 ≠ 4/(-2) ⟹ ∄ m ∈ ℝ (S = ∅)", { color: 0xf87171, fontSize: 24 });
    badge.position.set(0, 4.2, 0);
    badge.scale.set(3.4, 1.0, 1);
    this.layerGroups.points.add(badge);

    this.controls.target.set(0, 2, 0);
    this.camera.position.set(14, 12, 16);
    this.controls.update();
  }

  // 4. Tres Planos Proyectantes
  buildSceneProyectantes() {
    const toThree = (x, y, z) => new THREE.Vector3(x, z, y);

    // Line r: P(2, -1, 5) + lambda*(4, -3, 1)
    const pBase = toThree(2, -1, 5);
    const dMath = new THREE.Vector3(4, -3, 1);
    const dThree = toThree(dMath.x, dMath.y, dMath.z);

    const pStart = pBase.clone().add(dThree.clone().multiplyScalar(-2));
    const pEnd = pBase.clone().add(dThree.clone().multiplyScalar(2));
    const lineMesh = this.createLineCylinder(pStart, pEnd, 0xf0b36c, 0.14);
    this.layerGroups.line.add(lineMesh);

    const pBeacon = this.createPointBeacon(pBase, 0xf0b36c, "P(2, -1, 5) ∈ r", true);
    this.layerGroups.points.add(pBeacon);

    // Plane πxy: 3x + 4y - 2 = 0 -> Normal n_xy = (3, 4, 0)
    const nXY = toThree(3, 4, 0);
    const planeXY = this.createPlaneMesh(nXY, pBase, 18, 18, 0x0284c7, 0.32);
    this.layerGroups.plane.add(planeXY);

    // Plane πxz: x - 4z + 18 = 0 -> Normal n_xz = (1, 0, -4)
    const nXZ = toThree(1, 0, -4);
    const planeXZ = this.createPlaneMesh(nXZ, pBase, 18, 18, 0x8b5cf6, 0.32);
    this.layerGroups.plane.add(planeXZ);

    // Plane πyz: y + 3z - 14 = 0 -> Normal n_yz = (0, 1, 3)
    const nYZ = toThree(0, 1, 3);
    const planeYZ = this.createPlaneMesh(nYZ, pBase, 18, 18, 0x10b981, 0.32);
    this.layerGroups.plane.add(planeYZ);

    this.controls.target.copy(pBase);
    this.camera.position.set(16, 14, 18);
    this.controls.update();
  }

  // 5. Auditoría Técnica (I ∈ π vs P ∉ π)
  buildSceneAuditoria() {
    const toThree = (x, y, z) => new THREE.Vector3(x, z, y);

    const normalMath = new THREE.Vector3(2, -1, 1);
    const nThree = toThree(normalMath.x, normalMath.y, normalMath.z);
    const pCenter = toThree(9, 16/3, -20/3);

    const planeObj = this.createPlaneMesh(nThree, pCenter, 28, 28, 0x0284c7, 0.35);
    this.layerGroups.plane.add(planeObj);

    // Line r
    const pStart = toThree(-1 + 3 * 2, 2 + 1 * 2, -2 * 2);
    const pEnd = toThree(-1 + 3 * 6, 2 + 1 * 6, -2 * 6);
    const lineMesh = this.createLineCylinder(pStart, pEnd, 0xf0b36c, 0.12);
    this.layerGroups.line.add(lineMesh);

    // Correct Point I(9, 16/3, -20/3)
    const IThree = toThree(9, 16/3, -20/3);
    const IBeacon = this.createPointBeacon(IThree, 0x4ade80, "I(9, 5.33, -6.67) ∈ π [CORRECTO]", true);
    this.layerGroups.points.add(IBeacon);

    // Erroneous Point P(14, 7, -10)
    const PThree = toThree(14, 7, -10);
    const PBeacon = this.createPointBeacon(PThree, 0xf87171, "P(14, 7, -10) ∉ π [ERROR TP]", true);
    this.layerGroups.points.add(PBeacon);

    // Distance vector connecting P to its projection on plane
    const projP = toThree(14 - 2 * (5/6), 7 - (-1) * (5/6), -10 - 1 * (5/6));
    const distLine = this.createLineCylinder(PThree, projP, 0xf87171, 0.08);
    this.layerGroups.points.add(distLine);

    const distSprite = this.createTextSprite("d = 5/√6 ≠ 0", { color: 0xf87171, fontSize: 24 });
    distSprite.position.copy(PThree.clone().add(projP).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.6, 0)));
    distSprite.scale.set(2.2, 0.75, 1);
    this.layerGroups.points.add(distSprite);

    this.controls.target.copy(pCenter);
    this.camera.position.set(18, 14, 20);
    this.controls.update();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  show(sceneKey = null) {
    this.container.classList.add("is-visible");
    if (sceneKey) {
      this.loadScene(sceneKey);
    }
    requestAnimationFrame(() => this.onResize());
    setTimeout(() => this.onResize(), 150);
  }

  hide() {
    this.container.classList.remove("is-visible");
  }
}
