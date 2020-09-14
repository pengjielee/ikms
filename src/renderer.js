const ipcRenderer = require('electron').ipcRenderer;
const {clipboard} = require('electron');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const prettier = require("prettier");
const request = require('request');
const cheerio = require('cheerio');

const AppDAO = require(path.join(__dirname, 'db/app_dao.js'));
const dao = new AppDAO(path.join(__dirname, 'my.db'));

const CodeRepository = require(path.join(__dirname, 'db/code_repository.js'));
const codeRepo = new CodeRepository(dao);

const UrlRepository = require(path.join(__dirname, 'db/url_repository.js'));
const urlRepo = new UrlRepository(dao);

const Nothing = require('./pages/nothing.js');
const HomeIndex = require('./pages/home/index.js');
const CodeList = require('./pages/code/list.js');
const CodeEdit = require('./pages/code/edit.js');
const UrlList = require('./pages/url/list.js');
const UrlEdit = require('./pages/url/edit.js');

const routes = [
	{ path: '/', component: HomeIndex },
	{ path: '/url/list', component: UrlList },
  { path: '/url/edit/:id?', component: UrlEdit },
  { path: '/code/list', component: CodeList },
  { path: '/code/edit/:id?', component: CodeEdit }
];

const router = new VueRouter({
  routes // (缩写) 相当于 routes: routes
});

var app = new Vue({
  el: '#app',
  router,
  data: {
    message: 'Hello Vue!',
  }
});