<template>
    <n-form v-if="inited" class="p-3" label-placement="left" label-align="right" label-width="110" :show-feedback="false">
        <n-card size="small">
            <template #header> <Search class="icon primary mr-2" /> 检索设置 </template>
            <n-space vertical>
                <n-form-item label="标题内容"> <n-input v-model:value="bean.title" /> </n-form-item>
                <n-form-item label="数据范围/表ID">
                    <PageSelector :aid="aid" v-model:value="bean.pid" />
                </n-form-item>
                <n-form-item label="允许筛选录入者">
                    <n-switch v-model:value="bean.uid" />
                    <n-text depth="3" class="ml-3">勾选后，用户可以筛选特定的数据录入者（通过ID）</n-text>
                </n-form-item>
                <n-form-item label="允许筛选时段">
                    <n-switch v-model:value="bean.time" />
                    <n-text depth="3" class="ml-3">勾选后，用户可以筛选数据录入的时间范围</n-text>
                </n-form-item>
                <n-form-item label="预设筛选条件">
                    <n-space vertical class="w-full">
                        <FieldFilter v-for="item in bean.filters" :bean="item" :fields="fields" @delete="()=> bean.filters.splice(index,1)" />

                        <div>
                            <n-space justify="space-between">
                                <n-button secondary type="info" @click="()=>bean.filters.push({op:'EQ', field:'', value:''})">
                                    <template #icon><n-icon :component="Plus" /> </template> 添加筛选条件
                                </n-button>

                                <n-tooltip placement="bottom" trigger="hover">
                                    <template #trigger>
                                        <!-- <template #icon><n-icon :component="Database" /></template> -->
                                        <n-button text type="primary" @click="loadOneLine">字段为空？试试从数据表中读取</n-button>
                                    </template>
                                    从指定的 ⌈数据范围⌋ 内查询一条数据并以此解析字段
                                </n-tooltip>
                            </n-space>
                            <div>
                                <n-text depth="3">预设的筛选条件，如果为空则允许用户自行添加条件</n-text>
                            </div>
                        </div>
                    </n-space>
                </n-form-item>
            </n-space>
        </n-card>

        <n-card size="small" class="mt-2">
            <template #header> <Columns class="icon primary mr-2" /> 字段（表格列）设置 </template>

            <n-form-item label="显示默认数据列">
                <n-switch v-model:value="bean.defaultCol" />
                <n-text depth="3" class="ml-3">勾选后，将在数据表格左侧显示 <n-text code>录入时间</n-text>、<n-text code>录入者</n-text> 两列 </n-text>
            </n-form-item>

            <n-table size="small" class="mt-2" :bordered="false">
                <thead>
                    <tr>
                        <th width="50" class="text-center">#</th>
                        <th width="120">KEY</th>
                        <th width="180">标签名称</th>
                        <th>
                            渲染函数
                            <n-text depth="3" class="ml-1 text-xs">
                                默认原样输出，支持自定义 JavaScript 脚本（参数为数据行 <n-tag :bordered="false" size="tiny" type="info">row</n-tag>）
                            </n-text>
                        </th>
                        <th width="25">
                            <n-button circle size="tiny" secondary type="primary" @click="bean.columns.push({label:'',key:''})"><template #icon><n-icon :component="Plus" /></template> </n-button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in bean.columns">
                        <td class="text-center">{{index+1}}</td>
                        <td><n-input v-model:value="item.key"/> </td>
                        <td><n-input v-model:value="item.label"/> </td>
                        <td><n-input v-model:value="item.render"/> </td>
                        <td class="text-center">
                            <n-button circle size="tiny" @click="bean.columns.splice(index,1)" tertiary type="error"><template #icon><n-icon :component="Trash" /></template> </n-button>
                        </td>
                    </tr>
                </tbody>
            </n-table>
            <div class="mt-2">
                <n-text depth="3">若未定义数据字段，则系统尝试在读取到数据后以第一条自动计算（届时列标题显示属性ID）</n-text>
            </div>
        </n-card>

        <n-card size="small" class="mt-2">
            <template #header> <Download class="icon primary mr-2" /> 数据导出配置 </template>

            <n-space vertical>
                <n-form-item label="允许导出">
                    <n-switch v-model:value="bean.export" /> <n-text depth="3" class="ml-3">勾选后，会显示数据下载按钮 </n-text>
                </n-form-item>
                <n-form-item label="导出格式">
                    <n-radio-group size="large" v-model:value="bean.exportType" :disabled="!bean.export">
                        <n-space>
                            <n-radio value="xlsx" label="Excel（xlsx格式）" />
                            <n-radio value="csv" label="纯文本（CSV）" />
                        </n-space>
                    </n-radio-group>
                </n-form-item>
                <n-form-item label="文件命名"> <n-input :disabled="!bean.export" v-model:value="bean.exportName" placeholder="支持 {{ date }}、{{ time }}等占位符" /> </n-form-item>
                <n-form-item label="自定义脚本">
                    <div class="w-full">
                        <CodeEditor v-model:value="bean.exportScript" height="100px" :tabSize="2" :disabled="!bean.export" />
                        <n-text depth="3">脚本不为空时优先执行（点击后触发脚本，请使用 H.data.exporToExcel 或者 H.data.exportToCSV）</n-text>
                    </div>
                </n-form-item>
            </n-space>
        </n-card>

        <n-card size="small" class="mt-2">
            <template #header> <Divide class="icon primary mr-2" /> 分页及数据排序 </template>
            <n-form-item label="倒序排列">
                <n-switch v-model:value="bean.desc" /> <n-text depth="3" class="ml-3">勾选后，优先显示新插入的数据 </n-text>
            </n-form-item>
            <n-form-item label="允许分页">
                <n-switch v-model:value="bean.paging" /> <n-text depth="3" class="ml-3">勾选后，可以加载下一页的数据；否则只显示第一页的数据 </n-text>
            </n-form-item>
            <n-form-item label="每页数据量"> <n-input-number v-model:value="bean.pageSize" :min="0" :max="10000" /> </n-form-item>
        </n-card>

        <div class="text-center mt-3">
            <n-button size="large" type="primary" @click="toSave">
                <template #icon><n-icon :component="Check" /></template> 保存设置
            </n-button>
        </div>
    </n-form>
</template>

<script setup>
    import { ref } from 'vue'
    import { Search,Check, Plus, Columns, Trash, Divide, Database, Download } from "@vicons/fa"

    import { pageEditor } from "../"
    import { tableConfig, buildQueryFilter, operations } from "./"

    import CodeEditor from "@C/editor.code.vue"

    import FieldFilter from "./field-filter.vue"
    import PageSelector from "./page-selector.vue"

    let { id, aid, bean, inited, loading , updateContent } = pageEditor(tableConfig(), d=> JSON.parse(d) )

    let fields = ref([])

    let loadOneLine = ()=> {
        let pid = bean.value.pid||""
        H.data.query({pageSize:1, pid, aid }).then(d=>{
            let { data } = d
            if(data.length <= 0)
                return M.dialog({title:"系统查询不到数据", content:UI.html(`数据范围/表ID ⌈${fid}⌋ 下无数据，请先录入再查询`),type:"warning"})

            let v = Object.keys(data[0].v)
            fields.value = UI.buildOptions(v)
            M.dialog({
                type:"success",
                title: `数据读取成功`,
                content: UI.html(`从数据范围/表ID ⌈${pid}⌋ 读取到 ${v.length} 个字段：${v.map(vv=>`<b class="primary b">${vv}</b>`).join("、")} <br><br>您希望将这些字段纳入到表格列中吗？`),
                positiveText: "追加到当前数据列",
                negativeText: "覆盖当前数据列",
                onPositiveClick: () => addCols(v),
                onNegativeClick: () => addCols(v, true)
            })
        })
    }

    let addCols = (items, overwrite=false)=>{
        let cols = items.map(key=>({key, label: key}))
        overwrite? bean.value.columns = cols: bean.value.columns.push(...cols)
    }

    let toSave = () => updateContent(JSON.stringify(bean.value))
</script>
