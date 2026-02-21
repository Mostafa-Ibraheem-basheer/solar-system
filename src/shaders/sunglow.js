export const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vPos;

void main() {
    vUv = uv;
    vPos = position; 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const fragmentShader = /* glsl */ `
uniform float iTime;
varying vec2 vUv;
varying vec3 vPos;

// --- 3D Simplex Noise (Ashima Arts) ---
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    // Permutations
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    // Gradients
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// --- Fractal Brownian Motion (FBM) ---
// Stacks multiple layers of noise to create highly detailed, organic textures.
float fbm(vec3 x) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < 6; ++i) { // 6 layers of detail
        v += a * snoise(x);
        x = x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    // 1. Setup coordinate space
    vec3 p = normalize(vPos) * 2.5; 
    float time = iTime * 0.15; // Animation speed
    
    // 2. Domain Warping (Creates the flowing, boiling plasma effect)
    vec3 q = p;
    q.x += fbm(p + vec3(time, 0.0, 0.0)) * 0.4;
    q.y += fbm(p + vec3(0.0, time * 1.2, 0.0)) * 0.4;
    q.z += fbm(p + vec3(0.0, 0.0, time * 0.8)) * 0.4;

    // 3. Macro details (Large active regions and dark spots)
    float macroNoise = fbm(q * 2.0 + time);
    macroNoise = macroNoise * 0.5 + 0.5; // Normalize to 0.0 -> 1.0
    
    // 4. Micro details (The fine "granulation" cells on the sun's surface)
    float microNoise = fbm(q * 12.0 - time * 0.5);
    microNoise = microNoise * 0.5 + 0.5;

    // Blend macro and micro together
    float heat = mix(macroNoise, microNoise, 0.4);
    
    // Sharpen the contrast to create distinct bright flares and dark spots
    heat = smoothstep(0.1, 0.9, heat);
    heat = pow(heat, 1.2); 

    // 5. Sun Color Palette (matching the provided image)
    vec3 darkSpot   = vec3(0.30, 0.05, 0.00); // Deep reddish-brown
    vec3 baseOrange = vec3(0.90, 0.30, 0.00); // Main surface orange
    vec3 brightYellow = vec3(1.00, 0.75, 0.05); // Hot active areas
    vec3 whiteFlare   = vec3(1.00, 1.00, 0.90); // Super-hot white core flares

    // 6. Map the heat value to our color palette using smooth steps
    vec3 color;
    if (heat < 0.4) {
        color = mix(darkSpot, baseOrange, smoothstep(0.0, 0.4, heat));
    } else if (heat < 0.75) {
        color = mix(baseOrange, brightYellow, smoothstep(0.4, 0.75, heat));
    } else {
        color = mix(brightYellow, whiteFlare, smoothstep(0.75, 1.0, heat));
    }

    gl_FragColor = vec4(color, 1.0);
}
`;
