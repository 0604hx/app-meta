<template>
    <!-- bottom: 30px;right:2px -->
    <n-element style="position:fixed;z-index: 999;bottom: -11px;right:-6px;width: 44px;height:44px;">
        <n-popover trigger="click" style="width: 260px" @update:show="onShow" placement="top-end">
            <template #trigger>
                <n-button circle quaternary size="small" type="primary"><template #icon><n-icon :component="Cog" /></template></n-button>
            </template>
            <template #header><n-text class="text-lg">页面小助手</n-text></template>

            <n-space vertical>
                <n-space justify="space-between">
                    <n-text>关注该页面</n-text>
                    <n-switch :disabled="!link.checked" v-model:value="link.value" @update:value="onLinkChange" />
                </n-space>
                <n-space justify="space-between">
                    <n-text>发布者</n-text>
                    <n-text depth="3">{{page.uid}}</n-text>
                </n-space>
                <n-space justify="space-between">
                    <n-text>最后更新于</n-text>
                    <n-text depth="3">{{toDate(page.addOn)}}</n-text>
                </n-space>

                <n-button secondary block @click="copyId">复制编号 ID 到粘贴板</n-button>
                <n-button secondary block @click="shortUrl">生成短链接（便于分享）</n-button>
            </n-space>
        </n-popover>
    </n-element>
</template>

<script setup>
    import { ref, reactive } from 'vue'
    import { Bars, Cog } from '@vicons/fa'

    const props = defineProps({page:Object})

    let link    = reactive({checked: false, value: false })

    const toDate = d=>H.date.datetime(d)
    const onShow = show=>{
        if(show == true && !link.checked){
            RESULT("/page/link/check/"+props.page.id, {}, d=>{
                link.checked = true
                link.value = d.data
            })
        }
    }
    const copyId = row=>{
        let id = `${props.page.aid}/${props.page.id}`
        H.copyTo(id)
        M.ok(`⌈${id}⌋ 已复制到粘贴板`)
    }

    const shortUrl = ()=> M.prompt("自定义短链接", { placeholder:"留空则由平台自动生成", enableEmpty:true }).then(id=> {
        RESULT("/s/create", { key:`/${location.hash}`, id }, d=>{
            H.copyTo(`${location.origin}${window.SERVER}/s/${d.data}`)
            M.ok(`短链接已复制到粘贴板：${d.data}`)
        })
    })

    const onLinkChange = v=> RESULT(
        v?'/page/link/add':`/page/link/remove/${props.page.id}`,
        v?{pid: props.page.id}:{}, d=>M.ok(`${v?"关注":"取消"}成功`)
    )
</script>
