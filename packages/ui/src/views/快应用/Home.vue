<template>
    <n-card>
        <template #header>
            <n-space>
                <Logo :text="app.abbr" />
                <div class="text-2xl" style="line-height: 40px;">{{app.name}}</div>
            </n-space>
        </template>

        <MDRender :code="app.summary" />
        <!-- {{app.summary}} -->
    </n-card>

    <div class="mt-3" v-if="pageLoaded">
        <div v-if="pages.length==0" class="text-center">该应用暂未创建任何功能页面</div>
        <div v-else>
            <n-grid x-gap="10" y-gap="10" responsive="screen" cols="3 m:2 s:1 l:3" class="custom-btn-list">
                <n-gi v-for="page in pages">
                    <n-button block secondary  type="default" tag="div" @click="runPage(page)" style="padding: 14px 24px;">
                        <div class="text-left w-full">
                            <n-space justify="space-between">
                                <div class="text-lg">
                                    <span class="mr-2 mt-2"><Template icon :bean="page.tpl" /></span>
                                    <!-- <Title :text="page.name" /> -->
                                    <n-ellipsis><Title size="small" :text="page.name" /></n-ellipsis>
                                </div>
                                <PageLink :id="page.id" :linked="page.active" color="primary" />
                            </n-space>
                            <n-space justify="space-between" class="mt-2">
                                <div>
                                    <n-icon :component="Fire" /> 热度 {{page.launch}}
                                </div>
                                <n-text depth="3">{{toDate(page.addOn)}}</n-text>
                            </n-space>
                        </div>
                    </n-button>
                </n-gi>
            </n-grid>
            <div class="mt-2">
                <n-text depth="3">共 {{pages.length}} 个功能页（点击即可运行）</n-text>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref,onMounted } from 'vue'
    import { Fire } from "@vicons/fa"

    import { runPage } from "@S/Runner"
    import { templates } from "./"

    import MDRender from "@md.viewer"
    import Logo from "@VW/app.logo.vue"
    import Template from "../widget/page.template.vue"
    import PageLink from "../widget/page.link.vue"
    import Title from "@V/widget/page.title.vue"

    const props = defineProps({
        app:{type:Object}
    })

    let pageLoaded  = ref(false)
    let pages       = []

    const toDate    = d=>H.date.date(d)

    onMounted(() => {
        // 仅显示授权的页面
        RESULT("/page/list-authable", {form:{EQ_aid:props.app.id}}, d=> {
            d.data.forEach(b=>b.tpl = templates.find(v=>v.id==b.template))
            pages = d.data

            pageLoaded.value = true
        })
    })
</script>

