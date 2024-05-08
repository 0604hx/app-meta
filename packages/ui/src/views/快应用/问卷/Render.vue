<template>
    <n-card>
        <template #header>
            <ListAltRegular class="icon" />
            {{page.name}}
        </template>
        <MDRender :code="bean.summary" />

        <template v-if="state==1">
            <n-card v-for="(item,index) in bean.items" size="small" class="mb-2" :bordered="true">
                <template #header>
                    <n-space size="small">
                        <n-tag :bordered="false" type="primary">{{index+1}}</n-tag>
                        <n-tag v-if="item.required" :bordered="false" type="info">必填</n-tag>
                        <span>{{item.title}}</span>
                    </n-space>
                </template>
                <n-space vertical>
                    <n-radio-group size="large" v-if="item.type==0" v-model:value="form[item.id]">
                        <n-space>
                            <n-radio v-for="o in item.options" :value="o">{{ o }}</n-radio>
                        </n-space>
                    </n-radio-group>
                    <n-checkbox-group size="large" v-else-if="item.type==1" v-model:value="form[item.id]">
                        <n-space item-style="display: flex;">
                            <n-checkbox v-for="o in item.options" :value="o" :label="o" />
                        </n-space>
                    </n-checkbox-group>
                    <n-input v-else  v-model:value="form[item.id]"></n-input>
                </n-space>
            </n-card>

            <div class="text-center mt-3">
                <n-button :disabled="posted" size="large" type="primary" @click="toSave">提交问卷</n-button>
            </div>

            <DocumentList class="mt-4" :pid="page.id" />
        </template>

        <n-alert v-else-if="state==2" class="mt-4" title="问卷已提交，无需重复填写" type="info">
            此问卷已被设置为 <n-tag size="small">{{limits[bean.limit].label}}</n-tag>，
            您已于 <n-tag size="small">{{toDate(answer.addOn)}}</n-tag> 填写过，故无法再填写。
        </n-alert>

        <template v-else-if="state==3">
            <n-alert class="mt-4" title="问卷未开始或者已结束" type="info">
                <div class="text-2xl">
                    开放时段：{{toDate2(bean.time[0])}} 到 {{toDate2(bean.time[1])}}
                </div>
            </n-alert>

            <DocumentList class="mt-4" :pid="page.id" />
        </template>
    </n-card>
</template>

<script setup>
    import { ref,reactive, onMounted } from 'vue'
    import { useRoute } from 'vue-router'
    import { ListAltRegular } from "@vicons/fa"

    import MDRender from "@md.viewer"
    import DocumentList from "../document-list.vue"

    import { renderProps } from "../"
    import { limits } from "./"

    const props = defineProps(renderProps)
    const { aid, pid } = useRoute().params

    const build = ()=>{
        let b = JSON.parse(props.data)
        if(Array.isArray(b.items)){
            b.items.forEach((item,i)=>item.id = item.abbr||buildId(item, i))
        }
        //判断填写限制
        return b
    }
    let bean    = reactive(build())
    let form    = reactive({})
    let posted  = ref(false)
    let state   = ref(0)
    let answer  = ref({})

    let started = Date.now()
    let user    = {}

    const toDate    = d=>H.date.datetime(d)
    const toDate2   = d=>H.date.date(d, "YYYY-MM-DD HH:mm")
    const buildMatch= (ps={})=> Object.assign({match:{field:"user", op:"EQ", value: user.id}, aid, pid}, ps)
    const buildId   = (row, index)=>`Q${index+1}`

    const checkState = ()=>{
        let now = Date.now()
        //判断是否在生效日期内
        if(Array.isArray(bean.time) && (bean.time[0] > now || bean.time[1] < now))
            state.value = 3
        else
            state.value = 1
    }

    const doSave  = ()=>{
        form.used = Math.floor((Date.now() - started)/1000)
        form.date = H.date.datetime()

        H.data.insert({aid, pid}, form).then(d=>{
            M.notice.ok(`您的问卷结果已经提交，感谢参与！`)
            posted.value = true
        })
    }

    const toSave = ()=>{
        let { items } = bean
        let errors = []
        items.forEach((i, index)=>{
            if(i.required === true && (!form[i.id] || (Array.isArray(form[i.id] && form[i.id].length==0))))
                errors.push(`题目${index+1}（${i.id}）未填写`)
        })
        if(errors.length)
            return M.dialog({type:"error", title:`问卷填写有误`, content: UI.html(errors)})

        if(bean.anonymous===false)
            form.user = user.id

        //删除历史的数据
        if(bean.limit == 2)
            H.data.remove(buildMatch()).then(doSave)
        else
            doSave()
    }

    onMounted(() => {
        H.data.getUserInfo().then(d=>{
            user = d
            //仅能填写一份
            if(bean.limit == 1){
                H.data.query( buildMatch({pageSize:1} )).then(dd=>{
                    if(dd.data && dd.data.length){
                        answer.value    = dd.data[0]
                        state.value     = 2
                    }
                    else
                        checkState()
                })
            }
            else
                checkState()
        })
    })
</script>
