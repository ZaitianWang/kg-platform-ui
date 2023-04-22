<template>
  <div class="app-container">
    <el-container>
      <el-header style="height: 120px; padding-bottom: 10px">
        <h1 style="margin-top: 10px">{{ fieldName }} Domain Entity Label Construction</h1>
        <div style="margin: 10px 0">
          <el-tooltip effect="light" content="Back to overview" placement="left">
            <el-button type="info" icon="el-icon-arrow-left" size="medium" @click="back()"
              >Schema Overvire</el-button
            >
          </el-tooltip>
          <el-button type="primary" size="medium" @click="addDialogVisible = true"
            >New Entity Label</el-button
          >
          <el-button type="success" size="medium" @click="schemaView()"
            >Visualization</el-button
          >
          <el-tooltip effect="light" content="Construct relation label" placement="right">
            <el-button
              type="info"
              icon="el-icon-arrow-right"
              size="medium"
              @click="next()"
              >Relation Construction</el-button
            >
          </el-tooltip>
        </div>
      </el-header>
      <el-main v-loading="loading">
        <div class="kgSchemaTree">
          <h3 align="center">Entity Label List</h3>
          <el-input
            placeholder="input search text"
            v-model="filterText"
            style="width: 100%"
          >
          </el-input>
          <el-tree
            class="filter-tree"
            :data="data"
            :props="defaultProps"
            node-key="id"
            default-expand-all
            :filter-node-method="filterNode"
            ref="tree"
            :expand-on-click-node="false"
            :highlight-current="true"
            @node-click="handleNodeClick"
          >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span>{{ node.label }}</span>
              <span>
                <el-button
                  icon="el-icon-close"
                  type="text"
                  @click="() => remove(node, data)"
                >
                </el-button>
              </span>
            </span>
          </el-tree>
        </div>
        <div class="kgSchemaTable">
          <div class="nodeInfo">
            <h3>Entity Label Management</h3>
            <!-- <div style="margin: auto; text-align: center"> -->
            <el-form :inline="true" :model="nodeInfo">
              <el-form-item label="entity label ID">
                <el-input v-model="nodeInfo.nodeId" :disabled="true"></el-input>
              </el-form-item>
              <el-form-item label="entity label name">
                <el-input v-model="nodeInfo.nodeName"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button @click="saveNode()" type="primary">Modify Name</el-button>
              </el-form-item>
            </el-form>
            <!-- </div> -->
          </div>
          <div class="entityManage">
            <h3 style="padding-top: 15px">Label Attrubute Management</h3>
            <el-tooltip effect="dark" content="Add an attribute" placement="right">
              <el-button
                :disabled="clickIsNotEntity"
                type="primary"
                icon="el-icon-plus"
                size="mini"
                plain
                style="margin: 10px 10px 10px 10px"
                @click="addPropertyVisible = true"
                >Add an Attribute</el-button
              >
            </el-tooltip>
            <el-table
              v-if="isShowTable"
              :data="nodeProperties"
              empty-text="No Data"
              stripe
              style="width: 80%; margin: 0px auto; padding: 10px auto"
            >
              <el-table-column label="ID" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.$index + 1 }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Attribute Name" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Data Type" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row.type }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Operations" width="250px" align="center">
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
            <h3 style="padding-bottom: 25px"></h3>
          </div>
        </div>
      </el-main>
    </el-container>
    <el-dialog
      title="Add New Entity Label"
      :visible.sync="addDialogVisible"
      width="30%"
      center
    >
      <el-form
        :rules="rules"
        ref="nodeForm"
        :model="nodeForm"
        label-width="150px"
        label-position="right"
      >
        <el-form-item label="label name" prop="nodeName">
          <el-input v-model="nodeForm.nodeName" placeholder="please input"></el-input>
        </el-form-item>
        <el-form-item label="label description" prop="nodeDescribe">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="please input"
            v-model="nodeForm.nodeDescribe"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addFirstNode('nodeForm')">Confirm</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="Add new attribute"
      :visible.sync="addPropertyVisible"
      width="30%"
      center
    >
      <el-form
        :rules="rules"
        ref="newProperty"
        :model="newProperty"
        label-width="150px"
        label-position="right"
      >
        <el-form-item label="attribute name" prop="name">
          <el-input v-model="newProperty.name" placeholder="please input"></el-input>
        </el-form-item>
        <el-form-item label="data type" prop="type">
          <!-- <el-select v-model="newProperty.type" placeholder="请选择数据类型" style="width: 20px">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select> -->
          <el-radio-group v-model="newProperty.type">
            <el-radio label="string" style="margin: 10px">string</el-radio>
            <el-radio label="date" style="margin: 10px">date</el-radio>
            <!-- <el-radio label="Boolean" style="margin: 10px">布尔型</el-radio> -->
            <el-radio label="int32" style="margin: 10px">integer</el-radio>
            <!-- <el-radio label="Long" style="margin: 10px">长整型</el-radio> -->
            <el-radio label="double" style="margin: 10px">double</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addPropertyVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addProperty('newProperty')">Confirm</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="Edit Attribute"
      :visible.sync="editPropertyVisible"
      width="30%"
      center
    >
      <el-form
        :rules="rules"
        ref="editProperty"
        :model="editProperty"
        label-width="150px"
        label-position="right"
      >
        <el-form-item label="attribute name" prop="name">
          <el-input v-model="editProperty.name"></el-input>
        </el-form-item>
        <el-form-item label="data type" prop="type">
          <el-radio-group v-model="editProperty.type">
            <el-radio label="string" style="margin: 10px">string</el-radio>
            <el-radio label="date" style="margin: 10px">date</el-radio>
            <!-- <el-radio label="Boolean" style="margin: 10px">布尔型</el-radio> -->
            <el-radio label="int32" style="margin: 10px">integer</el-radio>
            <!-- <el-radio label="Long" style="margin: 10px">长整型</el-radio> -->
            <el-radio label="double" style="margin: 10px">double</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editPropertyVisible = false">Cancel</el-button>
        <el-button type="primary" @click="editCurrentProperty('editProperty')"
          >Confirm</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import axios from "axios";
import qs from "qs";

let id = 1; // 为新标签添加id
export default {
  data() {
    return {
      fieldId: "",
      fieldName: "",
      // 以下为左侧层次树用到的数据变量
      filterText: "", // 用于查询关键字
      data: [], // 知识模型树
      addDialogVisible: false,
      nodeForm: {
        // 添加一级标签时模态框的表单
        nodeName: "",
        nodeDescribe: "",
      },
      nodeInfo: {
        // 右侧标签编辑区绑定的变量
        nodeId: null,
        nodeName: "",
        nodeDescribe: "",
      },
      defaultProps: {
        children: "children",
        label: "label",
      },
      isNodeReadOnly: true, // 右侧标签编辑区，控制标签名称和描述是否只读
      switchValue: false, // 编辑状态的选择器
      rules: {
        nodeName: [{ required: true, message: "请输入标签名称", trigger: "blur" }],
        name: [
          // 新增属性名的校验
          { required: true, message: "请输入属性名", trigger: "blur" },
        ],
        type: [
          // 新增属性类型的校验
          { required: true, message: "请选择属性类型", trigger: "blur" },
        ],
      },
      editTreeNode: {}, // 待编辑的标签节点
      currentClickParentId: null,
      currentClickType: "", // 当前选中的节点，两种类型：“标签” 或者 “实体”
      clickIsNotEntity: true, // 控制添加实体属性的按钮是否禁用
      isShowTable: false,
      nodeProperties: [
        {
          name: "name",
          type: "string",
        }, // 被点击节点（实体）的属性
      ],
      addPropertyVisible: false, // 为实体添加属性的弹窗
      newProperty: {
        // 添加新属性
        name: "",
        type: "string",
      },
      typeOptions: [
        {
          label: "string",
          value: "string",
        },
        {
          label: "int32",
          value: "int32",
        },
        {
          label: "date",
          value: "date",
        },
        {
          label: "bool",
          value: "bool",
        },
        {
          label: "double",
          value: "double",
        },
        {
          label: "long",
          value: "long",
        },
      ],
      // relationManage: false, // 控制实体关系管理的弹窗
      relationTable: [
        {
          startEntityName: "药物",
          relation: "适用于",
          endEntityName: "疾病",
        },
      ],
      editPropertyVisible: false,
      editProperty: {
        index: null,
        name: "",
        type: "",
      },
      loading: false, // 点击保存后的loading
    };
  },
  created() {
    // this.fieldId = this.$route.query.schemaId
    // this.fieldName = this.$route.query.schemaName;
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
    switchValue(val) {
      this.isNodeReadOnly = !val;
    },
  },
  mounted() {
    // 获取子图名称
    this.fieldName = this.$route.query.schemaName;
    this.getSchema();
  },
  methods: {
    // 从后端获取全部schema
    getSchema() {
      // listnodelabelname
      this.loading = true;
      var param = { graphName: this.fieldName };
      console.log(param);
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kgschema/listnodelabel", {
          params: param,
        })
        .then((res) => {
          let data = res.data;
          console.log(data);
          if (data.code === 200) {
            // 获取成功
            if (data.data === null) {
              // 新schema传回null
              id = 1;
              console.log(id);
              this.$message({
                showClose: true,
                message: "请点击下方蓝色按钮构建标签体系！",
              });
            } else {
              // 旧schema传回json串
              id = 1;
              this.data = data.data;
              // console.log('输出分界')
              // console.log(this.data)
              this.findMaxId(this.data);
              id = id + 1;
              console.log("新增节点的起始id：" + id);
            }
            this.loading = false;
          } else {
            // 获取失败
            this.$message.error("获取失败，请刷新重试！");
          }
        });
    },
    findMaxId(treeList) {
      if (treeList.length !== 0) {
        // 树列表不为空
        for (var i = 0; i < treeList.length; i++) {
          if (treeList[i].id >= id) {
            id = treeList[i].id;
          }
          if (treeList[i].children.length !== 0) {
            this.findMaxId(treeList[i].children);
          }
        }
      } else {
        // return
      }
      // console.log('currentMaxID' + id)
    },
    filterNode(value, data) {
      // 树的过滤
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 考虑删去
    append(data) {
      // 增加子标签
      const newChild = {
        id: id++,
        label: "新建子节点",
        describe: "",
        type: "leaf",
        children: [],
        properties: [],
      }; // 新建的子节点是叶子，最详细的分类标签 & 暂时没有属性的实体
      if (!data.children) {
        this.$set(data, "children", []);
      }
      data.children.push(newChild);
      // console.log(data)
      data.type = "normal"; // 添加子节点后，本节点类型必为 normal （可能从leaf变为normal，也可能原来就是normal）
      console.log(data);
    },
    // 向后端直接删除标签
    remove(node, data) {
      // 删除标签
      console.log(node);
      console.log(data); // 是该节点的数据
      this.$confirm("此操作将删除该节点, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex((d) => d.id === data.id);
        children.splice(index, 1);
        if (node.parent.parent != null) {
          if (node.parent.data.children.length === 0) {
            node.parent.data.type = "leaf";
          }
        }

        axios
          .post(
            this.$backendBaseUrl + "/kgplatform/kgschema/deletenodelabel",
            qs.stringify({
              graphName: this.$route.query.schemaName,
              nodeName: data.label,
            })
          )
          .then((res) => {
            let data = res.data;
            console.log(data);
            if (data.code === 200) {
              // this.getSchema()
              this.$message({
                message: "删除实体标签成功!",
                type: "success",
              });
              this.loading = false;
            } else {
              this.$message.warning("删除实体标签失败，请检查是否不存在或联系管理员");
            }
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除",
            });
          });
      });
    },
    // 前端删除再向后端save current
    addFirstNode(formName) {
      // 增加一级标签
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 标签名非空，校验通过
          var firstNodeObj = {
            id: id++, // 第一个一级节点id为0
            label: this.nodeForm.nodeName,
            describe: this.nodeForm.nodeDescribe,
            type: "leaf", // 新增加的节点默认是叶子，点击append时再变为nomal
            state: "new", // 新增加的节点初始状态，老节点为old，老节点发生改变时changed
            children: [], // 非叶子节点表示标签层级（与properties不可同时非空！）
            properties: [{ name: "name", type: "string", optional: false }], // 叶子节点（实体的属性）
          };
          this.data.push(firstNodeObj);
          this.addDialogVisible = false;
          this.nodeForm = {
            nodeName: "",
            nodeDescribe: "",
          };
          // console.log(firstNodeObj)
          this.saveCurrent();
        } else {
          // 标签名为空，校验不通过
          console.log("error submit!!");
          return false;
        }
      });
    },
    handleNodeClick(data, checked) {
      this.editTreeNode = {}; // 用来保存要更新的树节点
      this.currentClickParentId = null;
      this.currentClickType = "";
      this.nodeInfo.nodeId = null;
      this.nodeInfo.nodeName = "";
      this.nodeInfo.nodeDescribe = "";
      console.log("当前点击：");
      console.log(data); // 当前选中的数据
      // console.log(checked) // 可以提取parent
      this.currentClickParentId = checked.parent.data.id; // 待插入子节点的父节点key
      this.editTreeNode = data; // 被选中节点的初始值
      // 以下为当前选中节点区域的数据
      this.nodeInfo.nodeId = data.id;
      this.nodeInfo.nodeName = data.label;
      this.nodeInfo.nodeDescribe = data.describe;
      // 以下为实体属性管理的控制
      if (data.type === "leaf") {
        this.currentClickType = "实体";
        this.clickIsNotEntity = false;
        this.isShowTable = true;
      } else if (data.type === "normal") {
        this.currentClickType = "标签";
        this.clickIsNotEntity = true;
        this.isShowTable = true; // 为了避免实体属性列表的渲染bug，此处设置isShowTable为true，始终显示表头。
      }
      // console.log('当前点击节点的属性列表：')
      // console.log(data.properties)
      // 获取实体属性列表的方法一：
      this.nodeProperties = data.properties; // 节点的properties传给右侧表格绑定的nodeProperties
      // 获取实体属性列表的方法二：
      // for (var i = 0; i < data.properties.length; i++) {
      //   var temObj = {
      //     name: data.properties[i].name,
      //     type: data.properties[i].type
      //   }
      //   this.nodeProperties.push(temObj)
      // }
      // this.nodeProperties.splice(0, 1)
      console.log("当前点击节点属性列表：");
      console.log(this.nodeProperties);
    },
    editNode() {
      // 编辑标签
      this.isNodeReadOnly = false;
    },
    // 在前端更改节点名字，再向后端save current
    saveNode() {
      if (this.nodeInfo.nodeName === "") {
        this.$notify.error({
          title: "错误",
          message: "标签名称不能为空！",
        });
      } else {
        this.isNodeReadOnly = true;
        // 先对原节点标签进行删除，再重新创建节点标签，状态置为"new"
        axios.post(
          this.$backendBaseUrl + "/kgplatform/kgschema/deletenodelabel",
          qs.stringify({
            graphName: this.$route.query.schemaName,
            nodeName: this.editTreeNode.label,
          })
        );

        this.editTreeNode.label = this.nodeInfo.nodeName;
        this.editTreeNode.describe = this.nodeInfo.nodeDescribe;
        this.editTreeNode.state = "new";
        console.log(this.editTreeNode); // 输出更新后的节点
        console.log("父节点");
        console.log(this.currentClickParentId);
        // this.$refs.tree.updateKeyChildren(this.nodeInfo.nodeId, this.editTreeNode) // 更新的方式不能重新渲染
        this.$refs.tree.remove(this.nodeInfo.nodeId); // 移除当前节点
        this.$refs.tree.append(this.editTreeNode, this.currentClickParentId); // 插入新节点
        console.log(this.data); // 输出整个树
        this.switchValue = false;
        this.saveCurrent();
      }
    },
    // 把前端标签列表发给后端，后端判断，删掉重建changed，不动old
    saveCurrent() {
      this.loading = true;
      console.log(this.$route.query.schemaName);
      console.log("待提交的树：");
      console.log(JSON.stringify(this.data));
      axios
        .post(
          this.$backendBaseUrl + "/kgplatform/kgschema/addnodelabel",
          qs.stringify({
            graphName: this.$route.query.schemaName,
            labelsInfo: JSON.stringify(this.data),
          })
        )
        .then((res) => {
          let data = res.data;
          console.log(data);
          if (data.code === 200) {
            id = id - 1;
            // this.getSchema()
            this.$message({
              message: "添加实体标签成功!",
              type: "success",
            });
            this.loading = false;
            this.getSchema();
          } else {
            this.$message.warning("添加实体标签失败，请检查是否已存在或联系管理员");
          }
        })
        .catch((err) => {
          console.log(err);
          this.$message.warning("添加实体标签失败，请检查是否已存在或联系管理员");
        });
    },
    // 前端增加一条属性，再向后端save current
    addProperty(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 属性名和类型校验通过
          var newPropertyObj = {
            name: this.newProperty.name,
            type: this.newProperty.type,
            optional: true,
          };
          // this.nodeProperties.push(newPropertyObj)
          // this.editTreeNode.properties = this.nodeProperties
          this.editTreeNode.properties.push(newPropertyObj);
          if (this.editTreeNode.state == "old") {
            this.editTreeNode.state = "changed";
          }
          var temNodeId = this.editTreeNode.id;
          this.$refs.tree.remove(temNodeId); // 移除当前节点
          // console.log(this.editTreeNode)
          // console.log(this.currentClickParentId)
          this.$refs.tree.append(this.editTreeNode, this.currentClickParentId); // 插入新节点
          console.log(this.data); // 输出整个树
          this.$message({
            message: "已添加",
            type: "success",
          });
          this.nodeProperties = this.editTreeNode.properties;
          this.addPropertyVisible = false;
          this.newProperty = {
            name: "",
            type: "",
          };
          this.saveCurrent();
        } else {
          // 校验不通过
          console.log("error submit!!");
          return false;
        }
      });
    },
    handleEdit(index, row) {
      console.log(row);
      this.editProperty.index = index;
      this.editProperty.name = row.name;
      this.editProperty.type = row.type;
      this.editPropertyVisible = true;
    },
    // 前端更改属性，再向后端save current
    editCurrentProperty(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 属性名和类型校验通过
          this.nodeProperties.splice(this.editProperty.index, 1);
          var temObjEditProperty = {
            name: this.editProperty.name,
            type: this.editProperty.type,
          };
          this.nodeProperties.push(temObjEditProperty);
          this.editTreeNode.properties = this.nodeProperties;
          if (this.editTreeNode.state == "old") {
            this.editTreeNode.state = "changed";
          }
          this.editProperty = {
            index: null,
            name: "",
            type: "",
          };
          this.editPropertyVisible = false;
          this.$message({
            showClose: true,
            message: "编辑该属性成功!",
            type: "success",
          });
          this.saveCurrent();
        }
      });
    },
    // 前端删除一条属性，再向后端save current
    handleDelete(index, row) {
      this.nodeProperties.splice(index, 1);
      // console.log(this.nodeProperties)
      this.editTreeNode.properties = this.nodeProperties;
      if (this.editTreeNode.state == "old") {
        this.editTreeNode.state = "changed";
      }
      this.$message({
        showClose: true,
        message: "已成功删除该属性!",
        type: "success",
      });
      this.saveCurrent();
    },
    handleRelationEdit(index, row) {},
    handleRelationDelete(index, row) {},
    schemaView() {
      this.$router.push({
        path: "/schema/visualization",
        query: {
          schemaName: this.fieldName,
          from: "entity",
        },
      });
    },
    back() {
      this.$router.push({
        path: "/schema/overview/",
        query: {},
      });
    },
    next() {
      this.$router.push({
        // name: 'SchemaHyperRelationship',
        name: "SchemaRelationship",
        // params: { schemaName: this.$route.query.schemaName },
        // path: '/schema/relationship/',
        query: {
          schemaName: this.fieldName,
          //   // schemaId: this.fieldId,
          //   status: 'buildAll'
        },
      });
    },
  },
};
</script>

<style>
.kgSchema {
  width: 100%;
}
.kgSchemaTree {
  width: 20%;
  float: left;
}
.kgSchemaTable {
  width: 80%;
  /* height: 90%; */
  float: left;
  text-align: center;
  padding: 20px auto;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  height: 25px;
  margin-right: 10px;
}
.item {
  margin: 4px;
}
.right .el-tooltip__popper {
  padding: 8px 10px;
}
.nodeInfo {
  /* padding: 10px auto; */
  width: 95%;
  height: 140px;
  background-color: white;
  /* text-align: center; */
  margin: 0px auto;
  padding: 10px;
}
.entityManage {
  width: 95%;
  height: auto;
  background-color: white;
  margin: 10px auto;
  padding: 10px;
}
.filter-tree {
  margin-top: 10px;
}
.form {
  margin: 15px auto;
}
.el-header {
  background-color: white;
  text-align: center;
}
.el-main {
  background-color: #e9eef3;
  padding-bottom: 15px;
  padding-top: 10px;
  padding-left: 20px;
  padding-right: 0;
}
</style>
