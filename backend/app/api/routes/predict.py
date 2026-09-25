from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter(prefix="/predict", tags=["Prediction"])


class PredictURLRequest(BaseModel):
    url: str


@router.post("/url")
def predict_url(payload: PredictURLRequest):
    url = payload.url.strip()

    if not url:
        raise HTTPException(
            status_code=400,
            detail="URL is required"
        )

    return {
        "url": url,
        "status": "accepted",
        "message": "Prediction endpoint is available",
    }
