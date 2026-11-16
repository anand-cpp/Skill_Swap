"""Unit tests for the 3-person circular exchange cycle detection topology."""

import pytest
from app.matching import find_cycles


class TestCycleDetection:
    """Validate 3-person closed loops, participant uniqueness, and directed legs."""

    def test_student_15_neha_has_3_person_cycle(self):
        # Neha Kapoor (ID 15) -> Priya Reddy (ID 17) -> Omar Sheikh (ID 16) -> Neha Kapoor
        cycles = find_cycles(15)
        assert len(cycles) == 1

        cycle = cycles[0]
        assert "exchange" in cycle
        assert "participants" in cycle

        participants = cycle["participants"]
        assert len(participants) == 3
        participant_ids = [p["id"] for p in participants]
        assert 15 in participant_ids
        assert 16 in participant_ids
        assert 17 in participant_ids

        # Ensure all participants in the cycle are distinct
        assert len(set(participant_ids)) == 3

    def test_cycle_legs_form_continuous_closed_loop(self):
        cycles = find_cycles(15)
        cycle = cycles[0]
        exchanges = cycle["exchange"]
        assert len(exchanges) == 3

        # Legs: [A->B, B->C, C->A]
        leg1, leg2, leg3 = exchanges[0], exchanges[1], exchanges[2]
        assert leg1["from"] == "You"
        assert leg1["to"] == leg2["from"]
        assert leg2["to"] == leg3["from"]
        assert leg3["to"] == "You"

        # Every leg must specify a valid skill transfer
        assert all(len(leg["skill"]) > 0 for leg in exchanges)

    def test_student_18_has_no_cycles(self):
        cycles = find_cycles(18)
        assert cycles == []

    def test_student_with_invalid_id_returns_empty_cycles(self):
        cycles = find_cycles(999999)
        assert cycles == []
