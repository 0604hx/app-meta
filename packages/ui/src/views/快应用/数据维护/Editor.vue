<!---->
<template>
    <n-form v-if="inited" :show-feedback="false" label-placement="top">
        <n-grid :cols="4" x-gap="10" class="mb-2">
            <n-form-item-gi label="允许的文件格式">
                <n-select v-model:value="bean.types" :options="fileTypes" multiple></n-select>
            </n-form-item-gi>
            <n-form-item-gi label="文件大小阈值">
                <n-input-number v-model:value="bean.maxSize" class="w-full" :min="1" :max="5">
                    <template #suffix> <n-tag :bordered="false" type="info" size="small">MB</n-tag> </template>
                </n-input-number>
            </n-form-item-gi>
            <n-form-item-gi>
                <template #label>
                    <n-tooltip> <template #trigger>读取方式</template> 仅对 EXCEL、CSV 格式文件生效 </n-tooltip>
                </template>
                <n-select v-model:value="bean.dataType" :options="dataTypes"></n-select>
            </n-form-item-gi>
            <n-form-item-gi>
                <template #label>
                    <n-tooltip> <template #trigger>文件按钮文本</template>显示在按钮上面的文字</n-tooltip>
                </template>
                <n-input v-model:value="bean.btnText" />
            </n-form-item-gi>
        </n-grid>

        <n-space vertical>
            <n-form-item>
                <template #label>
                    <span class="text-lg">描述信息</span>
                    <n-text class="ml-3" depth="3">目前支持用户导入 TXT、CSV、XLSX 格式的文件</n-text>
                </template>
                <MDEditor ref="mdEditor" height="260px" :code="bean.summary" />
            </n-form-item>
            <n-form-item>
                <template #label>
                    <span class="text-lg">脚本代码</span>
                    <n-text class="ml-3" depth="3">仅支持标准 JavaScript 代码，参数：data=文件内容，filename=文件名（小提示：测试阶段可以将读取到的文件内容复制到全局变量以便调试）</n-text>
                </template>
                <div class="w-full">
                    <CodeEditor v-model:value="bean.code" height="calc(100vh - 510px)" :tabSize="2" />
                </div>
            </n-form-item>
        </n-space>
    </n-form>

    <div class="text-center mt-2">
        <n-button type="primary" @click="toSave">保存信息及代码</n-button>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { Trash } from '@vicons/fa'

    import CodeEditor from "@C/editor.code.vue"
    import MDEditor from "@md.editor"

    let mdEditor = ref()

    import { pageEditor } from "../"

    const fileTypes = UI.buildOptions(".xlsx|EXCEL 表格,.csv|CSV 文件,.txt|TXT 纯文本")
    const dataTypes = UI.buildOptions("JSON,ARRAY|二维数组")

    let { id, bean, inited, updateContent } = pageEditor(
        { summary:"", code:"", types:[".xlsx",".csv",".txt"], maxSize:1, dataType:"JSON", btnText:"选择数据文件" },
        d=> JSON.parse(d),
        { padding: false }
    )

    const toSave = ()=>{
        let model = {}
        Object.keys(bean.value).forEach(v=> model[v] = bean.value[v])
        if(!model.code.trim())  return M.warn(`脚本代码不能为空`)

        model.summary = mdEditor.value.getMarkdown()

        updateContent(JSON.stringify(model))
    }
</script>
