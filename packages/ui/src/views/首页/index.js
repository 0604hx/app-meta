/**
 * @typedef {Object} HomeWidget
 * @property {String} uuid - 编号，如果是 Page 则为 pid
 * @property {Number} span - 所占列数，默认 1
 * @property {Boolean} card - 是否使用卡片容器，默认 true
 * @property {String} title - 名称（显示的标题）
 * @property {String|Object} params - 参数
 * @property {String} aid - 应用ID
 * @property {String|Number} height - 组件高度，默认 auto
 * @property {*} com - 组件实例
 */

// import WidgetDemo from "./widget/demo.vue"
import WidgetMinePage from './widget/我的关注.vue'
import WidgetWrap from "./widget/快捷方式.vue"
import WidgetAppTop from "./widget/应用排行.vue"

const NAME = "ui.home.grid"
const COLS = 8

/**
 *
 * @param {HomeWidget} ps
 * @returns
 */
const buildWidget = ps=> Object.assign({card:true, span:1, height:'auto'}, ps)

export const getConfig = ()=>Object.assign(
    {
        cols: COLS,
        x: 8,
        y: 8,
        /**@type {Array<HomeWidget>} */
        items: [
            buildWidget({uuid:"mine-page", title:"快捷入口", span:COLS, card:false, com:WidgetMinePage}),
            buildWidget({uuid:'app-top', title:"应用排行",com:WidgetAppTop, span: COLS, card:false}),
            // buildWidget({uuid:'demo', title:"演示挂件", span:2, params:{name:"001"}, com: WidgetDemo}),
            // buildWidget({com:WidgetWrap, card:false, params:{text:"抽签小程序", height:60, aid:'SJCQ-BDB', pid:2}}),
            buildWidget({uuid:'45', aid:'demo', title:"静夜思", card:true, height: '110px' })
        ]
    },
    H.store.getObj(NAME, {})
)
