<template>
    <n-form :show-feedback="true" :label-width="80" label-placement="top">
        <n-grid x-gap="20" :cols="4">
            <n-form-item-gi label="函数类型">
                <n-select :options="funcModes" v-model:value="bean.mode"></n-select>
            </n-form-item-gi>
            <n-form-item-gi label="数据源">
                <n-select :options="sources" placeholder="不选则使用默认数据源" v-model:value="bean.sourceId"></n-select>
            </n-form-item-gi>
            <n-form-item-gi>
                <template #label>
                    <n-tooltip>
                        <template #trigger><span>返回结果格式 <i class="fa fa-question-circle" /></span></template>
                        纯SQL函数返回值统一为 List：
                        <div><Tag>对象</Tag> 元素为键值对</div>
                        <div><Tag>数组</Tag> 元素为一维数组</div>
                    </n-tooltip>
                </template>
                <n-radio-group v-model:value="bean.resultType" :disabled="bean.mode!='sql'">
                    <n-radio v-for="item in resultTypes" :value="item.value">{{item.label}}</n-radio>
                </n-radio-group>
            </n-form-item-gi>
        </n-grid>

        <n-form-item label="函数参数清单">
            <n-space vertical class="w-full">
                <n-table size="small" :bordered="false">
                    <thead>
                        <tr>
                            <th width="120">ID</th>
                            <th width="180">中文名称</th>
                            <th width="100">数据类型</th>
                            <th width="180">默认值</th>
                            <th width="80">必填</th>
                            <th>
                                校验正则表达式
                                <n-text depth="3" class="ml-1 text-xs">
                                    参数值需满足给定表达式
                                </n-text>
                            </th>
                            <th width="25">
                                <n-button circle size="tiny" secondary type="primary" @click="bean.params.push({})"><template #icon><n-icon :component="Plus" /></template> </n-button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in bean.params">
                            <td><n-input v-model:value="item.id"/> </td>
                            <td><n-input v-model:value="item.name"/> </td>
                            <td><n-select :options="paramsTypes" v-model:value="item.type" /> </td>
                            <td><n-input v-model:value="item.value"/> </td>
                            <td><n-switch v-model:value="item.required"/> </td>
                            <td><n-input v-model:value="item.regex"/> </td>
                            <td class="text-center">
                                <n-button circle size="tiny" @click="bean.params.splice(index,1)" tertiary type="error"><template #icon><n-icon :component="Trash" /></template> </n-button>
                            </td>
                        </tr>
                    </tbody>
                </n-table>

                <n-space>
                    <div title="勾选后，将会忽略不在上述范围的参数（按 ID 匹配）">强制参数模式 <i class="fa fa-question-circle" />：</div>
                    <n-switch v-model:value="bean.paramsLimit" />
                </n-space>
            </n-space>
        </n-form-item>

        <n-form-item class="w-full">
            <template #label>
                <n-space justify="space-between">
                    <div>
                        函数代码
                        <n-text depth="3" class="ml-2 text-sm">纯SQL时，支持使用 &#123&#123 变量名 &#125&#125，届时将替换成对应的参数值</n-text>
                    </div>
                    <n-button size="tiny" type="primary" secondary @click="resetDemoCode">注入示例代码</n-button>
                </n-space>
            </template>
            <!-- <n-input type="textarea" :rows="3" v-model:value="bean.cmd" /> -->
            <div class="w-full">
                <CodeEditor v-model:value="bean.cmd" ref="editor" language="sql" style="height: 240px;" />
            </div>
        </n-form-item>

        <n-form-item label="函数说明">
            <MDEditor ref="mdEditor" height="160px" :code="bean.summary" />
        </n-form-item>

        <n-space justify="space-between">
            <n-space>
                <n-button size="large" type="primary" @click="toHelp" secondary>使用帮助</n-button>
                <n-button-group>
                    <n-button size="large" type="primary" @click="toCall" :loading="running" secondary title="在测试环境下执行函数（原始返回值请打开 F12 查看）">测试函数</n-button>

                    <n-popover trigger="manual" :show="showEnv" style="width: 540px" placement="top-start">
                        <template #trigger>
                            <n-button size="large" type="primary" secondary title="配置测试参数" @click="showEnv = !showEnv">
                                <template #icon><n-icon :component="Cog" /></template>
                            </n-button>
                        </template>
                        <template #header><n-text class="text-lg info">函数测试环境</n-text></template>

                        <n-form :show-feedback="false" label-placement="top">
                            <n-space vertical>
                                <n-form-item label="绑定用户ID">
                                    <n-input v-model:value="env.uid" placeholder="填写用户ID，留空则为当前登录用户" />
                                </n-form-item>
                                <n-form-item class="w-full">
                                    <template #label>
                                        <n-space justify="space-between">
                                            参数（JSON格式）
                                            <n-button size="tiny" type="primary" secondary @click="buildFromParams">按参数列表生成</n-button>
                                        </n-space>
                                    </template>
                                    <n-input v-model:value="env.params" type="textarea" rows="8" size="small" placeholder="请填写JSON格式" />
                                </n-form-item>
                            </n-space>
                        </n-form>
                    </n-popover>
                </n-button-group>
                <n-button size="large" type="primary" @click="toLog" secondary title="查看生产环境的函数记录">调用日志</n-button>
            </n-space>
            <n-button size="large" @click="toSave" type="primary">保存函数信息</n-button>
        </n-space>
    </n-form>

    <n-drawer v-model:show="help" width="1040">
        <n-drawer-content title="FaaS函数说明" :closable="true" :body-content-style="{padding:'10px'}">
            <MDRender :code="About" />
        </n-drawer-content>
    </n-drawer>
</template>

<script setup>
    import { h, ref, onMounted, reactive } from 'vue'
    import { Plus, Trash, Cog } from "@vicons/fa"

    import CodeEditor from "@C/editor.code.vue"
    import MDEditor from "@md.editor"
    import MDRender from "@md.viewer"

    import { pageEditor } from "../"
    import About from "./说明.md?raw"
    import DevResult from "./dev-result.vue"
    import LogList from "../widget/terminal-log.vue"

    import { createFaas, funcModes, resultTypes, paramsTypes, demoJSCode } from "."

    let { id, aid, bean, inited, loading , updateContent } = pageEditor(createFaas, d=> JSON.parse(d), { padding: false })

    let sources = ref([])
    let mdEditor = ref()
    let help = ref(false)
    let env = reactive({uid:"", params:"{}"})
    let showEnv = ref(false)
    let running = ref(false)

    const toSave    = ()=> {
        bean.value.summary = mdEditor.value.getMarkdown()

        updateContent(JSON.stringify(bean.value))
    }
    const buildFromParams = ()=> {
        let ps = {}
        bean.value.params.forEach(v=> {
            ps[v.id] = v.value || ""
            if(v.type == "number")  ps[v.id] = parseInt(ps[v.id])
            if(v.type == "boolean") ps[v.id] = ps[v.id].toUpperCase() == "TRUE" || ps[v.id]=="1"
        })
        env.params = JSON.stringify(ps, null, 4)
    }
    const resetDemoCode = ()=>{
        if(!!bean.value.cmd)    return M.warn(`请先清空原代码`)

        bean.value.cmd = demoJSCode.replace(/^\s+|\s+$/g,'')
    }
    const toCall    = ()=>{
        RESULT(
            "/page/faas/dev",
            { func:_raw(bean), params: JSON.parse(env.params), uid: env.uid, id },
            d => M.dialog({title:`测试结果#${id}`, showIcon:false, content:()=> h(DevResult, { data:d.data }), style:{width:"920px"}}),
            { loading: running }
        )
        // let data = {
        //     "appId": "demo",
        //     "params": {
        //         "aid": "demo",
        //         "limit": 3
        //     },
        //     "user": {
        //         "id": "admin",
        //         "name": "测试管理员",
        //         "ip": "127.0.0.1",
        //         "depart": null,
        //         "roles": [
        //             "ADMIN"
        //         ],
        //         "appRoles": [
        //             "admin",
        //             "test"
        //         ],
        //         "appAuths": []
        //     },
        //     "devMode": true,
        //     "logs": [
        //         "开始进行函数#37的模拟运行：\n\t[参数] {aid=demo, limit=3}\n\t[用户] admin",
        //         "[DEV-SQL] 执行语句 SELECT id,name,template FROM page where aid='demo' limit 3",
        //         "\n函数执行完毕，耗时 0.019 秒"
        //     ],
        //     "result": {}
        // }
        // M.dialog({title:`测试结果`, showIcon:false, content:()=> h(DevResult, { data }), style:{width:"920px"}})
    }
    const toHelp    = ()=> help.value = true
    const toLog     = ()=> M.dialog({title:`函数调用记录`, content:()=>h(LogList, { aid, pid: id }), style:{width:"90%"}})

    onMounted(()=>{
        RESULT("/dbm/source/list",{}, d=> {
            let temps = d.data.map(v=>({value:v.id, label:v.name}))
            temps.push({ value:0, label:"[平台数据源]"})
            sources.value = temps
        })
    })
</script>
