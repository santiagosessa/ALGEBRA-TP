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
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            <span>Auto-Giro</span>
          </button>
          <button class="c3d-btn c3d-btn-close" title="Cerrar visor 3D">✕</button>
        </div>
      </div>

      <div class="c3d-viewport">
        <canvas class="c3d-canvas"></canvas>
        
        <!-- Interactive 3D Math HUD -->
        <div class="c3d-hud">
          <div class="c3d-info-card">
            <h4 class="c3d-info-title">Cargando...</h4>
            <div class="c3d-info-equation"></div>
            <div class="c3d-info-details"></div>
          </div>

          <!-- Layer Toggles -->
          <div class="c3d-layers-bar">
            <label class="c3d-toggle-label"><input type="checkbox" data-layer="plane" checked> <span>Plano π</span></label>
            <label class="c3d-toggle-label"><input type="checkbox" data-layer="line" checked> <span>Recta r</span></label>
            <label class="c3d-toggle-label"><input type="checkbox" data-layer="normal" checked> <span>Normal n</span></label>
            <label class="c3d-toggle-label"><input type="checkbox" data-layer="points" checked> <span>Puntos</span></label>
            <label class="c3d-toggle-label"><input type="checkbox" data-layer="grid" checked> <span>Ejes R³</span></label>
          </div>

          <!-- Camera Preset Bar -->
          <div class="c3d-camera-presets">
            <span class="c3d-cam-label">Vistas:</span>
            <button class="c3d-cam-btn" data-cam="iso">Isométrica</button>
            <button class="c3d-cam-btn" data-cam="xy">Superior (XY)</button>
            <button class="c3d-cam-btn" data-cam="xz">Frontal (XZ)</button>
            <button class="c3d-cam-btn" data-cam="yz">Lateral (YZ)</button>
            <button class="c3d-cam-btn" data-cam="reset">Reset</button>
          </div>
        </div>

        <div class="c3d-hint">
          <span>🖱️ Arrastra para <strong>GIRAR</strong></span> · 
          <span>🔍 Rueda para <strong>ZOOM</strong></span> · 
          <span>🖱️ Clic derecho para <strong>DESPLAZAR</strong></span>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector(".c3d-canvas");
    this.sceneSelect = this.container.querySelector(".c3d-scene-select");
    this.autoRotateBtn = this.container.querySelector(".c3d-btn-autorotate");
    this.closeBtn = this.container.querySelector(".c3d-btn-close");
    this.infoTitle = this.container.querySelector(".c3d-info-title");
    this.infoEquation = this.container.querySelector(".c3d-info-equation");
    this.infoDetails = this.container.querySelector(".c3d-info-details");
  }

  initThree() {
    const width = this.canvas.clientWidth || 800;
    const height = this.canvas.clientHeight || 550;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x061118);
    this.scene.fog = new THREE.FogExp2(0x061118, 0.018);

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
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
    const ambient = new THREE.AmbientLight(0xdcf0ee, 1.2);
    this.scene.add(ambient);

    const dirLight1 = new THREE.DirectionalLight(0xfff3d6, 2.4);
    dirLight1.position.set(20, 35, 25);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.8);
    dirLight2.position.set(-20, -10, -20);
    this.scene.add(dirLight2);

    // Layer Groups
    Object.values(this.layerGroups).forEach(group => this.scene.add(group));
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 80;
    this.controls.target.set(0, 0, 0);
  }

  setupEventListeners() {
    // Scene Selector
    this.sceneSelect.addEventListener("change", (e) => {
      this.loadScene(e.target.value);
    });

    // Auto-Rotate Button
    this.autoRotateBtn.addEventListener("click", () => {
      this.controls.autoRotate = !this.controls.autoRotate;
      this.autoRotateBtn.classList.toggle("is-active", this.controls.autoRotate);
    });

    // Close Button
    this.closeBtn.addEventListener("click", () => {
      this.container.classList.remove("is-visible");
    });

    // Layer Toggles
    const checkboxes = this.container.querySelectorAll(".c3d-toggle-label input");
    checkboxes.forEach(cb => {
      cb.addEventListener("change", (e) => {
        const layer = e.target.dataset.layer;
        this.layers[layer] = e.target.checked;
        if (this.layerGroups[layer]) {
          this.layerGroups[layer].visible = e.target.checked;
        }
      });
    });

    // Camera Presets
    const camBtns = this.container.querySelectorAll(".c3d-cam-btn");
    camBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const preset = btn.dataset.cam;
        this.setCameraPreset(preset);
      });
    });

    // Resize Observer
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);
  }

  onResize() {
    if (!this.renderer || !this.camera) return;
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(rect.width, 100);
    const height = Math.max(rect.height, 100);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  setCameraPreset(preset) {
    const duration = 0.6;
    let targetPos = new THREE.Vector3(18, 14, 22);
    let targetLook = new THREE.Vector3(0, 0, 0);

    if (preset === "xy") {
      // Top view Looking down Z
      targetPos.set(0, 32, 0.001);
    } else if (preset === "xz") {
      // Front view looking at XZ (Y is depth)
      targetPos.set(0, 0.001, 32);
    } else if (preset === "yz") {
      // Side view looking at YZ (X is depth)
      targetPos.set(32, 0.001, 0);
    } else if (preset === "iso" || preset === "reset") {
      targetPos.set(18, 14, 22);
    }

    if (window.gsap) {
      gsap.to(this.camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: duration,
        ease: "power2.out",
        onUpdate: () => this.controls.update()
      });
      gsap.to(this.controls.target, {
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
    // X Axis: Red/Cyan
    const xAxis = this.createArrow(new THREE.Vector3(-size, 0, 0), new THREE.Vector3(1, 0, 0), size * 2, 0xf87171, "+X");
    // Y Axis: Green (Vertical)
    const yAxis = this.createArrow(new THREE.Vector3(0, -size * 0.6, 0), new THREE.Vector3(0, 1, 0), size * 1.6, 0x4ade80, "+Y");
    // Z Axis: Blue (Depth)
    const zAxis = this.createArrow(new THREE.Vector3(0, 0, -size), new THREE.Vector3(0, 0, 1), size * 2, 0x38bdf8, "+Z");

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
    const arrow = new THREE.ArrowHelper(normalizedDir, origin, length, colorHex, 0.8, 0.4);
    group.add(arrow);

    if (label) {
      const tipPos = origin.clone().add(normalizedDir.clone().multiplyScalar(length + 0.6));
      const sprite = this.createTextSprite(label, { color: colorHex, fontSize: 32, bold: true });
      sprite.position.copy(tipPos);
      sprite.scale.set(1.5, 0.75, 1);
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

    // Orient cylinder along vector
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

    // Core Sphere
    const geo = new THREE.SphereGeometry(0.35, 24, 24);
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.6,
      roughness: 0.1
    });
    const sphere = new THREE.Mesh(geo, mat);
    group.add(sphere);

    // Outer Halo
    const haloGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    group.add(halo);

    // Label Sprite
    if (labelText) {
      const sprite = this.createTextSprite(labelText, {
        color: colorHex,
        bgColor: "rgba(8, 27, 36, 0.88)",
        borderColor: colorHex,
        fontSize: 28,
        bold: true
      });
      sprite.position.set(0, 0.9, 0);
      sprite.scale.set(3.2, 1.1, 1);
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

      // Line to Y=0 plane
      const pGround = new THREE.Vector3(pos.x, 0, pos.z);
      const geomY = new THREE.BufferGeometry().setFromPoints([pos, pGround]);
      const lineY = new THREE.Line(geomY, dropMat);
      lineY.computeLineDistances();
      this.layerGroups.points.add(lineY);

      // Footprint marker on ground
      const ringGeo = new THREE.RingGeometry(0.15, 0.3, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.copy(pGround);
      this.layerGroups.points.add(ring);
    }

    return group;
  }

  createPlaneMesh(normalVec, pointOnPlane, sizeX = 16, sizeZ = 16, colorHex = 0x0284c7, opacity = 0.42) {
    const group = new THREE.Group();
    const geom = new THREE.PlaneGeometry(sizeX, sizeZ, 10, 10);
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      transparent: true,
      opacity: opacity,
      side: THREE.DoubleSide,
      roughness: 0.15,
      metalness: 0.2,
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
    const edgeMat = new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: 0.85, linewidth: 2 });
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

    const fontSize = opts.fontSize || 32;
    const color = typeof opts.color === "number" ? `#${opts.color.toString(16).padStart(6, "0")}` : (opts.color || "#ffffff");
    const bgColor = opts.bgColor || "rgba(8, 27, 36, 0.85)";
    const borderColor = typeof opts.borderColor === "number" ? `#${opts.borderColor.toString(16).padStart(6, "0")}` : (opts.borderColor || color);

    // Background rounded box
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 4;
    
    // Draw rounded rect
    const r = 16;
    ctx.beginPath();
    ctx.moveTo(r, 6);
    ctx.arcTo(512 - 6, 6, 512 - 6, 160 - 6, r);
    ctx.arcTo(512 - 6, 160 - 6, 6, 160 - 6, r);
    ctx.arcTo(6, 160 - 6, 6, 6, r);
    ctx.arcTo(6, 6, 512 - 6, 6, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Text
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
    this.sceneSelect.value = sceneKey;
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

  // 1. Intersección r ∩ π
  buildSceneInterseccion() {
    this.infoTitle.textContent = "01 · Intersección Recta-Plano en R³";
    this.infoEquation.innerHTML = "Plano π: <code>2x − y + z − 6 = 0</code> &nbsp;|&nbsp; Recta r: <code>(-1+3λ, 2+λ, -2λ)</code>";
    this.infoDetails.innerHTML = "• Parámetro exacto: <strong>λ = 10/3</strong><br>• Punto de Intersección: <strong style='color:#4ade80'>I(9, 16/3, -20/3) ≈ (9, 5.33, -6.67)</strong><br>• Verificación: <code>2(9) − 16/3 − 20/3 − 6 = 0 ✓</code>";

    // In engineering math 3D: X=Forward, Y=Right, Z=Up. In Three.js: X=Right, Y=Up, Z=Forward.
    // We map: X_math -> X, Z_math -> Y_three, Y_math -> Z_three.
    const toThree = (x, y, z) => new THREE.Vector3(x, z, y);

    // Plane 2x - y + z - 6 = 0 -> Normal n=(2, -1, 1), Point P_plane=(3, 0, 0)
    const normalMath = new THREE.Vector3(2, -1, 1);
    const nThree = toThree(normalMath.x, normalMath.y, normalMath.z);
    const pCenterThree = toThree(3, 2, 2);

    const planeObj = this.createPlaneMesh(nThree, pCenterThree, 26, 26, 0x0284c7, 0.4);
    this.layerGroups.plane.add(planeObj);

    // Normal Vector n=(2, -1, 1) starting from plane center
    const nArrow = this.createArrow(pCenterThree, nThree, 4, 0x38bdf8, "n = (2, -1, 1)");
    this.layerGroups.normal.add(nArrow);

    // Line r: P0(-1, 2, 0) + lambda*(3, 1, -2)
    // From lambda = -1 to lambda = 5
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
  }

  // 2. Ángulo Recta-Plano
  buildSceneAngulo() {
    this.infoTitle.textContent = "02 · Geometría del Ángulo Recta-Plano";
    this.infoEquation.innerHTML = "Vector Director: <code>d = (1, 2, 2)</code> &nbsp;|&nbsp; Normal: <code>n = (1, -2, 2)</code>";
    this.infoDetails.innerHTML = "• Ángulo con la Normal: <strong style='color:#38bdf8'>β ≈ 83,62°</strong> (<code>cos β = 1/9</code>)<br>• Ángulo con el Plano: <strong style='color:#4ade80'>α ≈ 6,38° = 6° 22' 46''</strong> (<code>sin α = 1/9</code>)<br>• Relación de complementariedad: <code>α + β = 90°</code>";

    const toThree = (x, y, z) => new THREE.Vector3(x, z, y);

    // Plane through origin with normal n=(1, -2, 2)
    const nMath = new THREE.Vector3(1, -2, 2);
    const nThree = toThree(nMath.x, nMath.y, nMath.z);
    const planeObj = this.createPlaneMesh(nThree, new THREE.Vector3(0, 0, 0), 20, 20, 0x0284c7, 0.35);
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
    const betaSprite = this.createTextSprite("β ≈ 83,62° (Normal)", { color: 0x38bdf8, fontSize: 24 });
    betaSprite.position.set(1.5, 3.2, 0.5);
    betaSprite.scale.set(3, 1, 1);
    this.layerGroups.points.add(betaSprite);

    const alphaSprite = this.createTextSprite("α ≈ 6,38° (Plano)", { color: 0x4ade80, fontSize: 24 });
    alphaSprite.position.set(2.8, 1.5, 2.5);
    alphaSprite.scale.set(3, 1, 1);
    this.layerGroups.points.add(alphaSprite);
  }

  // 3.a Parámetro m (Paralelo)
  buildSceneParametroParalelo() {
    this.infoTitle.textContent = "03.a · Recta Paralela al Plano (d ⟂ n)";
    this.infoEquation.innerHTML = "Plano π: <code>3x + y − 2z = 0</code> &nbsp;|&nbsp; Vector: <code>d = (m, 6, 4)</code>";
    this.infoDetails.innerHTML = "• Condición r ∥ π: <strong>d ⟂ n ⟺ d · n = 0</strong><br>• Producto escalar: <code>3m + 6(1) + 4(-2) = 3m − 2 = 0</code><br>• Solución única: <strong style='color:#4ade80'>m = 2/3  →  d = (2/3, 6, 4)</strong>";

    const toThree = (x, y, z) => new THREE.Vector3(x, z, y);

    // Normal n = (3, 1, -2)
    const nMath = new THREE.Vector3(3, 1, -2);
    const nThree = toThree(nMath.x, nMath.y, nMath.z);

    const planeObj = this.createPlaneMesh(nThree, new THREE.Vector3(0, 0, 0), 22, 22, 0x059669, 0.35);
    this.layerGroups.plane.add(planeObj);

    const nArrow = this.createArrow(new THREE.Vector3(0, 0, 0), nThree, 6, 0x38bdf8, "n = (3, 1, -2)");
    this.layerGroups.normal.add(nArrow);

    // Vector d = (2/3, 6, 4) contained in plane (parallel)
    const dMath = new THREE.Vector3(2/3, 6, 4);
    const dThree = toThree(dMath.x, dMath.y, dMath.z);
    const dArrow = this.createArrow(new THREE.Vector3(0, 0, 0), dThree, 7, 0x4ade80, "d = (2/3, 6, 4) [r ∥ π]");
    this.layerGroups.line.add(dArrow);
  }

  // 3.b Parámetro m (Incompatible)
  buildSceneParametroIncompatible() {
    this.infoTitle.textContent = "03.b · Recta Perpendicular al Plano (Incompatible)";
    this.infoEquation.innerHTML = "Condición r ⟂ π: <code>d = k · n</code>  (Colinealidad vectorial)";
    this.infoDetails.innerHTML = "• Razones escalares: <code>m/3 = 6/1 = 4/(-2) = k</code><br>• Contradicción: <strong style='color:#f87171'>6 ≠ -2</strong> (Inconsistencia)<br>• Dictamen: <strong>∄ m ∈ ℝ  tal que  r ⟂ π  (S = ∅)</strong>";

    const toThree = (x, y, z) => new THREE.Vector3(x, z, y);

    const nMath = new THREE.Vector3(3, 1, -2);
    const nThree = toThree(nMath.x, nMath.y, nMath.z);

    const nArrow = this.createArrow(new THREE.Vector3(0, 0, 0), nThree, 6, 0x38bdf8, "n = (3, 1, -2)");
    this.layerGroups.normal.add(nArrow);

    // Target Collinear direction (dashed)
    const targetArrow = this.createArrow(new THREE.Vector3(0, 0, 0), nThree, 10, 0x1e3a5f, "Dirección n");
    this.layerGroups.line.add(targetArrow);

    // Candidate vector d=(2, 6, 4) with divergent Y/Z ratios
    const dMath = new THREE.Vector3(2, 6, 4);
    const dThree = toThree(dMath.x, dMath.y, dMath.z);
    const dArrow = this.createArrow(new THREE.Vector3(0, 0, 0), dThree, 7, 0xf87171, "d = (m, 6, 4) [6 ≠ -2]");
    this.layerGroups.line.add(dArrow);
  }

  // 4. Tres Planos Proyectantes
  buildSceneProyectantes() {
    this.infoTitle.textContent = "04 · Tres Planos Proyectantes en R³";
    this.infoEquation.innerHTML = "πxy: <code>3x+4y-2=0</code> &nbsp;|&nbsp; πxz: <code>x-4z+18=0</code> &nbsp;|&nbsp; πyz: <code>y+3z-14=0</code>";
    this.infoDetails.innerHTML = "• Intersección Triple: <strong style='color:#f0b36c'>πxy ∩ πxz ∩ πyz = { r }</strong><br>• Recta continua: <code>(x-2)/4 = (y+1)/-3 = (z-5)/1</code><br>• Punto de paso común: <strong style='color:#4ade80'>P(2, -1, 5) ∈ r</strong>";

    const toThree = (x, y, z) => new THREE.Vector3(x, z, y);

    // 1. Plane pi_xy (parallel to Z) -> Normal (3, 4, 0)
    const nXY = toThree(3, 4, 0);
    const pPassXY = toThree(2, -1, 5);
    const planeXY = this.createPlaneMesh(nXY, pPassXY, 18, 18, 0x0284c7, 0.3);
    this.layerGroups.plane.add(planeXY);

    // 2. Plane pi_xz (parallel to Y) -> Normal (1, 0, -4)
    const nXZ = toThree(1, 0, -4);
    const planeXZ = this.createPlaneMesh(nXZ, pPassXY, 18, 18, 0xd97706, 0.3);
    this.layerGroups.plane.add(planeXZ);

    // 3. Plane pi_yz (parallel to X) -> Normal (0, 1, 3)
    const nYZ = toThree(0, 1, 3);
    const planeYZ = this.createPlaneMesh(nYZ, pPassXY, 18, 18, 0x059669, 0.3);
    this.layerGroups.plane.add(planeYZ);

    // The common line r: P(2, -1, 5) + lambda*(4, -3, 1)
    const pStart = toThree(2 + 4 * (-2), -1 - 3 * (-2), 5 + 1 * (-2));
    const pEnd = toThree(2 + 4 * 2, -1 - 3 * 2, 5 + 1 * 2);
    const lineMesh = this.createLineCylinder(pStart, pEnd, 0xffffff, 0.14);
    this.layerGroups.line.add(lineMesh);

    // Point P(2, -1, 5)
    const pBeacon = this.createPointBeacon(pPassXY, 0xf0b36c, "P(2, -1, 5) ∈ r", true);
    this.layerGroups.points.add(pBeacon);
  }

  // 5. Auditoría Técnica (Error del TP)
  buildSceneAuditoria() {
    this.infoTitle.textContent = "05 · Auditoría Cartesiana: Patrón vs. Error del Grupo";
    this.infoEquation.innerHTML = "Plano π: <code>2x − y + z − 6 = 0</code> &nbsp;|&nbsp; Recta r: <code>(-1+3λ, 2+λ, -2λ)</code>";
    this.infoDetails.innerHTML = "• Punto Patrón (λ=10/3): <strong style='color:#4ade80'>I(9, 16/3, -20/3) ∈ π  (Residuo = 0 ✓)</strong><br>• Error del TP (λ=5): <strong style='color:#f87171'>P(14, 7, -10) ∉ π  (Residuo = 5 ≠ 0 ✗)</strong><br>• Distancia ortogonal al plano: <strong>d(P, π) = 5/√6 ≈ 2,04</strong>";

    const toThree = (x, y, z) => new THREE.Vector3(x, z, y);

    const normalMath = new THREE.Vector3(2, -1, 1);
    const nThree = toThree(normalMath.x, normalMath.y, normalMath.z);
    const pCenter = toThree(10, 5, -8);

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
    distSprite.scale.set(2.4, 0.8, 1);
    this.layerGroups.points.add(distSprite);
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

