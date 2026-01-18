import * as THREE from 'three';

export class InteractionSystem {
    constructor(camera, scene, projectRacks, chaosCore, audioManager) {
        this.camera = camera;
        this.scene = scene;
        this.projectRacks = projectRacks;
        this.chaosCore = chaosCore;
        this.audioManager = audioManager;
        
        this.raycaster = new THREE.Raycaster();
        this.interactiveObjects = [];
        this.currentTarget = null;
        this.interactionDistance = 8;
        
        this.reticle = document.getElementById('reticle');
        this.interactPrompt = document.getElementById('interact-prompt');
        this.projectOverlay = document.getElementById('project-overlay');
        this.aboutOverlay = document.getElementById('about-overlay');
        this.logoutPrompt = document.getElementById('logout-prompt');
        
        this.setupEventListeners();
    }

    setInteractiveObjects(objects) {
        this.interactiveObjects = objects.filter(obj => obj !== null && obj !== undefined);
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => this.onInteract(e));
        document.addEventListener('mousemove', () => this.onHover());
    }

    update(playerPosition) {
        this.playerPosition = playerPosition;
        this.checkInteractions();
    }

    checkInteractions() {
        if (!this.playerPosition) return;

        // Cast ray from camera center
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        
        // Get all intersections with interactive objects
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);
        
        let closestInteractive = null;
        let closestDistance = Infinity;

        for (const intersect of intersects) {
            // Find the parent group that has userData.isInteractive
            let obj = intersect.object;
            while (obj && !obj.userData?.isInteractive) {
                obj = obj.parent;
            }

            if (obj && obj.userData?.isInteractive) {
                const distance = this.playerPosition.distanceTo(obj.position);
                
                if (distance < this.interactionDistance && distance < closestDistance) {
                    closestDistance = distance;
                    closestInteractive = obj;
                }
            }
        }

        // Update current target
        if (closestInteractive !== this.currentTarget) {
            this.currentTarget = closestInteractive;
            this.updateUI();
        }
    }

    updateUI() {
        if (this.currentTarget) {
            // Lock reticle
            this.reticle.classList.add('locked');
            this.interactPrompt.classList.remove('hidden');
            
            // Update prompt text based on type
            const promptText = this.interactPrompt.querySelector('.prompt-text');
            switch (this.currentTarget.userData.type) {
                case 'project':
                    promptText.textContent = 'EXECUTE';
                    break;
                case 'core':
                    promptText.textContent = 'ACCESS';
                    break;
                case 'logout':
                    promptText.textContent = 'LOG OUT';
                    break;
                default:
                    promptText.textContent = 'INTERACT';
            }
            
            // Play hover sound
            this.audioManager?.playSound('digitalBlip');
        } else {
            this.reticle.classList.remove('locked');
            this.interactPrompt.classList.add('hidden');
        }
    }

    onHover() {
        // Additional hover effects could go here
    }

    onInteract(event) {
        // Ignore clicks on UI elements
        if (event.target.closest('#debug-toggle') || 
            event.target.closest('.terminal-close') ||
            event.target.closest('.core-close') ||
            event.target.closest('#logout-confirm') ||
            event.target.closest('#logout-cancel')) {
            return;
        }

        if (!this.currentTarget) return;

        const type = this.currentTarget.userData.type;

        switch (type) {
            case 'project':
                this.openProject(this.currentTarget);
                break;
            case 'core':
                this.openAbout();
                break;
            case 'logout':
                this.openLogout();
                break;
        }

        // Play interaction sound
        this.audioManager?.playSound('mechanicalClunk');
    }

    openProject(rackGroup) {
        const project = this.projectRacks.activateRack(rackGroup);
        if (!project) return;

        // Update overlay content
        document.getElementById('project-title').innerHTML = 
            `<span style="color: #ff6600;">TITLE:</span> ${project.title}`;
        document.getElementById('project-description').innerHTML = 
            `<span style="color: #ff6600;">DESC:</span> ${project.description}`;
        document.getElementById('project-tech').innerHTML = 
            `<span style="color: #ff6600;">TECH:</span> ${project.tech}`;
        document.getElementById('project-link').innerHTML = 
            `<span style="color: #ff6600;">LINK:</span> <a href="${project.link}" target="_blank" style="color: #00ff00;">${project.link}</a>`;

        // Show overlay
        this.projectOverlay.classList.remove('hidden');
        
        // Exit pointer lock for UI interaction
        document.exitPointerLock();
    }

    openAbout() {
        this.chaosCore.activate();
        this.aboutOverlay.classList.remove('hidden');
        document.exitPointerLock();
    }

    openLogout() {
        this.logoutPrompt.classList.remove('hidden');
        document.exitPointerLock();
    }

    closeProject() {
        this.projectOverlay.classList.add('hidden');
        
        // Deactivate the rack
        if (this.currentTarget) {
            this.projectRacks.deactivateRack(this.currentTarget);
        }
    }

    closeAbout() {
        this.aboutOverlay.classList.add('hidden');
        this.chaosCore.deactivate();
    }

    closeLogout() {
        this.logoutPrompt.classList.add('hidden');
    }

    getCurrentTarget() {
        return this.currentTarget;
    }
}
