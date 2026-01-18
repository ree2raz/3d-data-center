import * as THREE from 'three';

export class Controls {
    constructor(camera, cyborg, canvas) {
        this.camera = camera;
        this.cyborg = cyborg;
        this.canvas = canvas;
        
        // Camera settings
        this.cameraOffset = new THREE.Vector3(0, 3, 6);
        this.cameraLookOffset = new THREE.Vector3(0, 1.5, 0);
        this.cameraSensitivity = 0.002;
        this.cameraShakeIntensity = 0.02;
        
        // Movement settings
        this.moveSpeed = 5;
        this.rotationSpeed = 0.1;
        
        // State
        this.yaw = 0;
        this.pitch = 0;
        this.pitchMin = -0.5;
        this.pitchMax = 0.8;
        
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };
        
        this.isLocked = false;
        this.moving = false;
        
        // Position and collision
        this.position = new THREE.Vector3(0, 0, 10);
        this.velocity = new THREE.Vector3();
        
        // Handheld camera shake
        this.shakeTime = 0;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Pointer lock
        this.canvas.addEventListener('click', () => {
            if (!this.isLocked) {
                this.lock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement === this.canvas;
        });

        // Mouse movement
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Keyboard
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    lock() {
        this.canvas.requestPointerLock();
    }

    unlock() {
        document.exitPointerLock();
    }

    onMouseMove(event) {
        if (!this.isLocked) return;

        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        this.yaw -= movementX * this.cameraSensitivity;
        this.pitch -= movementY * this.cameraSensitivity;

        // Clamp pitch
        this.pitch = Math.max(this.pitchMin, Math.min(this.pitchMax, this.pitch));
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = false;
                break;
        }
    }

    update(delta) {
        if (!this.isLocked) return;

        // Calculate movement direction based on camera yaw
        const moveDirection = new THREE.Vector3();
        
        if (this.keys.forward) {
            moveDirection.z -= 1;
        }
        if (this.keys.backward) {
            moveDirection.z += 1;
        }
        if (this.keys.left) {
            moveDirection.x -= 1;
        }
        if (this.keys.right) {
            moveDirection.x += 1;
        }

        this.moving = moveDirection.length() > 0;

        if (this.moving) {
            moveDirection.normalize();
            
            // Rotate movement direction by camera yaw
            const rotatedDirection = new THREE.Vector3(
                moveDirection.x * Math.cos(this.yaw) - moveDirection.z * Math.sin(this.yaw),
                0,
                moveDirection.x * Math.sin(this.yaw) + moveDirection.z * Math.cos(this.yaw)
            );

            // Apply movement with slight inertia for "heavy" feel
            const targetVelocity = rotatedDirection.multiplyScalar(this.moveSpeed);
            this.velocity.lerp(targetVelocity, 0.15);
        } else {
            // Decelerate when not moving
            this.velocity.lerp(new THREE.Vector3(0, 0, 0), 0.2);
        }

        // Update position
        const movement = this.velocity.clone().multiplyScalar(delta);
        this.position.add(movement);

        // Boundary collision
        const boundary = 27;
        this.position.x = Math.max(-boundary, Math.min(boundary, this.position.x));
        this.position.z = Math.max(-boundary, Math.min(boundary, this.position.z));

        // Update camera position (third-person over-the-shoulder)
        this.updateCamera(delta);
    }

    updateCamera(delta) {
        this.shakeTime += delta;

        // Calculate camera position based on yaw and pitch
        const cameraDistance = this.cameraOffset.z;
        const cameraHeight = this.cameraOffset.y;

        // Camera orbits around the player
        const cameraX = this.position.x + Math.sin(this.yaw) * cameraDistance;
        const cameraZ = this.position.z + Math.cos(this.yaw) * cameraDistance;
        const cameraY = this.position.y + cameraHeight + Math.sin(this.pitch) * cameraDistance * 0.5;

        // Smooth camera movement
        const targetPosition = new THREE.Vector3(cameraX, cameraY, cameraZ);
        this.camera.position.lerp(targetPosition, 0.1);

        // Add handheld camera shake when moving
        if (this.moving) {
            const shakeX = Math.sin(this.shakeTime * 15) * this.cameraShakeIntensity;
            const shakeY = Math.cos(this.shakeTime * 20) * this.cameraShakeIntensity * 0.5;
            this.camera.position.x += shakeX;
            this.camera.position.y += shakeY;
        }

        // Camera look at point (slightly above character)
        const lookAtPoint = new THREE.Vector3(
            this.position.x + this.cameraLookOffset.x,
            this.position.y + this.cameraLookOffset.y,
            this.position.z + this.cameraLookOffset.z
        );

        // Offset look point forward based on yaw for over-the-shoulder feel
        lookAtPoint.x -= Math.sin(this.yaw) * 2;
        lookAtPoint.z -= Math.cos(this.yaw) * 2;

        this.camera.lookAt(lookAtPoint);
    }

    getMovementState() {
        // Calculate character rotation to face movement direction
        let characterRotation = this.yaw + Math.PI;
        
        if (this.moving && this.velocity.length() > 0.1) {
            // Character faces movement direction
            characterRotation = Math.atan2(this.velocity.x, this.velocity.z);
        }

        return {
            position: this.position.clone(),
            rotation: characterRotation,
            moving: this.moving
        };
    }

    isMoving() {
        return this.moving;
    }

    getPosition() {
        return this.position.clone();
    }

    setPosition(pos) {
        this.position.copy(pos);
    }

    getYaw() {
        return this.yaw;
    }

    getPitch() {
        return this.pitch;
    }
}
