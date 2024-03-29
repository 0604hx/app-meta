<template>
    <n-layout style="height: calc(100vh - 36px)">
        <n-layout-header :style="{height: headerHeight+'px', padding: '8px'}" bordered>
            <n-space justify="space-between">
                <!-- <div style="font-size: 24px;"><Title :text="title" /></div> -->
                <div :style="{lineHeight:(headerHeight-10)+'px'}">
                    <Tag class="mr-2" size="large">UI框架：{{bean.ui}}</Tag>
                    <n-text depth="3">左侧为代码编辑，右侧为预览（在编辑区按下 <Tag>CTRL+S</Tag> 可即时渲染）</n-text>
                </div>

                <n-space>
                    <n-button type="primary" @click="toHelp" secondary>帮助（CTRL+SHIFT+H）</n-button>
                    <n-button type="primary" @click="toView" secondary>预览（CTRL+S）</n-button>
                    <n-button type="primary" @click="toSave">保存</n-button>
                </n-space>
            </n-space>
        </n-layout-header>

        <n-layout position="absolute" :style="{top: headerHeight + 'px'}" has-sider>
            <n-split direction="horizontal" style="height: 100%" :max="0.8" :min="0.2" :resize-trigger-size="5">
                <template #1>
                    <CodeEditor @keydown="handleKeyDown" v-model:value="bean.code" class="h-full" ref="editor" language="html" style="height: 100%;" />
                </template>
                <template #2>
                    <div class="p-2">
                        <component v-if="inited" ref="sfc" :is="getRender(bean.ui)" :code="bean.code" :done="onLoad" />
                    </div>
                </template>
            </n-split>
            <!-- <n-layout  has-sider sider-placement="right">
                <n-layout :native-scrollbar="false" content-style="height:100%">
                    <CodeEditor @keydown="handleKeyDown" v-model:value="bean.code" class="h-full" ref="editor" language="html" style="height: 100%;" />
                </n-layout>

                <n-layout-sider collapse-mode="transform" :collapsed-width="collapsedWidth" show-trigger="arrow-circle" content-style="padding: 12px;" :native-scrollbar="false" :width="siderWidth" bordered>
                    <component v-if="inited" ref="sfc" :is="getRender(bean.ui)" :code="bean.code" :done="onLoad" />
                </n-layout-sider>
            </n-layout> -->
        </n-layout>
    </n-layout>

    <n-drawer v-model:show="help" width="920">
        <n-drawer-content title="单文件组件（Single File Component）说明" :closable="true" :body-content-style="{padding:'10px'}">
            <MDRender :code="About" />
        </n-drawer-content>
    </n-drawer>
</template>

<script setup>
    import { ref } from 'vue'
    import { pageEditor } from "../"
    import { Check, Upload } from "@vicons/fa"

    import CodeEditor from "@C/editor.code.vue"
    import Title from "@V/widget/page.title.vue"

    import About from "./说明.md?raw"

    import MDRender from "@C/markdown/md.viewer.vue"

    import { translator, getRender } from "."

    const siderWidth        = "50%"
    const headerHeight      = 50
    const collapsedWidth    = 15

    let sfc                 = ref()
    let help                = ref(false)

    let { id, bean, inited, loading , updateContent } = pageEditor("", translator)

    const handleKeyDown = e =>{
        let {ctrlKey, keyCode, shiftKey } = e
        if(ctrlKey==true && keyCode==83){
            e.preventDefault()
            toView()
        }
        else if(ctrlKey == true && shiftKey == true && keyCode == 72){
            e.preventDefault()
            toHelp()
        }
    }

    const toHelp    = ()=> help.value = true
    const onLoad    = ()=> M.ok(`组件已刷新`)
    const toView    = ()=> sfc.value.refresh()
    const toSave    = () => updateContent(JSON.stringify(bean.value))
</script>
