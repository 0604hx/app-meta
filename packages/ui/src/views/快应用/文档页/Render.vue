<!--
    2023-03-29
        增加记录左侧文档清单开关的功能
-->
<template>
    <div v-if="pure" class="markdown-content-div">
        <MDRender :code="code" />
        <div v-if="!code" class="text-center"> <n-text depth="3">-文档空空如也-</n-text> </div>
    </div>
    <n-layout v-else style="height: calc(100vh - 36px)">
        <n-layout-header :style="{height: headerHeight+'px', padding: '8px'}" bordered>
            <n-space justify="space-between">
                <div style="font-size: 24px;"><Title :text="title" /></div>

                <n-button type="primary" secondary @click="toPDF" title="注意，导出的文档内容不能复制或二次编辑">导出文档到PDF</n-button>
            </n-space>
        </n-layout-header>

        <n-layout position="absolute" :style="{top: headerHeight + 'px'}" has-sider>
            <!--同应用下的文档列表，需要展开再加载-->
            <n-layout-sider v-model:collapsed="openSider" collapse-mode="transform" :collapsed-width="collapsedWidth" :width="siderWidth" show-trigger="arrow-circle"
                content-style="padding: 3px;" :native-scrollbar="false" bordered @update:collapsed="onOpen">
                <Other v-if="otherOpen" :page="page" @change="onChange" />
            </n-layout-sider>

            <n-layout  has-sider sider-placement="right">
                <!--文档内容展示区域-->
                <n-layout :native-scrollbar="false" content-style="padding: 8px 30px;">
                    <div class="markdown-content-div">
                        <MDRender :code="code" />
                        <div v-if="!code" class="text-center"> <n-text depth="3">-文档空空如也-</n-text> </div>
                    </div>

                    <DocumentList class="mt-4" :pid="page.id" ref="documentListRef" />
                </n-layout>

                <!--文档目录（自动计算 TOC）-->
                <n-layout-sider collapse-mode="transform" :collapsed-width="collapsedWidth" show-trigger="arrow-circle"
                content-style="padding: 12px;" :native-scrollbar="false" :width="siderWidth" bordered>
                    <!-- <template v-if="tocList.length">
                        <div class="text-center"><n-text class="text-lg">文档目录</n-text></div>
                        <n-hr style="margin:3px 0px 10px 0px" />
                        <n-anchor :show-rail="false" :show-background="true" ref="tocRef">
                            <n-anchor-link v-for="item in tocList" :title="item.name" @click="goto(item)" :href="item.href" :style="{marginLeft:item.level*indent+'px'}" />
                        </n-anchor>
                    </template> -->

                        <div class="text-center"><n-text class="text-lg">文档目录</n-text></div>
                        <n-hr style="margin:3px 0px 10px 0px" />
                        <template v-if="tocList.length">
                            <n-anchor :show-rail="false" :show-background="true" ref="tocRef">
                                <n-anchor-link v-for="item in tocList" :title="item.name" @click="goto(item)" :href="item.href" :style="{marginLeft:item.level*indent+'px'}" />
                            </n-anchor>
                        </template>
                        <div v-else class="text-center">
                            <n-tooltip>
                                <template #trigger>
                                    <n-text depth="3">-无数据-</n-text>
                                </template>
                                文档的标题（{{ headers.join("、") }}）会显示在这里
                            </n-tooltip>
                        </div>
                </n-layout-sider>
            </n-layout>
        </n-layout>
    </n-layout>
</template>

<script setup>
    import { ref, reactive, onMounted, nextTick, computed } from 'vue'

    import html2pdf from 'html2pdf.js'

    import { mdViewerSelector } from "@C/markdown"
    import MDRender from "@md.viewer"
    import DocumentList from "../document-list.vue"

    import { renderProps, loadContent } from "../"
    import Other from "./other.vue"
    import Title from "@V/widget/page.title.vue"

    E.emit("main.padding", 0)
    const props = defineProps(renderProps)

    const KEY               = "app.document.sider"
    const siderWidth        = 300
    const headerHeight      = 50
    const collapsedWidth    = 15
    const indent            = 25
    const headers           = ["H1", "H2", "H3"]

    let title               = ref(props.page.name)
    let code                = ref()
    let documentListRef     = ref()

    let tocRef              = ref()
    let tocList             = ref([])

    let openSider           = ref(true)
    let otherOpen           = ref(false)

    const changeContent = text=>{
        code.value = text
        nextTick(()=> setTimeout(buildTOC, 500))
    }

    const buildTOC = ()=>{
        let _toc    = []
        let counter = 0
        let items   = document.querySelector(mdViewerSelector()).children
        let hashs = location.hash.split("#")

        for (const node of items) {
            let level = headers.indexOf(node.tagName)
            if(level>=0){
                let id = node.id || `H${counter++}`
                if(!node.id){
                    node.id = id
                }
                _toc.push({id:`#${id}`, name:node.innerText, level, href:`#${hashs[1]}#${id}`})
            }
        }
        // nextTick(()=> tocInited.value = true)
        tocList.value = _toc

        //进行内容跳转
        if(hashs.length>2){
            nextTick(()=> goto(_toc.find(t=>t.href==location.hash)))
        }
    }

    const goto = row=> {
        if(!row || !row.id) return

        document.querySelector(row.id).scrollIntoView()
        M.ok(`跳转到⌈${row.name}⌋`)
        tocRef.value.scrollTo(row.href)
    }

    const onOpen = v=>{
        !v && !otherOpen.value && (otherOpen.value = true)

        H.store.set(KEY, !v)
        if(!v)  M.info(`开启左侧文档列表功能`)
    }

    const toPDF = ()=> html2pdf(
        document.querySelector(".markdown-content-div"),
        // 更多配置项详见 https://github.com/eKoopmans/html2pdf.js#options
        {
            margin:       0.3,
            filename:     `${props.page.name}-${H.date.date()}.pdf`,
            image:        { type: 'jpeg', quality: 0.9 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        }
    )

    /**
     * add on 2023-03-21
     * 切换文档，这里存在以下问题：
     *  1、由于是直接加载文档内容，故可能会看到未公开访问（active=0）的文档
     *  2、右下角的页面小助手暂不能联动更新
     *  3、切换后暂不能正常统计阅读量
     *
     * 以后再修复了....
     */
    const onChange = newPage=>{
        title.value = newPage.name

        loadContent(newPage.key)
            .then(d=>{
                changeContent(d.data)

                nextTick(()=>{
                    let firstH = document.querySelector("#H0")
                    firstH && firstH.scrollIntoView()
                    //更新 hash
                    location.hash = `#/app/${newPage.aid}/${newPage.key}`
                    M.ok(`切换文档 ⌈${newPage.name}⌋`)

                    documentListRef.value.refresh(newPage.key)
                })
            })
    }

    onMounted(() => {
        changeContent(props.data)

        if(H.store.boolean(KEY)){
            nextTick(()=> {
                openSider.value = false
                otherOpen.value = true
            })
        }
    })
</script>
