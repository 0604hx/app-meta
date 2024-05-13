import { initApp } from "./basic.main"
import BuildRouter from "./basic.router"

// import '@P/static/font-awesome/webfonts/fa-brands-400.woff2.ttf?url'
// import '@P/static/font-awesome/webfonts/fa-regular-400.woff2?url'
// import '@P/static/font-awesome/webfonts/fa-solid-900.ttf?url'
// import '@P/static/font-awesome/css/fontawesome.min.css?url'
// import '@P/static/font-awesome/css/brands.min.css?url'
// import '@P/static/font-awesome/css/solid.min.css?url'
// import '@P/static/font-awesome/css/regular.min.css?url'

import Main from "@V/Main.vue"

import Tag from "@C/custom/tag.vue"

import BasicEditorView from "@V/快应用/Editor.vue"
import PureRender from "@V/PureRender.vue"

import "@S/FastApp"
import { defaultRoute, loadCommonData } from "@S/Auth"

window.__META__ = _VERSION_                                     //应用版本号
window.isClient = !!window.META                                 //是否为客户端运行（exe）
window.isPC     = true                                          //标识当前资源环境为 PC 网页环境（区别于移动端）
window.CHANNEL  = window.isClient?"client":"browser"            //渠道信息

let blankRoutes = [
    { path: '/login', name: 'login', component: () => import('@V/登录/Login.vue') },
    { path: '/logout', name: 'logout', component: () => import('@V/登录/Logout.vue') },
    { path: '/login-cas', name: 'login-cas', component: () => import('@V/登录/Login-cas.vue') },

    // 中转车站
    { path: defaultRoute, name:'welcome', component: () => import('@V/welcome.vue') },
    {
        path:"/app-pure",
        component: PureRender,
        children:[
            { path: '/app-pure/:aid/:pid', name: 'app-pure-view', component: () => import('@V/快应用/ViewWithViewer.vue') }
        ]
    }
]

// 仅当测试环境才加载 demo、实验室功能等页面
if(process.env.NODE_ENV==='test'){
    blankRoutes.push(
        { path: '/demo/excel', name: 'demo-excel', component: () => import('@V/快应用/在线Excel/Demo.vue') },
        { path: '/lab-func/sfc-loader', name: 'lab-sfc', component: () => import('@V/@LAB-FUNC/sfc-loader.vue') },
        { path: '/lab-func/md-mermaid', name: 'lab-md', component: () => import('@V/@LAB-FUNC/md-mermaid.vue') },
        { path: '/demo', name: 'demo', component: () => import('@V/Demo.vue') }
    )
}

let router = BuildRouter(
    Main,
    {
        homePage: defaultRoute,
        mainRoutes: [
            { path: '/home', name: 'home-v1',meta:{title:"首页"}, component: () => import('@V/首页/Home.vue') },
            /**2024年新版首页 */
            { path: '/home-v2', name: 'home',meta:{title:"首页"}, component: () => import('@V/首页/Home.v2.vue') },

            { path: '/app/mine', name: 'app-mine', meta:{title:"我的应用"}, component: () => import('@V/应用维护/Mine.vue') },

            { path: '/app/home', name: 'app-home', meta:{title:"应用管理"}, component: () => import('@V/应用维护/Index.vue') },
            { path: '/app/edit', name: 'app-edit', meta:{title:"应用信息维护"}, component: () => import('@V/应用维护/Edit.vue') },
            { path: '/app/data/:id', name: 'app-data', meta:{title:"应用数据库维护"}, component: () => import('@V/应用维护/Data.vue') },

            { path: '/app/page/:id', name: 'app-page', meta:{title:"应用页面管理"}, component: () => import('@V/快应用/Manage.vue') },
            // { path: '/app/form/:id', name: 'app-form', meta:{title:"应用表单维护"}, component: () => import('@V/应用维护/Form.vue') },
            { path: '/app/form/designer', name: 'app-form-designer', meta:{title:"应用表单设计"}, component: () => import('@V/应用维护/演示/表单设计器.vue') },
            { path: '/app/form/render', name: 'app-form-render', meta:{title:"应用表单渲染"}, component: () => import('@V/应用维护/演示/表单渲染器.vue') },

            /**个人中心 */
            { path: '/mine/link', name: 'mine-link', meta:{title:"关注管理"}, component: () => import('@V/个人中心/我的关注.vue') },
            { path: '/mine/edit', name: 'mine-edit', meta:{title:"我维护的功能页"}, component: () => import('@V/个人中心/我的维护.vue') },

            /**其他页面 */
            { path: '/other/about', name: 'o-about', meta:{title:"关于"}, component: () => import('@V/其他/About.vue') },

            /**数据开放接口 */
            { path: '/api/manage', name: 'api', meta:{title:"开放接口管理"}, component: () => import('@V/开放接口/Index.vue') },

            /**数据库在线管理 */
            { path: '/dbm/source', name: 'dbm-source', meta:{title:"数据源"}, component: () => import('@V/dbm/数据源.vue') },

            /**系统相关 */
            { path: '/system/dashboard', name: 'sys-dashboard', meta:{title:"数据总览"}, component: () => import('@V/系统管理/Dashboard.vue') },
            { path: '/system/ui', name: 'sys-ui', meta:{title:"前端资源更新"}, component: () => import('@V/系统管理/UI.vue') },
            { path: '/system/setting', name: 'sys-setting', meta:{title:"系统设置"}, component: () => import('@V/系统管理/Setting.vue') },
            { path: '/system/notice', name: 'sys-notice', meta:{title:"系统公告"}, component: () => import('@V/系统管理/Notice.vue') },
            { path: '/system/page/link', name: 'sys-page-link', meta:{title:"页面关注维护"}, component: () => import('@V/系统管理/PageLink.vue') },
            { path: '/system/account', name: 'sys-account', meta:{title:"用户管理"}, component: () => import('@V/系统管理/组织/Account.vue') },
            { path: '/system/terminal', name: 'sys-terminal', meta:{title:"后端服务管理"}, component: () => import('@V/系统管理/后端服务/Index.vue') },
            { path: '/system/member', name: 'sys-member', meta:{title:"会员终端管理"}, component: () => import('@V/系统管理/会员终端/Index.vue') },
        ],
        customRoutes: [
            // 快应用页面编辑，路由容器为 BasicEditor.vue （方便添加统一操作）
            {
                path: '',
                component: BasicEditorView,
                children:  [
                    //快应用页面编辑
                    { path: '/app/:aid/form/:id', name: 'app-page-form', meta:{title:"表单维护·应用页面"}, component: () => import('@V/快应用/表单页/Editor.vue') },
                    { path: '/app/:aid/markdown/:id', name: 'app-page-markdown', meta:{title:"文档维护·应用页面"}, component: () => import('@V/快应用/文档页/Editor.vue') },
                    { path: '/app/:aid/table/:id', name: 'app-page-table', meta:{title:"表格维护·应用页面"  }, component: () => import('@V/快应用/数据表格/Editor.vue') },
                    { path: '/app/:aid/wenjuan/:id', name: 'app-page-wenjuan', meta:{title:"问卷维护·应用页面"  }, component: () => import('@V/快应用/问卷/Index.vue') },
                    { path: '/app/:aid/data/:id', name: 'app-page-data', meta:{title:"数据分发维护·应用页面"  }, component: () => import('@V/快应用/数据分发/Editor.vue') },
                    { path: '/app/:aid/import/:id', name: 'app-page-import', meta:{title:"数据维护·应用页面"  }, component: () => import('@V/快应用/数据维护/Editor.vue') },
                    { path: '/app/:aid/chart/:id', name: 'app-page-chart', meta:{title:"统计图表维护·应用页面"  }, component: () => import('@V/快应用/统计图表/Editor.vue') },
                    { path: '/app/:aid/robot/:id', name: 'app-page-robot', meta:{title:"网页机器人·应用页面"  }, component: () => import('@V/快应用/网页机器人/Editor.vue') },
                    { path: '/app/:aid/sfc/:id', name: 'app-page-sfc', meta:{title:"SFC维护·应用页面"  }, component: () => import('@V/快应用/SFC/Editor.vue') },
                    { path: '/app/:aid/h5/:id', name: 'app-page-h5', meta:{title:"小程序维护·应用页面"  }, component: () => import('@V/快应用/小程序/Editor.vue') },
                    { path: '/app/:aid/faas/:id', name: 'app-page-faas', meta:{title:"FaaS函数维护·应用页面"  }, component: () => import('@V/快应用/FAAS/Editor.vue') },
                    { path: '/app/:aid/server/:id', name: 'app-page-server', meta:{title:"后端服务维护·应用页面"  }, component: () => import('@V/快应用/后端服务/Index.vue') },
                ]
            }
        ],
        windowRoutes: [
            /**
             * 运行应用/页面
             *
             * 由于 /app/:aid/ 无法正常匹配到 name=app-view 的路由（:pid 不能传空），所以新增 name=app-view-index 的路由
             */
            //指定了具体页面ID
            // { path: '/app/:aid/:pid', name: 'app-view', component: () => import('@V/快应用/View.vue') },
            { path: '/app/:aid/:pid', name: 'app-view', component: () => import('@V/快应用/ViewWithViewer.vue') },
            //未指定页面ID，在 View 视图中自定计算
            { path: '/app/:aid', name: 'app-view-index', component: () => import('@V/快应用/ViewWithViewer.vue') },

            /**数据库在线管理 */
            { path: '/dbm/view/:id', name: 'dbm-view', meta:{}, component: () => import('@V/dbm/管理面板.vue') },
            { path: '/dbm/log/:id', name: 'dbm-log', meta:{}, component: () => import('@V/dbm/操作日志.vue') },

            { path: '/home/custom', name: 'home-custom', meta:{}, component: () => import('@V/首页/自助配置.vue') },
        ],
        blankRoutes
    }
)

/**
 * 引入 Vant4
 */
// import vant from 'vant'
// import 'vant/lib/index.css'

const afterInit = app=> {
    app.component("Tag", Tag)
    // app.use(vant)
}

// test 模式下，通常不需要后端服务的支持
if(process.env.NODE_ENV==='test'){
    initApp(router).then(afterInit)
}
else {
    loadCommonData().then(d=>{
        if(d && d.success===true){
            let { settings, user } = d.data
            initApp(router, settings||{}, user).then(afterInit)
        }
        else{
            alert(`很遗憾，平台出错：\n${d?.message}\n\n请联系管理员或技术人员`)
        }
    })
}

/**
 * 去除谷歌的touch事件警告
 *
 * 代码来源如下
 * https://stackoverflow.com/questions/46094912/added-non-passive-event-listener-to-a-scroll-blocking-touchstart-event
 */
function nonPassiveEvent(){
    if (typeof EventTarget !== "undefined") {
        let func = EventTarget.prototype.addEventListener
        EventTarget.prototype.addEventListener = function (type, fn, capture) {
            this.func = func
            if (typeof capture !== "boolean") {
                capture = capture || {}
                capture.passive = false
            }
            this.func(type, fn, capture);
        }
    }
}
nonPassiveEvent()
