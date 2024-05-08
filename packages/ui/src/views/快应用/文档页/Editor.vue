<!--表单类型的页面编辑-->
<template>
    <div class="window-h-full" v-if="inited">
        <MDEditor ref="editor" height="100%" :code="bean" />

        <n-space style="position: fixed; top:5px;right: 10px;">
            <n-button type="primary" @click="toSave"> <template #icon><n-icon :component="Check" /></template> 保存文档 </n-button>
        </n-space>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { pageEditor } from "../"
    import { Check, Upload } from "@vicons/fa"

    import MDEditor from "@md.editor"

    let { id, bean, inited, loading , updateContent } = pageEditor()
    let editor = ref()

    let toSave = () => updateContent(editor.value.getMarkdown())
</script>
