<template>
  <div class="app-container">
    <el-container>
      <el-header style="height: 120px; padding-bottom: 10px; align: center">
        <h1 style="margin-top: 10px">{{ fieldName }} Domain Schema Visualization</h1>
        <div style="margin: 10px 0">
          <el-button
            type="info"
            icon="el-icon-d-arrow-left"
            size="medium"
            @click="backToHome()"
            >Schema Overvieww</el-button
          >
          <el-button type="success" size="medium" @click="back()"
            >Quit Visualization</el-button
          >
        </div>
      </el-header>
      <el-main>
        <div style="width: 1200px; height: 600px" ref="chart"></div>
      </el-main>
    </el-container>
    <el-drawer :visible.sync="drawer" direction="rtl">
      <div slot="title">
        Label Details
        <el-tooltip
          content="You can modify label attributes label topology structure. If you want to change the label name, please delete the label and create a new one."
          placement="bottom-start"
        >
          <i class="el-icon-question"></i>
        </el-tooltip>
      </div>
      <el-card class="box-card">
        <div slot="header">
          <span v-if="detailForm.labelType == 'node'">label type: entity</span>
          <span v-else>label type: raltionship</span>
        </div>
        <div v-if="detailForm.labelType == 'node'">
          <div>entity label name {{ detailForm.labelName }}</div>
        </div>
        <div v-else-if="detailForm.labelType == 'edge'">
          <span>relationship label name: {{ detailForm.labelName }}</span>
        </div>
      </el-card>
      <el-card v-if="detailForm.labelType == 'edge'" class="box-card">
        <div slot="header"><span>topology structure</span></div>
        <div style="text-align: center">
          <el-input
            v-model="detailForm.edgeSrc"
            size="small"
            style="width: 40%"
          ></el-input>
          <!-- <span>{{ detailForm.edgeSrc }}</span> -->
          <i class="el-icon-right" style="padding: 5px"></i>
          <!-- <span>{{ detailForm.edgeDst }}</span> -->
          <el-input
            v-model="detailForm.edgeDst"
            size="small"
            style="width: 40%"
          ></el-input>
        </div>
      </el-card>
      <el-card class="box-card">
        <div slot="header">
          <span>attribute list</span>
        </div>
        <el-table :data="detailForm.property">
          <el-table-column label="attribute name">
            <template slot-scope="scope">
              <el-input v-model="scope.row.name" size="small"> </el-input>
              <!-- <span>{{ scope.row.name }}</span> -->
            </template>
          </el-table-column>
          <el-table-column label="data type">
            <template slot-scope="scope">
              <el-select v-model="scope.row.type" placeholder="select" size="small">
                <el-option
                  v-for="item in ['STRING', 'INT32', 'FLOAT', 'DOUBLE', 'DATE']"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Operations" align="center">
            <template slot-scope="scope">
              <el-button
                type="text"
                size="medium"
                :disabled="scope.row.name == 'name'"
                @click="removeDetailProp(scope.row, scope.$index)"
              >
                <i class="el-icon-delete" aria-hidden="true"></i>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="text" @click="addDetailProp()">Click to add more</el-button>
        <div style="margin-top: 20px; text-align: right">
          <el-button type="danger" @click="deleteLabel()">Delete</el-button>
          <el-button type="plain" @click="drawer = false">Cancel</el-button>
          <el-button type="primary" @click="updateLabel()">Confirm</el-button>
        </div>
      </el-card>
    </el-drawer>
    <el-dialog title="Add New Entity Lable" :visible.sync="newNodeFormVisible">
      <el-form ref="relationForm" :model="newNodeForm" label-width="100px">
        <el-form-item label="label name" prop="name">
          <el-input v-model="newNodeForm.name"></el-input>
        </el-form-item>
        <el-form-item label="attribute list">
          <el-table
            :data="newNodeForm.fields"
            border
            stripe
            style="width: 100%"
            :row-style="{ height: 0 + 'px' }"
            :cell-style="{ padding: 0 + 'px' }"
          >
            <el-table-column prop="name" label="attribute name" align="center">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.name"
                  placeholder="please input"
                  style="height: auto"
                  size="mini"
                  :disabled="scope.row.name == 'name'"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="data type" align="center">
              <template slot-scope="scope">
                <el-select
                  v-model="scope.row.type"
                  placeholder="select"
                  size="mini"
                  :disabled="scope.row.name == 'name'"
                >
                  <el-option
                    v-for="item in ['string', 'int32', 'double', 'date']"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                  </el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="Operation" align="center">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="medium"
                  :disabled="scope.row.name == 'name'"
                  @click="removeProp(scope.row, scope.$index)"
                >
                  <i class="el-icon-delete" aria-hidden="true"></i>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="text" @click="addProp('node')">Click to add more</el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="newNodeFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addNewNode()">Confirm</el-button>
      </span>
    </el-dialog>
    <el-dialog title="Add New Relation Label" :visible.sync="newEdgeFormVisible">
      <el-form ref="relationForm" :model="newEdgeForm" label-width="100px">
        <el-form-item label="source" prop="sLabel">
          <!-- <el-input v-model="relationForm.sLabel"></el-input> -->
          <el-select v-model="newEdgeForm.src" placeholder="select">
            <el-option
              v-for="label in KGEntityLabels"
              :key="label"
              :label="label"
              :value="label"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="relation" prop="name">
          <el-input v-model="newEdgeForm.name"></el-input>
        </el-form-item>
        <el-form-item label="target" prop="tLabel">
          <el-select v-model="newEdgeForm.dst" placeholder="select">
            <el-option
              v-for="label in KGEntityLabels"
              :key="label"
              :label="label"
              :value="label"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="attribute list">
          <el-table
            :data="newEdgeForm.fields"
            border
            stripe
            style="width: 100%"
            :row-style="{ height: 0 + 'px' }"
            :cell-style="{ padding: 0 + 'px' }"
          >
            <el-table-column prop="name" label="attribute name" align="center">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.name"
                  placeholder="please input"
                  style="height: auto"
                  size="mini"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="data type" align="center">
              <template slot-scope="scope">
                <el-select v-model="scope.row.type" placeholder="select" size="mini">
                  <el-option
                    v-for="item in ['string', 'int32', 'double', 'date']"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                  </el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="Operation" align="center">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="medium"
                  @click="removeProp(scope.row, scope.$index)"
                >
                  <i class="el-icon-delete" aria-hidden="true"></i>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="text" @click="addProp('edge')">Click to add more</el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="newEdgeFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addNewEdge()">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";
import qs from "qs";
import { getInstanceByDom } from "echarts";

export default {
  data() {
    return {
      fieldName: "",
      drawer: false,
      newNodeFormVisible: false,
      newEdgeFormVisible: false,
      labels: {
        edge: [],
        vertex: [],
      },
      detailForm: {
        labelType: "",
        labelName: "",
        property: [],
        edgeSrc: "",
        edgeDst: "",
      },
      KGEntityLabels: [],
      newNodeForm: {
        name: "",
        fields: [
          {
            name: "name",
            type: "string",
            optional: false,
          },
        ],
      },
      newEdgeForm: {
        name: "",
        src: "",
        dst: "",
        fields: [],
      },
      isSelectMode: false,
      selected: [],
    };
  },
  mounted() {
    this.fieldName = this.$route.query.schemaName;
    this.initCharts();
    this.updateCharts();
    this.loadEntityLabels();
  },
  methods: {
    initCharts() {
      var echarts = require("echarts");
      let myChart = echarts.init(this.$refs.chart, null, {
        width: "1200px",
        height: "600px",
      });
      myChart.resize();
    },
    updateCharts() {
      var that = this;
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kgvisualize/getschemaforvis", {
          params: {
            graphName: this.fieldName,
          },
        })
        .then(function (response) {
          console.log(response.data.data);
          if (response.data.code === 200) {
            that.drawGraph(response.data.data);
          } else {
            console.log(data.msg);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    drawGraph(graph) {
      var that = this;
      var myChart = getInstanceByDom(this.$refs.chart);
      // 绘制图表
      myChart.setOption({
        title: {
          text: graph.name,
          top: "bottom",
          left: "right",
        },
        toolbox: {
          show: true,
          orient: "vertical",
          itemSize: 30,
          feature: {
            myAddNode: {
              show: true,
              title: "add node",
              icon:
                "path://M16,29A13,13,0,1,1,29,16,13,13,0,0,1,16,29ZM16,5A11,11,0,1,0,27,16,11,11,0,0,0,16,5Z M16,23a1,1,0,0,1-1-1V10a1,1,0,0,1,2,0V22A1,1,0,0,1,16,23Z M22,17H10a1,1,0,0,1,0-2H22a1,1,0,0,1,0,2Z",
              onclick: function () {
                that.handleAddNode();
              },
            },
            myAddEdge: {
              show: true,
              title: "add edge",
              icon:
                "path://M14,4c1.105,0,2-0.895,2-2c0-1.105-0.895-2-2-2s-2,0.895-2,2c0,0.144,0.017,0.283,0.045,0.418L3.501,6.691  C3.134,6.271,2.601,6,2,6C0.895,6,0,6.895,0,8c0,1.105,0.895,2,2,2c0.601,0,1.134-0.271,1.501-0.691l8.545,4.272  C12.017,13.717,12,13.856,12,14c0,1.105,0.895,2,2,2s2-0.895,2-2c0-1.105-0.895-2-2-2c-0.601,0-1.134,0.271-1.501,0.691L3.955,8.418  C3.983,8.283,4,8.144,4,8c0-0.144-0.017-0.283-0.045-0.418l8.545-4.272C12.866,3.729,13.399,4,14,4z",
              onclick: function () {
                that.handleAddEdge();
              },
            },
            mySelectNode: {
              show: true,
              title: "toogle select node",
              icon:
                "path://M20 2H8c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM8 16V4h12l.002 12H8z M4 8H2v12c0 1.103.897 2 2 2h12v-2H4V8zm8.933 3.519-1.726-1.726-1.414 1.414 3.274 3.274 5.702-6.84-1.538-1.282z",
              onclick: function () {
                that.toggleSelectMode();
              },
            },
            restore: {},
            saveAsImage: {},
          },
        },
        series: [
          {
            type: "graph",
            layout: "force",
            force: {
              // 待调试改进，可做成根据数量变化
              edgeLength: 200,
              repulsion: 1000,
              gravity: 0.2,
            },
            roam: true, // 缩放与拖动
            draggable: true, // 点之间固定，drag会drag整个画面
            animation: false, // 因该是图有变化时，ECharts 找到两组数据之间的差异然后通过合适的动画去表现数据的变化。
            symbolSize: 50,
            edgeSymbol: ["none", "arrow"],
            edgeSymbolSize: 10,
            lineStyle: {
              width: 5,
              // curveness: 0.5,
            },
            label: {
              // 大小及显示与否做成根据数量调整
              show: true,
              position: "inside",
            },
            edgeLabel: {
              // 显示会影响性能和效果
              show: true,
            },
            autoCurveness: true,
            nodes: graph.nodes,
            edges: graph.edges,
            categories: graph.nodes.map(function (a) {
              return a.category;
            }),
          },
        ],
      });
      myChart.off("click");
      myChart.on("click", function (params) {
        console.log(params);
        // 选择节点或展示节点详情
        if (that.isSelectMode && params.dataType == "node") {
          that.selectNodes(params);
        } else {
          that.showDetails(params);
        }
      });
    },
    selectNodes(params) {
      // 如果已选择两个节点，则建立边
      this.selected.push(params.data.name);
      if (this.selected.length == 2) {
        console.log(this.selected);
        this.handleAddEdge();
        this.newEdgeForm.src = this.selected[0];
        this.newEdgeForm.dst = this.selected[1];
        this.selected = [];
        this.toggleSelectMode();
      }
    },
    showDetails(params) {
      console.log(1, params);
      this.detailForm.property = [];
      console.log(2, params.data.properties);
      params.data.properties.forEach((element) => {
        // console.log(element);
        this.detailForm.property.push(JSON.parse(JSON.stringify(element)));
      });
      console.log(this.detailForm.property);
      this.detailForm.labelType = params.data.labelType; //node or edge
      if (params.dataType == "node") {
        //   this.detailForm.vid = params.data.vid;
        //   this.detailForm.name = params.data.name; //name = name
        this.detailForm.labelName = params.data.name; //label = label
      } else {
        //   this.detailForm.uid = params.data.uid;
        //   this.detailForm.name = params.data.label; //name = label
        this.detailForm.labelName = params.data.labelName; //label = label
        this.detailForm.edgeSrc = params.data.source;
        this.detailForm.edgeDst = params.data.target;
      }
      this.drawer = true;
    },
    loadEntityLabels() {
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kginstance/listgraphnodelabels", {
          params: {
            graphName: this.fieldName,
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
    handleAddNode() {
      this.newNodeForm.name = "";
      //   this.newNodeForm.label = "";
      (this.newNodeForm.fields = [
        {
          name: "name",
          type: "string",
          optional: false,
        },
      ]),
        (this.newNodeFormVisible = true);
    },
    addNewNode() {
      this.newNodeFormVisible = false;
      console.log(this.fieldName);
      console.log(this.newNodeForm.name);
      console.log(this.newNodeForm.fields);
      axios
        .post(this.$backendBaseUrl + "/kgplatform/kgschema/addonenodelabel", {
          // params: {
          graphName: this.fieldName,
          nodeLabel: this.newNodeForm.name,
          properties: this.newNodeForm.fields,
          // },
        })
        .then((res) => {
          if (res.data.code === 200) {
            this.updateCharts();
            this.loadEntityLabels();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    handleAddEdge() {
      // 顶部表单[添加]，打开对话框
      this.newEdgeForm.name = "";
      this.newEdgeForm.src = "";
      this.newEdgeForm.dst = "";
      this.newEdgeForm.fields = [];
      this.newEdgeFormVisible = true;
    },
    addNewEdge() {
      this.newEdgeFormVisible = false;
      console.log(this.fieldName);
      console.log(this.newEdgeForm.name);
      console.log(this.newEdgeForm.src);
      console.log(this.newEdgeForm.dst);
      console.log(this.newEdgeForm.fields);
      axios
        .post(
          this.$backendBaseUrl + "/kgplatform/kgschema/addedgelabel",
          qs.stringify({
            graphName: this.fieldName,
            edgeLabel: this.newEdgeForm.name,
            startNode: this.newEdgeForm.src,
            endNode: this.newEdgeForm.dst,
            properties: JSON.stringify(this.newEdgeForm.fields),
          })
        )
        .then((res) => {
          if (res.data.code === 200) {
            this.updateCharts();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // for add
    removeProp(row, index) {
      this.newEdgeForm.fields.splice(index, 1);
    },
    addProp(labelType) {
      console.log(this.newEdgeForm.fields);
      if (labelType == "edge") {
        this.newEdgeForm.fields.push({
          name: "",
          type: "",
          optional: true,
        });
      } else {
        this.newNodeForm.fields.push({
          name: "",
          type: "",
          optional: true,
        });
      }
      console.log(this.newEdgeForm.fields);
    },
    // for edit
    removeDetailProp(row, index) {
      this.detailForm.property.splice(index, 1);
    },
    addDetailProp(labelType) {
      // if (labelType == "edge") {
      console.log(this.detailForm.property);
      this.detailForm.property.push({
        name: "",
        type: "",
        optional: true,
      });
      console.log(this.detailForm.property);
      // } else {
      // this.detailForm.property.push({
      // name: "",
      // type: "",
      // optional: true,
      // });
      // }
    },
    updateLabel() {
      this.drawer = false;
      console.log(this.detailForm.labelType);
      console.log(this.detailForm.labelName);
      console.log(this.detailForm.property);
      console.log(this.detailForm.edgeSrc);
      console.log(this.detailForm.edgeDst);
      if (this.detailForm.labelType == "node") {
        axios
          .put(this.$backendBaseUrl + "/kgplatform/kgschema/updatenodelabel", {
            graphName: this.fieldName,
            nodeLabel: this.detailForm.labelName,
            property: this.detailForm.property,
          })
          .then((res) => {
            if (res.data.code === 200) {
              this.updateCharts();
              this.drawer = false;
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        axios
          .put(this.$backendBaseUrl + "/kgplatform/kgschema/updateedgelabel", {
            graphName: this.fieldName,
            edgeLabel: this.detailForm.labelName,
            property: this.detailForm.property,
            src: this.detailForm.edgeSrc,
            dst: this.detailForm.edgeDst,
          })
          .then((res) => {
            if (res.data.code === 200) {
              this.updateCharts();
              this.drawer = false;
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    deleteLabel() {
      axios
        .delete(this.$backendBaseUrl + "/kgplatform/kgschema/deletelabel", {
          params: {
            graphName: this.fieldName,
            labelName: this.detailForm.labelName,
            labelType: this.detailForm.labelType,
          },
        })
        .then((res) => {
          if (res.data.code === 200) {
            this.updateCharts();
            this.drawer = false;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    backToHome() {
      this.$router.push({
        path: "/schema/overview/",
        query: {},
      });
    },
    back() {
      this.$router.push({
        path: "/schema/" + this.$route.query.from + "/",
        query: {
          schemaName: this.fieldName,
        },
      });
    },
    toggleSelectMode() {
      var that = this;
      var myChart = getInstanceByDom(this.$refs.chart);
      if (this.isSelectMode) {
        this.isSelectMode = false;
        myChart.setOption({
          series: [
            {
              selectedMode: "none",
              select: {
                disabled: true,
              },
            },
          ],
        });
      } else {
        this.isSelectMode = true;
        this.$message.info(
          "Please select source and then target node to create a new edge."
        );
        myChart.setOption({
          series: [
            {
              selectedMode: "multiple",
              select: {
                itemStyle: {
                  shadowColor: "rgba(0, 0, 0, 0.8)",
                  shadowBlur: 10,
                },
              },
            },
          ],
        });
      }
    },
  },
};
</script>
<style scoped>
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
.card {
  width: 720px;
  height: 480px;
  background-color: #ffffff;
  color: rgb(0, 0, 0);
  padding: 10px;
  font-size: 25px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  text-align: center;
}
.text {
  font-size: 16px;
}

.item {
  padding: 5px 0;
}

.box-card {
  width: 90%;
  margin: 5px auto;
}
.el-tag {
  font-size: 18px;
}

.bg-purple-light {
  background: #e8ebf1;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
</style>
