<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <h2 style="text-align: center">Nuclear Literature Discovery</h2>
        <el-form :inline="true" style="text-align: center">
          <el-form-item>
            <el-input v-model="input" placeholder="please input">
              <template slot="prepend">Keyword</template>
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="discover(input)"
              ></el-button>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col>
          <el-card>
            <span>
              <b><big>Current Keyword: </big>{{ keyword }}</b>
            </span>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="12">
          <el-row>
            <div>
              <el-row :gutter="10" style="margin-bottom: 20px; height: 120px">
                <el-col :span="6">
                  <el-card>
                    <div slot="header">
                      <span><small>Articles</small></span>
                    </div>
                    <div>{{ articleCount }}</div>
                  </el-card></el-col
                >
                <el-col :span="6">
                  <el-card>
                    <div slot="header">
                      <span><small>Related Entities</small></span>
                    </div>
                    <div>{{ entityCount }}</div>
                  </el-card>
                </el-col>
                <el-col :span="6">
                  <el-card>
                    <div slot="header">
                      <span><small>Related Triples</small></span>
                    </div>
                    <div>{{ tripleCount }}</div>
                  </el-card>
                </el-col>
                <el-col :span="6">
                  <el-card>
                    <div slot="header">
                      <span><small>Countries</small></span>
                    </div>
                    <div>{{ countryCount }}</div>
                  </el-card>
                </el-col>
              </el-row>
              <el-row>
                <div class="lineCard" ref="lineChart"></div>
              </el-row>
            </div>
          </el-row>
        </el-col>
        <el-col :span="12">
          <div class="graphCard" ref="graphChart"></div>
        </el-col>
      </el-row>
      <el-row>
        <el-card>
          <div slot="header"><span>Related Articles</span></div>
          <div>
            <el-collapse v-model="activeNames" style="width: 60%">
              <div v-for="(article, index) in articles" :key="index">
                <el-collapse-item :name="index">
                  <template slot="title">
                    <h3>{{ article.name }}</h3>
                  </template>
                  <template slot="name">index</template>
                  <div>Author: {{ article.author }}</div>
                  <div>Publish Year: {{ article.publicTime }}</div>
                  <div>
                    Keywords:
                    <span v-for="k in article.keywords" style="padding: 0px 5px">
                      <el-link type="info" @click="discover(k)">
                        {{ k }}
                      </el-link>
                    </span>
                  </div>
                  <div style="width: 90%">Abstract: {{ article.abstract }}</div>
                  <el-carousel
                    :autoplay="false"
                    type="card"
                    height="200px"
                    style="width: 90%"
                  >
                    <el-carousel-item v-for="item in 6" :key="item">
                      <h3 class="medium">fig-{{ item }}</h3>
                    </el-carousel-item>
                  </el-carousel>
                  <div>
                    <el-button type="primary" size="small">Read</el-button>
                    <el-button type="success" size="small">Download</el-button>
                    <el-button type="info" size="small">Cite</el-button>
                  </div>
                </el-collapse-item>
              </div>
            </el-collapse>
          </div>
        </el-card>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import axios from "axios";
import { getInstanceByDom } from "echarts";
export default {
  data() {
    return {
      input: "",
      keyword: "军备竞赛",
      articleCount: 0,
      entityCount: 0,
      tripleCount: 0,
      countryCount: 0,
      articles: [],
      activeNames: [0, 1, 2, 3, 4],
    };
  },
  mounted() {
    this.analyzeStats();
    this.initGraphCharts();
    this.updateGraphCharts();
    this.initLineCharts();
    this.updateLineCharts();
    this.loadArticles();
  },
  methods: {
    discover(input) {
      this.keyword = input;
      this.analyzeStats();
      this.updateGraphCharts();
      this.updateLineCharts();
      this.loadArticles();
      this.input = "";
    },
    analyzeStats() {
      axios
        .get(this.$backendBaseUrl + "/kgplatform/nuclear/getgraphstats", {
          params: {
            keyword: this.keyword,
          },
        })
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.articleCount = data.data.articleCount;
            this.countryCount = data.data.countryCount;
            this.entityCount = data.data.entityCount;
            this.tripleCount = data.data.tripleCount;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    initGraphCharts() {
      var echarts = require("echarts");
      let myChart = echarts.init(this.$refs.graphChart, null, {
        width: "560px",
        height: "500px",
      });
      myChart.resize();
    },
    updateGraphCharts() {
      var that = this;
      axios
        .get(this.$backendBaseUrl + "/kgplatform/nuclear/getsubgraph", {
          params: {
            keyword: this.keyword,
          },
        })
        .then(function (response) {
          console.log(response.data.data);
          if (response.data.code === 200) {
            that.drawGraphCharts(response.data.data);
          } else {
            console.log(data.msg);
            that.drawGraphCharts({
              nodes: [
                { name: "weapon", properties: [], labelType: "node", category: 0 },
                { name: "country", properties: [], labelType: "node", category: 1 },
              ],
              edges: [
                {
                  labelNaame: "has",
                  label: {
                    show: true,
                    formatter: "has",
                  },
                  properties: [],
                  source: "country",
                  target: "weapon",
                  labelType: "edge",
                },
              ],
            });
          }
        })
        .catch(function (error) {
          console.log(error);
          that.drawGraphCharts({
            nodes: [
              { name: "weapon", properties: [], labelType: "node", category: 0 },
              { name: "country", properties: [], labelType: "node", category: 1 },
            ],
            edges: [
              {
                labelNaame: "has",
                label: {
                  show: true,
                  formatter: "has",
                },
                properties: [],
                source: "country",
                target: "weapon",
                labelType: "edge",
              },
            ],
          });
        });
    },
    drawGraphCharts(graph) {
      var that = this;
      var myChart = getInstanceByDom(this.$refs.graphChart);
      // 绘制图表
      myChart.setOption({
        title: {
          text: "KG Visualization",
          top: "top",
          left: "left",
        },
        legend: {
          // selectedMode: 'single',
          data: graph.categories.map(function (a) {
            return a.name;
          }),
          bottom: "0%",
        },
        tooltip: {
          // formatter: "{b}",
          formatter: (params) => {
            if (params.data.label == "文献关键词") {
              return "Click to jump to keyword: " + params.data.rawName;
            } else if (params.data.label == "文献") {
              return "Click to view Article: " + params.data.rawName;
            }
          },
        },
        series: [
          {
            type: "graph",
            layout: "force",
            force: {
              // 待调试改进，可做成根据数量变化
              edgeLength: 50,
              repulsion: 500,
              gravity: 0.3,
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
            autoCurveness: true,
            nodes: graph.nodes,
            edges: graph.edges,
            categories: graph.categories,
          },
        ],
      });
      myChart.off("click");
      myChart.on("click", function (params) {
        console.log(params);
        if (params.data.label == "文献关键词") {
          that.discover(params.data.rawName);
        } else if (params.data.label == "文献") {
          window.open("https://cn.bing.com/search?q=" + params.data.rawName);
        }
      });
    },
    initLineCharts() {
      var echarts = require("echarts");
      let myChart = echarts.init(this.$refs.lineChart, null, {
        width: "600px",
        height: "360px",
      });
      myChart.resize();
    },
    updateLineCharts() {
      var that = this;
      axios
        .get(this.$backendBaseUrl + "/kgplatform/nuclear/getarticlecountovertheyears", {
          params: {
            keyword: this.keyword,
          },
        })
        .then(function (response) {
          console.log("linechart", response.data.data);
          if (response.data.code === 200) {
            that.drawLineCharts(response.data.data);
          } else {
            console.log(data.msg);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    drawLineCharts(yearsCount) {
      var that = this;
      var myChart = getInstanceByDom(this.$refs.lineChart);
      console.log(yearsCount);
      // 绘制图表
      myChart.setOption({
        title: {
          text: "Number of Articles Over The Years",
          top: "top",
          left: "left",
        },
        tooltip: {
          trigger: "axis",
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: Object.keys(yearsCount),
          // data: ["2016", "2017", "2018", "2019", "2020", "2021", "2022"],
        },
        yAxis: {
          type: "value",
          minInterval: 1,
        },
        series: [
          {
            name: "Articles in this library",
            type: "line",
            stack: "Total",
            data: Object.values(yearsCount),
            // data: [120, 132, 101, 134, 90, 230, 144],
          },
        ],
      });
      myChart.on("click", function (params) {
        console.log(params);
        // that.showDetails(params);
      });
    },
    loadArticles() {
      console.log(this.keyword);
      axios
        .get(this.$backendBaseUrl + "/kgplatform/nuclear/getarticles", {
          params: {
            keyword: this.keyword,
          },
        })
        .then((res) => {
          let data = res.data;
          if (data.code === 200) {
            this.articles = data.data;
            console.log(this.articles);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>

<style>
.graphCard {
  /* width: 100%; */
  height: 540px;
  background-color: #ffffff;
  color: rgb(0, 0, 0);
  padding: 10px;
  font-size: 25px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  text-align: center;
}
.lineCard {
  /* width: 100%; */
  height: 400px;
  background-color: #ffffff;
  color: rgb(0, 0, 0);
  padding: 10px;
  font-size: 25px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  text-align: center;
}
.el-carousel__item h3 {
  color: #475669;
  font-size: 14px;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>
