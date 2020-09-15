const ipcRenderer = require("electron").ipcRenderer;
const { clipboard, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");
const prettier = require("prettier");
const request = require("request");
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

const notifyMe = () => {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification("您有新的内容保存到粘贴板");
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification("您有新的内容保存到粘贴板");
      }
    });
  }

  // At last, if the user has denied notifications, and you
  // want to be respectful there is no need to bother them any more.
};

const Nothing = require("./pages/nothing.js");
const HomeIndex = require("./pages/home/index.js");
const CodeList = require("./pages/code/list.js");
const CodeEdit = require("./pages/code/edit.js");
const UrlList = require("./pages/url/list.js");
const UrlEdit = require("./pages/url/edit.js");
const NoteList = require("./pages/note/list.js");

const routes = [
  { path: "/", component: HomeIndex },
  { path: "/url/list", component: UrlList },
  { path: "/url/edit/:id?", component: UrlEdit },
  { path: "/code/list", component: CodeList },
  { path: "/code/edit/:id?", component: CodeEdit },
  { path: "/note/list", component: NoteList },
];

const router = new VueRouter({
  routes, // (缩写) 相当于 routes: routes
});

var app = new Vue({
  el: "#app",
  router,
  data: {
    message: "Hello Vue!",
  },
});
