import json
import uuid
from datetime import datetime, timedelta, timezone

from app.database import get_redis
from app.utils.security import hash_password


async def create_room(
    title: str,
    options: list[str],
    password: str | None,
    ttl: int,
    tags: list[str] | None = None,
    allow_multiple: bool = False
) -> dict:
    """투표방 생성"""
    redis = get_redis()
    room_uuid = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc)
    expires_at = created_at + timedelta(seconds=ttl)
    timestamp = created_at.timestamp()

    tags = tags or []

    room_data = {
        "uuid": room_uuid,
        "title": title,
        "options": options,
        "created_at": created_at.isoformat(),
        "expires_at": expires_at.isoformat(),
        "has_password": password is not None,
        "tags": tags,
        "allow_multiple": allow_multiple,
        "total_votes": 0,
    }

    if password:
        room_data["password_hash"] = hash_password(password)

    await redis.setex(f"room:{room_uuid}", ttl, json.dumps(room_data))

    for option in options:
        await redis.hset(f"votes:{room_uuid}", option, 0)
    await redis.expire(f"votes:{room_uuid}", ttl)

    # 인덱스 추가: 최신순
    await redis.zadd("rooms:list", {room_uuid: timestamp})

    # 인덱스 추가: 인기순 (초기값 0)
    await redis.zadd("rooms:popular", {room_uuid: 0})

    # 인덱스 추가: 태그별
    for tag in tags:
        await redis.sadd(f"rooms:tags:{tag}", room_uuid)

    response = room_data.copy()
    response.pop("password_hash", None)
    return response


async def get_room(room_uuid: str) -> dict | None:
    """Redis에서 방 정보 조회"""
    redis = get_redis()
    room_data = await redis.get(f"room:{room_uuid}")
    if room_data:
        return json.loads(room_data)
    return None


async def get_vote_results(room_uuid: str) -> dict:
    """투표 결과 조회"""
    redis = get_redis()
    results = await redis.hgetall(f"votes:{room_uuid}")
    return {k: int(v) for k, v in results.items()}


async def get_room_list(
    search: str | None = None,
    tags: list[str] | None = None,
    sort: str = "latest",
    page: int = 1,
    page_size: int = 20
) -> dict:
    """투표방 목록 조회"""
    redis = get_redis()

    # 정렬 기준에 따라 인덱스 선택
    if sort == "popular":
        index_key = "rooms:popular"
        # 인기순은 높은 점수부터 (내림차순)
        room_uuids = await redis.zrevrange(index_key, 0, -1)
    else:  # latest
        index_key = "rooms:list"
        # 최신순은 높은 타임스탬프부터 (내림차순)
        room_uuids = await redis.zrevrange(index_key, 0, -1)

    # 태그 필터링
    if tags:
        tag_sets = []
        for tag in tags:
            tag_members = await redis.smembers(f"rooms:tags:{tag}")
            tag_sets.append(set(tag_members))
        if tag_sets:
            # 모든 태그를 포함하는 방만 필터 (AND 조건)
            valid_uuids = set.intersection(*tag_sets)
            room_uuids = [uuid for uuid in room_uuids if uuid in valid_uuids]

    # 유효한 방만 필터링 (만료되지 않은 방)
    valid_rooms = []
    expired_uuids = []

    for room_uuid in room_uuids:
        room = await get_room(room_uuid)
        if room:
            # 검색 필터 (제목만)
            if search and search.lower() not in room.get("title", "").lower():
                continue
            valid_rooms.append(room)
        else:
            # 만료된 방은 인덱스에서 제거 예정
            expired_uuids.append(room_uuid)

    # 만료된 방 인덱스 정리 (비동기로 처리)
    if expired_uuids:
        await _cleanup_expired_rooms(expired_uuids)

    # 페이지네이션
    total = len(valid_rooms)
    start = (page - 1) * page_size
    end = start + page_size
    paged_rooms = valid_rooms[start:end]

    # 응답 형식으로 변환
    room_summaries = []
    for room in paged_rooms:
        room_summaries.append({
            "uuid": room["uuid"],
            "title": room["title"],
            "tags": room.get("tags", []),
            "total_votes": room.get("total_votes", 0),
            "created_at": room["created_at"],
            "expires_at": room["expires_at"],
            "has_password": room.get("has_password", False),
            "allow_multiple": room.get("allow_multiple", False),
        })

    return {
        "rooms": room_summaries,
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_next": end < total,
    }


async def _cleanup_expired_rooms(expired_uuids: list[str]) -> None:
    """만료된 방 인덱스 정리"""
    redis = get_redis()
    for room_uuid in expired_uuids:
        await redis.zrem("rooms:list", room_uuid)
        await redis.zrem("rooms:popular", room_uuid)
        # 태그 인덱스도 정리해야 하지만, 태그를 모르므로 스킵
        # (방 정보가 이미 삭제되어 태그 정보를 알 수 없음)


async def update_room_total_votes(room_uuid: str, increment: int = 1) -> None:
    """방의 총 투표수 업데이트"""
    redis = get_redis()
    room = await get_room(room_uuid)
    if room:
        room["total_votes"] = room.get("total_votes", 0) + increment
        ttl = await redis.ttl(f"room:{room_uuid}")
        if ttl > 0:
            await redis.setex(f"room:{room_uuid}", ttl, json.dumps(room))
            # 인기순 인덱스 업데이트
            await redis.zadd("rooms:popular", {room_uuid: room["total_votes"]})
