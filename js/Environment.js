import * as THREE from 'three';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.lights = [];
        this.steamParticles = [];
        this.sparks = [];
        this.cables = [];
        this.clutter = [];
        
        this.createFloor();
        this.createWalls();
        this.createCeiling();
        this.createLighting();
        this.createCables();
        this.createSteamVents();
        this.createClutter();
        this.createLogoutDoor();
        this.createBoundaries();
    }

    createFloor() {
        // Main floor - metallic grating
        const floorGeometry = new THREE.PlaneGeometry(60, 60, 30, 30);
        
        // Create grating texture procedurally
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Base metal color
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 512, 512);
        
        // Grating pattern
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 3;
        for (let i = 0; i < 512; i += 32) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
        }
        
        // Add rust spots
        ctx.fillStyle = '#3d2817';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const r = Math.random() * 30 + 10;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Oil spills
        ctx.fillStyle = '#0a0a15';
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            ctx.beginPath();
            ctx.ellipse(x, y, Math.random() * 40 + 20, Math.random() * 30 + 15, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const floorTexture = new THREE.CanvasTexture(canvas);
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(8, 8);
        
        const floorMaterial = new THREE.MeshStandardMaterial({
            map: floorTexture,
            roughness: 0.8,
            metalness: 0.6,
            normalScale: new THREE.Vector2(0.5, 0.5)
        });
        
        this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.receiveShadow = true;
        this.floor.name = 'floor_main';
        this.scene.add(this.floor);
        
        // Void underneath - visible through gaps
        const voidGeometry = new THREE.PlaneGeometry(60, 60);
        const voidMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide
        });
        const voidPlane = new THREE.Mesh(voidGeometry, voidMaterial);
        voidPlane.rotation.x = -Math.PI / 2;
        voidPlane.position.y = -2;
        this.scene.add(voidPlane);
        
        // Add some grating holes showing the void
        for (let i = 0; i < 8; i++) {
            const holeGeometry = new THREE.PlaneGeometry(
                Math.random() * 2 + 1,
                Math.random() * 2 + 1
            );
            const holeMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.9
            });
            const hole = new THREE.Mesh(holeGeometry, holeMaterial);
            hole.rotation.x = -Math.PI / 2;
            hole.position.set(
                (Math.random() - 0.5) * 40,
                0.01,
                (Math.random() - 0.5) * 40
            );
            hole.name = `floor_hole_${i}`;
            this.scene.add(hole);
        }
    }

    createWalls() {
        const wallHeight = 12;
        const roomSize = 30;
        
        // Create wall texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Concrete base
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 512, 512);
        
        // Add texture variation
        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 30 + 10}, ${Math.random() * 30 + 10}, ${Math.random() * 30 + 10}, 0.5)`;
            ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 10, Math.random() * 10);
        }
        
        // Damage/cracks
        ctx.strokeStyle = '#0a0a0a';
        ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 512, Math.random() * 512);
            ctx.lineTo(Math.random() * 512, Math.random() * 512);
            ctx.stroke();
        }
        
        const wallTexture = new THREE.CanvasTexture(canvas);
        wallTexture.wrapS = THREE.RepeatWrapping;
        wallTexture.wrapT = THREE.RepeatWrapping;
        wallTexture.repeat.set(4, 2);
        
        const wallMaterial = new THREE.MeshStandardMaterial({
            map: wallTexture,
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Create walls
        const wallPositions = [
            { pos: [0, wallHeight/2, -roomSize], rot: [0, 0, 0] },
            { pos: [0, wallHeight/2, roomSize], rot: [0, Math.PI, 0] },
            { pos: [-roomSize, wallHeight/2, 0], rot: [0, Math.PI/2, 0] },
            { pos: [roomSize, wallHeight/2, 0], rot: [0, -Math.PI/2, 0] }
        ];
        
        wallPositions.forEach((wall, index) => {
            const wallGeometry = new THREE.PlaneGeometry(roomSize * 2, wallHeight);
            const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
            wallMesh.position.set(...wall.pos);
            wallMesh.rotation.set(...wall.rot);
            wallMesh.receiveShadow = true;
            wallMesh.name = `wall_${index}`;
            this.scene.add(wallMesh);
        });
        
        // Add concrete patches (asymmetric detail)
        for (let i = 0; i < 15; i++) {
            const patchGeometry = new THREE.BoxGeometry(
                Math.random() * 3 + 1,
                Math.random() * 3 + 1,
                0.3
            );
            const patchMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(0, 0, Math.random() * 0.1 + 0.1),
                roughness: 0.95
            });
            const patch = new THREE.Mesh(patchGeometry, patchMaterial);
            
            const wallIndex = Math.floor(Math.random() * 4);
            const wallData = wallPositions[wallIndex];
            patch.position.set(
                wallData.pos[0] + (Math.random() - 0.5) * (roomSize * 1.5),
                Math.random() * wallHeight,
                wallData.pos[2] + (Math.random() - 0.5) * (roomSize * 1.5)
            );
            patch.rotation.y = wallData.rot[1];
            patch.name = `wall_patch_${i}`;
            this.scene.add(patch);
        }
    }

    createCeiling() {
        const ceilingGeometry = new THREE.PlaneGeometry(60, 60, 10, 10);
        
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 512, 512);
        
        // Industrial ceiling pattern
        ctx.strokeStyle = '#151515';
        ctx.lineWidth = 4;
        for (let i = 0; i < 512; i += 64) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
        }
        
        const ceilingTexture = new THREE.CanvasTexture(canvas);
        ceilingTexture.wrapS = THREE.RepeatWrapping;
        ceilingTexture.wrapT = THREE.RepeatWrapping;
        ceilingTexture.repeat.set(6, 6);
        
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            map: ceilingTexture,
            roughness: 0.9,
            metalness: 0.2
        });
        
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 12;
        ceiling.name = 'ceiling';
        this.scene.add(ceiling);
        
        // Add ceiling beams
        for (let i = -25; i <= 25; i += 10) {
            const beamGeometry = new THREE.BoxGeometry(60, 1, 0.5);
            const beamMaterial = new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 0.8,
                metalness: 0.5
            });
            const beam = new THREE.Mesh(beamGeometry, beamMaterial);
            beam.position.set(0, 11.5, i);
            beam.castShadow = true;
            beam.name = `ceiling_beam_${i}`;
            this.scene.add(beam);
        }
    }

    createLighting() {
        // Ambient light (very dim)
        const ambientLight = new THREE.AmbientLight(0x111111, 0.3);
        this.scene.add(ambientLight);
        
        // Orange warning lights (flickering)
        const warningLightPositions = [
            [-15, 10, -15],
            [15, 10, -15],
            [-15, 10, 15],
            [15, 10, 15],
            [0, 10, 0]
        ];
        
        warningLightPositions.forEach((pos, index) => {
            const light = new THREE.PointLight(0xff6600, 2, 20);
            light.position.set(...pos);
            light.castShadow = true;
            light.shadow.mapSize.width = 512;
            light.shadow.mapSize.height = 512;
            light.name = `warning_light_${index}`;
            this.scene.add(light);
            this.lights.push({ light, type: 'warning', baseIntensity: 2 });
            
            // Light fixture
            const fixtureGeometry = new THREE.CylinderGeometry(0.3, 0.5, 0.5, 8);
            const fixtureMaterial = new THREE.MeshStandardMaterial({
                color: 0xff6600,
                emissive: 0xff6600,
                emissiveIntensity: 0.5
            });
            const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
            fixture.position.set(...pos);
            fixture.position.y += 0.5;
            fixture.name = `light_fixture_warning_${index}`;
            this.scene.add(fixture);
        });
        
        // Blue neon strips
        const neonPositions = [
            { start: [-25, 8, -28], end: [25, 8, -28] },
            { start: [-25, 8, 28], end: [25, 8, 28] },
            { start: [-28, 8, -25], end: [-28, 8, 25] },
            { start: [28, 8, -25], end: [28, 8, 25] }
        ];
        
        neonPositions.forEach((neon, index) => {
            const length = Math.sqrt(
                Math.pow(neon.end[0] - neon.start[0], 2) +
                Math.pow(neon.end[2] - neon.start[2], 2)
            );
            
            const neonGeometry = new THREE.BoxGeometry(
                neon.end[0] !== neon.start[0] ? length : 0.1,
                0.1,
                neon.end[2] !== neon.start[2] ? length : 0.1
            );
            const neonMaterial = new THREE.MeshBasicMaterial({
                color: 0x0066ff,
                transparent: true,
                opacity: 0.9
            });
            const neonMesh = new THREE.Mesh(neonGeometry, neonMaterial);
            neonMesh.position.set(
                (neon.start[0] + neon.end[0]) / 2,
                neon.start[1],
                (neon.start[2] + neon.end[2]) / 2
            );
            neonMesh.name = `neon_strip_${index}`;
            this.scene.add(neonMesh);
            
            // Neon light
            const neonLight = new THREE.RectAreaLight(0x0066ff, 3, length, 0.5);
            neonLight.position.copy(neonMesh.position);
            neonLight.lookAt(neonMesh.position.x, 0, neonMesh.position.z);
            this.scene.add(neonLight);
            this.lights.push({ light: neonLight, type: 'neon', baseIntensity: 3 });
        });
        
        // Spot lights for dramatic effect
        const spotLight = new THREE.SpotLight(0xffffff, 1, 30, Math.PI / 6, 0.5);
        spotLight.position.set(0, 11, -20);
        spotLight.target.position.set(0, 0, -20);
        spotLight.castShadow = true;
        this.scene.add(spotLight);
        this.scene.add(spotLight.target);
    }

    createCables() {
        // Hanging cables from ceiling
        for (let i = 0; i < 30; i++) {
            const cablePoints = [];
            const startX = (Math.random() - 0.5) * 50;
            const startZ = (Math.random() - 0.5) * 50;
            const segments = Math.floor(Math.random() * 5) + 3;
            
            for (let j = 0; j <= segments; j++) {
                const t = j / segments;
                const sag = Math.sin(t * Math.PI) * (Math.random() * 3 + 2);
                cablePoints.push(new THREE.Vector3(
                    startX + (Math.random() - 0.5) * 2,
                    12 - sag - t * (Math.random() * 4),
                    startZ + (Math.random() - 0.5) * 2
                ));
            }
            
            const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
            const cableGeometry = new THREE.TubeGeometry(cableCurve, 20, 0.05, 8, false);
            
            const colors = [0x111111, 0x1a0000, 0x001a00, 0x00001a, 0x1a1a00];
            const cableMaterial = new THREE.MeshStandardMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                roughness: 0.7
            });
            
            const cable = new THREE.Mesh(cableGeometry, cableMaterial);
            cable.name = `cable_hanging_${i}`;
            this.scene.add(cable);
            this.cables.push(cable);
        }
    }

    createSteamVents() {
        const ventPositions = [
            [-20, 0.5, -20],
            [20, 0.5, -15],
            [-15, 0.5, 20],
            [10, 0.5, 10]
        ];
        
        ventPositions.forEach((pos, index) => {
            // Vent grate
            const ventGeometry = new THREE.BoxGeometry(1.5, 0.2, 1.5);
            const ventMaterial = new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                roughness: 0.8,
                metalness: 0.6
            });
            const vent = new THREE.Mesh(ventGeometry, ventMaterial);
            vent.position.set(...pos);
            vent.name = `vent_grate_${index}`;
            this.scene.add(vent);
            
            // Steam particles
            const particleCount = 50;
            const particleGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const velocities = [];
            
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] = pos[0] + (Math.random() - 0.5) * 0.5;
                positions[i * 3 + 1] = pos[1];
                positions[i * 3 + 2] = pos[2] + (Math.random() - 0.5) * 0.5;
                velocities.push({
                    x: (Math.random() - 0.5) * 0.02,
                    y: Math.random() * 0.05 + 0.02,
                    z: (Math.random() - 0.5) * 0.02
                });
            }
            
            particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const particleMaterial = new THREE.PointsMaterial({
                color: 0x888888,
                size: 0.3,
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending
            });
            
            const particles = new THREE.Points(particleGeometry, particleMaterial);
            particles.name = `steam_particles_${index}`;
            this.scene.add(particles);
            
            this.steamParticles.push({
                particles,
                basePosition: pos,
                velocities,
                active: Math.random() > 0.5
            });
        });
    }

    createClutter() {
        // Scrap metal pieces
        for (let i = 0; i < 40; i++) {
            const size = Math.random() * 0.5 + 0.1;
            let geometry;
            const shapeType = Math.floor(Math.random() * 3);
            
            if (shapeType === 0) {
                geometry = new THREE.BoxGeometry(size, size * 0.2, size * 0.8);
            } else if (shapeType === 1) {
                geometry = new THREE.CylinderGeometry(size * 0.1, size * 0.1, size, 6);
            } else {
                geometry = new THREE.TetrahedronGeometry(size);
            }
            
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(0.08, 0.3, Math.random() * 0.2 + 0.1),
                roughness: 0.9,
                metalness: 0.6
            });
            
            const scrap = new THREE.Mesh(geometry, material);
            scrap.position.set(
                (Math.random() - 0.5) * 50,
                size / 2,
                (Math.random() - 0.5) * 50
            );
            scrap.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            scrap.castShadow = true;
            scrap.name = `scrap_${i}`;
            scrap.userData.isClutter = true;
            scrap.userData.originalPosition = scrap.position.clone();
            this.scene.add(scrap);
            this.clutter.push(scrap);
        }
        
        // Server blades scattered
        for (let i = 0; i < 15; i++) {
            const bladeGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.8);
            const bladeMaterial = new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 0.5,
                metalness: 0.8
            });
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.position.set(
                (Math.random() - 0.5) * 45,
                0.05,
                (Math.random() - 0.5) * 45
            );
            blade.rotation.y = Math.random() * Math.PI;
            blade.castShadow = true;
            blade.name = `server_blade_${i}`;
            blade.userData.isClutter = true;
            this.scene.add(blade);
            this.clutter.push(blade);
        }
        
        // Discarded circuit boards
        for (let i = 0; i < 10; i++) {
            const boardGeometry = new THREE.BoxGeometry(0.3, 0.02, 0.5);
            const boardMaterial = new THREE.MeshStandardMaterial({
                color: 0x0a3d0a,
                roughness: 0.6,
                metalness: 0.4
            });
            const board = new THREE.Mesh(boardGeometry, boardMaterial);
            board.position.set(
                (Math.random() - 0.5) * 45,
                0.01,
                (Math.random() - 0.5) * 45
            );
            board.rotation.y = Math.random() * Math.PI;
            board.name = `circuit_board_${i}`;
            board.userData.isClutter = true;
            this.scene.add(board);
            this.clutter.push(board);
        }
    }

    createLogoutDoor() {
        // Door frame
        const frameGeometry = new THREE.BoxGeometry(3, 5, 0.3);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.8,
            metalness: 0.5
        });
        
        const doorFrame = new THREE.Mesh(frameGeometry, frameMaterial);
        doorFrame.position.set(0, 2.5, -29);
        doorFrame.name = 'logout_door_frame';
        this.scene.add(doorFrame);
        
        // Door itself
        const doorGeometry = new THREE.BoxGeometry(2.5, 4.5, 0.2);
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a0000,
            roughness: 0.6,
            metalness: 0.7,
            emissive: 0x1a0000,
            emissiveIntensity: 0.2
        });
        
        this.logoutDoor = new THREE.Mesh(doorGeometry, doorMaterial);
        this.logoutDoor.position.set(0, 2.5, -28.8);
        this.logoutDoor.name = 'logout_door';
        this.logoutDoor.userData.isInteractive = true;
        this.logoutDoor.userData.type = 'logout';
        this.scene.add(this.logoutDoor);
        
        // EXIT sign
        const signGeometry = new THREE.BoxGeometry(1.5, 0.5, 0.1);
        const signMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.9
        });
        const exitSign = new THREE.Mesh(signGeometry, signMaterial);
        exitSign.position.set(0, 5.5, -28.5);
        exitSign.name = 'exit_sign';
        this.scene.add(exitSign);
        
        // Exit light
        const exitLight = new THREE.PointLight(0xff0000, 1, 10);
        exitLight.position.set(0, 5.5, -28);
        this.scene.add(exitLight);
    }

    createBoundaries() {
        // Invisible walls for collision
        const boundaryMaterial = new THREE.MeshBasicMaterial({
            visible: false
        });
        
        const boundaries = [
            { pos: [0, 6, -30], size: [60, 12, 1] },
            { pos: [0, 6, 30], size: [60, 12, 1] },
            { pos: [-30, 6, 0], size: [1, 12, 60] },
            { pos: [30, 6, 0], size: [1, 12, 60] }
        ];
        
        this.boundaries = [];
        boundaries.forEach((b, index) => {
            const geometry = new THREE.BoxGeometry(...b.size);
            const mesh = new THREE.Mesh(geometry, boundaryMaterial);
            mesh.position.set(...b.pos);
            mesh.name = `boundary_${index}`;
            mesh.userData.isBoundary = true;
            this.scene.add(mesh);
            this.boundaries.push(mesh);
        });
    }

    getLogoutDoor() {
        return this.logoutDoor;
    }

    getBoundaries() {
        return this.boundaries;
    }

    getClutter() {
        return this.clutter;
    }

    update(elapsed, delta) {
        // Flicker warning lights
        this.lights.forEach((lightData, index) => {
            if (lightData.type === 'warning') {
                const flicker = Math.sin(elapsed * 10 + index) * 0.3 + 
                               Math.sin(elapsed * 23 + index * 2) * 0.2 +
                               Math.random() * 0.1;
                lightData.light.intensity = lightData.baseIntensity * (0.7 + flicker * 0.3);
            }
        });
        
        // Update steam particles
        this.steamParticles.forEach((steam) => {
            if (!steam.active && Math.random() < 0.001) {
                steam.active = true;
            } else if (steam.active && Math.random() < 0.002) {
                steam.active = false;
            }
            
            if (steam.active) {
                const positions = steam.particles.geometry.attributes.position.array;
                
                for (let i = 0; i < positions.length / 3; i++) {
                    positions[i * 3] += steam.velocities[i].x;
                    positions[i * 3 + 1] += steam.velocities[i].y;
                    positions[i * 3 + 2] += steam.velocities[i].z;
                    
                    // Reset particle if too high
                    if (positions[i * 3 + 1] > steam.basePosition[1] + 4) {
                        positions[i * 3] = steam.basePosition[0] + (Math.random() - 0.5) * 0.5;
                        positions[i * 3 + 1] = steam.basePosition[1];
                        positions[i * 3 + 2] = steam.basePosition[2] + (Math.random() - 0.5) * 0.5;
                    }
                }
                
                steam.particles.geometry.attributes.position.needsUpdate = true;
            }
        });
        
        // Add spark effects near lights occasionally
        if (Math.random() < 0.01) {
            this.createSpark();
        }
    }

    createSpark() {
        const sparkPos = new THREE.Vector3(
            (Math.random() - 0.5) * 40,
            8 + Math.random() * 3,
            (Math.random() - 0.5) * 40
        );
        
        const sparkGeometry = new THREE.BufferGeometry();
        const sparkCount = 10;
        const positions = new Float32Array(sparkCount * 3);
        
        for (let i = 0; i < sparkCount * 3; i++) {
            positions[i] = sparkPos.x + (Math.random() - 0.5) * 0.5;
            positions[i + 1] = sparkPos.y + (Math.random() - 0.5) * 0.5;
            positions[i + 2] = sparkPos.z + (Math.random() - 0.5) * 0.5;
        }
        
        sparkGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const sparkMaterial = new THREE.PointsMaterial({
            color: 0xffff00,
            size: 0.1,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });
        
        const spark = new THREE.Points(sparkGeometry, sparkMaterial);
        spark.userData.lifetime = 0.5;
        spark.userData.age = 0;
        this.scene.add(spark);
        this.sparks.push(spark);
        
        // Clean up old sparks
        this.sparks = this.sparks.filter(s => {
            s.userData.age += 0.016;
            if (s.userData.age > s.userData.lifetime) {
                this.scene.remove(s);
                return false;
            }
            s.material.opacity = 1 - (s.userData.age / s.userData.lifetime);
            return true;
        });
    }
}
