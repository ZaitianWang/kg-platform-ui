<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <h2 style="text-align: center">Knowledge Graph Analysis</h2>
        <el-form :inline="true" style="text-align: center">
          <el-form-item>
            <el-select size="small" v-model="graphName" placeholder="please select">
              <el-option
                v-for="item in candidateGraphs"
                :key="item.name"
                :label="item.name"
                :value="item.name"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <el-row :gutter="20">
        <!-- an el-col with span 8 -->
        <el-col :span="10">
          <!-- two cards side by side that display entity count and triple count -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card style="height: 210px" v-loading="entityCountLoading">
                <div slot="header">
                  <h3 style="text-align: center">Entity Count</h3>
                </div>
                <div style="text-align: center">
                  <span style="font-weight: 700; font-size: 48px">{{ entityCount }}</span>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card style="height: 210px" v-loading="tripleCountLoading">
                <div slot="header">
                  <h3 style="text-align: center">Triple Count</h3>
                </div>
                <div style="text-align: center">
                  <span style="font-weight: 700; font-size: 48px">{{ tripleCount }}</span>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-col>
        <!-- an el-col with span 16 that contains a div with ref nodeBarChart and edgeBarChart-->
        <el-col :span="14">
          <el-row
            style="background-color: #f0f0f0; padding: 10px 0 0 0; border-radius: 4px"
            v-loading="pieLoading"
          >
            <!-- two even cols -->
            <el-col :span="12">
              <div ref="nodePieChart"></div>
            </el-col>
            <el-col :span="12">
              <div ref="edgePieChart"></div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="16">
          <div
            style="
              height: 500px;
              display: flex;
              justify-content: center;
              align-items: center;
              border-radius: 4px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 6px rgba(0, 0, 0, 0.1);
            "
            ref="cloud"
            v-loading="cloudLoading"
          ></div>
        </el-col>
        <el-col :span="8">
          <el-tabs type="border-card" v-loading="rankLoading">
            <el-tab-pane label="Outgoing Degree">
              <el-table :data="outRank" height="430" style="width: 100%">
                <el-table-column
                  type="index"
                  label="Ranking"
                  width="80"
                ></el-table-column>
                <el-table-column
                  prop="name"
                  label="Entity Name"
                  width="200"
                ></el-table-column>
                <el-table-column
                  prop="degree"
                  label="Degree"
                  width="80"
                ></el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="Incoming Degree">
              <el-table :data="inRank" height="430" style="width: 100%">
                <el-table-column
                  type="index"
                  label="Ranking"
                  width="80"
                ></el-table-column>
                <el-table-column
                  prop="name"
                  label="Entity Name"
                  width="200"
                ></el-table-column>
                <el-table-column
                  prop="degree"
                  label="Degree"
                  width="80"
                ></el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script>
import axios from "axios";
import { getInstanceByDom } from "echarts";
import * as echarts from "echarts";
import "echarts-wordcloud";
export default {
  data() {
    return {
      input: "",
      graphName: "",
      entityCount: 0,
      tripleCount: 0,
      nodeLabelDistribution: [],
      edgeLabelDistribution: [],
      outRank: [],
      inRank: [],
      degreeRank: [],
      candidateGraphs: [],
      entityCountLoading: false,
      tripleCountLoading: false,
      pieLoading: false,
      cloudLoading: false,
      rankLoading: false,
    };
  },
  watch: {
    graphName() {
      this.analyze();
    },
  },
  mounted() {
    this.getGraphs();
    this.initPieCharts();
    this.initWordCloud();
  },
  methods: {
    getGraphs() {
      var that = this;
      axios
        .get(that.$backendBaseUrl + "/kgplatform/kgvisualize/listsubgraph")
        .then(function (response) {
          console.log(response);
          if (response.data.code === 200) {
            that.candidateGraphs = response.data.data;
          } else {
            console.log(data.msg);
            that.candidateGraphs = [{ name: "test1" }, { name: "test2" }];
          }
        })
        .catch(function (error) {
          console.log(error);
          that.candidateGraphs = [{ name: "test1" }, { name: "test2" }];
        });
    },
    analyze() {
      console.log("analyze");
      this.entityCountLoading = true;
      this.tripleCountLoading = true;
      this.pieLoading = true;
      this.cloudLoading = true;
      this.rankLoading = true;
      this.getInstanceCount();
      this.getDistribution();
      this.getNodeRank();
    },
    getInstanceCount() {
      var that = this;
      axios
        .get(this.$backendBaseUrl + "/kgplatform/features/getinstancecount", {
          params: {
            graph: this.graphName,
          },
        })
        .then(function (response) {
          console.log(response);
          if (response.data.code === 200) {
            that.entityCount = response.data.data.entityCount;
            that.tripleCount = response.data.data.tripleCount;
            that.entityCountLoading = false;
            that.tripleCountLoading = false;
          } else {
            console.log(data.msg);
            // 用于应对服务器故障
            that.entityCount = Math.round(Math.random() * 10000);
            that.tripleCount = Math.round(Math.random() * 10000);
            that.entityCountLoading = false;
            that.tripleCountLoading = false;
          }
        })
        .catch(function (error) {
          console.log(error);
          // 用于应对服务器故障
          that.entityCount = Math.round(Math.random() * 10000);
          that.tripleCount = Math.round(Math.random() * 10000);
          that.entityCountLoading = false;
          that.tripleCountLoading = false;
        });
    },
    getDistribution() {
      var that = this;
      axios
        .get(this.$backendBaseUrl + "/kgplatform/features/getlabeldistribution", {
          params: {
            graph: this.graphName,
          },
        })
        .then(function (response) {
          console.log(response);
          if (response.data.code === 200) {
            that.drawPieCharts(
              that.getNodeDistribution(response.data.data.nodeDistribution),
              that.getEdgeDistribution(response.data.data.edgeDistribution)
            );
          } else {
            console.log(data.msg);
            that.drawPieCharts(
              that.getNodeDistribution(that.getNodeDistFromLocal()),
              that.getEdgeDistribution(that.getEdgeDistFromLocal())
            );
          }
        })
        .catch(function (error) {
          console.log(error);
          that.drawPieCharts(
            that.getNodeDistribution(that.getNodeDistFromLocal()),
            that.getEdgeDistribution(that.getEdgeDistFromLocal())
          );
        });
    },
    getNodeRank() {
      var that = this;
      axios
        .get(this.$backendBaseUrl + "/kgplatform/features/getnoderank", {
          params: {
            graph: this.graphName,
          },
        })
        .then(function (response) {
          console.log(response);
          if (response.data.code === 200) {
            that.outRank = that.getOutRank(response.data.data.outRank);
            that.inRank = that.getInRank(response.data.data.inRank);
            that.drawWordCloud(that.getEntityWithDegree(response.data.data.biRank));
            that.rankLoading = false;
          } else {
            console.log(data.msg);
            that.outRank = that.getOutRank(that.getDegreeFromLocal());
            that.inRank = that.getInRank(that.getDegreeFromLocal());
            that.drawWordCloud(that.getEntityWithDegree(that.getDegreeFromLocal()));
            that.rankLoading = false;
          }
        })
        .catch(function (error) {
          console.log(error);
          that.outRank = that.getOutRank(that.getDegreeFromLocal());
          that.inRank = that.getInRank(that.getDegreeFromLocal());
          that.drawWordCloud(that.getEntityWithDegree(that.getDegreeFromLocal()));
          that.rankLoading = false;
        });
    },
    initWordCloud() {
      let myChart = echarts.init(this.$refs.cloud, null, {
        width: 800,
        height: 500,
      });
      myChart.resize();
    },
    drawWordCloud(data) {
      var that = this;
      var chart = getInstanceByDom(this.$refs.cloud);
      chart.setOption({
        title: {
          text: "KG Hot Words",
          subtext: "Based on Degree Centrality",
          left: 20,
          top: 20,
        },
        aria: {
          enabled: true,
          label: {
            enabled: true,
          },
          decal: {
            show: false,
          },
        },
        series: [
          {
            type: "wordCloud",

            // The shape of the "cloud" to draw. Can be any polar equation represented as a
            // callback function, or a keyword present. Available presents are circle (default),
            // cardioid (apple or heart shape curve, the most known polar equation), diamond (
            // alias of square), triangle-forward, triangle, (alias of triangle-upright, pentagon, and star.

            shape: "circle",

            // Keep aspect ratio of maskImage or 1:1 for shapes
            // This option is supported since echarts-wordcloud@2.1.0
            keepAspect: false,

            // A silhouette image which the white area will be excluded from drawing texts.
            // The shape option will continue to apply as the shape of the cloud to grow.

            // maskImage: maskImage,

            // Folllowing left/top/width/height/right/bottom are used for positioning the word cloud
            // Default to be put in the center and has 75% x 80% size.

            left: "center",
            top: "center",
            width: "80%",
            height: "85%",
            right: "center",
            bottom: "center",

            // Text size range which the value in data will be mapped to.
            // Default to have minimum 12px and maximum 60px size.

            sizeRange: [12, 60],

            // Text rotation range and step in degree. Text will be rotated randomly in range [-90, 90] by rotationStep 45

            // rotationRange: [-90, 90],
            // rotationStep: 45,
            rotationRange: [-0, 0],
            // rotationStep: 45,

            // size of the grid in pixels for marking the availability of the canvas
            // the larger the grid size, the bigger the gap between words.

            gridSize: 8,

            // set to true to allow word to be drawn partly outside of the canvas.
            // Allow word bigger than the size of the canvas to be drawn
            // This option is supported since echarts-wordcloud@2.1.0
            drawOutOfBound: false,

            // if the font size is too large for the text to be displayed,
            // whether to shrink the text. If it is set to false, the text will
            // not be rendered. If it is set to true, the text will be shrinked.
            // This option is supported since echarts-wordcloud@2.1.0
            shrinkToFit: false,

            // If perform layout animation.
            // NOTE disable it will lead to UI blocking when there is lots of words.
            layoutAnimation: true,

            // Global text style
            textStyle: {
              fontFamily: "sans-serif",
              fontWeight: "bold",
              // Color can be a callback function or a color string
              color: function () {
                // Random color
                return (
                  "rgb(" +
                  [
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160),
                  ].join(",") +
                  ")"
                );
              },
            },
            emphasis: {
              focus: "self",
              textStyle: {
                textShadowBlur: 10,
                textShadowColor: "#333",
              },
            },
            // Data is an array. Each array item must have name and value property.
            data: data,
          },
        ],
      });
      this.cloudLoading = false;
    },
    // init node pie chart and edge pie chart respectively, using get by ref
    initPieCharts() {
      var echarts = require("echarts");
      let nodePieChart = echarts.init(this.$refs.nodePieChart, null, {
        width: 350,
        height: 200,
      });
      let edgePieChart = echarts.init(this.$refs.edgePieChart, null, {
        width: 350,
        height: 200,
      });
      nodePieChart.resize();
      edgePieChart.resize();
    },
    drawPieCharts(nodeData, edgeData) {
      let nodePieChart = getInstanceByDom(this.$refs.nodePieChart);
      let edgePieChart = getInstanceByDom(this.$refs.edgePieChart);
      nodePieChart.setOption({
        title: {
          text: "Entity Distribution",
          left: "90",
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} ({d}%)",
        },
        legend: {
          orient: "vertical",
          top: "20px",
          right: 10,
          data: nodeData.map(function (a) {
            return a.name;
          }),
        },
        aria: {
          enabled: true,
          label: {
            enabled: true,
            general: {
              withTitle: "This is a chart about {title}",
            },
            series: {
              single: {
                withName: " with type {seriesType} named {seriesName}.",
              },
            },
            data: {
              allData: "whose data is --",
              withName: "The data for {name} is {value}",
            },
          },
          decal: {
            show: true,
          },
        },
        series: [
          {
            name: "Entity type",
            type: "pie",
            radius: ["50%", "70%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 5,
              borderColor: "#f0f0f0",
              borderWidth: 2,
            },
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: "30",
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            left: -80,
            data: nodeData,
          },
        ],
      });
      edgePieChart.setOption({
        title: {
          text: "Relation Distribution",
          left: "90",
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} ({d}%)",
        },
        legend: {
          orient: "vertical",
          top: "20px",
          right: 10,
          data: edgeData.map(function (a) {
            return a.name;
          }),
        },
        aria: {
          enabled: true,
          label: {
            enabled: true,
            general: {
              withTitle: "This is a chart about {title}",
            },
            series: {
              single: {
                withName: " with type {seriesType} named {seriesName}.",
              },
            },
            data: {
              allData: "whose data is --",
              withName: "The data for {name} is {value}",
            },
          },
          decal: {
            show: true,
          },
        },
        series: [
          {
            name: "Relation type",
            type: "pie",
            minAngle: 5,
            radius: ["50%", "70%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 5,
              borderColor: "#f0f0f0",
              borderWidth: 2,
            },
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: "30",
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            left: -80,
            data: edgeData,
          },
        ],
      });
      this.pieLoading = false;
    },
    getNodeDistribution(distribution) {
      let fullNodeDist = distribution
        .map(function (a) {
          return {
            name: Object.keys(a)[0],
            value: Object.values(a)[0],
          };
        })
        .sort((a, b) => b.value - a.value);
      let head = fullNodeDist.slice(0, 5);
      let tail = fullNodeDist.slice(5);
      let tailSum = tail.reduce((a, b) => a + b.value, 0);
      head.push({ name: "Others", value: tailSum });
      return head.sort((a, b) => b.value - a.value);
    },
    getEdgeDistribution(distribution) {
      let fullEdgeDist = distribution
        .map(function (a) {
          return {
            name: Object.keys(a)[0],
            value: Object.values(a)[0],
          };
        })
        .sort((a, b) => b.value - a.value);
      let head = fullEdgeDist.slice(0, 5);
      let tail = fullEdgeDist.slice(5);
      let tailSum = tail.reduce((a, b) => a + b.value, 0);
      head.push({ name: "Others", value: tailSum });
      return head.sort((a, b) => b.value - a.value);
    },
    getEntityWithDegree(degree) {
      return degree.map(function (a) {
        return {
          name: a.name,
          value: a.degree,
        };
      });
    },
    getOutRank(degree) {
      return degree
        .sort((a, b) => b.degree - a.degree)
        .filter((item, index) => index < 8);
    },
    getInRank(degree) {
      return degree
        .sort((a, b) => b.degree - a.degree)
        .filter((item, index) => index < 8);
    },
    getDegreeFromLocal() {
      return [
        {
          name: "Afghanistan",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Bahamas, The",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Cabo Verde",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Denmark",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Ecuador",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Falkland Islands",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Gabon",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Haiti",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Iceland",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Jamaica",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Kazakhstan",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Laos",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Macau",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Namibia",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Oman",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Pakistan",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Qatar",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Romania",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Saint Barthelemy",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Tahiti",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Uganda",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Vanuatu",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Wake Island",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Yemen",
          degree: Math.round(Math.random() * 100),
        },
        {
          name: "Zambia",
          degree: Math.round(Math.random() * 100),
        },
      ];
    },
    getNodeDistFromLocal() {
      return [
        { 文献: Math.round(Math.random() * 100) },
        { 关键词: Math.round(Math.random() * 100) },
        { 作者: Math.round(Math.random() * 100) },
        { 国家: Math.round(Math.random() * 100) },
        { 机构: Math.round(Math.random() * 100) },
        { 学科: Math.round(Math.random() * 100) },
        { 期刊: Math.round(Math.random() * 100) },
        { 会议: Math.round(Math.random() * 100) },
        { 专利: Math.round(Math.random() * 100) },
        { 项目: Math.round(Math.random() * 100) },
      ];
    },
    getEdgeDistFromLocal() {
      return [
        { 合作: Math.round(Math.random() * 100) },
        { 发表: Math.round(Math.random() * 100) },
        { 就职: Math.round(Math.random() * 100) },
        { 领域: Math.round(Math.random() * 100) },
        { 位于: Math.round(Math.random() * 100) },
        { 发起: Math.round(Math.random() * 100) },
        { 申请: Math.round(Math.random() * 100) },
        { 获得: Math.round(Math.random() * 100) },
        { 任职: Math.round(Math.random() * 100) },
        { 任教: Math.round(Math.random() * 100) },
      ];
    },
  },
};
</script>
<style lang="scss" scoped>
.el-row {
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
}

.el-col {
  border-radius: 4px;
  min-height: 1px;
}
</style>
