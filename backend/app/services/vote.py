from app.database import get_redis
from app.utils.security import generate_vote_hash


async def has_voted(room_uuid: str, fingerprint: str, ip: str) -> bool:
    """중복 투표 여부 확인"""
    redis = get_redis()
    vote_hash = generate_vote_hash(fingerprint, ip)
    voted_key = f"voted:{room_uuid}:{vote_hash}"
    return await redis.exists(voted_key)


async def cast_vote(room_uuid: str, option: str, fingerprint: str, ip: str) -> None:
    """투표 기록"""
    redis = get_redis()

    await redis.hincrby(f"votes:{room_uuid}", option, 1)

    vote_hash = generate_vote_hash(fingerprint, ip)
    voted_key = f"voted:{room_uuid}:{vote_hash}"
    room_ttl = await redis.ttl(f"room:{room_uuid}")
    if room_ttl > 0:
        await redis.setex(voted_key, room_ttl, "1")
