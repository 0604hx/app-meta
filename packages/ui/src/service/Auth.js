/*
 * @Author: 集成显卡
 * @Date: 2022-11-02 13:34:30
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2024-04-17 22:38:36
 */
export const ADMIN = "ADMIN"

export function checkRole(requireRole) {
    let roles = window.User ? (User.roles || []) : []
    return typeof (requireRole) === 'string' ? roles.includes(requireRole) : requireRole(roles)
}

export const hasAnyRole = (...items)=>{
    let roles = window.User ? (User.roles || []) : []
    return roles.some(r=> items.includes(r))
}

export const hasAllRole = (...items)=>{
    let roles = window.User ? (User.roles || []) : []
    return items.every(r=> roles.includes(r))
}

/**
 * 是否为管理员或者指定的角色
 * @param  {...String} items
 * @returns
 */
export const isAdminOr = (...items)=> hasAnyRole(ADMIN, ...items)

/**
 * 判断是否为开发者角色
 * @returns {Boolean}
 */
export const isDevelopor = ()=> isAdminOr("DEPLOYER", "DEVELOPER")

/**
 * 尝试跳转到 CAS 登录，使用方式：
 *
 * tryLoginWithCAS() && { 其他操作 }
 * @returns 返回 true 时为无需 CAS 登录
 */
export const tryLoginWithCAS = fromUrl =>{
    localStorage.setItem("LOGIN-REDIRECT", fromUrl)

    if(Config.auth_method === 'CAS'){
        // 构建32位长度并以 META 开头的 token
        let token = "META"+H.secret.md5(`${Date.now()}${Math.random()}`).substring(4)
        localStorage.setItem("CAS-TOKEN", token)
        window.location.href = `${window.SERVER}/login_with_cas?token=${token}`

        return false
    }
    return true
}

/**
 * 从远程服务器获取基本信息（包含基础配置项、当前登录信息）
 * 返回 Promise，可在 then 回调中获取数据：
 *  let { settings, user } = d.data
 *
 * @returns
 */
export const loadCommonData = ()=> FETCH_JSON(`${window.SERVER}/welcome`, {}, true)

//默认路由地址
export const defaultRoute = "/welcome"

// 默认的路由名称
export const defaultHome = "/home-v2"
