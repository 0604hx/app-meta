<!--二维数据表格-->
<template>
    <n-spin :show="loading">
        <n-alert :show-icon="false" :type="theme||'success'" :bordered="false">
            <n-text class="text-4xl">{{content}}</n-text>
            <n-text v-if="suffix" depth="3" class="text-sm ml-1">{{suffix}}</n-text>
        </n-alert>
    </n-spin>
</template>

<script setup>
    import { ref, watch } from 'vue'

    import MDRender from "@md.viewer"
    import { widgetProps, loadData } from "."

    const props = defineProps(widgetProps({
        suffix: {type:String},
        theme:  {type:String, default:""}
    }))

    let { loading, content } = loadData(props)
</script>
