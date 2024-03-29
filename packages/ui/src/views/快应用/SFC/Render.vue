<template>
    <component ref="sfc" :is="getRender(bean.ui)" :code="bean.code" :done="onLoad" />

    <DocumentList v-if="ok" class="mt-4" :pid="page.id" />
</template>

<script setup>
    import { ref, reactive, onMounted, nextTick, computed } from 'vue'

    import DocumentList from "../document-list.vue"

    import { renderProps, loadContent } from "../"
    import { translator, getRender } from "."

    E.emit("main.padding", 0)
    const props = defineProps(renderProps)

    let bean = translator(props.data)
    let ok = ref(false)

    const onLoad = ()=> ok.value = true
</script>
