"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
const page = () => {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [roadmap, setRoadmap] = useState(null);

    async function generateCourse() {
        setLoading(true);
        try {
            let response = await fetch("http://localhost:3000/api/roadmap", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: input,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const data = await response.json();
            console.log(data);
            setRoadmap(data.course);
            setInput("");
            setLoading(false);
        } catch (error) {}
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            generateCourse();
        }
    };

    return (
        <div className="w-[calc(100vw-288px)] h-screen flex flex-col justify-between ">
            <div className="text-3xl mx-auto font-bold p-5">
                <h1>Generate Course</h1>
            </div>
            <div className="w-full relative overflow-y-scroll h-full flex items-center justify-center">
                {loading && (
                    <span className="absolute inset-0 flex bg-gray-50/10 backdrop-blur-md flex-col gap-2 items-center justify-center">
                        {" "}
                        <Loader2 className="animate-spin"></Loader2>
                        <p className="font-semibold">
                            Please wait while we generate your roadmap
                        </p>
                    </span>
                )}
                {roadmap ? (
                    <div className="flex flex-col pt-44 pb-12 gap-2">
                        {roadmap?.chapters?.map((e) => (
                            <div
                                key={e.chapter_number}
                                className="p-2 max-w-[480px] border rounded-md "
                            >
                                <h3 className="font-bold">{e.title} </h3>
                                <p>{e.description}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-semibold">
                            Welcome to course generator
                        </h2>
                        <p>
                            Create your course now by providing your course
                            title
                        </p>
                    </div>
                )}
            </div>
            <div className="flex border-t p-4 pb-8 gap-2">
                <Input
                    onKeyDown={handleKeyPress}
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                    }}
                    placeholder="Enter course title"
                ></Input>
                <Button onClick={generateCourse}>
                    {loading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        "Generate"
                    )}
                </Button>
            </div>
        </div>
    );
};

export default page;
