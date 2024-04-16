<template>
    <object :data type="text/html" style="width: 100%; height: 100%;"></object>
</template>

<script setup>
    import { ref } from 'vue'

    const props = defineProps({aid:String, pid:[Number, String]})

    const data = `/#/app-pure/${props.aid}${props.pid?("/"+props.pid):""}`
</script>
