<!--应用访问总览-->
<template>
    <n-grid v-if="inited" :cols="3" x-gap="10" y-gap="10">
        <n-gi span="3">
            <Chart ref="chart" :toolbox="true" :style="{height: height+'px'}" />
        </n-gi>
        <template v-if="!simple">
            <n-gi>
                <n-card size="small" title="TOP 用户">
                    <n-list size="small" hoverable class="mini">
                        <n-list-item v-for="(item, index) in bean.topUser">
                            {{item.id}}
                            <template #suffix>
                                <n-button v-if="index<3" text type="info">{{item.value}} {{medals[index]}}</n-button>
                                <n-button v-else text>{{item.value}}</n-button>
                            </template>
                        </n-list-item>
                    </n-list>
                </n-card>
            </n-gi>
            <n-gi>
                <n-card size="small" title="TOP 部门">
                    <n-list size="small" hoverable class="ellipsis mini">
                        <n-list-item v-for="(item, index) in bean.topDepart">
                            {{item.id || "（空）"}}
                            <template #suffix>
                                <n-button v-if="index<3" text type="info">{{item.value}} {{medals[index]}}</n-button>
                                <n-button v-else text>{{item.value}}</n-button>
                            </template>
                        </n-list-item>
                    </n-list>
                </n-card>
            </n-gi>
            <n-gi>
                <n-card size="small" title="TOP 页面/功能">
                    <n-list size="small" hoverable class="ellipsis mini">
                        <n-list-item v-for="(item, index) in bean.topPage">
                            <Title :text="item.id" />
                            <template #suffix>
                                <n-button v-if="index<3" text type="info">{{item.value}} {{medals[index]}}</n-button>
                                <n-button v-else text>{{item.value}}</n-button>
                            </template>
                        </n-list-item>
                    </n-list>
                </n-card>
            </n-gi>
            <n-gi span="3" class="text-center">
                <n-text depth="3">数据更新于 {{bean.date}}（通常 30 分钟刷新一次）</n-text>
            </n-gi>
        </template>
    </n-grid>
    <div v-else class="text-center"> <n-spin size="large"></n-spin> </div>
</template>

<script setup>
    import { ref, onMounted, nextTick } from 'vue'

    import Title from "./page.title.vue"
    import Chart from "@C/chart.vue"

    const props = defineProps({
        simple:{type:Boolean, default: false},      //仅显示访问量统计图
        aid: {type:String, default:""},
        height: {type:Number, default: 300}
    })

    let inited  = ref(false)
    let bean    = {}
    let chart   = ref()

    const medals = ['🥇','🥈','🥉']
    const rank = (value, index)=> `${medals[index]??''} ${value}`

    onMounted(() => RESULT("/app/overview", {id: props.aid}, d=>{
        bean = d.data

        inited.value = true
        nextTick(()=> {
            bean.data.forEach(v=>{
                v.areaStyle = {opacity: 0.8}
                v.showSymbol = false
                v. lineStyle = { width: 0 }
            })
            chart.value.update(bean.days, bean.data)
        })
    }))
</script>
