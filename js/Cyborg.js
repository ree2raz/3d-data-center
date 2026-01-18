import * as THREE from 'three';

export class Cyborg {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.position = new THREE.Vector3(0, 0, 10);
        this.rotation = 0;
        this.targetRotation = 0;
        
        this.walkCycle = 0;
        this.isMoving = false;
        
        this.cablePoints = [];
        this.cableHistory = [];
        this.maxCableLength = 30;
        
        this.createBody();
        this.createHead();
        this.createArms();
        this.createLegs();
        this.createDataCable();
        this.createDetails();
        
        this.group.position.copy(this.position);
        this.group.name = 'cyborg';
        this.scene.add(this.group);
    }

    createBody() {
        // Torso - main chassis
        const torsoGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.5);
        const torsoMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.4,
            metalness: 0.8
        });
        this.torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        this.torso.position.y = 1.4;
        this.torso.castShadow = true;
        this.torso.name = 'cyborg_torso';
        this.group.add(this.torso);
        
        // Chest plate (mismatched armor)
        const chestGeometry = new THREE.BoxGeometry(0.7, 0.6, 0.2);
        const chestMaterial = new THREE.MeshStandardMaterial({
            color: 0x3d3d3d,
            roughness: 0.3,
            metalness: 0.9
        });
        const chest = new THREE.Mesh(chestGeometry, chestMaterial);
        chest.position.set(0, 1.5, 0.3);
        chest.name = 'cyborg_chest';
        this.group.add(chest);
        
        // Shoulder armor plates (asymmetric)
        const leftShoulderGeometry = new THREE.BoxGeometry(0.4, 0.25, 0.4);
        const leftShoulderMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3020,
            roughness: 0.6,
            metalness: 0.7
        });
        const leftShoulder = new THREE.Mesh(leftShoulderGeometry, leftShoulderMaterial);
        leftShoulder.position.set(-0.55, 1.85, 0);
        leftShoulder.rotation.z = -0.2;
        leftShoulder.name = 'cyborg_left_shoulder';
        this.group.add(leftShoulder);
        
        const rightShoulderGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.35);
        const rightShoulderMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a4a2a,
            roughness: 0.5,
            metalness: 0.8
        });
        const rightShoulder = new THREE.Mesh(rightShoulderGeometry, rightShoulderMaterial);
        rightShoulder.position.set(0.55, 1.85, 0);
        rightShoulder.rotation.z = 0.15;
        rightShoulder.name = 'cyborg_right_shoulder';
        this.group.add(rightShoulder);
        
        // Spine/back detail
        const spineGeometry = new THREE.BoxGeometry(0.2, 1, 0.15);
        const spineMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.5,
            metalness: 0.9
        });
        const spine = new THREE.Mesh(spineGeometry, spineMaterial);
        spine.position.set(0, 1.4, -0.3);
        spine.name = 'cyborg_spine';
        this.group.add(spine);
        
        // Hip section
        const hipGeometry = new THREE.BoxGeometry(0.7, 0.3, 0.4);
        const hipMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.5,
            metalness: 0.8
        });
        this.hip = new THREE.Mesh(hipGeometry, hipMaterial);
        this.hip.position.y = 0.7;
        this.hip.name = 'cyborg_hip';
        this.group.add(this.hip);
    }

    createHead() {
        // Neck
        const neckGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.2, 8);
        const neckMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.6,
            metalness: 0.7
        });
        const neck = new THREE.Mesh(neckGeometry, neckMaterial);
        neck.position.y = 2.1;
        neck.name = 'cyborg_neck';
        this.group.add(neck);
        
        // Head base
        const headGeometry = new THREE.BoxGeometry(0.45, 0.5, 0.4);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.4,
            metalness: 0.8
        });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = 2.45;
        this.head.name = 'cyborg_head';
        this.group.add(this.head);
        
        // Visor (glossy black, reflective)
        const visorGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.15);
        const visorMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.0,
            metalness: 1.0,
            envMapIntensity: 2
        });
        this.visor = new THREE.Mesh(visorGeometry, visorMaterial);
        this.visor.position.set(0, 2.5, 0.2);
        this.visor.name = 'cyborg_visor';
        this.group.add(this.visor);
        
        // Visor glow (subtle)
        const visorGlowGeometry = new THREE.BoxGeometry(0.35, 0.05, 0.01);
        const visorGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6
        });
        this.visorGlow = new THREE.Mesh(visorGlowGeometry, visorGlowMaterial);
        this.visorGlow.position.set(0, 2.48, 0.28);
        this.visorGlow.name = 'cyborg_visor_glow';
        this.group.add(this.visorGlow);
        
        // Antenna
        const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6);
        const antennaMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            metalness: 0.9
        });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.set(0.15, 2.85, -0.1);
        antenna.rotation.x = 0.3;
        antenna.name = 'cyborg_antenna';
        this.group.add(antenna);
        
        // Antenna tip (glowing)
        const antennaTipGeometry = new THREE.SphereGeometry(0.04, 8, 8);
        const antennaTipMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000
        });
        this.antennaTip = new THREE.Mesh(antennaTipGeometry, antennaTipMaterial);
        this.antennaTip.position.set(0.15, 3.0, -0.02);
        this.antennaTip.name = 'cyborg_antenna_tip';
        this.group.add(this.antennaTip);
    }

    createArms() {
        // Left arm
        this.leftArm = new THREE.Group();
        this.leftArm.position.set(-0.55, 1.7, 0);
        this.leftArm.name = 'cyborg_left_arm';
        
        const leftUpperArmGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.2);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.5,
            metalness: 0.8
        });
        const leftUpperArm = new THREE.Mesh(leftUpperArmGeometry, armMaterial);
        leftUpperArm.position.y = -0.25;
        this.leftArm.add(leftUpperArm);
        
        // Elbow joint
        const elbowGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const jointMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            metalness: 0.9
        });
        const leftElbow = new THREE.Mesh(elbowGeometry, jointMaterial);
        leftElbow.position.y = -0.5;
        this.leftArm.add(leftElbow);
        
        const leftForearmGeometry = new THREE.BoxGeometry(0.18, 0.45, 0.18);
        const leftForearm = new THREE.Mesh(leftForearmGeometry, armMaterial);
        leftForearm.position.y = -0.8;
        this.leftArm.add(leftForearm);
        
        // Left hand
        const handGeometry = new THREE.BoxGeometry(0.15, 0.12, 0.1);
        const leftHand = new THREE.Mesh(handGeometry, armMaterial);
        leftHand.position.y = -1.05;
        this.leftArm.add(leftHand);
        
        this.group.add(this.leftArm);
        
        // Right arm (different style for asymmetry)
        this.rightArm = new THREE.Group();
        this.rightArm.position.set(0.55, 1.7, 0);
        this.rightArm.name = 'cyborg_right_arm';
        
        const rightUpperArmGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.5, 8);
        const rightUpperArm = new THREE.Mesh(rightUpperArmGeometry, armMaterial);
        rightUpperArm.position.y = -0.25;
        this.rightArm.add(rightUpperArm);
        
        const rightElbow = new THREE.Mesh(elbowGeometry, jointMaterial);
        rightElbow.position.y = -0.5;
        this.rightArm.add(rightElbow);
        
        const rightForearmGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.45, 8);
        const rightForearm = new THREE.Mesh(rightForearmGeometry, armMaterial);
        rightForearm.position.y = -0.8;
        this.rightArm.add(rightForearm);
        
        // Right hand (claw-like)
        const rightHandGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.12);
        const rightHandMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.3,
            metalness: 0.9
        });
        const rightHand = new THREE.Mesh(rightHandGeometry, rightHandMaterial);
        rightHand.position.y = -1.05;
        this.rightArm.add(rightHand);
        
        this.group.add(this.rightArm);
    }

    createLegs() {
        // Left leg
        this.leftLeg = new THREE.Group();
        this.leftLeg.position.set(-0.2, 0.55, 0);
        this.leftLeg.name = 'cyborg_left_leg';
        
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.5,
            metalness: 0.8
        });
        
        const leftThighGeometry = new THREE.BoxGeometry(0.22, 0.45, 0.22);
        const leftThigh = new THREE.Mesh(leftThighGeometry, legMaterial);
        leftThigh.position.y = -0.25;
        this.leftLeg.add(leftThigh);
        
        const kneeGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        const kneeMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            metalness: 0.9
        });
        const leftKnee = new THREE.Mesh(kneeGeometry, kneeMaterial);
        leftKnee.position.y = -0.5;
        this.leftLeg.add(leftKnee);
        
        const leftShinGeometry = new THREE.BoxGeometry(0.18, 0.45, 0.18);
        const leftShin = new THREE.Mesh(leftShinGeometry, legMaterial);
        leftShin.position.y = -0.8;
        this.leftLeg.add(leftShin);
        
        // Foot
        const footGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.35);
        const footMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.6,
            metalness: 0.8
        });
        const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        leftFoot.position.set(0, -1.05, 0.05);
        this.leftLeg.add(leftFoot);
        
        this.group.add(this.leftLeg);
        
        // Right leg
        this.rightLeg = new THREE.Group();
        this.rightLeg.position.set(0.2, 0.55, 0);
        this.rightLeg.name = 'cyborg_right_leg';
        
        const rightThighGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.45, 8);
        const rightThigh = new THREE.Mesh(rightThighGeometry, legMaterial);
        rightThigh.position.y = -0.25;
        this.rightLeg.add(rightThigh);
        
        const rightKnee = new THREE.Mesh(kneeGeometry, kneeMaterial);
        rightKnee.position.y = -0.5;
        this.rightLeg.add(rightKnee);
        
        const rightShinGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.45, 8);
        const rightShin = new THREE.Mesh(rightShinGeometry, legMaterial);
        rightShin.position.y = -0.8;
        this.rightLeg.add(rightShin);
        
        const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        rightFoot.position.set(0, -1.05, 0.05);
        this.rightLeg.add(rightFoot);
        
        this.group.add(this.rightLeg);
    }

    createDataCable() {
        // Cable plug on back
        const plugGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.15, 8);
        const plugMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.9
        });
        this.plug = new THREE.Mesh(plugGeometry, plugMaterial);
        this.plug.position.set(0, 1.3, -0.35);
        this.plug.rotation.x = Math.PI / 2;
        this.plug.name = 'cyborg_cable_plug';
        this.group.add(this.plug);
        
        // Initialize cable points
        for (let i = 0; i < this.maxCableLength; i++) {
            this.cablePoints.push(new THREE.Vector3(
                this.position.x,
                0.2,
                this.position.z - i * 0.5
            ));
        }
        
        // Create cable geometry
        this.cableCurve = new THREE.CatmullRomCurve3(this.cablePoints);
        const cableGeometry = new THREE.TubeGeometry(this.cableCurve, 50, 0.04, 8, false);
        const cableMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.6,
            metalness: 0.4
        });
        
        this.cable = new THREE.Mesh(cableGeometry, cableMaterial);
        this.cable.name = 'cyborg_data_cable';
        this.scene.add(this.cable);
    }

    createDetails() {
        // Exposed wiring on torso
        const wirePositions = [
            { start: [-0.3, 1.2, 0.25], end: [-0.35, 1.6, 0.25] },
            { start: [0.3, 1.3, 0.25], end: [0.25, 1.7, 0.25] },
            { start: [-0.2, 1.8, -0.2], end: [-0.15, 1.4, -0.25] }
        ];
        
        const wireColors = [0xff0000, 0x00ff00, 0x0000ff];
        
        wirePositions.forEach((wire, index) => {
            const curve = new THREE.LineCurve3(
                new THREE.Vector3(...wire.start),
                new THREE.Vector3(...wire.end)
            );
            const wireGeometry = new THREE.TubeGeometry(curve, 8, 0.015, 6, false);
            const wireMaterial = new THREE.MeshBasicMaterial({
                color: wireColors[index % wireColors.length]
            });
            const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
            wireMesh.name = `cyborg_wire_${index}`;
            this.group.add(wireMesh);
        });
        
        // Status lights on chest
        const lightPositions = [
            { pos: [0.2, 1.65, 0.42], color: 0x00ff00 },
            { pos: [0.1, 1.65, 0.42], color: 0xff6600 },
            { pos: [0, 1.65, 0.42], color: 0x00ff00 }
        ];
        
        this.statusLights = [];
        lightPositions.forEach((light, index) => {
            const lightGeometry = new THREE.SphereGeometry(0.025, 8, 8);
            const lightMaterial = new THREE.MeshBasicMaterial({
                color: light.color
            });
            const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial);
            lightMesh.position.set(...light.pos);
            lightMesh.name = `cyborg_status_light_${index}`;
            this.group.add(lightMesh);
            this.statusLights.push(lightMesh);
        });
        
        // Battle damage / scratches (darker patches)
        const scratchPositions = [
            { pos: [0.3, 1.5, 0.26], size: [0.15, 0.08, 0.01] },
            { pos: [-0.25, 1.3, 0.26], size: [0.1, 0.12, 0.01] },
            { pos: [0.1, 0.75, 0.21], size: [0.12, 0.06, 0.01] }
        ];
        
        scratchPositions.forEach((scratch, index) => {
            const scratchGeometry = new THREE.BoxGeometry(...scratch.size);
            const scratchMaterial = new THREE.MeshStandardMaterial({
                color: 0x0a0a0a,
                roughness: 0.9
            });
            const scratchMesh = new THREE.Mesh(scratchGeometry, scratchMaterial);
            scratchMesh.position.set(...scratch.pos);
            scratchMesh.name = `cyborg_scratch_${index}`;
            this.group.add(scratchMesh);
        });
    }

    update(delta, movementState) {
        this.isMoving = movementState.moving;
        this.targetRotation = movementState.rotation;
        
        // Smooth rotation
        const rotationDiff = this.targetRotation - this.rotation;
        this.rotation += rotationDiff * 0.1;
        this.group.rotation.y = this.rotation;
        
        // Update position
        this.position.copy(movementState.position);
        this.group.position.copy(this.position);
        
        // Walk animation
        if (this.isMoving) {
            this.walkCycle += delta * 8;
            
            // Leg animation
            const legSwing = Math.sin(this.walkCycle) * 0.4;
            this.leftLeg.rotation.x = legSwing;
            this.rightLeg.rotation.x = -legSwing;
            
            // Arm swing (opposite to legs)
            this.leftArm.rotation.x = -legSwing * 0.5;
            this.rightArm.rotation.x = legSwing * 0.5;
            
            // Slight body bob
            this.torso.position.y = 1.4 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.05;
            this.head.position.y = 2.45 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.05;
        } else {
            // Idle animation
            this.walkCycle = 0;
            this.leftLeg.rotation.x = 0;
            this.rightLeg.rotation.x = 0;
            this.leftArm.rotation.x = 0;
            this.rightArm.rotation.x = 0;
            
            // Subtle idle breathing
            const breath = Math.sin(Date.now() * 0.002) * 0.02;
            this.torso.position.y = 1.4 + breath;
        }
        
        // Update data cable
        this.updateCable();
        
        // Flicker status lights
        this.statusLights.forEach((light, index) => {
            if (Math.random() < 0.02) {
                light.visible = !light.visible;
            }
        });
        
        // Antenna tip blink
        this.antennaTip.material.color.setHex(
            Math.sin(Date.now() * 0.005) > 0 ? 0xff0000 : 0x330000
        );
        
        // Visor glow pulse
        this.visorGlow.material.opacity = 0.4 + Math.sin(Date.now() * 0.003) * 0.2;
    }

    updateCable() {
        // Get current back position in world space
        const backPos = new THREE.Vector3(0, 1.3, -0.35);
        backPos.applyMatrix4(this.group.matrixWorld);
        
        // Update first point to follow cyborg
        this.cablePoints[0].copy(backPos);
        
        // Physics simulation for cable (simplified rope physics)
        for (let i = 1; i < this.cablePoints.length; i++) {
            const current = this.cablePoints[i];
            const previous = this.cablePoints[i - 1];
            
            // Apply gravity
            current.y -= 0.01;
            
            // Constrain distance between points
            const dir = current.clone().sub(previous);
            const distance = dir.length();
            const restLength = 0.5;
            
            if (distance > restLength) {
                dir.normalize();
                const correction = (distance - restLength) * 0.5;
                current.sub(dir.multiplyScalar(correction));
            }
            
            // Floor collision
            if (current.y < 0.1) {
                current.y = 0.1;
            }
        }
        
        // Recreate cable geometry
        this.cableCurve = new THREE.CatmullRomCurve3(this.cablePoints);
        const newGeometry = new THREE.TubeGeometry(this.cableCurve, 50, 0.04, 8, false);
        this.cable.geometry.dispose();
        this.cable.geometry = newGeometry;
    }

    getPosition() {
        return this.position.clone();
    }

    getRotation() {
        return this.rotation;
    }

    setPosition(pos) {
        this.position.copy(pos);
        this.group.position.copy(pos);
    }

    setRotation(rot) {
        this.rotation = rot;
        this.targetRotation = rot;
        this.group.rotation.y = rot;
    }
}
