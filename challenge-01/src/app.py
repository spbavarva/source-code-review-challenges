from fastapi import FastAPI, Header, HTTPException
from quota import has_available_credits, consume_credit
from datastore import get_user

app = FastAPI()


def get_current_user(x_user_id: str):
    user = get_user(x_user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Unknown user")
    return user


@app.get("/credits")
def check_credits(x_user_id: str = Header(...)):
    user = get_current_user(x_user_id)
    return {
        "remaining_credits": user.credits,
        "can_perform_action": user.credits > 0
    }


@app.get("/can-perform")
def can_perform_action(x_user_id: str = Header(...)):
    allowed = has_available_credits(x_user_id)
    return {"allowed": allowed}


@app.get("/perform-action")
def perform_action(x_user_id: str = Header(...)):
    user = get_current_user(x_user_id)

    # Client is expected to call /can-perform before invoking this
    if not has_available_credits(user.user_id):
        raise HTTPException(status_code=403, detail="No remaining credits")

    # Perform the protected action
    result = {
        "status": "action completed",
        "user": user.user_id
    }

    consume_credit(user.user_id)
    return result


@app.get("/challenge")
def challenge(x_user_id: str = Header(...)):
    """
    Helper endpoint used for testing different request flows.
    """
    user = get_current_user(x_user_id)
    return {
        "user": user.user_id,
        "credits": user.credits
    }
