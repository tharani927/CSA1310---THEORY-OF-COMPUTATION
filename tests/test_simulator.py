"""
Unit Tests for StackLogic Pushdown Automata Simulation Engine & Validation
"""

import unittest
import json
import os
from backend.pda import PDA
from backend.simulator import PDASimulator

class TestPDASimulator(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        examples_path = os.path.join(os.path.dirname(__file__), "..", "data", "examples.json")
        with open(examples_path, "r", encoding="utf-8") as f:
            cls.examples = json.load(f)

    def test_pda_validation_valid(self):
        ex = self.examples["anbn"]
        pda = PDA(
            states=ex["states"],
            alphabet=ex["alphabet"],
            stack_alphabet=ex["stack_alphabet"],
            start_state=ex["start_state"],
            initial_stack_symbol=ex["initial_stack_symbol"],
            final_states=ex["final_states"],
            transitions=ex["transitions"]
        )
        is_valid, errors = pda.validate()
        self.assertTrue(is_valid, f"Validation failed with errors: {errors}")
        self.assertEqual(len(errors), 0)

    def test_pda_validation_invalid_start_state(self):
        pda = PDA(
            states=["q0", "q1"],
            alphabet=["a"],
            stack_alphabet=["Z"],
            start_state="q99",  # Invalid
            initial_stack_symbol="Z",
            final_states=["q1"],
            transitions=[]
        )
        is_valid, errors = pda.validate()
        self.assertFalse(is_valid)
        self.assertIn("Start state 'q99' is not in the set of defined states.", errors)

    def test_anbn_language_accepted(self):
        ex = self.examples["anbn"]
        pda = PDA(
            states=ex["states"],
            alphabet=ex["alphabet"],
            stack_alphabet=ex["stack_alphabet"],
            start_state=ex["start_state"],
            initial_stack_symbol=ex["initial_stack_symbol"],
            final_states=ex["final_states"],
            transitions=ex["transitions"]
        )
        sim = PDASimulator(pda)

        accepted_test_cases = ["", "ab", "aabb", "aaabbb"]
        for test_str in accepted_test_cases:
            res = sim.simulate(test_str)
            self.assertTrue(res["is_accepted"], f"Expected '{test_str}' to be ACCEPTED, got REJECTED. Message: {res['message']}")

    def test_anbn_language_rejected(self):
        ex = self.examples["anbn"]
        pda = PDA(
            states=ex["states"],
            alphabet=ex["alphabet"],
            stack_alphabet=ex["stack_alphabet"],
            start_state=ex["start_state"],
            initial_stack_symbol=ex["initial_stack_symbol"],
            final_states=ex["final_states"],
            transitions=ex["transitions"]
        )
        sim = PDASimulator(pda)

        rejected_test_cases = ["aab", "abb", "ba"]
        for test_str in rejected_test_cases:
            res = sim.simulate(test_str)
            self.assertFalse(res["is_accepted"], f"Expected '{test_str}' to be REJECTED, got ACCEPTED.")

    def test_wcwr_language_accepted(self):
        ex = self.examples["wcwr"]
        pda = PDA(
            states=ex["states"],
            alphabet=ex["alphabet"],
            stack_alphabet=ex["stack_alphabet"],
            start_state=ex["start_state"],
            initial_stack_symbol=ex["initial_stack_symbol"],
            final_states=ex["final_states"],
            transitions=ex["transitions"]
        )
        sim = PDASimulator(pda)

        accepted = ["c", "aca", "bcb", "abcba"]
        for test_str in accepted:
            res = sim.simulate(test_str)
            self.assertTrue(res["is_accepted"], f"Expected '{test_str}' to be ACCEPTED. Message: {res['message']}")

    def test_wcwr_language_rejected(self):
        ex = self.examples["wcwr"]
        pda = PDA(
            states=ex["states"],
            alphabet=ex["alphabet"],
            stack_alphabet=ex["stack_alphabet"],
            start_state=ex["start_state"],
            initial_stack_symbol=ex["initial_stack_symbol"],
            final_states=ex["final_states"],
            transitions=ex["transitions"]
        )
        sim = PDASimulator(pda)

        rejected = ["ab", "acb", "abca"]
        for test_str in rejected:
            res = sim.simulate(test_str)
            self.assertFalse(res["is_accepted"], f"Expected '{test_str}' to be REJECTED.")

    def test_balanced_parentheses_accepted(self):
        ex = self.examples["parentheses"]
        pda = PDA(
            states=ex["states"],
            alphabet=ex["alphabet"],
            stack_alphabet=ex["stack_alphabet"],
            start_state=ex["start_state"],
            initial_stack_symbol=ex["initial_stack_symbol"],
            final_states=ex["final_states"],
            transitions=ex["transitions"]
        )
        sim = PDASimulator(pda)

        accepted = ["()", "(())", "()()", "((()))"]
        for test_str in accepted:
            res = sim.simulate(test_str)
            self.assertTrue(res["is_accepted"], f"Expected '{test_str}' to be ACCEPTED. Message: {res['message']}")

    def test_balanced_parentheses_rejected(self):
        ex = self.examples["parentheses"]
        pda = PDA(
            states=ex["states"],
            alphabet=ex["alphabet"],
            stack_alphabet=ex["stack_alphabet"],
            start_state=ex["start_state"],
            initial_stack_symbol=ex["initial_stack_symbol"],
            final_states=ex["final_states"],
            transitions=ex["transitions"]
        )
        sim = PDASimulator(pda)

        rejected = ["(", ")", "())", "(()"]
        for test_str in rejected:
            res = sim.simulate(test_str)
            self.assertFalse(res["is_accepted"], f"Expected '{test_str}' to be REJECTED.")

if __name__ == "__main__":
    unittest.main()
