import { NextResponse } from "next/server";
import { getConfig } from "@/lib/getConfig";
import { insertRoadmap } from "@/lib/db";
import { nanoid } from "nanoid";

function parseFirstValidJSON(input) {
    let start = -1;
    let bracketCount = 0;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        if (char === "{") {
            if (start === -1) start = i;
            bracketCount++;
        } else if (char === "}") {
            if (start !== -1) {
                bracketCount--;
                if (bracketCount === 0) {
                    try {
                        const jsonStr = input.slice(start, i + 1);
                        return JSON.parse(jsonStr);
                    } catch (err) {
                        start = -1;
                        bracketCount = 0;
                    }
                }
            }
        }
    }

    return null;
}

export async function POST(req) {
    const data = await req.json();
    const { API_KEY, baseUrl, workspaceSlug } = await getConfig();

    const systemPrompt = ` You are an expert AI course generator. Always respond in a JSON format with 1 chapters course title, overview, topics, and 20 - 25 words description.\n output format : { course_title : '...' \n, overview : '...'\n, chapters : [{chapter_number : 1, title : '...', topics : ['..','..']}, description : '...' \n, {...}\n ...]}`;

    try {
        const url = `${baseUrl}/workspace/${workspaceSlug}/chat`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                message: systemPrompt + data.message,
                mode: "chat",
                sessionId: ("exa-id", Date.now()),
                attachments: [],
            }),
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: "There was an error with the LLM Model" },
                { status: 500 }
            );
        }

        const courseString = await response.json();
        const course = parseFirstValidJSON(courseString.textResponse);
        const courseId = nanoid(10);
        console.log(course);

        insertRoadmap(courseId, course.course_title, course.chapters, course.overview);
        return NextResponse.json({ id: courseId });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
