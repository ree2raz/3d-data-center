import * as THREE from 'three';
import { Environment } from './Environment.js';
import { Cyborg } from './Cyborg.js';
import { Controls } from './Controls.js';
import { ProjectRacks } from './ProjectRacks.js';
import { ChaosCore } from './ChaosCore.js';
import { DebugMode } from './DebugMode.js';
import { AudioManager } from './AudioManager.js';
import { HUD } from './HUD.js';
import { InteractionSystem } from './InteractionSystem.js';

class ChaoticMainframe {
    constructor() {
        this.clock = new THREE.Clock();
        this.isDebugMode = false;
        this.isLoaded = false;
        
        this.init();
    }

    async init() {
        // Setup renderer
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        // Setup scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x505050, 0.015);

        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        // Loading manager
        this.loadingManager = new THREE.LoadingManager();
        this.setupLoadingManager();

        // Initialize components
        await this.initComponents();

        // Setup event listeners
        this.setupEventListeners();

        // Start animation loop
        this.animate();
    }

    setupLoadingManager() {
        const loadingProgress = document.querySelector('.loading-progress');
        const loadingText = document.querySelector('.loading-text');
        const loadingScreen = document.getElementById('loading-screen');

        this.loadingManager.onProgress = (url, loaded, total) => {
            const progress = (loaded / total) * 100;
            loadingProgress.style.width = `${progress}%`;
            loadingText.textContent = `LOADING: ${Math.round(progress)}%`;
        };

        this.loadingManager.onLoad = () => {
            loadingText.textContent = 'SYSTEM READY';
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                this.isLoaded = true;
                this.controls.lock();
            }, 500);
        };

        // Simulate loading progress for assets we create procedurally
        let fakeProgress = 0;
        const fakeLoadInterval = setInterval(() => {
            fakeProgress += 10;
            loadingProgress.style.width = `${fakeProgress}%`;
            loadingText.textContent = `INITIALIZING SUBSYSTEMS: ${fakeProgress}%`;
            
            if (fakeProgress >= 100) {
                clearInterval(fakeLoadInterval);
                loadingText.textContent = 'SYSTEM READY';
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                    this.isLoaded = true;
                    // Start with pointer lock prompt
                    document.addEventListener('click', () => {
                        if (!document.pointerLockElement) {
                            this.controls.lock();
                        }
                    }, { once: false });
                }, 500);
            }
        }, 100);
    }

    async initComponents() {
        // Environment (server room)
        this.environment = new Environment(this.scene);
        
        // Cyborg character
        this.cyborg = new Cyborg(this.scene);
        
        // Controls (third-person)
        this.controls = new Controls(this.camera, this.cyborg, this.canvas);
        
        // Project server racks
        this.projectRacks = new ProjectRacks(this.scene);
        
        // Chaos Core (About section)
        this.chaosCore = new ChaosCore(this.scene);
        
        // Debug mode system
        this.debugMode = new DebugMode(this.scene, this.renderer);
        
        // Audio manager
        this.audioManager = new AudioManager(this.camera);
        
        // HUD system
        this.hud = new HUD();
        
        // Interaction system
        this.interactionSystem = new InteractionSystem(
            this.camera,
            this.scene,
            this.projectRacks,
            this.chaosCore,
            this.audioManager
        );

        // Store all interactive objects
        this.interactiveObjects = [
            ...this.projectRacks.getInteractiveObjects(),
            this.chaosCore.getInteractiveObject(),
            this.environment.getLogoutDoor()
        ];
        
        this.interactionSystem.setInteractiveObjects(this.interactiveObjects);
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Pointer lock state change
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement) {
                document.body.classList.add('locked');
            } else {
                document.body.classList.remove('locked');
            }
        });

        // Debug mode toggle
        const debugToggle = document.getElementById('debug-toggle');
        debugToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDebugMode();
        });

        // Project overlay close
        document.querySelector('.terminal-close').addEventListener('click', () => {
            document.getElementById('project-overlay').classList.add('hidden');
            this.controls.lock();
        });

        // About overlay close
        document.querySelector('.core-close').addEventListener('click', () => {
            document.getElementById('about-overlay').classList.add('hidden');
            this.chaosCore.deactivate();
            this.controls.lock();
        });

        // Logout buttons
        document.getElementById('logout-confirm').addEventListener('click', () => {
            location.reload();
        });

        document.getElementById('logout-cancel').addEventListener('click', () => {
            document.getElementById('logout-prompt').classList.add('hidden');
            this.controls.lock();
        });

        // ESC key handling for overlays
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                const projectOverlay = document.getElementById('project-overlay');
                const aboutOverlay = document.getElementById('about-overlay');
                const logoutPrompt = document.getElementById('logout-prompt');
                
                if (!projectOverlay.classList.contains('hidden')) {
                    projectOverlay.classList.add('hidden');
                }
                if (!aboutOverlay.classList.contains('hidden')) {
                    aboutOverlay.classList.add('hidden');
                    this.chaosCore.deactivate();
                }
                if (!logoutPrompt.classList.contains('hidden')) {
                    logoutPrompt.classList.add('hidden');
                }
            }
        });
    }

    toggleDebugMode() {
        this.isDebugMode = !this.isDebugMode;
        this.debugMode.toggle(this.isDebugMode);
        
        const debugToggle = document.getElementById('debug-toggle');
        debugToggle.classList.toggle('active', this.isDebugMode);
        
        this.audioManager.playSound('digitalBlip');
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        if (this.isLoaded) {
            // Update controls and character
            this.controls.update(delta);
            
            // Update cyborg
            this.cyborg.update(delta, this.controls.getMovementState());
            
            // Update environment effects
            this.environment.update(elapsed, delta);
            
            // Update project racks
            this.projectRacks.update(elapsed);
            
            // Update chaos core
            this.chaosCore.update(elapsed);
            
            // Update interaction system
            this.interactionSystem.update(this.cyborg.getPosition());
            
            // Update HUD
            this.hud.update(this.cyborg.getPosition());
            
            // Update debug mode
            if (this.isDebugMode) {
                this.debugMode.update(elapsed);
            }
            
            // Check for footstep sounds
            if (this.controls.isMoving()) {
                this.audioManager.playFootstep(elapsed);
            }
        }

        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the application
window.addEventListener('DOMContentLoaded', () => {
    new ChaoticMainframe();
});
