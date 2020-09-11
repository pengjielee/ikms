const ipcRenderer = require('electron').ipcRenderer;
const {clipboard} = require('electron');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

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
		<el-form ref="form" :model="form" label-width="80px">
		  <el-form-item label="内容">
		    <textarea ref="code"></textarea>
		  </el-form-item>
		  <el-form-item label="标签">
		    <el-input v-model="form.tags"></el-input>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" @click="onSubmit">立即创建</el-button>
		  </el-form-item>
		</el-form>
	`,
  mounted: async function(){
  	const editor = CodeMirror.fromTextArea(this.$refs.code, {
	    lineNumbers: true
	  });
	  editor.on('change', (codeMirror) => {
	  	this.form.content = codeMirror.doc.getValue();
	  });

	  const { id } = this.$route.params; 
  	if(id) {
  		const { content, tags } = await codeRepo.getById(id);
  		editor.doc.setValue(content);
  		this.form.content = content;
  		this.form.tags = tags;
  	};
  },
  methods: {
    onSubmit() {
      const form = this.$data.form;
      const now = dayjs();
      const note = Object.assign({}, form, {
      	createDate: now.format('YYYY-MM-DD'),
      	createTime: now.format('HH:mm:ss'),
      	timestamp: now.valueOf()
      });
      codeRepo.create(note).then(res => {
      	console.log(res);
      	this.$router.push('/');
      })
    }
  },
	data() {
    return {
      form: {
      	content: '',
        tags: '',
      }
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