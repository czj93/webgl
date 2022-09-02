import { Router, RouteMeta, createRouter, RouteRecordName, createWebHistory } from "vue-router";
import Layout from '../layout/index.vue'
import Home from '../views/home/index.vue'

export const routes = [
    {
        path: "/",
        name: "Home",
        component: Layout,
        redirect: '/home',
        children: [
            {
                path: "home",
                component: Home,
                meta: {
                    title: '首页'
                },
            }
        ],
    },
    {
        path: "/page",
        name: "Page",
        component: Layout,
        meta: {
            title: "Demo",
        },
        children: [
            {
                path: 'primitive',
                name: 'Primitive',
                component: () => import("../views/basic/Primitive.vue"),
                meta: {
                    title: '原始',
                },
            },
            {
                path: 'primitive-self',
                name: 'PrimitiveSelf',
                component: () => import("../views/basic/Primitive-self.vue"),
                meta: {
                    title: '原始01',
                },
            },
            {
                path: 'matrix-transform',
                name: 'Matrix',
                component: () => import('../views/matrix/Basic.vue'),
                meta: {
                    title: '矩阵-变换',
                },
            },
            {
                path: "basic",
                name: "Basic",
                component: () => import("../views/basic/index.vue"),
                meta: {
                    title: '基础Demo'
                },
            },
            {
                path: "circle",
                name: "BasicCircle",
                component: () => import("../views/basic/Circle.vue"),
                meta: {
                    title: '圆形'
                },
            },
            {
                path: "smooth-circle",
                name: "SmoothCircle",
                component: () => import("../views/basic/SmoothCircle.vue"),
                meta: {
                    title: '平滑圆形'
                },
            },
            {
                path: 'line',
                name: 'Line',
                component: () => import("../views/basic/Line.vue"),
                meta: {
                    title: '线段'
                },
            },
            {
                path: 'matrix-3d-transform',
                name: 'Matrix3dTransform',
                component: () => import('../views/matrix/3d/index.vue'),
                meta: {
                    title: '矩阵-3d变换'
                },
            },
            {
                path: 'advance/refactor',
                name: 'Refactor',
                component: () => import('../views/advance/Refactor.vue'),
                meta: {
                    title: '重构'
                },
            },
            {
                path: 'basic/cube',
                name: 'Cube',
                component: () => import('../views/basic/Cube.vue'),
                meta: {
                    title: '正方形'
                },
            },
            {
                path: 'basic/ball',
                name: 'Ball',
                component: () => import('../views/advance/Ball.vue'),
                meta: {
                    title: '球形'
                },
            },
            {
                path: 'advance/image',
                name: 'Image',
                component: () => import('../views/basic/Image.vue'),
                meta: {
                    title: '图片纹理'
                },
            },
            {
                path: 'advance/image2',
                name: 'Image2',
                component: () => import('../views/basic/Image2.vue'),
                meta: {
                    title: '多个纹理'
                },
            },
            {
                path: 'advance/multiple-things',
                name: 'MultipleThings',
                component: () => import('../views/advance/multiple-things.vue'),
                meta: {
                    title: '多个物体'
                },
            },
            {
                path: 'advance/cube-3d-texture',
                name: 'Cube3dTexture',
                component: () => import('../views/advance/Cube3dTexture.vue'),
                meta: {
                    title: '立方体-纹理'
                },
            },
            {
                path: 'lighting',
                name: 'Lighting',
                component: () => import('../views/basic/Lighting.vue'),
                meta: {
                    title: '光照-平行光'
                },
            },
            {
                path: 'lighting-point',
                name: 'LightingPoint',
                component: () => import('../views/basic/LightingPoint.vue'),
                meta: {
                    title: '光照-点光源'
                },
            },
            {
                path: 'advance/solar-system',
                name: 'SolarSystem',
                component: () => import('../views/advance/solar-system/index.vue'),
                meta: {
                    title: '场景-太阳系'
                },
            },
            {
                path: 'advance/solar-system-2',
                name: 'SolarSystem2',
                component: () => import('../views/advance/solar-system-2/index.vue'),
                meta: {
                    title: '场景-太阳系-优化'
                },
            },
            {
                path: 'advance/solar-system-3',
                name: 'SolarSystem3',
                component: () => import('../views/advance/solar-system-3/index.vue'),
                meta: {
                    title: '场景-太阳系-绕中心旋转'
                },
            },
            {
                path: 'advance/solar-system-4',
                name: 'SolarSystem4',
                component: () => import('../views/advance/solar-system-4/index.vue'),
                meta: {
                    title: '场景-太阳系-移动摄像机'
                },
            }
        ],
    },
]

export const router: Router = createRouter({
    history: createWebHistory(''),
    routes: routes,
    strict: true,
    scrollBehavior(to, from, savedPosition) {
      return new Promise(resolve => {
        if (savedPosition) {
          return savedPosition;
        } else {
          if (from.meta.saveSrollTop) {
            const top: number =
              document.documentElement.scrollTop || document.body.scrollTop;
            resolve({ left: 0, top });
          }
        }
      });
    }
  });