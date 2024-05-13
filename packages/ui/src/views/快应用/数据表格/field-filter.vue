<template>
    <n-input-group>
        <n-select :size="size" v-model:value="bean.field" :options="fields" :style="{ width: '35%' }" placeholder="字段" />
        <n-select :size="size" v-model:value="bean.op" :disabled="opLock" :options="operations" :style="{ width: '25%' }" />
        <n-input  :size="size" v-model:value="bean.value" :style="{ width: '40%' }" placeholder="筛选值" />
        <n-button :size="size" quaternary type="error" title="移除筛选项" @click="()=> emits('delete')"><template #icon><n-icon :component="Trash" /> <Trash class="icon"/> </template></n-button>
    </n-input-group>
</template>

<script setup>
    import { ref } from 'vue'
    import { Trash } from "@vicons/fa"

    import { operations } from './'

    const emits = defineEmits(['delete'])
    const props = defineProps({
        bean:{ type:Object },
        fields:{type: Array},
        size:{type:String, default:"small"},
        opLock:{type:Boolean, default: true}
    })
</script>
