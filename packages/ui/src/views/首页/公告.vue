<template>
    <n-alert v-if="showAlert" :title="notice.name" :class="clz" type="info" show-icon closable @close="readed">
        <MDRender :code="notice.summary" />
    </n-alert>
</template>

<script setup>
    import { ref,onMounted, h } from 'vue'

    import MDRender from "@md.viewer"

    const props = defineProps({
        clz:{type:String, default:"mb-3"}
    })

    let showAlert   = ref(false)
    let notice      = {}

    const withDialog = ()=>{
        M.showData(
            ()=> h(MDRender, {code: notice.summary}),
            {
                title: notice.name,
                positiveText:"朕知道了",
                positiveButtonProps:{size:"large"},
                onPositiveClick: readed
            }
        )
    }

    const readed = ()=>{
        RESULT("/notice/done", {id:notice.id}, d=>{
            localStorage.setItem("meta.notice", H.date.date())
        })
    }

    onMounted(()=>{
        if(localStorage.getItem("meta.notice") == H.date.date()) return

        RESULT("/notice/valid", {}, d=>{
            if(d.data && !!d.data.id){
                notice = d.data
                if(notice.mode == 'notice'){
                    return showAlert.value = true
                }
                withDialog()
            }
        })
    })
</script>
