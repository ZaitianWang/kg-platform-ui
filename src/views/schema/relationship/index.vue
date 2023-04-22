<template>
  <div class="app-container">
    <el-container>
      <el-header style="height: 120px; padding-bottom: 10px">
        <h1 style="margin-top: 10px">
          {{ fieldName }} Domain Relation Label Construction
        </h1>
        <div style="margin: 10px 0">
          <el-tooltip effect="light" content="Back to overview" placement="left">
            <el-button
              type="info"
              icon="el-icon-d-arrow-left"
              size="medium"
              @click="backToHome()"
              >Schema Overview</el-button
            >
          </el-tooltip>
          <el-button type="primary" size="medium" @click="newRelationDialogVisible = true"
            >New Relation Label</el-button
          >
          <el-button type="success" size="medium" @click="next()"
            >Visualization</el-button
          >
          <el-tooltip effect="light" content="Construct entity label" placement="right">
            <el-button type="info" icon="el-icon-arrow-left" size="medium" @click="back()"
              >Entity Construction</el-button
            >
          </el-tooltip>
        </div>
      </el-header>
      <el-main v-loading="loading">
        <div style="margin-top: 10px">
          <el-table :data="relationList" style="width: 100%" empty-text="no data">
            <el-table-column prop="relationID" label="ID" width="100" align="center">
              <template slot-scope="scope">
                <span>{{ scope.$index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="srcLabel"
              label="Source Entity Type"
              width="300"
              align="center"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.srcLabel }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="relationName" label="Relationship" align="center">
              <template slot-scope="scope">
                <el-tag size="medium">{{ scope.row.relationName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="dstLabel"
              label="Target Entity Type"
              width="300"
              align="center"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.dstLabel }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Operations" width="300" align="center">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="handleEdit(scope.$index, scope.row)"
                  >Edit</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="handleDelete(scope.$index, scope.row)"
                  >Delete</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-main>
    </el-container>
    <el-dialog
      title="New Relation Label"
      :visible.sync="newRelationDialogVisible"
      width="35%"
      center
    >
      <el-form
        :rules="rules"
        ref="relationForm"
        :model="relationForm"
        label-width="100px"
      >
        <el-form-item label="source" prop="sLabel">
          <!-- <el-input v-model="relationForm.sLabel"></el-input> -->
          <el-select v-model="relationForm.sLabel" placeholder="please select">
            <el-option
              v-for="item in entityOptions"
              :key="item.entityId"
              :label="item.entityName"
              :value="item.entityName"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="relation" prop="name">
          <el-input v-model="relationForm.name"></el-input>
        </el-form-item>
        <el-form-item label="target" prop="tLabel">
          <!-- <el-input v-model="relationForm.tLabel"></el-input> -->
          <el-select v-model="relationForm.tLabel" placeholder="please select">
            <el-option
              v-for="item in entityOptions"
              :key="item.entityId"
              :label="item.entityName"
              :value="item.entityName"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="attribute list">
          <el-table
            :data="relationForm.properties"
            border
            stripe
            style="width: 100%"
            :header-cell-style="headerClass"
            :row-style="{ height: 0 + 'px' }"
            :cell-style="{ padding: 0 + 'px' }"
          >
            <el-table-column prop="name" label="attribute name" align="center">
              <template slot-scope="scope">
                <el-input
                  v-if="scope.row.edit"
                  v-model="scope.row.name"
                  placeholder="please input"
                  style="height: auto"
                ></el-input>
                <span v-else style="font-size: 13px">{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="data type" align="center">
              <template slot-scope="scope">
                <el-select
                  v-if="scope.row.edit"
                  v-model="scope.row.type"
                  placeholder="select"
                >
                  <el-option
                    v-for="tItem in typeOptions"
                    :key="tItem.typeValue"
                    :label="tItem.typeLabel"
                    :value="tItem.typeValue"
                  >
                  </el-option>
                </el-select>
                <span v-else style="font-size: 13px">
                  <p v-if="scope.row.type === 'string'">TEXT</p>
                  <p v-if="scope.row.type === 'date'">DATE</p>
                  <p v-if="scope.row.type === 'int32'">INTEGER</p>
                  <p v-if="scope.row.type === 'double'">DOUBLE</p>
                </span>
              </template>
            </el-table-column>
            <el-table-column label="Operations" align="center">
              <template slot-scope="scope">
                <el-button
                  v-if="scope.row.edit"
                  type="text"
                  size="medium"
                  @click="confirmAdd(scope.row, scope.$index)"
                >
                  <i class="el-icon-check" aria-hidden="true"></i>
                </el-button>
                <div v-else>
                  <el-button type="text" size="medium" @click="editData(scope.row)">
                    <i class="el-icon-edit" aria-hidden="true"></i>
                  </el-button>
                  <el-button
                    type="text"
                    size="medium"
                    @click="deleteData(scope.row, scope.$index)"
                  >
                    <i class="el-icon-delete" aria-hidden="true"></i>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="text" @click="addData">Click to add more</el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="newRelationDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="newRelationSubmit('relationForm')"
          >Confirm</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
      title="Edit Relation Label"
      :visible.sync="editRelationDialogVisible"
      width="35%"
      center
    >
      <el-form :model="relationEditForm" label-width="100px">
        <el-form-item label="source">
          <el-select v-model="relationEditForm.sLabel" placeholder="select">
            <el-option
              v-for="item in entityOptions"
              :key="item.entityId"
              :label="item.entityName"
              :value="item.entityName"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="relation">
          <el-input v-model="relationEditForm.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="target">
          <el-select v-model="relationEditForm.tLabel" placeholder="select">
            <el-option
              v-for="item in entityOptions"
              :key="item.entityId"
              :label="item.entityName"
              :value="item.entityName"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="attribute list">
          <el-table
            :data="relationEditForm.properties"
            border
            stripe
            style="width: 100%"
            :header-cell-style="headerClass"
          >
            <el-table-column prop="name" label="attribute name" align="center">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.name"
                  placeholder="请输入"
                  style="height: auto"
                  size="small"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="data type" align="center">
              <template slot-scope="scope">
                <el-select v-model="scope.row.type" placeholder="select" size="small">
                  <el-option
                    v-for="tItem in typeOptions"
                    :key="tItem.typeValue"
                    :label="tItem.typeLabel"
                    :value="tItem.typeValue"
                  >
                  </el-option>
                </el-select>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="text" @click="addMorePropWhenEdit"
            >Click to add more</el-button
          >
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRelationDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="editRelationshipLabel()">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import axios from "axios";
import qs from "qs";

export default {
  data() {
    return {
      loading: false,
      fieldId: "",
      fieldName: "",
      newRelationDialogVisible: false,
      editRelationDialogVisible: false,
      entityOptions: [
        {
          entityId: "",
          entityName: "",
        },
      ],
      relationList: [
        {
          relationID: null,
          startEntityName: null,
          relationName: null,
          endEntityName: null,
          relationProperties: [],
          srcLabel: null,
          dstLabel: null,
        },
      ],
      currentProperties: [
        {
          name: "",
          type: "",
        },
      ],
      // 新建关系的表单
      relationForm: {
        name: "", // 关系名称,唯一
        sLabel: "",
        tLabel: "",
        FieldID: "",
        properties: [
          {
            name: "",
            type: "",
            edit: false,
          },
        ],
      },
      relationEditForm: {
        name: "", // 关系名称,唯一
        sLabel: "",
        tLabel: "",
        properties: [
          {
            name: "",
            type: "",
          },
        ],
      },
      rules: {
        sLabel: [
          { required: false, message: "please select the source", trigger: "blur" },
        ],
        name: [{ required: true, message: "please enter the relation", trigger: "blur" }],
        tLabel: [
          { required: false, message: "please select the target", trigger: "blur" },
        ],
      },
      typeOptions: [
        {
          typeLabel: "STRING",
          typeValue: "string",
        },
        {
          typeLabel: "DATE",
          typeValue: "date",
        },
        {
          typeLabel: "INTEGER",
          typeValue: "int32",
        },
        {
          typeLabel: "DOUBLE",
          typeValue: "double",
        },
      ],
      typeMappingC2E: {
        STRING: "STRING",
        DATE: "DATE",
        INT32: "INT32",
        DOUBLE: "DOUBLE",
      },
    };
  },
  created() {
    // this.fieldId = this.$route.query.schemaId
    // this.fieldName = this.$route.params.schemaName;
    this.fieldName = this.$route.query.schemaName;
    console.log(this.fieldName);
    this.getAllNodeLabels();
    // this.getAllEntities()
    this.getAllRelations();
  },
  methods: {
    getAllNodeLabels() {
      // 获取所有节点标签
      var param = { graphName: this.fieldName };
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kgschema/listnodelabelname", {
          params: param,
        })
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            var nodeLabels = data.data[0];
            console.log(nodeLabels);
            this.entityOptions = [];
            for (var i = 0; i < nodeLabels.length; i++) {
              var temEntityObj = {
                entityId: i,
                entityName: nodeLabels[i],
              };
              console.log(temEntityObj.entityName);
              this.entityOptions.push(temEntityObj);
            }
          }
        });
    },
    getAllRelations() {
      this.loading = true;
      // 获取所有关系标签
      var param = { graphName: this.fieldName };
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kgschema/listedgelabel", {
          params: param,
        })
        .then((res) => {
          let data = res.data.data;
          console.log("获取关系标签数据", data);
          var relationTable = [];
          // console.log("length", data.length)
          for (var i = 0; i < data.length; i++) {
            var temRelation = {
              relationID: i,
              relationName: data[i].name,
              startEntityName: data[i].startLabel,
              endEntityName: data[i].endLabel,
              relationProperties: data[i].properties,
              srcLabel: data[i].srcLabel,
              dstLabel: data[i].dstLabel,
            };
            relationTable.push(temRelation);
          }
          this.relationList = relationTable;
          // console.log(this.relationList)
          this.loading = false;
        });
    },
    // 以下为新建实体关系的属性列表操作
    // 添加一行空白属性
    addData() {
      this.relationForm.properties.push({
        name: "",
        type: "",
        edit: true,
      });
    },
    // 每一行的√确认添加
    confirmAdd(row, index) {
      var newproperties = { name: row.name, type: row.type, edit: false };
      console.log(newproperties);
      this.relationForm.properties.splice(index, 1, newproperties);
      console.log(this.relationForm.properties);
      row.edit = false;
    },
    // 每一行的编辑按钮
    editData(row) {
      row.edit = true;
    },
    // 每一行的删除按钮
    deleteData(row, index) {
      this.relationForm.properties.splice(index, 1);
    },
    // 提交创建新的实体关系
    newRelationSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          var filterProperties = [];
          console.log(this.relationForm.properties);
          for (var i = 0; i < this.relationForm.properties.length; i++) {
            if (
              this.relationForm.properties[i].name !== "" &&
              this.relationForm.properties[i].type !== ""
            ) {
              var temProperty = {
                name: this.relationForm.properties[i].name,
                type: this.relationForm.properties[i].type,
                optional: true,
              };
              filterProperties.push(temProperty);
            }
          }
          // console.log('关系', this.relationForm.name)
          // console.log('头实体', this.relationForm.sLabel)
          // console.log('尾实体', this.relationForm.tLabel)
          // console.log(filterProperties)
          axios
            .post(
              this.$backendBaseUrl + "/kgplatform/kgschema/addedgelabel",
              qs.stringify({
                graphName: this.fieldName,
                edgeLabel: this.relationForm.name,
                startNode: this.relationForm.sLabel,
                endNode: this.relationForm.tLabel,
                properties: JSON.stringify(filterProperties),
              })
            )
            .then((res) => {
              let data = res.data;
              console.log(data);
              if (data.code === 200) {
                // 新建关系成功
                this.$message({
                  type: "success",
                  message: "create relation success!",
                });
                this.getAllRelations();
                this.newRelationDialogVisible = false;
                this.relationForm = {
                  name: "", // 关系名称,唯一
                  sLabel: "",
                  tLabel: "",
                  FieldID: "",
                  properties: [
                    {
                      name: "",
                      type: "",
                      edit: false,
                    },
                  ],
                };
              } else {
                // 获取失败
                this.$message.error("create relation failed!");
                this.newRelationDialogVisible = false;
              }
            });
        }
      });
    },
    back() {
      // 后退一步
      this.$router.push({
        name: "SchemaEntity",
        // params: { schemaName: this.fieldName },
        query: {
          //   schemaId: this.fieldId,
          schemaName: this.fieldName,
          //   status: 'buildAll'
        },
      });
    },
    backToHome() {
      this.$router.push({
        path: "/schema/overview/",
        query: {},
      });
    },
    next() {
      // 下一步可视化
      this.$router.push({
        path: "/schema/visualization",
        query: {
          schemaName: this.fieldName,
          from: "relationship",
        },
      });
    },
    addMorePropWhenEdit() {
      this.relationEditForm.properties.push({
        name: "",
        type: "",
      });
    },
    editRelationshipLabel() {
      axios
        .put(this.$backendBaseUrl + "/kgplatform/kgschema/updateedgelabel", {
          graphName: this.fieldName,
          edgeLabel: this.relationEditForm.name,
          property: this.relationEditForm.properties.map((item) => {
            return {
              name: item.name,
              type: this.typeMappingC2E[item.type],
            };
          }),
          src: this.relationEditForm.sLabel,
          dst: this.relationEditForm.tLabel,
        })
        .then((res) => {
          let data = res.data;
          console.log(data);
          if (data.code === 200) {
            // 新建关系成功
            this.$message({
              type: "success",
              message: "modify relation success!",
            });
            this.getAllRelations();
            this.editRelationDialogVisible = false;
            this.relationEditForm = {
              name: "", // 关系名称,唯一
              sLabel: "",
              tLabel: "",
              properties: [
                {
                  name: "",
                  type: "",
                },
              ],
            };
          } else {
            // 获取失败
            this.$message.error("modify relation failed!");
            this.editRelationDialogVisible = false;
          }
        });
    },
    handleEdit(index, row) {
      console.log(row);
      this.relationEditForm.name = row.relationName;
      this.relationEditForm.sLabel = row.srcLabel;
      this.relationEditForm.tLabel = row.dstLabel;
      this.relationEditForm.properties = row.relationProperties;
      this.editRelationDialogVisible = true;
    },
    handleView(index, row) {
      console.log(row);
      this.currentProperties = row.relationProperties;
    },
    handleDelete(index, row) {
      console.log(row);
      this.$confirm("Sure to delete relation label?", "Warning", {
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        type: "warning",
      })
        .then(() => {
          axios
            .post(
              this.$backendBaseUrl + "/kgplatform/kgschema/deleteedgelabel",
              qs.stringify({
                graphName: this.$route.query.schemaName,
                edgeName: row.relationName,
              })
            )
            .then((res) => {
              let data = res.data;
              console.log(data);
              if (data.code === 200) {
                this.$message({
                  message: "delete relation label success!",
                  type: "success",
                });
                this.getAllRelations();
              } else {
                this.$message.warning("delete relation label failed!");
              }
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "delete canceled",
          });
        });
    },
    headerClass() {
      // 设置弹窗表头的函数
      return "padding:0;";
    },
  },
};
</script>
<style>
.kgSchema {
  width: 100%;
}
.el-header {
  background-color: white;
  text-align: center;
}
.el-main {
  background-color: #e9eef3;
  padding: 10px 20px 20px 20px;
}
.el-input__inner {
  height: 30px;
  font-size: 13px;
}
.ivu-select-placeholder {
  font-size: 13px;
}
</style>
