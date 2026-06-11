from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import SocialPost
from app.services.social_service import create_manual_posts, mark_posted
router=APIRouter(prefix="/social", tags=["Social"])
@router.post("/queue/{content_id}")
def queue(content_id:int, db:Session=Depends(get_db), user=Depends(get_current_user)):
    try: return create_manual_posts(db, content_id)
    except Exception as e: raise HTTPException(400,str(e))
@router.get("/")
def posts(db:Session=Depends(get_db), user=Depends(get_current_user)):
    return db.query(SocialPost).order_by(SocialPost.created_at.desc()).limit(100).all()
@router.patch("/{post_id}/posted")
def posted(post_id:int, db:Session=Depends(get_db), user=Depends(get_current_user)):
    try: return mark_posted(db, post_id)
    except Exception as e: raise HTTPException(404,str(e))
