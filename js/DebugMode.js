import * as THREE from 'three';

export class DebugMode {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.isActive = false;
        
        this.originalMaterials = new Map();
        this.debugLabels = [];
        this.collisionBoxes = [];
        
        // Create wireframe material
        this.wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        
        // Grid material for specific objects
        this.gridMaterial = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(0x00ff00) },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec3 vNormal;
                void main() {
                    vPosition = position;
                    vNormal = normal;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float time;
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                void main() {
                    // Grid pattern
                    float gridX = step(0.9, fract(vPosition.x * 2.0));
                    float gridY = step(0.9, fract(vPosition.y * 2.0));
                    float gridZ = step(0.9, fract(vPosition.z * 2.0));
                    float grid = max(max(gridX, gridY), gridZ);
                    
                    // Scanline effect
                    float scanline = sin(vPosition.y * 50.0 + time * 5.0) * 0.1 + 0.9;
                    
                    // Edge highlight
                    float edge = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
                    edge = pow(edge, 2.0);
                    
                    float alpha = max(grid * 0.8, edge * 0.5) * scanline;
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        // Label sprite material
        this.createLabelMaterial();
    }

    createLabelMaterial() {
        // Will be used to create text labels
        this.labelCanvas = document.createElement('canvas');
        this.labelCanvas.width = 256;
        this.labelCanvas.height = 64;
        this.labelCtx = this.labelCanvas.getContext('2d');
    }

    createLabel(text, position) {
        // Clear canvas
        this.labelCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.labelCtx.fillRect(0, 0, 256, 64);
        
        // Draw border
        this.labelCtx.strokeStyle = '#00ff00';
        this.labelCtx.lineWidth = 2;
        this.labelCtx.strokeRect(2, 2, 252, 60);
        
        // Draw text
        this.labelCtx.fillStyle = '#00ff00';
        this.labelCtx.font = '16px Courier New';
        this.labelCtx.fillText(text, 10, 38);
        
        // Create texture and sprite
        const texture = new THREE.CanvasTexture(this.labelCanvas);
        texture.needsUpdate = true;
        
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.copy(position);
        sprite.position.y += 2;
        sprite.scale.set(2, 0.5, 1);
        
        return sprite;
    }

    toggle(active) {
        this.isActive = active;
        
        if (active) {
            this.enableDebugMode();
        } else {
            this.disableDebugMode();
        }
    }

    enableDebugMode() {
        // Disable fog
        this.originalFog = this.scene.fog;
        this.scene.fog = null;
        
        // Change background
        this.originalBackground = this.scene.background;
        this.scene.background = new THREE.Color(0x000a00);
        
        // Traverse all objects and swap materials
        this.scene.traverse((object) => {
            if (object.isMesh && object.material) {
                // Store original material
                if (!this.originalMaterials.has(object.uuid)) {
                    this.originalMaterials.set(object.uuid, object.material);
                }
                
                // Apply wireframe material
                if (object.name.includes('boundary') || object.name.includes('trigger')) {
                    // Show collision boxes
                    object.material = new THREE.MeshBasicMaterial({
                        color: 0xff0000,
                        wireframe: true,
                        transparent: true,
                        opacity: 0.5
                    });
                    object.visible = true;
                } else {
                    object.material = this.wireframeMaterial.clone();
                }
                
                // Create debug label
                if (object.name && object.name !== '' && !object.name.startsWith('_')) {
                    const label = this.createLabel(object.name, object.position);
                    label.userData.debugLabel = true;
                    this.scene.add(label);
                    this.debugLabels.push(label);
                }
            }
            
            // Show hidden collision boxes
            if (object.userData?.isBoundary) {
                const boxHelper = new THREE.BoxHelper(object, 0xff0000);
                boxHelper.userData.debugBox = true;
                this.scene.add(boxHelper);
                this.collisionBoxes.push(boxHelper);
            }
        });
        
        // Add grid helper
        this.gridHelper = new THREE.GridHelper(60, 60, 0x00ff00, 0x004400);
        this.gridHelper.position.y = 0.01;
        this.gridHelper.userData.debugElement = true;
        this.scene.add(this.gridHelper);
        
        // Add axes helper
        this.axesHelper = new THREE.AxesHelper(10);
        this.axesHelper.userData.debugElement = true;
        this.scene.add(this.axesHelper);
        
        // Change renderer settings
        this.renderer.setClearColor(0x000a00);
    }

    disableDebugMode() {
        // Restore fog
        if (this.originalFog) {
            this.scene.fog = this.originalFog;
        }
        
        // Restore background
        if (this.originalBackground !== undefined) {
            this.scene.background = this.originalBackground;
        }
        
        // Restore original materials
        this.scene.traverse((object) => {
            if (object.isMesh && this.originalMaterials.has(object.uuid)) {
                object.material = this.originalMaterials.get(object.uuid);
            }
            
            // Hide boundary boxes again
            if (object.userData?.isBoundary) {
                object.visible = false;
            }
        });
        
        // Remove debug labels
        this.debugLabels.forEach(label => {
            this.scene.remove(label);
            if (label.material.map) {
                label.material.map.dispose();
            }
            label.material.dispose();
        });
        this.debugLabels = [];
        
        // Remove collision box helpers
        this.collisionBoxes.forEach(box => {
            this.scene.remove(box);
            box.dispose();
        });
        this.collisionBoxes = [];
        
        // Remove grid helper
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
            this.gridHelper.dispose();
            this.gridHelper = null;
        }
        
        // Remove axes helper
        if (this.axesHelper) {
            this.scene.remove(this.axesHelper);
            this.axesHelper.dispose();
            this.axesHelper = null;
        }
        
        // Restore renderer settings
        this.renderer.setClearColor(0x000000);
    }

    update(elapsed) {
        if (!this.isActive) return;
        
        // Update shader time uniform
        this.scene.traverse((object) => {
            if (object.isMesh && object.material?.uniforms?.time) {
                object.material.uniforms.time.value = elapsed;
            }
        });
        
        // Animate grid
        if (this.gridHelper) {
            this.gridHelper.rotation.y = Math.sin(elapsed * 0.5) * 0.02;
        }
        
        // Pulse debug labels
        this.debugLabels.forEach((label, index) => {
            const pulse = 0.8 + Math.sin(elapsed * 3 + index * 0.5) * 0.2;
            label.material.opacity = pulse;
        });
        
        // Update collision box colors
        this.collisionBoxes.forEach((box, index) => {
            const hue = (elapsed * 0.1 + index * 0.1) % 1;
            box.material.color.setHSL(hue, 1, 0.5);
        });
    }

    // Get debug info for HUD
    getDebugInfo() {
        if (!this.isActive) return null;
        
        let meshCount = 0;
        let triangleCount = 0;
        let drawCalls = 0;
        
        this.scene.traverse((object) => {
            if (object.isMesh) {
                meshCount++;
                if (object.geometry) {
                    const geo = object.geometry;
                    if (geo.index) {
                        triangleCount += geo.index.count / 3;
                    } else if (geo.attributes.position) {
                        triangleCount += geo.attributes.position.count / 3;
                    }
                }
            }
        });
        
        const info = this.renderer.info;
        drawCalls = info.render.calls;
        
        return {
            meshCount,
            triangleCount: Math.floor(triangleCount),
            drawCalls,
            memory: info.memory
        };
    }
}
