/**
 * @typedef {Object} PropertyItem
 * @property {String} msg - 提示信息
 * @property {String} key - 属性键
 * @property {*} default - 默认值
 * @property {String} form - 输入类型，默认为空/input
 * @property {Array} options - 可选项（仅针对form=select/radio）类型
 * @property {Boolean} required - 是否为必填
 * @property {Function} validate - 检验函数，返回 true 则通过
 */

/**
 * @typedef {Object} PageFileOptions - 文件部署参数
 * @property {String} charset - 编码
 * @property {Boolean} tail - 跟踪
 * @property {Boolean} download - 下载
 * @property {Boolean} remove - 删除
 */
