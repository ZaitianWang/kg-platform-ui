<template>
  <div class="app-container">
    <div style="padding-bottom: 1em">
      <el-row :gutter="20">
        <el-col :span="18">
          <!-- 筛选区 -->
          <el-form :inline="true" :model="filterForm" class="demo-form-inline">
            <el-form-item label="filter by type">
              <el-select v-model="filterForm.label" placeholder="entity Type" clearable>
                <el-option
                  v-for="label in KGEntityLabels"
                  :key="label"
                  :label="label"
                  :value="label"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="filter by name">
              <el-input
                v-model="filterForm.name"
                placeholder="entity name"
                clearable
              ></el-input>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="6" style="text-align: left">
          <!-- 操作区 -->
          <el-button type="success" icon="el-icon-plus" @click="handleAdd">Add</el-button>
          <el-button type="success" icon="el-icon-upload" @click="handelImport"
            >Import</el-button
          >
          <el-dialog title="Add New Entity" :visible.sync="dialogAddEntityFormVisible">
            <el-form :model="addForm" label-width="100px">
              <el-form-item label="entity name">
                <el-input
                  v-model="addForm.name"
                  autocomplete="off"
                  style="width: 80%"
                ></el-input>
              </el-form-item>
              <el-form-item label="entity type">
                <el-select v-model="addForm.label" placeholder="Select entity type">
                  <el-option
                    v-for="label in KGEntityLabels"
                    :key="label"
                    :label="label"
                    :value="label"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button @click="dialogAddEntityFormVisible = false">Cancel</el-button>
              <el-button type="primary" @click="addEntityFromForm">Confirm</el-button>
            </div>
          </el-dialog>
          <el-dialog
            title="Import Entities from File"
            :visible.sync="dialogImportEntityFormVisible"
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
                    Drag the file here, or<em> click to upload</em>
                  </div>
                  <div class="el-upload__tip" slot="tip">accept file type.csv</div>
                </el-upload>
              </el-form-item>
              <el-form-item label="select dataset">
                <el-button type="primary">browse repo</el-button>
              </el-form-item>
            </el-form>
            <div slot="footer">
              <el-button @click="dialogImportEntityFormVisible = false">Cancel</el-button>
              <el-button type="primary" @click="importEntityFromFiles">Confirm</el-button>
            </div>
          </el-dialog>
        </el-col>
      </el-row>
    </div>
    <div>
      <!-- 展示区 -->
      <el-table :data="KGEntityList" style="width: 100%" v-loading="loading">
        <el-table-column label="ID" width="100" align="center">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.identity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Entity Name" align="center">
          <template slot-scope="scope">
            <div slot="reference" class="name-wrapper">
              {{ scope.row.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Entity Type" width="200" align="center">
          <template slot-scope="scope">
            <div slot="reference" class="name-wrapper">
              {{ scope.row.label }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Entity Attributes" width="200" align="center">
          <template slot-scope="scope">
            <div slot="reference" class="name-wrapper">
              <el-popover placement="bottom" width="400" trigger="hover">
                <template>
                  <el-table :data="scope.row.attributes">
                    <el-table-column
                      property="key"
                      label="Attribute Name"
                    ></el-table-column>
                    <el-table-column
                      property="value"
                      label="Attribute Value"
                    ></el-table-column>
                  </el-table>
                </template>
                <el-button slot="reference" size="mini">View</el-button>
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Operations" width="300" align="center">
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
              title="Sure to delete the entity? All of its relations will be deleted too."
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
      <el-dialog :visible.sync="dialogEditEntityFormVisible">
        <div slot="title">
          Edit Entity
          <el-tooltip
            content="You can change the name and attributes of the Entity. If you want to change the type, delete the Entity and add a new one."
            placement="bottom-start"
          >
            <i class="el-icon-question"></i>
          </el-tooltip>
        </div>
        <el-form :model="editForm">
          <el-form-item label="entity name">
            <el-input v-model="editForm.name" autocomplete="off"></el-input>
          </el-form-item>
          <!-- <el-form-item label="实体描述">
            <el-input v-model="editForm.desc" autocomplete="off"></el-input>
          </el-form-item> -->
          <el-form-item label="attribute lisr">
            <el-table :data="editForm.attr">
              <el-table-column label="attribute name">
                <template slot-scope="scope">
                  <span>{{ scope.row.key }}</span>
                </template>
              </el-table-column>
              <el-table-column label="attribute value">
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.value"
                    placeholder="please input"
                  ></el-input>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogEditEntityFormVisible = false">Cancel</el-button>
          <el-button type="primary" @click="updateEntityByEditFromForm"
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
      return this.filterByLabel(
        this.filterByName(this.KGEntityList, this.filterForm.name),
        this.filterForm.label
      ).length;
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
      return this.filterByLabel(
        this.filterByName(this.KGEntityList, this.filterForm.name),
        this.filterForm.label
      ).slice((this.tableInfo.currentPage - 1) * 10, this.tableInfo.currentPage * 10);
    },
  },
  data() {
    return {
      KGEntityList: [],
      KGEntityLabels: [],
      dialogAddEntityFormVisible: false,
      dialogEditEntityFormVisible: false,
      dialogImportEntityFormVisible: false,
      addForm: {
        // 表单添加实体
        name: "",
        label: "",
        // desc: "",
      },
      fileList: [],
      filterForm: {
        // 筛选
        label: "",
        name: "",
      },
      editForm: {
        // 表单编辑实体
        id: "",
        name: "",
        label: "",
        attr: [],
      },
      tableInfo: {
        currentPage: 1,
        total: 0,
      },
      loading: true,
    };
  },
  watch: {
    "filterForm.label"() {
      this.tableInfo.currentPage = 1;
      this.loadEntityTotal();
      this.loadEntityList();
    },
    "filterForm.name"() {
      this.tableInfo.currentPage = 1;
      this.loadEntityTotal();
      this.loadEntityList();
    },
  },
  methods: {
    // 筛选
    /**
     * @param data 被筛选的tableData数组
     * @param cond 筛选条件字符串
     * @deprecated
     */
    filterByName(data, cond) {
      if (cond == "") {
        return data;
      }
      return data.filter((item) => {
        if (item.name == cond) {
          return item;
        }
      });
    },
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
        if (conds.includes(item.label)) {
          return item;
        }
      });
    },
    handelPageChange(newPage) {
      // this.loading = true;
      this.tableInfo.currentPage = newPage;
      console.log(this.tableInfo.currentPage);
      this.loadEntityList();
      // this.loading = false;
    },
    handleUpdateByEdit(index, row) {
      // 表中[编辑]，打开对话框
      // console.log(index, row);
      this.editForm.id = row.identity;
      this.editForm.name = row.name;
      this.editForm.label = row.label;
      this.editForm.attr = [];
      row.attributes.forEach((element) => {
        this.editForm.attr.push(JSON.parse(JSON.stringify(element)));
      });
      // 因为数组和对象都是传引用，不能直接attr=attr
      // 否则会导致编辑attr时，即便不点确定，也同时修改
      console.log(this.editForm);
      this.dialogEditEntityFormVisible = true;
    },
    updateEntityByEditFromForm() {
      // 编辑对话框[确定]，关闭对话框并post
      this.dialogEditEntityFormVisible = false;
      var propertyList = [];
      this.editForm.attr.forEach((element) => {
        var entry = JSON.parse(JSON.stringify(element));
        // console.log(entry);
        propertyList.push(entry);
      });
      // console.log(property);
      propertyList.push({
        key: "name",
        value: this.editForm.name,
      });
      console.log(propertyList);
      axios
        .put(this.$backendBaseUrl + "/kgplatform/kginstance/updatenode", {
          graphName: this.$route.query.name,
          nodeId: this.editForm.id,
          nodeLabel: this.editForm.label,
          property: propertyList,
        })
        .then((res) => {
          if (res.data.code === 200) {
            this.loadEntityTotal();
            this.loadEntityList();
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
        .delete(this.$backendBaseUrl + "/kgplatform/kginstance/deletenode", {
          params: {
            graphName: this.$route.query.name,
            nodeId: row.identity,
          },
        })
        .then((res) => {
          if (res.data.code === 200) {
            this.tableInfo.currentPage = Math.min(
              (this.tableInfo.total - 1) / 10,
              this.tableInfo.currentPage
            );
            this.loadEntityTotal();
            this.loadEntityList();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    handleAdd() {
      // 顶部表单[添加]，打开对话框
      this.addForm.name = "";
      this.addForm.label = "";
      // this.addForm.desc = "";
      this.dialogAddEntityFormVisible = true;
    },
    addEntityFromForm() {
      // 表单添加[确定]，关闭对话框并post
      this.dialogAddEntityFormVisible = false;
      axios
        .post(this.$backendBaseUrl + "/kgplatform/kginstance/addnode", {
          graphName: this.$route.query.name,
          name: this.addForm.name,
          label: this.addForm.label,
          // description: this.addForm.desc,
        })
        .then((res) => {
          if (res.data.code === 200) {
            this.loadEntityTotal();
            this.loadEntityList();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    handelImport() {
      // 顶部表单[导入]，打开对话框
      this.fileList = [];
      this.dialogImportEntityFormVisible = true;
    },
    downloadTemplate() {
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kginstance/downloadnodestemplate", {
          responseType: "blob",
        })
        .then((res) => {
          const file = res.data;
          if (file != null) {
            let blob = new Blob([file], { type: res.headers.filetype }); //从头部获取文件类型
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement("a");
            a.download = "node_template";
            a.href = url;
            a.click();
            URL.revokeObjectURL(url);
          }
        })
        .catch((err) => {
          console.log(err);
          this.$message.error("Download failed");
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
          this.$message.error("Download failed");
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
    importEntityFromFiles() {
      // 导入实体[确定]，关闭对话框并调用submit方法，即http-request=uploadFiles
      console.log(this.fileList);
      if (this.fileList.length == 0) {
        this.$message.warning("Please select a file");
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
        .post(this.$backendBaseUrl + "/kgplatform/kginstance/importnodes", formData)
        .then(
          (res) => {
            if (res.data.code === 200) {
              this.loadEntityTotal();
              this.loadEntityList();
              this.dialogImportEntityFormVisible = false;
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
            this.$message.error("Upload failed");
          }
        );
    },
    loadEntityList() {
      this.loading = true;
      // 需要约0.2s加载
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kginstance/listgraphnodesbypage", {
          params: {
            graphName: this.$route.query.name,
            page: this.tableInfo.currentPage,
            size: 10,
            label: this.filterForm.label,
            name: this.filterForm.name,
          },
        })
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.KGEntityList = data.data;
            console.log("entity loaded");
            console.log(this.KGEntityList);
          }
          this.loading = false;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    loadEntityLabels() {
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kginstance/listgraphnodelabels", {
          params: {
            graphName: this.$route.query.name,
          },
        })
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.KGEntityLabels = data.data;
            console.log(this.KGEntityLabels);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    loadEntityTotal() {
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kginstance/countgraphvertex", {
          params: {
            graphName: this.$route.query.name,
            label: this.filterForm.label,
            name: this.filterForm.name,
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
  },
  mounted() {
    this.loadEntityTotal();
    this.tableInfo.currentPage = 1;
    this.loadEntityLabels();
    this.loadEntityList();
  },
};
</script>
