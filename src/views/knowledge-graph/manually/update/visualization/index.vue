<template>
  <div class="app-container">
    <el-card style="width: 100%">
      <el-container>
        <div style="width: 1100px; height: 600px" ref="chart"></div>
      </el-container>
    </el-card>
    <el-drawer :visible.sync="drawer" direction="rtl">
      <div slot="title">
        Instance Details
        <el-tooltip
          content="You can edit attributes of the instance. If you want to edit the instance type or name, please delete the instance and create a new one."
          placement="bottom-start"
        >
          <i class="el-icon-question"></i>
        </el-tooltip>
      </div>
      <el-card class="box-card">
        <div slot="header">
          <span v-if="detailForm.labelType == 'node'">instance type: entity</span>
          <span v-else>instance type: relationship</span>
        </div>
        <div v-if="detailForm.labelType == 'node'" style="padding: 5px 0px">
          <div style="padding-bottom: 5px">entity type: {{ detailForm.label }}</div>
          <div style="padding-top: 5px">entity name: {{ detailForm.name }}</div>
        </div>
        <div v-else-if="detailForm.labelType == 'edge'">
          <span>relationship name: {{ detailForm.name }}</span>
        </div>
      </el-card>
      <el-card class="box-card">
        <div slot="header">
          <span>attibute list</span>
        </div>
        <el-table :data="detailForm.property">
          <el-table-column label="attribute name">
            <template slot-scope="scope">
              <span>{{ scope.row.key }}</span>
            </template>
          </el-table-column>
          <el-table-column label="attribute value">
            <template slot-scope="scope">
              <el-input v-model="scope.row.value" placeholder="please input"></el-input>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 20px; text-align: right">
          <el-popconfirm
            style="margin-right: 10px"
            title="Sure to delete? This operation cannot be undone."
            @onConfirm="deleteNodeOrEdge()"
          >
            <el-button slot="reference" type="danger">Delete</el-button>
          </el-popconfirm>

          <el-button type="plain" @click="drawer = false">Cancel</el-button>
          <el-button type="primary" @click="updateNodeOrEdge()">Confirm</el-button>
        </div>
      </el-card>
    </el-drawer>
    <el-dialog title="Add Entity" :visible.sync="newNodeFormVisible">
      <el-form :model="newNodeForm" label-width="100px">
        <el-form-item label="entity name">
          <el-input
            v-model="newNodeForm.name"
            autocomplete="off"
            style="width: 80%"
          ></el-input>
        </el-form-item>
        <el-form-item label="entity type">
          <el-select v-model="newNodeForm.label" placeholder="please select">
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
        <el-button @click="newNodeFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addNewNode">Confirm</el-button>
      </div>
    </el-dialog>
    <el-dialog title="Add Relationship" :visible.sync="newEdgeFormVisible">
      <el-form :model="newEdgeForm">
        <el-form-item label="relation">
          <el-select v-model="newEdgeForm.name" placeholder="please select">
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
          <el-select
            v-model="newEdgeForm.start"
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
        <el-form-item label="target">
          <el-select
            v-model="newEdgeForm.end"
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
        <el-button @click="newEdgeFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addNewEdge">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";
import { getInstanceByDom } from "echarts";

export default {
  data() {
    return {
      newNodeFormVisible: false,
      newEdgeFormVisible: false,
      detailForm: {
        labelType: "",
        vid: "",
        uid: "",
        label: "",
        name: "",
        property: [],
      },
      KGEntityLabels: [],
      newNodeForm: {
        name: "",
        label: "",
      },
      KGRelationshipLabels: [],
      newEdgeForm: {
        name: "",
        start: "",
        end: "",
      },
      candidateStartEntityNode: [],
      candidateEndEntityNode: [],
      loadingCandidate: true,
      drawer: false,
      isSelectNode: false,
      selected: [],
    };
  },
  mounted() {
    this.initCharts();
    this.updateCharts();
    this.loadEntityLabels();
    this.loadRelationshipLabels();
  },
  methods: {
    initCharts() {
      var echarts = require("echarts");
      let myChart = echarts.init(this.$refs.chart, null, {
        width: "1100px",
        height: "600px",
      });
      myChart.resize();
    },
    updateCharts() {
      var that = this;
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kgvisualize/getgraphdetail", {
          params: {
            graphName: that.$route.query.name,
          },
        })
        .then(function (response) {
          if (response.data.code === 200) {
            that.drawGraph(response.data.data);
          } else {
            console.log(response.data.msg);
            that.$message.warning(response.data.msg);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    showDetails(params) {
      console.log(1, params);
      this.detailForm.property = [];
      console.log(2, params.data.propertyList);
      params.data.propertyList.forEach((element) => {
        console.log(element);
        this.detailForm.property.push(JSON.parse(JSON.stringify(element)));
      });
      console.log(this.detailForm.property);
      this.detailForm.labelType = params.dataType; //node or edge
      if (params.dataType == "node") {
        this.detailForm.vid = params.data.vid;
        this.detailForm.name = params.data.rawName; //name = name
        this.detailForm.label = params.data.label; //label = label
      } else {
        this.detailForm.uid = params.data.uid;
        this.detailForm.name = params.data.label; //name = label
        this.detailForm.label = params.data.label; //label = label
      }
      this.drawer = true;
    },
    updateNodeOrEdge() {
      this.drawer = false;
      console.log(this.detailForm.labelType);
      console.log(this.detailForm.vid);
      console.log(this.detailForm.uid);
      console.log(this.detailForm.label);
      console.log(this.detailForm.name);
      console.log(this.detailForm.property);
      if (this.detailForm.labelType == "node") {
        axios
          .put(this.$backendBaseUrl + "/kgplatform/kginstance/updatenode", {
            graphName: this.$route.query.name,
            nodeId: this.detailForm.vid,
            nodeLabel: this.detailForm.label,
            property: this.detailForm.property,
          })
          .then((res) => {
            if (res.data.code === 200) {
              this.updateCharts();
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        axios
          .put(this.$backendBaseUrl + "/kgplatform/kginstance/updateedgeprop", {
            graphName: this.$route.query.name,
            edgeId: this.detailForm.uid,
            edgeLabel: this.detailForm.label,
            property: this.detailForm.property,
          })
          .then((res) => {
            if (res.data.code === 200) {
              this.updateCharts();
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    deleteNodeOrEdge() {
      if (this.detailForm.labelType == "node") {
        axios
          .delete(this.$backendBaseUrl + "/kgplatform/kginstance/deletenode", {
            params: {
              graphName: this.$route.query.name,
              nodeId: this.detailForm.vid,
            },
          })
          .then((res) => {
            if (res.data.code === 200) {
              this.updateCharts();
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        axios
          .delete(this.$backendBaseUrl + "/kgplatform/kginstance/deleteedgebyid", {
            params: {
              graphName: this.$route.query.name,
              edgeId: this.detailForm.uid,
            },
          })
          .then((res) => {
            if (res.data.code === 200) {
              this.updateCharts();
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
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
        legend: [
          {
            // selectedMode: 'single',
            data: graph.categories.map(function (a) {
              return a.name;
            }),
          },
        ],
        tooltip: {
          formatter: "{b}",
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
              edgeLength: 20,
              repulsion: graph.nodes.length > 100 ? 50 : 500,
              gravity: 0.5,
            },
            roam: true, // 缩放与拖动
            draggable: false, // 点之间固定，drag会drag整个画面
            animation: false, // 因该是图有变化时，ECharts 找到两组数据之间的差异然后通过合适的动画去表现数据的变化。
            symbolSize: graph.nodes.length > 100 ? 10 : 30,
            edgeSymbol: ["none", "arrow"],
            edgeSymbolSize: 10,
            lineStyle: {
              width: 1,
              color: "source",
            },
            label: {
              // 大小及显示与否做成根据数量调整
              show: true,
              position: "inside",
              formatter: "{b}",
            },
            labelLayout: {
              hideOverlap: true,
            },
            edgeLabel: {},
            emphasis: {
              disabled: graph.nodes.length > 100 ? true : false,
              focus: "adjacency",
              lineStyle: {
                width: 3,
              },
            },
            autoCurveness: true,
            nodes: graph.nodes,
            categories: graph.categories,
            edges: graph.links,
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
      this.selected.push(params.data.vid);
      if (this.selected.length == 2) {
        console.log(this.selected);
        this.handleAddEdge();
        this.newEdgeForm.start = this.selected[0];
        this.newEdgeForm.end = this.selected[1];
        this.selected = [];
        this.toggleSelectMode();
      }
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
            this.candidateStartEntityNode = data.data;
            // this.candidateEntityNode = data.data.map((item) => {
            //   return item.name;
            // });
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
            this.candidateEndEntityNode = data.data;
            // this.candidateEntityNode = data.data.map((item) => {
            //   return item.name;
            // });
            console.log("candidate entity loaded");
            // console.log(this.candidateEntityNode);
          }
          this.loadingCandidate = false;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    handleAddNode() {
      this.newNodeForm.name = "";
      this.newNodeForm.label = "";
      this.newNodeFormVisible = true;
    },
    addNewNode() {
      this.newNodeFormVisible = false;
      axios
        .post(this.$backendBaseUrl + "/kgplatform/kginstance/addnode", {
          graphName: this.$route.query.name,
          name: this.newNodeForm.name,
          label: this.newNodeForm.label,
        })
        .then((res) => {
          if (res.data.code === 200) {
            this.updateCharts();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    handleAddEdge() {
      // 顶部表单[添加]，打开对话框
      this.newEdgeForm.name = "";
      this.newEdgeForm.start = "";
      this.newEdgeForm.end = "";
      this.newEdgeFormVisible = true;
    },
    addNewEdge() {
      this.newEdgeFormVisible = false;
      axios
        .post(this.$backendBaseUrl + "/kgplatform/kginstance/addedge", {
          graphName: this.$route.query.name,
          name: this.newEdgeForm.name,
          start: this.newEdgeForm.start,
          end: this.newEdgeForm.end,
        })
        .then((res) => {
          if (res.data.code === 200) {
            this.updateCharts();
          }
        })
        .catch((err) => {
          console.log(err);
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
