<template>
    <n-data-table class="mt-2" :columns="columns" :loading="loading" :data="beans" striped :style="{height}" flex-height :bordered="true" />

    <AuthSelector ref="authRef" :value="authText" @ok="onAuthChange"><span></span></AuthSelector>
    <DocumentManager ref="docRef"><span></span></DocumentManager>
</template>

<script setup>
    import { ref,onMounted, h,nextTick, unref, toRaw } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { NTag, NSwitch,NPopconfirm,NInput,NIcon,NTooltip,NButton, NSpace, NDropdown } from 'naive-ui'

    import { Plus,Trash,Check, Edit, Eye, ShieldAlt, ShieldVirus, FileWord, Download, Upload, SyncAlt } from '@vicons/fa'

    import { templates, findTemplate, pageManage } from "./"
    import CreatePage from "./create-page.vue"
    import ClickInput from "@C/dbclick.input.vue"
    import Template from "../widget/page.template.vue"
    import AuthSelector from "@CC/selector.auth.vue"
    import DocumentManager from "./document-manage.vue"
    import Count from "@VW/count.vue"

    let aid = useRoute().params.id
    const router = useRouter()

    const { toView, toEdit } = pageManage(router)

    let height = "calc(100% - 0px)"
    let align = "center"
    let columns = [
        { title:"序号", width:55, align, render:(row, i)=> h('span', {class:"cursor-pointer", title:"点击复制ID", onClick:()=> copyId(row) }, i+1)},
        {
            title:"标题", key:"name",
            render: row=> h(ClickInput, {
                text:row.name, special:true,
                onUpdate:v=>modify(row, "name", v, `标题更改为：${v}`),
                title:`完整编号：${row.aid}/${row.id}`
            })
        },
        {
            title:"类型", key:"template", width: 100, render:row=> h(Template, {bean: findTemplate(row.template)})
        },
        {
            title:"可访问", key:"active", width:70,
            render:row=>h(
                NSwitch,
                {
                    defaultValue: row.active,
                    "on-update:value": v=>modify(row, 'active', v, `页面设置为⌈${v?"可见":"不可见"}⌋`),
                }
            )
        },
        {
            key:"main", width: 70,
            title:()=>h(NTooltip,{},{trigger:()=>h('div', {class:"cursor-pointer"}, "主页面"), default:()=>`主页面是运行应用的首页，点击下方的按钮可切换主页面（注意仅有一个主页面）`}),
            render:row=> h(
                NTag,
                {class:"cursor-pointer", bordered:false,type:row.main?"primary":"default", onClick:()=>modify(row, "main", !row.main, `⌈${row.name}⌋已设置为${row.main?"普通":"主"}页面`)},
                ()=>row.main?"首页":"普通" //UI.buildIcon(Check)
            )
        },
        {
            key:"search", width:70,
            title:()=>h( NTooltip,{},{ trigger:()=>h('div', {class:"cursor-pointer"}, "可检索"), default:()=>`仅当可访问、可检索均勾选才能被检索` } ),
            render:row=>h(
                NSwitch,
                {
                    defaultValue: row.search,
                    "on-update:value": v=>modify(row, 'search', v, `页面设置为⌈${v?"":"不"}可检索⌋`),
                }
            )
        },
        { title:"热度", key:"launch", width: 60, render:row=> h(Count, {value: row.launch}) },
        { title:"更新日期", key:"addOn", width: 170, render: row=> H.date.datetime(row.addOn) },
        {
            width:200, align,
            title: ()=> h(NSpace, {justify:"center"}, ()=>[
                h(CreatePage, {aid, onAdd: refresh}),
                UI.iconBtn(Upload, ()=> toImport(), {type:"primary", quaternary:false, secondary:true, title:"从 JSON 文件中导入"}),
                UI.iconBtn(SyncAlt, refresh, {type:"primary", quaternary:false, secondary:true, title:"刷新列表数据"})
            ]),
            render(row, rowIndex) {
                return [
                    UI.iconBtn(Eye, ()=> toView(row), {title:"浏览页面", disabled:row.template=='server'||row.template=='faas'}),
                    UI.iconBtn(Edit, ()=> toEdit(row), {title:"编辑页面"}),
                    // UI.iconBtn(ShieldAlt, ()=> toAuth(row), {title:"修改访问权限"}),
                    // UI.iconBtn(ShieldAlt, ()=> toAuth(row, "editAuth"), {title:"修改编辑/维护权限", type:"warning"}),
                    h(
                        NDropdown,
                        {
                            trigger:"click",
                            options: [{label:"访问权限",key:"serviceAuth"}, {label:"修改/维护权限",key:"editAuth"}],
                            onSelect:key=> toAuth(row, key)
                        },
                        ()=>UI.iconBtn(ShieldAlt, null, {title:"分配访问/维护权限"})
                    ),
                    UI.iconBtn(FileWord, ()=> docRef.value.open(row.id, row.name), {title:"附件管理"}),
                    UI.iconBtn(Download, ()=> toExport(row), {title:"导出页面（JSON格式）"}),
                    h(
                        NPopconfirm,
                        {
                            onPositiveClick:()=> remove(row.id, rowIndex),
                            "positive-button-props": {type:"error"}
                        },
                        {
                            default: ()=>`删除页面⌈${row.name}⌋吗？`,
                            trigger: ()=>UI.iconBtn(Trash, null, {type:"error"})
                        }
                    )
                ]
            }
        }
    ]

    let inputRef= ref()
    let loading = ref(false)
    let beans   = ref([])

    let authRef = ref()
    let authText= ref("")
    let authRow = {}
    let authType= ""

    let docRef  = ref()

    let refresh = ()=> RESULT("/page/list", {form:{EQ_aid:aid}}, d=> beans.value=d.data, {loading})

    let modify = (row, key, value, tip="操作成功")=> RESULT("/page/modify", {id: row.id, key, value}, d=> {
        M.ok(tip)
        if(key == 'main' && value === true){
            //修改其他页面的 main 属性
            beans.value.filter(b=>b.main).forEach(b=>b.main = false)
        }
        row[key] = value
    })

    let toAuth = (row, key="serviceAuth")=>{
        authText.value = row[key]
        authType = key
        authRow = row

        nextTick(()=> authRef.value.open(`⌈${row.name}⌋ 的${key=='serviceAuth'?"访问权限":"管理权限"}`))
    }

    let onAuthChange = v=>{
        authRow[authType] = v
        modify(authRow, authType, v, `授权信息⌈${authType}⌋已更新`)
    }

    let toExport = row=>{
        GET("/page/content", {id: row.id}, dd=>{
            let item = JSON.parse(JSON.stringify(row))
            delete item.id
            item.content = dd. data

            let name = `${item.name}-${item.aid}-${H.date.compact()}.txt`
            H.io.saveToFile(H.io.compress(JSON.stringify(item)), name)
            M.notice.ok(name, `页面导出成功`)
        })
    }

    let toImport = ()=> H.io.chooseAndRead(".txt")
        .then(({filename, result})=>{
            console.debug(result)
            let newPage = JSON.parse(H.io.unCompress(result))
            let title   = "从文件中导入页面"

            if(!newPage.aid != aid)  newPage.aid = aid

            let tpl = findTemplate(newPage.template)
            let errors  = []
            //属性检查
            if(!newPage.name)   errors.push(`页面名称不能为空`)
            if(!newPage.aid)    errors.push(`未关联应用`)
            if(!tpl)            errors.push(`无效的类型 ${newPage.template}`)

            if(errors.length)   return M.dialog({type:"error", title, content: UI.html(`系统检测到页面数据存在以下问题：<br>${errors.map((e, i)=>`${i+1}、${e}`).join("<br>")}<br><br>请修正后再执行导入`)})

            delete newPage.id
            M.confirm(
                title,
                UI.html(`确定导入类型为 <b class="primary">${tpl.text}</b> 的页面 <b class="primary">⌈${newPage.name}⌋</b> 吗？`),
                ()=>{
                    RESULT("/page/create", newPage, d=>{
                        M.notice.ok(`成功从导入页面⌈${newPage.name}⌋`)
                        refresh()
                    })
                }
            )
        })
        .catch(msg=> M.notice.error(msg))

    let remove = (id, index)=>RESULT("/page/delete", {id},d=> {
        M.ok(`页面删除成功`)
        beans.value.splice(index, 1)
    })

    const copyId = row=>{
        H.copyTo(`${row.aid}/${row.id}`)
        M.ok(`页面编号已复制到粘贴板`)
    }

    onMounted( refresh )
</script>
