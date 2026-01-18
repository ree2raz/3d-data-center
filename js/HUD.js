export class HUD {
    constructor() {
        this.coordX = document.getElementById('coord-x');
        this.coordY = document.getElementById('coord-y');
        this.coordZ = document.getElementById('coord-z');
        this.minimapCanvas = document.getElementById('minimap-canvas');
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        
        // Set minimap canvas size
        this.minimapCanvas.width = 150;
        this.minimapCanvas.height = 150;
        
        // Minimap settings
        this.minimapScale = 2.5;
        this.minimapCenter = { x: 75, y: 75 };
        
        // Points of interest for minimap
        this.pointsOfInterest = [
            { x: -15, z: -10, color: '#ff6600', label: 'P1' },
            { x: 15, z: -10, color: '#ff6600', label: 'P2' },
            { x: 0, z: -20, color: '#ff6600', label: 'P3' },
            { x: 0, z: 0, color: '#ff0000', label: 'CORE' },
            { x: 0, z: -28, color: '#ff0000', label: 'EXIT' }
        ];
        
        // Status message rotation
        this.statusMessages = [
            'UNSTABLE',
            'CRITICAL',
            'WARNING',
            'ANOMALY DETECTED',
            'FLUX VARIANCE'
        ];
        this.currentStatusIndex = 0;
        this.lastStatusChange = 0;
        
        this.initMinimap();
        this.startStatusRotation();
    }

    initMinimap() {
        // Draw initial minimap background
        this.minimapCtx.fillStyle = 'rgba(0, 10, 0, 0.8)';
        this.minimapCtx.fillRect(0, 0, 150, 150);
    }

    update(playerPosition) {
        // Update coordinates display
        this.coordX.textContent = `X: ${playerPosition.x.toFixed(2)}`;
        this.coordY.textContent = `Y: ${playerPosition.y.toFixed(2)}`;
        this.coordZ.textContent = `Z: ${playerPosition.z.toFixed(2)}`;
        
        // Update minimap
        this.updateMinimap(playerPosition);
    }

    updateMinimap(playerPosition) {
        const ctx = this.minimapCtx;
        const width = 150;
        const height = 150;
        
        // Clear and draw background
        ctx.fillStyle = 'rgba(0, 10, 0, 0.9)';
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < width; i += 15) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }
        
        // Draw concentric circles (radar style)
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        for (let r = 20; r < 80; r += 20) {
            ctx.beginPath();
            ctx.arc(75, 75, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Draw room boundaries
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.lineWidth = 2;
        const roomSize = 27 * this.minimapScale;
        ctx.strokeRect(
            this.minimapCenter.x - roomSize / 2,
            this.minimapCenter.y - roomSize / 2,
            roomSize,
            roomSize
        );
        
        // Draw points of interest
        this.pointsOfInterest.forEach(poi => {
            const screenX = this.minimapCenter.x + poi.x * this.minimapScale;
            const screenY = this.minimapCenter.y + poi.z * this.minimapScale;
            
            ctx.fillStyle = poi.color;
            ctx.beginPath();
            ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Pulsing effect
            ctx.strokeStyle = poi.color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;
            ctx.beginPath();
            ctx.arc(screenX, screenY, 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        });
        
        // Draw player position
        const playerScreenX = this.minimapCenter.x + playerPosition.x * this.minimapScale;
        const playerScreenY = this.minimapCenter.y + playerPosition.z * this.minimapScale;
        
        // Player triangle (direction indicator)
        ctx.save();
        ctx.translate(playerScreenX, playerScreenY);
        
        // Draw player glow
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw player dot
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Draw scanning line effect
        const scanAngle = (Date.now() * 0.002) % (Math.PI * 2);
        ctx.save();
        ctx.translate(75, 75);
        ctx.rotate(scanAngle);
        
        const gradient = ctx.createLinearGradient(0, 0, 70, 0);
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 70, -0.1, 0.1);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        
        // Draw border
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(75, 75, 73, 0, Math.PI * 2);
        ctx.stroke();
    }

    startStatusRotation() {
        setInterval(() => {
            this.currentStatusIndex = (this.currentStatusIndex + 1) % this.statusMessages.length;
            const statusElement = document.querySelector('#system-status .blink');
            if (statusElement) {
                statusElement.textContent = this.statusMessages[this.currentStatusIndex];
            }
        }, 3000);
    }

    showMessage(message, duration = 3000) {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ff00;
            padding: 20px 40px;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 1.2rem;
            z-index: 1000;
            text-shadow: 0 0 10px #00ff00;
            animation: fadeIn 0.3s ease;
        `;
        messageEl.textContent = message;
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(messageEl);
            }, 300);
        }, duration);
    }

    updateDebugInfo(debugInfo) {
        // Display debug mode info
        if (!debugInfo) return;
        
        let debugOverlay = document.getElementById('debug-info');
        if (!debugOverlay) {
            debugOverlay = document.createElement('div');
            debugOverlay.id = 'debug-info';
            debugOverlay.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 200px;
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid #00ff00;
                padding: 10px;
                color: #00ff00;
                font-family: 'Courier New', monospace;
                font-size: 0.7rem;
                z-index: 100;
            `;
            document.body.appendChild(debugOverlay);
        }
        
        debugOverlay.innerHTML = `
            <div>MESHES: ${debugInfo.meshCount}</div>
            <div>TRIANGLES: ${debugInfo.triangleCount}</div>
            <div>DRAW_CALLS: ${debugInfo.drawCalls}</div>
            <div>GEOMETRIES: ${debugInfo.memory?.geometries || 0}</div>
            <div>TEXTURES: ${debugInfo.memory?.textures || 0}</div>
        `;
    }

    hideDebugInfo() {
        const debugOverlay = document.getElementById('debug-info');
        if (debugOverlay) {
            debugOverlay.remove();
        }
    }
}
