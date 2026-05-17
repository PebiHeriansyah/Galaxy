import * as dat from 'dat.gui';

const gui = new dat.GUI({ width: 340 });
gui.close(); // Start closed for cleaner view

export default class Gui {
	constructor(galaxy) {
		this.galaxy = galaxy;

		this.addGUI();
	}

	addGUI() {
		// Main galaxy controls
		const mainFolder = gui.addFolder('Main Galaxy (200k stars)');
		mainFolder.add(this.galaxy.parameters, 'count').min(50000).max(300000).step(10000).name('Star Count').onFinishChange(() => this.galaxy.createMainGalaxy());
		mainFolder.add(this.galaxy.parameters, 'size').min(0.005).max(0.02).step(0.001).name('Star Size').onFinishChange(() => this.galaxy.createMainGalaxy());
		mainFolder.add(this.galaxy.parameters, 'radius').min(5).max(20).step(0.5).name('Galaxy Radius').onFinishChange(() => this.galaxy.createMainGalaxy());
		mainFolder.add(this.galaxy.parameters, 'branches').min(2).max(10).step(1).name('Spiral Arms').onFinishChange(() => this.galaxy.createMainGalaxy());
		mainFolder.add(this.galaxy.parameters, 'spin').min(0.5).max(3).step(0.1).name('Spiral Tightness').onFinishChange(() => this.galaxy.createMainGalaxy());
		
		// Distribution controls
		const distFolder = gui.addFolder('Distribution');
		distFolder.add(this.galaxy.parameters, 'randomness').min(0.1).max(1).step(0.05).name('Randomness').onFinishChange(() => this.galaxy.createMainGalaxy());
		distFolder.add(this.galaxy.parameters, 'randomnessPower').min(1).max(5).step(0.1).name('Density Power').onFinishChange(() => this.galaxy.createMainGalaxy());
		
		// Background layer
		const bgFolder = gui.addFolder('Background Stars (100k)');
		bgFolder.add(this.galaxy.parameters, 'backgroundCount').min(20000).max(200000).step(10000).name('Count').onFinishChange(() => this.galaxy.createBackgroundStars());
		bgFolder.add(this.galaxy.parameters, 'backgroundRadius').min(15).max(50).step(1).name('Radius').onFinishChange(() => this.galaxy.createBackgroundStars());
		
		// Foreground layer
		const fgFolder = gui.addFolder('Foreground Stars (5k)');
		fgFolder.add(this.galaxy.parameters, 'foregroundCount').min(1000).max(10000).step(500).name('Count').onFinishChange(() => this.galaxy.createForegroundStars());
		
		// Dust layer
		const dustFolder = gui.addFolder('Cosmic Dust (50k)');
		dustFolder.add(this.galaxy.parameters, 'dustCount').min(10000).max(100000).step(5000).name('Count').onFinishChange(() => this.galaxy.createCosmicDust());
		
		// Color controls
		const colorFolder = gui.addFolder('Astronomical Colors');
		colorFolder.addColor(this.galaxy.parameters, 'coreColor').name('Core (White)').onFinishChange(() => this.galaxy.createMainGalaxy());
		colorFolder.addColor(this.galaxy.parameters, 'innerColor').name('Inner (Blue-White)').onFinishChange(() => this.galaxy.createMainGalaxy());
		colorFolder.addColor(this.galaxy.parameters, 'middleColor').name('Middle (Yellow)').onFinishChange(() => this.galaxy.createMainGalaxy());
		colorFolder.addColor(this.galaxy.parameters, 'outerColor').name('Outer (Blue-Grey)').onFinishChange(() => this.galaxy.createMainGalaxy());
		colorFolder.addColor(this.galaxy.parameters, 'accentColor').name('Accent (Orange)').onFinishChange(() => this.galaxy.createMainGalaxy());
	}
}
