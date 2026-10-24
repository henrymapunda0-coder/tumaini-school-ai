import re
from typing import Any, Dict, List, Optional

from app.config import SCHOOL_INFO


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def is_swahili(text: str) -> bool:
    text = (text or "").lower()
    swahili_markers = [
        "habari", "nisaidie", "tafadhali", "sasa", "shule", "masomo", "mwalimu",
        "nina", "mpango", "kujifunza", "jibu", "eleza", "fafanua", "kitu",
        "darasa", "matokeo", "mwaka", "swali", "maana", "naomba", "mradi",
        "wazo", "sayansi", "hisabati", "nani", "wapi", "mwenye"
    ]
    return any(marker in text for marker in swahili_markers)


def school_reply(message: str) -> str:
    text = normalize_text(message).lower()
    if "head teacher" in text or "mwalimu mkuu" in text or "principal" in text:
        return f"The head teacher of {SCHOOL_INFO['name']} is {SCHOOL_INFO['head_teacher']}."
    if "owner" in text or "mmiliki" in text or "proprietor" in text:
        return f"The owner of {SCHOOL_INFO['name']} is {SCHOOL_INFO['owner']}."
    if "motto" in text or "slogan" in text:
        return f"The motto of {SCHOOL_INFO['name']} is '{SCHOOL_INFO['motto']}'."
    if "where" in text or "location" in text or "address" in text or "wapi" in text:
        return f"{SCHOOL_INFO['name']} is located in {SCHOOL_INFO['location']}. Map: {SCHOOL_INFO['maps_url']}"
    if "contact" in text or "whatsapp" in text or "simu" in text:
        return f"You can contact the school through {SCHOOL_INFO['contact']} or here: {SCHOOL_INFO['whatsapp_url']}"
    if "about" in text or "kuhusu" in text or "history" in text:
        return (
            f"{SCHOOL_INFO['description']} It is located in {SCHOOL_INFO['location']}. "
            f"Its motto is '{SCHOOL_INFO['motto']}'."
        )
    return (
        f"{SCHOOL_INFO['description']} It is located in {SCHOOL_INFO['location']}. "
        f"I can help with school info, results, science explanations, and project ideas."
    )


def explain_photosynthesis() -> str:
    return (
        "Photosynthesis is the process by which green plants make their own food using sunlight, water, and carbon dioxide. "
        "Chlorophyll in leaves traps light energy. The plant then uses this energy to produce glucose and releases oxygen.\n\n"
        "Simple equation: carbon dioxide + water + light energy -> glucose + oxygen."
    )


def explain_mitosis() -> str:
    return (
        "Mitosis is a type of cell division that produces two identical daughter cells. "
        "It is important for growth, repair, and replacement of old cells."
    )


def explain_osmosis() -> str:
    return (
        "Osmosis is the movement of water through a partially permeable membrane from a region with more water to a region with less water. "
        "It helps plant cells absorb water and stay firm."
    )


def build_study_plan(subject: str = "biology", days: int = 7, swahili: bool = False) -> str:
    subject = subject.strip() or "biology"
    if swahili:
        return (
            f"Mpango wa siku {days} wa kusoma {subject.title()}\n\n"
            "Siku ya 1: Pitia dhana kuu.\n"
            "Siku ya 2: Jibu maswali 5.\n"
            "Siku ya 3: Eleza kwa sauti.\n"
            "Siku ya 4: Kamilisha mazoezi yenye changamoto.\n"
            "Siku ya 5: Rudia fomula na kanuni.\n"
            "Siku ya 6: Fanya mtihani mfupi.\n"
            "Siku ya 7: Pitia makosa na uandike muhtasari."
        )
    return (
        f"{days}-Day Study Plan for {subject.title()}\n\n"
        "Day 1: Review the key ideas and write short notes.\n"
        "Day 2: Solve 5 practice questions.\n"
        "Day 3: Teach the topic aloud to yourself or a friend.\n"
        "Day 4: Work on difficult questions and find mistakes.\n"
        "Day 5: Revise formulas, definitions, and diagrams.\n"
        "Day 6: Attempt a mini-test.\n"
        "Day 7: Final revision and write a summary."
    )


def build_project_idea(topic: str = "science", swahili: bool = False) -> str:
    topic = topic.strip() or "science"
    if swahili:
        return (
            f"Wazo la mradi kuhusu {topic}:\n\n"
            "1. Kichwa: Athari za {topic} kwa wanafunzi.\n"
            "2. Lengo: Kutathmini jinsi {topic} inavyosaidia kujifunza.\n"
            "3. Njia: Kusanya data kwa mahojiano, uchunguzi, na majaribio.\n"
            "4. Matokeo: Wasilisha kwa chati na picha.\n"
            "5. Hitimisho: Eleza mafundisho na umuhimu."
        ).format(topic=topic)
    return (
        f"Project idea on {topic.title()}:\n\n"
        "1. Title: The impact of this topic on student learning.\n"
        "2. Objective: Investigate how the topic affects study habits and results.\n"
        "3. Method: Collect data using observation, interviews, and simple experiments.\n"
        "4. Results: Present findings clearly with charts or visuals.\n"
        "5. Conclusion: Explain the key lesson and practical value."
    )


def solve_basic_math(message: str) -> Optional[str]:
    text = normalize_text(message).lower()
    if re.search(r"\d.*[+\-*/].*\d", text):
        try:
            value = eval(text, {"__builtins__": {}}, {})
            if isinstance(value, (int, float)):
                return f"Result: {value}"
        except Exception:
            return None
    return None


class ChatEngine:
    def __init__(self, school_info: Optional[Dict[str, Any]] = None):
        self.school_info = school_info or SCHOOL_INFO

    def normalize_text(self, text: str) -> str:
        return normalize_text(text)

    def local_reply(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        image_name: str = "",
        image_size: int = 0,
        mode: str = "",
        file_context: str = "",
        education_level: str = "",
    ) -> str:
        text = self.normalize_text(message)
        if not text:
            return "Please type a question or topic and I will help you."

        lower = text.lower()
        swahili = is_swahili(text)

        if re.search(r"\b(photosynthesis|fotosintesi|fotosintesis)\b", lower):
            return explain_photosynthesis()
        if re.search(r"\b(mitosis|mitosisi)\b", lower):
            return explain_mitosis()
        if re.search(r"\b(osmosis|osmosis)\b", lower):
            return explain_osmosis()
        if re.search(r"\b(study plan|mpango wa kusoma|ratiba|study timetable)\b", lower):
            subject = "biology"
            match = re.search(r"(?:for|ya|cha)\s+([a-zA-Z ]{2,30})", text, flags=re.I)
            if match:
                subject = match.group(1).strip()
            return build_study_plan(subject, swahili=swahili)
        if re.search(r"\b(project|mradi|assignment|topic)\b", lower):
            subject = re.search(r"(?:about|on|for|ya|cha|la|wa)\s+([a-zA-Z ]{2,40})", text, flags=re.I)
            topic = subject.group(1).strip() if subject else "science"
            return build_project_idea(topic, swahili=swahili)
        if re.search(r"\b(tumaini|tsss|school|shule)\b", lower):
            return school_reply(text)
        if re.search(r"\b(hi|hello|habari|hujambo)\b", lower):
            return "Hello! I am Tumaini Schools AI. I can help with schoolwork, study plans, projects, and school information."
        if re.search(r"\b(what is ai|artificial intelligence|akili bandia)\b", lower):
            return (
                "AI is a technology that allows computers to learn patterns and help people solve problems. "
                "In a school setting, it can explain lessons, plan revision, and support project work."
            )

        math_answer = solve_basic_math(text)
        if math_answer:
            return math_answer

        if swahili:
            return "Nimeelewa swali lako. Ninaweza kukusaidia kwa maelezo ya hatua kwa hatua, kuunda mradi, kupanga ratiba ya kujifunza, au kueleza somo kwa kifupi zaidi."
        return "I can help with school explanations, projects, revision planning, and study support. Please give me the exact topic or question."

    def generate_reply(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        image_name: str = "",
        image_size: int = 0,
        mode: str = "",
        file_context: str = "",
        education_level: str = "",
    ) -> str:
        return self.local_reply(message, history, image_name, image_size, mode, file_context, education_level)


engine = ChatEngine()


def local_reply(
    message: str,
    history: Optional[List[Dict[str, str]]] = None,
    image_name: str = "",
    image_size: int = 0,
    mode: str = "",
    file_context: str = "",
    education_level: str = "",
) -> str:
    return engine.local_reply(message, history, image_name, image_size, mode, file_context, education_level)


def generate_reply(
    message: str,
    history: Optional[List[Dict[str, str]]] = None,
    image_name: str = "",
    image_size: int = 0,
    mode: str = "",
    file_context: str = "",
    education_level: str = "",
) -> str:
    return engine.generate_reply(message, history, image_name, image_size, mode, file_context, education_level)
