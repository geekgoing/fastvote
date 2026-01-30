import hashlib
import bcrypt as bcrypt_lib


def generate_vote_hash(fingerprint: str, ip: str) -> str:
    """fingerprint와 IP로 중복 체크용 해시 생성"""
    combined = f"{fingerprint}:{ip}"
    return hashlib.sha256(combined.encode()).hexdigest()


def prehash_password(password: str) -> str:
    """bcrypt 72바이트 제한 우회를 위해 SHA256으로 사전 해싱"""
    return hashlib.sha256(password.encode()).hexdigest()


def hash_password(password: str) -> str:
    """비밀번호 해싱"""
    hashed = bcrypt_lib.hashpw(
        prehash_password(password).encode(),
        bcrypt_lib.gensalt()
    )
    return hashed.decode()


def verify_password(password: str, hashed: str) -> bool:
    """비밀번호 검증"""
    return bcrypt_lib.checkpw(
        prehash_password(password).encode(),
        hashed.encode()
    )
