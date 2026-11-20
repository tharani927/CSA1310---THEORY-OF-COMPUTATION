/**
 * StackLogic - Main Application Controller
 * Theory of Computation Capstone Project
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Visualizer & Simulator Instances
    const visualizer = new PDAVisualizer('pdaSvg', 'stackTower', 'currentConfigDisplay', 'latestStackOpBadge');
    const simulator = new ClientPDASimulator(visualizer);

    // 2. DOM Elements References
    const presetSelect = document.getElementById('presetSelect');
    const resetAppBtn = document.getElementById('resetAppBtn');
    const validatePdaBtn = document.getElementById('validatePdaBtn');
    const validationAlert = document.getElementById('validationAlert');

    const statesInput = document.getElementById('statesInput');
    const alphabetInput = document.getElementById('alphabetInput');
    const stackAlphabetInput = document.getElementById('stackAlphabetInput');
    const startStateInput = document.getElementById('startStateInput');
    const startSymbolInput = document.getElementById('startSymbolInput');
    const finalStatesInput = document.getElementById('finalStatesInput');

    const transitionTableBody = document.getElementById('transitionTableBody');
    const addTransitionRowBtn = document.getElementById('addTransitionRowBtn');
    const addEpsilonBtn = document.getElementById('addEpsilonBtn');

    const inputString = document.getElementById('inputString');
    const clearInputBtn = document.getElementById('clearInputBtn');
    const sampleInputsList = document.getElementById('sampleInputsList');

    const runSimBtn = document.getElementById('runSimBtn');
    const stepSimBtn = document.getElementById('stepSimBtn');
    const pauseSimBtn = document.getElementById('pauseSimBtn');
    const resetSimBtn = document.getElementById('resetSimBtn');
    const speedSlider = document.getElementById('speedSlider');
    const speedVal = document.getElementById('speedVal');

    const simStatusBadge = document.getElementById('simStatusBadge');
    const resultBanner = document.getElementById('resultBanner');
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');

    const stepCounterPill = document.getElementById('stepCounterPill');
    const clearTraceBtn = document.getElementById('clearTraceBtn');
    const traceTableBody = document.getElementById('traceTableBody');

    let pdaPresets = {};

    // 3. Load Presets from API
    async function loadPresets() {
        try {
            const res = await fetch('/api/examples');
            const data = await res.json();
            if (data.success) {
                pdaPresets = data.examples;
                // Auto load 'anbn' preset on initial load
                if (pdaPresets.anbn) {
                    presetSelect.value = 'anbn';
                    loadPresetIntoForm('anbn');
                }
            }
        } catch (err) {
            console.error("Error loading PDA presets:", err);
        }
    }

    function loadPresetIntoForm(presetKey) {
        const preset = pdaPresets[presetKey];
        if (!preset) return;

        statesInput.value = (preset.states || []).join(', ');
        alphabetInput.value = (preset.alphabet || []).join(', ');
        stackAlphabetInput.value = (preset.stack_alphabet || []).join(', ');
        startStateInput.value = preset.start_state || '';
        startSymbolInput.value = preset.initial_stack_symbol || '';
        finalStatesInput.value = (preset.final_states || []).join(', ');

        // Render transition table rows
        transitionTableBody.innerHTML = '';
        (preset.transitions || []).forEach(t => {
            addTransitionRow(t.from_state, t.input_symbol, t.stack_pop, t.to_state, t.stack_push);
        });

        // Render sample input pills
        renderSampleInputs(preset.sample_inputs || [], preset.sample_rejects || []);

        // Default input
        inputString.value = preset.sample_inputs && preset.sample_inputs.length > 1 ? preset.sample_inputs[1] : (preset.sample_inputs[0] || 'ab');

        // Sync & render
        readPdaFromFormAndSync();
    }

    function renderSampleInputs(acceptedSamples, rejectedSamples) {
        sampleInputsList.innerHTML = '';
        
        acceptedSamples.forEach(str => {
            const pill = document.createElement('span');
            pill.className = 'sample-pill';
            pill.textContent = str === '' ? 'ε (empty)' : str;
            pill.title = 'Sample Accepted Input';
            pill.addEventListener('click', () => {
                inputString.value = str;
                resetSimulation();
            });
            sampleInputsList.appendChild(pill);
        });

        rejectedSamples.forEach(str => {
            const pill = document.createElement('span');
            pill.className = 'sample-pill';
            pill.style.borderColor = '#ef4444';
            pill.style.color = '#fca5a5';
            pill.textContent = str;
            pill.title = 'Sample Rejected Input';
            pill.addEventListener('click', () => {
                inputString.value = str;
                resetSimulation();
            });
            sampleInputsList.appendChild(pill);
        });
    }

    // 4. Transition Table Helper Functions
    function addTransitionRow(fromState = '', inputSymbol = '', stackPop = '', toState = '', stackPush = '') {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" class="t-from" value="${fromState}" placeholder="q0"></td>
            <td><input type="text" class="t-input" value="${inputSymbol}" placeholder="a or ε"></td>
            <td><input type="text" class="t-pop" value="${stackPop}" placeholder="Z or ε"></td>
            <td><input type="text" class="t-to" value="${toState}" placeholder="q0"></td>
            <td><input type="text" class="t-push" value="${stackPush}" placeholder="AZ or ε"></td>
            <td>
                <button class="btn btn-xs btn-danger delete-row-btn" title="Remove Transition">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;

        row.querySelector('.delete-row-btn').addEventListener('click', () => {
            row.remove();
            readPdaFromFormAndSync();
        });

        row.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', () => readPdaFromFormAndSync());
        });

        transitionTableBody.appendChild(row);
    }

    function getTransitionsFromTable() {
        const rows = transitionTableBody.querySelectorAll('tr');
        const transitions = [];
        rows.forEach(row => {
            const fromState = row.querySelector('.t-from')?.value.trim();
            const inputSymbol = row.querySelector('.t-input')?.value.trim();
            const stackPop = row.querySelector('.t-pop')?.value.trim();
            const toState = row.querySelector('.t-to')?.value.trim();
            const stackPush = row.querySelector('.t-push')?.value.trim();

            if (fromState || toState) {
                transitions.append || transitions.push({
                    from_state: fromState || '',
                    input_symbol: inputSymbol || 'ε',
                    stack_pop: stackPop || 'ε',
                    to_state: toState || '',
                    stack_push: stackPush || 'ε'
                });
            }
        });
        return transitions;
    }

    function getPdaFromForm() {
        return {
            states: statesInput.value.split(',').map(s => s.trim()).filter(Boolean),
            alphabet: alphabetInput.value.split(',').map(s => s.trim()).filter(Boolean),
            stack_alphabet: stackAlphabetInput.value.split(',').map(s => s.trim()).filter(Boolean),
            start_state: startStateInput.value.trim(),
            initial_stack_symbol: startSymbolInput.value.trim(),
            final_states: finalStatesInput.value.split(',').map(s => s.trim()).filter(Boolean),
            transitions: getTransitionsFromTable()
        };
    }

    function readPdaFromFormAndSync() {
        const pda = getPdaFromForm();
        simulator.setPda(pda);
        resetSimulation();
    }

    // 5. Validation API Sync
    async function validatePdaForm() {
        const pda = getPdaFromForm();
        try {
            const res = await fetch('/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pda)
            });
            const data = await res.json();
            validationAlert.className = 'alert-box';
            if (data.is_valid) {
                validationAlert.classList.add('alert-success');
                validationAlert.innerHTML = '<strong><i class="fa-solid fa-circle-check"></i> Valid PDA Definition!</strong> Ready for simulation.';
            } else {
                validationAlert.classList.add('alert-error');
                validationAlert.innerHTML = '<strong><i class="fa-solid fa-triangle-exclamation"></i> PDA Definition Issues:</strong><br>&bull; ' + data.errors.join('<br>&bull; ');
            }
        } catch (err) {
            console.error("Validation failed:", err);
        }
    }

    // 6. Trace Log Table Updates
    function appendTraceStepToTable(stepData, index) {
        if (index === 0) {
            traceTableBody.innerHTML = '';
        }

        const tr = document.createElement('tr');
        tr.id = `trace-step-${index}`;
        
        const transStr = stepData.transition
            ? `${stepData.transition.from_state} -- ${stepData.transition.input_symbol}, ${stepData.transition.stack_pop} → ${stepData.transition.stack_push} --> ${stepData.transition.to_state}`
            : 'Initial Configuration';

        tr.innerHTML = `
            <td><strong>#${stepData.step}</strong></td>
            <td><span class="badge badge-info">${stepData.state}</span></td>
            <td><code>${stepData.read}</code></td>
            <td><code>${stepData.consumed || 'ε'}</code></td>
            <td><code>${stepData.remaining === '' ? 'ε' : stepData.remaining}</code></td>
            <td><code>${stepData.stack_before.join('') || 'ε'}</code></td>
            <td><code>${transStr}</code></td>
            <td><span class="badge">${stepData.stack_action}</span></td>
            <td><code>${stepData.stack_after.join('') || 'ε'}</code></td>
            <td><strong>${stepData.config}</strong></td>
        `;

        traceTableBody.appendChild(tr);

        // Highlight active step row
        traceTableBody.querySelectorAll('tr').forEach(r => r.classList.remove('active-trace-row'));
        tr.classList.add('active-trace-row');
        tr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        stepCounterPill.textContent = `Step: ${stepData.step}`;
    }

    function resetSimulation() {
        simulator.reset();
        resultBanner.className = 'result-banner result-hidden';
        traceTableBody.innerHTML = '<tr class="empty-row"><td colspan="10">No simulation steps recorded yet. Click <strong>Step</strong> or <strong>Auto Run</strong> to start.</td></tr>';
        stepCounterPill.textContent = 'Step: 0';
        pauseSimBtn.disabled = true;
        runSimBtn.disabled = false;
        stepSimBtn.disabled = false;
        updateStatusBadge('IDLE');
    }

    function updateStatusBadge(status) {
        simStatusBadge.className = 'config-status-badge';
        if (status === 'RUNNING') {
            simStatusBadge.classList.add('status-running');
            simStatusBadge.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> RUNNING';
        } else if (status === 'ACCEPTED') {
            simStatusBadge.classList.add('status-accepted');
            simStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> ACCEPTED';
        } else if (status === 'REJECTED') {
            simStatusBadge.classList.add('status-rejected');
            simStatusBadge.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> REJECTED';
        } else {
            simStatusBadge.classList.add('status-idle');
            simStatusBadge.innerHTML = '<i class="fa-solid fa-circle-stop"></i> IDLE';
        }
    }

    function displayResultBanner(result) {
        resultBanner.className = 'result-banner';
        if (result.is_accepted) {
            resultBanner.classList.add('result-accepted');
            resultIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
            resultTitle.textContent = '✓ STRING ACCEPTED';
            resultMessage.textContent = result.message;
            updateStatusBadge('ACCEPTED');
        } else {
            resultBanner.classList.add('result-rejected');
            resultIcon.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
            resultTitle.textContent = '✗ STRING REJECTED';
            resultMessage.textContent = result.message;
            updateStatusBadge('REJECTED');
        }
    }

    // 7. Event Listener Registrations
    presetSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            loadPresetIntoForm(e.target.value);
        }
    });

    resetAppBtn.addEventListener('click', () => {
        if (presetSelect.value) {
            loadPresetIntoForm(presetSelect.value);
        } else {
            readPdaFromFormAndSync();
        }
    });

    validatePdaBtn.addEventListener('click', validatePdaForm);

    addTransitionRowBtn.addEventListener('click', () => {
        addTransitionRow();
        readPdaFromFormAndSync();
    });

    addEpsilonBtn.addEventListener('click', () => {
        const activeInput = document.activeElement;
        if (activeInput && activeInput.tagName === 'INPUT') {
            activeInput.value += 'ε';
            activeInput.dispatchEvent(new Event('change'));
        } else {
            addTransitionRow('', 'ε', 'ε', '', 'ε');
        }
    });

    clearInputBtn.addEventListener('click', () => {
        inputString.value = '';
        resetSimulation();
    });

    speedSlider.addEventListener('input', (e) => {
        speedVal.textContent = `${e.target.value}ms`;
        if (simulator.isRunning) {
            simulator.autoPlay(parseInt(e.target.value, 10));
        }
    });

    clearTraceBtn.addEventListener('click', () => {
        traceTableBody.innerHTML = '<tr class="empty-row"><td colspan="10">Trace cleared.</td></tr>';
        stepCounterPill.textContent = 'Step: 0';
    });

    // Form Inputs Listener
    [statesInput, alphabetInput, stackAlphabetInput, startStateInput, startSymbolInput, finalStatesInput].forEach(inp => {
        inp.addEventListener('change', readPdaFromFormAndSync);
    });

    // Execution Control Buttons
    stepSimBtn.addEventListener('click', async () => {
        if (!simulator.simulationResult) {
            const inputVal = inputString.value.trim();
            const simRes = await simulator.runSimulation(inputVal);
            if (!simRes.success) {
                alert(simRes.message);
                return;
            }
        } else {
            simulator.stepForward();
        }
    });

    runSimBtn.addEventListener('click', async () => {
        if (!simulator.simulationResult) {
            const inputVal = inputString.value.trim();
            const simRes = await simulator.runSimulation(inputVal);
            if (!simRes.success) {
                alert(simRes.message);
                return;
            }
        }
        
        runSimBtn.disabled = true;
        pauseSimBtn.disabled = false;
        const delay = parseInt(speedSlider.value, 10);
        simulator.autoPlay(delay);
    });

    pauseSimBtn.addEventListener('click', () => {
        simulator.pause();
        runSimBtn.disabled = false;
        pauseSimBtn.disabled = true;
    });

    resetSimBtn.addEventListener('click', resetSimulation);

    // Simulator Hooks
    simulator.onStepChange = (stepData, stepIdx, maxIdx) => {
        appendTraceStepToTable(stepData, stepIdx);
    };

    simulator.onFinish = (result) => {
        runSimBtn.disabled = false;
        pauseSimBtn.disabled = true;
        displayResultBanner(result);
    };

    simulator.onStatusChange = (status) => {
        updateStatusBadge(status);
    };

    // Load presets on startup
    loadPresets();
});
