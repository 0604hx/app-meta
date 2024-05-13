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

const NAME = "ui.home.grid"
const COLS = 8
const GAP  = 10

/**
 *
 * @param {HomeWidget} ps
 * @returns
 */
const buildWidget = ps=> Object.assign({card:true, span:1, height:'auto'}, ps)

export const getConfig = ()=>Object.assign(
    {
        cols: COLS,
        x: GAP,
        y: GAP,
        /**@type {Array<HomeWidget>} */
        items: [
            buildWidget({uuid:"mine-page", title:"快捷入口", span:COLS, card:true, com:"M001"}),
            buildWidget({uuid:'app-top', title:"应用排行",com:"M002", span: COLS, card:false}),
            // buildWidget({com:"M003", card:false, params:{text:"抽签小程序", height:60, aid:'SJCQ-BDB', pid:2}}),
            // buildWidget({ title:`应用总览`, params:{aid:"demo", height: 200}, com: "M004", span: 4 }),
            // buildWidget({uuid:'45', aid:'demo', title:"静夜思", card:true, height: '110px' })
        ]
    },
    H.store.getObj(NAME, {})
)

export const loadConfig = ()=> H.store.get(NAME, "")

export const saveConfig = text=>{
    H.store.set(NAME, typeof(text)==='string'? text:JSON.stringify(text) )
}
