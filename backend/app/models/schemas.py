from enum import Enum

from pydantic import BaseModel, Field, field_validator, model_validator


class SortOrder(str, Enum):
    latest = "latest"
    popular = "popular"


class RoomCreate(BaseModel):
    title: str
    options: list[str]
    password: str | None = None
    ttl: int = 3600
    tags: list[str] = Field(default_factory=list)
    allow_multiple: bool = False
    is_private: bool = False
    participants: list[str] = Field(default_factory=list)
    option_allowed_participants: list[list[str]] | None = None

    @field_validator('options')
    @classmethod
    def validate_options(cls, v):
        if len(v) < 2:
            raise ValueError('최소 2개의 옵션이 필요합니다')
        return v

    @field_validator('participants')
    @classmethod
    def validate_participants(cls, v):
        participants = []
        seen = set()
        for participant in v:
            name = participant.strip()
            if not name or name in seen:
                continue
            participants.append(name)
            seen.add(name)
        return participants

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v):
        if len(v) > 5:
            raise ValueError('태그는 최대 5개까지 가능합니다')
        for tag in v:
            if len(tag) > 20:
                raise ValueError('태그는 20자 이내여야 합니다')
        return v

    @model_validator(mode='after')
    def validate_option_allowed_participants(self):
        if self.option_allowed_participants is None:
            return self

        if not self.participants:
            raise ValueError('참여 가능 인원을 설정하려면 참여 인원이 필요합니다')

        if len(self.option_allowed_participants) != len(self.options):
            raise ValueError('선택지별 참여 가능 인원 배열은 선택지 개수와 같아야 합니다')

        participant_names = set(self.participants)
        normalized_permissions = []
        for allowed_participants in self.option_allowed_participants:
            option_permissions = []
            seen = set()
            for participant in allowed_participants:
                name = participant.strip()
                if not name or name in seen:
                    continue
                if name not in participant_names:
                    raise ValueError(f'참여 인원에 없는 이름입니다: {name}')
                option_permissions.append(name)
                seen.add(name)
            normalized_permissions.append(option_permissions)

        self.option_allowed_participants = normalized_permissions
        return self


class VoteRequest(BaseModel):
    options: list[str]
    fingerprint: str
    participant: str | None = None

    @field_validator('options')
    @classmethod
    def validate_options(cls, v):
        if len(v) < 1:
            raise ValueError('최소 1개의 옵션을 선택해야 합니다')
        return v

    @field_validator('participant')
    @classmethod
    def validate_participant(cls, v):
        return v.strip() if v else None


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
