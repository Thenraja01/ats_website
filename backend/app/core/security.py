from datetime import datetime, timedelta
from jose import jwt
import bcrypt

SECRET_KEY = "SECRET_KEY"
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    if len(pwd_bytes) > 72:
        pwd_bytes = pwd_bytes[:72]
    
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    pwd_bytes = plain.encode('utf-8')
    if len(pwd_bytes) > 72:
        pwd_bytes = pwd_bytes[:72]
    
    try:
        return bcrypt.checkpw(pwd_bytes, hashed.encode('utf-8'))
    except ValueError:
        return False

def create_access_token(data: dict):

    payload = data.copy()

    payload["exp"] = (
        datetime.utcnow() + timedelta(days=1)
    )

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )