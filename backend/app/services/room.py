import json
import uuid
from datetime import datetime, timedelta, timezone

from app.database import get_redis
from app.utils.security import hash_password


async def create_room(title: str, options: list[str], password: str | None, ttl: int) -> dict:
    """투표방 생성"""
    redis = get_redis()
    room_uuid = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc)
    expires_at = created_at + timedelta(seconds=ttl)

    room_data = {
        "uuid": room_uuid,
        "title": title,
        "options": options,
        "created_at": created_at.isoformat(),
        "expires_at": expires_at.isoformat(),
        "has_password": password is not None,
    }

    if password:
        room_data["password_hash"] = hash_password(password)

    await redis.setex(f"room:{room_uuid}", ttl, json.dumps(room_data))

    for option in options:
        await redis.hset(f"votes:{room_uuid}", option, 0)
    await redis.expire(f"votes:{room_uuid}", ttl)

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
