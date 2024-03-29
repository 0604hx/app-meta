<template>
    <template v-if="item.special">
        <Tag :size="size" class="mr-1">{{item.tag}}</Tag>{{item.name}}
    </template>
    <template v-else>{{text}}</template>
</template>

<script setup>
    import { h, computed } from 'vue'

    import CTag from "@C/custom/tag.vue"

    const props = defineProps({
        text:{type:String},
        size:{type:String, default:"medium"}
    })

    const item = computed(()=>{
        let tmp = new RegExp(/^`(.*)`(.*)/).exec(props.text)
        if(!tmp)
            tmp = new RegExp(/^(.*)\|(.*)/).exec(props.text)

        let special = !!tmp
        return special ? { special, tag:tmp[1], name:tmp[2] } : {special}
    })
</script>
