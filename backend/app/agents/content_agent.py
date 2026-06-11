import json
import re
import html
import requests
from datetime import datetime
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import RSSFeed, BrandSetting, GeneratedContent


FALLBACK = {
    "blog_title": "A Fresh Travel Story Worth Exploring",
    "slug": "fresh-travel-story",
    "meta_description": "Explore a fresh travel idea with practical inspiration for your next trip.",
    "article": "This travel update brings together destination inspiration, practical tips, and modern travel storytelling.",
    "instagram_caption": "A fresh travel story to add to your list. ✈️",
    "facebook_post": "Discover a new travel idea and start planning your next escape.",
    "linkedin_post": "Travel continues to shape tourism, lifestyle, and destination discovery.",
    "hashtags": "#Travel #EuropeTravel #Amsterdam #Paris #TravelNews",
    "image_prompt": "Premium European travel brochure style image, teal and orange branding, magazine layout",
    "cta": "Plan your next escape today",
}


def clean_html_text(value: str) -> str:
    if not value:
        return ""

    value = html.unescape(value)
    soup = BeautifulSoup(value, "html.parser")
    text = soup.get_text(" ", strip=True)

    text = re.sub(r"The post .*? appeared first on .*?\.", "", text, flags=re.I)
    text = re.sub(r"\[\s*…\s*\]|\[\s*\.\.\.\s*\]|\[&#8230;\]", "...", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


def _slug(text: str) -> str:
    return re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")[:220] or "travel-blog"


def _extract_json(text: str) -> dict:
    try:
        return json.loads(text)
    except Exception:
        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1:
            raise ValueError("Invalid AI JSON")
        return json.loads(text[start:end + 1])


def _brand(db: Session):
    brand = db.query(BrandSetting).first()

    if not brand:
        brand = BrandSetting()
        db.add(brand)
        db.commit()
        db.refresh(brand)

    return brand


def _prompt(feed: RSSFeed, brand: BrandSetting):
    clean_summary = clean_html_text(feed.summary)
    today = datetime.now().strftime("%B %d, %Y")

    return f"""
Return ONLY valid JSON. Do not include markdown code blocks.

You are an AI travel content writer.

Today's date is {today}.

Create a clean, readable, professional travel blog from this RSS news article.

Important rules:
- Do NOT copy raw HTML.
- Do NOT include <p>, <a>, HTML tags, HTML entities, or "The post appeared first on".
- Rewrite the article in a polished travel-news style.
- Format the article using plain text paragraphs separated by \\n\\n.
- This content is only about Paris or Amsterdam.
- Mention the exact article/news date: {feed.published_date}.
- If the article discusses a past incident, say the incident happened on or around the given date.
- If the article discusses a future event, clearly mention the event date or time period if available in the source text.
- If no future event date is available, write that the date has not been confirmed in the source.
- Do not say "recently" alone. Always use a concrete date when discussing news, events, or incidents.
- Make the blog useful for travelers.
- Add a clear intro, travel impact, what travelers should know, and conclusion.
- Do not mention that it was generated from RSS.

Brand:
Name: {brand.brand_name}
Tone: {brand.tone_of_voice}
CTA: {brand.cta_format}
Social Style: {brand.social_style}

RSS Article:
Title: {feed.title}
Source: {feed.source}
Category: {feed.category}
City: {feed.city}
Published Date: {feed.published_date}
Summary: {clean_summary}
Original Link: {feed.link}

JSON format:
{{
  "blog_title": "",
  "slug": "",
  "meta_description": "",
  "article": "",
  "instagram_caption": "",
  "facebook_post": "",
  "linkedin_post": "",
  "hashtags": "",
  "image_prompt": "",
  "cta": ""
}}
"""


def _groq(prompt: str):
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY missing")

    res = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": settings.GROQ_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": "You generate clean valid JSON travel content only. Never output HTML.",
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.6,
            "max_tokens": 2600,
        },
        timeout=60,
    )

    if res.status_code != 200:
        raise ValueError(res.text)

    return _extract_json(res.json()["choices"][0]["message"]["content"])


def generate_content_for_feed(db: Session, feed_id: int):
    feed = db.query(RSSFeed).filter(RSSFeed.id == feed_id).first()

    if not feed:
        raise ValueError("Feed not found")

    existing = db.query(GeneratedContent).filter(GeneratedContent.feed_id == feed.id).first()

    if existing:
        return existing

    clean_summary = clean_html_text(feed.summary)

    try:
        data = _groq(_prompt(feed, _brand(db)))
    except Exception as e:
        print("AI failed, fallback used:", e)
        data = FALLBACK.copy()
        data["blog_title"] = clean_html_text(feed.title)
        data["meta_description"] = clean_summary[:155]
        data["article"] = (
            f"{clean_html_text(feed.title)}\n\n"
            f"Published Date: {feed.published_date}\n\n"
            f"{clean_summary}\n\n"
            f"Travelers should check the latest official updates before planning their trip.\n\n"
            f"Original source: {feed.link}"
        )

    content = GeneratedContent(
        feed_id=feed.id,
        blog_title=clean_html_text(data.get("blog_title") or feed.title),
        slug=_slug(data.get("slug") or data.get("blog_title") or feed.title),
        meta_description=clean_html_text(data.get("meta_description") or clean_summary[:155]),
        article=clean_html_text(data.get("article") or clean_summary),
        instagram_caption=clean_html_text(data.get("instagram_caption")),
        facebook_post=clean_html_text(data.get("facebook_post")),
        linkedin_post=clean_html_text(data.get("linkedin_post")),
        hashtags=clean_html_text(data.get("hashtags")),
        image_prompt=clean_html_text(data.get("image_prompt")),
        cta=clean_html_text(data.get("cta")),
        status="pending",
    )

    feed.status = "generated"

    db.add(content)
    db.commit()
    db.refresh(content)

    return content