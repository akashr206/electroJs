"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
const page = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateCourse() {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:3001/api/v1/workspace/vishnus-workspace/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer XNBY5ZD-4VW4NY6-GRHV3C1-7KA04ZR",
          },
          body: JSON.stringify({
            message: input,
            mode: "chat",
            sessionId: ("exa-id", Date.now()),
            attachments: [],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      console.log(data);
      setLoading(false);
    } catch (error) {}
  }

  useEffect(() => {}, []);

  return (
    <div className="w-[calc(100vw-288px)] flex flex-col justify-between h-screen ">
      <div></div>
      <div className="flex p-4 gap-2">
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          placeholder="Enter course title"
        ></Input>
        <Button onClick={generateCourse}>
          {loading ? <Loader2 className="animate-spin" /> : "Generate"}
        </Button>
      </div>
    </div>
  );
};

export default page;
