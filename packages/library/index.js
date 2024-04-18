import * as date from './module/date'
import * as store from './module/store'
import * as is from './module/is'
import * as excel from './module/excel'
import * as io from './module/io'
import * as secret from './module/secret'
import * as util from './module/util'
import * as api from './module/api'
import * as app from './module/app'
import * as data from './module/data'
import * as service from './module/service'

import * as db from './module/db'

import { logger as log, openUrl, withPost as post } from "./common"

/**
 * 初始化操作
 * 1、对应用页面（#/app/xxx/xxx）添加 onresize 事件处理器，用于保存窗口大小
 */
setTimeout(
    ()=>{
        if(location.hash.startsWith("#/app")){
            window.onresize = util.debounce(
                e=>{
                    let [aid, pid] = location.hash.replace("#/app/","").split("/")
                    db.insert('window', {id:`${User.id}-${aid}-${pid||""}`, x: screenX, y: screenY, width: outerWidth, height: outerHeight})
                },
                1000
            )
        }
    },
    1000
)

/**
* 将 img 元素对象转换为 Base64 格式
* @param {HTMLImageElement|String} img - 图片元素（如通过 document.querySelector 获取）或者选择器
* @param {Object} ps - 额外参数
* @param {Number} ps.scale - 缩放，默认 1
* @param {Boolean} ps.withGray - 是否进行灰度处理，默认 true
* @param {String} ps.format - 图片格式，默认 image/jpeg
* @param {Boolean} ps.natural - 是否使用图片元素的原始尺寸，默认 true
* @returns {String}
*/
function imgToBase64(img, ps={}) {
    if(typeof(img)==='string')  img = document.querySelector(img)
    if(Object.prototype.toString.call(img) != '[object HTMLImageElement]')
        throw Error(`参数 img 必须是一个有效的 HTMLImageElement 对象或选择器`)

    ps = Object.assign({scale:1.0, withGray:true, format: "image/jpeg", natural:true}, ps)
    let canvas = document.createElement("canvas")
    let ctx = canvas.getContext("2d")
    let width = ps.natural? img.naturalWidth : img.width
    let height = ps.natural? img.naturalHeight : img.height

    canvas.width = width * ps.scale
    canvas.height = height * ps.scale
    ctx.drawImage(img, 0, 0, width, height, 0, 0, canvas.width, canvas.height)

    //灰度处理，一定程度上使得图片内字符更加清晰
    if (ps.withGray) {
        let imgD = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let len = canvas.width * canvas.height * 4
        for (let i = 0; i < len; i += 4) {
            let gray = Math.floor((imgD.data[i] + imgD.data[i + 1] + imgD.data[i + 2]) / 3)
            imgD.data[i] = imgD.data[i + 1] = imgD.data[i + 2] = gray > 100 ? gray : 0
        }

        ctx.putImageData(imgD, 0, 0)
    }

    return canvas.toDataURL(ps.format)
}

export {
    date,
    store,
    is,
    excel,
    io,
    secret,
    util,
    db,

    api,
    app,
    data,
    service,
    log
}

/**
 * 获取指定对象（转换为 JSON 字符串后）的 哈希 值
 * @param {*} obj
 * @param {*} caseSensitive
 * @returns
 */
export const hashCode = (obj = null, caseSensitive = false)=>{
    obj = JSON.stringify(obj)
    if (!caseSensitive) obj = obj.toLowerCase()

    var hash = 100000000, i, ch
    for (i = obj.length - 1; i >= 0; i--) {
        ch = obj.charCodeAt(i)
        hash ^= ((hash << 5) + ch + (hash >> 2))
    }

    return (hash & 0x7FFFFFFF)
}

/**
* 格式化文件大小
* @param {*} mem
*/
export const filesize = (mem, fixed=1, split=" ")=>{
    var G = 0
    var M = 0
    var KB = 0
    mem >= (1 << 30) && (G = (mem / (1 << 30)).toFixed(fixed))
    mem >= (1 << 20) && (mem < (1 << 30)) && (M = (mem / (1 << 20)).toFixed(fixed))
    mem >= (1 << 10) && (mem < (1 << 20)) && (KB = (mem / (1 << 10)).toFixed(fixed))
    return G > 0
        ? G + split + 'GB'
        : M > 0
            ? M + split + 'MB'
            : KB > 0
                ? KB + split + 'KB'
                : mem + split + 'B'
}

/**
 *
 * @param {*} name
 */
export const setTitle = (name)=> document.title = name

/**
 * 转换为千位符
 * @param {*} num
 * @returns
 */
export const toThousands =  (num)=>{
    let ps = (num || 0).toString().split(".")
    ps[0] = ps[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return ps.join(".")
}

export const split = (text, splitor = ",") => typeof (text) == 'string' && text ? text.split(splitor) : []

/**
 * 将指定数据写入到系统粘贴板
 * @param {*} obj   如果为非字符串，事先进行 JSON 转换
 * @returns
 */
export const copyTo = (obj, pretty=false)=> {
    let text = typeof(obj)=='string'? obj: JSON.stringify(obj, null, pretty?4:0)
    // 优先使用原生客户端提供的功能，无需 document 聚焦
    if(window.META && window.META.copyText)
        META.copyText(text)
    // 仅在 localhost 或者 https 环境下才能使用该 API
    else if(navigator.clipboard)
        navigator.clipboard.writeText(text)
    else {
        const textarea = document.createElement('textarea')
        textarea.addEventListener('focusin', (event) => event.stopPropagation())
        textarea.value = text
        textarea.setAttribute('readonly', '')
        textarea.style.cssText =  'position:fixed; pointer-events:none; z-index:-9999; opacity:0;'

        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
    }
}

/**
 * 判断参数是否为一个有内容的字符串
 * @param {*} v
 * @returns
 */
export const hasText = v=>{
    if(v == null)   return false
    if(typeof(v)==='string') return /[^\s]/.test(v)
    return false
}

export { openUrl, post, imgToBase64 }

export const version = _VERSION_
