# 🪐 Three.js Solar System with GLSL Sun

![Three.js](https://img.shields.io/badge/Three.js-r150+-black?style=for-the-badge&logo=three.js)
![Vite](https://img.shields.io/badge/Vite-Fast-646CFF?style=for-the-badge&logo=vite)
![JavaScript](https://img.shields.io/badge/Vanilla%20JS-ES6+-yellow?style=for-the-badge&logo=javascript)

A fully interactive 3D simulation of the Solar System built with **Vite**, **Vanilla JavaScript**, and **Three.js**. This project features a custom GLSL shader to simulate the Sun's surface, textured planets with distinct moons, and realistic hierarchical orbital mechanics.

## ✨ Features

*   **☀️ Custom Sun Shader:** Uses `ShaderMaterial` with GLSL vertex/fragment shaders to create a dynamic, glowing, animated surface.
*   **🌍 Full Planetary System:** Includes Mercury through Neptune, utilizing high-resolution textures.
*   **ww 🌑 Moons:** Major moons included (e.g., Titan, Europa, Moon), orbiting their parent planets.
*   **🪐 Saturn's Rings:** Custom UV remapping on `RingGeometry` to properly texture the rings radially.
*   **🌌 CubeMap Skybox:** Seamless 360° deep-space background.
*   **🔄 Hierarchical Orbits:** Uses Three.js `Group` nesting for independent revolution and rotation speeds.
*   **🎮 Interactive Controls:** `OrbitControls` for zooming, panning, and exploring the system.

## Images
<img width="955" height="457" alt="image" src="https://github.com/user-attachments/assets/252503da-7cdf-4639-8117-52a6aaabefc1" />




## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v16+ recommended)
*   npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/threejs-solar-system.git
    cd threejs-solar-system
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open in Browser:**
    Go to `http://localhost:5173` (or the port shown in your terminal).

## 📂 Project Structure

Ensure your file structure matches the imports in `script.js`:

```text
├── public/
│   └── textures/
│       └── solar/
│           ├── cubeMaps/       # Skybox (px.png, nx.png, etc.)
│           ├── mercury.jpg
│           ├── saturn_ring.png
│           └── ... (other planet textures)
├── src/
│   ├── shaders/
│   │   └── sunglow.js      # Exports vertexShader & fragmentShader strings
│   ├── script.js             # Core logic (Scene, Camera, Renderer)
│   └── style.css
├── index.html
├── package.json
└── vite.config.js
```

## 🛠️ Technical Implementation

### 1. Scene Graph Hierarchy (Orbits)
Instead of calculating raw trigonometry (Sine/Cosine) for every frame, this project uses the Three.js **Scene Graph** to handle orbits:

*   **Sun:** Center of the scene `(0,0,0)`.
*   **Planet Group:** Added to the scene. Rotating this group rotates the planet around the Sun.
*   **Planet Mesh:** Added to the Planet Group but offset by `distance` on the X-axis.
*   **Moon Group:** Added to the Planet Mesh's position. Rotating this creates the moon's orbit.

```
// Animation Loop Logic
planet.orbitGroup.rotation.y += planet.speed * 0.1; // Orbit around Sun
planet.mesh.rotation.y += planet.speed;             // Rotate on axis
```

### 2. Saturn's Ring UV Remapping
Standard `RingGeometry` stretches textures in a way that doesn't look like planetary rings. To fix this, the code manually recalculates the UV coordinates to map the texture radially (from inner radius to outer radius).

```
// Logic used in script.js
const u = (distance - innerRadius) / (outerRadius - innerRadius);
uv.setXY(i, u, 0.5); // Maps texture from inside-out
```

### 3. The Sun Shader
The Sun is rendered using `THREE.ShaderMaterial`. It accepts two specific uniforms to animate the surface:

*   `iTime`: Updated every frame in the render loop to animate the noise/lava effect.
*   `iResolution`: Passed to ensure the shader renders correctly across different screen sizes.

## 🎮 Controls

*   **Left Click + Drag:** Rotate the camera around the focus point.
*   **Right Click + Drag:** Pan the camera.
*   **Scroll Wheel:** Zoom in and out (Min: 1, Max: 200).

## 📄 License

Distributed under the MIT License.

## 🙌 Acknowledgements

*   **Three.js:** For the 3D engine.
*   **Solar System Scope:** For the planet textures.
*   **Vite:** For the build tooling.
