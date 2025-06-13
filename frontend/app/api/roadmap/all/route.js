import { NextResponse } from "next/server";
import { getAllRoadmaps } from "@/lib/db";
import { deleteTable } from "@/lib/db";

export async function GET() {
    try {
        const roadmaps = getAllRoadmaps();
        return NextResponse.json({ roadmaps });
    } catch (error) {}
}

export async function DELETE(req) {
    const { table } = await req.json();
    deleteTable(table);
    return NextResponse.json({ message: "deleted successfully" });
}
