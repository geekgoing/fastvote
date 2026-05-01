import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services import room as room_service


class FakeRedis:
    def __init__(self, room_data: dict):
        self.store = {"room:room-1": json.dumps(room_data)}
        self.ttls = {"room:room-1": 3600}
        self.zsets = {}

    async def get(self, key: str):
        return self.store.get(key)

    async def ttl(self, key: str):
        return self.ttls.get(key, -1)

    async def setex(self, key: str, ttl: int, value: str):
        self.store[key] = value
        self.ttls[key] = ttl

    async def zadd(self, key: str, mapping: dict):
        self.zsets[key] = mapping


def test_get_remaining_participants_falls_back_to_original_list():
    room = {"participants": ["김철수", "이영희"]}

    assert room_service.get_remaining_participants(room) == ["김철수", "이영희"]


@pytest.mark.asyncio
async def test_record_room_vote_removes_participant_from_remaining_list(monkeypatch):
    room_data = {
        "uuid": "room-1",
        "participants": ["김철수", "이영희"],
        "remaining_participants": ["김철수", "이영희"],
        "total_votes": 0,
    }
    redis = FakeRedis(room_data)
    monkeypatch.setattr(room_service, "get_redis", lambda: redis)

    await room_service.record_room_vote("room-1", "김철수")

    saved_room = json.loads(redis.store["room:room-1"])
    assert saved_room["participants"] == ["김철수", "이영희"]
    assert saved_room["remaining_participants"] == ["이영희"]
    assert saved_room["total_votes"] == 1
    assert redis.zsets["rooms:popular"] == {"room-1": 1}
