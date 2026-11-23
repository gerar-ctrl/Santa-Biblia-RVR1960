const { app, BrowserWindow, Menu, protocol, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const SCHEME = 'biblia';
const START_URL = `${SCHEME}://app/#G%C3%A9n-1`;

protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
]);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function getPublicDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'public');
  }
  return path.resolve(__dirname, '..', 'public');
}

function getIconPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'Biblia-RVR1960.ico');
  }
  return path.resolve(__dirname, '..', 'Biblia-RVR1960.ico');
}

let mainWindow = null;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 420,
    minHeight: 600,
    title: 'Santa Biblia Reina-Valera 1960',
    backgroundColor: '#ffffff',
    icon: getIconPath(),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (/^https?:\/\//i.test(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.loadURL(START_URL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  const publicDir = getPublicDir();

  protocol.handle(SCHEME, async (request) => {
    try {
      const reqUrl = new URL(request.url);
      let reqPath = decodeURIComponent(reqUrl.pathname || '/');
      if (reqPath === '/' || reqPath === '') {
        reqPath = '/index.html';
      }

      const fullPath = path.resolve(publicDir, '.' + reqPath);
      if (!fullPath.startsWith(publicDir)) {
        return new Response('Forbidden', { status: 403 });
      }

      let targetPath = fullPath;
      if (!fs.existsSync(targetPath) || fs.statSync(targetPath).isDirectory()) {
        targetPath = path.join(publicDir, 'index.html');
      }

      const data = await fs.promises.readFile(targetPath);
      const ext = path.extname(targetPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      return new Response(data, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        }
      });
    } catch (err) {
      return new Response('Not Found', { status: 404 });
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
