<!---->
<template>
    <n-tabs type="line">
        <n-tab-pane name="edit" display-directive="show:lazy" tab="问卷编辑">
            <Editor v-if="inited" :bean="bean" :updater="updateContent" :creater="newQ" />
        </n-tab-pane>
        <n-tab-pane name="dashboard" display-directive="show:lazy" tab="填报结果统计">
            <Dashboard />
        </n-tab-pane>
    </n-tabs>
</template>

<script setup>
    import { ref } from 'vue'

    import { pageEditor } from "../"
    import Editor from "./editor.vue"
    import Dashboard from "./dashboard.vue"

    const newQ = ()=>({title:'', type:0, required:false})

    let { id, bean, inited, updateContent } = pageEditor(
        {anonymous:false, time: null,summary:"", limit:1, items:[newQ()]},
        d=> JSON.parse(d),
        false
    )
</script>
