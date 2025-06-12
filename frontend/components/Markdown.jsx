"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const Markdown = ({ content }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                ),
                code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                        <SyntaxHighlighter language="python" style={docco} className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                            {children}
                        </SyntaxHighlighter>
                    ) : (
                        <SyntaxHighlighter language="python" style={docco} className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                            {children}
                        </SyntaxHighlighter>
                    );
                },
                pre: ({ children }) => (
                    <pre className="bg-muted p-3 rounded-lg overflow-x-auto my-2">
                        {children}
                    </pre>
                ),
                ul: ({ children }) => (
                    <ul className="list-disc pl-4 mb-2">{children}</ul>
                ),
                ol: ({ children }) => (
                    <ol className="list-decimal pl-4 mb-2">{children}</ol>
                ),
                li: ({ children }) => <li className="mb-1">{children}</li>,
                h1: ({ children }) => (
                    <h1 className="text-xl font-bold mb-2">{children}</h1>
                ),
                h2: ({ children }) => (
                    <h2 className="text-lg font-semibold mb-2">{children}</h2>
                ),
                h3: ({ children }) => (
                    <h3 className="text-md font-medium mb-2">{children}</h3>
                ),
                strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

export default Markdown;
