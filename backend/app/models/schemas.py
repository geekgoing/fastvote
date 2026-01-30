from pydantic import BaseModel, field_validator


class RoomCreate(BaseModel):
    title: str
    options: list[str]
    password: str | None = None
    ttl: int = 3600

    @field_validator('options')
    @classmethod
    def validate_options(cls, v):
        if len(v) < 2:
            raise ValueError('최소 2개의 옵션이 필요합니다')
        return v


class VoteRequest(BaseModel):
    option: str
    fingerprint: str


class PasswordVerifyRequest(BaseModel):
    password: str
