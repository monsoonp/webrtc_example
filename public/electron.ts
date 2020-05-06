// public/electron.ts
import { app, BrowserWindow } from "electron";
import * as isDev from "electron-is-dev";
import * as path from "path";

// 1. Gabage Collection이 일어나지 않도록 함수 밖에 선언함.
let mainWindow: BrowserWindow;

//https
// app.commandLine.appendSwitch("ignore-certificate-errors", "true");
// process.env.ELECTRON_DISABLE_SECURITY_WARNING = "1";

function createWindow() {
  mainWindow = new BrowserWindow({
    // 이것들은 제가 사용하는 설정이니 각자 알아서 설정 하십시오.
    // alwaysOnTop: true,
    movable: true,
    center: true,
    fullscreen: true,
    // kiosk: !isDev,
    resizable: true,
    // transparent:true,
    webPreferences: {
      // 2.
      // 웹 애플리케이션을 데스크탑으로 모양만 바꾸려면 안 해도 되지만,
      // Node 환경처럼 사용하려면 (Node에서 제공되는 빌트인 패키지 사용 포함)
      // true 해야 합니다.
      nodeIntegration: true,
      sandbox: false,
    },
  });

  // 3. and load the index.html of the app.
  if (isDev) {
    // 개발 중에는 개발 도구에서 호스팅하는 주소에서 로드
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    // 프로덕션 환경에서는 패키지 내부 리소스에 접근
    mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
  }

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    mainWindow = undefined!;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // macOs - Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// package.json "build" for release

/*
"build": {
    "asar": true,
    "appId": "com.rtc_electron",
    "productName": "rtc_electron",
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": [
            "x64",
            "ia32"
          ]
        }
      ]
    }
  },

  */
