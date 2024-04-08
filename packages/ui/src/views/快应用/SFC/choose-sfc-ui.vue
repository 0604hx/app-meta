<!--选择SFC的UI框架-->
<template>
    <n-space vertical size="large">
        <n-alert :bordered="false" type="info">
            1、不同的渲染框架展示效果有差异，请查阅官方文档 <br>
            2、注意，框架选择后，不能修改
        </n-alert>
        <n-radio-group v-model:value="ui" name="radiogroup" size="large">
            <n-space vertical size="large">
                <n-radio v-for="item in uiList" :value="item.id" class="w-full">
                    <n-thing :description="item.url" :content="item.text" content-indented>
                        <template #avatar><img style="width: 60px; max-height: 60px;margin: 6px;" :src="item.img"></template>
                        <template #header> <b>{{item.id}}</b> （版本：{{getVersion(item.package)}}）</template>
                    </n-thing>
                </n-radio>
            </n-space>
        </n-radio-group>

        <div class="text-center">
            <n-button size="large" @click="toCreate" type="primary">创建 SFC 组件</n-button>
        </div>
    </n-space>
</template>

<script setup>
    import { ref } from 'vue'

    import { codeTemplate, uiList, getVersion } from '.'

    const props = defineProps({
        onSelect:{type:Function}
    })

    let ui = ref()

    const toCreate = ()=> {
        if(!ui.value)   return M.warn(`请选择 UI 框架`)

        props.onSelect({ui: ui.value, code: codeTemplate(ui.value)})
    }
</script>
