# Technical Documentation - Realistic Galaxy with Black Hole

## Architecture Overview

### File Structure
```
src/
├── App.js                 # Main application entry point
├── index.html            # HTML template
├── scripts/
│   ├── Scene.js          # Three.js scene setup (camera, lights, renderer)
│   ├── Galaxy.js         # Galaxy particle system and stars
│   ├── BlackHole.js      # Black hole with accretion disk (NEW)
│   └── Gui.js            # dat.GUI controls
└── shaders/
    ├── vertex.glsl       # Vertex shader for stars
    └── fragment.glsl     # Fragment shader for star rendering
```

## Component Details

### 1. BlackHole.js
**Purpose**: Creates a realistic supermassive black hole at galaxy center

**Components**:
- **Event Horizon**: Pure black sphere (radius: 0.15 units)
- **Accretion Disk**: 5,000 particles in orbital motion
- **Volumetric Glow**: Shader-based glow effect

**Key Features**:
- Keplerian rotation (faster near center: `speed = 1.0 / (radius² + 0.1)`)
- Color gradient: Hot inner (orange) → Cool outer (blue)
- Pulsing glow animation
- Additive blending for luminosity

**Shader Uniforms**:
```glsl
uTime: float          // Animation time
uSize: float          // Particle size
glowColor: vec3       // Glow color (#ff8c42)
```

### 2. Galaxy.js
**Purpose**: Generates realistic spiral galaxy with 80,000+ stars

**Distribution Algorithm**:
```javascript
// Exponential density falloff (more realistic than linear)
const radiusRandom = Math.pow(Math.random(), 1.5);
const radius = radiusRandom * maxRadius;

// Spiral arm calculation
const branchAngle = (i % branches) / branches * Math.PI * 2;
const spinAngle = radius * spin; // Creates spiral
const angle = branchAngle + spinAngle;
```

**Color Zones**:
1. **Core (0-15%)**: White → Blue (hot, dense center)
2. **Inner (15-50%)**: Blue → Purple (active star formation)
3. **Outer (50-100%)**: Purple → Dark blue-grey (older stars)

**Physics**:
- Orbital rotation: `rotationSpeed = 1.0 / (distance + 0.5)`
- Vertical wave: `y += sin(time * 0.3 + distance * 1.5) * 0.03`
- Black hole pull: Applied to stars within 2 units

**Dust Particles**:
- 15,000 nebula particles
- Larger distribution (1.3x galaxy radius)
- Subtle drift animation
- Low opacity (0.2) for atmospheric effect

### 3. Shader System

#### Vertex Shader (vertex.glsl)
**Responsibilities**:
- Calculate orbital rotation
- Apply black hole gravitational influence
- Compute star size with twinkle effect
- Pass brightness to fragment shader

**Key Calculations**:
```glsl
// Keplerian rotation
float rotationSpeed = 1.0 / (distanceToCenter + 0.5);
float angleOffset = rotationSpeed * uTime * 0.08;

// Black hole gravitational pull
if (distanceToCenter < 2.0) {
    vec3 directionToBlackHole = normalize(uBlackHolePosition - modelPosition.xyz);
    float pullStrength = (2.0 - distanceToCenter) / 2.0;
    modelPosition.xyz += directionToBlackHole * pullStrength * uBlackHolePull * 0.1;
}

// Twinkle effect
float twinkle = sin(uTime * 2.0 + distanceToCenter * 5.0 + aScale * 10.0) * 0.15 + 0.85;
```

#### Fragment Shader (fragment.glsl)
**Responsibilities**:
- Render star with sharp core and soft glow
- Apply brightness variation
- Add bloom to bright stars

**Rendering Technique**:
```glsl
// Sharp core
float coreBrightness = 1.0 - smoothstep(0.0, 0.15, dist);
coreBrightness = pow(coreBrightness, 3.0);

// Soft glow
float glow = 1.0 - smoothstep(0.0, 0.5, dist);
glow = pow(glow, 2.0) * 0.5;

// Enhanced bloom for bright stars
if (vBrightness > 0.7) {
    finalColor += vColor * glow * 0.3;
}
```

### 4. Scene.js
**Purpose**: Setup Three.js scene, camera, lights, and controls

**Camera Settings**:
- FOV: 60° (cinematic)
- Position: (4, 2.5, 4) - Angled view
- Near/Far: 0.1 - 100 units

**Lighting**:
- Ambient: Dark blue-grey (#1a1a2e, intensity 0.3)
- Directional: Blue (#4a90e2, intensity 0.2) from above

**Controls**:
- Orbit controls with damping (factor: 0.05)
- Distance limits: 1-15 units
- Vertical rotation limit: 135° (0.75π)

### 5. App.js
**Purpose**: Main application loop and coordination

**Animation Loop**:
```javascript
animate() {
    const elapsedTime = this.clock.getElapsedTime();
    
    // Update all animated components
    this.galaxy.update(elapsedTime);
    this.blackHole.update(elapsedTime);
    
    // Render
    this.scene.controls.update();
    this.scene.renderer.render(this.scene, this.scene.camera);
    
    requestAnimationFrame(this.animate.bind(this));
}
```

## Performance Considerations

### Optimization Techniques
1. **Particle Count**: Adjustable via GUI (10k-150k)
2. **Shader Efficiency**: Minimal branching, optimized math
3. **Depth Write**: Disabled for particles (faster rendering)
4. **Blending Mode**: Additive (GPU-accelerated)
5. **Pixel Ratio**: Capped at 2x for high-DPI displays

### Performance Targets
- **Desktop**: 60 FPS @ 1080p with 80k particles
- **Laptop**: 45-60 FPS @ 1080p with 50k particles
- **Mobile**: Not optimized (use lower particle count)

### Bottlenecks
- Particle count (linear impact on performance)
- Shader complexity (vertex shader runs per particle per frame)
- Overdraw (multiple transparent particles)

## Customization Guide

### Adding New Features

#### Example: Add Star Clusters
```javascript
// In Galaxy.js
createStarClusters() {
    const clusterCount = 5;
    const starsPerCluster = 1000;
    
    for (let c = 0; c < clusterCount; c++) {
        const clusterPos = new THREE.Vector3(
            (Math.random() - 0.5) * this.parameters.radius,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * this.parameters.radius
        );
        
        // Add stars around cluster position
        // ... implementation
    }
}
```

#### Example: Add Gravitational Lensing
```glsl
// In vertex.glsl
// Distort positions near black hole
if (distanceToCenter < 1.0) {
    float lensStrength = 1.0 - distanceToCenter;
    vec3 tangent = normalize(cross(directionToBlackHole, vec3(0, 1, 0)));
    modelPosition.xyz += tangent * lensStrength * 0.2;
}
```

### Modifying Colors
Edit `Galaxy.js` parameters:
```javascript
this.parameters = {
    coreColor: '#ffffff',      // Bright center
    insideColor: '#4a90e2',    // Inner region
    middleColor: '#9b59b6',    // Middle region
    outsideColor: '#2c3e50'    // Outer region
}
```

### Adjusting Physics
Edit shader uniforms in `Galaxy.js`:
```javascript
uniforms: {
    uBlackHolePull: { value: 0.3 }  // Increase for stronger pull
}
```

## Debugging Tips

### Common Issues

**1. Low FPS**
- Reduce particle count in GUI
- Check GPU usage in browser DevTools
- Lower pixel ratio in Scene.js

**2. Stars Not Rotating**
- Verify `update()` methods are called in App.js
- Check `uTime` uniform is being updated
- Inspect shader compilation errors in console

**3. Black Hole Not Visible**
- Check camera position and distance
- Verify BlackHole.js is instantiated before Galaxy.js
- Check z-index and rendering order

### Performance Profiling
```javascript
// Add to App.js animate()
const startTime = performance.now();
this.galaxy.update(elapsedTime);
const galaxyTime = performance.now() - startTime;
console.log('Galaxy update:', galaxyTime.toFixed(2), 'ms');
```

## Future Enhancements

### Potential Features
- [ ] Gravitational lensing shader effect
- [ ] Star clusters and globular clusters
- [ ] Supernova explosions
- [ ] Planetary nebulae
- [ ] Dark matter halo visualization
- [ ] Multiple galaxies (collision simulation)
- [ ] VR support
- [ ] Post-processing (bloom, chromatic aberration)

### Advanced Physics
- [ ] N-body simulation for realistic orbits
- [ ] Stellar evolution (color changes over time)
- [ ] Gas dynamics simulation
- [ ] Magnetic field visualization

---

**For questions or contributions, see the main README.md**
