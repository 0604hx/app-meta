<template>
    <n-tooltip>
        <template #trigger>
            <n-icon v-if="icon" :component="bean.icon" :class="bean.theme" />
            <n-tag v-else :bordered="false" round size="small" :type="bean.theme">{{bean.text}}</n-tag>
        </template>
        {{bean.summary}}
    </n-tooltip>
</template>

<script setup>
    import { ref } from 'vue'

    const props = defineProps({
        bean:{type:Object},
        icon: {type:Boolean, default: false},   //仅显示图标
    })
</script>
