# Challenge-01 - Solution

This vulnerability comes under the rest condition and business logic. Issue here is that the application attempts to check the limit by checking whether the user has available credit before allowing an action. 

The system assumes that once credit availability is checked, the state remains valid until the action is performed.

## Vulnerable Code

A Time-of-Check to Time-of-Use (TOCTOU) vulnerability.

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



In a real SaaS environment, this leads to:
- Overuse of paid resources.
- Bypassing subscription limits.
- Financial loss for the service provider.

## Exploit PoC

An attacker sends multiple valid requests simultaneously to race against the credit deduction.

Sending 10 concurrent requests, even with one credit remaining, will lead to success.

```bash
for i in {1..10}; do 
  curl -H "x-user-id: user-123" http://localhost:8000/perform-action & 
done
```

## Remediation

Quota enforcement should be **atomic**. The check and the consumption must happen as a single, indivisible operation.

**Recommended Fix:**
Attempt to consume the credit first. Only if the consumption is successful (and the balance was sufficient) should the action be performed.

**Conceptual Fix:**
Instead of:
`Check -> Act -> Consume`

This ensures the action is only authorized if valid payment (credit) has been secured.
