"""Unit tests for the skill normalization engine."""

import pytest
from app.normalize import normalize, ALIASES


class TestSkillNormalization:
    """Validate alias mapping, case-insensitivity, and fallback formatting."""

    @pytest.mark.parametrize(
        "raw_input,expected_canonical",
        [
            # Web Development aliases
            ("web development", "Web Development"),
            ("web dev", "Web Development"),
            ("web", "Web Development"),
            ("frontend", "Web Development"),
            ("front end", "Web Development"),
            ("html css", "Web Development"),
            ("react", "Web Development"),
            ("reactjs", "Web Development"),
            ("react.js", "Web Development"),
            ("react development", "Web Development"),
            ("javascript", "Web Development"),
            ("js", "Web Development"),
            # Programming aliases
            ("python", "Python"),
            ("python programming", "Python"),
            ("coding", "Python"),
            ("java", "Java"),
            ("c++", "C++"),
            ("cpp", "C++"),
            ("c plus plus", "C++"),
            # Data aliases
            ("data science", "Data Science"),
            ("data analysis", "Data Science"),
            ("analytics", "Data Science"),
            ("sql", "SQL"),
            ("mysql", "SQL"),
            ("postgres", "SQL"),
            ("database", "SQL"),
            # Mobile Development aliases
            ("mobile app development", "Mobile App Development"),
            ("android", "Mobile App Development"),
            ("flutter", "Mobile App Development"),
            # Design aliases
            ("ui design", "UI Design"),
            ("ui/ux", "UI Design"),
            ("ux", "UI Design"),
            ("graphic design", "Graphic Design"),
            # Creative / Media
            ("photography", "Photography"),
            ("video editing", "Video Editing"),
            ("film editing", "Video Editing"),
            # Communication
            ("public speaking", "Public Speaking"),
            ("presentation", "Public Speaking"),
            ("writing", "Writing"),
            ("creative writing", "Writing"),
            # Music
            ("guitar", "Guitar"),
            ("playing guitar", "Guitar"),
            ("piano", "Piano"),
            # Spreadsheets & Languages
            ("excel", "Excel"),
            ("spreadsheets", "Excel"),
            ("spanish", "Spanish"),
        ],
    )
    def test_canonical_aliases(self, raw_input: str, expected_canonical: str):
        assert normalize(raw_input) == expected_canonical

    def test_case_insensitivity(self):
        assert normalize("REACT.JS") == "Web Development"
        assert normalize("pYtHoN") == "Python"
        assert normalize("Data SCIENCE") == "Data Science"
        assert normalize("UI/UX") == "UI Design"

    def test_whitespace_and_padding_tolerance(self):
        assert normalize("   web dev   ") == "Web Development"
        assert normalize("react  .  js") != "Web Development"  # inner dot spacing
        assert normalize("  python   programming  ") == "Python"
        assert normalize("\t\npublic speaking\n\t") == "Public Speaking"

    def test_unregistered_skill_fallback_title_cased(self):
        assert normalize("distributed systems") == "Distributed Systems"
        assert normalize("cloud architecture") == "Cloud Architecture"
        assert normalize("blockchain consensus") == "Blockchain Consensus"
        assert normalize("korean") == "Korean"

    def test_aliases_dictionary_sanity(self):
        assert len(ALIASES) >= 40
        for k, v in ALIASES.items():
            assert k == k.lower().strip()
            assert len(v.strip()) > 0
