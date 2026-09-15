/**
 * pet3d.js
 * BSC Skill Warehouse (majidmanzarpour__threejs-game-skills 연계)
 * Three.js 기반 경량 인터랙티브 3D 펫 & 사이버틱 오라 비주얼라이저
 */

(function() {
  class Pet3DVisualizer {
    constructor() {
      this.initialized = false;
      this.canvas = null;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.petMesh = null;
      this.ringMesh = null;
      this.particles = null;
      this.animId = null;
      this.isJumping = false;
      this.jumpOffset = 0;
    }

    init(containerId) {
      if (this.initialized) return;
      const container = document.getElementById(containerId);
      if (!container) return;

      // Three.js CDN 동적 로드 (이미 있으면 즉시 초기화)
      if (window.THREE) {
        this.setupScene(container);
      } else {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
        script.onload = () => this.setupScene(container);
        document.head.appendChild(script);
      }
    }

    setupScene(container) {
      const w = container.clientWidth || 300;
      const h = container.clientHeight || 260;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
      this.camera.position.set(0, 1.2, 3.8);

      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.innerHTML = "";
      container.appendChild(this.renderer.domElement);
      this.canvas = this.renderer.domElement;

      // 1. 조명 (사이버틱 네온 볼트 앰비언트)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      this.scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0x00c73c, 1.5);
      dirLight.position.set(5, 10, 7);
      this.scene.add(dirLight);

      const cyanLight = new THREE.PointLight(0x00f0ff, 2, 50);
      cyanLight.position.set(-5, 2, -2);
      this.scene.add(cyanLight);

      // 2. 3D 펫 메쉬 (귀여운 로우폴리 사이버 펫 코어)
      const petGroup = new THREE.Group();

      // 몸체 (스무스 캡슐/스피어)
      const bodyGeo = new THREE.SphereGeometry(0.7, 32, 32);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x1A202C,
        metalness: 0.3,
        roughness: 0.2,
        emissive: 0x00c73c,
        emissiveIntensity: 0.25
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.scale.set(1, 1.15, 1);
      petGroup.add(body);

      // 귀 (왼쪽, 오른쪽)
      const earGeo = new THREE.ConeGeometry(0.25, 0.5, 16);
      const earMat = new THREE.MeshStandardMaterial({ color: 0x00c73c, metalness: 0.5, roughness: 0.3 });
      
      const leftEar = new THREE.Mesh(earGeo, earMat);
      leftEar.position.set(-0.45, 0.8, 0);
      leftEar.rotation.z = 0.35;
      petGroup.add(leftEar);

      const rightEar = new THREE.Mesh(earGeo, earMat);
      rightEar.position.set(0.45, 0.8, 0);
      rightEar.rotation.z = -0.35;
      petGroup.add(rightEar);

      // 눈 (빛나는 네온 사이버 아이즈)
      const eyeGeo = new THREE.SphereGeometry(0.1, 16, 16);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.25, 0.2, 0.62);
      petGroup.add(leftEye);

      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.25, 0.2, 0.62);
      petGroup.add(rightEye);

      // 하단 에어로 다이내믹 링 (회전하는 볼트 파티클 링)
      const ringGeo = new THREE.TorusGeometry(1.05, 0.03, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00c73c, wireframe: true });
      this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
      this.ringMesh.rotation.x = Math.PI / 2;
      this.ringMesh.position.y = -0.7;
      petGroup.add(this.ringMesh);

      this.petMesh = petGroup;
      this.scene.add(this.petMesh);

      // 3. 상호작용 (클릭 시 점프)
      this.canvas.addEventListener("click", () => this.jump());

      // 4. 애니메이션 루프 시작
      this.initialized = true;
      this.animate();
    }

    jump() {
      if (this.isJumping) return;
      this.isJumping = true;
      let progress = 0;
      const jumpInterval = setInterval(() => {
        progress += 0.08;
        this.jumpOffset = Math.sin(progress * Math.PI) * 0.45;
        if (progress >= 1) {
          clearInterval(jumpInterval);
          this.jumpOffset = 0;
          this.isJumping = false;
        }
      }, 16);
    }

    animate() {
      this.animId = requestAnimationFrame(() => this.animate());

      if (this.petMesh) {
        // 호흡 유휴 모션 (Floating & Breathing)
        const time = Date.now() * 0.0025;
        this.petMesh.position.y = Math.sin(time) * 0.08 + this.jumpOffset;
        this.petMesh.rotation.y = Math.sin(time * 0.5) * 0.25;

        // 링 회전
        if (this.ringMesh) {
          this.ringMesh.rotation.z += 0.015;
        }
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    }
  }

  window.Pet3DVisualizer = new Pet3DVisualizer();
  window.Pet3D = window.Pet3DVisualizer;
})();
