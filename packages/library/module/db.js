/**
 * 封装 indexedDB，默认的数据库为 meta
 */

import { globalName, logger } from "../common"
import { compact } from "./date"

/**
 * @type IDBDatabase
 */
let db = null

const VERSION = 92024040800000
const tables = [
    'test',
    /**
     * 窗口尺寸信息，在快应用界面 resize 时保存其状态（如x、y、宽、高等），再次打开时读取，尝试还原
     * id       格式为：用户ID-应用ID-页面ID
     * x        窗口左上角横轴坐标
     * y        窗口左上角纵轴坐标
     * width    窗口宽度
     * height   窗口高度
     */
    'window',
    /**
     * 本地数据缓存，如快应用每次修改后，临时保存到本地，以免数据丢失
     * id       唯一主键
     * data     JSON
     * date     保存日期
     */
    'cache'
]

export const init = ()=> new Promise((ok, fail)=>{
    if(!!db) return ok(db)

    const req = indexedDB.open(globalName, VERSION)
    req.onsuccess = e=> {
        db = e.target.result
        logger.debug("数据库连接成功^.^")
        ok(db)
    }
    req.onerror = e=>{
        logger.error(`数据库连接失败：`, e.message)
        fail(e)
    }
    req.onupgradeneeded = e=>{
        db = e.target.result

        tables.forEach(item=>{
            let table = typeof(item) === 'string'?{name: item, options:{keyPath:"id"}} : item

            if(!db.objectStoreNames.contains(table.name)){
                // https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/createObjectStore
                db.createObjectStore(table.name, table.options)
                logger.debug(`新建表 ${table.name} (options=${JSON.stringify(table.options)})`)
            }
        })
    }
})

/**
 *
 * @param {String} table
 * @param {Object|Array} rows
 */
export const insert = (table, rows)=> new Promise(async (ok, fail)=>{
    await init()

    const req = db.transaction(table, 'readwrite').objectStore(table).put(rows)
    req.onsuccess = e=> ok(e)
    req.onerror = ({ target })=>{

        logger.error(`数据写入到[${table}]失败`, target.error)
        fail(target.error)
    }
})

/**
 *
 * @param {String} table
 * @param {Object} key
 * @returns
 */
export const get = (table, key)=> new Promise(async (ok, fail)=>{
    await init().catch(fail)

    const req = db.transaction(table, 'readonly').objectStore(table).get(key)
    req.onsuccess = e=> ok(req.result)
    req.onerror = ({target})=>{
        logger.error(`读取[${table}]数据key=${key}失败`, target.error)
        fail(target.error)
    }
})

/**
 *
 * @param {String} table
 * @param {Object} key
 * @returns
 */
export const remove = (table, key)=> new Promise(async (ok, fail)=>{
    await init()

    const req = db.transaction(table, 'readwrite').objectStore(table).delete(key)
    req.onsuccess = e=> ok()
    req.onerror = ({target})=>{
        logger.error(`删除[${table}]数据key=${key}失败`, target.error)
        fail(target.error)
    }
})

/**
 *
 * @param {String} table
 * @param {String|Number} key
 * @param {Object} data
 * @returns
 */
export const update = (table, key, data)=>new Promise(async (ok, fail)=>{
    await init()

    get(table, key).then(row=>{
        if(row==undefined)  fail(`KEY=${key}的数据对象不存在`)

        const req = db.transaction(table, 'readwrite').objectStore(table).put(Object.assign(row, data))
        req.onsuccess = e=> ok(req.result)
        req.onerror = ({target})=>{
            logger.error(`更新[${table}]数据key=${key}失败`, target.error)
            fail(target.error)
        }
    })
})

/**
 * 游标方式遍历数据表
 * @param {String} table
 * @param {Function<Object>} worker - 处理函数
 * @param {IDBKeyRange} range - 查询条件，详见 https://developer.mozilla.org/en-US/docs/Web/API/IDBKeyRange
 * @returns
 */
export const stream = (table, worker, range)=>new Promise(async (ok, fail)=> {
    await init()

    let count = 0
    let started = Date.now()
    const req = db.transaction(table, 'readonly').objectStore(table).openCursor(range)
    req.onsuccess = e=> {
        let cursor = e.target.result
        if(cursor){
            worker(cursor.value)
            cursor.continue()
            count ++
        }
        else
            ok({count, used: Date.now()-started})
    }
    req.onerror = ({target})=>{
        logger.error(`流式处理[${table}]数据失败`, target.error)
        fail(target.error)
    }
})
