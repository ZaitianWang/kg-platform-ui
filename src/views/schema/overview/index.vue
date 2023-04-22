<template>
  <div class="app-container">
    <el-card>
      <div slot="header" align="center">
        <h1>Schema Overview</h1>
        <div style="margin: 10px 0">
          <el-button
            type="success"
            size="medium"
            icon="el-icon-plus"
            @click="newSchemaDialogVisible = true"
            >Create New KG Schema</el-button
          >
          <el-button
            type="success"
            size="medium"
            icon="el-icon-upload"
            @click="importSchemaDialogVisible = true"
            >Import Schema from File</el-button
          >
        </div>
      </div>
      <template>
        <el-table
          :data="tableData"
          :default-sort="{ prop: 'name' }"
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column prop="name" label="Schema Name" align="center" width="300">
            <template slot-scope="scope">
              <div slot="reference" class="name-wrapper">
                {{ scope.row.name }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Label Count" align="center" width="110">
            <template slot-scope="scope">
              <div slot="reference" class="labelNum-wrapper">
                {{ scope.row.labelNum }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Entity Label" align="center" width="100">
            <template slot-scope="scope">
              <div slot="reference" class="entityNum-wrapper">
                {{ scope.row.entityNum }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Relation Label" align="center" width="120">
            <template slot-scope="scope">
              <div slot="reference" class="relationNum-wrapper">
                {{ scope.row.relationNum }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Schema description" align="center">
            <template slot-scope="scope">
              <div slot="reference" class="description-wrapper">
                {{ scope.row.description }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Operations" align="center" width="300">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="handleBuild(scope.$index, scope.row)"
                >Construct
              </el-button>
              <el-popconfirm
                title="Sure to delete?"
                style="margin-left: 10px"
                @onConfirm="handleDelete(scope.row)"
              >
                <el-button
                  slot="reference"
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  >Delete
                </el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
    <el-dialog
      title="New Schema"
      :visible.sync="newSchemaDialogVisible"
      width="35%"
      center
    >
      <el-form
        :rules="rules"
        ref="newSchemaInfo"
        label-position="right"
        label-width="100px"
        :model="newSchemaInfo"
      >
        <el-form-item label="name" prop="newSchemaName">
          <el-input
            v-model="newSchemaInfo.newSchemaName"
            placeholder="please input schema name"
          ></el-input>
        </el-form-item>
        <el-form-item label="description" prop="newSchemaDescribe">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="please input schema description"
            v-model="newSchemaInfo.newSchemaDescribe"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="newSchemaDialogVisible = false">Cancel</el-button>
        <el-button size="small" type="primary" @click="newSchema()">Confirm</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="Import Schema from File"
      :visible.sync="importSchemaDialogVisible"
      @closed="fileList = []"
    >
      <el-form size="mini" label-width="150px" label-position="right">
        <el-form-item label="download template">
          <el-button type="primary" @click="downloadTemplate">template.json</el-button>
        </el-form-item>
        <el-form-item label="upload file">
          <el-upload
            class="upload-demo"
            ref="upload"
            accept=".json"
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
            <div class="el-upload__tip" slot="tip">accept file type: .json</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="importSchemaDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="importSchemaFromFile">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";
import qs from "qs";

export default {
  data() {
    return {
      loading: true,
      newSchemaDialogVisible: false,
      newSchemaInfo: {
        newSchemaName: "",
        newSchemaDescribe: "",
      },
      rules: {
        newSchemaName: [{ required: true, message: "请输入名称", trigger: "blur" }],
        newSchemaDescribe: [{ required: true, message: "请输入描述", trigger: "blur" }],
      },
      tableData: [],
      importSchemaDialogVisible: false,
      fileList: [],
    };
  },
  mounted() {
    // 初始化获取素材列表
    this.getkglist();
  },
  methods: {
    handleDelete(row) {
      var param = { name: row.name };
      axios
        .delete(this.$backendBaseUrl + "/kgplatform/kgschema/deletesubgraph", {
          params: param,
        })
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.getkglist();
            this.$message.success("删除" + row.name + "成功");
          } else {
            this.$message.warning("删除" + row.name + "失败，请联系管理员");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    handleBuild(index, row) {
      console.log(index, row);
      this.$router.push({
        name: "SchemaEntity",
        query: {
          schemaName: row.name,
        },
      });
    },
    getkglist() {
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kgschema/listsubgraph")
        .then((res) => {
          let data = res.data;
          console.log(data);
          if (data.code === 200) {
            this.loading = false;
          }
          this.tableData = data.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    newSchema() {
      axios
        .post(
          this.$backendBaseUrl + "/kgplatform/kgschema/addsubgraph",
          qs.stringify({
            name: this.newSchemaInfo.newSchemaName,
            description: this.newSchemaInfo.newSchemaDescribe,
          })
        )
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.getkglist();
            this.$message.success("添加成功");
            this.newSchemaDialogVisible = false;
          } else {
            this.$message.warning(
              "添加" +
                this.newSchemaInfo.newSchemaName +
                "失败，请检查是否已存在或联系管理员"
            );
          }
        })
        .catch((err) => {
          console.log(err);
          this.$message.warning(
            "添加" +
              this.newSchemaInfo.newSchemaName +
              "失败，请检查是否已存在或联系管理员"
          );
        });
    },
    downloadTemplate() {
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kgschema/download-schema-template", {
          responseType: "blob",
        })
        .then((res) => {
          const file = res.data;
          if (file != null) {
            let blob = new Blob([file], { type: res.headers.filetype }); //从头部获取文件类型
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement("a");
            a.download = "schema_template";
            a.href = url;
            a.click();
            URL.revokeObjectURL(url);
          }
        })
        .catch((err) => {
          console.log(err);
          this.$message.error("下载失败");
        });
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kgschema/download-template-readme", {
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
          this.$message.error("下载失败");
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
    importSchemaFromFile() {
      // 导入关系[确定]，关闭对话框并调用submit方法，即http-request=uploadFiles
      console.log(this.fileList);
      if (this.fileList.length == 0) {
        this.$message.warning("上传文件不能为空");
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
        .post(this.$backendBaseUrl + "/kgplatform/kgschema/import-schema", formData)
        .then(
          (res) => {
            if (res.data.code === 200) {
              this.getkglist();
              this.importSchemaDialogVisible = false;
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
            this.$message.error("上传文件出错");
          }
        );
    },
  },
};
</script>
