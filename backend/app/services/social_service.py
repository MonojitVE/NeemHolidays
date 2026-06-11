from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import GeneratedContent, SocialPost


def _mock_url(platform: str, content_id: int):
    return f"https://mock-social.local/{platform}/travel-post-{content_id}"


def auto_post_content(db: Session, content_id: int):
    content = db.query(GeneratedContent).filter(GeneratedContent.id == content_id).first()

    if not content:
        raise ValueError("Content not found")

    posts = [
        ("instagram", content.instagram_caption),
        ("facebook", content.facebook_post),
        ("linkedin", content.linkedin_post),
    ]

    created_posts = []

    for platform, body in posts:
        post = SocialPost(
            content_id=content.id,
            platform=platform,
            body=body or "",
            mode="mock" if settings.MOCK_MODE else "api",
            status="posted" if settings.MOCK_MODE else "failed",
            post_url=_mock_url(platform, content.id) if settings.MOCK_MODE else None,
            error_log=None if settings.MOCK_MODE else "Real social API posting is not configured yet.",
            api_response={
                "mock": settings.MOCK_MODE,
                "message": "Posted successfully in mock mode"
                if settings.MOCK_MODE
                else "Real API not configured",
            },
        )

        db.add(post)
        created_posts.append(post)

    content.status = "posted" if settings.MOCK_MODE else "failed"
    db.commit()

    for post in created_posts:
        db.refresh(post)

    return created_posts


def create_manual_posts(db: Session, content_id: int):
    """
    Compatibility function for existing app/api/social.py.
    Creates mock/manual social posts for a generated content item.
    """
    return auto_post_content(db, content_id)


def mark_posted(db: Session, post_id: int):
    """
    Compatibility function for existing app/api/social.py.
    Marks one social post as posted.
    """
    post = db.query(SocialPost).filter(SocialPost.id == post_id).first()

    if not post:
        raise ValueError("Social post not found")

    post.status = "posted"
    post.error_log = None

    if not post.post_url:
        post.post_url = _mock_url(post.platform, post.content_id)

    db.commit()
    db.refresh(post)

    return post