<template>
  <div class="app-container">
    <el-card>
      <div slot="header" align="center">
        <h1>Knowledge Graph Overview</h1>
      </div>
      <template>
        <el-table
          :data="tableData"
          :default-sort="{ prop: 'name' }"
          style="width: 90%; text-align: center; margin: 0 auto 20px auto"
          v-loading="loading"
        >
          <el-table-column label="ID" width="100" type="index"> </el-table-column>
          <el-table-column prop="name" label=" Graph Name">
            <template slot-scope="scope">
              <div slot="reference" class="name-wrapper">
                {{ scope.row.name }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label=" Node Count" width="200">
            <template slot-scope="scope">
              <div slot="reference" class="name-wrapper">
                {{ scope.row.vertexNum }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label=" Description">
            <template slot-scope="scope">
              <div slot="reference" class="name-wrapper">
                {{ scope.row.description }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label=" Operations" width="200">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="handleEdit(scope.$index, scope.row)"
                >Edit</el-button
              >
              <!-- 同类元素自动产生10px margin-left，这里两按钮属不同元素，得手动加 -->
              <el-popconfirm
                style="margin-left: 10px"
                title="确定删除该知识图谱吗？"
                @onConfirm="handleDelete(scope.$index, scope.row)"
              >
                <el-button
                  slot="reference"
                  size="mini"
                  icon="el-icon-delete"
                  type="danger"
                  >Delete</el-button
                >
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      tableData: [],
      loading: true,
    };
  },
  mounted() {
    this.getKgList();
  },
  methods: {
    getKgList() {
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kginstance/listsubgraph")
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.loading = false;
          }
          this.tableData = data.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    handleEdit(index, row) {
      console.log(index, row);
      this.$router.push({
        path: "/knowledge-graph/update/",
        query: { name: row.name },
      });
    },
    handleDelete(index, row) {
      console.log(index, row);
      this.tableData.splice(index, 1);
    },
  },
};
</script>
