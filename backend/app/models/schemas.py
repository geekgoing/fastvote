from enum import Enum

from pydantic import BaseModel, field_validator


class SortOrder(str, Enum):
    latest = "latest"
    popular = "popular"


class RoomCreate(BaseModel):
    title: str
    options: list[str]
    password: str | None = None
    ttl: int = 3600
    tags: list[str] = []
    allow_multiple: bool = False
    is_private: bool = False

    @field_validator('options')
    @classmethod
    def validate_options(cls, v):
        if len(v) < 2:
            raise ValueError('최소 2개의 옵션이 필요합니다')
        return v

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        if len(v) > 5:
            raise ValueError('태그는 최대 5개까지 가능합니다')
        for tag in v:
            if len(tag) > 20:
                raise ValueError('태그는 20자 이내여야 합니다')
        return v


class VoteRequest(BaseModel):
    options: list[str]
    fingerprint: str

    @field_validator('options')
    @classmethod
    def validate_options(cls, v):
        if len(v) < 1:
            raise ValueError('최소 1개의 옵션을 선택해야 합니다')
        return v


class PasswordVerifyRequest(BaseModel):
    password: str | None = None
    share_token: str | None = None


class RoomSummary(BaseModel):
    uuid: str
    title: str
    tags: list[str]
    total_votes: int
    created_at: str
    expires_at: str
    has_password: bool
    allow_multiple: bool
    is_private: bool


class RoomListResponse(BaseModel):
    rooms: list[RoomSummary]
    total: int
    page: int
    page_size: int
    has_next: bool


class CommentCreate(BaseModel):
    content: str
    nickname: str | None = None

    @field_validator('content')
    @classmethod
    def validate_content(cls, v):
        if len(v.strip()) < 1:
            raise ValueError('댓글 내용을 입력해주세요')
        if len(v) > 500:
            raise ValueError('댓글은 500자 이내여야 합니다')
        return v.strip()

    @field_validator('nickname')
    @classmethod
    def validate_nickname(cls, v):
        if v and len(v) > 20:
            raise ValueError('닉네임은 20자 이내여야 합니다')
        return v.strip() if v else None


class Comment(BaseModel):
    id: str
    room_uuid: str
    content: str
    nickname: str
    created_at: str
