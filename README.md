一个本地的知识库管理系统。

## 相关命令

```
// 安装依赖
$ npm install

// 本地开发（打开开发者工具）
$ npm run dev

// 本地启动
$ npm start

// 打包dmg
$ npm run dmg

// 格式化代码 
$ npm run pertty
```

## 技术栈

Electron + Vue + sqlite3

## 实现功能

1. Url管理；

- 手动添加Url；
- 复制添加Url（复制Url时，按Command+Option+S，会自动保存至Url）；
- 修改Url；
- 删除Url；
- 打开Url;

2. 代码管理；

- 添加代码；
- 修改代码；
- 删除代码；
- 复制代码；
- 格式化代码；
- 按类别查找；

3. 笔记管理；

- 手动添加笔记；
- 复制添加笔记（复制一段内容时，按Command+Option+S，会自动保存至Note）；
- 删除笔记；
- 按关键字/日期查找；

4. 其他功能；

- 更换主题（default/dark/blue/red）；
- 重置知识库（Url/Note/Code）；
- 导出知识库，导出为文本文件（Url/Note/Code）；
- 备份还原知识库，备份整个数据库文件；

