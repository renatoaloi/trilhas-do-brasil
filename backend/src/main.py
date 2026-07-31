from contextlib import asynccontextmanager
from collections import defaultdict
from time import time

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.infrastructure.api.routes import auth_router, protected, router
from src.infrastructure.config import ensure_storage_dirs, get_settings

settings = get_settings()

# Simple in-memory rate limit for auth routes (requests per window)
_rate_buckets: dict[str, list[float]] = defaultdict(list)
_RATE_WINDOW = 60.0
_RATE_MAX = int(settings.rate_limit.split("/")[0]) if "/" in settings.rate_limit else 20


@asynccontextmanager
async def lifespan(_app: FastAPI):
    ensure_storage_dirs()
    yield


app = FastAPI(title="Trilhas do Brasil API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, (HTTPException, StarletteHTTPException, RequestValidationError)):
        raise exc
    return JSONResponse(status_code=500, content={"detail": "Erro interno do servidor"})


@app.middleware("http")
async def rate_limit_auth(request: Request, call_next):
    if request.method == "POST" and request.url.path in {"/api/auth/register", "/api/auth/token"}:
        ip = request.client.host if request.client else "unknown"
        key = f"{ip}:{request.url.path}"
        now = time()
        bucket = [t for t in _rate_buckets[key] if now - t < _RATE_WINDOW]
        if len(bucket) >= _RATE_MAX:
            _rate_buckets[key] = bucket
            return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})
        bucket.append(now)
        _rate_buckets[key] = bucket
    return await call_next(request)


app.include_router(router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(protected, prefix="/api")
