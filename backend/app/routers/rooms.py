from fastapi import APIRouter, HTTPException, Request

from app.models.schemas import RoomCreate, VoteRequest, PasswordVerifyRequest
from app.services.room import create_room, get_room, get_vote_results
from app.services.vote import has_voted, cast_vote
from app.utils.security import verify_password
from app.routers.websocket import broadcast_results

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.post("")
async def create_room_endpoint(room: RoomCreate):
    """투표방 생성"""
    return await create_room(
        title=room.title,
        options=room.options,
        password=room.password,
        ttl=room.ttl
    )


@router.get("/{room_uuid}")
async def get_room_info(room_uuid: str):
    """투표방 조회"""
    room = await get_room(room_uuid)
    if not room:
        raise HTTPException(status_code=404, detail="투표방을 찾을 수 없습니다")

    response = room.copy()
    response.pop("password_hash", None)
    return response


@router.post("/{room_uuid}/verify")
async def verify_room_password(room_uuid: str, request: PasswordVerifyRequest):
    """비밀번호 검증"""
    room = await get_room(room_uuid)
    if not room:
        raise HTTPException(status_code=404, detail="투표방을 찾을 수 없습니다")

    if "password_hash" not in room:
        return {"verified": True}

    if verify_password(request.password, room["password_hash"]):
        return {"verified": True}
    else:
        raise HTTPException(status_code=403, detail="비밀번호가 일치하지 않습니다")


@router.post("/{room_uuid}/vote")
async def vote(room_uuid: str, vote_request: VoteRequest, request: Request):
    """투표"""
    room = await get_room(room_uuid)
    if not room:
        raise HTTPException(status_code=404, detail="투표방을 찾을 수 없습니다")

    if vote_request.option not in room["options"]:
        raise HTTPException(status_code=400, detail="유효하지 않은 옵션입니다")

    client_ip = request.client.host
    if await has_voted(room_uuid, vote_request.fingerprint, client_ip):
        raise HTTPException(status_code=409, detail="이미 투표하셨습니다")

    await cast_vote(room_uuid, vote_request.option, vote_request.fingerprint, client_ip)
    await broadcast_results(room_uuid)

    return {"success": True, "message": "투표가 완료되었습니다"}


@router.get("/{room_uuid}/results")
async def get_results(room_uuid: str):
    """투표 결과 조회"""
    room = await get_room(room_uuid)
    if not room:
        raise HTTPException(status_code=404, detail="투표방을 찾을 수 없습니다")

    results = await get_vote_results(room_uuid)

    return {
        "room_uuid": room_uuid,
        "title": room["title"],
        "results": results,
        "expires_at": room["expires_at"]
    }
