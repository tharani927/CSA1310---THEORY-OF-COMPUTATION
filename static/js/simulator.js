/**
 * StackLogic - Client-side PDA Simulation Controller
 * Theory of Computation Capstone Project
 */

class ClientPDASimulator {
    constructor(visualizer) {
        this.visualizer = visualizer;
        this.pda = null;
        this.inputString = "";
        this.simulationResult = null;
        this.currentStepIndex = 0;
        this.autoPlayTimer = null;
        this.isRunning = false;
        this.speedMs = 600;

        // Callback hooks
        this.onStepChange = null;
        this.onFinish = null;
        this.onStatusChange = null;
    }

    setPda(pda) {
        this.pda = pda;
        this.reset();
    }

    async runSimulation(inputString, backendApiUrl = '/api/simulate') {
        this.inputString = inputString;
        this.reset();

        if (!this.pda) {
            return { success: false, message: "No PDA defined." };
        }

        try {
            const response = await fetch(backendApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pda: this.pda, input_string: inputString })
            });

            const data = await response.json();
            if (data.success) {
                this.simulationResult = data.result;
                this.currentStepIndex = 0;
                this._renderCurrentStep();
                return { success: true, result: data.result };
            } else {
                return { success: false, message: data.message };
            }
        } catch (err) {
            console.error("Simulation API call failed:", err);
            return { success: false, message: "Network error calling simulation API." };
        }
    }

    stepForward() {
        if (!this.simulationResult || !this.simulationResult.trace) return false;
        
        if (this.currentStepIndex < this.simulationResult.trace.length - 1) {
            this.currentStepIndex++;
            this._renderCurrentStep();

            if (this.currentStepIndex === this.simulationResult.trace.length - 1) {
                this.pause();
                if (this.onFinish) this.onFinish(this.simulationResult);
            }
            return true;
        } else {
            this.pause();
            return false;
        }
    }

    autoPlay(speedMs = 600) {
        this.speedMs = speedMs;
        this.pause(); // Clear existing timer
        this.isRunning = true;
        
        if (this.onStatusChange) this.onStatusChange('RUNNING');

        this.autoPlayTimer = setInterval(() => {
            const stepped = this.stepForward();
            if (!stepped) {
                this.pause();
            }
        }, this.speedMs);
    }

    pause() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
        this.isRunning = false;
        if (this.onStatusChange) this.onStatusChange('PAUSED');
    }

    reset() {
        this.pause();
        this.currentStepIndex = 0;
        this.simulationResult = null;
        if (this.onStatusChange) this.onStatusChange('IDLE');

        if (this.pda) {
            const initialStack = this.pda.initial_stack_symbol ? [this.pda.initial_stack_symbol] : [];
            if (this.visualizer) {
                this.visualizer.renderGraph(this.pda, this.pda.start_state, null);
                this.visualizer.renderStack(initialStack, "Initial Stack");
                this.visualizer.updateConfig(this.pda.start_state, this.inputString, initialStack);
            }
        }
    }

    _renderCurrentStep() {
        if (!this.simulationResult || !this.simulationResult.trace) return;

        const trace = this.simulationResult.trace;
        const currentStep = trace[this.currentStepIndex];

        if (!currentStep) return;

        const activeState = currentStep.state;
        const activeTransition = currentStep.transition;
        const stackAfter = currentStep.stack_after || [];
        const stackAction = currentStep.stack_action || "Step";
        const remInput = currentStep.remaining;

        if (this.visualizer) {
            this.visualizer.renderGraph(this.pda, activeState, activeTransition);
            this.visualizer.renderStack(stackAfter, stackAction);
            this.visualizer.updateConfig(activeState, remInput, stackAfter);
        }

        if (this.onStepChange) {
            this.onStepChange(currentStep, this.currentStepIndex, trace.length - 1);
        }
    }
}
