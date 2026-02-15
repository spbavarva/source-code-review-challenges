from models import User

# Simulated in-memory datastore
_USERS = {
    "user-123": User(user_id="user-123", credits=3),
}

def get_user(user_id: str) -> User:
    return _USERS.get(user_id)

def update_user(user: User) -> None:
    _USERS[user.user_id] = user
