<template>
    <n-space>
        <n-input v-model:value="form.LIKE_id_name" placeholder="公告标题" clearable />
        <n-input v-model:value="form.LIKE_uid_uname" placeholder="发布者" style="width: 100px;" clearable />
        <n-button secondary circle type="success" @click="refresh">
            <template #icon><n-icon :component="Search" /> </template>
        </n-button>
    </n-space>

    <n-data-table class="mt-2" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans" :style="{height}"
        :remote="true" :bordered="false" striped size="small" flex-height />

    <n-drawer v-model:show="showEdit" width="90%" :mask-closable="false" :close-on-esc="false">
        <n-drawer-content title="编辑公告信息" :native-scrollbar="false" :closable="true">
            <n-form :show-feedback="true" :label-width="80" label-placement="top">
                <n-form-item label="公告标题">
                    <n-input v-model:value="bean.name" />
                </n-form-item>
                <n-grid x-gap="20" :cols="5">
                    <n-form-item-gi span="2">
                        <template #label>
                            展示方式
                            <n-text depth="3" class="ml-2 text-sm">弹窗时点击确认即视为已读</n-text>
                        </template>
                        <n-radio-group v-model:value="bean.mode">
                            <n-radio v-for="(item, key) in modes" :value="key">{{item}}</n-radio>
                        </n-radio-group>
                    </n-form-item-gi>
                    <n-form-item-gi label="有效时段" span="2">
                        <n-input-group>
                            <n-date-picker v-model:value="bean.from" clearable placeholder="起始日期" />
                            <n-input-group-label>到</n-input-group-label>
                            <n-date-picker v-model:value="bean.to" clearable placeholder="截止日期" />
                        </n-input-group>
                    </n-form-item-gi>
                    <n-form-item-gi label="提醒人群">
                        <AuthSelector ref="authRef" v-model:value="bean.serviceAuth" :tooltip="false"></AuthSelector>
                    </n-form-item-gi>
                </n-grid>
                <n-form-item label="公告内容">
                    <MDEditor ref="mdEditor" height="520px" :code="bean.summary" />
                </n-form-item>
            </n-form>
            <template #footer>
                <n-button type="primary" @click="toSave">保存公告信息</n-button>
            </template>
        </n-drawer-content>
    </n-drawer>
</template>

<script setup>
    import { ref,createVNode, h } from 'vue'
    import { Search, Plus, Trash, Edit, Table, Database, CodeBranch, Microsoft, Code, SyncAlt } from "@vicons/fa"
    import { NPopconfirm, NSpace } from 'naive-ui'

    import P from "@Pagination"
    import AuthSelector from "@CC/selector.auth.vue"
    import MDEditor from "@md.editor"

    const modes = {notice:"平铺显示", dialog:"弹窗显示"}

    let { beans , form, pagination, refresh } = P(`/notice/list`)

    let showEdit    = ref(false)
    let bean        = ref({})
    let mdEditor    = ref()

    let height = "calc(100% - 40px)"
    let columns = [
        {
            title:"序号", width:40, render: (row, rowIndex)=> `${rowIndex+1}`,
        },
        {
            title:"公告标题", key:"name",width:240,ellipsis:true,
            render: row=>createVNode('span',{onClick:()=>toDetail(row), class:"cursor-pointer"}, row.name)
        },
        { title:"发布者", width:120, key:"uid", render: row=>`${row.uid}/${row.uname}`},
        { title:"展示方式", key:"category", width: 100, render:row=> modes[row.mode]},
        { title:"有效时段", width:200, render:(row)=> h('div', `${row.fromDate} 至 ${row.toDate}`)},
        { title:"已读量", width:100, key:"launch" },
        {
            width:60, align:"center",
            title: ()=> h(NSpace, {justify:"center"}, ()=>[
                UI.iconBtn(Plus, ()=> toEdit(), {type:"primary", secondary:true}),
                UI.iconBtn(SyncAlt, refresh, {type:"primary", quaternary:false, secondary:true, title:"刷新列表数据"})
            ]),
            render(row, rowIndex) {
                return [
                    UI.iconBtn(Edit, ()=> toEdit(row)),
                    createVNode(
                        NPopconfirm,
                        {
                            onPositiveClick:()=> toDelete(row.id, rowIndex),
                            "positive-button-props": {type:"error"}
                        },
                        {
                            default: ()=>`删除公告⌈${row.name}⌋吗？`,
                            trigger: ()=>UI.iconBtn(Trash, null, {type:"error"})
                        }
                    )
                ]
            }
        }
    ]

    let toEdit = (row={name:"新公告", mode:"dialog"})=> {
        if(row.fromDate)    row.from = H.date.toLong(row.fromDate)
        if(row.toDate)      row.to = H.date.toLong(row.toDate)
        bean.value = row
        showEdit.value = true
    }
    let toSave = ()=>{
        let model = {}
        Object.keys(bean.value).forEach(v=> model[v] = bean.value[v])
        model.summary = mdEditor.value.getMarkdown()
        model.fromDate  = H.date.date(model.from)
        model.toDate    = H.date.date(model.to)

        if(!model.name || !model.summary)       return M.warn(`标题及内容不能为空`)
        if(!model.fromDate || !model.toDate)    return M.warn(`有效时间段不能为空`)

        RESULT("/notice/add", model, d=> {
            M.notice.ok(`公告⌈${model.name}⌋保存成功`)
            showEdit.value = false
            if(!model.id)
                refresh()
            else
                bean.value.summary = model.summary
        })
    }
    let toDelete = (id, index)=> RESULT("/notice/delete", {id}, d=> {
        M.notice.ok(`公告删除成功`)
        beans.value.splice(index, 1)
    })
</script>
