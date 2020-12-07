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
      <el-form :model="urlForm" ref="urlForm" label-position="top">
        <el-form-item label="日期" prop="date" :rules="[
            { required: true, message: '请选择日期', trigger: 'blur' },
          ]">
          <el-date-picker
            v-model="urlForm.date"
            type="daterange"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <div class="form-group" style="margin-top: 20px;">
          <el-button type="primary" size="small" @click="handleImport">导出Url</el-button>
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
    handleImport() {
      this.$refs["urlForm"].validate((valid) => {
        if (valid) {
          const dates = this.urlForm.date;
          ipcRenderer.send("export-url", { dates: dates });
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
      urlForm: {
        date: "",
      },
    };
  },
};

module.exports = Setting;
