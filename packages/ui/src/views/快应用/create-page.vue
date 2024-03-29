<template>
    <n-dropdown trigger="click" :options="options" :show-arrow="true" width="150" @select="onSelect" :render-option="render">
        <n-button circle type="primary" size="small" secondary><template #icon><n-icon :component="Plus"/></template></n-button>
    </n-dropdown>
</template>

<script setup>
    import { ref, h } from 'vue'
    import { NText, NIcon, NTooltip } from "naive-ui"
    import { Plus, Desktop } from "@vicons/fa"

    import { templateGroups, templates, findTemplate } from "./"

    const emits = defineEmits(['add'])
    const pros = defineProps({aid:{type:String}})

    // templates.map(v=>{
    //     return { key:v.id, icon:UI.buildIcon2(v.icon || Desktop), label: v.text, summary:v.summary, disabled: v.disabled}
    // })
    // 2023-03-31 增加分组
    let options = (()=>{
        return Object.keys(templateGroups).map(theme=>({
            type:"group",
            label: templateGroups[theme],
            children : templates.filter(t=>t.theme == theme).map(v=>({ key:v.id, icon:UI.buildIcon2(v.icon || Desktop, {class:theme}), label: v.text, summary:v.summary, disabled: v.disabled}))
        }))
    })()

    let render = ({node, option})=> option.type=='group'?
        h(NText, {depth:3, class:"m-3 text-xs"}, ()=>option.label)
        :
        h(
            NTooltip,
            { keepAliveOnHover: false, style: { width: "max-content" }, placement:"left" },
            {
                trigger: () => node,
                default: () => option.summary
            }
        )

    let onSelect = (template, opt) => {
        let tpl = findTemplate(template)
        let onCreate = typeof(tpl.onCreate)==='function'? tpl.onCreate : ()=> ({name: `新建${opt.label}`})

        Promise.resolve(onCreate(pros.aid, tpl)).then(bean=>{
            bean.aid = pros.aid
            bean.template = template

            RESULT("/page/create", bean, d=>{
                M.ok(`新建${opt.label}`)
                emits("add")
            })
        })
    }
</script>
