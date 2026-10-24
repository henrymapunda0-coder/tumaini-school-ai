import os

SCHOOL_INFO = {
    "name": os.getenv("SCHOOL_NAME", "TUMAINI SENIOR HIGH SCHOOL"),
    "short_name": os.getenv("SCHOOL_SHORT_NAME", "TSSS"),
    "owner": os.getenv("SCHOOL_OWNER", "MODEST BAYO"),
    "head_teacher": os.getenv("SCHOOL_HEAD_TEACHER", "SIFAEL MSENGI"),
    "principal": os.getenv("SCHOOL_PRINCIPAL", "SIFAEL MSENGI"),
    "motto": os.getenv("SCHOOL_MOTTO", "Together We Excel"),
    "location": os.getenv("SCHOOL_LOCATION", "Arusha Region, Monduli District, Makuyuni Village"),
    "maps_url": os.getenv("SCHOOL_MAPS_URL", "https://maps.app.goo.gl/DMhw9Y3KsRisWRQ99"),
    "postal": os.getenv("SCHOOL_POSTAL", "P.O. Box 312"),
    "centre": os.getenv("SCHOOL_CENTRE", "S5493"),
    "contact": os.getenv("SCHOOL_CONTACT", "WhatsApp 0745212613"),
    "whatsapp_url": os.getenv("SCHOOL_WHATSAPP_URL", "https://wa.me/255745212613"),
    "instagram": os.getenv("SCHOOL_INSTAGRAM", "https://www.instagram.com/tumainischoolstz/"),
    "tiktok": os.getenv("SCHOOL_TIKTOK", "https://www.tiktok.com/@tumainischoolstz"),
    "facebook": os.getenv("SCHOOL_FACEBOOK", "https://www.facebook.com/"),
    "youtube": os.getenv("SCHOOL_YOUTUBE", "https://www.youtube.com/@tumainischools"),
    "video": os.getenv("SCHOOL_VIDEO", "https://youtu.be/6bEnp3HcZFM"),
    "necta": os.getenv("SCHOOL_NECTA", "https://necta.go.tz/"),
    "description": os.getenv(
        "SCHOOL_DESCRIPTION",
        "Tumaini Senior High School is a school community focused on excellence, learning, discipline, and future-ready education.",
    ),
}
