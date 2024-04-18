/**
 * @typedef {Object} ServerConfig
 * @property {Number} port - 服务端口，默认9000
 * @property {String} url - 服务地址（仅当部署模式为外部时有值）
 * @property {String} args - 启动参数
 * @property {Boolean} useDB - 是否启用数据库
 * @property {Boolean} useSource - 是否使用现有数据源
 * @property {Number} dbSource - 数据源ID
 * @property {String} dbHost - 数据库地址
 * @property {String|Number} dbPort - 数据库端口
 * @property {String} dbName - 数据库名
 * @property {String} dbUser - 数据库登录用户名
 * @property {String} dbPwd - 数据库登录密码
 */

export const INSIDE = "inside"

export const deployModes = [
    { label:"平台部署", value: INSIDE, summary:"使用平台进行部署及进程管理（目前仅支持 nodes.js 开发语言）" },
    { label:"外部应用", value:"outside", summary:"应用已经部署，通过 URL 进行请求转发" }
]

export const languages = UI.buildOptions("node|Node.js,java|Java 归档（可执行）,exe|OS可执行程序")

/**
 * @param {ServerConfig} bean
 */
export const checkServerConfig = bean=>{
    let fails = []
    if(bean.useDB){
        if(bean.useSource){
            if(!bean.dbSource)  fails.push(`数据源未选择`)
        }
        else{
            if(!(bean.dbHost && bean.dbPort))
                fails.push(`数据库地址/端口未填写`)
            if(!bean.dbUser)    fails.push(`数据库用户未填写`)
        }
    }
    if(fails.length){
        return M.dialog({
            title:`服务配置检验不通过（存在 ${fails.length} 个问题）`,
            type:"error",
            content: UI.html(fails)
        })
    }

    return true
}
