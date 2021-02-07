const Edit = {
  template: `
    <div class="page-tool">
      <div class="form-group">
        <div class="form-label">标题</div>
        <div class="form-control">
          <textarea class="textarea" v-model="title"></textarea>
        </div>
      </div>
      <div class="form-group">
        <div class="form-control">{{ result }}</div>
      </div>
      <div class="form-group form-btns">
        <el-button type="primary" size="medium" @click="handleProcess">处理并复制</el-button>
      </div>
    </div>
	`,
  methods: {
    handleProcess() {
      console.log(this.title);
      this.result = this.title.trim().toLowerCase().split(' ').join('-');
      clipboard.writeText(this.result);
    },
  },
  data() {
    return {
      title: '',
      result: ''
    };
  },
};
module.exports = Edit;
