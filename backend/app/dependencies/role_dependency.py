"""Role dependencies — HireMind AI supports one user type (USER).

All endpoints verify ownership via resource user_id against the authenticated user,
not via role-based access control.
"""

from fastapi import Depends, HTTPException
from app.dependencies.auth_dependency import get_current_user


def require_roles(allowed_roles: list = None):
    """Placeholder — always passes for single-user type.

    Spec: HireMind AI has no RBAC. Ownership is validated by checking
    resource.user_id == current_user.id at the endpoint level.
    """

    async def role_checker(user = Depends(get_current_user)):
        return user

    return role_checker