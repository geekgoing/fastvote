from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def read_root():
    return {"Hello": "FastVote Backend is Alive!"}


@router.get("/health")
def health_check():
    return {"status": "ok"}
