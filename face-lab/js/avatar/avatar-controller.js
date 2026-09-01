import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { motionTokens } from "../../motion-tokens.js";

const expressionPresets = {
  neutral: { browInnerUp: 0.02, browOuterUp_L: 0.01, browOuterUp_R: 0.01, mouthSmile_L: 0.01, mouthSmile_R: 0.01 },
  curious: { browInnerUp: 0.1, browOuterUp_L: 0.04, browOuterUp_R: 0.04, eyeWide_L: 0.02, eyeWide_R: 0.02, mouthSmile_L: 0.02, mouthSmile_R: 0.02 },
  analytical: { browDown_L: 0.05, browDown_R: 0.05, eyeSquint_L: 0.018, eyeSquint_R: 0.018, mouthPress_L: 0.018, mouthPress_R: 0.018 },
  warm: { browOuterUp_L: 0.04, browOuterUp_R: 0.04, mouthSmile_L: 0.075, mouthSmile_R: 0.075, cheekSquint_L: 0.03, cheekSquint_R: 0.03 },
  alert: { browInnerUp: 0.07, eyeWide_L: 0.025, eyeWide_R: 0.025 }
};

const expressionNames = [...new Set(Object.values(expressionPresets).flatMap(preset => Object.keys(preset)))];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export class AvatarController {
  constructor(options) {
    this.canvas = options.canvas;
    this.scene = options.scene;
    this.camera = options.camera;
    this.renderer = options.renderer;
    this.onStatus = options.onStatus || (() => {});
    this.onMood = options.onMood || (() => {});

    this.activeModel = null;
    this.mouthDrivers = [];
    this.blinkDrivers = [];
    this.faceTargets = {};

    this.activeExpression = "neutral";
    this.lookAtPresentation = false;
    this.speaking = false;
    this.voiceEnergy = 0;

    this.openingSmileStartedAt = 0;
    this.finalSmileStartedAt = 0;

    this.faceBehavior = {
      blink: { nextAt: 2.8 + Math.random() * 2.2, startedAt: 0, duration: motionTokens.blink.duration, double: false },
      glance: { active: false, until: 0, nextAt: 3.8 + Math.random() * 3.2 },
      smile: { until: 0, nextAt: 5.5 + Math.random() * 5.5 },
      mouth: { nextAt: 0, jaw: 0, funnel: 0, pucker: 0, close: 0, timeline: [] },
      head: { nextTargetAt: 0, targetYaw: motionTokens.attention.audienceYaw, targetPitch: 0.008, targetRoll: -0.008, targetBob: 0 }
    };
  }

  async load() {
    try {
      const manager = new THREE.LoadingManager();
      manager.onProgress = (_url, loaded, total) => {
        this.onStatus(`Modelo 3D: cargando ${Math.round((loaded / total) * 100)}% · Voz: lista`);
      };

      const gltfLoader = new GLTFLoader(manager);
      gltfLoader.setMeshoptDecoder(MeshoptDecoder);

      const draco = new DRACOLoader().setDecoderPath("./node_modules/three/examples/jsm/libs/draco/");
      gltfLoader.setDRACOLoader(draco);

      const ktx2 = new KTX2Loader().setTranscoderPath("./node_modules/three/examples/jsm/libs/basis/").detectSupport(this.renderer);
      gltfLoader.setKTX2Loader(ktx2);

      const gltf = await gltfLoader.loadAsync("./models/facecap.glb");
      this.activeModel = gltf.scene;
      this.fitModel(this.activeModel);

      this.activeModel.traverse(node => {
        if (!node.isMesh) return;
        node.castShadow = false;
        node.receiveShadow = false;
        if (node.material) {
          const materials = Array.isArray(node.material) ? node.material : [node.material];
          materials.forEach(material => {
            if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
              material.envMapIntensity = 0.72;
            }
          });
        }
      });

      this.scene.add(this.activeModel);
      const drivers = this.findDrivers(this.activeModel);
      this.mouthDrivers = drivers.mouths;
      this.blinkDrivers = drivers.blinks;
      this.faceTargets = drivers.targets;

      Object.values(this.faceTargets).forEach(target => {
        target.mesh.morphTargetInfluences[target.index] = 0;
      });

      this.onStatus(`Modelo 3D: listo · ${Object.keys(this.faceTargets).length} expresiones · Voz: lista`);
      return true;
    } catch (error) {
      console.error("Error cargando modelo 3D:", error);
      this.onStatus("Modelo 3D: fallback · Voz: lista");
      return false;
    }
  }

  fitModel(root) {
    const bounds = new THREE.Box3().setFromObject(root);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    root.position.sub(center);
    root.scale.setScalar(3.8 / Math.max(size.y, 0.001));
    root.position.x = 2.05;
    root.position.y = 0.02;
    root.position.z = -0.62;
    root.rotation.y = motionTokens.attention.audienceYaw;
    root.rotation.x = 0.008;
    root.rotation.z = -0.008;
  }

  findDrivers(root) {
    const mouths = [];
    const blinks = [];
    const targets = {};
    root.traverse(node => {
      if (!node.isMesh || !node.morphTargetDictionary || !node.morphTargetInfluences) return;
      Object.entries(node.morphTargetDictionary).forEach(([name, index]) => {
        targets[name] = { mesh: node, index };
        if (/jaw.?open|mouth.?open|viseme|phoneme|open.?mouth|surprised/i.test(name)) {
          mouths.push({ mesh: node, index, name });
        }
        if (/blink|eye.?close|eyes.?closed/i.test(name)) {
          blinks.push({ mesh: node, index, name });
        }
      });
    });
    return { mouths, blinks, targets };
  }

  driveTarget(name, amount, smoothing = 0.2) {
    const target = this.faceTargets[name];
    if (!target) return;
    const current = target.mesh.morphTargetInfluences[target.index] || 0;
    target.mesh.morphTargetInfluences[target.index] = THREE.MathUtils.lerp(
      current,
      THREE.MathUtils.clamp(amount, 0, 1),
      smoothing
    );
  }

  setBlink(amount) {
    this.blinkDrivers.forEach(driver => {
      driver.mesh.morphTargetInfluences[driver.index] = amount;
    });
  }

  setHeadAttentionTarget(now, lookingAtPresentation) {
    const baseYaw = lookingAtPresentation ? motionTokens.attention.visualYaw : motionTokens.attention.audienceYaw;
    const requestedYaw = baseYaw + randomBetween(-motionTokens.procedural.headJitterYaw, motionTokens.procedural.headJitterYaw);
    this.faceBehavior.head.targetYaw = Math.min(-motionTokens.attention.minimumAwayYaw, requestedYaw);
    this.faceBehavior.head.targetPitch = (lookingAtPresentation ? -0.014 : 0.008) + randomBetween(-0.018, 0.018);
    this.faceBehavior.head.targetRoll = (lookingAtPresentation ? -0.018 : -0.008) + randomBetween(-0.014, 0.014);
    this.faceBehavior.head.targetBob = randomBetween(-0.009, 0.009);
    this.faceBehavior.head.nextTargetAt = now + randomBetween(motionTokens.procedural.headTargetMin, motionTokens.procedural.headTargetMax);
  }

  triggerOpeningSmile() {
    this.openingSmileStartedAt = performance.now() / 1000;
    this.onMood("Carismático", "Sonrisa descarada");
  }

  triggerFinalSmile() {
    this.finalSmileStartedAt = performance.now() / 1000;
    this.faceBehavior.smile.until = 0;
    this.onMood("Cierre", "Sonrisa maníaca exagerada");
  }

  update(delta, elapsed, reducedMotion, cue, speechProgress) {
    if (!this.activeModel) return;
    const now = performance.now() / 1000;

    if (reducedMotion) {
      this.activeModel.rotation.y = motionTokens.attention.audienceYaw;
      this.activeModel.rotation.x = 0.008;
      this.activeModel.rotation.z = -0.008;
      return;
    }

    // Behavior updates
    if (!this.faceBehavior.glance.active && now > this.faceBehavior.glance.nextAt) {
      this.faceBehavior.glance.active = true;
      this.faceBehavior.glance.until = now + randomBetween(1.7, 3.4);
      this.lookAtPresentation = true;
      this.setHeadAttentionTarget(now, true);
    }
    if (this.faceBehavior.glance.active && now > this.faceBehavior.glance.until) {
      this.faceBehavior.glance.active = false;
      this.lookAtPresentation = false;
      this.faceBehavior.glance.nextAt = now + randomBetween(6.5, 12.5);
      this.setHeadAttentionTarget(now, false);
    }
    if (now > this.faceBehavior.smile.nextAt) {
      this.faceBehavior.smile.until = now + randomBetween(0.95, 1.8);
      this.faceBehavior.smile.nextAt = now + randomBetween(8.5, 18);
    }
    if (now > this.faceBehavior.head.nextTargetAt) {
      this.setHeadAttentionTarget(now, this.lookAtPresentation);
    }

    // Head attention rotation
    const head = this.faceBehavior.head;
    const targetYaw = Math.min(-motionTokens.attention.minimumAwayYaw, head.targetYaw);
    this.activeModel.rotation.y = THREE.MathUtils.damp(this.activeModel.rotation.y, targetYaw, 4.2, delta);
    this.activeModel.rotation.x = THREE.MathUtils.damp(this.activeModel.rotation.x, head.targetPitch, 3.8, delta);
    this.activeModel.rotation.z = THREE.MathUtils.damp(this.activeModel.rotation.z, head.targetRoll, 3.8, delta);
    this.activeModel.position.y = THREE.MathUtils.damp(this.activeModel.position.y, 0.02 + head.targetBob, 2.8, delta);

    // Blinking
    this.updateBlink(now);

    // Face morphs
    this.updateFace(elapsed);
    this.updateMouth(cue);
  }

  updateBlink(now) {
    if (!this.blinkDrivers.length) return;
    const blink = this.faceBehavior.blink;
    if (!blink.startedAt && now >= blink.nextAt) {
      blink.startedAt = now;
      blink.duration = randomBetween(0.12, 0.18);
      blink.double = Math.random() < 0.17;
    }
    if (!blink.startedAt) return;
    const age = now - blink.startedAt;
    const gap = 0.11;
    const secondStart = blink.duration + gap;
    const total = blink.double ? secondStart + blink.duration : blink.duration;
    let amount = 0;
    if (age < blink.duration) amount = Math.sin(Math.PI * (age / blink.duration));
    else if (blink.double && age >= secondStart && age < total) amount = Math.sin(Math.PI * ((age - secondStart) / blink.duration));
    this.setBlink(amount);
    if (age >= total) {
      blink.startedAt = 0;
      blink.nextAt = now + randomBetween(motionTokens.blink.minInterval, motionTokens.blink.maxInterval);
      blink.double = false;
    }
  }

  updateFace(elapsed) {
    const preset = expressionPresets[this.activeExpression] || expressionPresets.neutral;
    expressionNames.forEach(name => this.driveTarget(name, preset[name] || 0, 0.09));

    const now = performance.now() / 1000;
    const timedSmile = this.faceBehavior.smile.until > now ? 1 : 0;
    const openingAge = this.openingSmileStartedAt ? now - this.openingSmileStartedAt : -1;
    const openingSmile = openingAge >= 0 && openingAge < 2.7 ? (openingAge < 0.28 ? openingAge / 0.28 : openingAge < 1.25 ? 1 : Math.max(0, 1 - (openingAge - 1.25) / 1.45)) : 0;
    const finalAge = this.finalSmileStartedAt ? now - this.finalSmileStartedAt : -1;
    const finalSmile = finalAge >= 0 && finalAge < 4.6 ? (finalAge < 0.38 ? finalAge / 0.38 : finalAge < 3.25 ? 1 : Math.max(0, 1 - (finalAge - 3.25) / 1.35)) : 0;

    const gazeX = this.lookAtPresentation ? -0.3 : 0.012;
    const gazeY = this.lookAtPresentation ? -0.018 : 0.006;
    this.driveTarget("eyeLookOut_L", Math.max(gazeX, 0) * 0.22);
    this.driveTarget("eyeLookIn_L", Math.max(-gazeX, 0) * 0.22);
    this.driveTarget("eyeLookIn_R", Math.max(gazeX, 0) * 0.22);
    this.driveTarget("eyeLookOut_R", Math.max(-gazeX, 0) * 0.22);
    this.driveTarget("eyeLookUp_L", Math.max(gazeY, 0) * 0.2);
    this.driveTarget("eyeLookUp_R", Math.max(gazeY, 0) * 0.2);
    this.driveTarget("eyeLookDown_L", Math.max(-gazeY, 0) * 0.16);
    this.driveTarget("eyeLookDown_R", Math.max(-gazeY, 0) * 0.16);

    const smile = (this.activeExpression === "warm" ? 0.1 : this.activeExpression === "curious" ? 0.03 : 0) + (timedSmile ? 0.16 : 0) + (openingSmile * 0.4) + (finalSmile * 0.8);
    this.driveTarget("browInnerUp", (preset.browInnerUp || 0) + openingSmile * 0.04 + finalSmile * 0.16, 0.12);
    this.driveTarget("browDown_L", (preset.browDown_L || 0) + finalSmile * 0.045, 0.1);
    this.driveTarget("browDown_R", (preset.browDown_R || 0) + finalSmile * 0.045, 0.1);
    this.driveTarget("eyeWide_L", (preset.eyeWide_L || 0) + finalSmile * 0.18, 0.11);
    this.driveTarget("eyeWide_R", (preset.eyeWide_R || 0) + finalSmile * 0.18, 0.11);
    this.driveTarget("mouthPress_L", (preset.mouthPress_L || 0) + finalSmile * 0.03, 0.1);
    this.driveTarget("mouthPress_R", (preset.mouthPress_R || 0) + finalSmile * 0.03, 0.1);
    this.driveTarget("mouthSmile_L", smile + (this.speaking ? 0.025 : 0), 0.12);
    this.driveTarget("mouthSmile_R", smile + (this.speaking ? 0.025 : 0), 0.12);
    this.driveTarget("cheekSquint_L", (this.activeExpression === "warm" ? 0.04 : 0) + (this.speaking ? 0.025 : 0) + (timedSmile ? 0.07 : 0) + (openingSmile * 0.12) + (finalSmile * 0.45), 0.12);
    this.driveTarget("cheekSquint_R", (this.activeExpression === "warm" ? 0.04 : 0) + (this.speaking ? 0.025 : 0) + (timedSmile ? 0.07 : 0) + (openingSmile * 0.12) + (finalSmile * 0.45), 0.12);

    if (openingAge >= 2.7) this.openingSmileStartedAt = 0;
    if (finalAge >= 4.6) this.finalSmileStartedAt = 0;
  }

  updateMouth(cue) {
    if (!Object.keys(this.faceTargets).length) return;
    if (!this.speaking) {
      this.driveTarget("jawOpen", 0, 0.2);
      this.driveTarget("mouthClose", 0.025, 0.2);
      this.driveTarget("mouthFunnel", 0, 0.2);
      this.driveTarget("mouthPucker", 0, 0.2);
      return;
    }

    let shape = { jaw: 0.05, funnel: 0, pucker: 0, close: 0, press: 0 };
    if (cue) {
      switch (cue.value) {
        case "A": shape = { jaw: 0, funnel: 0, pucker: 0, close: 0.26, press: 0.24 }; break;
        case "B": shape = { jaw: 0.028, funnel: 0, pucker: 0, close: 0.08, press: 0.08 }; break;
        case "C": shape = { jaw: 0.07, funnel: 0, pucker: 0, close: 0, press: 0 }; break;
        case "D": shape = { jaw: 0.13, funnel: 0, pucker: 0, close: 0, press: 0 }; break;
        case "E": shape = { jaw: 0.075, funnel: 0.05, pucker: 0.01, close: 0, press: 0 }; break;
        case "F": shape = { jaw: 0.065, funnel: 0.015, pucker: 0.1, close: 0, press: 0 }; break;
        case "G": shape = { jaw: 0.035, funnel: 0.05, pucker: 0, close: 0.04, press: 0.04 }; break;
        case "H": shape = { jaw: 0.045, funnel: 0.02, pucker: 0, close: 0.02, press: 0.02 }; break;
        default: shape = { jaw: 0, funnel: 0, pucker: 0, close: 0.03, press: 0.02 };
      }
    }

    const bilabial = cue?.value === "A";
    this.driveTarget("jawOpen", Math.min(0.24, shape.jaw + (bilabial ? 0 : this.voiceEnergy * 0.1)), bilabial ? 0.75 : 0.22);
    this.driveTarget("mouthClose", shape.close, bilabial ? 0.72 : 0.18);
    this.driveTarget("mouthPress_L", shape.press, bilabial ? 0.72 : 0.16);
    this.driveTarget("mouthPress_R", shape.press, bilabial ? 0.72 : 0.16);
    this.driveTarget("mouthFunnel", shape.funnel, bilabial ? 0.5 : 0.2);
    this.driveTarget("mouthPucker", shape.pucker, bilabial ? 0.5 : 0.2);
  }
}
