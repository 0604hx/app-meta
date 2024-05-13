<template>
    <n-card>
        <template #header>
            <n-icon class="pt-1" :component="isNew?PlusCircle:Edit" />
            {{isNew?"创建新":"编辑"}}应用
        </template>

        <n-form v-if="inited" ref="formRef" :model="app" :rules="rules" label-placement="top" label-width="120" require-mark-placement="right-hanging">
            <n-grid :x-gap="12" :cols="2">
                <n-gi>
                    <n-form-item label="应用编号" path="id">
                        <n-input-group>
                            <n-input :style="{ width: '83%' }" v-model:value="app.id" :disabled="!isNew" />
                            <div style="width:17%">
                                <n-popover trigger="hover">
                                    <template #trigger> <n-button block tertiary @click="buildId" :disabled="!isNew">自动生成</n-button> </template>
                                    取应用名称的拼音首字母组成编号
                                </n-popover>
                            </div>
                        </n-input-group>
                    </n-form-item>
                </n-gi>
                <n-gi>
                    <n-form-item label="应用类型" path="category">
                        <n-radio-group v-model:value="app.category" :disabled="!isNew">
                            <n-radio-button v-for="c in categories" :value="c.value" :disabled="c.disabled"> {{ c.name }} </n-radio-button>
                        </n-radio-group>
                        <n-text depth="3" v-if="!isNew" class="ml-4">类型一经确认将无法变更</n-text>
                    </n-form-item>
                </n-gi>
                <n-gi>
                    <n-form-item label="应用名称及简称" path="name">
                        <n-input-group>
                            <n-input :style="{ width: '83%' }" v-model:value="app.name" minlength="2" maxlength="15" show-count placeholder="长度在2到15之间" />
                            <n-input :style="{ width: '17%' }" v-model:value="app.abbr" minlength="1" maxlength="3" show-count placeholder="简称" />
                        </n-input-group>
                    </n-form-item>
                </n-gi>
                <n-gi>
                    <n-form-item label="应用作者" path="author">  <n-input v-model:value="app.author" /> </n-form-item>
                </n-gi>

                <n-gi :span="2">
                    <n-form-item path="summary">
                        <template #label>
                            <n-flex>
                                <div>
                                    应用简介
                                    <n-text depth="3" class="ml-2 text-xs">支持 MARKDOWN 语法</n-text>
                                </div>
                                <n-checkbox label="启用富文本编辑器" v-model:checked="useMD" />
                            </n-flex>
                        </template>
                        <!--启用 Markdown 编辑器-->
                        <MDEditor v-if="useMD" ref="summaryEditor" height="300px" :code="app.summary" />
                        <n-input v-else v-model:value="app.summary" :rows="8" type="textarea" />
                    </n-form-item>
                </n-gi>
            </n-grid>
        </n-form>

        <!-- <n-divider title-placement="left">应用属性设置</n-divider> -->
        <n-alert type="info" title="应用属性设置" :bordered="false">
            配置应用运行窗口（合适的大小会使视觉效果锦上添花噢）、环境等
        </n-alert>

        <n-form ref="formWinRef" :show-feedback="false" :model="property" label-placement="left" class="mt-4" label-width="100">
            <n-grid :x-gap="12" cols="xl:5 l:4 m:3 s:1" responsive="screen">
                <n-gi>
                    <n-form-item path="winFrame">
                        <template #label>
                            边框
                            <n-tooltip>
                                <template #trigger><QuestionCircle class="icon" /> </template>
                                是否显示窗体边框
                            </n-tooltip>
                        </template>
                        <n-switch v-model:value="property.winFrame" />
                    </n-form-item>
                </n-gi>
                <n-gi>
                    <n-form-item path="winMax">
                        <template #label>
                            全屏启动
                            <n-tooltip>
                                <template #trigger><QuestionCircle class="icon" /> </template>
                                勾选后打开应用时自动进入全屏状态
                            </n-tooltip>
                        </template>
                        <n-switch v-model:value="property.winMax" />
                    </n-form-item>
                </n-gi>
                <n-gi>
                    <n-form-item label="窗口宽度" path="winWidth">
                        <n-input-number :disabled="property.winMax" class="w-full" v-model:value="property.winWidth" min="100" step="50">
                            <template #suffix> <n-tag :bordered="false" type="primary" size="small">px</n-tag> </template>
                        </n-input-number>
                    </n-form-item>
                </n-gi>
                <n-gi>
                    <n-form-item label="窗口高度度" path="winHeight">
                        <n-input-number :disabled="property.winMax" class="w-full" v-model:value="property.winHeight" min="100" step="50">
                            <template #suffix> <n-tag :bordered="false" type="primary" size="small">px</n-tag> </template>
                        </n-input-number>
                    </n-form-item>
                </n-gi>
                <n-gi>
                    <n-form-item>
                        <template #label>
                            原生环境
                            <n-tooltip>
                                <template #trigger><QuestionCircle class="icon" /> </template>
                                勾选后，该应用需要运行在原生环境（即桌面应用）
                            </n-tooltip>
                        </template>
                        <n-switch v-model:value="property.native" />
                    </n-form-item>
                </n-gi>
            </n-grid>
        </n-form>

        <div class="text-center mt-4">
            <n-button type="primary" size="large" @click="toSave" :loading="loading">
                <template #icon> <n-icon :component="Check" /> </template>
                保存应用信息
            </n-button>
        </div>
    </n-card>
</template>

<script setup>
    import { ref,onMounted, toRaw, unref } from 'vue'
    import { useRoute, useRouter } from 'vue-router'

    import { Check, PlusCircle, Edit, Windows, InfoCircle, QuestionCircle } from '@vicons/fa'
    import pinyin from 'js-pinyin'

    import MDEditor from "@md.editor"
    import { categories } from "@S/Common"

    const route = useRoute()
    const router = useRouter()
    const id = route.query.id
    const isNew = !id

    let rules = {
        id: { required: true, message: "请填写应用编号", trigger: "blur" },
        name: { required: true, message: "请填写应用名称", trigger: "blur" },
        category: { required: true, type:"number", message: "请选择应用类型", trigger: "blur" }
    }

    let useMD = ref(false)        //简介是否启用 Markdown 编辑器
    let summaryEditor = ref()
    let formRef = ref()
    let inited  = ref(false)
    let app = ref({})
    let property = ref({})
    let loading = ref(false)

    let buildId = ()=> app.value.id = pinyin.getCamelChars(app.value.name)

    const _onInit = (_app, _property={ winMax:false, winWidth:1280, winHeight:760, winFrame:true, native: false }) => {
        app.value = _app
        property.value = _property
        inited.value = true
    }

    let createOrLoad = ()=>{
        if(isNew) return _onInit({id:"", name:"", category:0, active: false })

        RESULT(`/app/detail`, {id}, d=> _onInit(d.data.app, d.data.property) )
    }

    let toSave = ()=>{
        formRef.value?.validate(err=> {
            if(err)   return M.warn(`表单内有 ${err.length} 个无效项`)
            if(summaryEditor.value != null)
                app.value.summary = summaryEditor.value.getMarkdown()

            RESULT(
                `/app/${isNew?"create":"update"}`,
                { app: _raw(app), property:_raw(property) },
                d=>{
                    M.dialog({
                        type:"success",
                        title: d.data||"应用创建成功",
                        content: UI.html(`恭喜🎉，应用<b class="primary">⌈${app.value.name}⌋</b>${isNew?'创建':'更新'}成功，请分享给有需要的小伙伴吧`),
                        positiveText: "前往编辑页面",
                        positiveButtonProps:{disabled: app.value.category!=0},
                        negativeText: "查看应用列表",
                        onPositiveClick: () => router.push({name:"app-page", params:{id: app.value.id}}),
                        onNegativeClick: () => router.push({name:"app-home"})
                    })
                },
                { loading }
            )
        })
    }

    onMounted( createOrLoad )
</script>
