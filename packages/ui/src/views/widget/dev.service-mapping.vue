<!--
    本地项目配置页

    2024-04-07  优化配置项，支持开关、URL筛选

-->
<template>
    <n-space vertical>
        <n-alert :bordered="true" type="info" :show-icon="true">
            转发后端服务请求到指定地址，在本地开发时非常有用，注意：
            <ol>
                <li>1、服务地址应该以 http 开头，不以 / 结尾，多个规则以英文逗号隔开</li>
                <li>2、仅当前浏览器内有效</li>
                <li>3、上线时请及时删除映射，以免功能无法正常使用</li>
                <li>4、请求转发默认附带用户信息（ua）</li>
            </ol>
        </n-alert>

        <n-table striped :bordered="false" size="small">
            <thead>
                <tr>
                    <th width="150px">应用ID</th>
                    <th>路由规则</th>
                    <th width="180px">转发到</th>
                    <th width="50px">启用</th>
                    <th width="50px" class="text-center">
                        <n-button type="primary" size="small" circle secondary @click="items.push({active:true})">
                            <template #icon><n-icon :component="Plus" /></template>
                        </n-button>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in items">
                    <td><n-input v-model:value="item.aid" /></td>
                    <td><n-input v-model:value="item.filter" placeholder="留空表示全部"/></td>
                    <td><n-input v-model:value="item.target" placeholder="后端地址"/></td>
                    <td><n-switch v-model:value="item.active" size="large"/></td>
                    <td class="text-center"><n-button size="small" circle type="error" secondary><template #icon><n-icon :component="Trash" /></template></n-button></td>
                </tr>
            </tbody>
        </n-table>

        <div class="mt-2 text-center">
            <n-button type="primary" @click="onOk" size="large">保存配置信息</n-button>
        </div>
    </n-space>

</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { Trash, Plus } from '@vicons/fa'

    const KEY   = "dev.service"
    let text    = ref("")
    let items   = ref([])

    const onOk = ()=>{
        // let mapping = {}
        // text.value.trim().split("\n").map(v=>{
        //     let t = v.trim().split(" ")
        //     if(t.length>1) mapping[t[0]] = t[1]
        // })
        // H.store.set(KEY, H.io.compress(JSON.stringify(mapping)))
        let list = _raw(items)
        for (let i = 0; i < list.length; i++) {
            const e = list[i]
            if(!(e.aid && e.target))
                return M.warn(`第${i+1}条规则的应用编号或者目标地址不能为空`)
        }

        H.store.set(KEY, H.io.compress(JSON.stringify(list)))
        M.notice.ok(`后端服务映射保存成功`)
    }

    onMounted(() => {
        let code = H.store.get(KEY)
        if(code){
            let mappings = JSON.parse(H.io.unCompress(code))
            if(!Array.isArray(mappings) && typeof(mappings)=='object'){
                //兼容旧版本的数据
                mappings = Object.keys(mappings).map(aid=>({aid, target:mappings[aid], active:true, filter:""}))
            }
            items.value = mappings
            console.debug(items.value)
        }
    })
</script>
