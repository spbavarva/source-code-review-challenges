import { NextRequest, NextResponse } from 'next/server';
import { inspectSerializedPayload, parseJsonSafely } from '@/lib/security';

function toText(value: FormDataEntryValue | null): string {
    return typeof value === 'string' ? value : '';
}

export async function POST(request: NextRequest) {
    const contentType = request.headers.get('content-type') || '';
    const nextActionHeader = request.headers.get('next-action') || '';

    if (!contentType.toLowerCase().includes('multipart/form-data')) {
        return NextResponse.json(
            {
                mode: 'training',
                blocked: true,
                message: 'Only multipart/form-data is supported for this probe endpoint'
            },
            { status: 415 }
        );
    }

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        return NextResponse.json(
            {
                mode: 'training',
                blocked: true,
                message: 'Unable to parse multipart request body'
            },
            { status: 400 }
        );
    }

    const field0Raw = toText(formData.get('0'));
    const field1 = toText(formData.get('1'));
    const field2 = toText(formData.get('2'));

    const parsed = parseJsonSafely(field0Raw);
    if (!parsed.ok) {
        return NextResponse.json(
            {
                mode: 'training',
                blocked: true,
                message: parsed.message
            },
            { status: 400 }
        );
    }

    const inspection = inspectSerializedPayload(parsed.value);

    return NextResponse.json(
        {
            mode: 'training',
            blocked: inspection.blocked,
            reasons: inspection.reasons,
            received: {
                hasNextActionHeader: Boolean(nextActionHeader),
                hasField1: field1.length > 0,
                hasField2: field2.length > 0
            },
            message: inspection.blocked
                ? 'Probe blocked: suspicious deserialization patterns detected'
                : 'Probe accepted: no blocked patterns detected'
        },
        {
            status: inspection.blocked ? 422 : 200
        }
    );
}
