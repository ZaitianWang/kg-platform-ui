import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [{
      path: 'home',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard'}
    }]
  },

  {
    path: '/data',
    component: Layout,
    redirect: '/data/datasets',
    name: 'Data',
    meta: { title: 'Data Management', icon: 'el-icon-document'},
    children: [
      {
        path: 'datasets',
        name: 'Datasets',
        component: () => import('@/views/data/datasets/index'),
        meta: {title: 'Datasets Management'},
        hidden: false
      }
    ]
  },

  {
    path: '/schema',
    component: Layout,
    redirect: '/schema/overview',
    name: 'Schema',
    meta: { title: 'Schema Management', icon: 'el-icon-setting'},
    children: [
      {
        path: 'overview',
        name: 'SchemaOverview',
        component: () => import('@/views/schema/overview/index'),
        meta: { title: 'Schema Construction'},
      },
      {
        path: 'entity',
        name: 'SchemaEntity',
        component: () => import('@/views/schema/entity/index.vue'),
        meta: { title: 'Entity Label Management'},
        hidden:true
      },
      {
        path: 'relationship',
        name: 'SchemaRelationship',
        component: () => import('@/views/schema/relationship/index.vue'),
        meta: { title: 'Relationship Label Management'},
        hidden:true
      },
      {
        path: 'visualization',
        name: 'SchemaVisualization',
        component: () => import('@/views/schema/visualization/index.vue'),
        meta: { title: 'Schema Visualization'},
        hidden:true
      },
    ]
  },

  {
    path: '/knowledge-graph',
    component: Layout,
    redirect: '/knowledge-graph/overview',
    name: 'KG',
    meta: { title: 'Knowledge Graph', icon: 'el-icon-share'},
    children: [
      {
        path: 'overview',
        name: 'KGOverview',
        component: () => import('@/views/knowledge-graph/manually/overview/index'),
        meta: { title: 'KG Management'},
        hidden: false,
      },
      {
        path: 'update',
        name: 'KGUpdate',
        component: () => import('@/views/knowledge-graph/manually/update/index'),
        meta: { title: 'KG Update'},
        hidden: true,
        children: [
          {
            path: 'entity',
            name: 'KGEntity',
            component: () => import('@/views/knowledge-graph/manually/update/entity/index'),
            meta: { title: 'Entity Management'},
            hidden: true
          },
          {
            path: 'relationship',
            name: 'KGRelationship',
            component: () => import('@/views/knowledge-graph/manually/update/relationship/index'),
            meta: { title: 'Relationship Management'},
            hidden: true
          },
          {
            path: 'visualization',
            name: 'KGVisualization',
            component: () => import('@/views/knowledge-graph/manually/update/visualization/index'),
            meta: { title: 'KG Visualized Update'},
            hidden: true
          }
        ]
      },
    ]
  },
  {
    path: '/application',
    component: Layout,
    redirect: '/application/visualization',
    name: 'Application',
    meta: { title: 'Application', icon: 'el-icon-data-analysis'},
    children: [
      {
        path: 'visualization',
        name: 'Visualization',
        component: () => import('@/views/application/visualization/index'),
        meta: { title: 'KG Visualization'},
      },
      {
        path: 'retrieval',
        name: 'Retrieval',
        component: () => import('@/views/application/retrieval/index'),
        meta: { title: 'KG Query'},
      },
      {
        path: 'analysis',
        name: 'Analysis',
        component: () => import('@/views/application/analysis/index'),
        meta: { title: 'KG Analysis'},
      },
      {
        path: 'nuclearLiterature',
        name: 'NuclearLiterature',
        component: () => import('@/views/application/nuclearLiterature/index'),
        meta: { title: 'Nuclear Literature'},
        hidden: false
      },
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
