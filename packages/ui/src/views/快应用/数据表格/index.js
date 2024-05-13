const DATA = "data"

// 数据源
export const dataTypes = [
    { value:DATA, label:"数据模块" },
    { value:"faas", label:"FaaS函数" },
    { value:"service", label:"后台服务", disabled: true }
]

export const tableConfig = ()=>({
    title:      "数据筛选",

    dataType :  DATA,   //默认源为数据模块

    pid:        null,   //数据范围
    uid:        true,   //是否允许检索用户ID，如果为非空字符，则显示指定用户
    time:       true,   //是否允许按照时间段检索
    filters:    [],     //预设的筛选条件，如果为空则允许用户自行添加条件
    defaultCol: true,   //是否显示默认的列
    columns:    [],     //字段设置
    pading:     false,  //是否允许分页
    pageSize:   200,    //每页查询的数据量
    desc:       false,

    export:     false,  //是否允许导出
    exportName: "",     //导出的文件名称
    exportType: "xlsx", //导出格式
    exportScript: "",   //数据导出的脚本，如果定义则显示下载按钮
})

/**
 * 基础列
 * @returns
 */
export function basicColumns(defaultCol=true){
    let cols = [{ title:"#", width:50, render:(_,i)=> i+1 }]
    if(defaultCol){
        cols.push(
            { title:"日期", key:"addOn", width: 170, render: row=> H.date.datetime(row.addOn) },
            { title:"录入者", key:"uid", width: 150 }
        )
    }

    return cols
}

/**
 * 如果为数值则转换为 Number
 *
 * 此处暂不考虑 true/false 的布尔型
 *
 * 方案一：仅仅对数字进行处理
 * const _fix = v=> isNaN(v)?v:Number(v)
 *
 * 方案二：默认按照字符串对待，如果输入的是 @TRUE 或者 @FALSE 则转换为布尔型；如果是 @{数值} 则转换为数字
 *
 * @param {*} v
 * @returns
 */
const _fix = v=>{
    if(v==='@TRUE')         return true
    else if(v==='@FALSE')   return false
    else if(v.indexOf("@")==0 && !isNaN(v.substring(1)))
        return Number(v.substring(1))
    return v
}

/**
 * 字段筛选方式
 */
export const operations = [
    { label:"等于", value:"EQ" },
    { label:"包含", value:"LIKE" },
    { label:"小于", value:"LT" },
    { label:"不大于", value:"LTE" },
    { label:"大于", value:"GT" },
    { label:"不小于", value:"GTE" },
    { label:"不等于", value:"NE" },
    { label:"在", value:"IN" },
    { label:"不在", value:"NIN" }
]

/**
 * 构建过滤器（会对数据类型进行自我修正）
 * 1、纯数字的文本将转换为 Int 或者 Float
 * 2、对于 op = IN 或者 NIN 会将 value 转换为 List 类型
 * @param {*} filters
 */
export function buildQueryFilter(filters){
    if(!Array.isArray(filters)) throw Error(`参数 filters 必须为数组`)

    let match = []
    for(let i = 0; i<filters.length; i++){
        let filter = filters[i]
        if(!filter.field)   throw Error(`条件 ${i+1} 的字段不能为空`)

        let v = ""
        if(filter.op == "IN" || filter.op == "NIN"){
            if(!!filter.value){
                try{
                    v = JSON.parse(filter.value[0] != '['?`[${filter.value}]`:filter.value).map(_fix)
                }catch(e){
                    throw Error(`条件 ${i+1} 的筛选值格式有误（在/不在 条件时请填写 JSON 数组）`)
                }
            }
        }
        else {
            v = _fix(filter.value)
        }

        match.push({field: filter.field, op: filter.op, value: v})
    }

    return match
}
