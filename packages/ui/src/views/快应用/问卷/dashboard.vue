<!--数据统计-->
<template>
    <n-spin v-if="!inited" class="text-center w-full"></n-spin>
    <template v-else>
        <n-card size="small" title="数据总览">
            <n-grid :cols="3">
                <n-gi>
                    <n-statistic label="问卷结果数">
                        <template #prefix><ListAltRegular class="icon"/></template>
                        {{sum.total}} 份
                    </n-statistic>
                </n-gi>
                <n-gi>
                    <n-statistic label="参与人数">
                        <template #prefix><User class="icon"/></template>
                        {{sum.user}} 人
                    </n-statistic>
                </n-gi>
                <n-gi>
                    <n-statistic label="平均耗时">
                        <template #prefix><Clock class="icon"/></template>
                        {{sum.used}} 秒
                    </n-statistic>
                </n-gi>
            </n-grid>
        </n-card>

        <n-table size="small" class="mt-3">
            <thead>
                <tr>
                    <th width="50" class="text-center">#</th>
                    <th>交卷日期</th>
                    <th width="200">交卷人</th>
                    <th width="160">填写耗时（秒）</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in beans" @dblclick="toShow(item)">
                    <td class="text-center">{{index+1}}</td>
                    <td>{{item.date}}</td>
                    <td>{{item.user}}</td>
                    <td>{{item.used}} 秒</td>
                </tr>
            </tbody>
        </n-table>

        <div class="mt-3 text-right">
            <n-button @click="toExport" type="primary" secondary>导出数据（CSV）</n-button>
        </div>

        <n-modal v-model:show="show" preset="card" title="问卷详情" :style="{width: '1000px'}" :mask-closable="false">
            <!-- <n-descriptions label-placement="left" bordered label-align="center" size="small">
                <n-descriptions-item label="答卷人">{{bean.user}}</n-descriptions-item>
                <n-descriptions-item label="答卷日期">{{bean.date}}</n-descriptions-item>
                <n-descriptions-item label="答卷耗时">{{bean.used}} 秒</n-descriptions-item>
            </n-descriptions> -->

            {{bean.user}} 提交于 {{bean.date}}，耗时 {{bean.used}} 秒。

            <n-descriptions class="mt-2" label-placement="left" bordered :column="1" size="small">
                <template v-for="(v,k) in bean">
                    <n-descriptions-item v-if="!defFields.includes(k)" :label="k">{{v}}</n-descriptions-item>
                </template>
            </n-descriptions>
        </n-modal>
    </template>
</template>

<script setup>
    import { ref,onMounted } from 'vue'
    import { User, ListAltRegular, Clock } from "@vicons/fa"

    const props = defineProps({aid:String, pid:[String, Number]})

    const defFields = ["date", "user", "used"]

    let inited  = ref(false)
    let bean    = ref({})
    let show    = ref(false)
    let beans   = []
    let sum     = {}

    const refresh = ()=>{
        sum.total   = beans.length
        sum.user    = new Set(beans.map(v=>v.user)).size
        sum.used    = Math.floor(beans.reduce((pre,v)=>pre+=v.used, 0) / beans.length)

        inited.value = true
    }

    const toShow = row=>{
        bean.value  = row
        show.value  = true
    }

    const toExport = ()=>{
        let keys = Object.keys(beans[0]).filter(v=>!defFields.includes(v))
        let rows = [["日期","交卷人","耗时(秒)", ...keys]]
        beans.forEach(b=> rows.push([b.date, b.user, b.used, ...keys.map(k=>b[k])]))
        H.saveToCSV(rows, `问卷结果导出`)
    }

    onMounted(() => {
        console.debug("加载全部数据....", beans, sum)
        H.data.query({ aid:props.aid, pid:props.pid }).then(d=>{
            beans = d.data.map(v=>v.v)
            console.debug(beans)
            refresh()
        })
    })
</script>
