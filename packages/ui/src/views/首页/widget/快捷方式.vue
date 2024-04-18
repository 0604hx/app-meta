<!--
    单个应用/页面/外部链接入口的包装

    若参数 aid 以 http 开头，则视为外部链接
-->
<template>
    <n-avatar
        class="cursor-pointer"
        @click="onClick"
        :style="{
            color: params.color||'white',
            backgroundColor: params.bgColor||color,
            height,
            width:'100%'
        }"
    >
    {{ params.text }}
    </n-avatar>
</template>

<script setup>
    import { ref } from "vue"

    import { widgetProps } from "."

    const props = defineProps(widgetProps)
    const { params } = props.widget
    const color = window.color
    const height = isNaN(params.height)? (params.height||'60px'):(params.height+'px')

    const onClick = ()=>{
        let { aid, uuid } = props.widget
        if(!aid)    return M.alert(`挂件⌈${uuid}⌋未定义参数 aid`,"参数缺失")

        if(aid.startsWith("http"))
            return H.openUrl(aid, {type:""})

        H.app.runPage(aid, pid, true)
    }
</script>
