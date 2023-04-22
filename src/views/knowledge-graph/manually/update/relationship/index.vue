<template>
  <div class="app-container">
    <div style="padding-bottom: 1em">
      <el-row :gutter="20">
        <el-col :span="18">
          <!-- 筛选区 -->
          <el-form :inline="true" :model="filterForm" class="demo-form-inline">
            <el-form-item label="filter by type">
              <el-select
                v-model="filterForm.label"
                placeholder="relationship type"
                clearable
              >
                <el-option
                  v-for="label in KGRelationshipLabels"
                  :key="label"
                  :label="label"
                  :value="label"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="6" style="text-align: left">
          <!-- 操作区 -->
          <el-button type="success" icon="el-icon-plus" @click="handleAdd">Add</el-button>
          <el-button type="success" icon="el-icon-upload" @click="handleImport"
            >Import</el-button
          >
          <el-dialog
            title="Add Relationship"
            :visible.sync="dialogAddRelationshipFormVisible"
          >
            <el-form :model="addForm" label-width="100px">
              <el-form-item label="relationship">
                <el-select v-model="addForm.name" placeholder="please select">
                  <el-option
                    v-for="node in KGRelationshipLabels"
                    :key="node"
                    :label="node"
                    :value="node"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="source entity">
                <el-select
                  v-model="addForm.start"
                  clearable
                  filterable
                  remote
                  :remote-method="loadCandidateStartEntityNode"
                  placeholder="search and select"
                  :loading="loadingCandidate"
                >
                  <el-option
                    v-for="node in candidateStartEntityNode"
                    :key="node.identity"
                    :label="node.name + ' - ' + node.label"
                    :value="node.identity"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="target entity">
                <el-select
                  v-model="addForm.end"
                  clearable
                  filterable
                  remote
                  :remote-method="loadCandidateEndEntityNode"
                  placeholder="search and select"
                  :loading="loadingCandidate"
                >
                  <el-option
                    v-for="node in candidateEndEntityNode"
                    :key="node.identity"
                    :label="node.name + ' - ' + node.label"
                    :value="node.identity"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button @click="dialogAddRelationshipFormVisible = false"
                >Cancel</el-button
              >
              <el-button type="primary" @click="addRelationshipFromForm"
                >Confirm</el-button
              >
            </div>
          </el-dialog>
          <el-dialog
            title="Import Relationships"
            :visible.sync="dialogImportRelationshipFormVisible"
            @closed="fileList = []"
          >
            <el-form size="mini" label-width="150px" label-position="right">
              <el-form-item label="download template">
                <el-button type="primary" @click="downloadTemplate"
                  >template.csv</el-button
                >
              </el-form-item>
              <el-form-item label="upload file">
                <el-upload
                  class="upload-demo"
                  ref="upload"
                  accept=".csv"
                  action=""
                  drag
                  multiple
                  :file-list="fileList"
                  :auto-upload="false"
                  :on-change="onFileChange"
                  :on-remove="onFileRemove"
                  :http-request="uploadFiles"
                >
                  <i class="el-icon-upload"></i>
                  <div class="el-upload__text">
                    drag the file here, or<em> click to upload</em>
                  </div>
                  <div class="el-upload__tip" slot="tip">accept file type: .csv</div>
                </el-upload>
              </el-form-item>
              <el-form-item label="select datasets">
                <el-button type="primary">browse repo</el-button>
              </el-form-item>
            </el-form>
            <div slot="footer">
              <el-button @click="dialogImportRelationshipFormVisible = false"
                >Cancel</el-button
              >
              <el-button type="primary" @click="importRelationshipFromFiles"
                >Confirm</el-button
              >
            </div>
          </el-dialog>
        </el-col>
      </el-row>
    </div>
    <div>
      <!-- 展示区 -->
      <el-table :data="KGRelationshipList" style="width: 100%" v-loading="loading">
        <el-table-column label="ID" width="100" align="center">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.identity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Relation" align="center">
          <template slot-scope="scope">
            <div slot="reference" class="name-wrapper">
              {{ scope.row.label.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Source Entity" width="200" align="center">
          <template slot-scope="scope">
            <div slot="reference" class="name-wrapper">
              {{ scope.row.start.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Target Entity" width="200" align="center">
          <template slot-scope="scope">
            <div slot="reference" class="name-wrapper">
              {{ scope.row.end.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Relationship Attributes" width="200" align="center">
          <template slot-scope="scope">
            <div slot="reference" class="name-wrapper">
              <el-popover placement="bottom" width="200" trigger="hover">
                <template>
                  <el-table :data="scope.row.attributes">
                    <el-table-column
                      property="key"
                      label="attribute name"
                    ></el-table-column>
                    <el-table-column
                      property="value"
                      label="attribute value"
                    ></el-table-column>
                  </el-table>
                </template>
                <el-button slot="reference" size="mini">View</el-button>
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Operations" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleUpdateByEdit(scope.$index, scope.row)"
              >Edit</el-button
            >
            <!-- 同类元素自动产生10px margin-left，这里两按钮属不同元素，得手动加 -->
            <el-popconfirm
              style="margin-left: 10px"
              title="Sure to delete?"
              @onConfirm="handleDelete(scope.$index, scope.row)"
            >
              <el-button slot="reference" size="mini" type="danger">Delete</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="padding-top: 20px"
        background
        layout="prev, pager, next"
        :total="tableInfo.total"
        :current-page="tableInfo.currentPage"
        @current-change="handelPageChange"
      >
      </el-pagination>
      <el-dialog :visible.sync="dialogEditRelationshipFormVisible">
        <div slot="title">
          Edit Relationship
          <el-tooltip
            content="You can edit attributes of the relationship. If you want to change the type or topology, please delete the relationship and create a new one."
            placement="bottom-start"
          >
            <i class="el-icon-question"></i>
          </el-tooltip>
        </div>
        <el-form :model="editForm" label-width="100px">
          <el-form-item label="relationship">
            <el-select v-model="editForm.name" disabled>
              <el-option
                v-for="node in KGRelationshipLabels"
                :key="node"
                :label="node"
                :value="node"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="source">
            <!-- <el-input v-model="editForm.start" placeholder="请选择关系起点"></el-input> -->
            <el-select
              v-model="editForm.start"
              clearable
              filterable
              remote
              disabled
              :remote-method="loadCandidateStartEntityNode"
              placeholder="search and select"
              :loading="loadingCandidate"
            >
              <el-option
                v-for="node in candidateStartEntityNode"
                :key="node"
                :label="node"
                :value="node"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="target">
            <!-- <el-input v-model="editForm.end" placeholder="请选择关系终点"></el-input> -->
            <el-select
              v-model="editForm.end"
              clearable
              filterable
              remote
              disabled
              :remote-method="loadCandidateEndEntityNode"
              placeholder="search and select"
              :loading="loadingCandidate"
            >
              <el-option
                v-for="node in candidateEndEntityNode"
                :key="node"
                :label="node"
                :value="node"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="attibute list">
            <el-table :data="editForm.attr">
              <el-table-column label="attribute name">
                <template slot-scope="subScope">
                  <span>{{ subScope.row.key }}</span>
                </template>
              </el-table-column>
              <el-table-column label="attribute value">
                <template slot-scope="subScope">
                  <el-input
                    v-model="subScope.row.value"
                    placeholder="please input"
                  ></el-input>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogEditRelationshipFormVisible = false">Cancel</el-button>
          <el-button type="primary" @click="updateRelationshipByEditFromForm"
            >Confirm</el-button
          >
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  computed: {
    /**
     * @deprecated
     */
    filteredTotal() {
      // 筛选后更新总数用于分页
      return this.filterByLabel(this.KGRelationshipList, this.filterForm.label).length;
    },
    /**
     * @deprecated
     */
    pagedTable() {
      // to fix: 进入页面时，curpage的初始化1可能尚未生效，仍为0，导致首页不显示
      if (this.tableInfo.currentPage < 1) {
        this.tableInfo.currentPage = 1;
      }
      // to fix: 处在最后一页时缩小筛选条件，需要把curpage置为新的maxpage
      // 否则从max400筛选成max60，页码变60但data还是第400页，为空
      if (this.tableInfo.currentPage > Math.ceil(this.filteredTotal / 10)) {
        this.tableInfo.currentPage = Math.ceil(this.filteredTotal / 10);
      }
      // 先把KGEntitylist按照name筛选，其结果再按照label筛选，再按页码切分
      return this.filterByLabel(this.KGRelationshipList, this.filterForm.label).slice(
        (this.tableInfo.currentPage - 1) * 10,
        this.tableInfo.currentPage * 10
      );
    },
  },
  data() {
    return {
      KGRelationshipList: [],
      KGRelationshipLabels: [],
      dialogAddRelationshipFormVisible: false,
      dialogEditRelationshipFormVisible: false,
      dialogImportRelationshipFormVisible: false,
      addForm: {
        // 表单添加关系
        name: "",
        start: "",
        end: "",
      },
      fileList: [],
      filterForm: {
        // 筛选
        label: "",
      },
      editForm: {
        // 表单编辑关系
        // index: "",
        name: "",
        start: "",
        end: "",
        attr: [],
        oldName: "",
        oldStart: "",
        oldEnd: "",
        startId: "",
        endId: "",
      },
      tableInfo: {
        currentPage: 1,
        total: 0,
      },
      loading: true,
      candidateStartEntityNode: [],
      candidateEndEntityNode: [],
      loadingCandidate: true,
    };
  },
  watch: {
    "filterForm.label"() {
      this.tableInfo.currentPage = 1;
      this.loadRelationshipTotal();
      this.loadRelationshipList();
    },
  },
  methods: {
    // 筛选
    /**
     * @param data 被筛选的tableData数组
     * @param conds 筛选条件字符串数组
     * @deprecated
     */
    filterByLabel(data, conds) {
      if (conds.length == 0) {
        return data;
      }
      return data.filter((item) => {
        if (conds.includes(item.label.name)) {
          return item;
        }
      });
    },
    handelPageChange(newPage) {
      this.tableInfo.currentPage = newPage;
      console.log(this.tableInfo.currentPage);
      this.loadRelationshipList();
    },
    handleUpdateByEdit(index, row) {
      // 表中[编辑]，打开对话框
      // console.log(index, row);
      // this.editForm.index = identity;
      this.editForm.name = row.label.name;
      this.editForm.start = row.start.name;
      this.editForm.end = row.end.name;
      this.editForm.startId = row.start.id;
      this.editForm.endId = row.end.id;
      this.editForm.attr = [];
      row.attributes.forEach((element) => {
        this.editForm.attr.push(JSON.parse(JSON.stringify(element)));
      });
      // 因为数组和对象都是传引用，不能直接attr=attr
      // 否则会导致编辑attr时，即便不点确定，也同时修改
      this.editForm.oldName = row.label.name;
      this.editForm.oldStart = row.start.name;
      this.editForm.oldEnd = row.end.name;
      this.dialogEditRelationshipFormVisible = true;
    },
    updateRelationshipByEditFromForm() {
      // 编辑对话框[确定]，关闭对话框并post
      this.dialogEditRelationshipFormVisible = false;
      var propertyList = [];
      this.editForm.attr.forEach((element) => {
        var entry = JSON.parse(JSON.stringify(element));
        // console.log(entry);
        propertyList.push(entry);
      });
      // console.log(property);
      console.log(propertyList);
      axios
        .put(this.$backendBaseUrl + "/kgplatform/kginstance/updateedgeprop", {
          graphName: this.$route.query.name,
          edgeLabel: this.editForm.name,
          start: this.editForm.startId,
          end: this.editForm.endId,
          property: propertyList,
          relationship: this.editForm.name,
          // oldName: this.editForm.oldName,
          // oldStart: this.editForm.oldStart,
          // oldEnd: this.editForm.oldEnd,
        })
        .then((res) => {
          if (res.data.code === 200) {
            this.loadRelationshipTotal();
            this.loadRelationshipList();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    handleDelete(index, row) {
      // 表中[删除]，有确认气泡框
      console.log(index, row);
      axios
        .delete(this.$backendBaseUrl + "/kgplatform/kginstance/deleteedge", {
          params: {
            graphName: this.$route.query.name,
            start: row.start.id,
            relationship: row.label.name,
            end: row.end.id,
          },
        })
        .then((res) => {
          if (res.data.code === 200) {
            this.tableInfo.currentPage = 1;
            this.loadRelationshipTotal();
            this.loadRelationshipList();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    handleAdd() {
      // 顶部表单[添加]，打开对话框
      this.addForm.name = "";
      this.addForm.start = "";
      this.addForm.end = "";
      this.dialogAddRelationshipFormVisible = true;
    },
    addRelationshipFromForm() {
      // 表单添加[确定]，关闭对话框并post
      this.dialogAddRelationshipFormVisible = false;
      axios
        .post(this.$backendBaseUrl + "/kgplatform/kginstance/addedge", {
          graphName: this.$route.query.name,
          name: this.addForm.name,
          start: this.addForm.start,
          end: this.addForm.end,
        })
        .then((res) => {
          if (res.data.code === 200) {
            this.loadRelationshipTotal();
            this.loadRelationshipList();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    handleImport() {
      // 顶部表单[导入]，打开对话框
      this.fileList = [];
      this.dialogImportRelationshipFormVisible = true;
    },
    downloadTemplate() {
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kginstance/downloadedgestemplate", {
          responseType: "blob",
        })
        .then((res) => {
          const file = res.data;
          if (file != null) {
            let blob = new Blob([file], { type: res.headers.filetype }); //从头部获取文件类型
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement("a");
            a.download = "edge_templeate";
            a.href = url;
            a.click();
            URL.revokeObjectURL(url);
          }
        })
        .catch((err) => {
          console.log(err);
          this.$message.error("download failed");
        });
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kginstance/downloadtemplatereadme", {
          responseType: "blob",
        })
        .then((res) => {
          const file = res.data;
          if (file != null) {
            let blob = new Blob([file], { type: res.headers.filetype }); //从头部获取文件类型
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement("a");
            a.download = "README";
            a.href = url;
            a.click();
            URL.revokeObjectURL(url);
          }
        })
        .catch((err) => {
          console.log(err);
          this.$message.error("download failed");
        });
    },
    onFileChange(file, fileList) {
      // 添加新文件
      this.fileList = fileList;
      console.log(fileList);
    },
    onFileRemove(file, fileList) {
      this.fileList.splice(fileList.indexOf(file));
    },
    importRelationshipFromFiles() {
      // 导入关系[确定]，关闭对话框并调用submit方法，即http-request=uploadFiles
      console.log(this.fileList);
      if (this.fileList.length == 0) {
        this.$message.warning("please select a file");
      } else {
        this.$refs.upload.submit();
      }
    },
    uploadFiles(param) {
      // 每个文件执行一次
      console.log(param.file);
      const file = param.file; // 获取file文件
      const formData = new FormData(); // FormData对象
      formData.append("graphName", this.$route.query.name);
      formData.append("file", file); // file封装到FormData里
      // 请求后台上传数据的接口
      axios
        .post(this.$backendBaseUrl + "/kgplatform/kginstance/importedges", formData)
        .then(
          (res) => {
            if (res.data.code === 200) {
              this.loadRelationshipTotal();
              this.loadRelationshipList();
              this.dialogImportRelationshipFormVisible = false;
              this.$message.success(res.data.msg);
              // 清空文件列表
              this.fileList = [];
            } else {
              this.$message.error(res.data.msg);
            }
          },
          (err) => {
            console.log("-------err--------");
            console.log(err);
            this.$message.error("upload failed");
          }
        );
    },
    loadRelationshipList() {
      this.loading = true;
      // 需要约2s加载
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kginstance/listgraphedgesbypage", {
          params: {
            graphName: this.$route.query.name,
            page: this.tableInfo.currentPage,
            size: 10,
            label: this.filterForm.label,
          },
        })
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.KGRelationshipList = data.data;
            console.log("relationship loaded");
            console.log(this.KGRelationshipList);
          }
          this.loading = false;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    loadRelationshipLabels() {
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kginstance/listgraphedgelabels", {
          params: {
            graphName: this.$route.query.name,
          },
        })
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.KGRelationshipLabels = data.data;
            console.log(this.KGRelationshipLabels);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    loadRelationshipTotal() {
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kginstance/countgraphedge", {
          params: {
            graphName: this.$route.query.name,
            label: this.filterForm.label,
          },
        })
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.tableInfo.total = data.data;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    loadCandidateStartEntityNode(query) {
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kginstance/listgraphnodesbypage", {
          params: {
            graphName: this.$route.query.name,
            page: 1,
            size: 10,
            label: null,
            name: query,
          },
        })
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            // this.candidateEntityNode = data.data;
            // this.candidateEntityNode = data.data.map((item) => {
            //   return item.name;
            // });
            this.candidateStartEntityNode = data.data;
            console.log("candidate entity loaded");
            // console.log(this.candidateEntityNode);
          }
          this.loadingCandidate = false;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    loadCandidateEndEntityNode(query) {
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kginstance/listgraphnodesbypage", {
          params: {
            graphName: this.$route.query.name,
            page: 1,
            size: 10,
            label: null,
            name: query,
          },
        })
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            // this.candidateEntityNode = data.data;
            // this.candidateEntityNode = data.data.map((item) => {
            //   return item.name;
            // });
            this.candidateEndEntityNode = data.data;
            console.log("candidate entity loaded");
            // console.log(this.candidateEntityNode);
          }
          this.loadingCandidate = false;
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
  mounted() {
    this.loadRelationshipTotal();
    this.tableInfo.currentPage = 1;
    this.loadRelationshipLabels();
    this.loadRelationshipList();
  },
};
</script>
