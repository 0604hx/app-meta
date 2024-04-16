<!--单个应用/页面入口的包装-->
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
        let { aid, pid } = params
        H.app.runPage(aid, pid, true)
    }
</script>
