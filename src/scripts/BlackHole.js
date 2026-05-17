import * as THREE from 'three';

export default class BlackHole {
    constructor(scene) {
        this.scene = scene;
        
        // Black hole parameters
        this.eventHorizonRadius = 0.15;
        this.accretionDiskInnerRadius = 0.2;
        this.accretionDiskOuterRadius = 0.8;
        
        this.createBlackHole();
        this.createAccretionDisk();
        this.createGlow();
    }
    
    createBlackHole() {
        // Event horizon - pure black sphere
        const geometry = new THREE.SphereGeometry(this.eventHorizonRadius, 32, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x000000,
            transparent: true,
            opacity: 1
        });
        
        this.eventHorizon = new THREE.Mesh(geometry, material);
        this.scene.add(this.eventHorizon);
    }
    
    createAccretionDisk() {
        // Accretion disk with particles
        const particleCount = 5000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const scales = new Float32Array(particleCount);
        
        // Color palette for accretion disk
        const innerColor = new THREE.Color('#ff6b35'); // Hot orange
        const middleColor = new THREE.Color('#f7931e'); // Yellow-orange
        const outerColor = new THREE.Color('#4a90e2'); // Blue
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Disk distribution with higher density near inner edge
            const angle = Math.random() * Math.PI * 2;
            const radiusRandom = Math.pow(Math.random(), 0.5); // Power distribution for natural look
            const radius = this.accretionDiskInnerRadius + 
                          radiusRandom * (this.accretionDiskOuterRadius - this.accretionDiskInnerRadius);
            
            // Position in disk plane with slight thickness
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = (Math.random() - 0.5) * 0.05 * (1 - radiusRandom); // Thinner at outer edge
            positions[i3 + 2] = Math.sin(angle) * radius;
            
            // Color gradient based on distance from center
            const colorMix = (radius - this.accretionDiskInnerRadius) / 
                           (this.accretionDiskOuterRadius - this.accretionDiskInnerRadius);
            
            let finalColor;
            if (colorMix < 0.5) {
                finalColor = innerColor.clone().lerp(middleColor, colorMix * 2);
            } else {
                finalColor = middleColor.clone().lerp(outerColor, (colorMix - 0.5) * 2);
            }
            
            colors[i3] = finalColor.r;
            colors[i3 + 1] = finalColor.g;
            colors[i3 + 2] = finalColor.b;
            
            // Brighter particles near inner edge
            scales[i] = Math.random() * (1.5 - radiusRandom);
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uSize: { value: 20 * this.scene.renderer.getPixelRatio() }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uSize;
                attribute float aScale;
                varying vec3 vColor;
                
                void main() {
                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                    
                    // Rotate accretion disk
                    float angle = atan(modelPosition.x, modelPosition.z);
                    float radius = length(modelPosition.xz);
                    float rotationSpeed = 1.0 / (radius * radius + 0.1); // Faster near center
                    angle += uTime * rotationSpeed * 0.5;
                    
                    modelPosition.x = cos(angle) * radius;
                    modelPosition.z = sin(angle) * radius;
                    
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
                    float strength = distance(gl_PointCoord, vec2(0.5));
                    strength = 1.0 - strength;
                    strength = pow(strength, 3.0);
                    
                    vec3 color = vColor * strength;
                    gl_FragColor = vec4(color, strength);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });
        
        this.accretionDisk = new THREE.Points(geometry, material);
        this.scene.add(this.accretionDisk);
    }
    
    createGlow() {
        // Volumetric glow around black hole
        const glowGeometry = new THREE.SphereGeometry(this.accretionDiskOuterRadius * 1.2, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                glowColor: { value: new THREE.Color('#ff8c42') }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform float uTime;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    float pulse = sin(uTime * 0.5) * 0.1 + 0.9;
                    vec3 glow = glowColor * intensity * pulse * 0.8;
                    gl_FragColor = vec4(glow, intensity * 0.3);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.scene.add(this.glow);
    }
    
    update(time) {
        // Update accretion disk animation
        if (this.accretionDisk) {
            this.accretionDisk.material.uniforms.uTime.value = time;
        }
        
        // Update glow pulse
        if (this.glow) {
            this.glow.material.uniforms.uTime.value = time;
        }
    }
    
    dispose() {
        if (this.eventHorizon) {
            this.eventHorizon.geometry.dispose();
            this.eventHorizon.material.dispose();
            this.scene.remove(this.eventHorizon);
        }
        
        if (this.accretionDisk) {
            this.accretionDisk.geometry.dispose();
            this.accretionDisk.material.dispose();
            this.scene.remove(this.accretionDisk);
        }
        
        if (this.glow) {
            this.glow.geometry.dispose();
            this.glow.material.dispose();
            this.scene.remove(this.glow);
        }
    }
}
