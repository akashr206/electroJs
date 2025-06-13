import { app, BrowserWindow } from "electron";
import { spawn } from "child_process";
import kill from "tree-kill";
import path from "path";
import { fileURLToPath } from "url";
import isDev from "electron-is-dev";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Alternative: Detect dev mode without NODE_ENV
// const isDev = !app.isPackaged;
const port = process.env.PORT || 3000;

let isPackaged = app.isPackaged
let win, nextProc;
function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Show loading screen first
    const loadingHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { 
                    margin: 0; 
                    padding: 0; 
                    background: #1a1a1a; 
                    color: white; 
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    flex-direction: column;
                }
                .spinner {
                    border: 4px solid #333;
                    border-top: 4px solid #00ff88;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        </head>
        <body>
            <div class="spinner"></div>
            <h2>Loading ML Course...</h2>
            <p>Starting Next.js server...</p>
        </body>
        </html>
    `;

    win.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(loadingHTML)}`
    );
    win.show();

    // Load the actual app after server starts
    const loadApp = () => {
        const loadURL = `http://localhost:${port}`;
        console.log(`Loading app from: ${loadURL}`);

        win.loadURL(loadURL).catch((err) => {
            console.error("Failed to load app URL:", err);
            // Show error page
            const errorHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { 
                            margin: 0; 
                            padding: 20px; 
                            background: #1a1a1a; 
                            color: #ff6b6b; 
                            font-family: Arial, sans-serif;
                        }
                        .error { background: #2d1b1b; padding: 20px; border-radius: 8px; }
                    </style>
                </head>
                <body>
                    <div class="error">
                        <h2>❌ Failed to Load Application</h2>
                        <p>Could not connect to Next.js server at http://localhost:${port}</p>
                        <p>Please check the console for more details.</p>
                        <button onclick="location.reload()">Retry</button>
                    </div>
                </body>
                </html>
            `;
            win.loadURL(
                `data:text/html;charset=utf-8,${encodeURIComponent(errorHTML)}`
            );
        });
    };

    // Store the load function to call it later
    win.loadApp = loadApp;

    // Open DevTools in development
    if (isDev) {
        win.webContents.openDevTools();
    }

    // Handle window closed
    win.on("closed", () => {
        win = null;
    });
}

function startNextServer() {
    return new Promise((resolve, reject) => {
        // Development/unpackaged mode - use npm
        const frontendPath = path.join(__dirname, "..", "frontend");
        const nextScript = isDev ? "dev" : "start";

        console.log(
            `🚀 Starting Next.js server in ${
                isDev ? "development" : "production"
            } mode...`
        );
        console.log(`📁 Frontend path: ${frontendPath}`);
        console.log(`🔌 Using port: ${port}`);
        console.log(`📝 Command: npm run ${nextScript}`);

        // Check if frontend directory exists
        import("fs").then((fs) => {
            if (!fs.existsSync(frontendPath)) {
                console.error(
                    `❌ Frontend directory not found: ${frontendPath}`
                );
                reject(
                    new Error(`Frontend directory not found: ${frontendPath}`)
                );
                return;
            }
            console.log(`✅ Frontend directory exists`);

            // Check if package.json exists in frontend
            const frontendPackageJson = path.join(frontendPath, "package.json");
            if (!fs.existsSync(frontendPackageJson)) {
                console.error(
                    `❌ Frontend package.json not found: ${frontendPackageJson}`
                );
                reject(
                    new Error(
                        `Frontend package.json not found: ${frontendPackageJson}`
                    )
                );
                return;
            }
            console.log(`✅ Frontend package.json exists`);

            // In production, check if .next directory exists
            if (!isDev) {
                const nextBuildPath = path.join(frontendPath, ".next");
                if (!fs.existsSync(nextBuildPath)) {
                    console.error(
                        `❌ Next.js build not found: ${nextBuildPath}`
                    );
                    console.error(
                        `🔧 Please run 'cd frontend && npm run build' first`
                    );
                    reject(
                        new Error(
                            `Next.js build not found. Please run 'cd frontend && npm run build' first. Looking for: ${nextBuildPath}`
                        )
                    );
                    return;
                }
                console.log(`✅ Next.js build directory exists`);
            }

            // Check if npm is available
            console.log(`🔍 Checking npm availability...`);

            nextProc = spawn("npm", ["run", nextScript], {
                cwd: frontendPath,
                env: { ...process.env, PORT: port },
                stdio: "pipe",
                shell: true, // Add shell option for Windows compatibility
            });

            console.log(`🔄 Spawned process with PID: ${nextProc.pid}`);

            // Log stdout and stderr for debugging
            nextProc.stdout.on("data", (data) => {
                const output = data.toString().trim();
                if (output) {
                    console.log(`📤 Next.js stdout: ${output}`);
                }
            });

            nextProc.stderr.on("data", (data) => {
                const output = data.toString().trim();
                if (output) {
                    console.error(`📥 Next.js stderr: ${output}`);
                }
            });

            nextProc.on("error", (err) => {
                console.error(
                    "❌ Failed to start Next.js server process:",
                    err
                );
                reject(err);
            });

            nextProc.on("spawn", () => {
                console.log("✅ Next.js process spawned successfully");
            });

            nextProc.on("exit", (code, signal) => {
                console.log(
                    `🛑 Next.js server exited with code ${code} and signal ${signal}`
                );
                if (code !== 0 && code !== null) {
                    reject(
                        new Error(`Next.js server exited with code ${code}`)
                    );
                }
            });

            // Wait for server to be ready with more detailed checking
            const timeout = setTimeout(() => {
                console.error("⏰ Next.js server startup timeout (45s)");
                reject(new Error("Next.js server startup timeout (45s)"));
            }, 45000);

            let checkCount = 0;
            const maxChecks = 45; // 45 seconds with 1-second intervals

            // Check if server is ready
            const checkServer = async () => {
                checkCount++;
                console.log(
                    `🔍 Checking server readiness (attempt ${checkCount}/${maxChecks})...`
                );

                try {
                    const response = await fetch(`http://localhost:${port}`, {
                        timeout: 5000, // 5 second timeout for each request
                    });

                    console.log(
                        `📡 Server response status: ${response.status}`
                    );

                    if (response.ok) {
                        clearTimeout(timeout);
                        console.log("🎉 Next.js server is ready!");
                        resolve();
                    } else {
                        console.log(
                            `⚠️ Server responded with status: ${response.status}, retrying...`
                        );
                        if (checkCount < maxChecks) {
                            setTimeout(checkServer, 1000);
                        } else {
                            clearTimeout(timeout);
                            reject(
                                new Error(
                                    `Server responded with status ${response.status} after ${maxChecks} attempts`
                                )
                            );
                        }
                    }
                } catch (error) {
                    console.log(
                        `⏳ Server not ready yet (${error.message}), retrying...`
                    );
                    if (checkCount < maxChecks) {
                        setTimeout(checkServer, 1000);
                    } else {
                        clearTimeout(timeout);
                        reject(
                            new Error(
                                `Server failed to start after ${maxChecks} attempts. Last error: ${error.message}`
                            )
                        );
                    }
                }
            };

            // Start checking after delay
            const initialDelay = isDev ? 3000 : 8000; // Longer delay for production
            console.log(
                `⏳ Waiting ${
                    initialDelay / 1000
                } seconds before checking server...`
            );
            setTimeout(checkServer, initialDelay);
        });
    });
}

app.whenReady().then(async () => {
    try {
        console.log(
            `App starting in ${isDev ? "development" : "production"} mode`
        );

        // Create window first to show loading screen
        createWindow();

        // Then start Next.js server
        await startNextServer();

        // Load the actual app
        if (win && win.loadApp) {
            win.loadApp();
        }
    } catch (err) {
        console.error("Startup Error:", err);
        // Show error dialog to user
        const { dialog } = await import("electron");
        await dialog.showErrorBox(
            "Startup Error",
            `Failed to start application: ${err.message}`
        );

        if (win) {
            const errorHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { 
                            margin: 0; 
                            padding: 20px; 
                            background: #1a1a1a; 
                            color: #ff6b6b; 
                            font-family: Arial, sans-serif;
                        }
                        .error { background: #2d1b1b; padding: 20px; border-radius: 8px; }
                    </style>
                </head>
                <body>
                    <div class="error">
                        <h2>❌ Startup Error</h2>
                        <p>${err.message}</p>
                        <p>Please check the console for more details.</p>
                    </div>
                </body>
                </html>
            `;
            win.loadURL(
                `data:text/html;charset=utf-8,${encodeURIComponent(errorHTML)}`
            );
        }
    }
});

app.on("before-quit", () => {
    if (nextProc?.pid) {
        console.log("Killing Next.js server...");
        kill(nextProc.pid, (err) => {
            if (err) {
                console.error("Error killing Next.js server:", err);
            }
        });
    }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle certificate errors (for development)
app.on(
    "certificate-error",
    (event, webContents, url, error, certificate, callback) => {
        if (isDev) {
            // In development, ignore certificate errors
            event.preventDefault();
            callback(true);
        } else {
            // In production, use default behavior
            callback(false);
        }
    }
);
