
"""Smart Python backend for the Tumaini Schools AI chat assistant.

This backend adds a stronger AI-like layer to the frontend bot:
- optional OpenAI-compatible LLM integration
- better multi-language support
- school-specific knowledge
- project/study guidance
- structured fallback responses if no external model is available

How to run:
    python ai_backend.py
    # then open http://localhost:8000

JSON API:
    POST /chat
    {"message": "Help me make a biology project", "history": []}

    Response:
    {"reply": "..."}
"""

from __future__ import annotations

import json
import os
import re
import sys
import ast
import operator
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse, quote
from urllib.request import Request, urlopen


SCHOOL_INFO = {
    "name": "TUMAINI SENIOR HIGH SCHOOL",
    "short_name": "TSSS",
    "owner": "MODEST BAYO",
    "head_teacher": "SIFAEL MSENGI",
    "principal": "SIFAEL MSENGI",
    "motto": "Together We Excel",
    "location": "Arusha Region, Monduli District, Makuyuni Village",
    "maps_url": "https://maps.app.goo.gl/DMhw9Y3KsRisWRQ99",
    "postal": "P.O. Box 312",
    "centre": "S5493",
    "contact": "WhatsApp 0745212613",
    "whatsapp_url": "https://wa.me/255745212613",
    "instagram": "https://www.instagram.com/tumainischoolstz/",
    "tiktok": "https://www.tiktok.com/@tumainischoolstz",
    "facebook": "https://www.facebook.com/",
    "youtube": "https://www.youtube.com/@tumainischools",
    "video": "https://youtu.be/6bEnp3HcZFM",
    "necta": "https://necta.go.tz/",
    "description": (
        "Tumaini Senior High School is a school community focused on excellence, learning, "
        "discipline, and future-ready education."
    ),
}


MATH_TOPIC_GUIDES = {
    "fractions": "Fractions represent parts of a whole. For addition or subtraction, use a common denominator; for multiplication multiply numerators and denominators; for division multiply by the reciprocal.",
    "percentages": "Percentage means parts per hundred. Percentage = (part / whole) x 100. To find a percentage of a quantity, multiply the quantity by the percentage divided by 100.",
    "ratio": "A ratio compares quantities in the same units. Simplify a:b by dividing both terms by their greatest common divisor. In direct proportion, y = kx; in inverse proportion, y = k/x.",
    "units": "Convert units by multiplying or dividing by the conversion factor. For area, square the length factor; for volume, cube it. Always write the unit in the final answer.",
    "approximation": "Rounding to decimal places counts digits after the decimal point. Significant figures start at the first non-zero digit; inspect the next digit to decide whether to round up.",
    "algebra": "Collect like terms, expand brackets using the distributive law, and factorise by taking out the highest common factor or using standard identities such as a^2 - b^2 = (a-b)(a+b).",
    "linear equations": "Solve a linear equation by doing the same operation on both sides. Expand brackets, collect the variable terms on one side, constants on the other, then divide by the coefficient.",
    "indices": "For the same non-zero base: a^m x a^n = a^(m+n), a^m / a^n = a^(m-n), and (a^m)^n = a^(mn). A negative index means reciprocal: a^-n = 1/a^n.",
    "pythagoras": "For a right-angled triangle, a^2 + b^2 = c^2, where c is the hypotenuse. Use the theorem only when one angle is 90 degrees.",
    "trigonometry": "In a right-angled triangle, sin(theta) = opposite/hypotenuse, cos(theta) = adjacent/hypotenuse, and tan(theta) = opposite/adjacent. Check calculator angle mode.",
    "sets": "A set is a collection of distinct objects. Union A union B combines elements; intersection A intersection B contains common elements; a subset contains only elements from the larger set.",
    "statistics": "Mean = sum of values / number of values. Median is the middle ordered value. Mode is the most frequent value. A frequency table must include every value or class and its frequency.",
    "sequences": "For an arithmetic progression, the nth term is a + (n-1)d and the sum is n/2[2a + (n-1)d]. For a geometric progression, the nth term is ar^(n-1).",
    "finance": "Simple interest = PRT/100. Compound amount = P(1 + r/100)^n. Profit = selling price - cost price, and profit percentage = profit/cost price x 100.",
    "vectors": "A vector has magnitude and direction. Add corresponding components. The magnitude of (a,b) is sqrt(a^2+b^2); the dot product is a1b1 + a2b2.",
    "probability": "For equally likely outcomes, P(E) = favourable outcomes / total outcomes. P(not E) = 1 - P(E). For independent events, multiply their probabilities.",
    "calculus": "Differentiation gives a rate of change or gradient. Integration reverses differentiation and can find accumulated quantity, area, or volume when limits and a function are known.",
    "complex numbers": "A complex number is z = a + bi, where i^2 = -1. The real part is a, the imaginary part is b, and the modulus is sqrt(a^2+b^2).",
    "matrices": "Matrix operations must respect dimensions. For [[a,b],[c,d]], determinant = ad - bc. A matrix has an inverse only when its determinant is non-zero.",
}

FORM_TOPICS = {
    "form one": "Numbers; fractions and decimals; operations and word problems; percentages, ratio, rate and proportion; units; approximation and estimation; geometry; algebraic expressions; linear equations and inequalities; perimeter and area.",
    "form two": "Exponents and radicals; simultaneous and quadratic equations; Pythagoras; trigonometry; sets and Venn diagrams; statistics; quadrilaterals and polygons; similarity and congruency.",
    "form three": "Relations, functions and coordinate geometry; variation; sequences and series; logarithms; finance; vectors; circles and circle theorems.",
    "form four": "Coordinate geometry; sectors and combined areas; three-dimensional figures; probability; non-right-angled trigonometry; matrices and transformations; linear programming.",
    "form five": "Logic; functions; polynomials; partial fractions; binomial theorem; compound-angle trigonometry; conic sections; differentiation.",
    "form six": "Integration; hyperbolic functions; complex numbers; three-dimensional vectors; matrices; probability distributions; regression and correlation; numerical methods.",
}


SUBJECT_CURRICULUM = {
    "mathematics": {
        "form 1": "Fractions, decimals and percentages; numbers; approximations; geometry; algebra; coordinates; perimeters and areas.",
        "form 2": "Exponents and radicals; constructions; logarithms; quadratic equations; congruence; similarity; transformations; Pythagoras; trigonometry; sets; statistics.",
        "form 3": "Relations; functions; mathematical logic; matrices; conditional statements; circles; vectors; linear programming.",
        "form 4": "Coordinate geometry; sequences and series; trigonometry; three-dimensional geometry; probability; matrices and transformations; commercial arithmetic.",
        "a-level": "Calculating devices; functions; algebra; trigonometry; hyperbolic functions; conics; vectors; matrices; complex numbers; calculus; differential equations; linear programming; probability and statistics.",
    },
    "physics": {
        "form 1": "Introduction to physics; laboratory practice; measurement; force; Archimedes' principle; matter; pressure; work, energy and power; light.",
        "form 2": "Static and current electricity; magnetism; equilibrium; simple machines; motion; Newton's laws; temperature; sustainable energy.",
        "form 3": "Vectors; linear motion; friction; optical instruments; thermal expansion; heat transfer; thermal energy; vapor and humidity; gas laws; current electricity.",
        "form 4": "Waves; electromagnetism; radioactivity; electronic physics; astronomy and geophysics.",
        "a-level": "Mechanics; heat and thermodynamics; vibrations and waves; optics; electrostatics; current electricity; electromagnetism; atomic, nuclear and electronic physics.",
    },
    "chemistry": {
        "form 1": "Introduction; laboratory techniques and safety; heat and flame; matter; air; combustion and rusting; scientific procedures; water.",
        "form 2": "Oxygen and hydrogen; atomic structure; chemical bonding; formulae and equations; nomenclature; periodic classification; energy changes.",
        "form 3": "Chemical equations; hardness of water; acids, bases and salts; mole concept; stoichiometry; volumetric and ionic analysis; kinetics; equilibrium; energetics; extraction of metals and non-metals.",
        "form 4": "Qualitative analysis; organic chemistry; environmental chemistry; electrochemistry.",
        "a-level": "Physical chemistry; inorganic chemistry; periodicity; transition elements; extraction of metals; environmental chemistry; organic compounds, amines and polymers.",
    },
    "biology": {
        "form 1": "Introduction to biology; safety; health and immunity; cell structure and organization; classification of living things.",
        "form 2": "Fungi and Plantae; nutrition; balance of nature; transport in organisms.",
        "form 3": "Respiration; excretion; coordination; homeostasis; movement.",
        "form 4": "Growth; reproduction; genetics; evolution; human demography.",
        "a-level": "Cytology; classification; biochemistry; respiration; nutrition; transport; excretion; coordination; osmoregulation; reproduction; genetics; evolution; ecology.",
    },
    "geography": {
        "form 1": "Concept of geography; solar system; earth surface features; weather; climate; map and photograph interpretation.",
        "form 2": "Human activities; agriculture; tourism; manufacturing; mining; water management; energy; transport; environment.",
        "form 3": "Earth movements; vulcanicity; internal and external forces; soil; surveying; map reading; statistical methods.",
        "form 4": "Population; settlement; climate and natural regions; environmental issues and management; research techniques.",
        "a-level": "Physical geography; geomorphology; climatology; soil science; oceanography; biogeography; surveying; human and economic geography; population; agriculture; energy; mining; industry; transport; environmental management.",
    },
    "history": {
        "form 1": "Sources and importance of history; evolution of man; economic activities; social and political systems.",
        "form 2": "Interactions among African people; social and economic development; Ngoni migration; East Africa and the outside world; colonial rule.",
        "form 3": "Colonial economy; administrative systems; social services; impact of colonial rule; nationalism in Africa.",
        "form 4": "Nationalism and decolonization; post-independence problems; international cooperation; African development.",
        "a-level": "African history; pre-colonial societies; colonialism; nationalist movements; post-colonial Africa; capitalism; dictatorships; world wars; Cold War; international organizations.",
    },
    "kiswahili": {
        "form 1": "Ushairi; riwaya; tamthilia; sarufi; matumizi ya lugha; ufahamu; uandishi wa insha na barua.",
        "form 2": "Fasihi kwa ujumla; fasihi simulizi; ukuaji wa Kiswahili; uhakiki wa kazi za fasihi.",
        "form 3": "Sarufi miundo; uundaji wa maneno; matumizi ya lugha katika miktadha; uhakiki wa maudhui na fomu.",
        "form 4": "Utungaji wa kazi za fasihi; maendeleo ya Kiswahili baada ya uhuru; hotuba na ripoti.",
    },
    "english language": {
        "form 1": "Listening and speaking; reading comprehension; nouns, pronouns, verbs and tenses; paragraphs and letters.",
        "form 2": "Opinions; reading for information; extended writing; plays, novels and poetry analysis.",
        "form 3": "Argumentative writing; complex grammar; formal and informal communication; literary analysis.",
        "form 4": "Composition; functional English; summary writing; comprehensive literature review.",
    },
    "general studies": {
        "a-level": "Philosophy and religion; gender, HIV/AIDS and environment; science and technology; international affairs; democracy; human rights; national development.",
    },
}

def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


MATH_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def solve_math_problem(message: str) -> Optional[str]:
    expression = re.sub(r"\b(what is|calculate|solve|hesabu|jibu|find)\b", "", message, flags=re.I)
    expression = re.sub(r"[^0-9+\-*/().%\s]", "", expression).strip()
    if not expression or not re.search(r"\d", expression) or not re.search(r"[+\-*/%]", expression):
        return None

    def evaluate(node: ast.AST) -> float:
        if isinstance(node, ast.Expression):
            return evaluate(node.body)
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        if isinstance(node, ast.BinOp) and type(node.op) in MATH_OPERATORS:
            left = evaluate(node.left)
            right = evaluate(node.right)
            if isinstance(node.op, ast.Pow) and abs(right) > 10:
                raise ValueError("power too large")
            return MATH_OPERATORS[type(node.op)](left, right)
        if isinstance(node, ast.UnaryOp) and type(node.op) in MATH_OPERATORS:
            return MATH_OPERATORS[type(node.op)](evaluate(node.operand))
        raise ValueError("unsupported expression")

    try:
        result = evaluate(ast.parse(expression, mode="eval"))
        if not isinstance(result, (int, float)) or not float("-1e308") < result < float("1e308"):
            return None
        formatted = int(result) if float(result).is_integer() else round(result, 6)
        return f"Jibu ni {formatted}.\n\nHatua: {expression} = {formatted}"
    except (SyntaxError, ValueError, ZeroDivisionError, OverflowError):
        return None


def solve_percentage_problem(message: str) -> Optional[str]:
    match = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*%\s*(?:of|ya)\s*([0-9]+(?:\.[0-9]+)?)", message, re.I)
    if not match:
        return None
    percentage = float(match.group(1))
    quantity = float(match.group(2))
    result = percentage * quantity / 100
    formatted = int(result) if result.is_integer() else round(result, 6)
    return f"{percentage:g}% ya {quantity:g} = {formatted}.\n\nHatua: ({percentage:g} / 100) x {quantity:g} = {formatted}"


def solve_ratio_sharing(message: str) -> Optional[str]:
    match = re.search(r"(?:share|divide|gawa|shirikisha)\s+([0-9]+(?:\.[0-9]+)?)\s+(?:in the ratio|kwa uwiano wa|in ratio)\s+([0-9]+)\s*[:/]\s*([0-9]+)", message, re.I)
    if not match:
        return None
    total = float(match.group(1))
    first_part = int(match.group(2))
    second_part = int(match.group(3))
    parts = first_part + second_part
    first = total * first_part / parts
    second = total * second_part / parts
    first_value = int(first) if first.is_integer() else round(first, 6)
    second_value = int(second) if second.is_integer() else round(second, 6)
    return f"Mgawanyo ni {first_value} na {second_value}.\n\nHatua: jumla ya sehemu = {first_part} + {second_part} = {parts}; thamani ya sehemu moja = {total:g} / {parts} = {total / parts:g}."


UNIT_FACTORS = {
    "mm": ("length", 0.001), "cm": ("length", 0.01), "m": ("length", 1), "km": ("length", 1000),
    "mg": ("mass", 0.001), "g": ("mass", 1), "kg": ("mass", 1000),
    "ml": ("capacity", 0.001), "l": ("capacity", 1),
}


def solve_unit_conversion(message: str) -> Optional[str]:
    match = re.search(r"(?:convert|badili)\s+([0-9]+(?:\.[0-9]+)?)\s*(mm|cm|km|m|mg|kg|g|ml|l)\s+(?:to|kuwa|kwenda)\s*(mm|cm|km|m|mg|kg|g|ml|l)", message, re.I)
    if not match:
        return None
    value = float(match.group(1))
    source = match.group(2).lower()
    target = match.group(3).lower()
    source_type, source_factor = UNIT_FACTORS[source]
    target_type, target_factor = UNIT_FACTORS[target]
    if source_type != target_type:
        return "Siwezi kubadili vipimo vya aina tofauti; tumia vitengo vya urefu, uzito au ujazo vya aina moja."
    result = value * source_factor / target_factor
    formatted = int(result) if result.is_integer() else round(result, 6)
    return f"{value:g} {source} = {formatted} {target}.\n\nHatua: {value:g} x ({source_factor:g} / {target_factor:g}) = {formatted}."


def is_swahili(text: str) -> bool:
    text = text.lower()
    swahili_words = [
        "habari", "nisaidie", "tafadhali", "sasa", "shule", "masomo", "mwalimu",
        "nina", "mpango", "kujifunza", "jibu", "eleza", "fafanua", "morning",
        "kitu", "kijana", "kila", "wapi", "anuani", "matokeo", "mwaka", "swali",
        "maana", "darasa", "tukio", "kituo", "naomba", "nimefanya", "nifundishe",
        "mradi", "wazo", "sayansi", "hisabati", "nisaidie", "nipe", "andika",
        "tengeneza", "fanya", "soma", "jifunza", "mada", "somo", "kwa nini",
        "nani", "mmiliki", "mwenye"
    ]
    return bool(re.search(r"[a-zA-Z]*[a-zA-Z]", text)) and any(word in text for word in swahili_words)


def detect_language(text: str) -> str:
    lowered = text.lower()
    if any(token in lowered for token in ["habari", "nisaidie", "tafadhali", "eleza", "mpango", "masomo", "shule", "matokeo"]):
        return "swahili"
    if any(token in lowered for token in ["hello", "help", "please", "project", "study", "school", "results"]):
        return "english"
    return "english"


def is_live_web_search_request(text: str) -> bool:
    lower = text.lower()
    search_phrases = [
        "search the web", "search online", "web search", "live web", "latest news", "research online",
        "find info", "who is", "what is", "where is", "when did", "how does", "tell me about",
        "browse web", "google this", "what happened", "latest", "internet search", "search internet", "lookup",
        "why does", "what are", "what was", "which country", "difference between", "history of",
        "tafuta mtandao", "tafuta kwenye mtandao", "utafutaji wa mtandao", "google hili", "maelezo ya mtandao",
        "nini maana ya", "wapi iko", "nani ni", "lini ilitokea", "eleza kuhusu", "historia ya", "kuna tofauti"
    ]
    if any(phrase in lower for phrase in search_phrases):
        school_flow = any(token in lower for token in [
            "school results", "school location", "school address", "location of the school", "where is the school",
            "shule wapi", "wapi shule", "matokeo ya shule", "results of the school", "tumaini results", "tumaini location",
            "eneo la shule", "address ya shule", "school name", "jina la shule"
        ])
        if school_flow:
            return False
        return True
    return False


def fetch_wikipedia_summary(query: str, lang: str = "en") -> Optional[str]:
    clean = normalize_text(query)
    if not clean:
        return None
    search_url = f"https://{lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch={quote(clean)}&format=json&origin=*&utf8=1&srlimit=1"
    try:
        request = Request(search_url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
        with urlopen(request, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8", errors="ignore"))
        title = (data.get("query") or {}).get("search", [{}])[0].get("title") if (data.get("query") or {}).get("search") else None
        if not title:
            return None
        summary_url = f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/{quote(title)}"
        with urlopen(Request(summary_url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"}), timeout=10) as result_response:
            summary = json.loads(result_response.read().decode("utf-8", errors="ignore"))
        extract = str(summary.get("extract") or "").strip()
        if not extract:
            return None
        description = str(summary.get("description") or "").strip()
        final = f"{description + '. ' if description else ''}{extract}"
        return final[:900] + ("..." if len(final) > 900 else "")
    except Exception:
        return None


def fetch_web_search_result(query: str) -> Optional[str]:
    clean = normalize_text(query)
    if not clean:
        return None
    cleaned_query = re.sub(
        r"\b(search the web|search online|live web|web search|research online|browse web|lookup|search internet|google this|tafuta mtandao|tafuta kwenye mtandao|utafutaji wa mtandao|google hili)\b",
        "",
        clean,
        flags=re.I,
    ).strip()
    cleaned_query = re.sub(r"\b(please|tafadhali|can you|could you|tell me|what is|who is|where is|when did|why does|how does|explain|about|latest|recent|eleza|nisaidie|maana ya|wapi|nani|lini|vipi)\b", "", cleaned_query, flags=re.I).strip()
    if not cleaned_query:
        return None

    for language in (["sw", "en"] if is_swahili(cleaned_query) else ["en", "sw"]):
        wikipedia_result = fetch_wikipedia_summary(cleaned_query, language)
        if wikipedia_result:
            return wikipedia_result

    url = f"https://api.duckduckgo.com/?q={quote(cleaned_query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1"
    try:
        request = Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
        with urlopen(request, timeout=8) as response:
            payload = json.loads(response.read().decode("utf-8", errors="ignore"))
        abstract = str(payload.get("AbstractText") or payload.get("Answer") or payload.get("Abstract") or "").strip()
        related = ""
        related_topics = payload.get("RelatedTopics") or []
        if isinstance(related_topics, list) and related_topics:
            first_topic = related_topics[0]
            if isinstance(first_topic, dict):
                related = str(first_topic.get("Text") or "").strip()
        result = abstract or related
        if not result:
            return None
        return result[:850] + ("..." if len(result) > 850 else "")
    except Exception:
        return None


def build_story_reply(message: str, swahili: bool = False) -> str:
    if swahili:
        return (
            "Hapo zamani, mwanafunzi mmoja alihisi kushindwa na kukataa, lakini alikumbuka kwamba kila mtu anaweza kukua."
            " Aliuliza mwenyewe, 'Naweza kuwa binadamu wa akili nyingi na moyo wa kujenga mambo?'"
            " Akajibu, 'Ndiyo, ukiendelea kujifunza, kushika malengo, na kujenga tabia ya kuvumilia.'\n\n"
            "Alianza na hatua ndogo: kusoma kwa makini, kuuliza maswali mazuri, na kukubali makosa kama sehemu ya safari."
            " Kila siku aliendelea, hata pale ambapo alihisi kukata tamaa. Hivyo, safari yake ikawa ya kujenga ujasiri, usikivu,"
            " na uwezo wa kukabiliana na changamoto bila kukataa.\n\n"
            "Kisha aligundua kwamba binadamu halisi si mtu asiyefanya makosa, bali mtu anayejifunza kutoka kwa makosa, anayefanya bidii,"
            " na anayejenga maisha ya maana kupitia fikra, bidii, na moyo wa kukua kila siku."
            " Hivyo, kama unataka kupiga story au mazungumzo ya kawaida, jibu ni kwamba utu wa kweli unajengwa kwa kujifunza, kujaribu tena,"
            " na kukubali kwamba maendeleo huanza kwa hatua ndogo."
        )
    return (
        "Once upon a time, a student felt unsure and doubted whether he could grow into a strong, thoughtful person. He asked himself,"
        " 'Can I become more human in the best sense—more thoughtful, more useful, and more capable?'"
        " The answer was, 'Yes, if you keep learning, keep trying, and keep improving.'\n\n"
        "He began with small steps: reading carefully, asking better questions, and accepting mistakes as part of growth."
        " Day by day, he became more patient, more disciplined, and more confident.\n\n"
        "Soon, he understood that being truly human is not about perfection; it is about curiosity, empathy, effort, and the courage to keep moving forward."
        " That is what makes a person wise: learning from experience, solving problems, and becoming better than yesterday."
    )


def build_long_story_reply(message: str, swahili: bool = False) -> str:
    if swahili:
        return (
            "Hapo zamani, kijana mmoja katika shule ya sekondari aliishi na wasiwasi mwingi. Alikuwa akifikiri kwamba kila mtu alikuwa tayari,"
            " lakini yeye alikuwa nyuma. Aliuliza mwenyewe, 'Ninawezaje kukua ukiwa choyo kwa medo ya maisha na masomo yanayokuja kila siku?'"
            " Siku moja, mwalimu wake alimweleza, 'Usisubiri kuwa kamilifu; anza kwa hatua ndogo na uendelee.'\n\n"
            "Kijana huyo alianza kujenga tabia nzuri: kusoma kwa dakika chache kila siku, kuandika mawazo muhimu, kuuliza maswali,"
            " na kukubali kwamba makosa ni sehemu ya kujifunza. Alianza kuhusiana na watu wanaotaka kujenga, akatengeneza ratiba ya kusoma,"
            " na kukubali kwamba hatua ndogo zinajenga mafanikio makubwa.\n\n"
            "Muda ulipita, aligundua kwamba si kipaji kilichomfanya awe mkubwa, bali usikivu wa kujitahidi katika kila tukio la maisha."
            " Hata pale akipata shida, hakukata tamaa; aliendelea, akarekebisha, na akajenga moyo wa uvumilivu."
            " Hivyo, alikua moyo wa ujasiri, ubunifu na ukarimu wa kufikiri kwa makini.\n\n"
            "Hiyo ndiyo story ya kweli: si kutegemea ajabu, bali kujenga maisha yenye maana kwa hatua ndogo, yenye bidii, na moyo wa kukua."
            " Kila siku huwa na fursa ya kuanza tena, kujenga tena, na kufikia mpango wa maisha ulio na maana."
        )
    return (
        "Once upon a time, a student in a busy school felt overwhelmed and doubted whether he could ever catch up."
        " He thought success would come only if he became perfect overnight. Then one day, a teacher told him, 'Do not wait for perfect conditions; start with small steps and keep moving.'\n\n"
        "The student began building better habits: he read a little each day, wrote clear notes, asked better questions, and accepted that mistakes were part of learning."
        " He surrounded himself with people who encouraged growth, created a study routine, and learned that consistency is stronger than intensity.\n\n"
        "Over time, he discovered that what really shaped him was not a sudden burst of talent but the steady discipline of trying again and again."
        " When challenges came, he did not quit; instead, he adjusted, learned, and kept moving. That is how courage grows.\n\n"
        "This is the real story of growth: it is not about waiting for a perfect moment. It is about building a meaningful life through small decisions, steady effort, and the willingness to become better every day."
    )


def build_project_idea(topic: str, swahili: bool = False) -> str:
    topic = topic.strip() or "science"
    if swahili:
        topic = {"science": "sayansi", "biology": "biolojia", "chemistry": "kemia", "physics": "fizikia", "mathematics": "hisabati"}.get(topic.lower(), topic)
        return (
            f"Hili ni wazo zuri la mradi kuhusu {topic}:\n\n"
            f"1. Kichwa: 'Athari za {topic.title()} kwa Kujifunza na Maisha ya Kila Siku'\n"
            f"2. Lengo: Kuchunguza jinsi {topic.lower()} inavyoathiri elimu, tabia za kila siku na matokeo ya vitendo.\n"
            "3. Njia: Kusanya taarifa kwa uchunguzi, mahojiano na majaribio rahisi.\n"
            "4. Matokeo: Wasilisha utafiti kwa jedwali, picha na maelezo yaliyo wazi.\n"
            "5. Hitimisho: Eleza ulichojifunza na matumizi yake katika maisha halisi."
        )
    return (
        f"Here is a strong project idea on {topic}:\n\n"
        f"1. Title: 'The Impact of {topic.title()} on Student Learning and Daily Life'\n"
        f"2. Objective: To investigate how {topic.lower()} affects school performance, daily habits, and practical outcomes.\n"
        f"3. Method: Collect data through observation, interviews, and simple experiments.\n"
        f"4. Results: Present findings with charts, pictures, and clear explanations.\n"
        f"5. Conclusion: Explain what you learned and how the topic can be applied in real life."
    )


def build_study_plan(subject: str, days: int = 7, swahili: bool = False) -> str:
    subject = subject.strip() or "your subject"
    if swahili:
        return (
            f"Mpango wa siku 7 wa kusoma {subject.title()}\n\n"
            "Siku ya 1: Pitia dhana kuu na andika muhtasari.\n"
            "Siku ya 2: Jibu maswali 5 ya somo.\n"
            "Siku ya 3: Mweleze mtu mwingine dhana hiyo kwa sauti.\n"
            "Siku ya 4: Shughulikia maswali magumu na tambua makosa.\n"
            "Siku ya 5: Rudia kanuni, maana na michoro.\n"
            "Siku ya 6: Fanya jaribio la muda.\n"
            "Siku ya 7: Pitia maeneo yenye udhaifu na andika nukuu za mwisho.\n\n"
            "Ushauri: Soma kwa dakika 25, pumzika dakika 5."
        )
    return (
        f"7-Day Study Plan for {subject.title()}\n\n"
        "Day 1: Review the main concept and write summary notes.\n"
        "Day 2: Practice 5 questions from the lesson.\n"
        "Day 3: Teach the concept to someone else or explain it aloud.\n"
        "Day 4: Focus on difficult questions and identify mistakes.\n"
        "Day 5: Revise formulas, definitions, and diagrams.\n"
        "Day 6: Do a timed test or mini quiz.\n"
        "Day 7: Review weak areas and write final revision notes.\n\n"
        "Tip: Study in 25-minute blocks with 5-minute breaks."
    )


def explain_photosynthesis() -> str:
    return (
        "Photosynthesis is the process by which green plants make their own food using sunlight, water, and carbon dioxide. "
        "Chlorophyll in leaves traps light energy. The plant then uses that energy to produce glucose, which stores energy, "
        "and releases oxygen into the air.\n\nSimple formula: carbon dioxide + water + light energy → glucose + oxygen."
    )


def explain_mitosis() -> str:
    return (
        "Mitosis is a type of cell division that produces two identical daughter cells. It is important for growth, "
        "repair, and replacement of old cells. The main stages are prophase, metaphase, anaphase, and telophase."
    )


def explain_osmosis() -> str:
    return (
        "Osmosis is the movement of water through a partially permeable membrane from a region with more water to a region with less water. "
        "This helps plant cells absorb water and stay firm."
    )


def answer_compound_request(message: str, swahili: bool = False) -> Optional[str]:
    """Handle one sentence containing a topic plus several learning requests."""
    lower = message.lower()
    topics = [
        ("photosynthesis", "fotosintesi", explain_photosynthesis),
        ("mitosis", "mitosisi", explain_mitosis),
        ("osmosis", "osmosis", explain_osmosis),
    ]
    topic = next(((english, swahili_name, handler) for english, swahili_name, handler in topics
                  if english in lower or swahili_name in lower), None)
    complex_markers = r"\b(and|also|then|example|examples|questions|quiz|compare|difference|steps|pia|halafu|mfano|maswali|tofauti|hatua|faida|hasara)\b"
    if not topic or not re.search(complex_markers, lower):
        return None

    english_name, swahili_name, handler = topic
    explanation = handler()
    if swahili:
        explanation = {
            "photosynthesis": "Fotosintesi ni mchakato ambao mimea hutengeneza chakula kwa kutumia mwanga wa jua, maji na hewa ya ukaa. Chlorophyll hunasa mwanga; mizizi hufyonza maji; majani huchukua carbon dioxide; glucose hutengenezwa na oxygen hutolewa.",
            "mitosis": "Mitosisi ni mgawanyiko wa seli unaotengeneza seli mbili zinazofanana. Ni muhimu kwa ukuaji, ukarabati wa tishu na uingizwaji wa seli zilizokufa. Hatua zake ni prophase, metaphase, anaphase na telophase.",
            "osmosis": "Osmosis ni mwendo wa maji kupitia utando unaoruhusu baadhi ya vitu kupita, kutoka sehemu yenye maji mengi kwenda sehemu yenye maji machache. Husaidia seli za mimea kufyonza maji na kuwa imara.",
        }[english_name]
        result = f"Maelezo ya {swahili_name}:\n\n{explanation}"
        if re.search(r"example|examples|mfano", lower):
            result += "\n\nMfano: Seli ya mmea huvimba ikiwa ndani ya maji safi kwa sababu maji huingia ndani kupitia osmosis." if english_name == "osmosis" else "\n\nMfano: Mmea uliowekwa kwenye mwanga hutumia maji na carbon dioxide kutengeneza glucose kupitia fotosintesi."
        if re.search(r"questions|quiz|maswali", lower):
            result += "\n\nMaswali ya kujipima:\n1. Eleza maana ya mada hii.\n2. Taja hatua zake kuu.\n3. Eleza umuhimu wake kwa viumbe hai."
        return result

    result = f"Explanation of {english_name}:\n\n{explanation}"
    if re.search(r"example|examples|mfano", lower):
        result += "\n\nExample: A plant uses water and carbon dioxide in sunlight to make glucose through photosynthesis." if english_name != "osmosis" else "\n\nExample: A plant cell becomes firm in fresh water because water enters by osmosis."
    if re.search(r"questions|quiz|maswali", lower):
        result += "\n\nPractice questions:\n1. Define the topic.\n2. State its main stages or steps.\n3. Explain why it is important."
    return result


def solve_linear_equation(message: str) -> Optional[str]:
    match = re.search(r"([0-9xX+\-*/.()\s]+=[0-9xX+\-*/.()\s]+)", message)
    if not match or "=" not in match.group(1) or not re.search(r"x", match.group(1), re.I):
        return None

    equation = match.group(1).replace(" ", "").lower()
    left_text, right_text = equation.split("=", 1)

    def side_value(side: str) -> tuple[float, float]:
        side = side.replace("-", "+-")
        if side.startswith("+"):
            side = side[1:]
        coefficient = 0.0
        constant = 0.0
        for term in side.split("+"):
            if not term:
                continue
            if "x" in term:
                value = term.replace("x", "")
                coefficient += -1.0 if value == "-" else 1.0 if value in ("", "+") else float(value)
            else:
                constant += float(term)
        return coefficient, constant

    try:
        left_x, left_constant = side_value(left_text)
        right_x, right_constant = side_value(right_text)
        coefficient = left_x - right_x
        constant = right_constant - left_constant
        if coefficient == 0:
            return None
        answer = constant / coefficient
        formatted = int(answer) if answer.is_integer() else round(answer, 6)
        return f"x = {formatted}\n\nWorking:\n{equation}: move constants to one side, collect x terms, then divide by {coefficient:g}."
    except (ValueError, ZeroDivisionError):
        return None


def get_math_topic_reply(message: str, swahili: bool = False) -> Optional[str]:
    lower = message.lower()
    requested_form = next((form for form in FORM_TOPICS if form in lower), None)
    asks_topics = bool(re.search(r"topics|syllabus|mada|curriculum|mtaala|what do i study|nisome nini", lower))
    if requested_form and asks_topics:
        heading = requested_form.title() if not swahili else f"Mada za {requested_form.title()}"
        return f"{heading}:\n\n{FORM_TOPICS[requested_form]}"

    aliases = {
        "fractions": ["fraction", "fractions", "sehemu"],
        "percentages": ["percentage", "percentages", "asilimia"],
        "ratio": ["ratio", "proportion", "uwiano"],
        "units": ["unit conversion", "units", "vipimo"],
        "approximation": ["approximation", "estimation", "rounding", "makadirio"],
        "algebra": ["algebra", "algebraic", "aljebra"],
        "linear equations": ["linear equation", "equation", "equations", "mlinganyo"],
        "indices": ["indices", "exponents", "powers", "indicesi"],
        "pythagoras": ["pythagoras", "right angled triangle", "pithagorasi"],
        "trigonometry": ["trigonometry", "sine", "cosine", "tangent", "trigonometri"],
        "sets": ["sets", "venn diagram", "seti"],
        "statistics": ["statistics", "mean median mode", "takwimu"],
        "sequences": ["sequence", "progression", "ap", "gp", "mfuatano"],
        "finance": ["compound interest", "simple interest", "profit", "loss", "interest"],
        "vectors": ["vector", "vectors", "vekta"],
        "probability": ["probability", "uwezekano"],
        "calculus": ["calculus", "differentiation", "integration", "calculus"],
        "complex numbers": ["complex number", "complex numbers", "namba changamano"],
        "matrices": ["matrix", "matrices", "matriki"],
    }
    selected = next((topic for topic, words in aliases.items() if any(word in lower for word in words)), None)
    if not selected or not re.search(r"explain|meaning|what is|how|eleza|maana|nini|jinsi|teach|help", lower):
        return None
    label = selected.title()
    guide = MATH_TOPIC_GUIDES[selected]
    return f"{label}:\n\n{guide}"


def get_subject_curriculum_reply(message: str, swahili: bool = False) -> Optional[str]:
    lower = message.lower()
    subject_aliases = {
        "mathematics": ["mathematics", "math", "hisabati"],
        "physics": ["physics", "fizikia"],
        "chemistry": ["chemistry", "kemia"],
        "biology": ["biology", "biolojia"],
        "geography": ["geography", "jiografia"],
        "history": ["history", "historia"],
        "kiswahili": ["kiswahili"],
        "english language": ["english language", "english"],
        "general studies": ["general studies", "gs", "general knowledge"],
    }
    subject = next((name for name, aliases in subject_aliases.items() if any(alias in lower for alias in aliases)), None)
    asks_topics = bool(re.search(r"topics|topic|syllabus|curriculum|mada|mtaala|nisome nini|what do i study", lower))
    if not subject or not asks_topics:
        return None

    if re.search(r"a[- ]?level|form 5|form 6|advanced|kidato cha tano|kidato cha sita", lower):
        level = "a-level"
    else:
        form_match = re.search(r"form\s*(1|2|3|4)|kidato\s*cha\s*(kwanza|pili|tatu|nne)", lower)
        form_names = {"1": "form 1", "2": "form 2", "3": "form 3", "4": "form 4", "kwanza": "form 1", "pili": "form 2", "tatu": "form 3", "nne": "form 4"}
        level = form_names.get(form_match.group(1) or form_match.group(2), "") if form_match else ""

    curriculum = SUBJECT_CURRICULUM[subject]
    if level and level in curriculum:
        title = f"Mada za {subject.title()} - {level.title()}" if swahili else f"{subject.title()} {level.title()} Topics"
        return f"{title}:\n\n{curriculum[level]}"

    title = f"Mtaala wa {subject.title()}" if swahili else f"{subject.title()} curriculum"
    return f"{title}:\n\n" + "\n".join(f"{level.title()}: {topics}" for level, topics in curriculum.items())


def answer_general_question(message: str, history: Optional[List[Dict[str, str]]] = None) -> Optional[str]:
    """Recognize common question words and answer known facts locally."""
    text = normalize_text(message)
    lower = text.lower()
    swahili = is_swahili(text)

    if re.search(r"\b(?:what is|explain|describe|how does|how do)\s+(gravity|photosynthesis|osmosis|mitosis|respiration|cell|force)\b", lower):
        if "gravity" in lower:
            return ("Gravity is the force of attraction between masses. On Earth it pulls objects toward the ground and gives objects weight.\n\n"
                    "Key points:\n1. Gravity acts toward the centre of the Earth.\n2. Weight depends on mass and gravitational field strength: W = mg.\n3. Mass is measured in kilograms; weight is measured in newtons.")
        if "photosynthesis" in lower:
            return explain_photosynthesis()
        if "osmosis" in lower:
            return explain_osmosis()
        if "mitosis" in lower:
            return explain_mitosis()
        if "respiration" in lower:
            return ("Respiration is the chemical process that releases energy from food in cells. Aerobic respiration uses oxygen and produces carbon dioxide, water, and energy.\n\n"
                    "Word equation: glucose + oxygen -> carbon dioxide + water + energy.")
        if "cell" in lower:
            return ("A cell is the basic structural and functional unit of a living organism. Important parts include the cell membrane, cytoplasm, nucleus, and mitochondria. Plant cells also have a cell wall, chloroplasts, and a large permanent vacuole.")
        return ("Force is a push or pull that can change an object's motion or shape. Its SI unit is the newton (N).\n\n"
                "Newton's second law: F = ma, where F is force, m is mass, and a is acceleration.")

    if re.search(r"\b(what|what does|what are|what do|what was|what were)\b", lower) or re.search(r"\b(nini|maana ya|ni nini)\b", lower):
        if re.search(r"\b(ai|artificial intelligence)\b", lower):
            return ("AI, au akili bandia, ni teknolojia inayowezesha kompyuta kujifunza mifumo, kuelewa taarifa na kufanya kazi zinazohitaji uamuzi wa kibinadamu."
                    if swahili else "AI, or artificial intelligence, is technology that enables computers to learn patterns, understand information, and perform tasks that normally require human reasoning.")
        if re.search(r"\b(tsss|tumaini)\b", lower):
            return school_reply(text)
        return ("What means asking for the meaning, identity, or definition of something. Please include the topic after 'what', for example: 'What is evaporation?'"
                if not swahili else "'What' humaanisha kuuliza maana, utambulisho au ufafanuzi wa kitu. Ongeza mada, kwa mfano: 'Nini maana ya evaporation?'")

    if re.search(r"\bwhose\b", lower) or re.search(r"\b(ya nani|wa nani|ni wa nani)\b", lower):
        if re.search(r"\b(motto|slogan|kauli mbiu)\b", lower):
            return f"The motto belongs to {SCHOOL_INFO['name']}: '{SCHOOL_INFO['motto']}'."
        return ("'Whose' asks who owns or is connected to something. Tell me the object or sentence, for example: 'Whose book is this?'"
                if not swahili else "'Whose' humaanisha 'ya nani' au 'wa nani'. Taja kitu unachoulizia, kwa mfano: 'Kitabu hiki ni cha nani?'")

    if re.search(r"\b(who|who is|who are|who was|who were)\b", lower) or re.search(r"\b(nani|ni nani)\b", lower):
        if re.search(r"\b(owner|owns|owned by|proprietor|mmiliki|mwenye shule|inamilikiwa|jina la mmiliki|mmiliki wa shule)\b", lower) and re.search(r"\b(tumaini|tsss|school|shule)\b", lower):
            return (f"Mmiliki wa {SCHOOL_INFO['name']} ni {SCHOOL_INFO['owner']}."
                    if swahili else f"The owner of {SCHOOL_INFO['name']} is {SCHOOL_INFO['owner']}.")
        if re.search(r"\b(head teacher|principal|headmaster|headmistress|mwalimu mkuu|mkuu wa shule|mwalimu mkuu wa shule|school head|leader of the school)\b", lower) or re.search(r"\b(jina\s+la\s+mwalimu\s+mkuu|mwalimu\s+mkuu\s+wa\s+shule|anaitwa\s+nani|ni\s+nani)\b", lower):
            return (f"Mwalimu mkuu wa {SCHOOL_INFO['name']} ni {SCHOOL_INFO['head_teacher']}."
                    if swahili else f"The head teacher of {SCHOOL_INFO['name']} is {SCHOOL_INFO['head_teacher']}.")
        if re.search(r"\b(founder|found|started|established|ilianzishwa)\b", lower) and "tumaini" in lower:
            return "Tumaini Senior Secondary School was established in 2016."
        return ("'Who' asks about a person or group. Please include the name or role, for example: 'Who is a teacher?' or 'Who founded this school?'"
                if not swahili else "'Who' humaanisha 'nani' na huulizia mtu au kundi. Ongeza jina au nafasi, kwa mfano: 'Nani ni mwalimu?'")

    if re.search(r"\b(where|where is|where are|where was)\b", lower) or re.search(r"\b(wapi|iko wapi|ipo wapi|ilipo|ilikuwepo)\b", lower):
        if re.search(r"\b(tumaini|tsss|school|shule)\b", lower):
            return (
                f"{SCHOOL_INFO['name']} is located in {SCHOOL_INFO['location']}. "
                f"Map link: {SCHOOL_INFO['maps_url']}"
                if not swahili else
                f"Shule ya {SCHOOL_INFO['name']} iko {SCHOOL_INFO['location']}. "
                f"Ramani: {SCHOOL_INFO['maps_url']}"
            )
        return ("'Where' asks about a place or location. Include the thing you want to locate, for example: 'Where is Mount Kilimanjaro?'"
            if not swahili else "'Where' humaanisha 'wapi' na huulizia mahali. Taja kitu unachotafuta.")

    if re.search(r"\b(when|when did|when was|when is)\b", lower) or re.search(r"\b(lini|ilikuwa lini)\b", lower):
        if "tumaini" in lower or "tsss" in lower:
            return "Tumaini Senior Secondary School was established in 2016, and Tumaini Senior High School began in 2020."
        return ("'When' asks about time or a date. Include the event, for example: 'When did Tanzania become independent?'"
            if not swahili else "'When' humaanisha 'lini' na huulizia muda au tarehe ya tukio.")

    if re.search(r"\b(why|why does|why is|why are|why did)\b", lower) or re.search(r"\b(kwa nini|kwanini)\b", lower):
        return ("'Why' asks for a reason or cause. State the event or idea, and I will explain the likely causes step by step."
            if not swahili else "'Why' humaanisha 'kwa nini' na huulizia sababu ya jambo. Taja jambo hilo ili nilieleze hatua kwa hatua.")

    if re.search(r"\b(how|how does|how do|how can|how many|how much)\b", lower) or re.search(r"\b(vipi|je nawezaje|jinsi gani)\b", lower):
        return ("'How' asks about a method, process, amount, or possibility. Tell me what you want to do, for example: 'How does photosynthesis work?'"
            if not swahili else "'How' humaanisha 'jinsi gani' au 'vipi'. Taja jambo unalotaka kujifunza au kufanya.")

    return None


def school_reply(message: str) -> str:
    lower = message.lower()
    if re.search(r"(head teacher|principal|headmaster|headmistress|mwalimu mkuu|mkuu wa shule|school head|jina la mwalimu mkuu|mwalimu mkuu wa shule|anaitwa nani)", lower):
        return f"The head teacher of {SCHOOL_INFO['name']} is {SCHOOL_INFO['head_teacher']}."
    if any(word in lower for word in ["owner", "owns", "owned by", "proprietor", "mmiliki", "mwenye shule", "inamilikiwa"]) or re.search(r"jina\s+la\s+mmiliki|mmiliki\s+wa\s+shule|owner\s+of\s+the\s+school", lower):
        return f"The owner of {SCHOOL_INFO['name']} is {SCHOOL_INFO['owner']}."
    if any(word in lower for word in ["type of school", "kind of school", "school type", "aina ya shule", "ordinary level", "advanced level", "o-level", "a-level", "ole", "a level"]) or re.search(r"(ordinary|advanced)\s+level|o[- ]?level|a[- ]?level|aina\s+ya\s+shule|type\s+of\s+school", lower):
        return "This school is an Ordinary Level (O-Level) and Advanced Level (A-Level) school. It offers both levels of secondary education."
    if any(word in lower for word in ["motto", "tagline", "slogan"]):
        return f"The motto of {SCHOOL_INFO['name']} is '{SCHOOL_INFO['motto']}'."
    if any(word in lower for word in ["where", "location", "address", "ipo wapi", "anuani", "ilipo", "inapotokea"]):
        return (
            f"{SCHOOL_INFO['name']} is located in {SCHOOL_INFO['location']}. "
            f"Map: {SCHOOL_INFO['maps_url']}"
            if "where" in lower or "location" in lower or "address" in lower else
            f"Shule ya {SCHOOL_INFO['name']} iko {SCHOOL_INFO['location']}. "
            f"Ramani: {SCHOOL_INFO['maps_url']}"
        )
    if any(word in lower for word in ["contact", "phone", "whatsapp", "wasiliana", "simu"]):
        return f"You can contact the school through {SCHOOL_INFO['contact']} or here: {SCHOOL_INFO['whatsapp_url']}"
    if any(word in lower for word in ["name", "jina", "school called"]):
        return f"The official name is {SCHOOL_INFO['name']}."
    if any(word in lower for word in ["about", "history", "kuhusu", "historia"]):
        return (
            f"{SCHOOL_INFO['name']} is a school community built on excellence and learning. "
            f"The motto is '{SCHOOL_INFO['motto']}'. It is located in {SCHOOL_INFO['location']}. "
            f"It is registered under centre number {SCHOOL_INFO['centre']}."
        )
    return (
        f"{SCHOOL_INFO['description']} It is located in {SCHOOL_INFO['location']}. "
        f"Its motto is '{SCHOOL_INFO['motto']}'. I can help with school info, results, science explanations, and project ideas."
    )


def get_memory_reply(message: str, history: Optional[List[Dict[str, str]]] = None) -> Optional[str]:
    history = history or []
    text = normalize_text(message).lower()
    asks_previous = any(token in text for token in ["previous question", "last question", "what did i ask", "remember my last", "previous answer", "last answer", "what was my last", "nakumbuka", "swali la nyuma", "jibu la nyuma"])
    if not asks_previous or not history:
        return None

    user_entries = [item for item in history if str(item.get("role", "")).lower() == "user"]
    if not user_entries:
        return None

    previous = user_entries[-1].get("text", "").strip()
    if not previous:
        return None

    if "answer" in text or "jibu" in text:
        return f"Your previous question was: \"{previous}\". I can continue from there if you want more detail."
    if "swali" in text:
        return f"Swali lako la nyuma lilikuwa: \"{previous}\". Naweza kuendelea kulieleza kwa undani zaidi."
    return f"I remember your last question: \"{previous}\". We can continue from there."


def build_student_plan(subjects: List[str], days: int = 7, swahili: bool = False) -> str:
    """Build a practical study plan for multiple subjects."""
    safe_subjects = [subject.strip().title() for subject in subjects if subject and subject.strip()][:4]
    if not safe_subjects:
        safe_subjects = ["Biology", "Mathematics"] if swahili else ["Biology", "Mathematics"]

    if swahili:
        lines = [
            f"Mpango wa kujifunza wa siku {days} kwa {', '.join(safe_subjects)}",
            "",
            "1. Siku 1: Pitia mada za msingi na andika nukuu za dakika 20 kwa kila somo.",
            "2. Siku 2: Fanya mazoezi ya 10 kwa somo moja na 5 kwa somo jingine.",
            "3. Siku 3: Jifunze kwa kutumia mifano ya vitendo na chati.",
            "4. Siku 4: Fanya mtihani mfupi wa dakika 30 na uangalie makosa.",
            "5. Siku 5: Rudia kanuni, fomula na jedwali.",
            "6. Siku 6: Tenga muda wa kujaza mapengo ya uelewa.",
            "7. Siku 7: Pitia mafanikio, andika muhtasari na ujiandae kwa mtihani.",
            "",
            "Ushauri: Soma kwa dakika 25, pumzika dakika 5, na uandike makosa kwenye daftari la marudio."
        ]
        return "\n".join(lines)

    lines = [
        f"{days}-day study plan for {', '.join(safe_subjects)}",
        "",
        "1. Day 1: Review the key concepts and write short notes for each subject.",
        "2. Day 2: Solve 10 practice questions in one subject and 5 in another.",
        "3. Day 3: Use examples, diagrams, and summaries to understand difficult ideas.",
        "4. Day 4: Do a 30-minute mini-test and review mistakes.",
        "5. Day 5: Revise formulas, definitions, and diagrams again.",
        "6. Day 6: Focus on weak areas and ask for help only on the missing content.",
        "7. Day 7: Final revision, write quick summaries, and prepare for the real test.",
        "",
        "Tip: Study in 25-minute blocks with 5-minute breaks and track your mistakes in a notebook."
    ]
    return "\n".join(lines)


def smart_student_router(message: str, history: Optional[List[Dict[str, str]]] = None) -> Optional[str]:
    """A stronger high-level routing layer for school and learning tasks."""
    text = normalize_text(message)
    lower = text.lower()
    swahili = is_swahili(text)
    history = history or []

    if re.search(r"\b(ai|artificial intelligence|akili bandia|intelligence)\b", lower) and re.search(r"\b(help|students|wanafunzi|learn|school|schoolwork|soma|benefit|faida|mnufaika)\b", lower):
        if swahili:
            return (
                "AI ni teknolojia inayofanya kompyuta kujifunza, kukumbuka mifumo, na kutoa msaada wa haraka kwa wanafunzi.\n\n"
                "Faida zake kwa shule ni zifuatazo:\n"
                "1. Kusaidia kufundisha kwa njia ya hatua kwa hatua.\n"
                "2. Kutengeneza ratiba ya kujifunza na mipango ya mradi.\n"
                "3. Kutoa maelezo ya haraka ya somo kwa lugha ya kawaida.\n"
                "4. Kusaidia kukagua makosa na kutoa mazoezi ya kujipima.\n\n"
                "Katika shule, AI inafaa kama mwalimu msaidizi, mfanyakazi wa mradi, na mfanyakazi wa kujifunza wa kila siku."
            )
        return (
            "AI is a technology that allows computers to learn patterns, organize information, and respond like a helpful assistant.\n\n"
            "It helps students by:\n"
            "1. Explaining difficult lessons step by step.\n"
            "2. Planning revision and study schedules.\n"
            "3. Creating project ideas and organizing research.\n"
            "4. Giving quick practice questions and feedback.\n\n"
            "In a school setting, AI acts like a tutor, project coach, and study partner."
        )

    if re.search(r"\b(week|siku\s+[0-9]|one week|one week plan|7-day|7 day|mpango wa siku\s+7)\b", lower):
        subjects = []
        for subject in ["biology", "mathematics", "chemistry", "physics", "english", "kiswahili", "history", "geography"]:
            if subject in lower:
                subjects.append(subject)
        if len(subjects) >= 2:
            return build_student_plan(subjects, days=7, swahili=swahili)

    if re.search(r"\b(form\s*[1-6]|kidato\s*cha\s*[a-z]+|class\s*[1-6])\b", lower) and re.search(r"\b(explain|eleza|teach|fundi|quiz|maswali|test|mtihani)\b", lower):
        topic_match = re.search(r"\b(photosynthesis|fotosintesi|mitosis|mitosisi|osmosis|osmosis|gravity|gravity|newton|force|nguvu)\b", lower)
        if topic_match:
            term = topic_match.group(1)
            if swahili:
                if "photosynthesis" in term or "fotosintesi" in term:
                    return "Fotosintesi ni mchakato ambao mimea hutengeneza chakula kwa kutumia mwanga wa jua, maji na carbon dioxide.\n\nHatua kuu:\n1. Majani huchukua carbon dioxide.\n2. Mizizi hufyonza maji.\n3. Chlorophyll huchukua mwanga wa jua.\n4. Glucose hutengenezwa na oxygen hutolewa.\n\nMaswali ya kujipima:\n1. Nini maana ya fotosintesi?\n2. Je, mimea inahitaji nini kwa fotosintesi?\n3. Nini kinatokea kwa oxygen?"
                if "mitosis" in term or "mitosisi" in term:
                    return "Mitosisi ni mgawanyiko wa seli unaotengeneza seli mbili zinazofanana.\n\nHatua zake ni prophase, metaphase, anaphase, telophase, na cytokinesis.\n\nMaswali ya kujipima:\n1. Mitosisi ni nini?\n2. Ni kwa nini mitosisi ni muhimu kwa ukuaji?\n3. Taja hatua zake kuu."
                if "osmosis" in term:
                    return "Osmosis ni mwendo wa maji kupitia utando unaoruhusu maji kupita kutoka sehemu yenye maji mengi kwenda sehemu yenye maji machache.\n\nMfano: seli ya mmea huvimba kwa maji safi.\n\nMaswali:\n1. Osmosis ni nini?\n2. Eleza mfano wa osmosis.\n3. Kwa nini osmosis ni muhimu kwa mimea?"
            return (
                f"{term.title()} is an important school concept.\n\n"
                "Key idea: identify the main process, the conditions required, and the result.\n\n"
                "Quick quiz:\n"
                "1. What is the main function of this process?\n"
                "2. Which materials or conditions are needed?\n"
                "3. What is the final result or importance?\n\n"
                "If you want, I can turn this into a full lesson note or a revision summary."
            )

    if re.search(r"\b(project|mradi|assignment|proposal|idea|title)\b", lower) and re.search(r"\b(chemistry|physics|biology|geography|history|science|sayansi|kemia|fizikia|biolojia)\b", lower):
        topic = re.search(r"(?:about|on|for|ya|cha|la|wa)\s+([a-zA-Z \-]+)", text, re.I)
        topic_name = topic.group(1).strip() if topic else "science"
        return build_project_idea(topic_name, swahili)

    if re.search(r"\b(study plan|mpango wa kusoma|revision plan|ratiba ya kujifunza|learn faster|how to study better)\b", lower):
        subjects = []
        for subject in ["biology", "mathematics", "chemistry", "physics", "english", "kiswahili", "history", "geography"]:
            if subject in lower:
                subjects.append(subject)
        if not subjects:
            subjects = ["biology", "mathematics"]
        return build_student_plan(subjects, days=7, swahili=swahili)

    if re.search(r"\b(who am i|what am i|be smart|make ai smarter|smart ai|akili nyingi|intelligent|smartest|very smart)\b", lower):
        if swahili:
            return "Ninaweza kuwa na akili nyingi kwa maana ya kujifunza kwa makini, kutenganisha mada, kuweka mpango, na kutoa majibu ya hatua kwa hatua. Niko tayari kukusaidia kama mwalimu, mratibu wa mradi, au msaidizi wa utafiti wa shule."
        return "I can act as a more capable learning system by organizing information, checking the point of the question, and giving step-by-step guidance. I can serve as a tutor, project planner, and research assistant for schoolwork."

    return None


def describe_uploaded_image(image_name: str = "", image_size: int = 0) -> str:
    name = (image_name or "image").lower()
    size_info = "small" if image_size < 1_000_000 else "medium" if image_size < 5_000_000 else "large"

    if any(token in name for token in ["lab", "science", "chem", "biology", "experiment"]):
        return f"This looks like a science or lab image. It likely shows an experiment, equipment, or a classroom activity.{' It is a ' + size_info + ' image.' if size_info else ''}"
    if any(token in name for token in ["classroom", "school", "campus", "building", "student", "teacher"]):
        return f"This appears to be a school or classroom image showing students, a lesson, or a building scene.{' It is a ' + size_info + ' image.' if size_info else ''}"
    if any(token in name for token in ["sports", "basket", "football", "field", "game"]):
        return f"This looks like a sports or activity image with movement, players, and school energy.{' It is a ' + size_info + ' image.' if size_info else ''}"
    if any(token in name for token in ["portrait", "person", "face", "selfie"]):
        return f"This appears to be a portrait or person-centered image.{' It is a ' + size_info + ' image.' if size_info else ''}"
    return f"This looks like a general image upload. I can help describe it, explain the scene, or connect it to a lesson or project topic.{' It is a ' + size_info + ' image.' if size_info else ''}"


def summarize_file_context(file_context: str, message: str = "", swahili: bool = False) -> Optional[str]:
    if not file_context:
        return None

    raw_text = (file_context or '').strip()
    if not raw_text:
        return None

    text = normalize_text(raw_text)
    if len(re.sub(r"[^A-Za-z0-9]", "", text)) < 3:
        return None

    snippet = text[:2200]
    prompt = normalize_text(message).lower()

    csv_like = bool(re.search(r',', raw_text) and ("\n" in raw_text or "\r" in raw_text))
    if csv_like:
        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
        headers = [part.strip().strip('"') for part in lines[0].split(',')] if lines else []
        row_count = max(len(lines) - 1, 0)
        if row_count > 0:
            sample_rows = []
            numeric_info = []
            for line in lines[1: min(4, len(lines))]:
                values = [part.strip().strip('"') for part in line.split(',')]
                sample_rows.append(dict(zip(headers[:len(values)], values)))

            for idx, header in enumerate(headers):
                values = []
                for line in lines[1:]:
                    parts = [part.strip().strip('"') for part in line.split(',')]
                    if idx < len(parts):
                        try:
                            values.append(float(parts[idx]))
                        except ValueError:
                            pass
                if values:
                    numeric_info.append((header, min(values), max(values), sum(values) / len(values)))

            sample_row_text = "\n".join(
                f"- {', '.join(f'{key}: {value}' for key, value in row.items())}"
                for row in sample_rows
            )
            numeric_text = "\n".join(
                f"- {name}: lowest {lowest}, highest {highest}, average {average:.2f}"
                for name, lowest, highest, average in numeric_info[:4]
            ) or "- No numeric column was detected."
            csv_summary = (
                ("Muhtasari wa data ya CSV:\n\n" if swahili else "CSV data summary:\n\n")
                + (f"Columns: {', '.join(headers[:8])}\n" if headers else "")
                + f"Rows: {row_count}\n\nSample data:\n{sample_row_text}\n\nKey numeric insight:\n{numeric_text}\n\nMain idea: The file compares multiple entries and shows the key values across rows.\nKey pattern: The most important change or difference is usually in the highest or lowest values.\nConclusion: This data can be used for analysis, comparison, or reporting."
            )
            if re.search(r"\b(summary|summarize|muhtasari|fupisha|overview|tafsiri|recap)\b", prompt):
                return csv_summary + ("\n\nSema nikuambie sehemu gani unayotaka nifafanue zaidi." if swahili else "\n\nTell me which part you want explained further.")

    if re.search(r"\b(summary|summarize|muhtasari|fupisha|overview|tafsiri|recap)\b", prompt):
        return (
            ("Muhtasari wa faili lako:\n\n" if swahili else "Summary of your attached file:\n\n")
            + "Main idea: " + snippet[:300] + "\n\nKey points:\n- The document is centered on the most important information it contains.\n- It emphasizes the main concept or topic being discussed.\n- It gives examples, evidence, or supporting details.\n\nConclusion: This is the core message of the file and can be explained more deeply if needed."
            + ("\n\nSema nikuambie sehemu gani unayotaka nifafanue zaidi." if swahili else "\n\nTell me which section you want explained further.")
        )

    if re.search(r"\b(explain|eleza|fafanua|what does it mean|meaning|meaning of|maana)\b", prompt):
        return (
            ("Nimefuata maelezo kutoka faili lako:\n\n" if swahili else "I used the attached file as context:\n\n")
            + snippet[:1000]
            + ("\n\nNiambie sehemu ya kwanza unayotaka kuelewa kwa undani zaidi." if swahili else "\n\nTell me which section you want explained in more depth.")
        )

    if re.search(r"\b(question|questions|maswali|quiz|test|exam|mtihani)\b", prompt):
        first_lines = [
            "1. What is the main idea of this text?",
            "2. Which key term or concept is most important here?",
            "3. What evidence or example supports the argument?",
            "4. How could this be applied in a school assignment or project?"
        ]
        return (
            ("Maswali ya kujipima kutoka faili lako:\n\n" if swahili else "Practice questions from your attached file:\n\n")
            + "\n".join(first_lines)
            + ("\n\nNinapenda kukutengenezea maswali ya kiwango chako." if swahili else "\n\nI can also turn these into a more specific set for your level.")
        )

    return None


def build_mode_reply(message: str, mode: str, swahili: bool, file_context: str = "") -> Optional[str]:
    topic = normalize_text(message)
    if mode == "deepThink":
        if swahili:
            return (
                f"Uchambuzi wa kina wa: {topic}\n\n"
                "1. Lengo: Tambua swali kuu na kiwango cha maelezo kinachohitajika.\n"
                "2. Dhana muhimu: Gawanya mada katika mawazo madogo yanayoweza kuthibitishwa.\n"
                "3. Njia: Eleza kanuni, tumia mfano, kisha kagua jibu kwa hatua tofauti.\n"
                "4. Hitimisho: Linganisha matokeo na swali la mwanzo.\n\n"
                "Tuma darasa lako au zoezi kamili ili nipate kufanya uchambuzi maalum zaidi."
            )
        return (
            f"Deep analysis of: {topic}\n\n"
            "1. Goal: Identify the exact question and required level of detail.\n"
            "2. Key ideas: Break the topic into smaller claims that can be checked.\n"
            "3. Method: Explain the rule, work through an example, then verify the result.\n"
            "4. Conclusion: Connect the result back to the original question.\n\n"
            "Send your class level or the full exercise for a more tailored analysis."
        )
    if mode == "search":
        prefix = "Utafiti wa mada" if swahili else "Research brief"
        source_note = " Tumia kitabu, syllabus, au chanzo rasmi kuthibitisha taarifa." if swahili else " Verify important claims with a textbook, syllabus, or official source."
        return f"{prefix}: {topic}\n\n1. Swali kuu / Main question\n2. Maneno ya kutafuta / Search terms\n3. Hoja za kulinganisha / Points to compare\n4. Ushahidi unaohitajika / Evidence needed\n5. Muhtasari wa hitimisho / Conclusion summary\n\n{source_note}"
    if file_context:
        excerpt = normalize_text(file_context)[:1800]
        label = "Nimeunganisha faili lako na swali hili" if swahili else "I connected your file with this question"
        return f"{label}: {topic}\n\n{excerpt}\n\n" + ("Niambie kama unataka muhtasari, maswali ya mtihani, au maelezo ya sehemu fulani." if swahili else "Tell me whether you want a summary, exam questions, or an explanation of a specific section.")
    return None


def build_human_like_reply(message: str, swahili: bool = False) -> Optional[str]:
    text = normalize_text(message)
    lower = text.lower()

    if re.search(r"\b(answer me|jibu|reply|respond|boresha|boresha|sema|comment|answer this|jibu hili|jibu swali)\b", lower):
        if swahili:
            return (
                "Nimekuelewa. Ninaweza kukupa jibu la kawaida, la hatua kwa hatua, na la kueleweka kwa urahisi. "
                "Tafadhali niambie swali lako kwa ukamilifu, ukiwepo na somo au muktadha wake, nitakupa jibu bora zaidi."
            )
        return (
            "I understand. I can answer clearly, practically, and in a friendly way. "
            "Please give me the full question or topic, and I will explain it in a simple, helpful manner."
        )

    if re.search(r"\b(hi|hello|hey|habari|hujambo|mambo|salaam|good morning|good afternoon|good evening)\b", lower):
        if swahili:
            return "Habari! Niko hapa kukusaidia kwa mambo ya shule, masomo, mradi, na maelezo ya kila siku. Uliza swali lako, nitakupa jibu la kawaida na la wazi."
        return "Hello! I am here to help with schoolwork, study questions, projects, and everyday learning. Ask me anything and I will answer clearly and naturally."

    if re.search(r"\b(thank you|thanks|asante|shukrani|karibu)\b", lower):
        if swahili:
            return "Karibu! Ninafurahi kukusaidia. Uliza swali lingine lolote, nitakupa jibu la haraka na la wazi."
        return "You are welcome! I am glad to help. Ask me another question whenever you need a clear answer."

    if re.search(r"\b(what are you|wewe ni nini|unafanya nini|what can you do|what do you do|unaweza kufanya nini)\b", lower):
        if swahili:
            return "Ninaweza kukusaidia kwa masomo, mradi, maelezo ya somo, ratiba ya kujifunza, na habari za shule kwa namna ya rafiki na ya hatua kwa hatua."
        return "I can help with school subjects, projects, explanations, study planning, and general school information in a natural and friendly way."

    if re.search(r"\b(you are smart|you are good|you are helpful|wewe ni mzuri|wewe ni smart|una akili|wewe ni msaidizi)\b", lower):
        if swahili:
            return "Asante! Ninafanya kazi kuleta majibu ya wazi, ya haraka, na ya kutumika kwa wanafunzi na jamii ya shule."
        return "Thank you! I am here to give clear, helpful, and useful answers that make learning easier."

    if re.search(r"\b(i am bored|nimechoka|sina furaha|nimekosa motivation|nimefika|nina shida|i feel stuck|naumwa)\b", lower):
        if swahili:
            return "Hilo ni la kawaida. Kitu muhimu ni kuchukua hatua ndogo: chukua pumzi, weka lengo la dakika 10, kisha uendelee kidogo kidogo. Ninaweza kukusaidia kupanga hatua za kujifunza au kufanya kazi yako."
        return "That happens to many people. The best way forward is to take one small step, not a huge one. I can help you break the task into manageable steps and make it feel lighter."

    return None


def build_expert_general_reply(message: str, swahili: bool = False) -> Optional[str]:
    """Provide deeper, more structured responses for general explanation questions."""
    text = normalize_text(message)
    lower = text.lower()

    if not re.search(r"\b(explain|eleza|fafanua|describe|tafsiri|teach|fundi|how to|jinsi ya|why|kwa nini|compare|linganisha|meaning|maana|summarize|fupisha|plan|mpango|step by step|hatua kwa hatua)\b", lower):
        return None

    if not lower or len(lower) < 8:
        return None

    topic = text
    if re.search(r"\b(?:about|on|for|ya|kwa|kuhusu)\s+(.+)$", text, re.I):
        topic = re.search(r"\b(?:about|on|for|ya|kwa|kuhusu)\s+(.+)$", text, re.I).group(1).strip()
    if len(topic) > 120:
        topic = topic[:120].rstrip(" ?.")

    if swahili:
        return (
            f"Kila swali lina maana ya kukaa na kuelewa kwa undani. Kwa swali lako kuhusu: \"{topic}\"\n\n"
            "Kwanza: tambua lengo la swali — unahitaji maana, sababu, mfano, au njia ya kutekeleza.\n"
            "Pili: gawanya swali katika sehemu ndogo, kama: msingi, hatua, na matokeo.\n"
            "Tatu: toa mifano ya vitendo ili idea iwe rahisi kueleweka.\n"
            "Nne: toa muhtasari wa mwisho kwa sentensi 2-3 zaidi.\n\n"
            "Mfano wa njia ya kujibu: "
            f"\"{topic}\" inahitaji kuelewa kwa hatua kwa hatua. Anza kwa kanuni kuu, onyesha mfano rahisi, kisha uunganishe na matumizi yake ya vitendo. Hivyo jibu linakuwa la maana, la wazi, na la kufaa kwa wanafunzi.\"\n\n"
            "Ukiwa na swali la kweli, niambie somo au tatizo lako kwa ukamilifu, na nitakupa jibu la kina, la hatua kwa hatua, na la kifani."
        )

    return (
        f"To answer a question well, I first identify the real goal behind it: is it asking for meaning, cause, method, comparison, or an example? For your topic: \"{topic}\"\n\n"
        "Step 1: define the core idea in simple language.\n"
        "Step 2: explain the main process or rules behind it.\n"
        "Step 3: give one practical example that makes it easy to understand.\n"
        "Step 4: close with a short summary and an action you can take next.\n\n"
        "This approach makes the answer clearer, more accurate, and more useful than a shallow one-word response. "
        "If you give me the exact question, I can give you a deeper, more specific answer tailored to your level."
    )


def local_reply(message: str, history: Optional[List[Dict[str, str]]] = None, image_name: str = "", image_size: int = 0, mode: str = "", file_context: str = "", education_level: str = "") -> str:
    history = history or []
    text = normalize_text(message)
    lower = text.lower()
    swahili = is_swahili(text)
    mode_reply = build_mode_reply(text, mode, swahili, file_context)
    if mode_reply:
        return mode_reply

    file_summary_reply = summarize_file_context(file_context, text, swahili)
    if file_summary_reply:
        return file_summary_reply

    if not text:
        return "Please type a question or topic and I will help you."

    if education_level.lower() == "o-level":
        olevel_answer = answer_general_question(text, history)
        if olevel_answer:
            return olevel_answer

    if re.search(r"\b(long story|story ndefu|stori ndefu|story ya muda mrefu|muda mrefu|long narrative|narrative ya muda mrefu|story long|muda mrefu story)\b", lower, re.I):
        return build_long_story_reply(text, swahili)

    if re.search(r"\b(story|stori|narrative|tell me a story|once upon a time|storytelling|tale|tell me a short story|tell me a story about|piga story|kupiga story|kupiga nayo story|kuandika story|story ya|ninafanyanga story|stori ya)\b", lower, re.I):
        return build_story_reply(text, swahili)

    if is_live_web_search_request(text):
        web_result = fetch_web_search_result(text)
        if web_result:
            return (
                f"{web_result}"
                f"\n\n{('Hii ni taarifa ya haraka; kuthibitisha kwa vyanzo rasmi ni muhimu.' if swahili else 'This is a quick web result; verify important claims with trusted sources.') }"
            )

    smart_route_reply = smart_student_router(text, history)
    if smart_route_reply:
        return smart_route_reply

    expert_reply = build_expert_general_reply(text, swahili)
    if expert_reply:
        return expert_reply

    memory_reply = get_memory_reply(text, history)
    if memory_reply:
        return memory_reply
    percentage_reply = solve_percentage_problem(text)
    if percentage_reply:
        return percentage_reply
    ratio_reply = solve_ratio_sharing(text)
    if ratio_reply:
        return ratio_reply
    conversion_reply = solve_unit_conversion(text)
    if conversion_reply:
        return conversion_reply
    math_reply = solve_math_problem(text)
    if math_reply:
        return math_reply
    equation_reply = solve_linear_equation(text)
    if equation_reply:
        return equation_reply
    topic_reply = get_math_topic_reply(text, is_swahili(text))
    if topic_reply:
        return topic_reply
    curriculum_reply = get_subject_curriculum_reply(text, is_swahili(text))
    if curriculum_reply:
        return curriculum_reply
    compound_reply = answer_compound_request(text, is_swahili(text))
    if compound_reply:
        return compound_reply
    if image_name and re.search(r"\b(image|photo|picture|picha|upload|attach|attached)\b", lower):
        return describe_uploaded_image(image_name, image_size)
    if re.search(r"\b(photosynthesis|fotosintesis|fotosintesi)\b", lower):
        return explain_photosynthesis()
    if re.search(r"\b(mitosis|mitosisi)\b", lower):
        return explain_mitosis()
    if re.search(r"\b(osmosis|osmosis)\b", lower):
        return explain_osmosis()
    if re.search(r"\b(study plan|ratiba|mpango wa kusoma|study timetable)\b", lower):
        subject = "biology"
        match = re.search(r"(?:for|ya|cha)\s+([a-zA-Z ]{2,30})", text, flags=re.I)
        if match:
            subject = match.group(1).strip()
        return build_study_plan(subject, swahili=is_swahili(text))
    if re.search(r"\b(project|assignment|proposal|project idea|project title|mradi)\b", lower):
        subject = re.search(r"(?:about|on|for|ya|cha|la|wa)\s+([a-zA-Z ]{2,40})", text, flags=re.I)
        topic = "sayansi" if "sayansi" in lower else subject.group(1).strip() if subject else "science"
        return build_project_idea(topic, swahili=is_swahili(text))
    question_reply = answer_general_question(text, history)
    if question_reply:
        return question_reply
    if re.search(r"\b(tumaini|tsss|senior high|school info|kuhusu shule|about school)\b", lower):
        return school_reply(text)
    if re.search(r"\b(whatsapp|facebook|instagram|tiktok|youtube|social media|mitandao)\b", lower):
        return (
            "You can follow Tumaini Schools on social media here:\n"
            f"Instagram: {SCHOOL_INFO['instagram']}\n"
            f"TikTok: {SCHOOL_INFO['tiktok']}\n"
            f"Facebook: {SCHOOL_INFO['facebook']}\n"
            f"YouTube: {SCHOOL_INFO['youtube']}\n"
            f"WhatsApp: {SCHOOL_INFO['whatsapp_url']}"
        )
    if re.search(r"\b(necta|matokeo|results|exam results|mwaka)\b", lower):
        return (
            "I can help with school exam results, but for the official verified NECTA records, "
            f"please open this page: {SCHOOL_INFO['necta']}. "
            f"The school centre number is {SCHOOL_INFO['centre']} and the school is {SCHOOL_INFO['name']}."
        )
    if re.search(r"\b(math|mathematics|hisabati|algebra|equation|formula)\b", lower):
        return "I can help with mathematics step by step. Please send the exact equation or problem, and I will solve it clearly with the working process."
    if re.search(r"\b(science|sayansi|biology|chemistry|physics)\b", lower):
        return "Science is the study of the natural world. I can help you explain ideas, create revision notes, write reports, or plan experiments."
    if re.search(r"\b(hello|hi|habari|salam)\b", lower):
        return "Hello! I am Tumaini Schools AI. I can help with schoolwork, research, study plans, projects, and school information."

    human_like_reply = build_human_like_reply(text, swahili)
    if human_like_reply:
        return human_like_reply

    if is_swahili(text):
        return "Nimeelewa swali lako. Ninaweza kukusaidia kwa maelezo ya hatua kwa hatua, kuunda mradi, kupanga ratiba ya kujifunza, au kueleza somo kwa kifupi zaidi. Kwanza niambie somo lako au tatizo lako, na nitakupa jibu la maana na la wazi."
    if re.search(r"\b(teach|explain|help|plan|write|summarize|research)\b", lower):
        return "I can help with that. Please tell me the subject, your class level, and the exact task, and I will provide a clear answer, plan, or example in a simple and natural way."
    return "I can help with many kinds of questions, from schoolwork to general knowledge. Tell me the topic, your level, and the exact question, and I will explain it in a clear, friendly, and human-like way."


def generate_reply(message: str, history: Optional[List[Dict[str, str]]] = None, image_name: str = "", image_size: int = 0, mode: str = "", file_context: str = "", education_level: str = "") -> str:
    """Pure local AI-like engine with no external API keys."""
    history = history or []
    return local_reply(message, history, image_name, image_size, mode, file_context, education_level)


class ChatHandler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, payload: Dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/":
            self._send_json(200, {
                "status": "ok",
                "name": "Tumaini Schools AI Python backend",
                "message": "Use POST /chat to send a school question."
            })
            return

        self._send_json(404, {"error": "Not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/chat":
            self._send_json(404, {"error": "Route not found"})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length) if length > 0 else b"{}"
            data = json.loads(raw.decode("utf-8") or "{}") if raw else {}
        except Exception:
            data = {}

        message = str(data.get("message", "")).strip()
        history = data.get("history", []) if isinstance(data.get("history", []), list) else []
        image_name = str(data.get("image_name", "") or "").strip()
        image_size = int(data.get("image_size", 0) or 0)
        mode = str(data.get("mode", "") or "").strip()
        file_context = str(data.get("file_context", "") or "").strip()[:30000]
        education_level = str(data.get("education_level", "") or "").strip()

        if not message:
            self._send_json(400, {"error": "Please send a non-empty 'message'."})
            return

        reply = generate_reply(message, history, image_name, image_size, mode, file_context, education_level)
        self._send_json(200, {"reply": reply, "mode": mode or "tutor", "language": "swahili" if is_swahili(message) else "english"})

    def log_message(self, format: str, *args: Any) -> None:
        # Keep server logs clean
        return


def run_server(port: int = 8000, host: str = "0.0.0.0") -> None:
    server = HTTPServer((host, port), ChatHandler)
    print(f"Tumaini Schools AI backend is running at http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    run_server(port=port)
