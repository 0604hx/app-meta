<!--表单类型的页面编辑-->
<template>
    <n-card size="small">
        <template #header>
            <Robot class="icon mr-1 primary" /> 网页脚本机器人设置
        </template>
        <template #header-extra>
            <n-button type="primary" @click="toSave">保存</n-button>
        </template>

        <n-form v-if="inited" :model="bean" label-placement="top" label-width="120" :show-feedback="false">
            <n-grid :x-gap="12" :y-gap="12" cols="4 xs:2 s:3 m:4 xl:6 l:5" responsive="screen"> <!--4 s:2 m:3 xl:5 l:4-->
                <n-form-item-gi label="首页地址">
                    <n-input v-model:value="bean.url" placeholder="WEB 地址（必须以 http 开头）" />
                </n-form-item-gi>

                <n-form-item-gi label="窗口宽度（单位 px）">
                    <n-input-group>
                        <n-input-number :bordered="true" class="w-full" v-model:value="bean.windowWidth" min="100" step="50">
                            <template #prefix> <Tag>宽</Tag></template>
                        </n-input-number>
                        <n-input-number :bordered="true" class="w-full" v-model:value="bean.windowHeight" min="100" step="50">
                            <template #prefix> <Tag>高</Tag> </template>
                        </n-input-number>
                    </n-input-group>
                </n-form-item-gi>

                <n-form-item-gi>
                    <template #label>
                        结束时截图
                        <n-tooltip trigger="hover">
                            <template #trigger> <QuestionCircle class="icon ml-1 info" /> </template>
                            机器人作业结束时对当前窗口内容进行截图（注意手动关闭窗口不会触发截图）
                        </n-tooltip>
                    </template>
                    <n-switch v-model:value="bean.snapshot" />
                </n-form-item-gi>

                <n-form-item-gi>
                    <template #label>
                        数据目录复用
                        <n-tooltip trigger="hover">
                            <template #trigger> <QuestionCircle class="icon ml-1 info" /> </template>
                            是否将该机器人所产生的数据保存到同一目录内（不勾选时，每次执行都创建独立的目录）
                        </n-tooltip>
                    </template>
                    <n-switch v-model:value="bean.merge" />
                </n-form-item-gi>

                <n-form-item-gi label="执行超时">
                    <n-input-number v-model:value="bean.timeout" class="w-full" min="30" max="3600" step="30">
                        <template #suffix> <Tag>秒</Tag> </template>
                    </n-input-number>
                </n-form-item-gi>

                <n-form-item-gi>
                    <template #label>
                        脚本延迟
                        <n-tooltip trigger="hover">
                            <template #trigger> <QuestionCircle class="icon ml-1 info" /> </template>
                            目标页面加载完成后，等待一定时间再执行机器人脚本（尽可能使得页面数据已经完备）
                        </n-tooltip>
                    </template>

                    <n-input-number v-model:value="bean.delay" class="w-full" min="0" max="30">
                        <template #suffix> <Tag>秒</Tag> </template>
                    </n-input-number>
                </n-form-item-gi>
            </n-grid>
            <n-form-item class="mt-3">
                <template #label>
                    额外请求头
                    <n-tooltip trigger="hover">
                        <template #trigger> <QuestionCircle class="icon ml-1 info" /> </template>
                        用换行符 <Tag>\n</Tag> 进行分割
                    </n-tooltip>
                </template>
                <n-input v-model:value="bean.headers" />
            </n-form-item>

            <n-form-item class="mt-3" :show-label="false">
                <div class="w-full">
                        <n-space justify="space-between">
                            <div>
                                <Tag size="medium" type="info">脚本代码</Tag>
                                <n-text depth="3" class="ml-1">仅支持标准 javascript 代码噢</n-text>
                            </div>

                            <n-button @click="toImport" size="small" secondary type="primary" class="fr">从文件中导入</n-button>
                        </n-space>
                    <div class="mt-2">
                        <CodeEditor v-model:value="bean.code" height="calc(100vh - 315px)" :tabSize="4" />
                    </div>
                </div>
            </n-form-item>
        </n-form>
    </n-card>
</template>

<script setup>
    import { ref } from 'vue'
    import { pageEditor, initCtrlAndS } from "../"
    import { Check, Upload, Robot, QuestionCircle } from "@vicons/fa"

    import CodeEditor from "@C/editor.code.vue"

    import { createRobot } from "."

    let { id, bean, inited, loading , updateContent } = pageEditor(createRobot, d=> JSON.parse(d), { padding: false })

    const toImport = ()=> H.io.chooseAndRead(".js").then(d=> {
        bean.value.code = d.result
        M.ok(`从⌈${d.filename}⌋导入成功`)
    })
    let toSave = () => {
        let { url, code } = bean.value
        if(!url || !code) return M.warn(`首页地址或脚本代码不能为空`)

        updateContent(JSON.stringify(bean.value))
    }

    initCtrlAndS(toSave)
</script>
