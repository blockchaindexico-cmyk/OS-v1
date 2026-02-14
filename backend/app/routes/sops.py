from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import User, SOP, SOPStep
from app.schemas import SOPCreate, SOPResponse, SOPDetailResponse
from typing import List

router = APIRouter(prefix="/api/sops", tags=["sops"])


@router.post("/", response_model=SOPResponse)
async def create_sop(
    sop_data: SOPCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sop = SOP(
        title=sop_data.title,
        description=sop_data.description,
        organization_id=current_user.organization_id,
        project_id=sop_data.project_id,
        creator_id=current_user.id,
    )
    db.add(sop)
    db.flush()

    # Create steps
    for idx, step_data in enumerate(sop_data.steps, 1):
        step = SOPStep(
            sop_id=sop.id,
            step_number=idx,
            title=step_data.title,
            description=step_data.description,
            source_artifact_id=step_data.source_artifact_id,
        )
        db.add(step)

    db.commit()
    db.refresh(sop)
    return sop


@router.get("/", response_model=List[SOPResponse])
async def list_sops(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sops = db.query(SOP).filter(
        SOP.organization_id == current_user.organization_id
    ).all()
    return sops


@router.get("/{sop_id}", response_model=SOPDetailResponse)
async def get_sop(
    sop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sop = db.query(SOP).filter(
        SOP.id == sop_id,
        SOP.organization_id == current_user.organization_id,
    ).first()

    if not sop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SOP not found",
        )

    return sop


@router.delete("/{sop_id}")
async def delete_sop(
    sop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sop = db.query(SOP).filter(
        SOP.id == sop_id,
        SOP.organization_id == current_user.organization_id,
    ).first()

    if not sop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SOP not found",
        )

    db.delete(sop)
    db.commit()
    return {"status": "deleted"}
