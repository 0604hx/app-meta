<template>
    <!--简介编辑区-->
    <n-card size="small" title="说明信息">
        <MDEditor ref="mdEditor" height="220px" :code="bean.summary" />
    </n-card>

    <!--字段编辑区-->
    <n-card size="small" title="字段管理" class="mt-3">
        <template #header>
            字段管理
            <n-text class="ml-3 text-sm" depth="3">首次导入数据后系统自动填充</n-text>
        </template>
        <template #header-extra>
            <n-button size="small" type="primary" secondary @click="()=>importor.open()">从 EXCEL 中导入数据</n-button>
        </template>

        <!--
            label|字段名称|String|数据展示时显示值
            column|数据列名|String|导数时标题列值
            query|参与检索|Boolean|勾选后用户可对此字段进行模糊查询
            bindUid|绑定用户ID|Boolean|勾选后该字段将限定为当前登录用户ID
        -->
        <n-table :bordered="false" size="small">
            <tr>
                <th>字段名称</th>
                <th>
                    <n-tooltip>
                        <template #trigger> <span>数据列名<QuestionCircle class="icon ml-1" /></span> </template>
                        从Excel导数时对应的列标题
                    </n-tooltip>
                </th>
                <th width="120">
                    <n-tooltip>
                        <template #trigger> <span>参与检索<QuestionCircle class="icon ml-1" /></span> </template>
                        勾选后用户可对此字段进行模糊查询
                    </n-tooltip>
                </th>
                <th width="120">
                    <n-tooltip>
                        <template #trigger> <span>绑定登录用户<QuestionCircle class="icon ml-1" /></span> </template>
                        勾选后该字段将限定为当前登录用户ID（同时无法参与检索）
                    </n-tooltip>
                </th>
                <th width="30">
                    <n-button type="primary" size="tiny" circle @click="bean.fields.push(newField())"><template #icon><n-icon :component="Plus" /></template></n-button>
                </th>
            </tr>
            <tr v-for="(item, index) in bean.fields">
                <td><n-input v-model:value="item.label" /></td>
                <td><n-input v-model:value="item.column" /></td>
                <td><n-switch v-model:value="item.query" /></td>
                <td><n-switch v-model:value="item.bindUid" /></td>
                <td class="text-center">
                    <n-popconfirm :negative-text="null" @positive-click="bean.fields.splice(index,1)" placement="top-end">
                        <template #trigger>
                            <n-button type="error" size="tiny" tertiary circle><template #icon><n-icon :component="Trash" /></template></n-button>
                        </template>
                        <div>
                            确定删除字段⌈{{item.label}}⌋吗？<br>
                            <n-text depth="3" class="text-xs">注意，删除后会影响存量数据的显示</n-text>
                        </div>
                    </n-popconfirm>
                </td>
            </tr>
        </n-table>

        <n-card size="small" title="展示表格设置" class="mt-3">
            <n-form :show-feedback="false" label-placement="top" label-width="80">
                <n-grid x-gap="10" :cols="4">
                    <n-form-item-gi>
                        <template #label>
                            <n-tooltip><template #trigger>表格高度</template>单位为 px，如果设置为负数则为最大高度减去绝对值</n-tooltip>
                        </template>
                        <n-input-number v-model:value="bean.tableHeight">
                            <template #suffix><n-tag :bordered="false" size="small" type="info">px</n-tag></template>
                        </n-input-number>
                    </n-form-item-gi>
                    <n-form-item-gi label="显示序号">
                        <n-switch v-model:value="bean.indexCol" />
                    </n-form-item-gi>
                    <n-form-item-gi>
                        <template #label>
                            <n-tooltip><template #trigger>自动加载数据</template>开启后页面加载完成马上进行数据查询</n-tooltip>
                        </template>
                        <n-switch v-model:value="bean.autoLoad" />
                    </n-form-item-gi>
                    <n-form-item-gi>
                        <template #label>
                            <n-tooltip><template #trigger>虚拟滚动</template>开启 virtual-scroll（应对大量数据的情况）</n-tooltip>
                        </template>
                        <n-switch v-model:value="bean.virtual" />
                    </n-form-item-gi>
                </n-grid>
            </n-form>
        </n-card>

        <div class="text-center mt-4">
            <n-button size="large" @click="toSave" type="primary">保存信息</n-button>
        </div>
    </n-card>

    <FileImportor ref="importor" accept=".xlsx,.csv" :preview="false" lockSheet  @update="onData">
        <template #tip>
            仅限 XLSX 格式的文件（只处理第一个 Sheet），数据格式务必选择 <n-tag :bordered="false" size="small">JSON</n-tag>
        </template>
    </FileImportor>
</template>

<script setup>
    import { ref } from 'vue'
    import { Trash, Plus, QuestionCircle } from '@vicons/fa'

    import MDEditor from "@md.editor"
    import FileImportor from "@CC/file.import.vue"

    const props = defineProps({
        bean: {type:Object},
        updater:{type:Function},
    })

    const newField = ()=>({label:"新增字段", column:"", query:false, bindUid:false})

    let working     = ref(false)
    let mdEditor    = ref()
    let importor    = ref()

    const onData = (d, ext, filename)=>{
        console.debug(d)
        importor.value.close()

        if(d.length>0){
            M.ok(`读取到${d.length}条数据`)

            let dd = d[0]
            if(dd && H.isEmptyArray(props.bean.fields)){
                props.bean.fields = Object.keys(dd).map(label=>({label, column:label, query:false, bindUid:false}))
            }

            //数据校验
            let columns = Object.keys(dd)
            let missColumns = props.bean.fields.map(f=>f.column).filter(f=>!columns.includes(f))
            console.debug(columns, missColumns)
            if(missColumns.length>0){
                M.confirm(
                    `数据不匹配警告`,
                    UI.html(`系统检测到您选择的数据文件（第一条数据）缺失列：<br>${missColumns.join("、")}<br><br>确定进行导入吗？`),
                    ()=> onDataDo(d, filename)
                )
            }
            else
                onDataDo(d, filename)
        }
        else {
            M.warn(`文件⌈${filename}⌋没有数据`)
        }
    }
    const onDataDo = (rows, origin)=>{
        //删除 __rowNum__ 属性
        let batch = H.date.compact()
        try{
            working.value = true
            H.data.insert(rows, null, {batch, origin}).then(d=>{
                working.value = false
                M.notice.ok(`成功从文件 ${origin} 中导入 ${d.data} 条数据`)
            })
        }
        catch(e){
            working.value = false
            throw e
        }
    }

    const toSave = ()=>{
        let { fields, tableHeight, virtual, indexCol, autoLoad }  = props.bean
        //处理信息
        for (let i = 0; i < fields.length; i++) {
            const f = fields[i]
            if(!f.label.trim() || !f.column.trim()) return M.warn(`第${i+1}个字段的名称、数据列名均不能为空`)
        }
        let model = { summary:mdEditor.value.getMarkdown(), fields, virtual, tableHeight, indexCol, autoLoad }
        props.updater(JSON.stringify(model))
    }
</script>
