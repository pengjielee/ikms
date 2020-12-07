const {
  app,
  BrowserWindow,
  globalShortcut,
  clipboard,
  Menu,
  dialog,
  ipcMain,
  Tray,
} = require("electron");
const path = require("path");
const fs = require("fs");
const dayjs = require("dayjs");
const rp = require("request-promise");
const cheerio = require("cheerio");

const utils = require(path.join(__dirname, "utils/index.js"));

const AppDAO = require(path.join(__dirname, "db/app_dao.js"));
const dao = new AppDAO(path.join(__dirname, "my.db"));

const CodeRepository = require(path.join(__dirname, "db/code_repository.js"));
const codeRepo = new CodeRepository(dao);

const UrlRepository = require(path.join(__dirname, "db/url_repository.js"));
const urlRepo = new UrlRepository(dao);

const NoteRepository = require(path.join(__dirname, "db/note_repository.js"));
const noteRepo = new NoteRepository(dao);

codeRepo.createTable();
urlRepo.createTable();
noteRepo.createTable();

const urlReg = /(http[s]:)?\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

ipcMain.on("save-dialog", (event, data) => {
  const options = {
    title: "请选择要保存的文件名",
    buttonLabel: "保存",
    defaultPath: data.filename,
    filters: [{ name: "Custom File Type", extensions: [data.type] }],
  };
  dialog.showSaveDialog(options).then((result) => {
    event.sender.send("saved-file", result);
  });
});

ipcMain.on("export-url", (event, data) => {
  exportData("urldate", data.dates);
});

const init = () => {
  app.dock.setIcon(path.join(__dirname, "assets/IconTemplate@2x.png"));
  app.setName("我的知识库");

  if (process.platform === "darwin") {
    const template = [
      {
        label: "我的知识库",
        submenu: [
          {
            label: "退出",
            accelerator: "Command+Q",
            click: function () {
              app.quit();
            },
          },
        ],
      },
      {
        label: "编辑",
        submenu: [
          { label: "复制", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "粘贴", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        ],
      },
      {
        label: "重置",
        submenu: [
          {
            label: "重置URL",
            click: function () {
              urlRepo.reset();
              mainWindow.webContents.send("reload");
            },
          },
          {
            label: "重置NOTE",
            click: function () {
              noteRepo.reset();
              mainWindow.webContents.send("reload");
            },
          },
          {
            label: "重置CODE",
            click: function () {
              codeRepo.reset();
              mainWindow.webContents.send("reload");
            },
          },
        ],
      },
      {
        label: "导出",
        submenu: [
          {
            label: "导出URL",
            accelerator: "CmdOrCtrl+Shift+U",
            click: function () {
              exportData("url");
            },
          },
          {
            label: "导出NOTE",
            accelerator: "CmdOrCtrl+Shift+N",
            click: function () {
              exportData("note");
            },
          },
          {
            label: "导出CODE",
            accelerator: "CmdOrCtrl+Shift+C",
            click: function () {
              exportData("code");
            },
          },
        ],
      },
      {
        label: "开发",
        submenu: [
          {
            label: "DevTools",
            accelerator: "CmdOrCtrl+Shift+I",
            click(item, focusedWindow) {
              if (focusedWindow) focusedWindow.webContents.toggleDevTools();
            },
          },
        ],
      },
      {
        label: "数据库",
        submenu: [
          {
            label: "备份",
            accelerator: "CmdOrCtrl+B",
            click: function () {
              backupDb();
            },
          },
          {
            label: "还原",
            accelerator: "CmdOrCtrl+R",
            click: function () {
              restoreDb();
            },
          },
        ],
      },
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  } else {
    Menu.setApplicationMenu(null);
  }
};
init();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, trayIcon;

const exportData = (type, dates) => {
  const options = {
    title: "请选择要保存的文件名",
    buttonLabel: "保存",
    defaultPath: Date.now() + "",
    filters: [{ name: "Custom File Type", extensions: ["txt"] }],
  };
  dialog.showSaveDialog(options).then(async (result) => {
    let content = "";
    switch (type) {
      case "url":
        const urls = await urlRepo.getAll();
        content = urls
          .map((item) => {
            return `${item.title.replace(
              /\s+/gi,
              ""
            )}\r\n${item.link.trim()} \r\n\r\n`;
          })
          .join("");
        break;
      case "urldate":
        const results = await urlRepo.getAllByDate(dates[0], dates[1]);
        content = results
          .map((item) => {
            return `${item.title.replace(
              /\s+/gi,
              ""
            )}\r\n${item.link.trim()} \r\n\r\n`;
          })
          .join("");
        break;
      case "note":
        const notes = await noteRepo.getAll();
        content = notes
          .map((item) => {
            item.content = utils.decode(item.content);
            return `${item.createDate}\r\n${item.content}\r\n\r\n`;
          })
          .join("");
        break;
      case "code":
        const codes = await codeRepo.getAll();
        const devide = "```";
        content = codes
          .map((item) => {
            return `${item.tags}\r\n${devide}\r\n${item.content}${devide}\r\n\r\n`;
          })
          .join("");
        break;
    }
    fs.writeFileSync(result.filePath, content);
  });
};

const showMessage = (message) => {
  const options = {
    type: "info",
    title: "Information",
    message: message,
    buttons: ["Yes"],
  };
  dialog.showMessageBox(options);
};

const backupDb = () => {
  const options = {
    title: "请选择要备份的文件名",
    buttonLabel: "保存",
    defaultPath: "my.db",
    filters: [{ name: "Custom File Type", extensions: ["db"] }],
  };
  dialog.showSaveDialog(options).then(async (result) => {
    if (!result.canceled) {
      const fileReadStream = fs.createReadStream(path.join(__dirname, "my.db"));
      const fileWriteStream = fs.createWriteStream(result.filePath);
      fileReadStream.pipe(fileWriteStream);
      fileWriteStream.on("close", function () {
        showMessage("备份成功");
      });
    }
  });
};

const restoreDb = () => {
  const options = {
    title: "请选择要还原的文件",
    buttonLabel: "还原",
    defaultPath: "my.db",
    filters: [{ name: "Custom File Type", extensions: ["db"] }],
    properties: ["openFile"],
  };
  dialog.showOpenDialog(options).then(async (result) => {
    console.log(result);
    if (!result.canceled) {
      const fileReadStream = fs.createReadStream(result.filePaths[0]);
      const fileWriteStream = fs.createWriteStream(
        path.join(__dirname, "my.db")
      );
      fileReadStream.pipe(fileWriteStream);
      fileWriteStream.on("close", function () {
        showMessage("还原成功");
      });
    }
  });
};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    minWidth: 400,
    backgroundColor: "#fff",
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools.
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  globalShortcut.register("CommandOrControl+Option+S", async function () {
    const now = dayjs();
    const createDate = now.format("YYYY-MM-DD");
    const createTime = now.format("HH:mm:ss");
    const timestamp = now.valueOf();
    let content = clipboard.readText();
    if (content.indexOf("Kindle 位置") > 0) {
      content = content.split(/\n/)[0];
    }
    content = utils.encode(content);
    let result = null;
    if (urlReg.test(content)) {
      const html = await rp(content);
      const $ = cheerio.load(html);
      const title = $("head title").text();
      result = await urlRepo.create({
        title: title,
        link: content.trim(),
        createDate: createDate,
        timestamp: timestamp,
      });
    } else {
      result = await noteRepo.create({
        content: content,
        createDate: createDate,
        createTime: createTime,
        timestamp: timestamp,
      });
    }
    mainWindow.webContents.send("reload", result);
    console.log(result);
  });

  trayIcon = new Tray(path.join(__dirname, "assets/IconTemplate.png"));

  trayIcon.on("click", function () {
    if (mainWindow === null) {
      return;
    }
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("will-quit", function () {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
