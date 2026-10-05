"""User roles — single user type only.

Spec: HireMind AI supports one authenticated user type (USER).
No RBAC, no organization roles, no role switching.
"""
from enum import Enum


class UserRole(str, Enum):
    USER = "user"