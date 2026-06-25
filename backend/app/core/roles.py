"""User roles enum — candidate and recruiter only (no admin per user decision)."""

from enum import Enum


class UserRole(str, Enum):
    CANDIDATE = "candidate"
    RECRUITER = "recruiter"