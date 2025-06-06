"use client";
import { useState, useEffect } from "react";

export default function ApiRequestUI() {
    const [prompt, setPrompt] = useState("");
    const [maxTokens, setMaxTokens] = useState(100);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [downloadStatus, setDownloadStatus] = useState({
        state: "not_started",
        message: "Checking model status...",
        progress: 0,
        total_size: 0,
        downloaded_size: 0,
    });

    // Format bytes to human readable format
    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat(
            (bytes / Math.pow(k, i)).toFixed(dm) + " " + sizes[i]
        );
    };

    // Poll the /status endpoint to check download progress
    useEffect(() => {
        let intervalId;

        const checkStatus = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/status");
                const data = await res.json();
                setDownloadStatus((prev) => ({
                    ...prev,
                    ...data,
                }));

                // Continue polling if the download is in progress
                if (data.state === "downloading") {
                    intervalId = setTimeout(checkStatus, 1000); // Poll more frequently during download
                } else if (
                    data.state === "not_started" ||
                    data.state === "failed"
                ) {
                    intervalId = setTimeout(checkStatus, 2000); // Poll less frequently otherwise
                }
            } catch (error) {
                setDownloadStatus((prev) => ({
                    ...prev,
                    state: "failed",
                    message: `Error checking status: ${error.message}`,
                }));
                intervalId = setTimeout(checkStatus, 2000);
            }
        };

        checkStatus();

        return () => {
            if (intervalId) clearTimeout(intervalId);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("http://127.0.0.1:8000/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: ` you are a chapter-wise roadmap generator who gives reponse only in JSON format, you task is to generate the given number of chapters for the given concept, and each chapter should contain title and 10 words description, sample output : {"chapters" : [{title : '..', description : '...'}]. ${prompt}`,
                    max_tokens: maxTokens,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setChapters(data.output.chapters || []);
        } catch (err) {
            setError(err.message);
            console.error("Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold">API Request UI</h1>
                    <p className="mt-2 text-sm">
                        Send requests to your local API endpoint
                    </p>
                </div>

                {/* Enhanced download status display */}
                <div className="shadow rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-medium mb-2">
                        Model Download Status
                    </h3>

                    {downloadStatus.state === "downloading" && (
                        <div className="space-y-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{
                                        width: `${downloadStatus.progress}%`,
                                    }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>
                                    {downloadStatus.progress.toFixed(1)}%
                                </span>
                                <span>
                                    {formatBytes(
                                        downloadStatus.downloaded_size
                                    )}{" "}
                                    / {formatBytes(downloadStatus.total_size)}
                                </span>
                            </div>
                            <p className="text-sm">{downloadStatus.message}</p>
                        </div>
                    )}

                    {downloadStatus.state === "not_started" && (
                        <p className="text-sm">{downloadStatus.message}</p>
                    )}

                    {downloadStatus.state === "completed" && (
                        <p className="text-sm text-green-600">
                            ✓ {downloadStatus.message}
                        </p>
                    )}

                    {downloadStatus.state === "failed" && (
                        <p className="text-sm text-red-600">
                            ✗ {downloadStatus.message}
                        </p>
                    )}
                </div>

                {/* Main form, enabled only after download is complete */}
                <div className="shadow rounded-lg p-6 mb-8">
                    {downloadStatus.state === "completed" ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="prompt"
                                    className="block text-sm font-medium mb-1"
                                >
                                    Prompt
                                </label>
                                <textarea
                                    id="prompt"
                                    rows={4}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="maxTokens"
                                    className="block text-sm font-medium mb-1"
                                >
                                    Max Tokens
                                </label>
                                <input
                                    type="number"
                                    id="maxTokens"
                                    min="1"
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    value={maxTokens}
                                    onChange={(e) =>
                                        setMaxTokens(parseInt(e.target.value))
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                        isLoading
                                            ? "opacity-75 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        "Send Request"
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="text-sm text-gray-600">
                            Please wait for the model to finish downloading
                            before submitting a request.
                        </p>
                    )}

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-red-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Error
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {chapters.length > 0 && (
                    <div className="shadow rounded-lg overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200">
                            <h2 className="text-lg font-medium">Results</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Title
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Description
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {chapters.map((chapter, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {chapter.title}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {chapter.description}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
