varying vec3 vColor;
varying float vBrightness;

void main() 
{
    // Realistic star rendering - sharp point with soft glow
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    // Sharp bright core (like real stars)
    float core = 1.0 - smoothstep(0.0, 0.08, dist);
    core = pow(core, 4.0);
    
    // Soft atmospheric glow
    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    glow = pow(glow, 2.5) * 0.4;
    
    // Combine core and glow
    float strength = core + glow;
    
    // Apply brightness variation
    vec3 finalColor = vColor * strength;
    
    // Brighter stars get enhanced glow (like real astronomy photos)
    if (vBrightness > 0.8) {
        finalColor += vColor * glow * 0.4;
    }
    
    // Subtle bloom for very bright stars
    if (vBrightness > 1.2) {
        float bloom = glow * 0.3;
        finalColor += vec3(bloom);
    }

    gl_FragColor = vec4(finalColor, strength);
}