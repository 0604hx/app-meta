import VantLogo from './logo/vant.png'
import VarletLogo from './logo/varlet.svg'
import NaiveLogo from './logo/naive.svg'

import NaiveRender from './sfc-naive.vue'
import VantRender from './sfc-vant.vue'
import VarletRender from './sfc-varlet.vue'

const NAIVE     = "NAIVE"
const VANT      = "VANT"
const VARLET    = "VARLET"

export const naiveTemplate = `<template>
    {{text}}，counter = {{count}}

    <div>
        <n-button type="primary" @click="()=>count++">点我+1</n-button>
    </div>
</template>
<script setup>
    import { ref } from 'vue'

    // 支持的组件，注意引入路径不能修改（完整组件清单，请打开右上角帮助）
    // 分页封装
    // import P from "@Pagination"
    // 图表组件
    // import Chart from "@C/chart.vue"

    let text = ref("这是一个 SFC 模版")
    let count = ref(0)
</script>
`

export const vantTemplate = `<template>
    {{text}}，counter = {{count}}
    <div>
        <van-space>
            <van-button type="primary" @click="()=>count++">点我+1</van-button>
            <van-button type="primary" @click="showOk">弹出通知</van-button>
        </van-space>
    </div>
</template>
<script setup>
    import { ref } from 'vue'

    // 默认导入全部的 Vant 组件（van-xxxx 格式）
    // 同时支持扩展组件，注意引入路径不能修改（完整组件清单，请打开右上角帮助）

    let text = ref("这是一个基于 Vant4 的 SFC 模版（适配 PC 端、移动端）")
    let count = ref(0)

    const showOk = ()=>M.ok('操作成功')
</script>
`

export const varletTemplate = `<template>
    <var-result  type="success"  title="渲染成功" description="嗨~ 我是结果页的一段描述~">
        <template #footer>
            {{text}}，counter = {{count}}
            <var-space  justify="center">
                <var-button type="primary" @click="()=>count++">点我+1</var-button>
                <var-button type="primary" @click="showOk">弹出通知</var-button>
            </var-space>
        </template>
    </var-result>
</template>

<script setup>
    import { ref } from 'vue'

    // 默认导入全部的 Varlet 组件（var-xxxx 格式）
    // 同时支持扩展组件，注意引入路径不能修改（完整组件清单，请打开右上角帮助）

    let text = ref("这是一个基于 Varlet 的 SFC 模版（适配 PC 端、移动端）")
    let count = ref(0)

    const showOk = ()=>M.ok('操作成功')
</script>
`

export const uiList = [
    { id: NAIVE, text:`管理界面所用 UI，仅支持 PC 端`, img: NaiveLogo, url:"https://www.naiveui.com/" },
    { id: VANT, text:`一个轻量、可定制的移动端组件库（版本 Vant4），有赞公司开源。适配 PC 端、移动端`, img:VantLogo, url:"https://vant-contrib.gitee.io/vant/" },
    { id: VARLET, text:`Material 风格移动端组件库。适配 PC 端、移动端`, img: VarletLogo, url:'https://varlet.gitee.io/varlet-ui/#/en-US/index'}
]

/**
 * 转换器
 * @param {String} code
 */
export const translator = code=>{
    if(code.startsWith("{") && code.endsWith("}"))
        return JSON.parse(code)
    return { ui: NAIVE, code }
}


export const codeTemplate = ui=>{
    if(ui === VANT)     return vantTemplate
    if(ui === VARLET)   return varletTemplate
    return naiveTemplate
}

/**
 *
 * @param {String} ui
 * @returns
 */
export const getRender = ui=>{
    if(ui === VANT)     return VantRender
    if(ui === VARLET)   return VarletRender
    return NaiveRender
}
