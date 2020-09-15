const { app, BrowserWindow, globalShortcut, clipboard, Menu, dialog, ipcMain, Tray } = require('electron');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
const rp = require('request-promise');
const cheerio = require('cheerio');

const utils = require(path.join(__dirname, 'utils/index.js'));

const AppDAO = require(path.join(__dirname, 'db/app_dao.js'));
const dao = new AppDAO(path.join(__dirname, 'my.db'));

const CodeRepository = require(path.join(__dirname, 'db/code_repository.js'));
const codeRepo = new CodeRepository(dao);

const UrlRepository = require(path.join(__dirname, 'db/url_repository.js'));
const urlRepo = new UrlRepository(dao);

const NoteRepository = require(path.join(__dirname, 'db/note_repository.js'));
const noteRepo = new NoteRepository(dao);

codeRepo.createTable();
urlRepo.createTable();
noteRepo.createTable();

const urlReg = /(http[s]:)?\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/;


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

ipcMain.on('save-dialog', (event,data) => {
  const options = {
    title: "请选择要保存的文件名",
    buttonLabel: "保存",
    defaultPath: data.filename,
    filters: [
      { name: 'Custom File Type', extensions: [data.type] },
    ]
  }
  dialog.showSaveDialog(options).then(result => {
    event.sender.send('saved-file', result)
  })
});

const init = () => {
  app.dock.setIcon(path.join(__dirname, 'assets/IconTemplate@2x.png'));
  app.setName('我的知识库');

  if (process.platform === 'darwin') {
    const template = [
      {
        label: "我的知识库",
        submenu: [
          { label: "退出", accelerator: "Command+Q", click: function() { app.quit(); }}
        ]
      }, 
      {
        label: "编辑",
        submenu: [
          { label: "复制", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "粘贴", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        ]
      },
      {
        label: "初始化",
        submenu: [
          { label: "清除", accelerator: "CmdOrCtrl+Shift+C", click: function() { noteRepo.reset(); }}
        ]
      }, 
      // {
      //   label: "导出",
      //   submenu: [
      //     { label: "全部导出Json", accelerator: "CmdOrCtrl+Shift+J", click: function() { exportData('json') }},
      //     { label: "全部导出Text", accelerator: "CmdOrCtrl+Shift+T", click: function() { exportData('txt') }}
      //   ]
      // },
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  } else {
    Menu.setApplicationMenu(null)
  }
}
init();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, trayIcon;

const exportData = (type) => {
  const options = {
    title: "请选择要保存的文件名",
    buttonLabel: "保存",
    defaultPath: Date.now() + '',
    filters: [
      { name: 'Custom File Type', extensions: [type] },
    ]
  }
  dialog.showSaveDialog(options).then(result => {
    codeRepo.getAll().then(notes => {
      let content = '';
      fs.writeFileSync(result.filePath, content);
    })
  })
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    minWidth: 300,
    backgroundColor: '#fff',
    webPreferences: {
      nodeIntegration: true
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  if(process.env.NODE_ENV === 'development'){
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  globalShortcut.register('CommandOrControl+Option+N', async function () {
    const now = dayjs();
    const createDate = now.format('YYYY-MM-DD');
    const createTime = now.format('HH:mm:ss');
    const timestamp = now.valueOf();
    const content = utils.encode(clipboard.readText());
    let result = null;
    if(urlReg.test(content)){
      const html = await rp(content);
      const $ = cheerio.load(html);
      const title = $('head title').text();
      result = await urlRepo.create({
        title: title,
        link: content,
        createDate: createDate,
        timestamp: timestamp
      });
    } else {
      result = await noteRepo.create({
        content: content, 
        createDate: createDate, 
        createTime: createTime,
        timestamp: timestamp 
      });
    }
    console.log(result);
  });

  trayIcon = new Tray(path.join(__dirname, 'assets/IconTemplate.png'));

  trayIcon.on('click', function(){
    if(mainWindow === null){
      return;
    }
    if(mainWindow.isVisible()){
      mainWindow.hide();
    }else {
      mainWindow.show();
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-quit', function () {
    // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
