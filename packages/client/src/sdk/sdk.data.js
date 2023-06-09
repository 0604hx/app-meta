const { getRobotInfo } = require("../core/RobotManage")
const { callServer } = require("../service/Http")
const { getWindowId } = require("./tool")

const _buildMatchModel = (modelOrId, pid)=>{
    let model = { }
    if(typeof(modelOrId) !== 'object')
        model.id = modelOrId
    else{
        ["pid", "uid", "timeFrom", "timeEnd"].forEach(k=> { if(k in modelOrId) model[k] = modelOrId[k] })
        if(!!pid)   model['pid'] = pid

        modelOrId.match && (model.match = Array.isArray(modelOrId.match)? modelOrId.match : [modelOrId.match])
    }
    return model
}

const buildServiceUrl = (path, aid)=> `/service/${aid}/${path.startsWith("/")?path.substr(1):path}`

const RESULT = async (action, body)=> {
    let { data } = await callServer(action, body)
    return data
}

const withRobot = (e, handler)=>{
    let { aid, pid } = getRobotInfo(getWindowId(e))
    if(!aid)    throw Error(`当前网页机器人未关联任何应用（aid 未配置），无法使用该功能`)
    return handler(aid, pid)
}

/**
 * 对后端数据接口的调用
 *
 * 以 packages\library\module\data.js 为准，只选择常用的接口
 */
module.exports = {
    /**
     * 插入数据，不支持批次功能
     * @param {*} e
     * @param {*} rows
     * @param {*} specialPid
     * @returns
     */
    'data.insert': (e, rows, specialPid)=>withRobot(e, (aid, pid)=>{
        let model = { aid , pid: specialPid || pid }
        let isBatch = Array.isArray(rows)
        model[isBatch?"objs":"obj"] = rows

        return RESULT("/data/create", model)
    }),

    /**
     * 使用方法详见 packages\library\module\data.js#query
     * @param {*} e
     * @param {*} modelOrId
     * @returns
     */
    'data.query': (e,modelOrId)=> withRobot(e, (aid, pid)=>{
        let model = _buildMatchModel(modelOrId, pid)
        model.aid = aid
        return RESULT("/data/query", model)
    }),

    'data.getBlock': (e,uuid)=> withRobot(e, (aid)=> RESULT("/data/block/get", {aid, uuid})),

    'data.setBlock': (e,uuid, text)=> withRobot(e, aid=> RESULT("/data/block/set", {aid, uuid, text})),

    /**
     * 暂不支持非 JSON 参数的提交
     * @param {*} e
     * @param {*} path
     * @param {*} data
     * @param {*} useJson
     * @param {*} specialAid
     * @returns
     */
    'data.service': (e, path, data, useJson=true, specialAid)=> withRobot(e, (aid)=>{
        return RESULT(buildServiceUrl(path, specialAid||aid), data)
    })
}
