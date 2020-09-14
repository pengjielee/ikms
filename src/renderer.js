const ipcRenderer = require('electron').ipcRenderer;
const {clipboard} = require('electron');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const prettier = require("prettier");

const AppDAO = require(path.join(__dirname, 'db/app_dao.js'));
const CodeRepository = require(path.join(__dirname, 'db/code_repository.js'));
const dao = new AppDAO(path.join(__dirname, 'my.db'));
const codeRepo = new CodeRepository(dao);

const Nothing = require('./pages/nothing.js');
const CodeList = require('./pages/codelist.js');
const CodeEdit = require('./pages/codeedit.js');

const routes = [
  { path: '/', component: CodeList },
  { path: '/edit/:id?', component: CodeEdit }
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