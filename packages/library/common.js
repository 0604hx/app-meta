import dayjs from "dayjs"

const globalName = "meta"

let contextPath

// 简单的参数拼接，不支持数组
const stringify = params=> Object.keys(params).map(v=>`${v}=${params[v]}`).join("&")

/**
 * 构建最终访问的地址，如果 action 是一个绝对地址，则直接使用
 * @param {String} action
 */
const buildUrl = action=> /^https?:\/\//.test(action) ? action : `${contextPath}${action[0]=='/'?"":"/"}${action}`

/**
 * 处理 Fetch，如果返回值不符合规范，则报错（可通过 .catch 获取）
 * @param {*} response
 * @returns
 */
const handleResponse = response=> response.json().then(json=>{
    if(response.ok && json.success===true)
        return json
    else
        return Promise.reject(json)
})

export { globalName }

/**
 * 配置后端服务总地址
 * @param {String} prefix
 * @returns
 */
export const setContextPath = prefix=> contextPath = prefix

/**
 * 以 POST 形式与后端进行交互
 * @param {String} action               后端地址
 * @param {Object} data                 参数
 * @param {Boolean} json                是否使用 JSON 格式提交
 * @param {Object} extraHeaders         额外的请求头，注意：以下请求头会被覆盖 CHANNEL、MUA、Content-Type
 * @param {Function} handler            处理函数，默认转换为 JSON 对象
 * @returns
 */
export const withPost = (action="", data, json=true, extraHeaders={}, handler=handleResponse)=>{
    contextPath ??= window.SERVER

    return fetch(
        buildUrl(action),
        {
            method: "POST",
            headers:{ ...extraHeaders, CHANNEL: window.CHANNEL, "MUA": localStorage.getItem("MUA"), 'Content-Type': json?'application/json':'application/x-www-form-urlencoded'},
            body: data ? (json ? JSON.stringify(data) : stringify(data)):undefined
        }
    ).then(handler)
}

export const withGet = (action="", extraHeaders={}, handler=handleResponse)=> fetch(
        buildUrl(action),
        {
            method:"GET",
            headers:{ ...extraHeaders, CHANNEL: window.CHANNEL, "MUA": localStorage.getItem("MUA")}
        }
    ).then(handler)


/**
 * 打开新页面（同源）
 * @param {*} target
 */
export const openUrl = (target, ps={})=>{
    ps = Object.assign(
        {
            title:"",
            width:1320,
            height:720,
            type:"_blank",
            x: 0,
            y: 0,
            center: false         //是否居中
        },
        ps
    )
    let options = undefined
    if(ps.type == '_blank'){
        // 一旦设置了宽度，则打开新窗口
        options = `width=${ps.width},height=${ps.height}`
        if(ps.center) {
            let top = (window.screen.availHeight - ps.height)/2
            let left = (window.screen.availWidth - ps.width)/2
            options+=`,top=${top},left=${left}`
        }
        else if(ps.x>0 || ps.y>0){
            options+=`,top${ps.y},left=${ps.x}`
        }
    }

    let newWin = window.open(target, ps.type, options)
    if(!!ps.title && !!newWin){
        newWin.onload = function(){
            newWin.document.title = ps.title
        }
    }
    return newWin
}

const COLORS = {"INFO":"#2080f0", "DEBUG":"#8c0776", "ERROR":"#d03050"}
/**
 *
 * @param {String} level
 * @param  {...any} ps
 * @returns
 */
const log = (level, group, color, ...ps)=> console.debug(
    `%c${dayjs(new Date).format("HH:mm:ss")} ${level}${group?` %c${group}`:"%c"}`,
    `color:${COLORS[level]};font-weight:500;`,
    `background:${color};padding:0 2px 0px 2px;color:white`,
    ...ps
)

export class LogFactory {
    /**@type {String} */
    prefix
    /**@type {String} */
    color

    constructor(groupName, color){
        this.prefix = groupName
        this.color = color || "#8c0776"
    }

    info (...ps){
        log("INFO", this.prefix, this.color, ...ps)
    }
    debug (...ps){
        log("DEBUG", this.prefix, this.color, ...ps)
    }
    error (...ps){
        log("ERROR", this.prefix, this.color, ...ps)
    }
}

const defaultLogger = new LogFactory()

export const logger = {
    new     : (group, color)=> {
        if(!group)  throw `Log 分组名称不能为空`
        return new LogFactory(group, color)
    },
    info    : defaultLogger.info,
    debug   : defaultLogger.debug,
    error   : defaultLogger.error
}
