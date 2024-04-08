import { withPost, withGet } from "../common"
import { saveToFile, unCompress } from "./io"

let header = undefined
let enableMapping = undefined
let mappingIds = new Set()      //需要映射的应用ID
let mapping = []

/**
 * 构建对应后端的服务地址
 *
 * add on 2023-11-30
 *  增加异地 URL 的映射，方便本地 debug 应用
 *  原理：
 *      1、配置映射关系（保存到 localStorage 的 dev.service），格式为 compress 后的 JSON 串
 *      2、读取上述值，如果发现 aid 有关联的映射，则直接使用
 *
 * @param {String} aid - 应用ID
 * @param {String} path - 请使用 / 开头的路由地址
 * @param {Object} extraHeaders
 * @returns
 */
const buildServiceUrl = (aid, path, extraHeaders)=> {
    if(!aid && typeof(path)==='number'){
        // 当 aid 为空，path 为数值，则视为调用 FaaS 函数
        return `service/_f_a_a_s_/${path}`
    }
    if(enableMapping == undefined){
        let m = localStorage.getItem('dev.service')
        if(m){
            /**@type {Array} */
            let items = JSON.parse(unCompress(m))
            if(Array.isArray(items)){
                if(window.User)
                    header = `${User.id}-${encodeURIComponent(User.name)}-${User.ip}-${User.roles? User.roles.join(","):""}`

                mapping = items.filter(v=>v.active)
                mapping.forEach(v=> {
                    if(!!v.filter)
                        v.filter = v.filter.split(",").map(v=>v.trim())
                    mappingIds.add(v.aid)
                })
            }
        }

        enableMapping = true
    }

    //判断映射地址
    if(!!mappingIds.has(aid)){
        let m = mapping.find(v=>v.aid == aid && (!v.filter || v.filter.indexOf(path)>=0))
        if(!!m){
            console.debug("[服务映射]", path, ">", m.target)
            if(extraHeaders){
                //添加请求头
                extraHeaders['ua'] = header
            }
            return `${m.target}${path}`
        }
    }

    return `service/${aid}/${path.startsWith("/")?path.substring(1):path}`
}

export const get = (aid, path, extraHeaders={}, responseHandler) => withGet(buildServiceUrl(aid, path, extraHeaders), extraHeaders, responseHandler)

/**
 * 调用后端服务（必须返回 JSON 格式的对象或者字符串）
 *
 * @param {String} aid                  应用ID
 * @param {String} path                 服务地址
 * @param {Object} data                 Object 类型的参数
 * @param {Boolean} useJson             是否使用 JSON 格式提交（默认 true）
 * @param {Object} extraHeaders         额外的header
 * @param {Function} responseHandler    fetch 方法的响应处理，默认是转换为 JSON 格式
 *                                          如果后端返回文件流，则可以参考 _exportData 进行 blob 处理
 */
export const json = (aid, path, data, useJson=true, extraHeaders={}, responseHandler)=> withPost(buildServiceUrl(aid, path, extraHeaders), data, useJson, extraHeaders, responseHandler)

/**
 * 处理纯文本的远程返回内容
 * withPost(buildServiceUrl(path, specialAid), data, useJson, prefix, response=> response.text())
 * @param {*} path
 * @param {*} data
 * @param {*} useJson
 * @param {*} specialAid
 */
export const text = (aid, path, data, useJson=true) => json(aid, path, data, useJson, res=>res.text())

/**
 * @typedef {Object} DownloadConfig
 * @property {Boolean} json - 是否使用JSON格式传递参数
 * @property {String} fName - 指定保存的文件名
 * @property {Object} headers - 额外的请求头
 */

/**
 * 下载文件
 * @param {String} aid - 应用ID
 * @param {String} path - 后端路径
 * @param {Object} data - 参数
 * @param {DownloadConfig} config - 是否使用JSON格式传递参数
 * @returns
 */
export const download = (aid, path, data, config={})=> new Promise((ok, reject)=>{
    config = Object.assign({json:true, fName:undefined, headers:{}}, config)

    let filename = config.fName
    let headers = {}
    let length = -1
    json(
        aid, path, data, config.json, config.headers,
        async res=>{
            if(res.headers.get("content-type") == 'application/json'){
                let json = await res.json()
                throw Error(json.message)
            }
            //尝试从响应头中取得文件名称
            const contentDisposition = res.headers.get('content-disposition')
            if (!filename && contentDisposition) {
                filename = window.decodeURI(contentDisposition.split('=')[1])
            }
            //解析headers
            for (var h of res.headers.entries()) {
                headers[h[0]] = h[1]
            }
            length = res.headers.get('content-length')||-1

            return res.blob()
        }
    )
    .then(b=>{
        saveToFile(b, filename)
        ok({filename, headers, length})
    })
    .catch(e=> reject(e.message))
})
