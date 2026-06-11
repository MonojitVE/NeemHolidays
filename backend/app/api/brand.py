from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_admin, get_current_user
from app.models.models import BrandSetting
from app.schemas.schemas import BrandIn
router=APIRouter(prefix="/brand", tags=["Brand"])
@router.get("/")
def get_brand(db:Session=Depends(get_db), user=Depends(get_current_user)):
    brand=db.query(BrandSetting).first()
    if not brand:
        brand=BrandSetting(); db.add(brand); db.commit(); db.refresh(brand)
    return brand
@router.put("/")
def save_brand(payload:BrandIn, db:Session=Depends(get_db), user=Depends(require_admin)):
    brand=db.query(BrandSetting).first() or BrandSetting()
    for k,v in payload.model_dump().items(): setattr(brand,k,v)
    db.add(brand); db.commit(); db.refresh(brand); return brand
