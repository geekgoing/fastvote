from app.database import get_redis
from app.utils.security import generate_vote_hash
from app.services.room import update_room_total_votes


async def has_voted(room_uuid: str, fingerprint: str, ip: str) -> bool:
    """중복 투표 여부 확인"""
    redis = get_redis()
    vote_hash = generate_vote_hash(fingerprint, ip)
    voted_key = f"voted:{room_uuid}:{vote_hash}"
    return await redis.exists(voted_key)


async def cast_vote(room_uuid: str, options: list[str], fingerprint: str, ip: str) -> None:
    """투표 기록 (복수 선택 지원)"""
    redis = get_redis()

    # 선택한 모든 옵션에 투표
    for option in options:
        await redis.hincrby(f"votes:{room_uuid}", option, 1)

    # 중복 투표 방지 키 설정
    vote_hash = generate_vote_hash(fingerprint, ip)
    voted_key = f"voted:{room_uuid}:{vote_hash}"
    room_ttl = await redis.ttl(f"room:{room_uuid}")
    if room_ttl > 0:
        await redis.setex(voted_key, room_ttl, "1")

    # 인기순 인덱스 업데이트 (참여자 수 기준)
    await update_room_total_votes(room_uuid, 1)
