<!--运行快应用-->
<template>
    <FormRender :renders="RenderFuncs" :form="form" :debug="debug" @submit="submitDo" @failed="onFailed" />

    <DocumentList class="mt-4" :pid="page.id" />
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { useRoute } from 'vue-router'

    import { triggerAfterSubmit } from '@grid-form/common'
    import { FormRender, RenderFuncs } from "@grid-form/render-naive"
    import DocumentList from "../document-list.vue"

    import { renderProps } from "../"

    const props = defineProps(renderProps)
    const { aid, pid } = useRoute().params

    let form = reactive(JSON.parse(props.data))
    let posted = false
    let debug = Config.isDev
    let formBean = {}

    let submitDo = (formObj, action='post')=>{
        if(action != 'post')    return console.debug(`ACTION=${action} 的反馈未实现...`, formObj)

        if(posted)  return M.warn(`该表单已经提交，请勿重复操作`)
        delete formObj['_disabled']

        if(Object.keys(formObj).length <= 0)    return M.warn(`表单没有数据待提交`)
        console.debug("表单提交：", formObj)

        formBean = formObj
        //提交到指定位置
        if(!!form.url) {
            fetch(form.url, {method:"post", body:JSON.stringify(formObj)})
                .then(v=>json())
                .then(onSubmitDone)
                .catch(e=>{
                    console.debug(`表单提交失败`, e)
                    M.dialog({type:"error", title:"表单提交失败", content: UI.html([e.message, "", `<span class='h'>${form.url}</span>`]) })
                })
        }
        else {
            H.data.insert({aid, pid}, formObj)
                .then( onSubmitDone )
                .catch(e=> {
                    M.dialog({type:"error", title:"数据接口调用时出错", content: UI.html([typeof(e)==='string'? e: e.message, `所用接口为：<span class='h'>data.insert</span>`])})
                })
        }
    }

    /**
     * 数据提交后处理函数
     */
    let onSubmitDone = d=> {
        M.dialog({type:"success", title: "数据提交成功", content: UI.html(form.okText||`数据提交完成，感谢支持`)})
        posted = true

        if(form.afterSubmit)
            triggerAfterSubmit(form.afterSubmit, formBean)
    }

    const onFailed = fails=> M.dialog({content: UI.html(fails), title:"表单校验未通过", type:"error"})
</script>
