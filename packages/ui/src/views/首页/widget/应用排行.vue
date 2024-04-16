<template>
    <n-spin :show="loading">
        <n-card size="small" title="应用排行">
            <template #header-extra>
                <n-tabs type="line" size="small" :on-update:value="onTopChange">
                    <n-tab name="newest">最新发布</n-tab>
                    <n-tab name="launch">人气热门</n-tab>
                </n-tabs>
            </template>

            <n-grid cols="2 300:1 500:2 800:3 1000:4 1200:6" :x-gap="12" :y-gap="12">
                <n-gi v-for="item in beans">
                    <AppCard :runable="true" :showAction="true" :bean="item" />
                </n-gi>
            </n-grid>
        </n-card>
    </n-spin>
</template>

<script setup>
    import { ref, onMounted } from 'vue'

    import AppCard from "@VW/app.card.vue"

    import { widgetProps } from "."

    const props = defineProps(widgetProps)

    let beans = ref([])
    let loading = ref(false)
    let orderBy = props.widget.config?.sort == 0? "newest":"launch"

    const refresh = ()=> RESULT("/app/top", {key: orderBy}, d=> beans.value = d.data, {loading})

    const onTopChange = v => {
        if(orderBy == v)    return

        orderBy = v
        refresh()
    }

    onMounted( refresh )
</script>
