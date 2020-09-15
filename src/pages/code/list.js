const List = {
  components: {
    nothing: Nothing,
  },
  template: `
    <div class="page-codes">
      <div class="navs">
        <div class="left">
          <el-select v-model="filter" placeholder="请选择" size="medium">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-button type="primary" size="medium" @click="handleFilter">Filter</el-button>
        </div>
        <el-button type="success" size="medium" @click="handleNew">新建</el-button>
      </div>
      <template v-if="status === 'loading'">
        <div class="loading">
          <i class="el-icon-loading"></i>
        </div>
      </template>
      <template v-else>
        <template v-if="list.length > 0">
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
                  <el-link type="success" @click="handleCopy(item.content)">复制</el-link>
                  <el-link type="primary" @click="handleEdit(item.id)">编辑</el-link>
                  <el-link type="danger" @click="handleDelete(item.id)">删除</el-link>
        		    </div>
              </div>
      		  </li>
      		</ul>
          <el-pagination
            layout="prev, pager, next"
            background
            :page-size="size"
            :hide-on-single-page="true"
            :total="total"
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
    handleCopy(content) {
      content = utils.decode(content);
      clipboard.writeText(content);
      this.$message("已复制到剪粘板");
    },
    handleEdit(id) {
      this.$router.push(`/code/edit/${id}`);
    },
    handleNew() {
      this.$router.push(`/code/edit`);
    },
    handleDelete(id) {
      this.$alert("确认删除？", "提示", {
        confirmButtonText: "确定",
        callback: (action) => {
          codeRepo.delete(id).then(async (res) => {
            this.$message({ type: "success", message: "删除成功" });
            this.getList(1);
            this.getTotal();
          });
        },
      });
    },
    handlePageChange(page) {
      this.page = page;
      this.getList(page);
    },
    async getList(page) {
      const { filter, size } = this;
      if (filter) {
        this.list = await codeRepo.getByTag(filter, page, size);
      } else {
        this.list = await codeRepo.getByPage(page, size);
      }
      this.status = "";
    },
    async getTotal() {
      const filter = this.filter;
      const result = await codeRepo.getTotal(filter);
      this.total = result[0].num;
    },
    handleFilter() {
      this.page = 1;
      this.getTotal();
      this.getList(this.page);
    },
  },
  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      size: 10,
      showPaging: true,
      status: "loading",
      options: [
        {
          value: "",
          label: "全部",
        },
        {
          value: "html",
          label: "html",
        },
        {
          value: "css",
          label: "css",
        },
        {
          value: "javascript",
          label: "javascript",
        },
        {
          value: "scss",
          label: "scss",
        },
        {
          value: "vue",
          label: "vue",
        },
        {
          value: "markdown",
          label: "markdown",
        },
      ],
      filter: "",
    };
  },
};

module.exports = List;
