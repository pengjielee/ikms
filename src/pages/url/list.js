const List = {
  components: {
    nothing: Nothing,
  },
  template: `
    <div>
      <div class="navs">
        <div class="left">
        </div>
        <el-button type="success" size="small" @click="handleNew">新建</el-button>
      </div>
      <template v-if="status === 'loading'">
        <div class="loading">
          <i class="el-icon-loading"></i>
        </div>
      </template>
      <template v-else>
        <template v-if="list.length > 0">
          <ul class="list list-url">
            <li v-for="item in list" :key="item.id" class="item">
              <div class="content">
                <p>{{ item.title }}</p>
                <p>{{ item.link }}</p>
              </div>
              <div class="footer">
                <p></p>
                <div class="actions">
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

  created: function(){
    this.getList(1);
    this.getTotal();
  },
  methods: {
    handleEdit(id){
      this.$router.push(`/url/edit/${id}`);
    },
    handleNew() {
      this.$router.push(`/url/edit`);
    },
    handleDelete(id){
      this.$alert('确认删除？', '提示', {
        confirmButtonText: '确定',
        callback: action => {
          urlRepo.delete(id).then(async res => {
            this.$message({ type: 'success', message: '删除成功'});
            this.getList(1);
            this.getTotal();
          });
        }
      });
    },
    handlePageChange(page) {
      this.page = page;
      this.getList(page);
    },
    async getList(page) {
      const { size } = this;
      this.list = await urlRepo.getByPage(page,size);
      console.log(this.list);
      this.status = '';
    },
    async getTotal(){
      const result = await urlRepo.getTotal();
      this.total = result[0].num;
    }
  },

  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      size: 10,
      showPaging: true,
      status: 'loading',
    }
  } 
}

module.exports = List;