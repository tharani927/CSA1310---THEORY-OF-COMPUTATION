"""
Pushdown Automata (PDA) Simulation Engine
Theory of Computation Capstone Project - StackLogic
"""

from collections import deque
from backend.pda import PDA

class PDASimulator:
    MAX_STEPS = 1000  # Safeguard against infinite epsilon loops

    def __init__(self, pda: PDA):
        self.pda = pda

    def simulate(self, input_string: str):
        """
        Executes the PDA simulation on an input string.
        Returns a detailed simulation result dictionary containing:
        - is_accepted: bool
        - message: detailed explanation
        - trace: list of step dictionaries
        - total_steps: int
        """
        # Validate PDA first
        is_valid, validation_errors = self.pda.validate()
        if not is_valid:
            return {
                "is_accepted": False,
                "message": "PDA Definition Error: " + "; ".join(validation_errors),
                "trace": [],
                "total_steps": 0
            }

        # Check input symbols against alphabet
        for char in input_string:
            if char not in self.pda.alphabet:
                return {
                    "is_accepted": False,
                    "message": f"Input symbol '{char}' is not in the defined input alphabet {self.pda.alphabet}.",
                    "trace": [],
                    "total_steps": 0
                }

        initial_stack = [self.pda.initial_stack_symbol] if self.pda.initial_stack_symbol else []
        
        # We will use BFS to find an accepting trace if available, or the deepest trace if rejected.
        # Queue item format: (current_state, remaining_input, consumed_input, stack_list, path_steps, visited_configs)
        
        start_node = {
            "state": self.pda.start_state,
            "remaining": input_string,
            "consumed": "",
            "stack": list(initial_stack),
            "trace": [{
                "step": 0,
                "state": self.pda.start_state,
                "read": "-",
                "consumed": "",
                "remaining": input_string,
                "stack_before": list(initial_stack),
                "stack_after": list(initial_stack),
                "transition": None,
                "stack_action": "Initial State",
                "config": f"({self.pda.start_state}, '{input_string}', {''.join(initial_stack) or 'ε'})"
            }],
            "visited": set([(self.pda.start_state, input_string, tuple(initial_stack))])
        }

        # Check if initial configuration is already accepting (e.g. empty string on accepting start state)
        if not input_string and self.pda.start_state in self.pda.final_states:
            return {
                "is_accepted": True,
                "message": f"✓ ACCEPTED: Empty input provided and start state '{self.pda.start_state}' is a final state.",
                "trace": start_node["trace"],
                "total_steps": 0
            }

        queue = deque([start_node])
        longest_trace_node = start_node
        step_limit_reached = False

        step_counter = 0

        while queue:
            step_counter += 1
            if step_counter > self.MAX_STEPS:
                step_limit_reached = True
                break

            curr = queue.popleft()
            curr_state = curr["state"]
            curr_rem = curr["remaining"]
            curr_cons = curr["consumed"]
            curr_stack = curr["stack"]
            curr_trace = curr["trace"]
            curr_visited = curr["visited"]

            # Check acceptance condition
            if curr_rem == "" and curr_state in self.pda.final_states:
                return {
                    "is_accepted": True,
                    "message": f"✓ ACCEPTED: Entire input consumed successfully and PDA reached final state '{curr_state}'.",
                    "trace": curr_trace,
                    "total_steps": len(curr_trace) - 1
                }

            # Update longest path candidate for feedback
            if len(curr_trace) > len(longest_trace_node["trace"]):
                longest_trace_node = curr

            # Find applicable transitions
            top_stack_symbol = curr_stack[0] if curr_stack else None

            applicable_transitions = []
            for t in self.pda.transitions:
                if t["from_state"] != curr_state:
                    continue

                # Check stack pop matching
                pop_sym = t["stack_pop"]
                if pop_sym != "ε" and (top_stack_symbol is None or top_stack_symbol != pop_sym):
                    continue

                # Check input matching
                inp_sym = t["input_symbol"]
                if inp_sym != "ε":
                    if not curr_rem or curr_rem[0] != inp_sym:
                        continue

                applicable_transitions.append(t)

            for t in applicable_transitions:
                next_state = t["to_state"]
                inp_sym = t["input_symbol"]
                pop_sym = t["stack_pop"]
                push_sym = t["stack_push"]

                # Next remaining input & consumed
                if inp_sym == "ε":
                    next_rem = curr_rem
                    next_cons = curr_cons
                    read_char = "ε"
                else:
                    next_rem = curr_rem[1:]
                    next_cons = curr_cons + inp_sym
                    read_char = inp_sym

                # Next stack
                next_stack = list(curr_stack)
                if pop_sym != "ε":
                    if next_stack:
                        next_stack.pop(0)

                if push_sym != "ε":
                    # Push symbols onto stack (first symbol of push_sym becomes top)
                    next_stack = list(push_sym) + next_stack

                # Determine stack action label
                if pop_sym == "ε" and push_sym == "ε":
                    action_label = "No Operation"
                elif pop_sym != "ε" and push_sym == "ε":
                    action_label = f"Pop '{pop_sym}'"
                elif pop_sym == "ε" and push_sym != "ε":
                    action_label = f"Push '{push_sym}'"
                elif pop_sym == push_sym:
                    action_label = "No Stack Change"
                else:
                    action_label = f"Replace '{pop_sym}' with '{push_sym}'"

                step_num = len(curr_trace)
                stack_str = "".join(next_stack) if next_stack else "ε"
                config_str = f"({next_state}, '{next_rem}', {stack_str})"

                step_entry = {
                    "step": step_num,
                    "state": next_state,
                    "read": read_char,
                    "consumed": next_cons,
                    "remaining": next_rem,
                    "stack_before": list(curr_stack),
                    "stack_after": list(next_stack),
                    "transition": t,
                    "stack_action": action_label,
                    "config": config_str
                }

                config_key = (next_state, next_rem, tuple(next_stack))
                if config_key in curr_visited:
                    # Prevent circular loops in same path branch
                    continue

                new_visited = set(curr_visited)
                new_visited.add(config_key)

                new_node = {
                    "state": next_state,
                    "remaining": next_rem,
                    "consumed": next_cons,
                    "stack": next_stack,
                    "trace": curr_trace + [step_entry],
                    "visited": new_visited
                }

                queue.append(new_node)

        # If loop limit reached
        if step_limit_reached:
            return {
                "is_accepted": False,
                "message": f"✗ REJECTED: Simulation stopped because maximum step limit ({self.MAX_STEPS} steps) was reached (possible infinite loop).",
                "trace": longest_trace_node["trace"],
                "total_steps": len(longest_trace_node["trace"]) - 1
            }

        # If queue empty and no accepting state reached
        last_step = longest_trace_node["trace"][-1]
        last_state = last_step["state"]
        last_rem = last_step["remaining"]

        if last_rem != "":
            reason = f"No valid transition exists in state '{last_state}' for remaining input '{last_rem}'."
        elif last_state not in self.pda.final_states:
            reason = f"Input consumed fully, but PDA stopped in state '{last_state}', which is not a final state (Accepting states: {self.pda.final_states})."
        else:
            reason = "No valid transition path leads to acceptance."

        return {
            "is_accepted": False,
            "message": f"✗ REJECTED: {reason}",
            "trace": longest_trace_node["trace"],
            "total_steps": len(longest_trace_node["trace"]) - 1
        }
