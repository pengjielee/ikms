const List = {
  components: {
    nothing: Nothing,
  },
  template: `
    <div class="page-notes">
      <div class="navs">
        <el-input size="medium" v-model="form.keyword" placeholder="请输入关键字"></el-input>
        <el-date-picker
          size="medium"
          v-model="form.date"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期">
        </el-date-picker>
        <el-button size="medium" type="primary" @click="handleSearch">Search</el-button>
      </div>
      <template v-if="status === 'loading'">
        <div class="loading">
          <i class="el-icon-loading"></i>
        </div>
      </template>
      <template v-else>
        <template v-if="list.length > 0">
      		<ul class="list">
      		  <li v-for="item in list" :key="item.id" class="item">
              <div class="content" v-html="item.content">
              </div>
              <div class="footer">
                <span class='date'>{{item.createDate}} {{item.createTime}}</span>
        		    <div class="actions">
                  <el-link type="danger" @click="handleDelete(item.id)">删除</el-link>
                  <el-link type="success" @click="handleCopy(item.content)">复制</el-link>
        		    </div>
              </div>
      		  </li>
      		</ul>
          <el-pagination
            layout="prev, pager, next"
            background
            :page-size="form.size"
            :hide-on-single-page="showPaging"
            :total="form.total"
            @current-change="handlePageChange">
          </el-pagination>
        </template>
        <template v-else>
          <nothing />
        </template>
      </template>
    </div>
	`,
  created: async function () {
    this.getList(1);
    this.getTotal();
    ipcRenderer.on("reload", (event, notes) => {
      this.getList(1);
      this.getTotal();
      notifyMe();
    });
  },
  methods: {
    handleDelete(id) {
      this.$alert("确认删除？", "提示", {
        confirmButtonText: "确定",
        callback: (action) => {
          if (action === "confirm") {
            noteRepo.delete(id).then(async (res) => {
              this.$message({ type: "success", message: "删除成功" });
              this.getList(1);
              this.getTotal();
            });
          }
        },
      });
    },
    handleCopy(content) {
      content = utils.decode(content);
      clipboard.writeText(content);
      this.$message("已复制到剪粘板");
    },
    handlePageChange(page) {
      this.page = page;
      this.getList(page);
    },
    async getList(page) {
      const { size, keyword, date } = this.form;
      this.list = await noteRepo.search({
        page: page,
        size: size,
        keyword: keyword,
        date: date,
      });
      this.status = "";
    },
    async getTotal() {
      const { keyword, date } = this.form;
      const result = await noteRepo.searchTotal({
        keyword: keyword,
        date: date,
      });
      this.form.total = result[0].num;
    },
    handleSearch() {
      this.page = 1;
      this.getTotal();
      this.getList(this.page);
    },
  },
  data() {
    return {
      list: [],
      showPaging: true,
      status: "loading",
      filter: "",
      form: {
        keyword: "",
        date: "",
        page: 1,
        size: 10,
        total: 0,
      },
    };
  },
};

module.exports = List;
