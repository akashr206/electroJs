import { app, BrowserWindow } from "electron";
import kill from "tree-kill";

let nextProc, win;

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
