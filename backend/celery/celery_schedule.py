from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import send_pending_notification, send_monthly_notification

celery_app = app.extensions["celery"]

@celery_app.on_after_configure.connect # Kind of like a lifecycle hook, activates automatically after celery beats is started
def setup_periodic_tasks(sender, **kwargs):
    # For Demo Purpose
    sender.add_periodic_task(30, send_pending_notification.s())
    sender.add_periodic_task(30, send_monthly_notification.s())

    # For Project Purpose
    # sender.add_periodic_task(crontab(day_of_month=1,hours=18, minute=30), send_monthly_notification.s())
    # sender.add_periodic_task(crontab(minute=30, hour=18), send_pending_notification.s())

