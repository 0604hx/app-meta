<template>
    <Designer :renders="RenderFuncs" :components="Components" :form="form" debug show-footer style="height: 100%;"></Designer>
</template>

<script setup>
    import { reactive, onMounted, onUnmounted } from 'vue'
    import { Designer, Components } from "@grid-form/designer"
    import { RenderFuncs } from "@grid-form/render-naive"
    import { createForm } from "@grid-form/common"

    // 如需扩展 RenderFuncs、Components ，请自行扩写
    let form = reactive(createForm())

    const PADDING = "main.padding"

    onMounted(()=>E.emit(PADDING, 0))
    onUnmounted(()=> E.emit(PADDING))
</script>
