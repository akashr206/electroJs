import { NextResponse } from "next/server";

export async function GET({ id }) {
    return NextResponse.json({ id });
}
