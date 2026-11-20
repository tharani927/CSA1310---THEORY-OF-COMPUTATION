"""
Pushdown Automaton (PDA) Data Model & Validation Logic
Theory of Computation Capstone Project - StackLogic
"""

class PDA:
    def __init__(self, states, alphabet, stack_alphabet, start_state, initial_stack_symbol, final_states, transitions):
        self.states = [str(s).strip() for s in states if str(s).strip()]
        self.alphabet = [str(a).strip() for a in alphabet if str(a).strip()]
        self.stack_alphabet = [str(s).strip() for s in stack_alphabet if str(s).strip()]
        self.start_state = str(start_state).strip() if start_state else ""
        self.initial_stack_symbol = str(initial_stack_symbol).strip() if initial_stack_symbol else ""
        self.final_states = [str(fs).strip() for fs in final_states if str(fs).strip()]
        self.transitions = self._normalize_transitions(transitions)

    @staticmethod
    def _normalize_transitions(transitions):
        normalized = []
        for t in transitions:
            input_sym = str(t.get("input_symbol", "")).strip()
            if input_sym in ("", "ε", "eps", "epsilon", "Epsilon"):
                input_sym = "ε"

            stack_pop = str(t.get("stack_pop", "")).strip()
            if stack_pop in ("", "ε", "eps", "epsilon", "Epsilon"):
                stack_pop = "ε"

            stack_push = str(t.get("stack_push", "")).strip()
            if stack_push in ("", "ε", "eps", "epsilon", "Epsilon"):
                stack_push = "ε"

            normalized.append({
                "from_state": str(t.get("from_state", "")).strip(),
                "input_symbol": input_sym,
                "stack_pop": stack_pop,
                "to_state": str(t.get("to_state", "")).strip(),
                "stack_push": stack_push
            })
        return normalized

    def validate(self):
        """
        Validates the PDA definition for college/academic correctness.
        Returns a tuple: (is_valid: bool, errors: list[str])
        """
        errors = []

        # 1. States validation
        if not self.states:
            errors.append("States set cannot be empty. Please define at least one state (e.g., q0).")
        else:
            if len(self.states) != len(set(self.states)):
                errors.append("Duplicate state names detected in state list.")

        # 2. Start state validation
        if not self.start_state:
            errors.append("Start state is missing.")
        elif self.start_state not in self.states:
            errors.append(f"Start state '{self.start_state}' is not in the set of defined states.")

        # 3. Initial stack symbol validation
        if not self.initial_stack_symbol:
            errors.append("Initial stack symbol is missing.")
        elif self.stack_alphabet and self.initial_stack_symbol not in self.stack_alphabet:
            errors.append(f"Initial stack symbol '{self.initial_stack_symbol}' is not in the stack alphabet.")

        # 4. Final states validation
        if not self.final_states:
            errors.append("At least one accepting/final state must be defined.")
        else:
            for fs in self.final_states:
                if fs not in self.states:
                    errors.append(f"Final state '{fs}' is not in the set of defined states.")

        # 5. Transition rules validation
        for i, t in enumerate(self.transitions, 1):
            from_s = t["from_state"]
            to_s = t["to_state"]
            in_sym = t["input_symbol"]
            st_pop = t["stack_pop"]
            st_push = t["stack_push"]

            if from_s not in self.states:
                errors.append(f"Transition #{i}: 'From State' ('{from_s}') is not in defined states.")
            if to_s not in self.states:
                errors.append(f"Transition #{i}: 'To State' ('{to_s}') is not in defined states.")

            if in_sym != "ε" and in_sym not in self.alphabet:
                errors.append(f"Transition #{i}: Input symbol '{in_sym}' is not in the input alphabet.")

            if st_pop != "ε" and st_pop not in self.stack_alphabet:
                errors.append(f"Transition #{i}: Stack pop symbol '{st_pop}' is not in the stack alphabet.")

            if st_push != "ε":
                for char in st_push:
                    if char not in self.stack_alphabet:
                        errors.append(f"Transition #{i}: Stack push symbol '{char}' in '{st_push}' is not in the stack alphabet.")

        return len(errors) == 0, errors

    def to_dict(self):
        return {
            "states": self.states,
            "alphabet": self.alphabet,
            "stack_alphabet": self.stack_alphabet,
            "start_state": self.start_state,
            "initial_stack_symbol": self.initial_stack_symbol,
            "final_states": self.final_states,
            "transitions": self.transitions
        }
