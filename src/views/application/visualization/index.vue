<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <h2>Knowledge Graph Visualization</h2>
        <div>
          <!-- 筛选区 -->
          <el-form :inline="true" :model="filterForm" class="demo-form-inline">
            <el-form-item label="select a graph">
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
        </div>
      </div>
      <div class="card" ref="chart"></div>
    </el-card>
    <el-drawer title="Instance Details" :visible.sync="drawer" direction="rtl">
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
      //只用graph，其他两个暂时保留
      filterForm: {
        graph: "",
        entity: "",
        relationship: "",
      },
      detailForm: {
        // 表单编辑实体
        vid: "",
        uid: "",
        name: "",
        property: [],
      },
      candidateGraph: [],
      drawer: false,
    };
  },
  mounted() {
    this.initCharts();
    this.getData();
  },
  watch: {
    "filterForm.graph"() {
      this.updateCharts();
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
    updateCharts() {
      var that = this;
      axios
        .get(this.$backendBaseUrl + "/kgplatform/kgvisualize/getgraphdetail", {
          params: {
            graphName: that.filterForm.graph,
          },
        })
        .then(function (response) {
          if (response.data.code === 200) {
            that.drawGraph(response.data.data);
          } else {
            console.log(response.data.msg);
            that.$message.error(response.data.msg);
          }
        })
        .catch(function (error) {
          console.log(error);
          that.$message.error(error);
        });
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
      this.drawer = true;
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
            data: graph.categories.map(function (a) {
              return a.name;
            }),
          },
        ],
        aria: {
          show: true,
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
            draggable: true, // 点之间固定，drag会drag整个画面
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
    //获取图列表数据，后续新加的预加载固定信息也可以在这改
    getData() {
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
