from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import User, Template, Artifact, TemplateImport
from app.schemas import (
    TemplateCreate,
    PromoteArtifactToTemplate,
    TemplateResponse,
    ImportTemplateRequest,
    ArtifactResponse,
)
from typing import List

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.post("/promote", response_model=TemplateResponse)
async def promote_artifact_to_template(
    promotion_data: PromoteArtifactToTemplate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Get the artifact
    artifact = db.query(Artifact).filter(
        Artifact.id == promotion_data.artifact_id,
        Artifact.organization_id == current_user.organization_id,
    ).first()

    if not artifact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artifact not found",
        )

    # Create template from artifact
    template = Template(
        name=artifact.title,
        description=artifact.description,
        content=artifact.content,
        category="Promoted",
        organization_id=current_user.organization_id,
        source_artifact_id=artifact.id,
        sanitization_checklist=promotion_data.sanitization_checklist,
        is_promoted=True,
    )
    db.add(template)
    artifact.is_promoted_to_template = True
    db.commit()
    db.refresh(template)
    return template


@router.get("/", response_model=List[TemplateResponse])
async def list_templates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    templates = db.query(Template).filter(
        Template.organization_id == current_user.organization_id
    ).all()
    return templates


@router.get("/gallery", response_model=List[TemplateResponse])
async def get_template_gallery(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Get templates from current org and promoted templates from other orgs
    own_templates = db.query(Template).filter(
        Template.organization_id == current_user.organization_id
    ).all()

    promoted_templates = db.query(Template).filter(
        Template.is_promoted == True,
        Template.organization_id != current_user.organization_id,
    ).all()

    return own_templates + promoted_templates


@router.post("/import", response_model=ArtifactResponse)
async def import_template(
    import_data: ImportTemplateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    template = db.query(Template).filter(Template.id == import_data.template_id).first()

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found",
        )

    # Create artifact from template
    artifact = Artifact(
        title=import_data.artifact_title or template.name,
        description=template.description,
        content=template.content,
        organization_id=current_user.organization_id,
        creator_id=current_user.id,
    )
    db.add(artifact)
    db.flush()

    # Record the import
    template_import = TemplateImport(
        template_id=template.id,
        importing_org_id=current_user.organization_id,
        imported_as_artifact_id=artifact.id,
    )
    db.add(template_import)
    db.commit()
    db.refresh(artifact)
    return artifact


@router.post("/", response_model=TemplateResponse)
async def create_template(
    template_data: TemplateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    template = Template(
        name=template_data.name,
        description=template_data.description,
        content=template_data.content,
        category=template_data.category,
        organization_id=current_user.organization_id,
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template
