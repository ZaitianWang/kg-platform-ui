<template>
  <div class="dashboard-container">
    <div style="text-align: center">
      <el-row :gutter="20" style="padding: 0px 10px 0px 10px">
        <el-card :body-style="{ 'padding-top': '30px', 'padding-bottom': '70px' }">
          <div slot="header">
            <h1>Knowledge Graph Intelligent Construction Workflow</h1>
          </div>
          <div>
            <el-col :span="2"></el-col>
            <el-col :span="20">
              <el-steps align-center>
                <el-step
                  title="Prepare Data Source"
                  icon="el-icon-document"
                  status="process"
                >
                  <div slot="title"><h3>Prepare Data Source</h3></div>
                </el-step>
                <el-step
                  title="KG Schema Construction"
                  icon="el-icon-setting"
                  status="finish"
                >
                  <div slot="title"><h3>KG Schema Construction</h3></div>
                </el-step>
                <el-step
                  title="Knowledge Graph Update"
                  icon="el-icon-share"
                  status="finish"
                >
                  <div slot="title"><h3>Knowledge Graph Update</h3></div>
                </el-step>
                <el-step
                  style="color: #67c23a"
                  icon="el-icon-data-analysis"
                  status="some-status"
                >
                  <div slot="title"><h3>KG Application</h3></div>
                </el-step>
              </el-steps>
            </el-col>
            <el-col :span="2"></el-col>
          </div>
        </el-card>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="10">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-card>
                <span style="font-size: 48px" v-loading="basicStatsLoading[0]">
                  {{ basicStats.graph }}
                </span>
                <span></span>
                <div>KG Instances</div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-card>
                <span style="font-size: 40px" v-loading="basicStatsLoading[1]">
                  {{ basicStats.entityLabel }}
                </span>
                <span></span>
                <div>Entity Labels</div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card>
                <span style="font-size: 40px" v-loading="basicStatsLoading[2]">
                  {{ basicStats.relationshipLabel }}
                </span>
                <span></span>
                <div>Relation Labels</div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-card>
                <div style="display: flex; justify-content: center">
                  <div style="width: max-content">
                    <div style="text-align: left">KG includes</div>
                    <span style="vertical-align: super">over</span>
                    <span style="font-size: 40px" v-loading="basicStatsLoading[3]">
                      {{ numberInWan(basicStats.entity) }}
                    </span>
                    <div style="text-align: right">Entity Instances</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card>
                <div style="display: flex; justify-content: center">
                  <div style="width: max-content">
                    <div style="text-align: left">Entities linked by</div>
                    <span style="vertical-align: super">over</span>
                    <span style="font-size: 40px" v-loading="basicStatsLoading[4]">
                      {{ numberInWan(basicStats.relationship) }}
                    </span>
                    <div style="text-align: right">Relation Instances</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="14">
          <el-card>
            <div ref="barChart" v-loading="barLoading"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";
import { getInstanceByDom } from "echarts";

export default {
  name: "Dashboard",
  data() {
    return {
      basicStats: {
        graph: 0,
        entityLabel: 0,
        relationshipLabel: 0,
        entity: 0,
        relationship: 0,
      },
      basicStatsLoading: [false, false, false, false, false],
      barLoading: false,
    };
  },
  computed: {
    ...mapGetters(["name"]),
  },
  mounted() {
    this.getBasicStats();
    this.initBarCharts();
    this.updateBarCharts();
  },
  methods: {
    numberInWan(num) {
      if (num >= 1000) {
        return Number.parseInt(num / 1000) + "K";
      } else if (num >= 1000000) {
        return Number.parseInt(num / 1000000) + "M";
      } else {
        return num;
      }
    },
    getBasicStats() {
      // 同时发五个请求，获取五项基本数据统计，除了图谱数量以外均耗时约1.5秒
      // 分别使用不同url以避免stall
      this.basicStatsLoading = [true, true, true, true, true];
      var items = ["graph", "entityLabel", "relationshipLabel", "entity", "relationship"];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log(item);
        axios
          .get(this.$backendBaseUrl + "/kgplatform/features/getbasicstats-" + (i + 1), {
            params: {
              item: item,
            },
          })
          .then((res) => {
            let data = res.data;
            if (data.code === 200) {
              this.basicStats[item] = data.data.val;
              this.basicStatsLoading[i] = false;
              console.log(this.basicStats[item]);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    initBarCharts() {
      var echarts = require("echarts");
      let myChart = echarts.init(this.$refs.barChart, null, {
        width: "700px",
        height: "320px",
      });
      myChart.resize();
      this.barLoading = true;
    },
    updateBarCharts() {
      var that = this;
      axios
        .get(this.$backendBaseUrl + "/kgplatform/features/getstatsbygraph")
        .then(function (response) {
          console.log("barchart", response.data.data);
          if (response.data.code === 200) {
            that.barLoading = false;
            that.drawBarCharts(response.data.data);
          } else {
            console.log(data.msg);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    drawBarCharts(counts) {
      var that = this;
      var myChart = getInstanceByDom(this.$refs.barChart);
      console.log(counts);
      // 绘制图表
      myChart.setOption({
        title: {
          text: "Database Statistics",
          top: "top",
          left: "left",
        },
        tooltip: {
          trigger: "axis",
        },
        grid: {
          top: "100px",
          right: "15%",
        },
        legend: {
          top: "30px",
        },
        xAxis: {
          type: "category",
          boundaryGap: true,
          data: counts.graphNames,
          axisLabel: {
            rotate: 45,
          },
        },
        yAxis: [
          {
            type: "value",
            name: "Schema Labels",
            position: "left",
            axisLine: {
              show: true,
              lineStyle: {
                color: "#5470c6",
              },
            },
          },
          {
            type: "log",
            name: "Instances in KG",
            position: "right",
            axisLine: {
              show: true,
              lineStyle: {
                color: "#ee6666",
              },
            },
            min: 1,
          },
        ],
        aria: {
          enabled: true,
          label: {
            enabled: true,
          },
          decal: {
            show: true,
          },
        },
        series: [
          {
            name: "Schema entity labels",
            type: "bar",
            stack: "schema",
            yAxisIndex: 0,
            data: counts.entityLabelCount,
          },
          {
            name: "Schema relation labels",
            type: "bar",
            stack: "schema",
            yAxisIndex: 0,
            data: counts.relationshipLabelCount,
          },
          {
            name: "KG entity instances",
            type: "bar",
            stack: "entity",
            yAxisIndex: 1,
            data: counts.entityCount,
          },
          {
            name: "KG relation instances",
            type: "bar",
            stack: "relationship",
            yAxisIndex: 1,
            data: counts.relationshipCount,
          },
        ],
        color: ["#5470c6", "#91cc75", "#fac858", "#ee6666"],
      });
      myChart.on("click", function (params) {
        console.log(params);
        // that.showDetails(params);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
.box-card {
  width: 200px;
}

.el-row {
  margin-bottom: 5px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 4px;
  min-height: 1px;
}

.barCard {
  /* width: 100%; */
  height: 400px;
  background-color: #ffffff;
  color: rgb(0, 0, 0);
  padding: 10px;
  font-size: 25px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  text-align: center;
}
</style>
