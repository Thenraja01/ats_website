"""Celery worker configuration for asynchronous background jobs."""

from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "hiremind_celery",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.interview_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
    task_soft_time_limit=240,
    broker_connection_retry_on_startup=True,
)
