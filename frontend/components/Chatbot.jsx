"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Markdown from "./Markdown";

const ChatBot = () => {
    const [messages, setMessages] = useState([
        {
            id: "1",
            content: "Hello! I'm your AI assistant. How can I help you today?",
            role: "assistant",
            timestamp: new Date(),
        },
    ]);

    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector(
                "[data-radix-scroll-area-viewport]"
            );
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            content: input.trim(),
            role: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch(
                "http://localhost:3001/api/v1/workspace/vishnus-workspace/chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.API}`,
                    },
                    body: JSON.stringify({
                        message: userMessage.content,
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

            const assistantMessage = {
                id: data.id,
                content:
                    data.textResponse ||
                    "I apologize, but I encountered an error processing your request.",
                role: "assistant",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error sending message:", error);

            const errorMessage = {
                id: (Date.now() + 1).toString(),
                content: `I'm currently in demo mode. Here's an example response with **markdown formatting**:

## Features I can help with:
- Answer questions with *formatted text*
- Create lists and tables
- Code examples like \`console.log("Hello!")\`
- And much more!

\`\`\`javascript
// Example code block
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

Please replace the API endpoint in the code with your actual AI service.`,
                role: "assistant",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage();
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-screen  mx-auto relative border-x border-border">
            <ScrollArea
                ref={scrollAreaRef}
                className="flex-1 pb-32 overflow-scroll p-4"
            >
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${
                                message.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`flex max-w-[80%] ${
                                    message.role === "user"
                                        ? "flex-row-reverse"
                                        : "flex-row"
                                } items-start space-x-2`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        message.role === "user"
                                            ? "bg-primary text-primary-foreground ml-2"
                                            : "bg-muted text-muted-foreground mr-2"
                                    }`}
                                >
                                    {message.role === "user" ? (
                                        <User className="w-4 h-4" />
                                    ) : (
                                        <Bot className="w-4 h-4" />
                                    )}
                                </div>
                                <Card
                                    className={`p-3 ${
                                        message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-card text-card-foreground"
                                    }`}
                                >
                                    {message.role === "assistant" ? (
                                        <Markdown
                                            content={message.content}
                                        ></Markdown>
                                    ) : (
                                        <p className="text-sm">
                                            {message.content}
                                        </p>
                                    )}
                                    <div
                                        className={`text-xs mt-2 opacity-70 ${
                                            message.role === "user"
                                                ? "text-primary-foreground"
                                                : "text-muted-foreground"
                                        }`}
                                    >
                                        {message.timestamp.toLocaleTimeString(
                                            [],
                                            {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex items-start space-x-2">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <Card className="p-3 bg-card">
                                    <div className="flex items-center space-x-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm text-muted-foreground">
                                            AI is thinking...
                                        </span>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 pb-10 border-t fixed bottom-0 w-full border-border bg-card">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message here..."
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChatBot;
