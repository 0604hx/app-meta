<!--中转车站，未来考虑不同用户、角色跳转到不同的首页-->
<template>
    <div class="text-center">
        <div style="height: 45vh;"></div>
        <n-spin>
            <template #description>页面载入中...</template>
        </n-spin>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'

    import { defaultHome } from "@S/Auth"

    onMounted(() => useRouter().replace(defaultHome))
</script>
