import * as THREE from 'three';
import galaxyVertexShader from '../shaders/vertex.glsl';
import galaxyFragmentShader from '../shaders/fragment.glsl';

export default class Galaxy {
    constructor(scene) {
        this.scene = scene;

        // Ultra realistic galaxy parameters
        this.parameters = {
            // Main galaxy
            count: 200000, // Massive star count
            size: 0.008,
            radius: 12,
            branches: 6, // Multiple spiral arms
            spin: 1.8,
            randomness: 0.4,
            randomnessPower: 2.5,
            
            // Background stars
            backgroundCount: 100000,
            backgroundRadius: 25,
            
            // Foreground stars
            foregroundCount: 5000,
            
            // Dust and nebula
            dustCount: 50000,
            
            // Realistic astronomical colors
            coreColor: '#ffffff',
            innerColor: '#e8f4ff', // Soft blue-white
            middleColor: '#ffd89b', // Warm yellow
            outerColor: '#4a5f7a', // Blue-grey
            accentColor: '#ff9a56'  // Orange accent
        }

        this.geometry = null;
        this.material = null;
        this.points = null;
        
        // Multiple layers for depth
        this.backgroundGeometry = null;
        this.backgroundMaterial = null;
        this.backgroundPoints = null;
        
        this.foregroundGeometry = null;
        this.foregroundMaterial = null;
        this.foregroundPoints = null;
        
        this.dustGeometry = null;
        this.dustMaterial = null;
        this.dustPoints = null;

        this.createGalaxy();
    }

    createGalaxy() {
        this.createMainGalaxy();
        this.createBackgroundStars();
        this.createForegroundStars();
        this.createCosmicDust();
    }
    
    createMainGalaxy() {
        // Main spiral galaxy with massive star count
        this.removeMainGalaxy();

        this.geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(this.parameters.count * 3);
        const colors = new Float32Array(this.parameters.count * 3);
        const scales = new Float32Array(this.parameters.count);
        const randomness = new Float32Array(this.parameters.count * 3);
        const brightness = new Float32Array(this.parameters.count);

        // Realistic color palette
        const colorCore = new THREE.Color(this.parameters.coreColor);
        const colorInner = new THREE.Color(this.parameters.innerColor);
        const colorMiddle = new THREE.Color(this.parameters.middleColor);
        const colorOuter = new THREE.Color(this.parameters.outerColor);
        const colorAccent = new THREE.Color(this.parameters.accentColor);

        for (let i = 0; i < this.parameters.count; i++) {
            const i3 = i * 3;

            // Natural density distribution - exponential falloff like real galaxies
            // Use multiple distribution curves for natural look
            let radius;
            const distributionType = Math.random();
            
            if (distributionType < 0.6) {
                // Core and inner disk - high density
                radius = Math.pow(Math.random(), 2.5) * this.parameters.radius * 0.5;
            } else if (distributionType < 0.9) {
                // Mid disk - medium density
                radius = (0.5 + Math.pow(Math.random(), 1.8) * 0.4) * this.parameters.radius;
            } else {
                // Outer disk - still populated but sparser
                radius = (0.9 + Math.random() * 0.1) * this.parameters.radius;
            }
            
            // Spiral arm calculation with natural variation
            const branchAngle = (i % this.parameters.branches) / this.parameters.branches * Math.PI * 2;
            const spinAngle = radius * this.parameters.spin;
            
            // Add noise to spiral arms for natural look (not perfect spirals)
            const armNoise = (Math.random() - 0.5) * 0.5;
            const angle = branchAngle + spinAngle + armNoise;
            
            // Base position
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = 0;
            positions[i3 + 2] = Math.sin(angle) * radius;

            // Natural randomness - creates realistic star distribution
            const randomnessStrength = this.parameters.randomness * radius * 0.2;
            const randomX = Math.pow(Math.random(), this.parameters.randomnessPower) * 
                           (Math.random() < 0.5 ? 1 : -1) * randomnessStrength;
            const randomY = Math.pow(Math.random(), this.parameters.randomnessPower) * 
                           (Math.random() < 0.5 ? 1 : -1) * randomnessStrength * 0.15; // Flatter disk
            const randomZ = Math.pow(Math.random(), this.parameters.randomnessPower) * 
                           (Math.random() < 0.5 ? 1 : -1) * randomnessStrength;

            randomness[i3] = randomX;
            randomness[i3 + 1] = randomY;
            randomness[i3 + 2] = randomZ;

            // Realistic astronomical color distribution
            const normalizedRadius = radius / this.parameters.radius;
            let mixedColor;
            
            // Color zones based on stellar population
            if (normalizedRadius < 0.1) {
                // Dense core - white hot stars
                mixedColor = colorCore.clone();
            } else if (normalizedRadius < 0.3) {
                // Inner region - blue-white young stars
                mixedColor = colorCore.clone().lerp(colorInner, (normalizedRadius - 0.1) / 0.2);
            } else if (normalizedRadius < 0.6) {
                // Mid region - yellow sun-like stars
                mixedColor = colorInner.clone().lerp(colorMiddle, (normalizedRadius - 0.3) / 0.3);
            } else if (normalizedRadius < 0.85) {
                // Outer region - cooler stars
                mixedColor = colorMiddle.clone().lerp(colorOuter, (normalizedRadius - 0.6) / 0.25);
            } else {
                // Far outer - sparse old stars
                mixedColor = colorOuter.clone();
            }
            
            // Add orange accent stars randomly (red giants, etc)
            if (Math.random() < 0.05) {
                mixedColor.lerp(colorAccent, 0.6);
            }
            
            // Natural color variation
            const colorVariation = (Math.random() - 0.5) * 0.08;
            mixedColor.r = Math.max(0, Math.min(1, mixedColor.r + colorVariation));
            mixedColor.g = Math.max(0, Math.min(1, mixedColor.g + colorVariation));
            mixedColor.b = Math.max(0, Math.min(1, mixedColor.b + colorVariation));

            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;

            // Variable star sizes - realistic distribution
            const sizeRandom = Math.random();
            let starSize;
            
            if (sizeRandom < 0.7) {
                // Most stars are small
                starSize = 0.3 + Math.random() * 0.4;
            } else if (sizeRandom < 0.95) {
                // Some medium stars
                starSize = 0.7 + Math.random() * 0.5;
            } else {
                // Few bright giant stars
                starSize = 1.2 + Math.random() * 0.8;
            }
            
            // Brighter near center
            const distanceFactor = 1.0 - (normalizedRadius * 0.5);
            scales[i] = starSize * distanceFactor;
            
            // Brightness for shader
            brightness[i] = starSize * distanceFactor;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
        this.geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3));
        this.geometry.setAttribute('aBrightness', new THREE.BufferAttribute(brightness, 1));

        this.setMainMaterial();
        this.setMainPoints();
    }

    createBackgroundStars() {
        // Distant background stars to fill empty space
        this.backgroundGeometry = new THREE.BufferGeometry();
        
        const count = this.parameters.backgroundCount;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        
        // Faint background colors
        const bgColors = [
            new THREE.Color('#ffffff'),
            new THREE.Color('#e8f4ff'),
            new THREE.Color('#fff5e1'),
            new THREE.Color('#d4e4ff')
        ];
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // Spherical distribution for background stars
            const radius = this.parameters.backgroundRadius * (0.5 + Math.random() * 0.5);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.3; // Flatter
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Random faint colors
            const bgColor = bgColors[Math.floor(Math.random() * bgColors.length)].clone();
            colors[i3] = bgColor.r;
            colors[i3 + 1] = bgColor.g;
            colors[i3 + 2] = bgColor.b;
            
            // Very small, faint stars
            scales[i] = 0.1 + Math.random() * 0.2;
        }
        
        this.backgroundGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.backgroundGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.backgroundGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
        
        this.backgroundMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uSize: { value: 15 * this.scene.renderer.getPixelRatio() }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uSize;
                attribute float aScale;
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                    
                    // Very subtle drift
                    modelPosition.x += sin(uTime * 0.02 + position.z * 0.1) * 0.05;
                    modelPosition.z += cos(uTime * 0.02 + position.x * 0.1) * 0.05;
                    
                    vec4 viewPosition = viewMatrix * modelPosition;
                    gl_Position = projectionMatrix * viewPosition;
                    
                    gl_PointSize = uSize * aScale;
                    gl_PointSize *= (1.0 / -viewPosition.z);
                    
                    vColor = color;
                    vAlpha = aScale * 0.4; // Very faint
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    float strength = 1.0 - smoothstep(0.0, 0.5, dist);
                    
                    vec3 finalColor = vColor * strength;
                    gl_FragColor = vec4(finalColor, strength * vAlpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });
        
        this.backgroundPoints = new THREE.Points(this.backgroundGeometry, this.backgroundMaterial);
        this.scene.add(this.backgroundPoints);
    }
    
    createForegroundStars() {
        // Bright foreground stars for depth
        this.foregroundGeometry = new THREE.BufferGeometry();
        
        const count = this.parameters.foregroundCount;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        
        const fgColors = [
            new THREE.Color('#ffffff'),
            new THREE.Color('#a8d8ff'),
            new THREE.Color('#ffe4b5'),
            new THREE.Color('#ffb366')
        ];
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // Scattered around galaxy
            const radius = Math.random() * this.parameters.radius * 0.8;
            const angle = Math.random() * Math.PI * 2;
            
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = (Math.random() - 0.5) * 2;
            positions[i3 + 2] = Math.sin(angle) * radius;
            
            const fgColor = fgColors[Math.floor(Math.random() * fgColors.length)].clone();
            colors[i3] = fgColor.r;
            colors[i3 + 1] = fgColor.g;
            colors[i3 + 2] = fgColor.b;
            
            // Larger, brighter stars
            scales[i] = 0.8 + Math.random() * 1.2;
        }
        
        this.foregroundGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.foregroundGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.foregroundGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
        
        this.foregroundMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uSize: { value: 35 * this.scene.renderer.getPixelRatio() }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uSize;
                attribute float aScale;
                varying vec3 vColor;
                varying float vBrightness;
                
                void main() {
                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                    
                    // Subtle twinkle
                    float twinkle = sin(uTime * 1.5 + position.x * 10.0) * 0.2 + 0.8;
                    
                    vec4 viewPosition = viewMatrix * modelPosition;
                    gl_Position = projectionMatrix * viewPosition;
                    
                    gl_PointSize = uSize * aScale * twinkle;
                    gl_PointSize *= (1.0 / -viewPosition.z);
                    
                    vColor = color;
                    vBrightness = aScale;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vBrightness;
                
                void main() {
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    // Bright core
                    float core = 1.0 - smoothstep(0.0, 0.1, dist);
                    core = pow(core, 2.0);
                    
                    // Soft glow
                    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
                    glow = pow(glow, 1.5);
                    
                    float strength = core + glow * 0.5;
                    vec3 finalColor = vColor * strength * vBrightness;
                    
                    gl_FragColor = vec4(finalColor, strength);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });
        
        this.foregroundPoints = new THREE.Points(this.foregroundGeometry, this.foregroundMaterial);
        this.scene.add(this.foregroundPoints);
    }
    
    createCosmicDust() {
        // Cosmic dust and nebula for atmosphere
        this.dustGeometry = new THREE.BufferGeometry();
        
        const count = this.parameters.dustCount;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        
        // Nebula colors - very subtle
        const dustColors = [
            new THREE.Color('#1a2332'),
            new THREE.Color('#2a3a4a'),
            new THREE.Color('#1a2a3a'),
            new THREE.Color('#2a3545')
        ];
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // Distribute throughout galaxy
            const radius = Math.pow(Math.random(), 0.6) * this.parameters.radius * 1.5;
            const angle = Math.random() * Math.PI * 2;
            
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = (Math.random() - 0.5) * 1.5;
            positions[i3 + 2] = Math.sin(angle) * radius;
            
            const dustColor = dustColors[Math.floor(Math.random() * dustColors.length)].clone();
            colors[i3] = dustColor.r;
            colors[i3 + 1] = dustColor.g;
            colors[i3 + 2] = dustColor.b;
            
            scales[i] = 0.2 + Math.random() * 0.6;
        }
        
        this.dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.dustGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.dustGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
        
        this.dustMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uSize: { value: 50 * this.scene.renderer.getPixelRatio() }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uSize;
                attribute float aScale;
                varying vec3 vColor;
                
                void main() {
                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                    
                    // Very slow drift
                    modelPosition.x += sin(uTime * 0.05 + position.z * 0.5) * 0.2;
                    modelPosition.z += cos(uTime * 0.05 + position.x * 0.5) * 0.2;
                    
                    vec4 viewPosition = viewMatrix * modelPosition;
                    gl_Position = projectionMatrix * viewPosition;
                    
                    gl_PointSize = uSize * aScale;
                    gl_PointSize *= (1.0 / -viewPosition.z);
                    
                    vColor = color;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    float strength = 1.0 - smoothstep(0.0, 0.5, dist);
                    
                    vec3 finalColor = vColor * strength * 0.15;
                    gl_FragColor = vec4(finalColor, strength * 0.1);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });
        
        this.dustPoints = new THREE.Points(this.dustGeometry, this.dustMaterial);
        this.scene.add(this.dustPoints);
    }
    
    removeMainGalaxy() {
        if (this.points !== null) {
            this.geometry.dispose();
            this.material.dispose();
            this.scene.remove(this.points);
        }
    }
    
    removeAll() {
        this.removeMainGalaxy();
        
        if (this.backgroundPoints !== null) {
            this.backgroundGeometry.dispose();
            this.backgroundMaterial.dispose();
            this.scene.remove(this.backgroundPoints);
        }
        
        if (this.foregroundPoints !== null) {
            this.foregroundGeometry.dispose();
            this.foregroundMaterial.dispose();
            this.scene.remove(this.foregroundPoints);
        }
        
        if (this.dustPoints !== null) {
            this.dustGeometry.dispose();
            this.dustMaterial.dispose();
            this.scene.remove(this.dustPoints);
        }
    }

    setMainMaterial() {
        this.material = new THREE.ShaderMaterial({
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
            vertexShader: galaxyVertexShader,
            fragmentShader: galaxyFragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uSize: { value: 20 * this.scene.renderer.getPixelRatio() }
            }
        })
    }

    setMainPoints() {
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
    }
    
    update(time) {
        // Update main galaxy
        if (this.material) {
            this.material.uniforms.uTime.value = time;
        }
        
        // Update background stars
        if (this.backgroundMaterial) {
            this.backgroundMaterial.uniforms.uTime.value = time;
        }
        
        // Update foreground stars
        if (this.foregroundMaterial) {
            this.foregroundMaterial.uniforms.uTime.value = time;
        }
        
        // Update dust
        if (this.dustMaterial) {
            this.dustMaterial.uniforms.uTime.value = time;
        }
    }
}