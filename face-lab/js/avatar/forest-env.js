import * as THREE from "three";

export class ForestEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.forestGroup = new THREE.Group();
    this.fireflyPoints = null;
    this.init();
  }

  init() {
    this.createForestBackdrop();
    this.createStarField();
  }

  createForestTree(x, height, z, opacity = 0.62) {
    const ground = -2.05;
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.13, height * 0.66, 6),
      new THREE.MeshBasicMaterial({ color: 0x101f1d, transparent: true, opacity: opacity * 0.94 })
    );
    trunk.position.set(x, ground + height * 0.33, z);
    tree.add(trunk);

    [[0.68, 0.2], [0.84, 0.28], [1, 0.35]].forEach(([level, width], index) => {
      const crown = new THREE.Mesh(
        new THREE.ConeGeometry(width, height * 0.38, 6),
        new THREE.MeshBasicMaterial({
          color: index === 2 ? 0x16413b : 0x12332f,
          transparent: true,
          opacity
        })
      );
      crown.position.set(x, ground + height * level * 0.74, z);
      tree.add(crown);
    });

    this.forestGroup.add(tree);
  }

  createForestBackdrop() {
    this.scene.fog = new THREE.FogExp2(0x061117, 0.035);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 9),
      new THREE.MeshBasicMaterial({ color: 0x061117, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -2.08, -4.5);
    this.forestGroup.add(ground);

    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.46, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0xd7e7d2, transparent: true, opacity: 0.22 })
    );
    moon.position.set(-0.15, 2.52, -8.5);
    this.forestGroup.add(moon);

    const trees = [
      [-3.8, 3.5, -4.2, 0.58],
      [-4.7, 4.7, -6.4, 0.76],
      [-5.9, 3.1, -3.1, 0.65],
      [-6.8, 5.1, -7.6, 0.78],
      [-3.1, 2.7, -2.4, 0.5],
      [3.2, 3.5, -4.1, 0.62],
      [4.2, 4.8, -6.6, 0.78],
      [5.3, 3.2, -3.2, 0.64],
      [6.6, 5.2, -7.8, 0.82],
      [2.7, 2.8, -2.5, 0.52]
    ];
    trees.forEach(([x, h, z, o]) => this.createForestTree(x, h, z, o));

    const positions = new Float32Array(28 * 3);
    for (let i = 0; i < 28; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = -1.25 + Math.random() * 3.15;
      positions[i * 3 + 2] = -2.2 - Math.random() * 5;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xd9bb73,
      size: 0.035,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.48
    });
    this.fireflyPoints = new THREE.Points(geometry, material);
    this.forestGroup.add(this.fireflyPoints);

    this.scene.add(this.forestGroup);
  }

  createStarField() {
    const positions = new Float32Array(360 * 3);
    for (let i = 0; i < 360; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 13;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 2] = -1.5 - Math.random() * 8;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x9cbebb,
      size: 0.018,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.42
    });
    this.scene.add(new THREE.Points(geometry, material));
  }

  update(elapsed, reducedMotion) {
    if (reducedMotion) return;
    if (this.fireflyPoints) {
      this.fireflyPoints.position.y = Math.sin(elapsed * 0.45) * 0.035;
      this.fireflyPoints.material.opacity = 0.35 + Math.sin(elapsed * 1.4) * 0.12;
    }
  }
}
