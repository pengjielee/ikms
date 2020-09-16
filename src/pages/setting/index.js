const Setting = {
  template: `
    <div class="page-setting">
    	<el-form :model="form" ref="form" label-position="top">
	      <el-form-item label="主题" prop="theme" :rules="[
	          { required: true, message: '请选择主题', trigger: 'blur' },
	        ]">
			    <el-select v-model="form.theme" placeholder="请选择主题">
			      <el-option label="default" value="default"></el-option>
			      <el-option label="dark" value="dark"></el-option>
            <el-option label="blue" value="blue"></el-option>
            <el-option label="red" value="red"></el-option>
			    </el-select>
			  </el-form-item>
	      <div class="form-group" style="margin-top: 20px;">
	        <el-button type="primary" size="small" @click="handleSave">应用</el-button>
	      </div>
	    </el-form>
  	</div>
  `,
  created: function () {
    const theme = localStorage.getItem("theme") || "default";
    this.form.theme = theme;
    document
      .querySelector("#theme")
      .setAttribute("href", `assets/themes/${theme}.css`);
  },
  methods: {
    handleSave() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const theme = this.form.theme;
          localStorage.setItem("theme", theme);
          document
            .querySelector("#theme")
            .setAttribute("href", `assets/themes/${theme}.css`);
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
  },
  data: function () {
    return {
      form: {
        theme: "",
      },
    };
  },
};

module.exports = Setting;
