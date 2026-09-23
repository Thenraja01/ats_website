"""Email service for sending OTPs and notifications."""

import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
):
    if not settings.SMTP_HOST or not settings.SMTP_PORT:
        logger.warning("SMTP not configured — email not sent")
        return False

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = to_email

    if text_content:
        message.attach(MIMEText(text_content, "plain"))
    message.attach(MIMEText(html_content, "html"))

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_USE_TLS:
                server.starttls(context=context)
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, to_email, message.as_string())
        logger.info(f"Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


async def send_otp_email(email: str, otp: str, purpose: str):
    subject = {
        "signup": "Verify your HireMind AI account",
        "login": "Your HireMind AI login code",
        "password_reset": "Reset your HireMind AI password",
    }.get(purpose, "Your HireMind AI verification code")

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #818cf8; font-size: 24px; margin: 0;">HireMind AI</h1>
            <p style="color: #94a3b8; font-size: 14px;">Your verification code</p>
        </div>
        <div style="background: #1e293b; border-radius: 12px; padding: 24px; text-align: center;">
            <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 16px;">Use this code to complete your {purpose.replace('_', ' ')}:</p>
            <div style="background: #0f172a; border-radius: 8px; padding: 16px; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #818cf8;">
                {otp}
            </div>
            <p style="color: #64748b; font-size: 12px; margin-top: 16px;">This code expires in 10 minutes. Never share this code with anyone.</p>
        </div>
        <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">HireMind AI — AI-Powered Applicant Tracking System</p>
    </div>
    """

    return await send_email(email, subject, html)


async def send_application_status_email(
    to_email: str,
    candidate_name: str,
    job_title: str,
    new_status: str,
):
    """Send a branded notification email when a recruiter updates an application status."""
    status_config = {
        "shortlisted": {
            "emoji": "🎉",
            "color": "#34d399",
            "headline": "Congratulations! You've been shortlisted",
            "body": f"Great news! Your application for <strong>{job_title}</strong> has been reviewed and you've been shortlisted for the next stage. Our team will be in touch soon with further details.",
        },
        "rejected": {
            "emoji": "📋",
            "color": "#f87171",
            "headline": "Application Status Update",
            "body": f"Thank you for your interest in <strong>{job_title}</strong>. After careful review, we have decided to move forward with other candidates at this time. We encourage you to apply for future openings that match your profile.",
        },
        "hired": {
            "emoji": "🚀",
            "color": "#818cf8",
            "headline": "Welcome aboard! You've been selected",
            "body": f"We are thrilled to offer you the position of <strong>{job_title}</strong>! Please await further communication from our HR team regarding onboarding details and next steps.",
        },
        "pending": {
            "emoji": "⏳",
            "color": "#fbbf24",
            "headline": "Application Under Review",
            "body": f"Your application for <strong>{job_title}</strong> is currently under review. We'll notify you as soon as there's an update.",
        },
    }

    cfg = status_config.get(new_status, status_config["pending"])
    subject = f"{cfg['emoji']} Application Update — {job_title}"

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="color: #818cf8; font-size: 22px; margin: 0 0 4px;">HireMind AI</h1>
            <p style="color: #64748b; font-size: 13px; margin: 0;">AI-Powered Applicant Tracking</p>
        </div>
        <div style="background: #1e293b; border-radius: 14px; padding: 28px;">
            <div style="font-size: 36px; text-align: center; margin-bottom: 16px;">{cfg['emoji']}</div>
            <h2 style="color: {cfg['color']}; font-size: 18px; text-align: center; margin: 0 0 16px;">{cfg['headline']}</h2>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">Hi {candidate_name},</p>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.7; margin: 0;">{cfg['body']}</p>
        </div>
        <div style="margin-top: 20px; padding: 16px; background: #1e293b; border-radius: 10px; border-left: 3px solid {cfg['color']};">
            <p style="color: #64748b; font-size: 12px; margin: 0;">Application for: <span style="color: #cbd5e1;">{job_title}</span></p>
            <p style="color: #64748b; font-size: 12px; margin: 6px 0 0;">Status: <span style="color: {cfg['color']}; font-weight: bold; text-transform: capitalize;">{new_status}</span></p>
        </div>
        <p style="color: #334155; font-size: 11px; text-align: center; margin-top: 24px;">HireMind AI — If you did not apply for this position, please disregard this email.</p>
    </div>
    """

    return await send_email(to_email, subject, html)