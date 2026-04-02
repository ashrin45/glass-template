/* ============================================
   Deep Learning Course — Shared Animation Utils
   (Glassmorphism theme)
   ============================================ */

const DL = {
    // ---- Color palette (glass theme) ----
    colors: {
        accent: '#a78bfa',
        accentLight: '#c4b5fd',
        success: '#5eead4',
        warning: '#fbbf24',
        danger: '#fb7185',
        info: '#60a5fa',
        bg: '#12101f',
        bgDark: '#0c0a1d',
        border: 'rgba(255,255,255,0.12)',
        text: '#f8fafc',
        textMuted: '#64748b',
        neuronFill: 'rgba(255,255,255,0.06)',
        neuronStroke: '#a78bfa',
        connectionPos: 'rgba(94, 234, 212, 0.7)',
        connectionNeg: 'rgba(251, 113, 133, 0.7)',
        // Semantic colors — math notation
        input: '#5eead4',       // x
        weight: '#c4b5fd',      // w
        bias: '#60a5fa',        // b
        sum: '#fbbf24',         // z
        activation: '#f472b6',  // f
        output: '#fb7185',      // ŷ
    },

    // ---- Canvas setup ----
    setupCanvas(canvasId, width, height) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);
        return { canvas, ctx, width, height };
    },

    // ---- Drawing primitives ----
    drawNeuron(ctx, x, y, radius, options = {}) {
        const {
            fill = this.colors.neuronFill,
            stroke = this.colors.neuronStroke,
            lineWidth = 2,
            label = '',
            glow = false,
            pulsePhase = 0
        } = options;

        ctx.save();

        if (glow) {
            ctx.shadowColor = this.colors.accent;
            ctx.shadowBlur = 15 + Math.sin(pulsePhase) * 5;
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        ctx.restore();

        if (label) {
            ctx.fillStyle = this.colors.text;
            ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, x, y);
        }
    },

    drawConnection(ctx, x1, y1, x2, y2, weight = 1, options = {}) {
        const { animated = false, phase = 0, showWeight = false } = options;
        const isPositive = weight >= 0;
        const absWeight = Math.abs(weight);
        const alpha = 0.2 + absWeight * 0.8;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        const color = isPositive ? this.colors.connectionPos : this.colors.connectionNeg;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1 + absWeight * 3;
        ctx.globalAlpha = alpha;
        ctx.stroke();
        ctx.globalAlpha = 1;

        if (animated) {
            const progress = (phase % 1);
            const px = x1 + (x2 - x1) * progress;
            const py = y1 + (y2 - y1) * progress;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }

        if (showWeight) {
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2 - 10;
            ctx.fillStyle = this.colors.textMuted;
            ctx.font = '11px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(weight.toFixed(2), mx, my);
        }

        ctx.restore();
    },

    // ---- Activation functions ----
    activations: {
        sigmoid: x => 1 / (1 + Math.exp(-x)),
        relu: x => Math.max(0, x),
        tanh: x => Math.tanh(x),
        leakyRelu: x => x > 0 ? x : 0.01 * x,
        gelu: x => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x * x * x))),
        silu: x => x / (1 + Math.exp(-x)),
    },

    // ---- Graph drawing ----
    drawGraph(ctx, x, y, w, h, fn, options = {}) {
        const {
            xRange = [-6, 6],
            yRange = [-1.5, 1.5],
            color = this.colors.accent,
            gridColor = this.colors.border,
            markerX = null,
            label = ''
        } = options;

        const mapX = val => x + ((val - xRange[0]) / (xRange[1] - xRange[0])) * w;
        const mapY = val => y + h - ((val - yRange[0]) / (yRange[1] - yRange[0])) * h;

        ctx.save();

        // Grid
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([4, 4]);

        // Horizontal zero line
        const zeroY = mapY(0);
        ctx.beginPath();
        ctx.moveTo(x, zeroY);
        ctx.lineTo(x + w, zeroY);
        ctx.stroke();

        // Vertical zero line
        const zeroX = mapX(0);
        ctx.beginPath();
        ctx.moveTo(zeroX, y);
        ctx.lineTo(zeroX, y + h);
        ctx.stroke();

        ctx.setLineDash([]);

        // Axes labels
        ctx.fillStyle = this.colors.textMuted;
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(xRange[0], mapX(xRange[0]), zeroY + 16);
        ctx.fillText(xRange[1], mapX(xRange[1]), zeroY + 16);
        ctx.textAlign = 'right';
        ctx.fillText(yRange[1], zeroX - 8, mapY(yRange[1]) + 4);

        // Function curve
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        const steps = 200;
        for (let i = 0; i <= steps; i++) {
            const xVal = xRange[0] + (i / steps) * (xRange[1] - xRange[0]);
            const yVal = fn(xVal);
            const px = mapX(xVal);
            const py = mapY(yVal);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Marker
        if (markerX !== null) {
            const markerY = fn(markerX);
            const px = mapX(markerX);
            const py = mapY(markerY);

            // Vertical dashed line
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = this.colors.textMuted;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px, zeroY);
            ctx.lineTo(px, py);
            ctx.stroke();
            ctx.setLineDash([]);

            // Dot
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Value label
            ctx.fillStyle = this.colors.text;
            ctx.font = '500 12px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`f(${markerX.toFixed(1)}) = ${markerY.toFixed(3)}`, px, py - 14);
        }

        // Title
        if (label) {
            ctx.fillStyle = this.colors.text;
            ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + w / 2, y - 8);
        }

        ctx.restore();
    },

    // ---- Animation loop helper ----
    animate(callback) {
        let running = true;
        let lastTime = 0;

        function loop(time) {
            if (!running) return;
            const dt = (time - lastTime) / 1000;
            lastTime = time;
            callback(dt, time / 1000);
            requestAnimationFrame(loop);
        }

        requestAnimationFrame(loop);
        return { stop: () => { running = false; } };
    }
};
