import { app, BrowserWindow } from "electron";
import path from "path";
import { spawn } from "child_process";
import kill from "tree-kill";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import isDev from "electron-is-dev";

let pyProc, nextProc, win;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    win.loadURL("http://localhost:3000");
}



// function startNextServer() {}

app.whenReady().then(async () => {
    try {
        // await startNextServer();
        createWindow();
    } catch (err) {
        console.error("Startup Error:", err);
        createWindow(); 
    }
});

app.on("before-quit", () => {
    if (nextProc?.pid) kill(nextProc.pid, () => {});
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
