<template>
    <var-loading :loading="state==0" description="组件渲染中..." type="rect">
        <div v-if="state==1" id="varletSFC"></div>
        <var-result v-else-if="state==-1" type="error" title="渲染 SFC 失败" description="error" />
    </var-loading>
</template>

<script setup>
    import { ref, markRaw, defineAsyncComponent, onMounted, nextTick } from 'vue'
    //使用当前 vue 对象（包含全局组件等）
    import * as vue from 'vue'
    import { useRoute, useRouter } from 'vue-router'

    import { Loading as VarLoading, Result as VarResult, StyleProvider, Themes } from '@varlet/ui'

    /**
     * 引入 Vant
     */
    import * as varlet from '@varlet/ui'
    import '@varlet/touch-emulator'
    import '@varlet/ui/es/style'

    import { loadModule } from 'vue3-sfc-loader'

    /*
    对常用组件的封装，传递给 SFC，使得实际渲染环境与开发环境引用路径一致
     */
    import Chart from "@C/chart.vue"
    import MDRender from "@C/markdown/md.viewer.vue"

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
        loadModule(`async-sfc-varlet.vue`, {
            moduleCache: {
                vue,
                '@varlet/ui'                : varlet,
                'vue-router'                : { useRoute, useRouter },

                "@C/chart.vue"              : Chart,
                "@C/markdown/md.viewer.vue" : MDRender,
            },
            getFile: () => props.code,
            addStyle: (name) => {},
        })
        .then(component=>{
            com.value = markRaw(component)
            state.value = 1

            nextTick(()=>{
                StyleProvider(window.DARK==true ? Themes.md3Dark : Themes.md3Light)
                vue.createApp(component).use(varlet).mount("#varletSFC")

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
