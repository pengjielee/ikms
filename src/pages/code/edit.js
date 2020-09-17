const Edit = {
  template: `
    <div class="pure-form pure-form-stacked">
      <div class="form-group">
        <div class="form-label">代码</div>
        <div class="form-control">
          <textarea ref="code"></textarea>
        </div>
      </div>
      <div class="form-group">
        <div class="form-label">类别</div>
        <div class="form-control form-radios">
          <el-radio-group v-model="tags">
            <el-radio label="javascript">javascript</el-radio>
            <el-radio label="html">html</el-radio>
            <el-radio label="css">css</el-radio>
            <el-radio label="scss">scss</el-radio>
            <el-radio label="markdown">markdown</el-radio>
            <el-radio label="vue">vue</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div class="form-group form-btns">
        <el-button type="primary" size="medium" @click="handleSave">保存</el-button>
        <el-button size="medium" @click="handleBack">返回</el-button>
      </div>
    </div>
	`,
  mounted: async function () {
    const editor = CodeMirror.fromTextArea(this.$refs.code, {
      lineNumbers: true,
    });
    // editor.on('change', (codeMirror) => {});
    this.editor = editor;

    const { id } = this.$route.params;
    if (id) {
      const { content, tags } = await codeRepo.getById(id);
      editor.doc.setValue(content);
      this.tags = tags;
    }
  },
  watch: {
    tags: function (newVal) {
      console.log(newVal);
      let content = this.editor.doc.getValue();
      let parser = newVal === "javascript" ? "babel" : newVal;
      try {
        content = prettier.format(content, { parser: parser, semi: false });
        content = content[0] === ";" ? content.slice(1) : content;
      } catch (e) {
        console.log(e);
      }
      this.editor.doc.setValue(content);
    },
  },
  methods: {
    handleSave() {
      const { id } = this.$route.params;
      const now = dayjs();
      const note = {
        createDate: now.format("YYYY-MM-DD"),
        createTime: now.format("HH:mm:ss"),
        timestamp: now.valueOf(),
        tags: this.tags,
      };

      let parser = this.tags === "javascript" ? "babel" : this.tags;
      let content = this.editor.doc.getValue();
      try {
        content = prettier.format(content, { parser: parser, semi: false });
        content = content[0] === ";" ? content.slice(1) : content;
      } catch (e) {
        console.log(e);
      }
      note.content = content;

      if (id) {
        note.id = id;
        codeRepo.update(note).then((res) => {
          this.handleBack();
        });
      } else {
        codeRepo.create(note).then((res) => {
          this.handleBack();
        });
      }
    },
    handleBack() {
      // this.$router.back();
      const page = localStorage.getItem("CODEPAGE") || 1;
      this.$router.push(`/code/list/${page}`);
    },
  },
  data() {
    return {
      tags: "javascript",
    };
  },
};
module.exports = Edit;
