import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const dbPath = path.join(process.cwd(), "data", "vidhur.db");

        if (!fs.existsSync(path.dirname(dbPath))) {
            fs.mkdirSync(path.dirname(dbPath));
        }

        const db = new Database(dbPath);

        db.exec(`
            CREATE TABLE IF NOT EXISTS roadmaps (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                overview TEXT NOT NULL,
                chapters TEXT UNIQUE NOT NULL);`);

        db.close();
        return NextResponse.json({ message: "Table created successfully" });

    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
