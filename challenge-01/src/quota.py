from datastore import get_user, update_user

def has_available_credits(user_id: str) -> bool:
    user = get_user(user_id)
    if not user:
        return False

    return user.credits > 0


def consume_credit(user_id: str) -> None:
    user = get_user(user_id)
    if not user:
        return

    # Deduct one credit
    user.credits -= 1
    update_user(user)
