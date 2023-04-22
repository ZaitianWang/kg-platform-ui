<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <el-page-header @back="goBack" :content="getGraphName()"></el-page-header>
      </div>
      <el-tabs v-model="activeName">
        <el-tab-pane label="Entity Management" name="Entity"><Entity /></el-tab-pane>
        <el-tab-pane label="Relationship Management" name="Relationship"
          ><Relationship
        /></el-tab-pane>
        <el-tab-pane label="Visualization" name="Visualization"
          ><Visualization
        /></el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import Entity from "@/views/knowledge-graph/manually/update/entity/index.vue";
import Relationship from "@/views/knowledge-graph/manually/update/relationship/index.vue";
import Visualization from "@/views/knowledge-graph/manually/update/visualization/index.vue";

export default {
  data() {
    return {
      activeName: "Entity",
      loading: true,
    };
  },
  methods: {
    goBack() {
      console.log("go back");
      this.$router.push("/knowledge-graph/overview/");
    },
    getGraphName() {
      return this.$route.query.name + " | KG Update - " + this.activeName;
    },
  },
  components: { Entity, Relationship, Visualization },
  mounted() {},
};
</script>
