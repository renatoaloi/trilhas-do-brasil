from datetime import datetime, timedelta
import os
import jwt
from bcrypt import hashpw, gensalt, checkpw

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-production-32chars")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRY = int(os.getenv("JWT_EXPIRY", "3600"))


def hash_password(password: str) -> str:
    return hashpw(password.encode(), gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return checkpw(password.encode(), hashed.encode())


def create_access_token(user_id: str, email: str) -> str:
    expire = datetime.utcnow() + timedelta(seconds=JWT_EXPIRY)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
