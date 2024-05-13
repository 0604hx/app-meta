<template>
    <n-select :default-value="value" clearable filterable tag :options="options" placeholder="支持下拉选择表单页或者手动输入页面ID" :on-update:value="v=>emits('update:value', v)" />
</template>

<script setup>
    import { ref,onMounted } from 'vue'

    const emits = defineEmits(['update:value'])
    const props = defineProps({
        value:{type:String, default:null},
        aid:{type:String}
    })

    let options = ref([])

    onMounted(() => {
        RESULT(
            "/page/list",
            {form:{"EQ_template":'form', EQ_aid:props.aid}, fields:['id','name','template']},
            d=> options.value = d.data.map(v=>({label:`${v.template.toUpperCase()} | ${v.name}`, value: `${v.id}`}))
        )
    })
</script>
