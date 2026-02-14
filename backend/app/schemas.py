from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


# Authentication
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    organization_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    organization_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Organization
class OrganizationResponse(BaseModel):
    id: int
    name: str
    slug: str
    created_at: datetime

    class Config:
        from_attributes = True


# Project
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    organization_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Artifact
class ArtifactCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content: str
    project_id: Optional[int] = None


class ArtifactUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    change_summary: Optional[str] = None


class ArtifactVersionResponse(BaseModel):
    id: int
    version_number: int
    content: str
    change_summary: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ArtifactResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    content: str
    organization_id: int
    project_id: Optional[int]
    version: int
    is_promoted_to_template: bool
    creator_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ArtifactDetailResponse(ArtifactResponse):
    versions: List[ArtifactVersionResponse] = []


# Template
class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    content: str
    category: Optional[str] = None


class PromoteArtifactToTemplate(BaseModel):
    artifact_id: int
    sanitization_checklist: dict  # Maps sanitization items to boolean values


class TemplateResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    content: str
    category: Optional[str]
    organization_id: int
    source_artifact_id: Optional[int]
    is_promoted: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ImportTemplateRequest(BaseModel):
    template_id: int
    artifact_title: Optional[str] = None


# SOP
class SOPStepCreate(BaseModel):
    title: str
    description: Optional[str] = None
    source_artifact_id: Optional[int] = None


class SOPCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: Optional[int] = None
    steps: List[SOPStepCreate]


class SOPStepResponse(BaseModel):
    id: int
    step_number: int
    title: str
    description: Optional[str]
    source_artifact_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class SOPResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    organization_id: int
    project_id: Optional[int]
    version: int
    creator_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SOPDetailResponse(SOPResponse):
    steps: List[SOPStepResponse]
