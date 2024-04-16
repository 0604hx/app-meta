<template>
    {{ widget }}
</template>

<script setup>
    import { ref } from 'vue'

    import { widgetProps } from "."

    const props = defineProps(widgetProps)
</script>
