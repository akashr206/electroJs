import { NextResponse } from "next/server";

export async function POST(req) {
    const { prompt, max_tokens } = await req.json();

    try {
        const res = await fetch("http://localhost:8000/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: ` you are a chapter-wise roadmap generator who gives reponse only in JSON format, you task is to generate the given number of chapters for the given concept, and each chapter should contain title and 10 words description, sample output : {"chapters" : [{title : '..', description : '...'}].  ${prompt}`,
                max_tokens,
            }),
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error });
    }
}
