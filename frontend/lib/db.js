import path from "path";
import Database from "better-sqlite3";

const dbPath = path.join(process.cwd(), "data", "vidhur.db");

let db;
export const getDb = () => {
    if (!db) {
        db = new Database(dbPath);
    }
    return db;
};

export const insertRoadmap = (id, title, chapters, overview) => {
    console.log(title, id, JSON.stringify(chapters));
    try {
        let db = getDb();

        const stmt = db.prepare(
            "INSERT INTO roadmaps (id, title, chapters, overview) VALUES(?, ? , ?, ?) "
        );
        stmt.run(id, title, JSON.stringify(chapters), overview);
        db.close();
    } catch (error) {
        console.log(error);

        // throw new Error(error);
    }
};

export const getOneRoadmap = (id) => {
    try {
        let db = getDb();
        const stmt = db.prepare("SELECT * FROM roadmaps WHERE id = ?");
        const roadmap = stmt.get(id);
        if (!roadmap) return null;
        return {
            ...roadmap,
            chapters: JSON.parse(roadmap.chapters),
        };
    } catch (error) {}
};

export const getAllRoadmaps = () => {
    try {
        let db = getDb();
        const stmt = db.prepare("SELECT * FROM roadmaps");
        const roadmaps = stmt.all();
        console.log(roadmaps);

        if (!roadmaps) return null;
        return roadmaps;
    } catch (error) {
        console.log(error);
    }
};

export const deleteTable = (table) => {
    try {
        let db = getDb();
        const stmt = db.prepare(`DROP TABLE ${table}`);
        stmt.run();
    } catch (error) {
        console.log(error);
    }
};
