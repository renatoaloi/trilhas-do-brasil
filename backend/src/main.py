import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from src.routes import auth, trails, pivots, profiles
from src.infrastructure.database import engine, Base

app = FastAPI(title="Trilhas do Brasil API", version="1.0.0")

app.state.limiter = auth.limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS
origins = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


# Routers
app.include_router(auth.router)
app.include_router(trails.router)
app.include_router(pivots.router)
app.include_router(profiles.router)


@app.get("/health")
def health():
    return {"status": "ok"}
