/**
 * 数据操作工具
 *
 * 2024-04-09
 *  取消 init 方法，需要调用者指定 aid、pid 等参数
 *
 * @typedef {Object} MatchItem
 * @property {String} field - 字段名称
 * @property {String} op - 查询类型（详见下方说明）
 * @property {*} value
 *
 * @typedef {Object} DataOption
 * @property {String} aid - 应用ID
 * @property {Number|String} pid - 页面ID
 * @property {String} id - 对象ID，通常是数据行ID
 * @property {String} uid - 限定用户ID
 * @property {Number} page - 👉查询用👈 分页
 * @property {Number} pageSize - 👉查询用👈 每页显示的数据量
 * @property {Array<MatchItem>} match - 👉查询用👈 筛选数组
 * @property {String} timeFrom - 👉查询用👈 筛选开始时间
 * @property {String} timeEnd - 👉查询用👈 筛选结束时间
 *
 * 筛选条件中的 op 可选值：
 *  const operations = [
        { label:"等于", value:"EQ" },
        { label:"包含", value:"LIKE" },
        { label:"小于", value:"LT" },
        { label:"不大于", value:"LTE" },
        { label:"大于", value:"GT" },
        { label:"不小于", value:"GTE" },
        { label:"不等于", value:"NE" },
        { label:"在", value:"IN" },
        { label:"不在", value:"NIN" }
    ]
 */

import { withPost, LogFactory } from "../common"
import { saveToFile } from "./io"


let debug = true

const log = new LogFactory("数据接口")

/**
 *
 * @param {String|DataOption} aidOrOption
 * @returns {DataOption}
 */
const toOption = aidOrOption => {
    if(typeof(aidOrOption) === 'string')
        return { aid:aidOrOption }

    if(!aidOrOption || !aidOrOption.aid)    throw Error(`参数应为 String 或者包含 aid 属性`)
    return aidOrOption
}

/**
 * 以 POST 形式与后端进行交互
 * @param {*} model
 * @param {*} action
 * @returns {Promise}
 */
const send = (model, action="", json=true)=>{
    debug && log.debug(action, model)
    return withPost(action, model, json)
}

/**
 * 若 ps 未传递 aid 参数，则尝试从 url 中获取（通常是小程序的场景）
 * @param {*} _debug
 * @param {*} ps
 */
// export const init = (ps={})=>{
//     if(!!aid) throw Error("DATA 模块已经初始化，无需重复调用 init 方法...")
//     debug = ps.debug === true
//     let initFromUrl = false

//     if(typeof(ps.aid) === 'string' && ps.aid && ps.aid.trim().length > 0){
//         aid = ps.aid
//         pid = ps.pid || ""
//         prefix  = ps.prefix
//     }
//     // 尝试从 url 中读取相关信息
//     else {
//         let paths = location.pathname.split("/")
//         let isLarge = paths.length >= 5
//         prefix = isLarge?`/${paths[1]}/` : "/"
//         let tmps = (isLarge? paths[3]: paths[2]).split("-")
//         aid = tmps[0]
//         pid = tmps[1]

//         initFromUrl = true
//     }

//     if(!aid) throw Error(`参数 aid 不能为空`)

//     if(!prefix && window.SERVER) prefix = window.SERVER
//     setContextPath(prefix)

//     debug &&  log.debug(`环境初始化 AID=${aid} PID=${pid} PREFIX=${prefix}`)

//     if(initFromUrl) {
//         setTimeout(()=>{
//             let launchTime =  H.store.getObj(KEY) //JSON.parse(localStorage.getItem("launch")||"{}")
//             let time = Date.now()
//             //60分钟内，仅计算一次
//             if(!(aid in launchTime) || time - launchTime[aid] >= 60*60*1000){
//                 send({id: aid}, `app/launch`).then(()=> {
//                     launchTime[aid] = time
//                     H.store.setObj(KEY, launchTime)
//                 })
//             }
//         }, 6000)
//     }
// }

/**
 * 从 URL 中解析 aid、pid 等
 * @returns {DataOption}
 */
export const loadFromUrl = ()=>{
    // 尝试从 url 中读取相关信息
    let [aid, pid] = location.hash.replace("#/app/","").split("/")
    return { aid, pid }
}

/**
 * 获取当前登录用户的信息
 *
 * 示例：
 * H.data.getUserInfo().then(user=>{})
 * @returns 用户信息
 */
export const getUserInfo = async ()=>{
    let user = await send(null, `whoami`)
    return user.data
}

/**
 *
 * @param {*} rows
 * @param {*} _pid
 * @param {*} ps
 */
export const _insert = (rows, _pid="", ps={})=>{
    let model = { aid , pid: _pid||pid }
    let isBatch = Array.isArray(rows)
    model[isBatch?"objs":"obj"] = rows
    if(isBatch && "batch" in ps)   model.batch = ps.batch
    if("origin" in ps)  model.origin= ps.origin

    //如果填写了 batch 属性，则必须填写 pid
    if(!!model.batch && !model.pid) throw Error(`按批次导入数据请指明 pid ，使用 insert(rows, pid, ps) 的参数二传递该值`)

    return send(model, "data/create")
}

/**
 * 插入数据（单个或者数组）
 * @param {String|DataOption} opt
 * @param {Object|Array} rows
 */
export const insert = (opt, rows, ps={})=>{
    opt = toOption(opt)
    let isBatch = Array.isArray(rows)
    let model = { aid:opt.aid, pid: opt.pid, [isBatch?'objs':'obj']: rows }

    if(isBatch && "batch" in ps)
        model.batch = ps.batch
    if("origin" in ps)
        model.origin = ps.origin

    //如果填写了 batch 属性，则必须填写 pid
    if(!!model.batch && !model.pid) throw Error(`按批次导入数据请指明 pid ，使用 insert({pid}, rows) 的格式传递该值`)

    return send(model, "data/create")
}

/**
 * 更新数据（按确定的 id）
 * @param {String|DataOption} opt
 * @param {Object} newVal
 * @returns {Promise}
 */
export const update = (opt, newVal)=>{
    opt = toOption(opt)
    let model = { aid: opt.aid, obj: newVal, id: opt.id }

    return send(model, "data/update")
}

// const _buildMatchModel = modelOrId=>{
//     let model = { aid }
//     if(typeof(modelOrId) !== 'object')
//         model.id = modelOrId
//     else{
//         ["pid", "uid", "timeFrom", "timeEnd"].forEach(k=> { if(k in modelOrId) model[k] = modelOrId[k] })
//         if(!!pid)   model['pid'] = pid

//         modelOrId.match && (model.match = Array.isArray(modelOrId.match)? modelOrId.match : [modelOrId.match])
//     }
//     return model
// }

/**
 *
 * @param {String|DataOption} opt
 * @returns {DataOption}
 */
const _buildMatchModel = opt=>{
    opt = toOption(opt)

    let m = { aid: opt.aid }
    if(!!opt.id){
        m.id = opt.id
    }
    else{
        if(opt.pid)         m.pid = opt.pid
        if(opt.uid)         m.uid = opt.uid
        if(opt.timeFrom)    m.timeFrom = opt.timeFrom
        if(opt.timeEnd)     m.timeEnd = opt.timeEnd

        opt.match && (m.match = Array.isArray(opt.match)? opt.match : [opt.match])
    }

    return m
}

export const query = (opt={})=>{
    let model = _buildMatchModel(opt)
    // 对于查询，还可以定义更多的限定（如分页）
    if(typeof(opt) == 'object')
        ["page", "pageSize", "desc"].forEach(k=> { if(k in opt) model[k] = opt[k] })

    return send(model, "data/query")
}

/**
 * 参数同 query
 * @param {String|DataOption} modelOrId
 */
export const remove = (modelOrId)=> send(_buildMatchModel(modelOrId), "data/delete")

/**
 * 导出数据到文件（后端实现）
 * @param {String|DataOption} modelOrId
 * @param {Array} headers
 * @param {String} filename
 * @param {String} format - 数据格式，默认为 xlsx，可选：csv
 */
const _exportData = (modelOrId, headers, filename="", format="xlsx")=> new Promise((ok, reject)=>{
    if(!headers || !headers.length)         return reject(`参数 headers （数据标题列） 必须填写`)
    let model = _buildMatchModel(modelOrId)

    model.headers = typeof(headers[0]) === 'string'? headers.map(field=>({field, text:field})): headers
    model.format = format
    model.filename = filename

    withPost(
        `/data/export`, model, true, {},
        async res=>{
            if(res.headers.get("content-type") == 'application/json'){
                let json = await res.json()
                throw Error(json.message)
            }

            return res.blob()
        }
    )
    .then(b=>{
        saveToFile(b, filename)
        ok()
    })
    .catch(e=> reject(e.message))

})

export const exportToExcel = (modelOrId={}, headers=[], filename)=> _exportData(modelOrId, headers, filename)

export const exportToCSV = (modelOrId={}, headers=[], filename)=> _exportData(modelOrId, headers, filename, "csv")

/**
 * 读取数据块，返回的内容是 text，需要自行转换为目标格式
 * @param {String} aid
 * @param {*} uuid
 */
export const getBlock = (aid, uuid)=> send({aid, uuid }, "data/block/get")

/**
 * 赋值（覆盖）数据块
 * @param {String} aid
 * @param {*} uuid 唯一ID
 * @param {String|Object} text 数据内容，为空则视为删除该数据块
 */
export const setBlock = (aid, uuid, text) =>send({aid, uuid, text: typeof(text)=='string'? text: JSON.stringify(text) }, "data/block/set")

/**
 * 返回全部的数据块
 * 量可能较大，慎用
 * @param {String} aid
 */
export const listBlock = aid => send({aid}, "data/block/list")

/**
 * 返回应用详细信息，包含两个属性
 *  app         应用基本信息
 *  property    应用其他属性（如窗口大小等）
 * @param {String} aid
 */
export const getAppDetail = aid => send({ id: aid}, "app/detail")

/**
 * 获取应用下的页面清单（仅限开启访问）
 * @param {String} aid
 */
export const listPage = aid=> send({form:{EQ_aid:aid, EQ_active:true}}, "page/list")

/**
 * 获取指定页面的附件清单
 * @param {String} pid
 */
export const listAttach = (id)=> send({id}, "page/document-list")

/**
 * 获取当前用户在该应用下的角色
 * @param {String} aid
 * @returns {Array<String>}
 */
export const mineRoles = aid=> send(null, `/app/role/mine/${aid}`)
