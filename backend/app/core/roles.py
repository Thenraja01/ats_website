"""User roles enum."""

from enum import Enum


class UserRole(str, Enum):
    CANDIDATE = "candidate"
    RECRUITER = "recruiter"
    ORGANIZATION_ADMIN = "organization_admin"