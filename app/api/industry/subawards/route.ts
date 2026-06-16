import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// sub_awards table not yet populated — return empty list
export async function GET() {
  return NextResponse.json([]);
}
