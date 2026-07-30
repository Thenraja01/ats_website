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