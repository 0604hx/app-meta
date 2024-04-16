<!--显示我的已关注页面-->
<template>
    <template v-if="beans.length>0">
        <n-space>
            <n-button v-for="(item, index) in beans" block secondary  @click="runPage(item)">
                <template #icon><n-icon :component="item.tpl.icon" :class="item.tpl.theme" /></template>
                <!-- {{item.name}} -->
                <n-ellipsis><Title size="small" :text="item.name" /></n-ellipsis>
            </n-button>
        </n-space>
    </template>
    <div v-else class="h">您收藏的功能页面会显示在此处，方便快速访问</div>
</template>

<script setup>
    import { ref, shallowRef, onMounted } from 'vue'
    import { SyncAlt, Sync, Wrench, Cog } from '@vicons/fa'

    import { runPage } from "@S/Runner"
    import { findTemplate } from "@V/快应用"
    import Title from "@V/widget/page.title.vue"

    import { widgetProps } from "."

    const props = defineProps(widgetProps)

    let beans   = shallowRef([])

    const load = ()=> RESULT("/page/link/list", {}, d=> {
        d.data.forEach(v=> v.tpl = findTemplate(v.template))
        beans.value = d.data
    })
    const refreshCache = ()=> RESULT("/page/link/refresh", {}, d=>{
        M.ok(`快捷功能（已关注页面）缓存已刷新`)
        load()
    })
    onMounted( load )
</script>
