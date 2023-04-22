<template>
  <div class="app-container">
    <el-card>
      <div slot="header" align="center">
        <h1 style="margin-top: 10px">Datasets Management</h1>
        <div style="margin: 10px 0">
          <el-button
            type="primary"
            size="medium"
            icon="el-icon-plus"
            @click="handleUpload"
            >Add Datasets</el-button
          >
        </div>
      </div>
      <el-dialog
        title="Import Datasets"
        :visible.sync="dialogUploadDatasetsFormVisible"
        @closed="fileList = []"
      >
        <el-form size="mini" label-width="150px" label-position="right">
          <el-form-item label="Upload files" label-position="left">
            <el-upload
              class="upload-demo"
              ref="upload"
              accept=".csv,.json,.txt"
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
            </el-upload>
          </el-form-item>
          <el-form-item label="Dataset Name" prop="title">
            <el-input
              v-model="uploadFileProperties.name"
              placeholder="Give a name to describe the dataset"
            />
          </el-form-item>
          <el-form-item label="DatasetType" prop="source">
            <el-select v-model="uploadFileProperties.type" placeholder="请选择">
              <el-option
                v-for="item in ['structured', 'raw']"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Instance Type" prop="author">
            <el-select v-model="uploadFileProperties.instance" placeholder="请选择">
              <el-option
                v-for="item in ['entity', 'relationship', 'N/A']"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Index Name" prop="publish_time">
            <el-input
              v-model="uploadFileProperties.index"
              placeholder="Mark the attribute that is used as index, e.g. 'name'"
            />
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="dialogUploadDatasetsFormVisible = false">Cancel</el-button>
          <el-button type="primary" @click="importDatasets">Confirm</el-button>
        </div>
      </el-dialog>
      <!-- 数据展示表格 -->
      <el-table :data="datasetList" center style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="Dataset Name" width="300" align="center">
        </el-table-column>
        <el-table-column prop="type" label="Dataset Type" width="150" align="center">
        </el-table-column>
        <el-table-column prop="file" label="File Name" width="150" align="center">
        </el-table-column>
        <el-table-column prop="format" label="File format" width="100" align="center">
        </el-table-column>
        <el-table-column prop="instance" label="Instance Type" width="150" align="center">
        </el-table-column>
        <el-table-column prop="index" label="Index Name" width="150" align="center">
        </el-table-column>
        <el-table-column label="Operation" align="center">
          <template slot-scope="scope">
            <el-row style="margin-bottom: 5px">
              <el-button size="mini" type="primary" @click="handlePreview(scope.row)"
                >预览</el-button
              >
              <el-popconfirm
                title="确定删除吗？"
                style="margin-left: 10px"
                @onConfirm="handleDelete(scope.row)"
              >
                <el-button size="mini" type="danger" slot="reference"
                  >删除</el-button
                ></el-popconfirm
              >
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog
        title="Dataset Preview"
        :visible.sync="datasetPreviewVisible"
        @closed="datasetContent = ''"
      >
        <el-input
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 16 }"
          placeholder="数据集为空"
          v-model="datasetContent"
          readonly
        >
        </el-input>
      </el-dialog>
    </el-card>
    <el-row> </el-row>
  </div>
</template>
<script>
import axios from "axios";

export default {
  // name: 'KnowledgeBuild',
  data() {
    return {
      datasetList: [], // 素材列表
      page: 1, // 页数，int类型
      limit: 7, // 每页的素材数量，int类型
      totalCount: null, // 总数量

      materialName: null, // 素材搜索名称
      loading: true, // 表格加载
      dialogVisible: false, //上传窗口是否显示
      uploadFileProperties: {
        //上传表单
        name: "",
        type: "",
        instance: "",
        index: "",
      },
      datasetPreviewVisible: false,
      datasetContent: "",
      dialogUploadDatasetsFormVisible: false,
      fileList: [],
    };
  },
  created() {},
  mounted() {
    // 初始化获取素材列表
    this.loadDatasetList();
  },
  methods: {
    async loadDatasetList() {
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kgdatasets/getdatasetlist")
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.loading = false;
          }
          this.datasetList = data.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    //删除
    handleDelete(row) {
      console.log(row.identity);
      axios
        .delete(this.$backendBaseUrl + "/kgplatform/kgdatasets/deletedataset", {
          params: { datasetId: row.identity },
        })
        .then((res) => {
          if (res.data.code === 200) {
            this.$message({
              message: "删除成功",
              type: "success",
            });
            this.loadDatasetList().catch((err) => {
              console.log(err);
            });
          } else {
            this.$message.error("删除失败");
          }
        })
        .catch((err) => {
          console.log(err);
          this.$message.err("删除失败");
        });
    },
    //预览
    handlePreview(row) {
      this.datasetPreviewVisible = true;
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kgdatasets/getdatasetcontent", {
          params: { datasetId: row.identity },
        })
        .then((res) => {
          console.log(res);
          if (res.data.code === 200) {
            this.datasetContent = res.data.data.content;
          }
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
          this.$message.err("下载失败");
        });
    },

    handleUpload() {
      // 顶部表单[导入]，打开对话框
      this.fileList = [];
      this.dialogUploadDatasetsFormVisible = true;
    },
    onFileChange(file, fileList) {
      // 添加新文件
      this.fileList = fileList;
      console.log(fileList);
    },
    onFileRemove(file, fileList) {
      this.fileList.splice(fileList.indexOf(file));
    },
    importDatasets() {
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
      const upFile = param.file; // 获取file文件
      const formData = new FormData(); // FormData对象
      formData.append("name", this.uploadFileProperties.name);
      formData.append("type", this.uploadFileProperties.type);
      formData.append("instance", this.uploadFileProperties.instance);
      formData.append("index", this.uploadFileProperties.index);
      formData.append("upFile", upFile); // file封装到FormData里
      // 请求后台上传数据的接口
      axios
        .post(this.$backendBaseUrl + "/kgplatform/kgdatasets/importdatasets", formData)
        .then(
          (res) => {
            if (res.data.code === 200) {
              this.loadDatasetList();
              this.dialogUploadDatasetsFormVisible = false;
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

<style lang="less" scoped>
.search {
  background-color: #fff;
  display: flex;
  padding: 30px 20px;
  font-weight: 600;
  color: #666;

  .name {
    display: flex;
    align-items: center;
    padding: 0 10px 0 20px;
    span {
      width: 50px;
    }
  }

  .searchBtn,
  .backBtn {
    width: 100px;
    margin-left: 20px;
    font-weight: 600;
    font-size: 16px;
  }
}

.pagination {
  margin: 10px 0;
  display: flex;
  justify-content: flex-end;
}

.Button {
  .changeBtn {
    float: right;
    width: 100px;
    margin-left: 20px;
    font-weight: 600;
    font-size: 16px;
  }
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}
</style>
