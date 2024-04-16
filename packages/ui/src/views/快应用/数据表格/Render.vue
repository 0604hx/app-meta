<template>
    <div class="text-center" v-if="!inited">
        <n-spin><template #description>数据加载中...</template> </n-spin>
    </div>
    <template v-else>
        <n-card :title="config.title" size="small">
            <n-space>
                <n-input v-if="config.uid === true" v-model:value="form.uid" placeholder="录入者ID" style="width: 180px;" clearable />
                <template v-if="config.time === true">
                    <n-date-picker v-model:value="form.timeFrom" clearable placeholder="起始日期" style="width:140px" />
                    <n-date-picker v-model:value="form.timeEnd" clearable placeholder="截止日期" style="width:140px" />
                </template>
                <n-button secondary circle type="success" @click="refresh">
                    <template #icon><n-icon :component="Search" /> </template>
                </n-button>
                <n-tooltip v-if="config.export">
                    <template #trigger>
                        <n-button secondary circle type="info" @click="toExport">
                            <template #icon><n-icon :component="Download" /> </template>
                        </n-button>
                    </template>
                    按当前筛选条件导出数据
                </n-tooltip>

                <template v-if="canFilter">
                    <n-button secondary type="info" circle @click="()=>filters.push({op:'EQ', field:'', value:''})" title="增加筛选条件">
                        <template #icon><n-icon :component="Plus" /> </template>
                    </n-button>
                    <div style="line-height: 35px;">
                        当前共有 {{filters.length}} 个筛选条件
                    </div>
                </template>
            </n-space>

            <n-grid v-if="canFilter" x-gap="12" y-gap="4" :cols="3" class="mt-2">
                <n-gi v-if="filters.length" v-for="(item, index) in filters">
                    <FieldFilter :bean="item" :fields="fields" @delete="()=> filters.splice(index,1)" />
                </n-gi>
                <n-gi v-else class="h">暂无自定义筛选条件，请添加</n-gi>
            </n-grid>
        </n-card>

        <n-data-table class="mt-2" :columns="columns" size="small" :remote="true" :loading="loading" striped :data="beans" :style="{height}"
            flex-height :pagination="pagination" :row-props="rowProps" />

        <n-dropdown placement="bottom-start" :x="menu.x" :y="menu.y" :options="menuOptions" :show="menu.show" :on-clickoutside="()=>menu.show=false" @select="onMenuClick" />
    </template>
</template>

<script setup>
    import { ref, onMounted, reactive, createVNode, h } from 'vue'
    import { NText } from "naive-ui"
    import { Search, Plus, Trash, Edit, Table, Copy, Download } from "@vicons/fa"

    import DataEditor from "./data-editor.vue"
    import FieldFilter from "./field-filter.vue"

    import { runScript } from "@S/Runner"

    import { renderProps } from "../"
    import { tableConfig , basicColumns, buildQueryFilter } from "./"

    const props = defineProps(renderProps)

    const config = props.data?JSON.parse(props.data): tableConfig()
    const canFilter = Array.isArray(config.filters) && config.filters.length == 0
    // config.columns = [
    //     { key:"jg", label:"机构" },
    //     { key:"rq", label:"月份", render:"`2023年${row.rq}月`" },
    //     { key:"gs", label:"评估公司" },
    // ]

    const resizable = true
    const ellipsis  = { tooltip: true }
    let height      = "calc(100vh - 198px)"

    const menuOptions = [
        { label:"编辑数据", key:"edit",icon: UI.buildIcon2(Edit) },
        { label:"复制（JSON）", key:"json", icon:UI.buildIcon2(Copy)},
        { label: () => h("span", { class:"error" }, "删除"), key:"delete", icon: UI.buildIcon2(Trash, {class:"error"}) }
    ]

    let inited = ref(false)
    let loading = ref(false)
    let beans = ref([])
    let columns = ref([])
    let fields = []

    //新增分页
    let pagination = reactive(!config.paging? false : {
        page:1,
        pageSize: 20,
        showSizePicker:true,
        pageSizes: [20, 50, 100, 200],
        itemCount:0,
        prefix: info=> h('div', {}, `加载 ${beans.value.length} 条数据（数据总数 ${info.itemCount}）`),
        onChange: page=> {
            pagination.page = page
            refresh()
        },
        onUpdatePageSize : pageSize => {
            pagination.pageSize = pageSize
            refresh()
        }
    })

    const form = reactive({uid:"", aid: props.aid, pid:props.page.pid, timeFrom:null, timeEnd:null})
    let menu = reactive({
        x:0,
        y:0,
        show: false,
        index: -1
    })
    let filters = ref(config.filters)
    let names = {}

    const buildModel = ()=> new Promise((ok, fail)=>{
        let model = { uid: form.uid, pid: config.pid, aid: props.aid }
        if(form.timeFrom>0) model.timeFrom = form.timeFrom
        if(form.timeEnd>0)  model.timeEnd = form.timeEnd
        if(model.timeEnd < model.timeFrom)  throw Error(`截止日期不能小于起始日期`)

        model.desc = config.desc === true
        model.match = buildQueryFilter(filters.value)
        if(config.paging === true){
            model.page = pagination.page
            model.pageSize = pagination.pageSize
        }

        ok(model)
    }).catch(e=> {
        M.showError(e.message, '筛选条件填写有误')
        return null
    })

    let refresh = ()=> buildModel().then(model=>{
        if(!model)  return

        loading.value = true
        H.data.query(model).then(d=> {
            let { data } = d
            //如果没有定义字段属性，则从第一行数据中进行自动计算
            if(columns.value.length == 0 && data.length > 0){
                // 构建 columns
                let _columns = basicColumns(config.defaultCol)
                let first = data[0]
                Object.keys(first.v).forEach(key=>{
                    _columns.push({ title: key, key, resizable, ellipsis, render:row=> row.v[key]})
                })

                columns.value = _columns
                fields = UI.toOptions(Object.keys(first.v))
            }
            // console.debug(data, columns)
            beans.value = data

            if(!inited.value) inited.value = true
            if(config.paging){
                pagination.itemCount = d.total
            }
            loading.value = false
        })
    })

    let rowProps = (row, index)=>({
        onContextmenu: e => {
            e.preventDefault()
            menu.x = e.clientX
            menu.y = e.clientY
            menu.index  = index
            menu.show = true
        }
    })

    let toEdit = row=>{
        let dialog = M.dialog({
            maskClosable: false,
            showIcon: false,
            style:{width:'720px'},
            title: ()=>h('div', [
                `修改数据#${row.id}`,
                h(NText, {class:"text-sm ml-2", depth:3}, ()=>'仅支持修改数据内容（提交日期、提交者无法修改）')
            ]),
            content: ()=>h(
                DataEditor,
                {
                    bean: row.v,
                    id: row.id,
                    aid: props.aid,
                    names,
                    onOk: ()=>dialog.destroy()
                }
            )
        })
    }

    let onMenuClick = key=>{
        let row = beans.value[menu.index]
        menu.show = false

        if(key == 'edit'){
            toEdit(row)
        }
        else if(key == 'json'){
            H.copyTo(row.v, true)
            M.ok(`JSON 数据已复制到粘贴板`)
        }
        else if(key == 'delete'){
            M.confirm(`删除数据`, `确认要删除该条数据（${row.uid} 在 ${H.date.datetime(row.addOn)} 录入）吗？`, ()=>{
                H.data.remove(row.id).then(d=>{
                    M.ok(`数据删除成功`)
                    beans.value.splice(menu.index, 1)
                })
            })
        }
    }

    const toExport = ()=> buildModel().then(model=> {
        if(!model)  return

        let headers = config.columns.filter(v=>v.key)
        if(!!config.exportScript){
            runScript(config.exportScript, { model, headers })
        }
        else if(!!config.exportName){
            let name = H.io.render(config.exportName, {date: H.date.compact(), time:H.date.compactTime()});

            (config.exportType=='xlsx'?H.data.exportToExcel:H.data.exportToCSV)(model, headers, `${name}.${config.exportType}`).catch(e=> {
                console.error(`执行数据导出时出错`, e)
                M.showError(`服务器返回错误信息：${e}`)
            })
        }
        else
            M.showError(`未定义<b class="error">自定义脚本</b>、<b class="error">导出文件名</b>（二者至少设置一项）`)
    })

    onMounted(() => {
        if(Array.isArray(config.columns) && config.columns.length>0){
            let _columns = basicColumns(config.defaultCol)
            config.columns.forEach(c=>{
                let col = { title: c.label, key:c.key, resizable, ellipsis }
                col.render = !!c.render? row=> new Function('row', 'return '+c.render)(row.v) : row=> row.v[c.key]
                _columns.push(col)
                names[c.key] = c.label
            })

            columns.value = _columns
            fields = UI.buildOptions(config.columns.filter(c=>!!c.key).map(c=>`${c.key}|${c.label}`))
        }

        if(!config.pid){
            return M.dialog({title:"功能配置缺失",content: `该数据表格未关联页面（PID 为空），请联系管理员进行分配后再使用`,type:"error"})
        }

        refresh()
    })
</script>
