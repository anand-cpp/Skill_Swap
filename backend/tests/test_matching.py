"""Unit tests for the reciprocal skill matching algorithm."""

import pytest
from app.matching import match_student


class TestMatchingEngine:
    """Validate mutual swaps, relevant inquiries, scoring, and ranking rules."""

    def test_student_1_riya_has_mutual_matches(self):
        # Riya Sharma: Teaches Python (expert), Public Speaking (expert)
        # Wants Web Development (beginner), Guitar (beginner)
        matches = match_student(1)
        assert len(matches) > 0
        mutuals = [m for m in matches if m["type"] == "MUTUAL"]
        assert len(mutuals) >= 3

        # Highest scored mutual matches come first
        assert matches[0]["type"] == "MUTUAL"
        for m in matches:
            assert "peer" in m
            assert "score" in m
            assert "give" in m
            assert "get" in m
            assert "checks" in m
            assert "reasons" in m
            # Scoring ordering check: mutual matches precede relevant matches
            if m["type"] == "MUTUAL":
                assert len(m["give"]) > 0
                assert len(m["get"]) > 0
                assert "Perfect reciprocal exchange" in m["checks"]

    def test_student_10_aditya_matches_meera(self):
        # Aditya Joshi: Teaches Data Science, Wants UI Design
        # Meera Krishnan: Teaches UI Design, Wants Data Science
        matches = match_student(10)
        mutuals = [m for m in matches if m["type"] == "MUTUAL"]
        assert len(mutuals) == 1
        top_match = mutuals[0]
        assert top_match["peer"]["name"] == "Meera Krishnan"
        assert any(g["name"] == "UI Design" for g in top_match["give"])
        assert any(g["name"] == "Data Science" for g in top_match["get"])

    def test_student_18_isha_has_honest_empty_matches(self):
        # Isha Kulkarni: Teaches Ancient History / Archaeology, Wants Philosophy
        # Network has no complementary pairings for this niche
        matches = match_student(18)
        assert matches == []

    def test_ranking_sort_order(self):
        matches = match_student(1)
        # Verify strict ordering: all MUTUAL first, then RELEVANT; within each, descending score
        seen_relevant = False
        last_score = float("inf")
        for m in matches:
            if m["type"] == "MUTUAL":
                assert not seen_relevant, "MUTUAL match appeared after RELEVANT match"
            elif m["type"] == "RELEVANT":
                if not seen_relevant:
                    seen_relevant = True
                    last_score = float("inf")
            assert m["score"] <= last_score, "Matches not sorted in descending score order"
            last_score = m["score"]
