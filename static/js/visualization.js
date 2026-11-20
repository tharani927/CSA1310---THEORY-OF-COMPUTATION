/**
 * StackLogic - PDA & Stack Visualization Engine
 * Theory of Computation Capstone Project
 */

class PDAVisualizer {
    constructor(svgElementId, stackTowerId, configDisplayId, stackOpBadgeId) {
        this.svg = document.getElementById(svgElementId);
        this.stackTower = document.getElementById(stackTowerId);
        this.configDisplay = document.getElementById(configDisplayId);
        this.stackOpBadge = document.getElementById(stackOpBadgeId);
    }

    /**
     * Renders the PDA State Transition Diagram as an SVG graph.
     * @param {Object} pda - PDA definition object
     * @param {string|null} activeState - Currently active state
     * @param {Object|null} activeTransition - Currently active transition object
     */
    renderGraph(pda, activeState = null, activeTransition = null) {
        if (!this.svg) return;
        this.svg.innerHTML = ''; // Clear existing SVG contents

        const states = pda.states || [];
        if (states.length === 0) return;

        const width = this.svg.clientWidth || 450;
        const height = this.svg.clientHeight || 320;
        const radius = 24;

        // Calculate node positions in a neat circle or horizontal layout
        const nodePositions = {};
        const count = states.length;
        const centerX = width / 2;
        const centerY = height / 2;
        const layoutRadius = Math.min(width, height) * 0.33;

        states.forEach((st, idx) => {
            if (count === 1) {
                nodePositions[st] = { x: centerX, y: centerY };
            } else if (count <= 3) {
                // Horizontal line layout for small state counts
                const margin = 100;
                const spacing = (width - 2 * margin) / (count - 1);
                nodePositions[st] = { x: margin + idx * spacing, y: centerY };
            } else {
                // Circular layout for > 3 states
                const angle = (2 * Math.PI * idx) / count - Math.PI / 2;
                nodePositions[st] = {
                    x: centerX + layoutRadius * Math.cos(angle),
                    y: centerY + layoutRadius * Math.sin(angle)
                };
            }
        });

        // Group transitions by edge pair (from -> to) for clean labeling
        const edgeGroups = {};
        (pda.transitions || []).forEach(t => {
            const key = `${t.from_state}->${t.to_state}`;
            if (!edgeGroups[key]) edgeGroups[key] = [];
            edgeGroups[key].push(t);
        });

        // 1. Draw SVG Defs (Arrowheads)
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Standard marker
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('viewBox', '0 0 10 10');
        marker.setAttribute('refX', '24');
        marker.setAttribute('refY', '5');
        marker.setAttribute('markerWidth', '8');
        marker.setAttribute('markerHeight', '8');
        marker.setAttribute('orient', 'auto-start-reverse');
        const pathMarker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathMarker.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
        pathMarker.setAttribute('fill', '#64748b');
        marker.appendChild(pathMarker);

        // Active marker
        const activeMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        activeMarker.setAttribute('id', 'arrowhead-active');
        activeMarker.setAttribute('viewBox', '0 0 10 10');
        activeMarker.setAttribute('refX', '24');
        activeMarker.setAttribute('refY', '5');
        activeMarker.setAttribute('markerWidth', '9');
        activeMarker.setAttribute('markerHeight', '9');
        activeMarker.setAttribute('orient', 'auto-start-reverse');
        const activePathMarker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        activePathMarker.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
        activePathMarker.setAttribute('fill', '#10b981');
        activeMarker.appendChild(activePathMarker);

        defs.appendChild(marker);
        defs.appendChild(activeMarker);
        this.svg.appendChild(defs);

        // 2. Draw Edges
        Object.keys(edgeGroups).forEach(key => {
            const rules = edgeGroups[key];
            const [fromSt, toSt] = key.split('->');
            const posFrom = nodePositions[fromSt];
            const posTo = nodePositions[toSt];

            if (!posFrom || !posTo) return;

            const isSelfLoop = fromSt === toSt;
            const isTransitionActive = activeTransition && rules.some(r =>
                r.from_state === activeTransition.from_state &&
                r.input_symbol === activeTransition.input_symbol &&
                r.stack_pop === activeTransition.stack_pop &&
                r.to_state === activeTransition.to_state &&
                r.stack_push === activeTransition.stack_push
            );

            // Format label strings
            const labelText = rules.map(r => `${r.input_symbol}, ${r.stack_pop} → ${r.stack_push}`).join('\n');

            const gEdge = document.createElementNS('http://www.w3.org/2000/svg', 'g');

            if (isSelfLoop) {
                // Draw self-loop arc above node
                const loopX = posFrom.x;
                const loopY = posFrom.y - radius;
                const pathD = `M ${loopX - 12} ${loopY} C ${loopX - 35} ${loopY - 45}, ${loopX + 35} ${loopY - 45}, ${loopX + 12} ${loopY}`;
                
                const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                pathEl.setAttribute('d', pathD);
                pathEl.setAttribute('class', `edge-path ${isTransitionActive ? 'active' : ''}`);
                pathEl.setAttribute('marker-end', isTransitionActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)');
                gEdge.appendChild(pathEl);

                // Label
                this._drawEdgeLabel(gEdge, loopX, loopY - 35, labelText, isTransitionActive);
            } else {
                // Curved or straight edge path between two nodes
                const reverseKey = `${toSt}->${fromSt}`;
                const hasBiDirection = !!edgeGroups[reverseKey];
                const dx = posTo.x - posFrom.x;
                const dy = posTo.y - posFrom.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                let midX = (posFrom.x + posTo.x) / 2;
                let midY = (posFrom.y + posTo.y) / 2;
                let pathD = `M ${posFrom.x} ${posFrom.y} L ${posTo.x} ${posTo.y}`;

                if (hasBiDirection) {
                    // Curve slightly to avoid overlap
                    const normX = -dy / dist;
                    const normY = dx / dist;
                    const curveOffset = 25;
                    midX += normX * curveOffset;
                    midY += normY * curveOffset;
                    pathD = `M ${posFrom.x} ${posFrom.y} Q ${midX} ${midY} ${posTo.x} ${posTo.y}`;
                }

                const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                pathEl.setAttribute('d', pathD);
                pathEl.setAttribute('class', `edge-path ${isTransitionActive ? 'active' : ''}`);
                pathEl.setAttribute('marker-end', isTransitionActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)');
                gEdge.appendChild(pathEl);

                // Label
                this._drawEdgeLabel(gEdge, midX, midY, labelText, isTransitionActive);
            }

            this.svg.appendChild(gEdge);
        });

        // 3. Draw Nodes (States)
        states.forEach(st => {
            const pos = nodePositions[st];
            const isStart = st === pda.start_state;
            const isFinal = (pda.final_states || []).includes(st);
            const isActive = st === activeState;

            const gNode = document.createElementNS('http://www.w3.org/2000/svg', 'g');

            // Start State Indicator Arrow
            if (isStart) {
                const startArrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const startX = pos.x - radius - 25;
                startArrow.setAttribute('d', `M ${startX} ${pos.y} L ${pos.x - radius - 5} ${pos.y}`);
                startArrow.setAttribute('stroke', '#06b6d4');
                startArrow.setAttribute('stroke-width', '3');
                startArrow.setAttribute('marker-end', 'url(#arrowhead-active)');
                gNode.appendChild(startArrow);
            }

            // Outer Circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', pos.x);
            circle.setAttribute('cy', pos.y);
            circle.setAttribute('r', radius);
            circle.setAttribute('class', `node-circle ${isActive ? 'active' : ''} ${isFinal ? 'accepting' : ''}`);
            gNode.appendChild(circle);

            // Double Circle for Accepting/Final State
            if (isFinal) {
                const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                innerCircle.setAttribute('cx', pos.x);
                innerCircle.setAttribute('cy', pos.y);
                innerCircle.setAttribute('r', radius - 5);
                innerCircle.setAttribute('class', `node-circle-inner ${isActive ? 'active' : ''}`);
                gNode.appendChild(innerCircle);
            }

            // Node Text Label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', pos.x);
            text.setAttribute('y', pos.y);
            text.setAttribute('class', 'node-label');
            text.textContent = st;
            gNode.appendChild(text);

            this.svg.appendChild(gNode);
        });
    }

    _drawEdgeLabel(parentGroup, x, y, labelText, isActive) {
        const textLines = labelText.split('\n');
        const lineCount = textLines.length;
        const boxWidth = Math.max(...textLines.map(l => l.length)) * 7 + 14;
        const boxHeight = lineCount * 14 + 6;

        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('x', x - boxWidth / 2);
        bgRect.setAttribute('y', y - boxHeight / 2);
        bgRect.setAttribute('width', boxWidth);
        bgRect.setAttribute('height', boxHeight);
        bgRect.setAttribute('class', `edge-label-bg ${isActive ? 'active' : ''}`);
        parentGroup.appendChild(bgRect);

        textLines.forEach((line, idx) => {
            const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textEl.setAttribute('x', x);
            textEl.setAttribute('y', y - (lineCount - 1) * 7 + idx * 14);
            textEl.setAttribute('class', 'edge-label-text');
            if (isActive) textEl.setAttribute('fill', '#6ee7b7');
            textEl.textContent = line;
            parentGroup.appendChild(textEl);
        });
    }

    /**
     * Renders the dynamic Stack Visualizer tower.
     * @param {Array<string>} stackArray - Stack contents, where index 0 is top
     * @param {string} latestOp - Label of latest stack operation
     */
    renderStack(stackArray = [], latestOp = 'Initial Stack') {
        if (!this.stackTower) return;
        this.stackTower.innerHTML = '';

        if (!stackArray || stackArray.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'stack-cell stack-empty';
            emptyEl.textContent = 'Stack Empty (ε)';
            this.stackTower.appendChild(emptyEl);
        } else {
            stackArray.forEach((sym, idx) => {
                const cell = document.createElement('div');
                cell.className = `stack-cell ${idx === 0 ? 'top-item' : ''}`;
                cell.textContent = sym;
                if (idx === 0) {
                    cell.setAttribute('title', 'TOP of Stack');
                }
                this.stackTower.appendChild(cell);
            });
        }

        if (this.stackOpBadge) {
            this.stackOpBadge.textContent = latestOp;
        }
    }

    /**
     * Updates the top mathematical configuration banner (q, w, γ).
     */
    updateConfig(state = 'q0', inputRem = '', stackArray = []) {
        if (!this.configDisplay) return;
        const stackStr = stackArray.length > 0 ? stackArray.join('') : 'ε';
        const displayRem = inputRem === '' ? 'ε' : `'${inputRem}'`;
        this.configDisplay.textContent = `(${state}, ${displayRem}, ${stackStr})`;
        
        // Add subtle pulse effect
        this.configDisplay.classList.add('glow');
        setTimeout(() => this.configDisplay.classList.remove('glow'), 400);
    }
}
