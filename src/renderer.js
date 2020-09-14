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

const CodeList = { 
	template: `
		<ul class="code-list">
		  <li v-for="item in list" :key="item.id" v-if="item.content.length > 0" class="code-item">
		    <div class="content">
          <highlightjs autodetect :code="item.content" />
        </div>
		    <p class="actions">
		    	<a @click="handleJump(item.id)">edit</a>
          <a @click="handleDelete(item.id)">delete</a>
		    </p>
		  </li>
		</ul>
	`,
  created: async function(){
  	this.list = await codeRepo.getAll();
  },
  methods: {
  	handleJump(id){
  		this.$router.push(`/edit/${id}`);
  	},
    handleDelete(id){
      codeRepo.delete(id).then(async res => {
        console.log(res);
        this.list = await codeRepo.getAll();
      })
    }
  },
	data() {
    return {
      list: [],
    }
  } 
};

const CodeEdit = {
	template: `
    <div class="pure-form pure-form-stacked">
      <div class="form-group">
        <div class="form-label">内容</div>
        <div class="form-control">
          <textarea ref="code"></textarea>
        </div>
      </div>
      <div class="form-group">
        <div class="form-label">标签</div>
        <div class="form-control pure-u-1">
          <input type="text" class="pure-input-1" v-model="tags"/>
        </div>
      </div>
      <div class="form-group">
        <div class="form-label">格式化</div>
        <div class="form-control form-radios">
          <label class="pure-radio"><input type="radio" value="babel" v-model="parser" />babel</label>
          <label class="pure-radio"><input type="radio" value="html" v-model="parser"/>html</label>
          <label class="pure-radio"><input type="radio" value="css" v-model="parser"/>css</label>
          <label class="pure-radio"><input type="radio" value="scss" v-model="parser"/>scss</label>
          <label class="pure-radio"><input type="radio" value="markdown" v-model="parser"/>markdown</label>
          <label class="pure-radio"><input type="radio" value="vue" v-model="parser"/>vue</label>
        </div>
      </div>
      <div class="form-group form-btns">
        <button class="pure-button pure-button-primary" @click="handleSave">保存</button>
        <button class="pure-button" @click="handleBack">返回</button>
      </div>
    </div>
	`,
  mounted: async function(){
  	const editor = CodeMirror.fromTextArea(this.$refs.code, {
	    lineNumbers: true
	  });
	  // editor.on('change', (codeMirror) => {});
    this.editor = editor;

	  const { id } = this.$route.params; 
  	if(id) {
  		const { content, tags } = await codeRepo.getById(id);
  		editor.doc.setValue(content);
  		this.tags = tags;
  	};
  },
  watch: {
    parser: function(newVal){
      let content = this.editor.doc.getValue();
      try{
        content = prettier.format(content, { parser: newVal, semi: false });
        content = content[0] === ';' ? content.slice(1) : content;
      }catch(e){
        console.log(e);
      }
      this.editor.doc.setValue(content);
    }
  },
  methods: {
    handleSave() {
      const { id } = this.$route.params; 
      const now = dayjs();
      const note = {
        createDate: now.format('YYYY-MM-DD'),
        createTime: now.format('HH:mm:ss'),
        timestamp: now.valueOf(),
        tags: this.tags,
        content: this.editor.doc.getValue()
      }

      if(id){
        note.id = id;
        codeRepo.update(note).then(res => {
          console.log(res);
          this.$router.push('/');
        })
      } else {
        codeRepo.create(note).then(res => {
          console.log(res);
          this.$router.push('/');
        })
      }
    },
    handleBack() {
      this.$router.back();
    }
  },
	data() {
    return {
      tags: '',
      parser: 'babel'
    }
  }
}

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
    message: 'Hello Vue!'
  }
});