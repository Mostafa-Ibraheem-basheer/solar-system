import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { vertexShader, fragmentShader } from "./shaders/sunglow.js";

/**
 * Base Setup
 */
const canvas = document.querySelector(".world");
const scene = new THREE.Scene();
const clock = new THREE.Clock();

const textureLoader = new THREE.TextureLoader();

const mercuryTexture = textureLoader.load("/textures/solar/mercury.jpg");
const venusTexture = textureLoader.load("/textures/solar/venus.jpg");
const earthTexture = textureLoader.load("/textures/solar/earth.jpg");
const marsTexture = textureLoader.load("/textures/solar/mars.jpg");
const jupiterTexture = textureLoader.load("/textures/solar/jupiter.jpg");
const saturnTexture = textureLoader.load("/textures/solar/saturn.jpg");
const uranusTexture = textureLoader.load("/textures/solar/uranus.jpg");
const neptuneTexture = textureLoader.load("/textures/solar/neptune.jpg");
const moonTexture = textureLoader.load("/textures/solar/moon.jpg");
const saturnBandTexture = textureLoader.load("/textures/solar/saturn_ring.png");
const spaceTexture = textureLoader.load("/textures/solar/space.jpg");

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 100, 0, 1);
scene.add(pointLight);

/**
 * The Sun (Sphere with ShaderMaterial)
 */
// Shader Uniforms
const sunUniforms = {
  iTime: { value: 0 },
  iResolution: {
    value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1),
  },
};

// Create Geometry ( same for all meshes)
const sphereGeometry = new THREE.SphereGeometry(1, 128, 128);

const circleGeometry = new THREE.RingGeometry(1.5, 2, 64);

// Create Materials
const sunMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: sunUniforms,
});
const mercuryMaterial = new THREE.MeshStandardMaterial({ map: mercuryTexture });
const venusMaterial = new THREE.MeshStandardMaterial({ map: venusTexture });
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
const marsMaterial = new THREE.MeshStandardMaterial({ map: marsTexture });
const jupiterMaterial = new THREE.MeshStandardMaterial({ map: jupiterTexture });
const saturnMaterial = new THREE.MeshStandardMaterial({ map: saturnTexture });
const saturnBandMaterial = new THREE.MeshStandardMaterial({
  map: saturnBandTexture,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.9,
});
const uranusMaterial = new THREE.MeshStandardMaterial({ map: uranusTexture });
const neptuneMaterial = new THREE.MeshStandardMaterial({ map: neptuneTexture });

// Create Meshes
const sun = new THREE.Mesh(sphereGeometry, sunMaterial);

// solar system
const solarSystem = new THREE.Group();

// planetary groups (plantes and moons)
const planets = [
  {
    name: "Mercury",
    radius: 0.4,
    distance: 20,
    speed: 0.025,
    material: mercuryMaterial,
    moons: [],
  },
  {
    name: "Venus",
    radius: 0.9,
    distance: 30,
    speed: 0.018,
    material: venusMaterial,
    moons: [],
  },
  {
    name: "Earth",
    radius: 1.0,
    distance: 35,
    speed: 0.012,
    material: earthMaterial,
    moons: [{ name: "Moon", radius: 0.25, distance: 2.5, speed: 0.04 }],
  },
  {
    name: "Mars",
    radius: 0.6,
    distance: 45,
    speed: 0.009,
    material: marsMaterial,
    moons: [
      { name: "Phobos", radius: 0.1, distance: 1.5, speed: 0.06 },
      { name: "Deimos", radius: 0.08, distance: 2.2, speed: 0.045 },
    ],
  },
  {
    name: "Jupiter",
    radius: 4.5,
    distance: 55,
    speed: 0.006,
    material: jupiterMaterial,
    moons: [
      { name: "Io", radius: 0.3, distance: 6.0, speed: 0.05 },
      { name: "Europa", radius: 0.28, distance: 7.5, speed: 0.035 },
      { name: "Ganymede", radius: 0.4, distance: 9.0, speed: 0.02 },
      { name: "Callisto", radius: 0.35, distance: 11.0, speed: 0.015 },
    ],
  },
  {
    name: "Saturn",
    radius: 3.8,
    distance: 75,
    speed: 0.004,
    material: saturnMaterial,
    moons: [
      { name: "Titan", radius: 0.5, distance: 7.0, speed: 0.03 },
      { name: "Enceladus", radius: 0.15, distance: 5.0, speed: 0.05 },
    ],
  },
  {
    name: "Uranus",
    radius: 2.2,
    distance: 95,
    speed: 0.0025,
    material: uranusMaterial,
    moons: [{ name: "Titania", radius: 0.25, distance: 4.0, speed: 0.03 }],
  },
  {
    name: "Neptune",
    radius: 2.1,
    distance: 110,
    speed: 0.0018,
    material: neptuneMaterial,
    moons: [{ name: "Triton", radius: 0.3, distance: 4.5, speed: 0.025 }],
  },
];

// add planets to their groups
for (const planetData of planets) {
  // 1. This group orbits the Sun
  const planetOrbitGroup = new THREE.Group();
  solarSystem.add(planetOrbitGroup);

  // 2. The Planet Mesh (offset from center)
  const planetMesh = new THREE.Mesh(sphereGeometry, planetData.material);
  planetMesh.scale.setScalar(planetData.radius);
  planetMesh.position.x = planetData.distance; // Static offset
  planetOrbitGroup.add(planetMesh);

  // Add Saturn's rings if it's Saturn
  if (planetData.name === "Saturn") {
    const innerRadius = planetData.radius * 1.4;
    const outerRadius = planetData.radius * 2.2;

    const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);

    // --- UV REMAPPING START ---
    // We need to change how the texture is wrapped around the ring.
    const pos = ringGeo.attributes.position;
    const uv = ringGeo.attributes.uv;

    for (let i = 0; i < pos.count; i++) {
      // Get the x and y of the vertex (before rotation)
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Calculate the distance from the center
      const distance = Math.sqrt(x * x + y * y);

      // Map that distance to the U coordinate (0 to 1)
      // Inner radius becomes 0, Outer radius becomes 1
      const u = (distance - innerRadius) / (outerRadius - innerRadius);

      // Set the UV: U is the distance (radial), V can be 0.5 (center of the strip)
      uv.setXY(i, u, 0.5);
    }
    // --- UV REMAPPING END ---

    const saturnRingMesh = new THREE.Mesh(ringGeo, saturnBandMaterial);

    saturnRingMesh.position.x = planetData.distance;
    saturnRingMesh.rotation.x = -Math.PI / 2; // Lay it flat

    planetOrbitGroup.add(saturnRingMesh);
    saturnRingMesh.rotation.y = Math.PI * 0.1; // Tilt
  }

  // 3. Add moons
  for (const moonData of planetData.moons) {
    // This group sits ON the planet and rotates to make the moon orbit
    const moonOrbitGroup = new THREE.Group();
    moonOrbitGroup.position.x = planetData.distance; // Move to planet's location
    planetOrbitGroup.add(moonOrbitGroup);

    const moonMesh = new THREE.Mesh(
      sphereGeometry,
      new THREE.MeshStandardMaterial({ map: moonTexture }),
    );
    moonMesh.scale.setScalar(moonData.radius);
    moonMesh.position.x = moonData.distance; // Offset moon from the planet

    moonOrbitGroup.add(moonMesh);

    // Store reference for animation if needed, or just use the hierarchy
    moonData.orbitGroup = moonOrbitGroup;
    moonData.mesh = moonMesh;
  }

  planetData.orbitGroup = planetOrbitGroup;
  planetData.mesh = planetMesh;
}

//add planetary Groups and sun to the solar system group
solarSystem.add(sun);

// transformations
sun.scale.setScalar(15);

// add meshes to scene
scene.add(solarSystem);

const loader = new THREE.CubeTextureLoader().setPath(
  "textures/solar/cubeMaps/",
);
const cubeTexture = await loader.loadAsync([
  "px.png",
  "nx.png",
  "py.png",
  "ny.png",
  "pz.png",
  "nz.png",
]);

scene.background = cubeTexture;

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  200,
);
camera.position.set(0, 0, 50);
scene.add(camera);

/**
 * Controls & Renderer
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 200;
controls.minDistance = 1;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animation Loop
 */
const renderLoop = () => {
  const elapsedTime = clock.getElapsedTime();
  sunUniforms.iTime.value = elapsedTime;

  sun.rotation.y += 0.001;

  planets.forEach((planet) => {
    // Orbit the planet around the Sun
    planet.orbitGroup.rotation.y += planet.speed * 0.1;

    // Rotate the planet on its own axis
    planet.mesh.rotation.y += planet.speed;

    // Orbit the moons around the planet
    planet.moons.forEach((moon) => {
      moon.orbitGroup.rotation.y += moon.speed * 0.1;

      // Rotate the moon on its own axis
      moon.mesh.rotation.y += moon.speed;
    });
  });

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderLoop);
};

renderLoop();

/**
 * Resize Handling
 */
window.addEventListener("resize", () => {
  // Update Sizes
  renderer.setSize(window.innerWidth, window.innerHeight);
  sunUniforms.iResolution.value.set(window.innerWidth, window.innerHeight, 1);

  // Update Camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
