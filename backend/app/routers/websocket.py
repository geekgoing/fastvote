import json
from typing import Dict, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.room import get_room, get_vote_results

router = APIRouter()

active_connections: Dict[str, Set[WebSocket]] = {}


async def broadcast_results(room_uuid: str):
    """WebSocket으로 투표 결과 브로드캐스트"""
    if room_uuid in active_connections:
        results = await get_vote_results(room_uuid)
        message = json.dumps({"type": "vote_update", "results": results})

        disconnected = set()
        for connection in active_connections[room_uuid]:
            try:
                await connection.send_text(message)
            except:
                disconnected.add(connection)

        active_connections[room_uuid] -= disconnected


@router.websocket("/ws/rooms/{room_uuid}")
async def websocket_endpoint(websocket: WebSocket, room_uuid: str):
    """WebSocket 실시간 구독"""
    await websocket.accept()

    room = await get_room(room_uuid)
    if not room:
        await websocket.close(code=1008, reason="투표방을 찾을 수 없습니다")
        return

    if room_uuid not in active_connections:
        active_connections[room_uuid] = set()
    active_connections[room_uuid].add(websocket)

    try:
        results = await get_vote_results(room_uuid)
        await websocket.send_text(json.dumps({
            "type": "initial_results",
            "results": results
        }))

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        pass
    finally:
        if room_uuid in active_connections:
            active_connections[room_uuid].discard(websocket)
            if not active_connections[room_uuid]:
                del active_connections[room_uuid]
