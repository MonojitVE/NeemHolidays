from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_admin
from app.models.models import RSSFeed, GeneratedContent, SocialPost

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
def summary(db: Session = Depends(get_db), user=Depends(require_admin)):
    return {
        "total_rss_articles": db.query(RSSFeed).count(),
        "pending_review": db.query(GeneratedContent).filter(GeneratedContent.status == "pending").count(),
        "rejected": db.query(GeneratedContent).filter(GeneratedContent.status == "rejected").count(),
        "posted": db.query(GeneratedContent).filter(GeneratedContent.status == "posted").count(),
        "social_posts": db.query(SocialPost).count(),
    }