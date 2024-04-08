<template>
    <n-element style="position:fixed;z-index: 999;bottom: -11px;right:-6px;width: 44px;height:44px;">
        <n-popover trigger="click" style="width: 260px" @update:show="onShow" placement="top-end">
            <template #trigger>
                <n-button circle quaternary size="small" type="primary"><template #icon><n-icon :component="Cog" /></template></n-button>
            </template>
            <template #header><n-text class="text-lg">编辑小助手</n-text></template>

            <n-space vertical>
                <n-space justify="space-between">
                    <n-text>应用/功能ID</n-text>
                    <n-text depth="3">{{aid}}/{{id}}</n-text>
                </n-space>
                <n-button secondary type="primary" block @click="toSelectCache">从本地缓存恢复历史数据</n-button>
            </n-space>
        </n-popover>
    </n-element>
</template>

<script setup>
    import { ref, reactive, h } from 'vue'
    import { useRoute } from 'vue-router'
    import { Bars, Cog } from '@vicons/fa'

    import SelectCache from './select-cache.vue'

    let {id, aid}   = useRoute().params

    const onShow = show=>{}

    const toSelectCache = ()=> {
        const dialog = M.dialog({
            maskClosable: false, showIcon: false, style:{width:'80%'},
            title: `请选择需要还原的缓存`,
            content: ()=>h(SelectCache, {pid: id, onSelect: ()=>{
                dialog.destroy()
            }})
        })
    }
</script>
