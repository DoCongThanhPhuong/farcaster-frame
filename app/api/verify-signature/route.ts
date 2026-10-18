import { NextResponse } from 'next/server';
import { verifyMessage, isAddress } from 'viem';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address, message, signature } = body || {};

    if (!address || !isAddress(address) || !message || !signature) {
      return NextResponse.json(
        { error: 'Missing or invalid parameters' },
        { status: 400 }
      );
    }

    const isValid = await verifyMessage({
      address,
      message,
      signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      address,
      verified: true,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid signature format';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
