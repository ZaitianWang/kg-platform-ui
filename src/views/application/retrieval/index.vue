<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <h2>Knowledge Graph Query</h2>
        <div>
          <!-- 检索区 -->
          <el-form :inline="true">
            <el-form-item label="selct a graph">
              <el-select v-model="filterForm.graph" placeholder="graph name">
                <el-option
                  v-for="item in candidateGraph"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <el-form :inline="true">
            <el-form-item label="query mode">
              <el-radio-group v-model="filterCondition">
                <el-radio-button label="by entity"></el-radio-button>
                <el-radio-button label="by relationship"></el-radio-button>
                <el-radio-button label="k-Hop Neighbourhood"></el-radio-button>
                <el-radio-button label="path discovery"></el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <el-form
            v-if="filterCondition === 'by entity'"
            :inline="true"
            :model="filterFormEntity"
          >
            <el-form-item label="query enttiy">
              <el-input
                v-model="filterFormEntity.entity"
                clearable
                placeholder="entity name"
              >
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="retrieve()">Query</el-button>
            </el-form-item>
          </el-form>
          <el-form
            v-else-if="filterCondition === 'by relationship'"
            :inline="true"
            :model="filterFormRelationship"
          >
            <el-form-item label="query relationship">
              <el-select
                v-model="filterFormRelationship.relationship"
                placeholder="relation name"
              >
                <el-option
                  v-for="item in candidateRelationship"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="source">
              <el-input
                v-model="filterFormRelationship.startNode"
                clearable
                placeholder="entity name"
                :disabled="
                  disableOneOf(
                    filterFormRelationship.startNode,
                    filterFormRelationship.endNode
                  )
                "
              >
              </el-input>
            </el-form-item>
            <el-form-item label="target">
              <el-input
                v-model="filterFormRelationship.endNode"
                clearable
                placeholder="entity name"
                :disabled="
                  disableOneOf(
                    filterFormRelationship.endNode,
                    filterFormRelationship.startNode
                  )
                "
              >
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="retrieve()">Query</el-button>
            </el-form-item>
          </el-form>
          <el-form
            v-else-if="filterCondition === 'k-Hop Neighbourhood'"
            :inline="true"
            :model="filterFormAdvanced"
          >
            <el-form-item label="query entity">
              <el-input
                v-model="filterFormAdvanced.nodeName"
                clearable
                size="small"
                placeholder="entity name"
              >
              </el-input>
            </el-form-item>
            <el-form-item label="restrict relation">
              <el-switch
                v-model="filterFormAdvanced.restrictRelationship"
                size="small"
                active-text="True"
                inactive-text="False"
              ></el-switch>
            </el-form-item>
            <el-form-item label="first hop relation">
              <el-select
                v-model="filterFormAdvanced.relation"
                placeholder="relation name"
                size="small"
                :disabled="!filterFormAdvanced.restrictRelationship"
              >
                <el-option
                  v-for="item in candidateRelationship"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="maximal hops">
              <el-input-number
                v-model="filterFormAdvanced.maxHop"
                :min="1"
                :max="5"
                :step="1"
                size="small"
              ></el-input-number>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="retrieve()" size="small">Query</el-button>
            </el-form-item>
          </el-form>
          <el-form
            v-else-if="filterCondition === 'path discovery'"
            :inline="true"
            :model="filterFormPath"
          >
            <!-- 算法：MATCH (n),(m) CALL algo.shortestPath(n,m) YIELD nodeIds RETURN nodeIds，但tugraph性能可能不支持 -->
          </el-form>
        </div>
      </div>
      <div class="card" ref="chart"></div>
    </el-card>

    <el-drawer title="Instance Details" :visible.sync="detaildrawer" direction="rtl">
      <el-card class="box-card">
        <div slot="header">
          <span>Instance Name</span>
        </div>
        <div class="text item">
          {{ detailForm.name }}
        </div>
      </el-card>
      <el-card class="box-card">
        <div slot="header">
          <span>Attribute List</span>
        </div>
        <div v-for="(val, key) in detailForm.property" :key="key">
          <div class="text item">{{ key }}:{{ val }}</div>
          <el-divider></el-divider>
        </div>
      </el-card>
    </el-drawer>
  </div>
</template>

<script>
import axios from "axios";
import { getInstanceByDom } from "echarts";

export default {
  data() {
    return {
      filterForm: {
        graph: "",
      },
      filterCondition: "by entity",
      filterFormEntity: {
        entity: "",
      },
      filterFormRelationship: {
        startNode: "",
        relationship: "",
        endNode: "",
      },
      filterFormAdvanced: {
        nodeName: "",
        restrictRelationship: false,
        relation: "",
        maxHop: 1,
      },
      filterFormPath: {},
      detailForm: {
        // 表单编辑实体
        vid: "",
        uid: "",
        name: "",
        property: [],
      },
      candidateGraph: [],
      candidateRelationship: [],
      detaildrawer: false,
      initdialog: false,
    };
  },
  mounted() {
    this.initCharts();
    this.getGraphListData();
  },
  watch: {
    "filterForm.graph"() {
      this.getGraphLabelList();
    },
  },
  methods: {
    // 筛选
    /**
     * @param data 被筛选的node数组
     * @param cond 筛选条件字符串数组
     */
    filterByType(data, cond) {
      console.log(cond);
      if (cond == "") {
        return data;
      }
      return data.filter((item) => {
        if (cond.includes(item.category)) {
          return item;
        }
      });
    },
    initCharts() {
      var echarts = require("echarts");
      let myChart = echarts.init(this.$refs.chart);
      myChart.resize();
    },

    showDetails(params) {
      this.detailForm.property = params.data.property;
      if (params.dataType == "node") {
        this.vid = params.data.vid;
        this.detailForm.name = params.data.rawName;
      } else {
        this.detailForm.name = params.data.label;
        this.uid = params.data.uid;
      }

      this.detaildrawer = true;
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
        series: [
          {
            type: "graph",
            layout: "force",
            force: {
              // 待调试改进，可做成根据数量变化
              edgeLength: 30,
              repulsion: graph.nodes.length > 100 ? 200 : 500,
              gravity: 0.5,
            },
            roam: true, // 缩放与拖动
            draggable: true, // 点之间固定，drag会drag整个画面
            animation: false, // 因该是图有变化时，ECharts 找到两组数据之间的差异然后通过合适的动画去表现数据的变化。
            symbolSize: graph.nodes.length > 100 ? 20 : 30,
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
              hideOverlap: graph.nodes.length > 100 ? true : false,
            },
            edgeLabel: {},
            autoCurveness: true,
            nodes: graph.nodes,
            categories: graph.categories,
            edges: graph.links,
          },
        ],
      });
      myChart.on("click", function (params) {
        that.showDetails(params);
      });
    },
    //获取图列表数据
    getGraphListData() {
      var that = this;
      axios
        .get(that.$backendBaseUrl + "/kgplatform/kgvisualize/listsubgraph")
        .then(function (response) {
          console.log(response);
          if (response.data.code === 200) {
            that.candidateGraph = response.data.data;
          } else {
            console.log(data.msg);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    disableOneOf(thisInput, thatInput) {
      if (thatInput == "") {
        return false;
      } else {
        return true;
      }
    },
    retrieve() {
      var that = this;
      if (this.filterCondition == "by entity") {
        axios
          .get(this.$backendBaseUrl + "/kgplatform/kgvisualize/querygraphbytriple", {
            params: {
              graphName: that.filterForm.graph,
              head: that.filterFormEntity.entity,
            },
          })
          .then(function (response) {
            if (response.data.code === 200) {
              that.drawGraph(response.data.data);
            } else {
              console.log(data.msg);
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      } else if (this.filterCondition == "by relationship") {
        axios
          .get(this.$backendBaseUrl + "/kgplatform/kgvisualize/querygraphbytriple", {
            params: {
              graphName: that.filterForm.graph,
              head: that.filterFormRelationship.startNode,
              relation: that.filterFormRelationship.relationship,
              tail: that.filterFormRelationship.endNode,
            },
          })
          .then(function (response) {
            if (response.data.code === 200) {
              that.drawGraph(response.data.data);
            } else {
              console.log(data.msg);
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      } else if (this.filterCondition == "k-Hop Neighbourhood") {
        axios
          .get(this.$backendBaseUrl + "/kgplatform/kgvisualize/query-graph", {
            params: {
              graphName: that.filterForm.graph,
              nodeName: that.filterFormAdvanced.nodeName,
              relation: that.filterFormAdvanced.restrictRelationship
                ? that.filterFormAdvanced.relation
                : "",
              maxHop: that.filterFormAdvanced.maxHop,
            },
          })
          .then(function (response) {
            if (response.data.code === 200) {
              that.drawGraph(response.data.data);
            } else {
              console.log(data.msg);
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    },
    getGraphLabelList() {
      var that = this;
      axios
        .get(that.$backendBaseUrl + "/kgplatform/kgvisualize/listgraphlabel", {
          params: {
            graphName: that.filterForm.graph,
          },
        })
        .then(function (response) {
          console.log(response);
          if (response.data.code === 200) {
            that.candidateRelationship = response.data.data.edge;
            that.initdialog = false;
          } else {
            console.log(data.msg);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
  },
};
</script>
<style scoped>
.card {
  width: 100%;
  height: 700px;
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
