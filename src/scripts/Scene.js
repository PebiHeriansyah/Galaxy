import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

export default class Scene extends THREE.Scene {
	constructor() {
		super();

		this.canvas = document.querySelector('canvas.webgl');

		this.setScene();
	}

	setScene() {
		this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
		this.camera.position.set(8, 4, 8); // Wide astronomy view

		this.setLights();
		this.setRenderer();
		this.setControls();
	}

	setLights() {
		// Very subtle ambient light - space is dark
		this.ambientLight = new THREE.AmbientLight(0x0a0a0f, 0.1);
		this.add(this.ambientLight);
	}

	setRenderer() {
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			canvas: this.canvas,
			alpha: true
		});
		this.renderer.setClearColor(0x000000, 0);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	}

	setControls() {
		this.controls = new OrbitControls(this.camera, this.canvas);
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.03; // Smoother
		this.controls.minDistance = 2;
		this.controls.maxDistance = 40; // Can zoom out far
		this.controls.maxPolarAngle = Math.PI * 0.8;
		this.controls.autoRotate = false;
		this.controls.autoRotateSpeed = 0.2;
		this.controls.update();
	}
}
