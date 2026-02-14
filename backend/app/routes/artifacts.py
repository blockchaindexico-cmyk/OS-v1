from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import User, Artifact, ArtifactVersion
from app.schemas import ArtifactCreate, ArtifactUpdate, ArtifactResponse, ArtifactDetailResponse
from typing import List

router = APIRouter(prefix="/api/artifacts", tags=["artifacts"])


@router.post("/", response_model=ArtifactResponse)
async def create_artifact(
    artifact_data: ArtifactCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    artifact = Artifact(
        title=artifact_data.title,
        description=artifact_data.description,
        content=artifact_data.content,
        organization_id=current_user.organization_id,
        project_id=artifact_data.project_id,
        creator_id=current_user.id,
    )
    db.add(artifact)
    db.flush()

    # Create initial version
    version = ArtifactVersion(
        artifact_id=artifact.id,
        version_number=1,
        content=artifact_data.content,
        change_summary="Initial version",
    )
    db.add(version)
    db.commit()
    db.refresh(artifact)
    return artifact


@router.get("/", response_model=List[ArtifactResponse])
async def list_artifacts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    artifacts = db.query(Artifact).filter(
        Artifact.organization_id == current_user.organization_id
    ).all()
    return artifacts


@router.get("/{artifact_id}", response_model=ArtifactDetailResponse)
async def get_artifact(
    artifact_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    artifact = db.query(Artifact).filter(
        Artifact.id == artifact_id,
        Artifact.organization_id == current_user.organization_id,
    ).first()

    if not artifact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artifact not found",
        )

    return artifact


@router.put("/{artifact_id}", response_model=ArtifactResponse)
async def update_artifact(
    artifact_id: int,
    artifact_data: ArtifactUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    artifact = db.query(Artifact).filter(
        Artifact.id == artifact_id,
        Artifact.organization_id == current_user.organization_id,
    ).first()

    if not artifact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artifact not found",
        )

    # Create new version if content changed
    if artifact_data.content and artifact_data.content != artifact.content:
        new_version_number = artifact.version + 1
        version = ArtifactVersion(
            artifact_id=artifact.id,
            version_number=new_version_number,
            content=artifact_data.content,
            change_summary=artifact_data.change_summary,
        )
        db.add(version)
        artifact.version = new_version_number
        artifact.content = artifact_data.content

    if artifact_data.title:
        artifact.title = artifact_data.title
    if artifact_data.description is not None:
        artifact.description = artifact_data.description

    db.commit()
    db.refresh(artifact)
    return artifact


@router.delete("/{artifact_id}")
async def delete_artifact(
    artifact_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    artifact = db.query(Artifact).filter(
        Artifact.id == artifact_id,
        Artifact.organization_id == current_user.organization_id,
    ).first()

    if not artifact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artifact not found",
        )

    db.delete(artifact)
    db.commit()
    return {"status": "deleted"}
