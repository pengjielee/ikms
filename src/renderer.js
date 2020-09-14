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

const Event = new Vue();

const CodeList = { 
	template: `
    <div>
  		<ul class="code-list">
  		  <li v-for="item in list" :key="item.id" class="code-item">
  		    <div class="content">
            <highlightjs autodetect :code="item.content" />
          </div>
          <div class="footer">
            <div>
              <el-tag size="small" v-if="item.tags">{{ item.tags }}</el-tag>
            </div>
    		    <div class="actions">
              <el-link type="primary" @click="handleJump(item.id)">编辑</el-link>
              <el-link type="danger" @click="handleDelete(item.id)">删除</el-link>
    		    </div>
          </div>
  		  </li>
  		</ul>
      <el-pagination
        small
        layout="prev, pager, next"
        :hide-on-single-page="true"
        :total="total"
        @current-change="handlePageChange">
      </el-pagination>
    </div>
	`,
  created: async function(){
  	const result = await codeRepo.getTotal();
    this.getList(1);
    this.total = result[0].num;
  },
  mounted: function(){
    const self = this;
    Event.$on('set-filter', async filter => {
      if(!this.filter) {
        this.page = 1;
      }
      this.filter = filter;
      this.getList(this.page);
    });
  },
  methods: {
  	handleJump(id){
  		this.$router.push(`/edit/${id}`);
  	},
    handleDelete(id){
      this.$alert('确认删除？', '提示', {
        confirmButtonText: '确定',
        callback: action => {
          codeRepo.delete(id).then(async res => {
            this.$message({ type: 'success', message: '删除成功'});
            this.getList(this.page);
          });
        }
      });
    },
    handlePageChange(page) {
      this.page = page;
      this.getList(page);
    },
    async getList(page) {
      if(this.filter) {
        this.list = await codeRepo.getByTag(this.filter, page);
      } else {
        this.list = await codeRepo.getByPage(page);
      }
    }
  },
	data() {
    return {
      list: [],
      total: 0,
      page: 1,
      showPaging: true,
      filter: '',
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
        <div class="form-label">类别</div>
        <div class="form-control form-radios">
          <label class="pure-radio"><input type="radio" value="javascript" v-model="tags" />javascript</label>
          <label class="pure-radio"><input type="radio" value="html" v-model="tags"/>html</label>
          <label class="pure-radio"><input type="radio" value="css" v-model="tags"/>css</label>
          <label class="pure-radio"><input type="radio" value="scss" v-model="tags"/>scss</label>
          <label class="pure-radio"><input type="radio" value="markdown" v-model="tags"/>markdown</label>
          <label class="pure-radio"><input type="radio" value="vue" v-model="tags"/>vue</label>
        </div>
      </div>
      <div class="form-group form-btns">
        <el-button type="primary" size="small" @click="handleSave">保存</el-button>
        <el-button size="small" @click="handleBack">返回</el-button>
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
    tags: function(newVal){
      console.log(newVal);
      let content = this.editor.doc.getValue();
      let parser = newVal === 'javascript' ? 'babel' : newVal;
      try{
        content = prettier.format(content, { parser: parser, semi: false });
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
        tags: this.tags
      }

      let parser = this.tags === 'javascript' ? 'babel' : this.tags;
      let content = this.editor.doc.getValue();
      try{
        content = prettier.format(content, { parser: parser, semi: false });
        content = content[0] === ';' ? content.slice(1) : content;
      }catch(e){
        console.log(e);
      }
      note.content = content;

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
      tags: 'javascript'
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
  methods: {
    handleFilter() {
      Event.$emit('set-filter', this.filter);
    }
  },
  data: {
    message: 'Hello Vue!',
    options: [{
      value: '',
      label: '全部'
    },{
      value: 'html',
      label: 'html'
    },{
      value: 'css',
      label: 'css'
    },{
      value: 'javascript',
      label: 'javascript'
    },{
      value: 'scss',
      label: 'scss'
    },{
      value: 'vue',
      label: 'vue'
    },{
      value: 'markdown',
      label: 'markdown'
    }],
    filter: ''
  }
});