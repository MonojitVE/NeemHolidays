from apscheduler.schedulers.background import BackgroundScheduler
from app.core.database import SessionLocal
from app.agents.rss_agent import fetch_and_store_feeds

scheduler = BackgroundScheduler()

def daily_rss_job():
    db = SessionLocal()
    try:
        fetch_and_store_feeds(db)
    finally:
        db.close()

def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(daily_rss_job, "cron", hour=9, minute=0, id="daily_rss", replace_existing=True)
        scheduler.start()
