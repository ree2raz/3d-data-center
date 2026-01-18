import * as THREE from 'three';

export class ProjectRacks {
    constructor(scene) {
        this.scene = scene;
        this.racks = [];
        this.interactiveObjects = [];
        
        // Project data
        this.projects = [
            {
                id: 'project_a',
                title: 'NEURAL_NETWORK_VISUALIZER',
                description: 'Real-time 3D visualization of neural network training. Watch the machine learn as connections form and strengthen across layers.',
                tech: 'Three.js, TensorFlow.js, WebGL Shaders',
                link: 'https://github.com/example/neural-viz',
                type: 'tower',
                position: new THREE.Vector3(-15, 0, -10)
            },
            {
                id: 'project_b',
                title: 'RETRO_TERMINAL_OS',
                description: 'A web-based operating system with authentic CRT aesthetics. Complete with file system, text editor, and game emulator.',
                tech: 'React, Electron, Node.js, WebAssembly',
                link: 'https://github.com/example/retro-os',
                type: 'crt',
                position: new THREE.Vector3(15, 0, -10)
            },
            {
                id: 'project_c',
                title: 'QUANTUM_DATA_STREAM',
                description: 'Live data streaming platform with glitch aesthetics. Processes millions of data points with real-time transformations.',
                tech: 'WebSockets, D3.js, Redis, Go',
                link: 'https://github.com/example/quantum-stream',
                type: 'hologram',
                position: new THREE.Vector3(0, 0, -20)
            }
        ];
        
        this.createRacks();
    }

    createRacks() {
        this.projects.forEach(project => {
            switch (project.type) {
                case 'tower':
                    this.createTowerRack(project);
                    break;
                case 'crt':
                    this.createCRTRack(project);
                    break;
                case 'hologram':
                    this.createHologramRack(project);
                    break;
            }
        });
    }

    createTowerRack(project) {
        const group = new THREE.Group();
        group.position.copy(project.position);
        group.name = project.id;
        group.userData = { 
            isInteractive: true, 
            type: 'project', 
            project: project,
            activated: false
        };

        // Main tower structure
        const towerHeight = 6;
        const towerWidth = 2;
        const towerDepth = 1.5;

        // Frame
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.5,
            metalness: 0.8
        });

        const frameGeometry = new THREE.BoxGeometry(towerWidth + 0.2, towerHeight, towerDepth + 0.2);
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = towerHeight / 2;
        frame.castShadow = true;
        frame.receiveShadow = true;
        group.add(frame);

        // Server slots with blinking lights
        const slotCount = 8;
        const slotHeight = towerHeight / slotCount - 0.1;
        
        this.towerLights = [];
        
        for (let i = 0; i < slotCount; i++) {
            const slotGeometry = new THREE.BoxGeometry(towerWidth - 0.2, slotHeight, towerDepth - 0.2);
            const slotMaterial = new THREE.MeshStandardMaterial({
                color: 0x0a0a0a,
                roughness: 0.6,
                metalness: 0.7
            });
            const slot = new THREE.Mesh(slotGeometry, slotMaterial);
            slot.position.y = (i + 0.5) * (towerHeight / slotCount);
            slot.position.z = 0.05;
            group.add(slot);

            // LED indicators for each slot
            for (let j = 0; j < 4; j++) {
                const ledGeometry = new THREE.SphereGeometry(0.03, 8, 8);
                const ledMaterial = new THREE.MeshBasicMaterial({
                    color: Math.random() > 0.5 ? 0x00ff00 : 0xff6600
                });
                const led = new THREE.Mesh(ledGeometry, ledMaterial);
                led.position.set(
                    -0.7 + j * 0.15,
                    (i + 0.5) * (towerHeight / slotCount),
                    towerDepth / 2 + 0.05
                );
                group.add(led);
                this.towerLights.push(led);
            }
        }

        // Physical lever
        const leverGroup = new THREE.Group();
        leverGroup.position.set(towerWidth / 2 + 0.2, towerHeight / 2, 0);
        
        const leverBaseGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8);
        const leverBaseMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            metalness: 0.9
        });
        const leverBase = new THREE.Mesh(leverBaseGeometry, leverBaseMaterial);
        leverBase.rotation.z = Math.PI / 2;
        leverGroup.add(leverBase);

        const leverHandleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
        const leverHandleMaterial = new THREE.MeshStandardMaterial({
            color: 0xff3300,
            roughness: 0.3,
            metalness: 0.8
        });
        this.leverHandle = new THREE.Mesh(leverHandleGeometry, leverHandleMaterial);
        this.leverHandle.position.x = 0.4;
        this.leverHandle.rotation.z = -Math.PI / 4;
        leverGroup.add(this.leverHandle);

        const leverKnobGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        this.leverKnob = new THREE.Mesh(leverKnobGeometry, leverHandleMaterial);
        this.leverKnob.position.set(0.7, 0.3, 0);
        leverGroup.add(this.leverKnob);

        group.add(leverGroup);
        group.userData.leverHandle = this.leverHandle;
        group.userData.leverKnob = this.leverKnob;
        group.userData.leverGroup = leverGroup;

        // Cables coming out
        for (let i = 0; i < 5; i++) {
            const cablePoints = [
                new THREE.Vector3(-towerWidth / 2 - 0.1, Math.random() * towerHeight, 0),
                new THREE.Vector3(-towerWidth / 2 - 0.5 - Math.random(), Math.random() * towerHeight - 1, Math.random() - 0.5),
                new THREE.Vector3(-towerWidth / 2 - 1 - Math.random() * 2, 0.2, Math.random() * 2 - 1)
            ];
            const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
            const cableGeometry = new THREE.TubeGeometry(cableCurve, 20, 0.03, 8, false);
            const cableMaterial = new THREE.MeshStandardMaterial({
                color: [0x111111, 0x001100, 0x110000][i % 3],
                roughness: 0.7
            });
            const cable = new THREE.Mesh(cableGeometry, cableMaterial);
            group.add(cable);
        }

        this.scene.add(group);
        this.racks.push({ group, type: 'tower', lights: this.towerLights, project });
        this.interactiveObjects.push(group);
    }

    createCRTRack(project) {
        const group = new THREE.Group();
        group.position.copy(project.position);
        group.name = project.id;
        group.userData = { 
            isInteractive: true, 
            type: 'project', 
            project: project,
            activated: false
        };

        // Desk
        const deskGeometry = new THREE.BoxGeometry(4, 0.2, 2);
        const deskMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2015,
            roughness: 0.8
        });
        const desk = new THREE.Mesh(deskGeometry, deskMaterial);
        desk.position.y = 1;
        desk.castShadow = true;
        desk.receiveShadow = true;
        group.add(desk);

        // Desk legs
        const legGeometry = new THREE.BoxGeometry(0.15, 1, 0.15);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.8
        });
        const legPositions = [[-1.8, 0.5, -0.8], [1.8, 0.5, -0.8], [-1.8, 0.5, 0.8], [1.8, 0.5, 0.8]];
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(...pos);
            group.add(leg);
        });

        // Pile of CRT monitors
        this.crtScreens = [];
        const crtPositions = [
            { pos: [-0.8, 1.7, -0.2], rot: [0, 0.1, 0], scale: 1 },
            { pos: [0.8, 1.7, -0.3], rot: [0, -0.15, 0], scale: 1 },
            { pos: [0, 1.6, 0.3], rot: [0, 0.05, 0], scale: 0.9 },
            { pos: [0, 2.8, -0.1], rot: [0.1, 0, 0], scale: 0.85 }
        ];

        crtPositions.forEach((crt, index) => {
            const monitorGroup = new THREE.Group();
            
            // Monitor body
            const bodyGeometry = new THREE.BoxGeometry(1.2 * crt.scale, 1 * crt.scale, 1.2 * crt.scale);
            const bodyMaterial = new THREE.MeshStandardMaterial({
                color: 0x3d3d3d,
                roughness: 0.7
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            monitorGroup.add(body);

            // Screen bezel
            const bezelGeometry = new THREE.BoxGeometry(0.95 * crt.scale, 0.75 * crt.scale, 0.1);
            const bezelMaterial = new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 0.5
            });
            const bezel = new THREE.Mesh(bezelGeometry, bezelMaterial);
            bezel.position.z = 0.55 * crt.scale;
            monitorGroup.add(bezel);

            // Screen (static)
            const screenGeometry = new THREE.PlaneGeometry(0.8 * crt.scale, 0.6 * crt.scale);
            
            // Create static texture
            const staticCanvas = document.createElement('canvas');
            staticCanvas.width = 128;
            staticCanvas.height = 96;
            const staticCtx = staticCanvas.getContext('2d');
            
            // Fill with static
            for (let x = 0; x < 128; x++) {
                for (let y = 0; y < 96; y++) {
                    const gray = Math.floor(Math.random() * 50);
                    staticCtx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
                    staticCtx.fillRect(x, y, 1, 1);
                }
            }
            
            const staticTexture = new THREE.CanvasTexture(staticCanvas);
            const screenMaterial = new THREE.MeshBasicMaterial({
                map: staticTexture,
                transparent: true,
                opacity: 0.9
            });
            const screen = new THREE.Mesh(screenGeometry, screenMaterial);
            screen.position.z = 0.61 * crt.scale;
            monitorGroup.add(screen);
            
            this.crtScreens.push({ screen, texture: staticTexture, canvas: staticCanvas, ctx: staticCtx });

            // Screen glow
            const glowGeometry = new THREE.PlaneGeometry(0.9 * crt.scale, 0.7 * crt.scale);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0x003300,
                transparent: true,
                opacity: 0.2
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.z = 0.62 * crt.scale;
            monitorGroup.add(glow);

            monitorGroup.position.set(...crt.pos);
            monitorGroup.rotation.set(...crt.rot);
            group.add(monitorGroup);
        });

        // Keyboard
        const keyboardGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.5);
        const keyboardMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.6
        });
        const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
        keyboard.position.set(0, 1.15, 0.9);
        keyboard.rotation.x = -0.1;
        group.add(keyboard);

        // Random cables
        for (let i = 0; i < 3; i++) {
            const cablePoints = [
                new THREE.Vector3((Math.random() - 0.5) * 2, 1.1, 0.5),
                new THREE.Vector3((Math.random() - 0.5) * 3, 0.5, 1 + Math.random()),
                new THREE.Vector3((Math.random() - 0.5) * 4, 0.1, 1.5 + Math.random())
            ];
            const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
            const cableGeometry = new THREE.TubeGeometry(cableCurve, 15, 0.025, 8, false);
            const cableMaterial = new THREE.MeshStandardMaterial({
                color: 0x111111,
                roughness: 0.7
            });
            const cable = new THREE.Mesh(cableGeometry, cableMaterial);
            group.add(cable);
        }

        group.userData.screens = this.crtScreens;

        this.scene.add(group);
        this.racks.push({ group, type: 'crt', screens: this.crtScreens, project });
        this.interactiveObjects.push(group);
    }

    createHologramRack(project) {
        const group = new THREE.Group();
        group.position.copy(project.position);
        group.name = project.id;
        group.userData = { 
            isInteractive: true, 
            type: 'project', 
            project: project,
            activated: false
        };

        // Base emitter platform
        const baseGeometry = new THREE.CylinderGeometry(1.5, 1.8, 0.3, 12);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.9
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.15;
        base.castShadow = true;
        group.add(base);

        // Emitter ring
        const ringGeometry = new THREE.TorusGeometry(1.2, 0.1, 8, 24);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        this.emitterRing = new THREE.Mesh(ringGeometry, ringMaterial);
        this.emitterRing.position.y = 0.35;
        this.emitterRing.rotation.x = Math.PI / 2;
        group.add(this.emitterRing);

        // Holographic sphere (glitchy)
        const hologramGeometry = new THREE.IcosahedronGeometry(0.8, 2);
        const hologramMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        this.hologramSphere = new THREE.Mesh(hologramGeometry, hologramMaterial);
        this.hologramSphere.position.y = 2;
        group.add(this.hologramSphere);

        // Inner hologram core
        const coreGeometry = new THREE.OctahedronGeometry(0.4, 0);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        this.hologramCore = new THREE.Mesh(coreGeometry, coreMaterial);
        this.hologramCore.position.y = 2;
        group.add(this.hologramCore);

        // Hologram particles
        const particleCount = 100;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = 0.5 + Math.random() * 0.5;
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = 2 + r * Math.cos(phi);
            positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.hologramParticles = new THREE.Points(particleGeometry, particleMaterial);
        group.add(this.hologramParticles);

        // Beam of light from base
        const beamGeometry = new THREE.CylinderGeometry(0.05, 0.3, 2, 8, 1, true);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        this.beam = new THREE.Mesh(beamGeometry, beamMaterial);
        this.beam.position.y = 1.3;
        group.add(this.beam);

        // Support pillars
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const pillarGeometry = new THREE.BoxGeometry(0.15, 1, 0.15);
            const pillarMaterial = new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                metalness: 0.8
            });
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(
                Math.cos(angle) * 1.3,
                0.5,
                Math.sin(angle) * 1.3
            );
            group.add(pillar);
        }

        group.userData.hologramSphere = this.hologramSphere;
        group.userData.hologramCore = this.hologramCore;
        group.userData.hologramParticles = this.hologramParticles;
        group.userData.emitterRing = this.emitterRing;
        group.userData.beam = this.beam;

        this.scene.add(group);
        this.racks.push({ 
            group, 
            type: 'hologram',
            hologramSphere: this.hologramSphere,
            hologramCore: this.hologramCore,
            hologramParticles: this.hologramParticles,
            emitterRing: this.emitterRing,
            beam: this.beam,
            project 
        });
        this.interactiveObjects.push(group);
    }

    update(elapsed) {
        this.racks.forEach(rack => {
            switch (rack.type) {
                case 'tower':
                    this.updateTower(rack, elapsed);
                    break;
                case 'crt':
                    this.updateCRT(rack, elapsed);
                    break;
                case 'hologram':
                    this.updateHologram(rack, elapsed);
                    break;
            }
        });
    }

    updateTower(rack, elapsed) {
        // Blink random lights
        rack.lights.forEach((light, index) => {
            if (Math.random() < 0.02) {
                light.material.color.setHex(Math.random() > 0.5 ? 0x00ff00 : 0xff6600);
            }
            // Occasional flicker
            if (Math.random() < 0.01) {
                light.visible = !light.visible;
            }
        });
    }

    updateCRT(rack, elapsed) {
        // Update static on screens
        rack.screens.forEach(screenData => {
            // Update static every few frames
            if (Math.random() < 0.3) {
                for (let x = 0; x < 128; x += 4) {
                    for (let y = 0; y < 96; y += 4) {
                        const gray = Math.floor(Math.random() * 50);
                        screenData.ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
                        screenData.ctx.fillRect(x, y, 4, 4);
                    }
                }
                screenData.texture.needsUpdate = true;
            }
        });
    }

    updateHologram(rack, elapsed) {
        // Rotate hologram elements
        rack.hologramSphere.rotation.y = elapsed * 0.5;
        rack.hologramSphere.rotation.x = Math.sin(elapsed * 0.3) * 0.2;
        
        rack.hologramCore.rotation.y = -elapsed * 0.8;
        rack.hologramCore.rotation.z = elapsed * 0.4;
        
        rack.emitterRing.rotation.z = elapsed * 0.2;
        
        // Glitch effect - random position shifts
        if (Math.random() < 0.05) {
            rack.hologramSphere.position.x = (Math.random() - 0.5) * 0.2;
            rack.hologramSphere.position.z = (Math.random() - 0.5) * 0.2;
        } else {
            rack.hologramSphere.position.x *= 0.9;
            rack.hologramSphere.position.z *= 0.9;
        }
        
        // Pulsing opacity
        rack.hologramSphere.material.opacity = 0.4 + Math.sin(elapsed * 3) * 0.2;
        rack.beam.material.opacity = 0.15 + Math.sin(elapsed * 2) * 0.1;
        
        // Update particles
        const positions = rack.hologramParticles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length / 3; i++) {
            positions[i * 3 + 1] += Math.sin(elapsed * 2 + i) * 0.002;
        }
        rack.hologramParticles.geometry.attributes.position.needsUpdate = true;
        rack.hologramParticles.rotation.y = elapsed * 0.1;
    }

    getInteractiveObjects() {
        return this.interactiveObjects;
    }

    activateRack(rackGroup) {
        const rack = this.racks.find(r => r.group === rackGroup);
        if (!rack || rack.group.userData.activated) return;
        
        rack.group.userData.activated = true;

        switch (rack.type) {
            case 'tower':
                // Animate lever
                if (rack.group.userData.leverGroup) {
                    // Animation would go here
                }
                break;
            case 'crt':
                // Turn on screens with CRT effect
                rack.screens.forEach(screenData => {
                    screenData.ctx.fillStyle = '#001a00';
                    screenData.ctx.fillRect(0, 0, 128, 96);
                    screenData.ctx.fillStyle = '#00ff00';
                    screenData.ctx.font = '8px monospace';
                    screenData.ctx.fillText('SYSTEM', 10, 30);
                    screenData.ctx.fillText('ONLINE', 10, 50);
                    screenData.texture.needsUpdate = true;
                });
                break;
            case 'hologram':
                // Expand hologram
                rack.hologramSphere.scale.setScalar(1.5);
                rack.hologramCore.scale.setScalar(1.5);
                break;
        }

        return rack.project;
    }

    deactivateRack(rackGroup) {
        const rack = this.racks.find(r => r.group === rackGroup);
        if (!rack) return;
        
        rack.group.userData.activated = false;

        switch (rack.type) {
            case 'hologram':
                rack.hologramSphere.scale.setScalar(1);
                rack.hologramCore.scale.setScalar(1);
                break;
        }
    }
}
