<template>
    <n-space vertical>
        <n-card title="配置说明" size="small">
            首页以 GRID 布局 配置内容为一个标准的 JSON 对象，属性如下：

            <n-space vertical>
                <n-table size="small" :bordered="false">
                    <thead>
                        <tr>
                            <th width="100">字段</th>
                            <th width="100">类型</th>
                            <th>说明</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>cols</td>
                            <td>数值</td>
                            <td>每行的格子数</td>
                        </tr>
                        <tr>
                            <td>x</td>
                            <td>数值</td>
                            <td>横向格子间距，单位 px</td>
                        </tr>
                        <tr>
                            <td>y</td>
                            <td>数值</td>
                            <td>纵向格子间距，单位 px</td>
                        </tr>
                        <tr>
                            <td>items</td>
                            <td>数组</td>
                            <td>
                                字段包含： card（是否以卡片形式展示，true）、span（格子数，1）、height（高度，auto）、uuid（编号）、title（标题）、com（组件）、params（参数）
                                <div>
                                    内置组件：<Tag>M001</Tag> 我的关注、<Tag>M002</Tag> 热门应用、<Tag>M003</Tag> 快捷方式、<Tag>M004</Tag> 应用数据面板
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </n-table>

                <div>
                    M003 示例：<code>{ "com":"M003", "card":false, "params":{ "text":"快捷方式", "height":60, "aid":'demo', "pid":2} }</code>
                </div>
                <div>
                    M004 示例：<code>{ "title":`应用总览`, "params":{"aid":"demo", "height": 200, "simple": true}, "com": "M004", "span": 4 }</code>
                </div>
                <div>
                    嵌入页面：<code>{ "uuid":'PID', "aid":'demo', "title":"标题", "card":true, "height": '110px' }</code>
                </div>
            </n-space>
        </n-card>

        <CodeEditor v-model:value="code" style="height: 240px;" />
        <n-space justify="center">
            <n-button type="primary" secondary @click="useDefault">使用默认值</n-button>
            <n-button type="primary"  @click="toSave">保存配置</n-button>
        </n-space>
    </n-space>
</template>

<script setup>
    import { ref } from 'vue'

    import CodeEditor from "@C/editor.code.vue"

    import { saveConfig, loadConfig } from "."

    let code = ref(loadConfig())

    const useDefault = ()=> code.value = `{
    "cols": 8,
    "x": 10,
    "y": 10,
    "items": [
        { "card": true, "span": 8, "height": "auto", "uuid": "mine-page", "title": "快捷入口", "com": "M001" },
        { "card": false, "span": 8, "height": "auto", "uuid": "app-top", "title": "应用排行", "com": "M002" }
    ]
}`

    const toSave = ()=>{
        try{
            JSON.parse(code.value)
            saveConfig(code.value)
            M.ok(`配置保存（仅限本地）`)
        } catch(e){
            console.debug(e)
            M.showError(`解析 JSON 格式失败：${e.message}`, "格式有误")
        }

    }
</script>
