import { NextResponse } from "next/server";

export async function POST(req) {
    const data = await req.json();
    const API_KEY = process.env.API;

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

    const systemPrompt = ` You are an expert AI course generator. Always respond in a JSON format with 5 chapters course title, topics, and 20 - 25 words description.\n output format : { course_title : '...' \n, chapters : [{chapter_number : 1, title : '...', topics : ['..','..']}, description : '...' \n, {...}\n ...]}`;

    const response = await fetch(
        "http://localhost:3001/api/v1/workspace/practice/chat",
        {
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
        }
    );

    if (!response.ok) {
        return NextResponse.json(
            { message: "There was an error with the LLM Model" },
            { status: 500 }
        );
    }

    const courseString = await response.json();
    const course = parseFirstValidJSON(courseString.textResponse);

    return NextResponse.json({ course });
}
