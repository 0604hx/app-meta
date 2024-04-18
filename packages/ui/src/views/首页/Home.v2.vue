<!--新版首页，支持布局变更-->
<template>
    <Notice clz="mb-2" />

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
    import { NAlert } from 'naive-ui'

    import { getConfig } from "."

    import Notice from "./公告.vue"

    import Wrapper from "./widget/Wrapper.vue"

    // import WidgetDemo from "./widget/demo.vue"
    import WidgetMinePage from './widget/我的关注.vue'
    import WidgetWrap from "./widget/快捷方式.vue"
    import WidgetAppTop from "./widget/应用排行.vue"
    import WidgetAppDashboard from "@VW/app.overview.vue"

    const official = {
        "M001"  : WidgetMinePage,
        "M002"  : WidgetAppTop,
        "M003"  : WidgetWrap,
        "M004"  : WidgetAppDashboard
    }
    const config = getConfig()

    const buildCom = widget=>{
        const params = widget.params || {}
        if(!!widget.com){
            let com = typeof(widget.com) === 'string'? official[widget.com] : widget.com
            if(!com)
                return h(NAlert, { bordered:false, type:"warning", title:`挂件编号 ⌈${widget.com}⌋ 不存在`}, ()=> `请联系技术人员`)

            return h(com, { widget, ...params })
        }

        return h(Wrapper, { style:{height:widget.height}, aid: widget.aid, pid: widget.uuid })
    }
</script>
