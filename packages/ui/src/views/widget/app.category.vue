<!--应用激活组件-->
<template>
    <n-tag :bordered="false" round :type="item.theme">{{item.name}}</n-tag>
</template>

<script setup>
    import { ref } from 'vue'
    import { getCategory } from "@S/Common"

    const props = defineProps({
        category:{type:Number}
    })
    const item = getCategory(props.category)
</script>
