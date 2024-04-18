<template>
    <FormRender :renders="RenderFuncs" :form="form" debug @submit="onSubmit" @failed="onFailed"></FormRender>
</template>

<script setup>
    import { reactive, ref,watch } from 'vue'
    import { NInput } from 'naive-ui'

    import { FormRender, RenderFuncs } from "@grid-form/render-naive"

    const COLS = 4

    // 如需扩展 Widgets,Components ，请自行扩写
    let form = reactive({
        "size":"medium",
        "width":"90%",
        "grid":3,
        "labelWidth":120,
        "labelShow":true,
        "labelPlacement":"top",
        "labelAlign":"left",
        "submitText":"提交数据",
        "url":"",
        "okText":"",
        "onLoad":"console.debug(`表单初始化完成`, form); form.scale= form.scale||1",
        "onSubmit":"",
        "items":[
            {"_widget":"INPUT","_uuid":"name","_text":"企业名称","_col":1,"_required":true,"_regex":"","_message":"","placeholder":"请输入","clearable":true,"show-count":true,"rows":1,"_value":"","_active":true,"minlength":4},
            {"_widget":"NUMBER","_uuid":"scale","_text":"企业规模","_col":1,"_required":true,"_regex":"","_message":"","placeholder":"请输入","clearable":true,"_active":false,"suffix":"人","min":1},
            {"_widget":"SELECT","_uuid":"nature","_text":"企业性质","_col":1,"_required":false,"_value":"国有企业","options":"国有企业, 集体企业, 私营企业, 个体工商户, 合伙企业, 联营企业, 股份合作制企业, 有限责任公司, 股份有限公司"},
            {"_widget":"INPUT","_uuid":"address","_text":"办公地址","_col":3,"_required":false,"_regex":"","_message":"","placeholder":"请输入","clearable":true,"show-count":false,"rows":1,"_value":"","_active":false},
            {"_widget":"TAGS","_uuid":"tags","_text":"企业标签","_col":3,"_required":false,"_regex":"","_message":"","closable":true,"round":false,"_active":false}
        ],
        "buttons":[
            {"text":"自定义按钮", theme:"info", type:"download", code:`console.debug("自定义按钮被点击了，即将触发 ACTION=DOWNLOAD 类型的表单提交")`},
            /*
            code 支持全局函数的调用
            */
            {"text":"随机企业名称", theme:"default", type:"script", code:`form.name="广西南宁市随机${"一二三四五六天"[Math.floor(Math.random()*7)]}有限公司"`}
        ]
    })

    const onSubmit = (formData, action)=>{
        console.debug(formData, action)
    }
    const onFailed = fails => M.dialog({
        title:`表单校验失败（存在 ${fails.length} 个问题）`,
        type:"error",
        content: UI.html(fails)
    })
</script>
