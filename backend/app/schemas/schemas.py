from pydantic import BaseModel, EmailStr
from typing import Optional, Any

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "reviewer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str

class FeedOut(BaseModel):
    id: int
    title: str
    source: str
    city: Optional[str]
    category: Optional[str]
    summary: Optional[str]
    link: str
    image: Optional[str]
    published_date: Optional[str]
    status: str
    important: bool
    class Config: from_attributes = True

class FeedUpdate(BaseModel):
    summary: Optional[str] = None
    status: Optional[str] = None
    important: Optional[bool] = None

class BrandIn(BaseModel):
    brand_name: str
    primary_color: str
    secondary_color: str
    font_style: str
    tone_of_voice: str
    cta_format: str
    social_style: str

class ContentUpdate(BaseModel):
    blog_title: Optional[str] = None
    meta_description: Optional[str] = None
    article: Optional[str] = None
    instagram_caption: Optional[str] = None
    facebook_post: Optional[str] = None
    linkedin_post: Optional[str] = None
    hashtags: Optional[str] = None
    image_prompt: Optional[str] = None
    cta: Optional[str] = None
    status: Optional[str] = None

class SocialPostIn(BaseModel):
    content_id: int
    platform: str
    body: str
    mode: str = "manual"
