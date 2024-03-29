<template>
    <n-spin :show="state==0">
        <component v-if="state==1" :is='com'></component>
        <n-alert v-else-if="state==-1" type="error" :bordered="false" title="渲染 SFC 失败">
            {{error}}
        </n-alert>
    </n-spin>
</template>

<script setup>
    import { ref, markRaw, defineAsyncComponent, onMounted, nextTick } from 'vue'
    //使用当前 vue 对象（包含全局组件等）
    import * as vue from 'vue'
    import { useRoute, useRouter } from 'vue-router'

    import { loadModule } from 'vue3-sfc-loader'

    /*
    对常用组件的封装，传递给 SFC，使得实际渲染环境与开发环境引用路径一致
     */
    import Chart from "@C/chart.vue"
    import MDRender from "@C/markdown/md.viewer.vue"
    import FileImportor from "@CC/file.import.vue"
    import ClickInput from "@C/dbclick.input.vue"
    import Uploader from "@C/uploader.vue"
    import Title from "@V/widget/page.title.vue"
    import P from "@Pagination"

    const props = defineProps({
        code:{type:String, default:""},
        done:{type:Function},
        fail:{type:Function}
    })

    let state = ref(0)
    let com = ref()
    let error = ""

    const refresh = ()=>{
        if(!props.code) return

        state.value = 0
        loadModule(`async-sfc-naive.vue`, {
            moduleCache: {
                vue,
                'vue-router'                : { useRoute, useRouter },

                "@Pagination"               : P,
                "@C/chart.vue"              : Chart,
                "@C/markdown/md.viewer.vue" : MDRender,
                "@CC/file.import.vue"       : FileImportor,
                "@C/dbclick.input.vue"      : ClickInput,
                "@C/uploader.vue"           : Uploader,
                "@V/widget/page.title.vue"  : Title
            },
            getFile: () => props.code,
            addStyle: () => {},
        })
        .then(component=>{
            com.value = markRaw(component)
            nextTick(()=> {
                state.value = 1
                props.done && props.done()
            })
        })
        .catch(e=>{
            error = e
            state.value = -1
            props.fail && props.fail(e)
        })
    }

    onMounted( refresh )

    defineExpose({ refresh })
</script>
