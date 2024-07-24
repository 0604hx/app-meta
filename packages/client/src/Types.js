/**
 * @typedef {Object} RobotTask - 机器人任务对象
 * @property {Object} page
 * @property {Number} page.id - 机器人ID
 * @property {String} page.aid - 应用ID
 * @property {String} page.name - 机器人名称
 * @property {Object} bean - 机器人属性
 * @property {Object} params - 运行时参数
 */

/**
 * @typedef {Object} RobotContext - 机器人运行时配置环境
 * @property {String} link - 关联对象ID，通常与 WorkerTask 关联
 * @property {Boolean} hideWindow - 是否隐藏机器人窗口
 * @property {Boolean} reportLaunch - 是否提交运行数据到服务端
 */
