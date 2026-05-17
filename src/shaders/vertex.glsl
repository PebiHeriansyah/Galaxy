uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandomness;
attribute float aBrightness;

varying vec3 vColor;
varying float vBrightness;

void main() 
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Calculate distance from center
    float distanceToCenter = length(modelPosition.xz);
    
    // Realistic orbital rotation - Keplerian (faster near center)
    float angle = atan(modelPosition.x, modelPosition.z);
    float rotationSpeed = 1.0 / (distanceToCenter + 0.3);
    float angleOffset = rotationSpeed * uTime * 0.06; // Slower, more realistic
    angle += angleOffset;
    
    float currentRadius = length(modelPosition.xz);
    modelPosition.x = cos(angle) * currentRadius;
    modelPosition.z = sin(angle) * currentRadius;
    
    // Very subtle vertical wave for natural motion
    modelPosition.y += sin(uTime * 0.2 + distanceToCenter * 1.0) * 0.02 * distanceToCenter;
    
    // Add randomness for natural distribution
    modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Subtle twinkle effect - very gentle
    float twinkle = sin(uTime * 1.2 + distanceToCenter * 3.0 + aScale * 8.0) * 0.1 + 0.9;
    gl_PointSize = uSize * aScale * twinkle;
    gl_PointSize *= (1.0 / -viewPosition.z);
    
    // Pass brightness to fragment shader
    vBrightness = aBrightness;
    vColor = color;
}