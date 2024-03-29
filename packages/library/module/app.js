import { withPost, openUrl, logger } from "../common"
import { get } from "./db"
import { compress } from "./io"


const buildUrl = (aid, pid, params, pure=false)=>{
    let url = `${location.origin}${location.pathname}#/app${pure?'-pure':''}/${aid}`
    if(pid)
        url += `/${pid}`
    if(params)
        url += `?params=${encodeURIComponent(compress(params))}`
    return url
}

/**
 * 准备打开该页面的窗口信息
 * @param {String} aid
 * @param {String} pid
 * @param {Object} params
 * @param {Boolean} pure - 是否使用纯净模式，此时不显示底部的信息
 * @returns
 */
export const prepare = (aid, pid, params, pure=false)=> new Promise((ok)=>{
    const url = buildUrl(aid, pid, params, pure)

    let option = {}
    get('window', `${window.User.id}-${aid}-${pid||""}`).then(v=>{
        if(!!v){
            console.debug("检测到", aid, pid, v)
            delete v.id
            Object.assign(option, v)
        }

        ok({url, option})
    }).catch(e=>{
        logger.error(`查询数据库失败`, e)
        ok({url, option})
    })
})

/**
 * @param {String} aid
 * @param {String} pid
 * @param {Object} ps
 * @param {String} params
 */
const openAppOrPage = (aid, pid, ps={}, params)=> prepare(aid, pid, params).then(({ url, option })=>openUrl(url, Object.assign(ps, option)))

/**
 * 运行应用，默认以新窗口打开（不判断应用预设的属性，如窗口大小）
 * @param {*} id
 * @returns
 */
export const run=(id)=> runPage(id, null, true)

/**
 * 运行页面
 * @param {*} aid
 * @param {*} pid
 * @param {*} blank     是否在新页面打开（新窗口）
 * @param {*} params    参数（通过 URL 传递）
 */
export const runPage=(aid, pid, blank=false, params)=>{
    if(blank===true){
        //此处读取本地的窗口大小
        openAppOrPage(aid, pid, {}, params)
    }
    else{
        if(typeof(window.metaChangePage) === 'function'){
            window.metaChangePage(aid, pid)
        }
        else{
            location.href = buildUrl(aid, pid, params)
            //自动刷新
            setTimeout(()=> location.reload(), 200)
        }
    }
}

/**
 * 读取应用信息并启动
 * @param {*} appOrId 应用对象或者 ID
 */
export const loadAndRun = (appOrId)=> new Promise((ok, fail)=>{
    let id = typeof(appOrId) === 'string'? appOrId : appOrId.id
    if(!!id){
        withPost(`/app/detail`, {id})
            .then(d=> {
                if(!d || !d.data || !d.data.app)    throw Error(`远程服务器返回无效的应用信息`)

                let { app, property } = d.data
                if(property.native === true && !window.META)
                    throw Error(`应用「${app.name}」需要在<原生环境>下执行，请在桌面客户端启动`)

                let width = property.winMax ? window.screen.availWidth : property.winWidth
                let height = property.winMax ? window.screen.availHeight : property.winHeight

                openAppOrPage(app.id, undefined, { title:app.name, width, height, center: !property.winMax })
                ok(app)
            })
            .catch(fail)
    }
    else
        throw Error(`无效的参数，请传递 App 对象或者 ID`)
})

/**
 * 启动某个机器人
 * @param {String|Number}   id
 * @param {Object}          params
 * @returns
 */
export const runRobot = (id, params={})=> {
    if(!window.META)    throw Error(`RPA 机器人需要在<原生环境>下执行，请在桌面客户端启动`)

    return typeof(callClient)==='function'? callClient('runRobot', id, params) : META.runRobot(id, params)
}

//=================================== START 远程工作者 START ===================================
/**
 * 调用远程工作者，执行指定的机器人
 * @param {String} worker - 工作者ID（通常是ip地址）或编号
 * @param {String|Number} robotId - 机器人ID
 * @param {Object} params - 运行时参数
 */
export const runRobotRemote = (worker, robotId, params={})=>{
    if(!worker)     throw Error(`工作者ID/编号不能为空`)
    if(!robotId)    throw Error(`ROBOT编号不能为空`)
    return withPost(`/worker/run-robot`, {worker, robotId, params})
}

/**
 * 检查工作者状态
 * @param {String} worker - 工作者ID（通常是ip地址）或编号
 * @returns
 */
export const workerStatus = worker => withPost(`/worker/status`, {worker})

/**
 * 轮询检查远程 ROBOT 是否有结果
 * @param {String} taskId - 远程任务ID，通常来自 runRobotRemote 方法
 * @returns
 */
export const workerResult = taskId => withPost(`/worker/fetch/${taskId}`)

//=================================== ↑↑↑↑↑ 远程工作者 ↑↑↑↑↑ ===================================

//=================================== START 组织管理 START ===================================
/**
 * 获取用户清单
 * @param {String} id 若不为空则返回模糊匹配的结果
 */
export const users = (id)=> withPost(`/account/users`,{key:id})
/**
 * 获取部门清单
 */
export const departments = ()=>withPost(`/account/departs`)

/**
 * 获取角色列表
 */
export const roles = ()=> withPost(`/account/roles`)
//=================================== ↑↑↑↑↑ 组织管理 ↑↑↑↑↑ ===================================
