<!---->
<template>
    <div class="px-3">
        <n-tabs type="line">
            <n-tab-pane name="edit" display-directive="show:lazy" tab="服务配置">
                <Editor v-if="inited" :bean="bean" :updater="updater" :creater="newQ" />
            </n-tab-pane>
            <n-tab-pane name="deploy" :disabled="!canDeploy" display-directive="show:lazy" tab="上传与部署">
                <Deploy :aid="aid" :pid="id"/>
            </n-tab-pane>
            <n-tab-pane name="dashboard" display-directive="show:lazy" tab="服务访问记录">
                <Dashboard :aid="aid" />
            </n-tab-pane>
        </n-tabs>
    </div>
</template>

<script setup>
    import { ref, computed } from 'vue'

    import { pageEditor } from "../"
    import Editor from "./editor.vue"
    import Dashboard from "./dashboard.vue"
    import Deploy from "./deploy.vue"

    import { INSIDE } from "."

    const newQ = ()=>({title:'', type:0, required:false})

    // const config = {
    //     "dbHost": "",       //数据库地址
    //     "dbPort": 3306,     //数据库端口
    //     "dbName": "",       //数据库名
    //     "dbPwd": "",        //数据库密码
    //     "dbUser": "",       //数据库用户名
    //     "port": 10000,      //应用服务端口
    //     "useDB": false      //是否启用数据库
    // }
    let { id, aid, bean, inited, updateContent } = pageEditor(
        { mode:INSIDE, language:"node", dbHost:"localhost" },
        d=> JSON.parse(d)
    )

    let canDeploy = computed(()=> bean.value.mode==INSIDE)

    const updater = (terminal, onDone)=>{
        updateContent(JSON.stringify(terminal), ()=>{
            canDeploy.value = terminal.mode == INSIDE
            typeof(onDone) === 'function' && onDone()
        })
    }
</script>
