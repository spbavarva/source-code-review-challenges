export interface PayloadInspection {
    blocked: boolean;
    reasons: string[];
}

const BLOCKED_KEYS = new Set(['__proto__', 'prototype']);
const SUSPICIOUS_TOKENS: Array<{ label: string; pattern: RegExp }> = [
    { label: 'constructor constructor chain', pattern: /constructor:constructor/i },
    { label: 'flight function token', pattern: /\$B\d+/ },
    { label: 'prototype mutation token', pattern: /__proto__/i },
    { label: 'internal response token', pattern: /_response/i },
    { label: 'prefix code slot token', pattern: /_prefix/i },
    { label: 'Function constructor text', pattern: /\bFunction\s*\(/i }
];

function addReason(reasons: string[], reason: string): void {
    if (!reasons.includes(reason)) {
        reasons.push(reason);
    }
}

function inspectNode(
    node: unknown,
    path: string,
    reasons: string[],
    seen: WeakSet<object>,
    depth: number
): void {
    if (depth > 12) {
        addReason(reasons, `Depth limit exceeded at ${path}`);
        return;
    }

    if (typeof node === 'string') {
        for (const token of SUSPICIOUS_TOKENS) {
            if (token.pattern.test(node)) {
                addReason(reasons, `Detected ${token.label} at ${path}`);
            }
        }
        return;
    }

    if (node === null || typeof node !== 'object') {
        return;
    }

    if (seen.has(node)) {
        return;
    }
    seen.add(node);

    if (Array.isArray(node)) {
        node.forEach((entry, index) => inspectNode(entry, `${path}[${index}]`, reasons, seen, depth + 1));
        return;
    }

    const record = node as Record<string, unknown>;

    for (const [key, value] of Object.entries(record)) {
        const childPath = `${path}.${key}`;

        if (BLOCKED_KEYS.has(key)) {
            addReason(reasons, `Blocked key "${key}" at ${path}`);
        }

        if (key.includes('constructor:constructor')) {
            addReason(reasons, `Detected constructor chain key at ${path}`);
        }

        if ((key === '_response' || key === '_formData') && typeof value === 'object') {
            addReason(reasons, `Blocked transport object "${key}" at ${path}`);
        }

        inspectNode(value, childPath, reasons, seen, depth + 1);
    }
}

export function inspectSerializedPayload(payload: unknown): PayloadInspection {
    const reasons: string[] = [];
    inspectNode(payload, 'root', reasons, new WeakSet<object>(), 0);

    return {
        blocked: reasons.length > 0,
        reasons
    };
}

export function parseJsonSafely(raw: string): { ok: true; value: unknown } | { ok: false; message: string } {
    const trimmed = raw.trim();

    if (!trimmed) {
        return { ok: false, message: 'Field "0" is empty' };
    }

    if (trimmed.length > 30_000) {
        return { ok: false, message: 'Field "0" exceeds the training size limit (30KB)' };
    }

    try {
        return { ok: true, value: JSON.parse(trimmed) };
    } catch {
        return { ok: false, message: 'Field "0" must be valid JSON' };
    }
}
