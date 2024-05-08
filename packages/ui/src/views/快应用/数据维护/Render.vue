<!--运行快应用-->
<template>
    <n-card size="small" segmented>
        <template #header> <Database class="icon" /> {{page.name}} </template>
        <MDRender :code="bean.summary" />

        <div class="text-center mt-4">
            <n-button size="large" @click="toImport" type="primary">{{bean.btnText}}</n-button>
        </div>

        <DocumentList class="mt-4" :pid="page.id" />
    </n-card>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { Database } from "@vicons/fa"

    import MDRender from "@md.viewer"
    import DocumentList from "../document-list.vue"

    import { runScript } from "@S/Runner"
    import { renderProps } from "../"

    const props = defineProps(renderProps)

    let bean = reactive(JSON.parse(props.data))

    const toImport = ()=> H.io.chooseAndRead(bean.types.join(","), null).then((file)=>{
        H.io.readFile(file, {dataType: bean.dataType}).then(d=>{
            runScript(bean.code, {data:d, filename: file.name})
        })
    })
</script>
