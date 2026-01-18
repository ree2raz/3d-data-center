# The Chaotic Mainframe - Development Context

## Project Overview
An immersive, gritty 3D portfolio experience built with Three.js where users navigate a cyborg through a chaotic server room to discover projects.

**Tech Stack:** Three.js, WebGL, JavaScript (ES6+), GLSL Shaders

---

## Architecture

### File Structure
```
playing-with-threejs/
├── index.html              # Main HTML with HUD, overlays, UI elements
├── styles.css              # Cyberpunk-themed CSS with animations
├── DEVELOPMENT_CONTEXT.md  # This file
└── js/
    ├── main.js              # Application entry point, game loop, component orchestration
    ├── Environment.js       # Server room (floors, walls, lights, cables, steam, clutter)
    ├── Cyborg.js            # Robot character with trailing data cable
    ├── Controls.js          # Third-person camera + WASD/mouse controls
    ├── ProjectRacks.js      # 3 project display types (tower, CRT, hologram)
    ├── ChaosCore.js         # Central "About Me" chaos sphere
    ├── InteractionSystem.js # Reticle targeting and interaction handling
    ├── DebugMode.js         # Wireframe/Matrix debug view toggle
    ├── AudioManager.js      # Procedural audio generation
    └── HUD.js               # Coordinates, status, radar minimap
```

---

## Component Details

### 1. main.js - Application Core
- **ChaoticMainframe class**: Main controller
- Initializes Three.js renderer with shadows, tone mapping
- Sets up scene with exponential fog (`FogExp2`)
- Manages loading screen with fake progress simulation
- Orchestrates all component updates in animation loop
- Handles window resize, debug toggle, overlay close events
- Manages pointer lock state

**Key Methods:**
- `init()` - Setup renderer, scene, camera
- `initComponents()` - Create all game objects
- `setupEventListeners()` - UI event handling
- `animate()` - Main game loop (60fps)
- `toggleDebugMode()` - Switch wireframe view

### 2. Environment.js - Server Room
**Creates:**
- Floor with procedural grating texture (rust, oil spills)
- Void underneath visible through gaps
- Walls with concrete texture and damage patches
- Ceiling with industrial beams
- 5 flickering orange warning lights
- 4 blue neon strips along walls
- 30 hanging cables from ceiling
- 4 steam vents with particle systems
- 40+ clutter items (scrap metal, server blades, circuit boards)
- Logout door with EXIT sign
- Invisible boundary walls

**Update Loop:**
- Flickers warning lights randomly
- Animates steam particles
- Creates occasional spark effects

### 3. Cyborg.js - Player Character
**Body Parts:**
- Torso with mismatched shoulder armor
- Head with glossy black visor (reflective)
- Visor glow strip (cyan, pulsing)
- Antenna with blinking red tip
- Arms (left: box-style, right: cylindrical for asymmetry)
- Legs with visible knee joints
- Status lights on chest (flickering)
- Battle damage scratches

**Data Cable:**
- 30-point cable trailing from back
- Simple rope physics simulation
- Floor collision detection

**Animations:**
- Walk cycle (leg/arm swing, body bob)
- Idle breathing animation
- Status light flickering

### 4. Controls.js - Player Input
**Camera:**
- Third-person over-the-shoulder view
- Offset: (0, 3, 6) from player
- Mouse sensitivity: 0.002
- Pitch clamped: -0.5 to 0.8
- Handheld camera shake when moving

**Movement:**
- WASD or Arrow keys
- Speed: 5 units/second
- Slight inertia for "heavy" feel
- Boundary collision at ±27 units

**Pointer Lock:**
- Click canvas to lock
- ESC to unlock

### 5. ProjectRacks.js - Project Displays
**Three Types:**

1. **Tower Rack** (position: -15, 0, -10)
   - 6-unit tall server tower
   - 8 server slots with LED indicators
   - Physical lever on side
   - Trailing cables
   - Project: "Neural Network Visualizer"

2. **CRT Station** (position: 15, 0, -10)
   - Desk with 4 legs
   - 4 stacked CRT monitors with static
   - Keyboard
   - Trailing cables
   - Project: "Retro Terminal OS"

3. **Hologram Emitter** (position: 0, 0, -20)
   - Cylindrical base platform
   - Glowing emitter ring
   - Wireframe icosahedron (glitching)
   - Inner octahedron core
   - Particle field
   - Light beam
   - Project: "Quantum Data Stream"

**Update Loop:**
- Tower: Random LED blinking
- CRT: Static texture updates
- Hologram: Rotation, glitch position shifts, opacity pulsing

### 6. ChaosCore.js - About Section
**Position:** Center of room (0, 3, 0)

**Components:**
- Outer jagged sphere (displaced icosahedron)
- Middle wireframe data sphere (orange)
- Inner glowing octahedron (red)
- Point lights (orange + red pulse)
- 30 orbiting metal debris pieces
- 8 vertical data streams (particles)
- 3 energy rings (rotating)
- Energy particle field
- Warning pedestal base

**Update Loop:**
- Multi-axis rotation of all spheres
- Debris orbital motion
- Data stream particle animation
- Occasional glitch position shifts
- Light intensity pulsing

### 7. InteractionSystem.js - Targeting
**Raycasting:**
- Casts from camera center
- Checks against interactive objects
- Range: 8 units

**UI Updates:**
- Locks reticle (orange + pulse animation)
- Shows interaction prompt ("EXECUTE", "ACCESS", "LOG OUT")
- Plays hover sound

**Interactions:**
- Project racks → Open terminal overlay
- Chaos Core → Open about overlay
- Logout door → Open logout confirmation

### 8. DebugMode.js - Wireframe View
**Enable:**
- Removes fog
- Changes background to dark green
- Swaps all materials to green wireframe
- Shows collision boundaries (red wireframe)
- Creates text labels for named objects
- Adds grid helper (60x60)
- Adds axes helper

**Disable:**
- Restores all original materials
- Removes debug elements
- Restores fog and background

**Update Loop:**
- Animates grid rotation
- Pulses label opacity
- Cycles collision box colors

### 9. AudioManager.js - Sound System
**Procedural Sounds (Web Audio API):**
- `ambience` - Low frequency industrial hum (looping)
- `footstep` - Metallic impact (0.15s)
- `mechanicalClunk` - Heavy machinery (0.5s)
- `digitalBlip` - UI feedback (0.1s)
- `spark` - Electrical crackle (0.3s)
- `crtOn` - Monitor turn-on sweep (0.8s)

**Features:**
- Initializes on first user interaction
- Footstep interval: 0.4s
- Pitch variation on footsteps
- 3D positional audio support

### 10. HUD.js - Interface
**Elements:**
- Coordinates display (X, Y, Z)
- System status (rotating messages)
- Radar minimap (150x150 canvas)

**Minimap Features:**
- Grid overlay
- Concentric circles (radar style)
- Room boundary outline
- Points of interest markers
- Player position (cyan dot)
- Rotating scan line effect

**Status Messages:**
- "UNSTABLE", "CRITICAL", "WARNING", "ANOMALY DETECTED", "FLUX VARIANCE"
- Rotates every 3 seconds

---

## CSS Styling

### Color Palette
- Primary: `#00ff00` (neon green)
- Secondary: `#ff6600` (warning orange)
- Danger: `#ff0000` (red)
- Accent: `#00ffff` (cyan)
- Background: `#000000`, `#0a0a0a`, `#1a1a1a`

### Key Animations
- `blink` - 0.5s opacity toggle
- `pulse` - Reticle scale animation
- `crtOn` - CRT turn-on effect (scaleY)
- `coreExpand` - About overlay entrance
- `chaosGlow` - Chaos bar glow
- `glitch` - Random translate shifts
- `flicker` - Subtle opacity variation

### Overlay Windows
- Terminal window (green border, CRT animation)
- Core window (orange gradient header)
- Logout prompt (red theme)

### Effects
- Scanline overlay (repeating gradient)
- Vignette (radial gradient)
- Text glow (text-shadow)

---

## Project Data (Editable)

Located in `ProjectRacks.js`:

```javascript
this.projects = [
    {
        id: 'project_a',
        title: 'NEURAL_NETWORK_VISUALIZER',
        description: 'Real-time 3D visualization of neural network training...',
        tech: 'Three.js, TensorFlow.js, WebGL Shaders',
        link: 'https://github.com/example/neural-viz',
        type: 'tower',
        position: new THREE.Vector3(-15, 0, -10)
    },
    {
        id: 'project_b',
        title: 'RETRO_TERMINAL_OS',
        description: 'A web-based operating system with authentic CRT aesthetics...',
        tech: 'React, Electron, Node.js, WebAssembly',
        link: 'https://github.com/example/retro-os',
        type: 'crt',
        position: new THREE.Vector3(15, 0, -10)
    },
    {
        id: 'project_c',
        title: 'QUANTUM_DATA_STREAM',
        description: 'Live data streaming platform with glitch aesthetics...',
        tech: 'WebSockets, D3.js, Redis, Go',
        link: 'https://github.com/example/quantum-stream',
        type: 'hologram',
        position: new THREE.Vector3(0, 0, -20)
    }
];
```

## About Data (Editable)

Located in `index.html` (lines 74-99):

```html
<div class="stat-value" id="about-name">THE ARCHITECT</div>
<div class="stat-value" id="about-role">Full-Stack Developer</div>
<div class="stat-value" id="about-bio">A digital architect who thrives in chaos...</div>
<div class="skills-grid">
    <span class="skill">JavaScript</span>
    <span class="skill">Three.js</span>
    <!-- Add more skills -->
</div>
```

---

## Future Enhancement Ideas

1. **Character Customization**
   - Different cyborg skins
   - Unlockable accessories

2. **More Project Types**
   - Floating datapad
   - Wall-mounted display
   - Interactive terminal

3. **Environment Expansion**
   - Multiple rooms/corridors
   - Elevator between floors
   - Secret areas

4. **Gameplay Elements**
   - Collectible data fragments
   - Mini-games at terminals
   - Achievement system

5. **Performance**
   - Level of detail (LOD) for distant objects
   - Instanced rendering for clutter
   - Texture atlasing

6. **Mobile Support**
   - Touch controls
   - Gyroscope camera
   - Simplified graphics mode

7. **Accessibility**
   - Keyboard-only navigation
   - Screen reader support
   - Reduced motion option

---

## Running the Project

### Local Development
```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8080
```

Then open: http://localhost:8080

### Controls
- **WASD** - Move character
- **Mouse** - Look around
- **Click** - Lock pointer / Interact
- **ESC** - Release pointer / Close overlays
- **DEBUG_MODE button** - Toggle wireframe view

---

## Dependencies

All loaded via CDN (import maps in index.html):
- Three.js v0.160.0

No build process required - pure ES6 modules.

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 15+
- Edge 90+

Requires:
- WebGL 2.0
- Pointer Lock API
- Web Audio API
- ES6 Modules

---

## Known Issues / TODOs

1. [ ] Cable physics can glitch at high speeds
2. [ ] Steam particles sometimes clip through floor
3. [ ] Debug labels overlap in crowded areas
4. [ ] Audio may not start on some mobile browsers
5. [ ] No save/load state between sessions

---

## Changelog

### v1.0.0 (Initial Build)
- Complete server room environment
- Cyborg character with animations
- Third-person controls
- 3 project display types
- Chaos Core about section
- Debug wireframe mode
- Procedural audio system
- HUD with minimap
- Interactive overlays

---

*Last Updated: January 2026*
