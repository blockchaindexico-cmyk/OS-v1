from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import Base
from app.database import engine
from app.routes import auth, artifacts, sops, templates

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Second Brain OS", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router)
app.include_router(artifacts.router)
app.include_router(sops.router)
app.include_router(templates.router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
