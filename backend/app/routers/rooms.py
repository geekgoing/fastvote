from fastapi import APIRouter, HTTPException, Query, Request

from app.models.schemas import RoomCreate, VoteRequest, PasswordVerifyRequest, SortOrder, RoomListResponse, CommentCreate, Comment
from app.services.room import create_room, get_room, get_vote_results, get_room_list
from app.services.vote import has_voted, cast_vote
from app.services.comment import create_comment, get_comments
from app.utils.security import verify_password
from app.routers.websocket import broadcast_results
from app.database import get_redis

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.get("", response_model=RoomListResponse)
async def list_rooms(
    search: str | None = Query(None, description="제목 검색"),
    tags: list[str] | None = Query(None, description="태그 필터"),
    sort: SortOrder = Query(SortOrder.latest, description="정렬 기준"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지 크기"),
):
    """투표방 목록 조회"""
    return await get_room_list(
        search=search,
        tags=tags,
        sort=sort.value,
        page=page,
        page_size=page_size
    )


@router.post("")
async def create_room_endpoint(room: RoomCreate):
    """투표방 생성"""
    return await create_room(
        title=room.title,
        options=room.options,
        password=room.password,
        ttl=room.ttl,
        tags=room.tags,
        allow_multiple=room.allow_multiple,
        is_private=room.is_private
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

    # 모든 선택한 옵션이 유효한지 확인
    for option in vote_request.options:
        if option not in room["options"]:
            raise HTTPException(status_code=400, detail=f"유효하지 않은 옵션입니다: {option}")

    # 복수 선택 허용 여부 확인
    if not room.get("allow_multiple", False) and len(vote_request.options) > 1:
        raise HTTPException(status_code=400, detail="이 투표는 복수 선택이 허용되지 않습니다")

    client_ip = request.client.host
    if await has_voted(room_uuid, vote_request.fingerprint, client_ip):
        raise HTTPException(status_code=409, detail="이미 투표하셨습니다")

    await cast_vote(room_uuid, vote_request.options, vote_request.fingerprint, client_ip)
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


@router.post("/{room_uuid}/comments", response_model=Comment)
async def create_comment_endpoint(room_uuid: str, comment: CommentCreate):
    """댓글 작성"""
    room = await get_room(room_uuid)
    if not room:
        raise HTTPException(status_code=404, detail="투표방을 찾을 수 없습니다")

    # 방의 남은 TTL 가져오기
    redis = get_redis()
    ttl = await redis.ttl(f"room:{room_uuid}")

    return await create_comment(
        room_uuid=room_uuid,
        content=comment.content,
        nickname=comment.nickname,
        ttl=ttl if ttl > 0 else None
    )


@router.get("/{room_uuid}/comments", response_model=list[Comment])
async def list_comments(room_uuid: str):
    """댓글 목록 조회"""
    room = await get_room(room_uuid)
    if not room:
        raise HTTPException(status_code=404, detail="투표방을 찾을 수 없습니다")

    return await get_comments(room_uuid)
