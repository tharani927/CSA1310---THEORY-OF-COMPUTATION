# StackLogic: Pushdown Automata Simulator

**StackLogic** is an interactive, beginner-friendly web application designed as a college capstone project for **Theory of Computation**. It provides a graphical simulator for **Pushdown Automata (PDA)**, allowing students to visualize how non-deterministic or deterministic PDAs process input strings using an external stack memory.

---

## 🌟 Features

- **Interactive PDA Designer**: Dynamically define states ($Q$), input alphabet ($\Sigma$), stack alphabet ($\Gamma$), start state ($q_0$), initial stack symbol ($Z_0$), final states ($F$), and transition rules ($\delta$).
- **Transition Table Editor**: Easily add, edit, or delete transition rules, including Epsilon ($\varepsilon$) input or stack transitions.
- **Dynamic State Diagram (SVG)**: Visualizes state circles, start arrows, accepting double-rings, and curved transition edges with read/pop $\rightarrow$ push labels. Automatically highlights active state nodes and active transitions during simulation.
- **Visual Stack Tower**: Animated vertical stack tower showing the TOP element, push/pop operations, and real-time stack content changes.
- **Live Configuration Display**: Always shows the formal theoretical tuple $(q, w, \gamma)$ representing current state $q$, unread input string $w$, and stack content $\gamma$.
- **Step-by-Step & Auto-Run Execution**: Step through PDA computation one transition at a time or run automatically with an adjustable delay slider.
- **Detailed Simulation Trace Log**: Tabular log recording step number, state, read character, remaining input, stack before/after, applied transition, stack action, and mathematical configuration.
- **Academic Result Banner**: Clear **✓ ACCEPTED** or **✗ REJECTED** status banners with formal explanations (e.g. state reached, remaining input, or missing transition).
- **Built-in Presets**:
  - $L = \{ a^n b^n \mid n \ge 0 \}$
  - $L = \{ w c w^R \mid w \in \{a,b\}^* \}$
  - Balanced Parentheses (e.g. `(())`, `()()`)
- **Educational Info Panel**: Student-friendly explanations of 7-tuples, stack operations, DPDA vs NPDA concepts.

---

## 🧠 Theory Behind Pushdown Automata

A **Pushdown Automaton (PDA)** is a finite state machine equipped with an external **Stack Memory** (a Last-In, First-Out data structure). While standard Finite Automata (FA) cannot recognize context-free languages like $a^n b^n$ due to limited memory, a PDA uses its stack to count and match nested or paired symbols.

Formally, a PDA is defined as a 7-tuple:
$$M = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$$

Where:
- **$Q$**: Finite set of states.
- **$\Sigma$**: Input alphabet.
- **$\Gamma$**: Stack alphabet.
- **$\delta$**: Transition function mapping $Q \times (\Sigma \cup \{\varepsilon\}) \times \Gamma \rightarrow P(Q \times \Gamma^*)$.
- **$q_0 \in Q$**: Start state.
- **$Z_0 \in \Gamma$**: Initial stack symbol.
- **$F \subseteq Q$**: Set of final / accepting states.

---

## 🛠️ Technology Stack

- **Backend**: Python 3, Flask (Minimalistic REST API)
- **Frontend**: HTML5, CSS3 (Vanilla Dark Slate Design System), JavaScript (ES6 Modules)
- **Visualization**: Scalable Vector Graphics (SVG) for PDA State Diagrams & HTML5/DOM for Stack Tower
- **Storage**: In-memory / JSON preset configurations (`data/examples.json`)

---

## 🚀 Installation & Setup

1. **Clone or Download the Repository**:
   ```bash
   cd TOC-Capstone-Project
   ```

2. **Install Python Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Application**:
   ```bash
   python app.py
   ```

4. **Access in Browser**:
   Open your browser and navigate to `http://127.0.0.1:5000`.

---

## 📖 How to Use

### 1. Load a Built-in Preset
- Select a language from the **Preset Examples** dropdown at the top right (e.g., $L = \{ a^n b^n \mid n \ge 0 \}$).
- Click on any of the sample input pills (e.g. `aabb`) to auto-fill the input string.

### 2. Define a Custom PDA
- Modify **States** (e.g. `q0, q1, q2`).
- Set **Input Alphabet** (e.g. `a, b`) and **Stack Alphabet** (e.g. `Z, A`).
- Set **Start State** (`q0`), **Initial Stack Symbol** (`Z`), and **Final States** (`q2`).
- Add transitions using the **+ Add Transition** button or click **Insert ε** for epsilon transitions.
- Click **Validate** to check for configuration errors.

### 3. Run & Observe Simulation
- Click **Step** to execute a single step or **Auto Run** for continuous playback.
- Observe:
  - Active highlighted node and transition edge in the **State Transition Diagram**.
  - Current stack top and symbol movements in the **Stack Memory Tower**.
  - Live configuration tuple updating in the top status bar.
  - Complete history in the **Simulation Trace Log**.

---

## 📁 Project Structure

```text
StackLogic/
│
├── app.py                     # Flask application entrypoint & REST API routes
├── requirements.txt           # Minimal Python dependencies
├── README.md                  # Project documentation
│
├── backend/
│   ├── __init__.py
│   ├── pda.py                 # PDA data structure & academic validation logic
│   └── simulator.py           # PDA step-by-step & trace simulation engine
│
├── data/
│   └── examples.json          # Pre-configured PDA presets
│
├── templates/
│   └── index.html             # Single Page Application HTML layout
│
├── static/
│   ├── css/
│   │   └── style.css          # Dark slate design system, graph & stack styling
│   └── js/
│       ├── app.js             # UI Controller & DOM event bindings
│       ├── simulator.js       # Client simulation playback manager
│       └── visualization.js   # SVG state graph & stack tower renderer
│
└── tests/
    ├── __init__.py
    └── test_simulator.py      # Unit tests for PDA simulation engine
```

---

## 🧪 Running Unit Tests

Run the Python test suite to verify the simulation engine across all language presets:

```bash
python -m unittest discover -s tests
```

---

## 🔮 Future Enhancements

- Support for **Acceptance by Empty Stack** ($N(M)$).
- Conversion between Context-Free Grammars (CFG) and PDAs.
- Export simulation trace to PDF or CSV for assignment submission.
- Deterministic PDA (DPDA) vs Non-Deterministic PDA (NPDA) tree branch view.
"# Quantum-Shield---Cryptography" 
