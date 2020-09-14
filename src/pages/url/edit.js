const Edit = {
	template: `
    <el-form :model="form">
      <el-form-item
        prop="url"
        label="Url"
        :rules="[
          { required: true, message: '请输入Url', trigger: 'blur' },
          { type: 'url', message: '请输入正确的Url', trigger: ['blur', 'change'] }
        ]"
      >
        <el-input v-model="form.url" placeholder="请输入Url" clearable @change="handleChange"></el-input>
      </el-form-item>
      <el-form-item
        prop="title"
        label="标题"
      >
        <el-input v-model="form.title" placeholder="请输入标题" clearable></el-input>
      </el-form-item>
      <div class="form-group form-btns">
        <el-button type="primary" size="small" @click="handleSave">保存</el-button>
        <el-button size="small" @click="handleBack">返回</el-button>
      </div>
    </el-form>
	`,
  methods: {
    handleChange() {
      const self = this;
      const url = this.form.url;
      if(!url){
        return;
      }
      request(url, function (error, response, body) {
        if(error) {
          return;
        }
        const statusCode = response && response.statusCode;
        if(statusCode === 200){
          const $ = cheerio.load(body);
          const title = $('head title').text();
          self.form.title = title;
        }
      });
    },
    handleSave() {
      const { id } = this.$route.params; 
      const now = dayjs();
      const url = {
        createDate: now.format('YYYY-MM-DD'),
        timestamp: now.valueOf(),
        title: this.form.title,
        link: this.form.url,
      }

      if(id){
        url.id = id;
        urlRepo.update(url).then(res => {
          this.$router.push('/url/list');
        })
      } else {
        urlRepo.create(url).then(res => {
          this.$router.push('/url/list');
        })
      }
    },
    handleBack() {
      this.$router.back();
    }
  },
	data() {
    return {
      form: {
        title: '',
        link: '',
      }
    }
  }
}
module.exports = Edit;