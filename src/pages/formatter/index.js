const Edit = {
  template: `
    <div class="page-formatter">
      <div class="pure-form pure-form-stacked">
        <div class="form-group">
          <div class="form-label">代码</div>
          <div class="form-control">
            <textarea ref="code"></textarea>
          </div>
        </div>
        <div class="form-group">
          <div class="form-label">parser</div>
          <div class="form-control form-radios">
            <el-radio-group v-model="parser">
              <el-radio label="babel">babel</el-radio>
              <el-radio label="html">html</el-radio>
              <el-radio label="css">css</el-radio>
              <el-radio label="scss">scss</el-radio>
              <el-radio label="markdown">markdown</el-radio>
              <el-radio label="vue">vue</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="form-group form-btns">
          <el-button type="primary" size="medium" @click="handleSave">格式化</el-button>
        </div>
      </div>
    </div>
	`,
  mounted: async function () {
    const editor = CodeMirror.fromTextArea(this.$refs.code, {
      lineNumbers: true,
    });
    // editor.on('change', (codeMirror) => {});
    this.editor = editor;
  },
  methods: {
    handleSave() {
      let parser = this.parser;
      let content = this.editor.doc.getValue();
      try {
        content = prettier.format(content, { parser: parser, semi: false });
        content = content[0] === ";" ? content.slice(1) : content;
      } catch (e) {
        console.log(e);
      }
      this.editor.doc.setValue(content)
    },
  },
  data() {
    return {
      parser: "babel",
    };
  },
};
module.exports = Edit;
