<!--新版首页，支持布局变更-->
<template>
    <n-grid :cols="config.cols" :x-gap="config.x" :y-gap="config.y">
        <template v-for="widget in config.items">
            <n-gi :span="widget.span">
                <n-card v-if="widget.card" :title="widget.title" size="small">
                    <component :is="buildCom(widget)" />
                </n-card>
                <template v-else>
                    <component :is="buildCom(widget)" />
                </template>
            </n-gi>
        </template>
    </n-grid>
</template>

<script setup>
    import { ref, h } from 'vue'

    import { getConfig } from "."

    import Wrapper from "./widget/Wrapper.vue"

    const config = getConfig()

    const buildCom = widget=>{
        if(!!widget.com)
            return h(widget.com, { widget })

        return h(Wrapper, { style:{height:widget.height}, aid: widget.aid, pid: widget.uuid })
    }
</script>
