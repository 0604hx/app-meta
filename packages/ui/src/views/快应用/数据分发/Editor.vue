<template>
    <n-tabs type="line">
        <n-tab-pane name="import" display-directive="show:lazy" tab="数据导入">
            <Importer v-if="inited" :bean="bean" :updater="updateContent" />
        </n-tab-pane>
        <n-tab-pane name="data" display-directive="show:lazy" tab="存量数据">
            <DataManager />
        </n-tab-pane>
        <n-tab-pane name="history" display-directive="show:lazy" tab="历史记录">
            <BatchManager :aid :pid="id" />
        </n-tab-pane>
    </n-tabs>
</template>

<script setup>
    import { ref } from 'vue'

    import { pageEditor } from "../"
    import Importer from "./数据导入.vue"
    import DataManager from "./数据管理.vue"
    import BatchManager from "./导入历史.vue"

    let { id, aid, bean, inited, updateContent } = pageEditor(
        {
            summary:"",         //说明信息
            fields:[],          //字段合集（初始为空，在首次导入数据后确定）
            tableHeight: 400,   //表格高度，如果为负数则是100%高度减值
            indexCol: true,     //是否显示序号列
            virtual: false,     //启用虚拟滚动，应对大量数据
            autoLoad: false,    //是否在页面加载完成后查询

        },
        d=> JSON.parse(d),
        { padding: false }
    )
</script>
