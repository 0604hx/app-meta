<template>
    <n-card v-if="bean.summary" :title="page.name" class="mb-3" size="small" segmented>
        <MDRender :code="bean.summary" />
    </n-card>

    <n-space>
        <template v-for="item in bean.fields">
            <n-input v-if="item.bindUid!=true && item.query" v-model:value="form[item.label]">
                <template #prefix> <n-tag :border="false" size="small" type="info">{{item.label}}</n-tag> </template>
            </n-input>
        </template>
        <n-button type="primary" @click="query">检索数据</n-button>
    </n-space>

    <n-data-table class="mt-3" :columns="columns" size="small" :remote="true" :virtual-scroll="bean.virtual===true" :loading="loading" striped :data="beans" :style="{height}" flex-height></n-data-table>
</template>

<script setup>
    import { ref,reactive, onMounted, nextTick } from 'vue'
    import { useRoute } from 'vue-router'

    import MDRender from "@md.viewer"
    import DocumentList from "../document-list.vue"
    import { renderProps } from "../"

    const props = defineProps(renderProps)
    const aid = useRoute().params.id

    let loading = ref(false)
    let beans   = ref([])
    let bean    = reactive(JSON.parse(props.data))
    let form    = reactive({})

    let height  = bean.tableHeight < 0?`calc(100vh - ${bean.tableHeight*-1}px)` : `${bean.tableHeight||400}px`
    let binds = bean.fields.filter(f=>f.bindUid).map(f=>f.label)
    let columns = (()=>{
        let cs = []
        if(bean.indexCol===true)    cs.push({title:"序号", render:(row, index)=> index+1, width:80, align:"center"})
        cs.push(...bean.fields.map(f=>({ title: f.label, key: f.label })))
        return cs
    })()

    const query = ()=>{
        let match = Object.keys(form).filter(f=>!!form[f].trim() && !binds.includes(f)).map(f=>({field:f, op:"LIKE", value: form[f]}))
        //判断用户绑定
        binds.forEach(f=> match.push({field:f, op:"EQ", value: User.id}))

        console.debug(match)
        loading.value = true
        H.data.query({aid, match}).then(d=>{
            beans.value = d.data.map(dd=>dd.v)
            loading.value = false
        })
    }

    onMounted(() => {
        console.debug(bean.autoLoad)
        if(bean.autoLoad){
            console.debug("--------")
            nextTick( query )
        }
    })
</script>
