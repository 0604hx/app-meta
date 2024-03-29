import { ref, onMounted,onUnmounted, h } from 'vue'
import { useRoute } from 'vue-router'
import { Table, ChartPie, Wpforms, Html5, ListAltRegular, Database, Tools, ExclamationTriangle, Server, Robot, FileWordRegular as DOC, Vuejs, Code } from "@vicons/fa"

import ChooseSFCUI from './SFC/choose-sfc-ui.vue'

const INPUT     = "primary"
const OUTPUT    = "info"
const MIX       = "warning"

/**
 * @typedef {Object} TemplateItem
 * @property {String} id - 模板编号
 * @property {String} text - 模板中文名称
 * @property {String} theme - 类型
 * @property {Object} icon - 图标
 * @property {String} summary - 描述信息
 * @property {Function} onCreate - 新建模板的处理函数（用于自定义页面对象）
 */

export const templateGroups = { primary:"数据采集", info:"展示页面", warning:"综合功能" }

/**
 * 对于特殊类型的页面，初始化 DATA 模块时无需设置其页面ID（方便自由读写任意类型的数据）
 * @param {*} pageType
 * @returns
 */
export const isUnLimitPageId  = pageType=> [ "import", "table", "chart" ].includes(pageType)

/**
 * theme 为 primary 表示数据录入为主、info 为展示
 * @type {Array<TemplateItem>}
 */
export const templates = [
    { id:"form", text:"表单页", theme: INPUT, icon: Wpforms, summary:"数据填报页面，支持可视化编辑"},
    { id:"markdown",text:"文档页", theme: OUTPUT, icon:DOC, summary:"基于 MARKDOWN 的内容展示"},
    { id:"data",text:"数据分发", theme: INPUT, icon:Database, summary:"批量导入数据并按照设定的规则分发给指定人"},
    { id:"import",text:"数据维护", theme: INPUT, icon:Tools, summary:"数据内容维护（自定义脚本处理用户导入的文件）"},
    { id:"wenjuan",text:"调查问卷", theme: INPUT, icon:ListAltRegular, summary:"运用统一设计的问卷向被调查者了解情况或征询意见收集信息的调查方法"},
    { id:"table",text:"数据表格", theme: OUTPUT, icon:Table, summary:"以二维表格的形式展示数据，支持多条件筛选、自定义列"},
    { id:"chart",text:"统计图表", theme: OUTPUT, icon:ChartPie, summary:"用于制作台账、统计图等数据可视化页面"},
    { id:"robot",text:"RPA机器人", theme: MIX, icon: Robot, summary:"基于 WEB 的 RPA 机器人（主要用于数据采集，需要目标网站支持 Chrome 浏览器），需要在客户端环境下运行"},
    //SFC add on 2023-06-02
    {
        id:"sfc",text:"单文件组件", theme: MIX, icon: Vuejs, summary:"自定义Vue3页面（template+script+style），支持多款 UI 框架，能够使用全局组件及接口",
        /**
         * @param {String} aid
         * @param {TemplateItem} tpl
         */
        onCreate: (aid, tpl)=> new Promise((ok, fail)=>{
            const dialog = M.dialog({
                maskClosable: false, showIcon: false, style:{width:'720px'},
                title: `请选择 SFC 的 UI（用户界面） 框架`,
                content: ()=>h(ChooseSFCUI, {onSelect: item=>{
                    dialog.destroy()
                    ok({name:`${item.ui}|新建${tpl.text}`, content: JSON.stringify(item)})
                }})
            })
        })
    },
    // {
    //     id:"sfc2",text:"单文件组件2.0", theme: MIX, icon: Vuejs, summary:"自定义Vue3单文件组件（基于 Vant4 渲染，兼容 PC 及移动端），能够使用全局组件及接口",
    //     onCreate:aid=>({name:`单文件组件2.0（双端适配）`})
    // },
    { id:"h5",text:"H5小程序", theme: MIX, icon: Html5, summary:"自由灵活的 HTML5 页面（适用于具备开发能力的技术人员）"},
    {
        id:"faas", text:"FaaS函数", theme: MIX, icon:Code, onCreate:aid=>({name:"新建FaaS函数", search: false}),
        summary:"为开发人员提供快速处理数据的后端服务(Serverless)，无需自行开发及部署，适用于场景简单、功能单一、数据规模小的场景"
    },
    { id:"server",text:"后端服务", theme: MIX, icon: Server, summary:"部署在服务器的后端服务（目前仅支持 Node.js、Java 开发语言）", onCreate:aid=>({name:`ENDPOINT-SERVICE`, search:false})},
]
export const findTemplate = tpl=> templates.find(v=>v.id==tpl) || {text:"未知", theme:"error", summary:`未知的模板类型⌈${tpl}⌋`, icon:ExclamationTriangle }

/**
 * 渲染器属性
 */
export const renderProps = {
    aid: {type:String, default:""},
    page: {type:Object},
    pid:{type:[Number, String], default:""},
    data: {type:String, default:"[]"},
    params: {type:Object, default:()=>({})}
}

export function pageManage(router){
    let toView = row=>{
        if(row.template == 'robot')
            return M.confirm(`运行机器人`, `确定执行网页机器人⌈${row.name}⌋吗？`, ()=> H.app.runRobot(row.id))
        // let r = router.resolve({name:`app-view`, params:{aid:row.aid, pid: row.id}})
        // H.openUrl(r.href, {title: row.name, center:true })
        H.app.runPage(row.aid, row.id, true)
    }

    let toEdit = row=>{
        let r = router.resolve({name:`app-page-${row.template}`, params:{id:row.id, aid:row.aid}})
        let width = Math.floor(window.screen.availWidth * 0.9)
        let height = Math.floor(window.screen.availHeight * 0.8)
        H.openUrl(r.href, {title:`${row.name}·编辑页面`, center:true, width, height })
    }

    return { toView, toEdit }
}

export function pageEditor(defaultVal, translator, padding=true){
    let {id, aid}   = useRoute().params
    let bean        = ref(defaultVal)
    let loading     = ref(false)
    let inited      = ref(false)

    const PADDING   = "main.padding"

    let refresh = ()=> GET("/page/content", {id}, d=> {
        if(d.success===true){
            if(!!d.data)
                bean.value = translator?translator(d.data):d.data

            inited.value = true
        }
        else {
            alert(d.message)
            window.close()
        }
    })

    let updateContent = (value, onOk)=> RESULT(
        "/page/content",
        {id: parseInt(id), value},
        d=> typeof(onOk) === 'function'? onOk(d) : M.notice.ok(`页面内容更新完成`),
        {loading}
    )
    onMounted(()=>{
        padding && E.emit(PADDING, 0)
        refresh()

        if(!H.data.getAppId()){
            // 初始化 DATA 模块，此处不传递 pid 参数，需要在 CURD 时进行手动 pid 限定
            !H.data.inited() && H.data.init({aid, pid:"", prefix: window.SERVER, debug: process.env.NODE_ENV !== "production"})
        }
    })
    onUnmounted(()=>{
        padding && E.emit(PADDING)
    })

    return { id,aid, loading, bean, inited, refresh, updateContent }
}

export const loadPages = (aid, loading)=> new Promise((ok)=> RESULT("/page/list", {form:{EQ_aid:aid}}, d=> ok(d.data), {loading}))

export const loadContent = id => new Promise((ok, fail)=> GET("/page/content", {id}, ok, fail))

/**
 * 注册全局的 CTRL+S 事件
 * @param {String} key 'KeyS'
 */
export const initCtrlAndS = (handler, keyName="s")=>{
    document.onkeydown = e => {
        let {ctrlKey, key} = e
        if(ctrlKey==true && key==keyName){
            e.preventDefault()
            handler && handler()
        }
    }
}

/**
 *
 * @param {Object} row
 * @param {String} key
 * @param {*} value
 * @param {String} tip
 * @returns
 */
export const modifyPage = (row, key, value, tip="操作成功")=> new Promise(ok=> RESULT("/page/modify", {id: row.id, key, value}, d=> {
    window.M.ok(tip)
    row[key] = value
    ok()
}))
