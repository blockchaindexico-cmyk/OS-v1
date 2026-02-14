from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    users = relationship("User", back_populates="organization")
    artifacts = relationship("Artifact", back_populates="organization")
    sops = relationship("SOP", back_populates="organization")
    templates = relationship("Template", back_populates="organization")
    projects = relationship("Project", back_populates="organization")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization", back_populates="users")
    artifacts = relationship("Artifact", back_populates="creator")
    sops = relationship("SOP", back_populates="creator")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization", back_populates="projects")
    artifacts = relationship("Artifact", back_populates="project")
    sops = relationship("SOP", back_populates="project")


class Artifact(Base):
    __tablename__ = "artifacts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    content = Column(Text, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"))
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    version = Column(Integer, default=1)
    is_promoted_to_template = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization", back_populates="artifacts")
    project = relationship("Project", back_populates="artifacts")
    creator = relationship("User", back_populates="artifacts")
    versions = relationship("ArtifactVersion", back_populates="artifact", cascade="all, delete-orphan")


class ArtifactVersion(Base):
    __tablename__ = "artifact_versions"

    id = Column(Integer, primary_key=True, index=True)
    artifact_id = Column(Integer, ForeignKey("artifacts.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    change_summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    artifact = relationship("Artifact", back_populates="versions")


class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    content = Column(Text, nullable=False)
    category = Column(String(100))
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    source_artifact_id = Column(Integer, ForeignKey("artifacts.id"))
    sanitization_checklist = Column(JSON)  # List of sanitization items applied
    is_promoted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization", back_populates="templates")
    template_imports = relationship("TemplateImport", back_populates="template", cascade="all, delete-orphan")


class TemplateImport(Base):
    __tablename__ = "template_imports"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False)
    importing_org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    imported_as_artifact_id = Column(Integer, ForeignKey("artifacts.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    template = relationship("Template", back_populates="template_imports")


class SOP(Base):
    __tablename__ = "sops"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"))
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization", back_populates="sops")
    project = relationship("Project", back_populates="sops")
    creator = relationship("User", back_populates="sops")
    steps = relationship("SOPStep", back_populates="sop", cascade="all, delete-orphan")


class SOPStep(Base):
    __tablename__ = "sop_steps"

    id = Column(Integer, primary_key=True, index=True)
    sop_id = Column(Integer, ForeignKey("sops.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    source_artifact_id = Column(Integer, ForeignKey("artifacts.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sop = relationship("SOP", back_populates="steps")
