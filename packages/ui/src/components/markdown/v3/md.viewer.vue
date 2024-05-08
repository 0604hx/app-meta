<template>
    <MdPreview v-if="code" :modelValue="code" :theme="dark?'dark':'light'" :previewTheme :showCodeRowNumber :mdHeadingId/>
</template>

<script setup>
    import { MdPreview } from 'md-editor-v3'
    import 'md-editor-v3/lib/preview.css'

    import { mdHeadingId, previewTheme, showCodeRowNumber } from "."
    import { ViewerProps } from ".."

    const props = defineProps(ViewerProps)
</script>
