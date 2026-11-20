"""
Flask Entrypoint & REST API Server
Theory of Computation Capstone Project - StackLogic: Pushdown Automata Simulator
"""

import os
import json
from flask import Flask, render_template, request, jsonify
from backend.pda import PDA
from backend.simulator import PDASimulator

app = Flask(__name__)

# Path to examples JSON
EXAMPLES_FILE = os.path.join(os.path.dirname(__file__), "data", "examples.json")

def load_examples():
    if os.path.exists(EXAMPLES_FILE):
        with open(EXAMPLES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

@app.route("/")
def index():
    """Serves the Single Page Application dashboard."""
    return render_template("index.html")

@app.route("/api/examples", methods=["GET"])
def get_examples():
    """Returns built-in PDA presets for immediate testing."""
    examples = load_examples()
    return jsonify({"success": True, "examples": examples})

@app.route("/api/validate", methods=["POST"])
def validate_pda():
    """
    Validates a PDA definition sent as JSON.
    Payload format: { states, alphabet, stack_alphabet, start_state, initial_stack_symbol, final_states, transitions }
    """
    data = request.get_json() or {}
    try:
        pda = PDA(
            states=data.get("states", []),
            alphabet=data.get("alphabet", []),
            stack_alphabet=data.get("stack_alphabet", []),
            start_state=data.get("start_state", ""),
            initial_stack_symbol=data.get("initial_stack_symbol", ""),
            final_states=data.get("final_states", []),
            transitions=data.get("transitions", [])
        )
        is_valid, errors = pda.validate()
        return jsonify({
            "success": True,
            "is_valid": is_valid,
            "errors": errors,
            "pda": pda.to_dict()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "is_valid": False,
            "errors": [f"Server validation error: {str(e)}"],
            "pda": None
        }), 400

@app.route("/api/simulate", methods=["POST"])
def simulate():
    """
    Simulates string execution on a given PDA definition.
    Payload format: { pda: {...}, input_string: "..." }
    """
    data = request.get_json() or {}
    pda_data = data.get("pda", {})
    input_string = str(data.get("input_string", ""))

    try:
        pda = PDA(
            states=pda_data.get("states", []),
            alphabet=pda_data.get("alphabet", []),
            stack_alphabet=pda_data.get("stack_alphabet", []),
            start_state=pda_data.get("start_state", ""),
            initial_stack_symbol=pda_data.get("initial_stack_symbol", ""),
            final_states=pda_data.get("final_states", []),
            transitions=pda_data.get("transitions", [])
        )

        simulator = PDASimulator(pda)
        result = simulator.simulate(input_string)

        return jsonify({
            "success": True,
            "result": result
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Simulation execution error: {str(e)}"
        }), 500

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
