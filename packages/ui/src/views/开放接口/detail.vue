<template>
    <n-form v-if="apiId" :show-feedback="true" size="small" :label-width="80" label-placement="top">
        <n-grid x-gap="20" :cols="4">
            <n-form-item-gi label="是否生效">
                <n-switch v-model:value="bean.active" />
            </n-form-item-gi>
            <n-form-item-gi label="访问授权">
                <AuthSelector ref="authRef" v-model:value="bean.serviceAuth" :tooltip="true"></AuthSelector>
            </n-form-item-gi>
            <n-form-item-gi label="数据源">
                <n-select :options="sources" placeholder="不选则使用默认数据源" v-model:value="bean.sourceId"></n-select>
            </n-form-item-gi>
            <n-form-item-gi>
                <template #label>
                    <n-tooltip>
                        <template #trigger>返回结果格式</template>
                        接口返回值统一为 List：
                        <div><Tag>对象</Tag> 元素为键值对</div>
                        <div><Tag>数组</Tag> 元素为一维数组</div>
                    </n-tooltip>
                </template>
                <n-radio-group v-model:value="bean.resultType">
                    <n-radio value="Object">对象</n-radio>
                    <n-radio value="Array">数组</n-radio>
                </n-radio-group>
            </n-form-item-gi>
        </n-grid>

        <n-form-item label="接口说明">
            <MDEditor ref="mdEditor" height="320px" :code="bean.summary" />
        </n-form-item>

        <n-form-item>
            <template #label>
                SQL 语句
                <n-text depth="3" class="ml-2 text-sm">支持使用 {{tupe}}，届时将替换成对应的参数值</n-text>
            </template>
            <!-- <n-input type="textarea" :rows="3" v-model:value="bean.cmd" /> -->
            <div class="w-full">
                <CodeEditor v-model:value="bean.cmd" ref="editor" language="sql" style="height: 80px;" />
            </div>
        </n-form-item>

        <n-form-item label="接口参数">
            <n-table size="small" :bordered="false">
                <thead>
                    <tr>
                        <th width="120">ID</th>
                        <th width="180">中文名称</th>
                        <th width="180">默认值</th>
                        <th width="100">必填</th>
                        <th>
                            校验正则表达式
                            <n-text depth="3" class="ml-1 text-xs">
                                参数值需满足给定表达式
                            </n-text>
                        </th>
                        <th width="25">
                            <n-button circle size="tiny" secondary type="primary" @click="params.push({})"><template #icon><n-icon :component="Plus" /></template> </n-button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in params">
                        <td><n-input v-model:value="item.id"/> </td>
                        <td><n-input v-model:value="item.name"/> </td>
                        <td><n-input v-model:value="item.value"/> </td>
                        <td><n-switch v-model:value="item.required"/> </td>
                        <td><n-input v-model:value="item.regex"/> </td>
                        <td class="text-center">
                            <n-button circle size="tiny" @click="params.splice(index,1)" tertiary type="error"><template #icon><n-icon :component="Trash" /></template> </n-button>
                        </td>
                    </tr>
                </tbody>
            </n-table>
        </n-form-item>

        <n-space justify="end">
            <n-button size="large" @click="toCall" :loading="loading" type="info" secondary title="使用当前参数测试接口，原始返回值请打开 F12 查看">测试接口</n-button>
            <n-button size="large" @click="toSave" type="primary">保存接口信息</n-button>
        </n-space>
    </n-form>
    <div v-else class="text-center">
        <n-text depth="3">请点击左侧接口以编辑</n-text>
    </div>
</template>

<script setup>
    import { ref, watch,onMounted } from 'vue'
    import { Plus, Trash } from "@vicons/fa"

    import AuthSelector from "@CC/selector.auth.vue"
    import MDEditor from "@md.editor"
    import CodeEditor from "@C/editor.code.vue"

    const tupe = `{{ 变量名 }}`

    const props = defineProps({
        apiId: {type:Number}
    })

    let bean = ref({})
    let params = ref([])
    let loading = ref(false)
    let sources = ref([])

    let mdEditor = ref()

    const refresh = ()=> props.apiId && RESULT("/system/api/detail", {id:props.apiId}, d=> {
        bean.value = d.data
        params.value = JSON.parse(d.data.params||"[]")
    })

    const toSave = ()=> {
        bean.value.summary = mdEditor.value.getMarkdown()
        bean.value.params = JSON.stringify(params.value)

        RESULT("/system/api/update-detail", bean.value, d=> M.ok(`接口更新成功`) )
    }

    const toCall = ()=>{
        let ps = {}
        params.value.forEach(p=> ps[p.id] = p.value)

        RESULT("/api/"+props.apiId, ps, d=>{
            M.showData(JSON.stringify(d.data, null, 4), {pre:true, title:`接口#${props.apiId} 的执行结果（已转换为 JSON）`})
        }, { loading })
    }

    watch(()=>props.apiId, refresh)

    onMounted(()=>{
        refresh()

        RESULT("/dbm/source/list",{}, d=> sources.value=d.data.map(v=>({value:v.id, label:v.name})))
    })
</script>
