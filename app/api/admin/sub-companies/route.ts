import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// sub_companies table not yet populated
export async function GET() {
  return NextResponse.json([]);
}
