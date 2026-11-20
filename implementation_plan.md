# Implementation Plan - StackLogic: Pushdown Automata Simulator

Build a complete, functional, beginner-friendly college capstone project titled **StackLogic: Pushdown Automata Simulator** for **Theory of Computation**.

## User Review Required

> [!IMPORTANT]
> - **Technology Stack**: Python 3 + Flask backend, HTML5 + CSS3 + Vanilla JavaScript frontend, SVG for interactive PDA graph visualization, and pure CSS/DOM for stack visualization.
> - **Simulation Engine**: Supports both full-trace auto-run and step-by-step manual execution, handling $\epsilon$-transitions, push/pop/no-change stack operations, non-deterministic path finding, and infinite loop safeguards (max 1000 steps).
> - **Presets Included**:
>   1. $L = \{ a^n b^n \mid n \ge 0 \}$
>   2. $L = \{ w c w^R \mid w \in \{a,b\}^* \}$
>   3. Balanced Parentheses (e.g. `(())`, `()()`)

## Proposed Architecture & Directory Structure

```text
c:\Users\HOME\Desktop\TOC-Capstone Project\
├── app.py                     # Main Flask application entrypoint & REST API endpoints
├── requirements.txt           # Minimal dependencies (Flask)
├── README.md                  # Comprehensive academic & setup documentation
├── backend/
│   ├── __init__.py
│   ├── pda.py                 # PDA data structure & validation logic
│   └── simulator.py           # PDA step & trace simulation engine
├── data/
│   └── examples.json          # Pre-configured PDA presets (a^n b^n, w c w^R, balanced parens)
├── templates/
│   └── index.html             # Single-Page Dashboard layout
├── static/
│   ├── css/
│   │   └── style.css          # Design system, glassmorphism, animated stack & theme styles
│   └── js/
│       ├── app.js             # UI state controller & event bindings
│       ├── simulator.js       # Client-side simulation runner (step/run logic)
│       └── visualization.js   # SVG graph renderer & interactive stack visualizer
└── tests/
    ├── __init__.py
    └── test_simulator.py      # Python unittest suite for PDA engine & backend routes
```

---

## Detailed Component Specifications

### 1. Backend Engine (`backend/pda.py` & `backend/simulator.py`)
- **PDA Schema**:
  - `states`: List of state strings (e.g., `["q0", "q1", "q2"]`)
  - `alphabet`: List of input symbols (e.g., `["a", "b"]`)
  - `stack_alphabet`: List of stack symbols (e.g., `["Z", "A"]`)
  - `start_state`: Initial state string (e.g., `"q0"`)
  - `initial_stack_symbol`: Initial stack symbol string (e.g., `"Z"`)
  - `final_states`: List of accepting state strings (e.g., `["q2"]`)
  - `transitions`: List of rule objects:
    - `{ from_state, input_symbol, stack_pop, to_state, stack_push }`
    - Symbol `ε` (or empty string `""`) represents epsilon.
- **Simulator Features**:
  - Validates configuration (checks for unknown states, invalid symbols, stack underflow, loops).
  - Maintains configuration tuples `(state, input_remaining, stack_contents)`.
  - Determines acceptance by final state upon consuming input.
  - Generates step-by-step trace steps with step number, current state, read symbol, stack before, applied transition, stack after, and configuration formatted as `(q, input_remaining, stack)`.

### 2. Frontend Interface (`templates/index.html` & `static/css/style.css`)
- **Dashboard Layout**:
  - Header with title, subtitle, preset dropdown loader, quick-start guide, and theme badge.
  - Main Grid Layout:
    1. **PDA Designer Panel**: Form controls for states, alphabets, start state, initial stack symbol, final states, and interactive Transition Table Editor (Add / Delete rows, Epsilon `ε` inserts).
    2. **Interactive Visualization Panel**:
       - **PDA Graph View**: Dynamic SVG node-link diagram showing state nodes (start indicator, final double-circles), directed edge arrows with transition labels `read, pop → push`, highlighting active state and transition.
       - **Live Stack View**: Vertical stack container displaying stacked symbol blocks, animated TOP marker, push/pop action indicators.
       - **Mathematical Configuration Pill**: Live `(q, remaining_input, stack)` display.
    3. **Simulation Control Panel**: Input string box, Run / Step / Pause / Reset buttons, simulation speed slider, step counter, and result banner (ACCEPTED / REJECTED with detailed explanation).
    4. **Simulation Trace Table**: Step-by-step log table showing step #, current state, read symbol, stack before, transition rule, stack after, and configuration.
    5. **Theory & Educational Panel**: "What is a Pushdown Automaton?" conceptual guide explaining PDA tuples, stack operations, and formal definitions.

### 3. Client Logic (`static/js/app.js`, `simulator.js`, `visualization.js`)
- Handles real-time graph rendering on layout changes or preset selection.
- Step-by-step stepping & automatic play mode with configurable delay.
- Syncs with backend Flask validation & simulation APIs.

---

## Verification Plan

### Automated Tests
- Run Python unit tests: `python -m unittest discover -s tests`
  - Tests PDA validation for missing states / empty definitions.
  - Tests accepted strings for $a^n b^n$ (`""`, `"ab"`, `"aabb"`, `"aaabbb"`).
  - Tests rejected strings for $a^n b^n$ (`"aab"`, `"abb"`, `"ba"`).
  - Tests $w c w^R$ accepted (`"aca"`, `"abcba"`) and rejected (`"acb"`).
  - Tests balanced parens accepted (`"()"`, `"(())"`) and rejected (`"("`, `")"`).

### Manual Verification
- Start Flask app via `python app.py`.
- Open browser locally, test preset loading, transition creation/editing, graph SVG rendering, step-by-step simulation with stack animation, trace log update, and acceptance/rejection banners.

---

## Next Steps Upon Approval
1. Initialize directory structure and create `requirements.txt`.
2. Implement backend modules (`backend/pda.py`, `backend/simulator.py`, `data/examples.json`).
3. Build Flask application (`app.py`).
4. Build frontend single-page interface (`templates/index.html`, `static/css/style.css`).
5. Write JavaScript logic (`visualization.js`, `simulator.js`, `app.js`).
6. Write unit tests in `tests/test_simulator.py` and run verification.
7. Write complete `README.md`.
