<template>
    <Viewer :aid="aid" :pid="pid" :params="params" ref="viewer" />
</template>

<script setup>
    import { ref, watch,onMounted, h, reactive, nextTick, onUnmounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'

    import Viewer from "./viewer.vue"

    const route = useRoute()
    const router = useRouter()

    const parseParams = p => p? JSON.parse(H.io.unCompress(decodeURIComponent(p))) : {}

    const loadParamsFromQuery = ()=>{
        window.pageParams = params.value = parseParams(route.query.params)
    }

    let aid = ref(route.params.aid)
    let pid = ref(route.params.pid)
    let params = ref(parseParams(route.query.params))

    let viewer = ref()

    watch(route, ()=>{
        if(route.name == "app-view"){
            let { params } = route
            if(params.aid != aid.value || params.pid != pid.value){
                aid.value = params.aid
                pid.value = params.pid

                H.data.reset()

                loadParamsFromQuery()
                nextTick(viewer.value.refresh)
            }
        }
    })

    onMounted(() => {
        window.metaChangePage = (aid, pid)=>{
            router.replace({name:"app-view", params:{aid, pid}})
        }
    })

    onUnmounted(() => delete window.metaChangePage)
</script>
