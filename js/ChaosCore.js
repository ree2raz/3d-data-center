import * as THREE from 'three';

export class ChaosCore {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.group.position.set(0, 3, 0);
        this.group.name = 'chaos_core';
        this.group.userData = {
            isInteractive: true,
            type: 'core'
        };
        
        this.isActivated = false;
        this.rotationSpeed = 0.3;
        
        this.createCore();
        this.createDebrisRing();
        this.createDataStreams();
        this.createEnergyField();
        this.createPedestal();
        
        this.scene.add(this.group);
    }

    createCore() {
        // Outer chaotic sphere (jagged)
        const outerGeometry = new THREE.IcosahedronGeometry(1.5, 1);
        
        // Displace vertices for jagged effect
        const positions = outerGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const displacement = 0.3 + Math.random() * 0.4;
            positions.setX(i, positions.getX(i) * displacement + positions.getX(i));
            positions.setY(i, positions.getY(i) * displacement + positions.getY(i));
            positions.setZ(i, positions.getZ(i) * displacement + positions.getZ(i));
        }
        outerGeometry.computeVertexNormals();
        
        const outerMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.9,
            flatShading: true
        });
        
        this.outerSphere = new THREE.Mesh(outerGeometry, outerMaterial);
        this.outerSphere.name = 'chaos_core_outer';
        this.group.add(this.outerSphere);
        
        // Middle data sphere
        const middleGeometry = new THREE.IcosahedronGeometry(1.2, 2);
        const middleMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        this.middleSphere = new THREE.Mesh(middleGeometry, middleMaterial);
        this.middleSphere.name = 'chaos_core_middle';
        this.group.add(this.middleSphere);
        
        // Inner core (glowing)
        const innerGeometry = new THREE.OctahedronGeometry(0.6, 0);
        const innerMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.9
        });
        this.innerCore = new THREE.Mesh(innerGeometry, innerMaterial);
        this.innerCore.name = 'chaos_core_inner';
        this.group.add(this.innerCore);
        
        // Core light
        this.coreLight = new THREE.PointLight(0xff6600, 3, 15);
        this.coreLight.position.set(0, 0, 0);
        this.group.add(this.coreLight);
        
        // Secondary pulse light
        this.pulseLight = new THREE.PointLight(0xff0000, 1, 10);
        this.group.add(this.pulseLight);
    }

    createDebrisRing() {
        // Orbiting metal debris
        this.debris = [];
        const debrisCount = 30;
        
        for (let i = 0; i < debrisCount; i++) {
            const size = Math.random() * 0.2 + 0.05;
            let geometry;
            
            const shapeType = Math.floor(Math.random() * 3);
            if (shapeType === 0) {
                geometry = new THREE.BoxGeometry(size, size * 0.5, size * 0.8);
            } else if (shapeType === 1) {
                geometry = new THREE.TetrahedronGeometry(size);
            } else {
                geometry = new THREE.OctahedronGeometry(size);
            }
            
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(0.05 + Math.random() * 0.1, 0.5, 0.2),
                roughness: 0.7,
                metalness: 0.9
            });
            
            const debris = new THREE.Mesh(geometry, material);
            
            // Position in orbit
            const orbitRadius = 2.5 + Math.random() * 1;
            const angle = (i / debrisCount) * Math.PI * 2 + Math.random() * 0.5;
            const yOffset = (Math.random() - 0.5) * 1.5;
            
            debris.userData = {
                orbitRadius,
                orbitSpeed: 0.2 + Math.random() * 0.3,
                orbitOffset: angle,
                yOffset,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2,
                    z: (Math.random() - 0.5) * 2
                }
            };
            
            debris.position.set(
                Math.cos(angle) * orbitRadius,
                yOffset,
                Math.sin(angle) * orbitRadius
            );
            
            debris.castShadow = true;
            this.group.add(debris);
            this.debris.push(debris);
        }
    }

    createDataStreams() {
        // Vertical data streams around the core
        this.dataStreams = [];
        const streamCount = 8;
        
        for (let i = 0; i < streamCount; i++) {
            const angle = (i / streamCount) * Math.PI * 2;
            const radius = 2;
            
            const streamGeometry = new THREE.BufferGeometry();
            const particleCount = 50;
            const positions = new Float32Array(particleCount * 3);
            
            for (let j = 0; j < particleCount; j++) {
                positions[j * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.3;
                positions[j * 3 + 1] = -3 + j * 0.15;
                positions[j * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.3;
            }
            
            streamGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const streamMaterial = new THREE.PointsMaterial({
                color: i % 2 === 0 ? 0x00ff00 : 0xff6600,
                size: 0.08,
                transparent: true,
                opacity: 0.7,
                blending: THREE.AdditiveBlending
            });
            
            const stream = new THREE.Points(streamGeometry, streamMaterial);
            stream.userData = { baseAngle: angle, radius };
            this.group.add(stream);
            this.dataStreams.push(stream);
        }
    }

    createEnergyField() {
        // Energy rings
        this.energyRings = [];
        
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.TorusGeometry(2 + i * 0.5, 0.03, 8, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: i === 0 ? 0xff6600 : (i === 1 ? 0xff0000 : 0x00ff00),
                transparent: true,
                opacity: 0.4
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
            ring.rotation.y = Math.random() * Math.PI;
            ring.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.5,
                    y: (Math.random() - 0.5) * 0.5
                }
            };
            
            this.group.add(ring);
            this.energyRings.push(ring);
        }
        
        // Energy particles
        const particleCount = 200;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = 1.8 + Math.random() * 1.5;
            
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.cos(phi);
            positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xff6600,
            size: 0.05,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        
        this.energyParticles = new THREE.Points(particleGeometry, particleMaterial);
        this.group.add(this.energyParticles);
    }

    createPedestal() {
        // Base pedestal
        const pedestalGeometry = new THREE.CylinderGeometry(3, 3.5, 0.5, 8);
        const pedestalMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.4,
            metalness: 0.8
        });
        
        const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
        pedestal.position.y = -3;
        pedestal.receiveShadow = true;
        this.group.add(pedestal);
        
        // Warning stripes
        const stripeGeometry = new THREE.RingGeometry(2.8, 3.2, 8);
        const stripeMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        
        const stripes = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripes.rotation.x = -Math.PI / 2;
        stripes.position.y = -2.74;
        this.group.add(stripes);
        
        // Warning text simulation (small boxes)
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const warningGeometry = new THREE.BoxGeometry(1, 0.2, 0.1);
            const warningMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000
            });
            const warning = new THREE.Mesh(warningGeometry, warningMaterial);
            warning.position.set(
                Math.cos(angle) * 3.3,
                -2.5,
                Math.sin(angle) * 3.3
            );
            warning.rotation.y = -angle + Math.PI / 2;
            this.group.add(warning);
        }
    }

    update(elapsed) {
        // Rotate core elements
        this.outerSphere.rotation.y = elapsed * this.rotationSpeed;
        this.outerSphere.rotation.x = Math.sin(elapsed * 0.2) * 0.1;
        
        this.middleSphere.rotation.y = -elapsed * this.rotationSpeed * 1.5;
        this.middleSphere.rotation.z = elapsed * this.rotationSpeed * 0.5;
        
        this.innerCore.rotation.y = elapsed * this.rotationSpeed * 2;
        this.innerCore.rotation.x = elapsed * this.rotationSpeed;
        
        // Pulse lights
        this.coreLight.intensity = 2 + Math.sin(elapsed * 3) * 1;
        this.pulseLight.intensity = 1 + Math.sin(elapsed * 5) * 0.5;
        
        // Update debris orbits
        this.debris.forEach(debris => {
            const angle = debris.userData.orbitOffset + elapsed * debris.userData.orbitSpeed;
            debris.position.x = Math.cos(angle) * debris.userData.orbitRadius;
            debris.position.z = Math.sin(angle) * debris.userData.orbitRadius;
            debris.position.y = debris.userData.yOffset + Math.sin(elapsed * 2 + debris.userData.orbitOffset) * 0.2;
            
            debris.rotation.x += debris.userData.rotationSpeed.x * 0.01;
            debris.rotation.y += debris.userData.rotationSpeed.y * 0.01;
            debris.rotation.z += debris.userData.rotationSpeed.z * 0.01;
        });
        
        // Update data streams
        this.dataStreams.forEach((stream, index) => {
            const positions = stream.geometry.attributes.position.array;
            
            for (let i = 0; i < positions.length / 3; i++) {
                // Move particles upward
                positions[i * 3 + 1] += 0.05;
                
                // Reset if too high
                if (positions[i * 3 + 1] > 4) {
                    positions[i * 3 + 1] = -3;
                }
            }
            
            stream.geometry.attributes.position.needsUpdate = true;
            
            // Slight rotation
            const newAngle = stream.userData.baseAngle + elapsed * 0.1;
            stream.position.x = Math.cos(newAngle) * stream.userData.radius - Math.cos(stream.userData.baseAngle) * stream.userData.radius;
            stream.position.z = Math.sin(newAngle) * stream.userData.radius - Math.sin(stream.userData.baseAngle) * stream.userData.radius;
        });
        
        // Update energy rings
        this.energyRings.forEach(ring => {
            ring.rotation.x += ring.userData.rotationSpeed.x * 0.01;
            ring.rotation.y += ring.userData.rotationSpeed.y * 0.01;
        });
        
        // Update energy particles
        this.energyParticles.rotation.y = elapsed * 0.1;
        
        // Chaotic glitch effect
        if (Math.random() < 0.02) {
            this.group.position.x = (Math.random() - 0.5) * 0.1;
            this.group.position.z = (Math.random() - 0.5) * 0.1;
        } else {
            this.group.position.x *= 0.9;
            this.group.position.z *= 0.9;
        }
        
        // Scale pulsing when activated
        if (this.isActivated) {
            const scale = 1.2 + Math.sin(elapsed * 2) * 0.1;
            this.outerSphere.scale.setScalar(scale);
            this.middleSphere.scale.setScalar(scale);
            this.innerCore.scale.setScalar(scale);
        }
    }

    activate() {
        this.isActivated = true;
        this.rotationSpeed = 0.8;
        this.coreLight.intensity = 5;
        this.coreLight.color.setHex(0xff0000);
    }

    deactivate() {
        this.isActivated = false;
        this.rotationSpeed = 0.3;
        this.coreLight.intensity = 3;
        this.coreLight.color.setHex(0xff6600);
        
        this.outerSphere.scale.setScalar(1);
        this.middleSphere.scale.setScalar(1);
        this.innerCore.scale.setScalar(1);
    }

    getInteractiveObject() {
        return this.group;
    }

    getPosition() {
        return this.group.position.clone();
    }
}
