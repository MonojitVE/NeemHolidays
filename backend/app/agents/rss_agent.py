import time
import re
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime

import feedparser
from sqlalchemy.orm import Session

from app.models.models import RSSFeed


MIN_BLOGS_PER_FETCH = 2
MAX_BLOGS_PER_FETCH = 10
MAX_NEWS_AGE_DAYS = 30

TARGET_CITIES = ["paris", "amsterdam"]

RSS_SOURCES = [
    {
        "url": "https://www.timeout.com/paris/rss",
        "source": "Time Out Paris",
        "city": "Paris",
        "category": "Paris Culture & Events",
    },
    {
        "url": "https://www.sortiraparis.com/rss",
        "source": "Sortir à Paris",
        "city": "Paris",
        "category": "Paris Events & Attractions",
    },
    {
        "url": "https://www.parisdiscoveryguide.com/paris-rss.xml",
        "source": "Paris Discovery Guide",
        "city": "Paris",
        "category": "Paris Tourism",
    },
    {
        "url": "https://www.iamsterdam.com/en/whats-on/rss",
        "source": "I Amsterdam",
        "city": "Amsterdam",
        "category": "Amsterdam Events",
    },
    {
        "url": "https://www.dutchnews.nl/feed/",
        "source": "DutchNews",
        "city": "Amsterdam",
        "category": "Amsterdam News",
    },
    {
        "url": "https://www.timeout.com/amsterdam/rss",
        "source": "Time Out Amsterdam",
        "city": "Amsterdam",
        "category": "Amsterdam Culture & Attractions",
    },
    {
        "url": "https://www.euronews.com/rss?level=theme&name=travel",
        "source": "Euronews Travel",
        "city": "Paris Amsterdam",
        "category": "Travel News",
    },
    {
        "url": "https://www.schengenvisainfo.com/news/feed/",
        "source": "Schengen Visa Info",
        "city": "Paris Amsterdam",
        "category": "Europe Travel News",
    },
]


def _clean_text(text):
    if not text:
        return ""

    text = str(text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"&[^;]+;", " ", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def _parse_date(entry):
    date_value = (
        getattr(entry, "published", None)
        or getattr(entry, "updated", None)
        or getattr(entry, "created", None)
    )

    # Some RSS feeds do not provide date properly.
    # Instead of rejecting them, treat them as current articles.
    if not date_value:
        return datetime.now(timezone.utc)

    try:
        parsed = parsedate_to_datetime(date_value)

        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)

        return parsed.astimezone(timezone.utc)

    except Exception:
        return datetime.now(timezone.utc)


def _is_within_last_month(entry_date):
    if not entry_date:
        return True

    now = datetime.now(timezone.utc)
    oldest_allowed = now - timedelta(days=MAX_NEWS_AGE_DAYS)

    return oldest_allowed <= entry_date <= now + timedelta(days=365)


def _format_date(entry_date):
    if not entry_date:
        return datetime.now(timezone.utc).strftime("%B %d, %Y")

    return entry_date.strftime("%B %d, %Y")


def _get_image(entry):
    if hasattr(entry, "media_content") and entry.media_content:
        return entry.media_content[0].get("url")

    if hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
        return entry.media_thumbnail[0].get("url")

    if hasattr(entry, "links"):
        for link in entry.links:
            link_type = link.get("type", "")
            if link_type.startswith("image"):
                return link.get("href")

    return None


def _detect_city(title, summary, default_city):
    text = f"{title} {summary}".lower()

    paris_terms = [
        "paris",
        "france",
        "french",
        "eiffel",
        "louvre",
        "seine",
        "montmartre",
        "versailles",
        "notre dame",
        "champs",
        "latin quarter",
        "marais",
    ]

    amsterdam_terms = [
        "amsterdam",
        "netherlands",
        "dutch",
        "holland",
        "canal",
        "rijksmuseum",
        "van gogh",
        "anne frank",
        "keukenhof",
        "dam square",
        "jordaan",
    ]

    has_paris = any(term in text for term in paris_terms)
    has_amsterdam = any(term in text for term in amsterdam_terms)

    if has_paris and has_amsterdam:
        return "Paris & Amsterdam"

    if has_paris:
        return "Paris"

    if has_amsterdam:
        return "Amsterdam"

    # Keep article around the source city if source itself is city-specific
    if default_city == "Paris":
        return "Paris"

    if default_city == "Amsterdam":
        return "Amsterdam"

    if default_city == "Paris Amsterdam":
        return "Paris & Amsterdam"

    return None


def _is_relevant(title, summary, source_city):
    text = f"{title} {summary}".lower()

    paris_terms = [
        "paris",
        "france",
        "french",
        "eiffel",
        "louvre",
        "seine",
        "montmartre",
        "versailles",
        "notre dame",
        "champs",
        "marais",
    ]

    amsterdam_terms = [
        "amsterdam",
        "netherlands",
        "dutch",
        "holland",
        "canal",
        "rijksmuseum",
        "van gogh",
        "anne frank",
        "keukenhof",
        "jordaan",
    ]

    broad_travel_terms = [
        "travel",
        "tourism",
        "tourist",
        "visitor",
        "holiday",
        "vacation",
        "trip",
        "flight",
        "airport",
        "hotel",
        "restaurant",
        "food",
        "museum",
        "gallery",
        "culture",
        "art",
        "festival",
        "event",
        "exhibition",
        "concert",
        "attraction",
        "landmark",
        "city",
        "weekend",
        "guide",
        "things to do",
        "where to stay",
        "what to see",
        "nightlife",
        "architecture",
        "heritage",
        "transport",
    ]

    has_paris = any(term in text for term in paris_terms)
    has_amsterdam = any(term in text for term in amsterdam_terms)
    has_travel_context = any(term in text for term in broad_travel_terms)

    # Stretch rule:
    # If the RSS source itself is Paris or Amsterdam specific,
    # accept the article and keep the category same.
    if source_city == "Paris":
        return True

    if source_city == "Amsterdam":
        return True

    # General travel feeds should mention Paris/Amsterdam or travel context
    if source_city == "Paris Amsterdam":
        return has_paris or has_amsterdam or has_travel_context

    return has_paris or has_amsterdam or has_travel_context


def _entry_to_dict(entry, source):
    title = _clean_text(getattr(entry, "title", "Untitled Travel News"))

    summary = _clean_text(
        getattr(entry, "summary", "")
        or getattr(entry, "description", "")
        or getattr(entry, "subtitle", "")
    )

    link = getattr(entry, "link", None)
    entry_date = _parse_date(entry)

    if not link:
        return None

    if not _is_within_last_month(entry_date):
        return None

    if not _is_relevant(title, summary, source["city"]):
        return None

    detected_city = _detect_city(title, summary, source["city"])

    if not detected_city:
        return None

    formatted_date = _format_date(entry_date)

    return {
        "title": title[:255],
        "source": source["source"],
        "city": detected_city,
        "category": source["category"],
        "summary": summary[:3000],
        "link": link,
        "image": _get_image(entry),
        "published_date": formatted_date,
        "sort_date": entry_date,
    }


def _collect_rss_articles():
    articles = []
    seen_links = set()

    print("RSS source count:", len(RSS_SOURCES))

    for source in RSS_SOURCES:
        try:
            print(f"Checking RSS: {source['source']} -> {source['url']}")

            parsed = feedparser.parse(source["url"])

            print(f"Entries found from {source['source']}: {len(parsed.entries)}")

            if getattr(parsed, "bozo", False):
                print(
                    f"RSS warning for {source['source']}: "
                    f"{getattr(parsed, 'bozo_exception', '')}"
                )

            for entry in parsed.entries[:20]:
                data = _entry_to_dict(entry, source)

                if not data:
                    continue

                if data["link"] in seen_links:
                    continue

                seen_links.add(data["link"])
                articles.append(data)

        except Exception as e:
            print(f"RSS failed: {source['source']} - {e}")

    articles.sort(key=lambda x: x["sort_date"], reverse=True)

    print("Valid RSS articles after filtering:", len(articles))

    return articles




def fetch_and_store_feeds(db: Session):
    """
    Fetch rule:
    - Fetch Paris/Amsterdam related RSS articles.
    - Keep source categories exactly same.
    - Store new articles in rss_feeds table.
    - Generate minimum 2 available items if valid articles exist.
    - Generate maximum 10 items per fetch.
    """

    all_articles = _collect_rss_articles()
    new_feeds = []

    if not all_articles:
        print("No valid RSS articles collected.")
        return new_feeds

    # First save brand-new links
    for article in all_articles:
        if len(new_feeds) >= MAX_BLOGS_PER_FETCH:
            break

        exists = db.query(RSSFeed).filter(RSSFeed.link == article["link"]).first()

        if exists:
            continue

        feed = RSSFeed(
            title=article["title"],
            source=article["source"],
            city=article["city"],
            category=article["category"],
            summary=article["summary"],
            link=article["link"],
            image=article["image"],
            published_date=article["published_date"],
            status="fetched",
        )

        db.add(feed)
        db.flush()
        new_feeds.append(feed)

    # If all articles already exist, create a fresh demo batch
    # so your Content Review can still generate 2 blogs.
    if len(new_feeds) < MIN_BLOGS_PER_FETCH:
        batch_time = int(time.time())

        for article in all_articles:
            if len(new_feeds) >= MIN_BLOGS_PER_FETCH:
                break

            fresh_link = f"{article['link']}?batch={batch_time}-{len(new_feeds)}"

            exists = db.query(RSSFeed).filter(RSSFeed.link == fresh_link).first()

            if exists:
                continue

            feed = RSSFeed(
                title=article["title"],
                source=article["source"],
                city=article["city"],
                category=article["category"],
                summary=article["summary"],
                link=fresh_link,
                image=article["image"],
                published_date=article["published_date"],
                status="fetched",
            )

            db.add(feed)
            db.flush()
            new_feeds.append(feed)

    db.commit()

    print("New feeds stored:", len(new_feeds))

    return new_feeds[:MAX_BLOGS_PER_FETCH]
