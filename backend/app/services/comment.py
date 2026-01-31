import json
import uuid
from datetime import datetime, timezone

from app.database import get_redis


async def create_comment(
    room_uuid: str,
    content: str,
    nickname: str | None = None,
    ttl: int | None = None
) -> dict:
    """댓글 작성"""
    redis = get_redis()
    comment_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc)

    comment_data = {
        "id": comment_id,
        "room_uuid": room_uuid,
        "content": content,
        "nickname": nickname or "익명",
        "created_at": created_at.isoformat(),
    }

    # 댓글 저장 (리스트에 추가)
    await redis.rpush(f"comments:{room_uuid}", json.dumps(comment_data))

    # TTL 설정 (방의 TTL과 동일하게)
    if ttl:
        await redis.expire(f"comments:{room_uuid}", ttl)

    return comment_data


async def get_comments(room_uuid: str) -> list[dict]:
    """댓글 목록 조회"""
    redis = get_redis()
    comments_raw = await redis.lrange(f"comments:{room_uuid}", 0, -1)

    comments = []
    for comment_raw in comments_raw:
        comments.append(json.loads(comment_raw))

    return comments
