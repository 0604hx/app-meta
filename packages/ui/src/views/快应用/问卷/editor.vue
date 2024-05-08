<!---->
<template>
    <n-card title="问卷配置" segmented size="small">
        <n-form :show-feedback="false" label-placement="left" label-width="80">
            <n-space vertical>
                <n-form-item label="是否匿名">
                    <n-switch v-model:value="bean.anonymous" />
                    <n-text depth="3" class="ml-3">勾选则不记录填卷人信息</n-text>
                </n-form-item>
                <n-form-item label="开放时段">
                    <n-date-picker v-model:value="bean.time" type="datetimerange" clearable />
                    <n-text depth="3" class="ml-3">若设置则仅能在该时段内提交问卷</n-text>
                </n-form-item>
                <n-form-item label="填写限制">
                    <n-radio-group size="large" v-model:value="bean.limit">
                        <n-space>
                            <n-tooltip v-for="o in limits" >
                                <template #trigger><n-radio :value="o.value">{{ o.label }}</n-radio></template>
                                {{o.summary}}
                            </n-tooltip>
                        </n-space>
                    </n-radio-group>
                </n-form-item>
                <n-form-item label="说明信息">
                    <MDEditor ref="mdEditor" height="300px" :code="bean.summary" />
                </n-form-item>
            </n-space>
        </n-form>
    </n-card>

    <n-card class="mt-3" title="题目" segmented size="small">
        <template #header-extra><n-button type="primary" size="small" secondary @click="bean.items.push(creater())">新增题目</n-button></template>
        <n-form :show-feedback="false" label-placement="top" label-width="80">
            <n-card v-for="(item,index) in bean.items" size="small" class="mb-2" :bordered="true">
                <template #header>
                    <n-input v-model:value="item.title">
                        <template #prefix><n-tag :bordered="false" size="small" type="primary">题目{{index+1}}</n-tag></template>
                    </n-input>
                </template>
                <template #header-extra>
                    <n-popconfirm :negative-text="null" @positive-click="bean.items.splice(index,1)" placement="top-end">
                        <template #trigger>
                            <n-button class="ml-2" type="error" text size="tiny" circle><template #icon><n-icon :component="Trash" /></template></n-button>
                        </template>
                        确定删除题目⌈{{item.title}}⌋吗？
                    </n-popconfirm>
                </template>

                <n-grid cols="14" x-gap="10">
                    <n-form-item-gi label="类型">
                        <n-select v-model:value="item.type" :options="types" />
                    </n-form-item-gi>
                    <n-form-item-gi label="选项值" span="9">
                        <!-- <n-input :disabled="item.type==2" v-model:value="item.options" placeholder="多个用英文逗号隔开" /> -->
                        <n-dynamic-tags :disabled="item.type==2" size="large" v-model:value="item.options" />
                    </n-form-item-gi>
                    <n-form-item-gi label="最小选择数">
                        <n-input-number :disabled="item.type!=1" v-model:value="item.min" />
                    </n-form-item-gi>
                    <n-form-item-gi label="最大选择数">
                        <n-input-number :disabled="item.type!=1" v-model:value="item.max" />
                    </n-form-item-gi>
                    <n-form-item-gi label="题目简称">
                        <n-input v-model:value="item.abbr" placeholder="用于结果显示" />
                    </n-form-item-gi>
                    <n-form-item-gi label="是否必填">
                        <n-switch v-model:value="item.required" />
                    </n-form-item-gi>
                </n-grid>
            </n-card>
        </n-form>
    </n-card>

    <div class="text-center mt-4">
        <n-button type="primary" size="large" @click="toSave">保存问卷信息</n-button>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { Trash } from '@vicons/fa'
    import MDEditor from "@md.editor"
    import { types, limits } from "./"

    const props = defineProps({
        bean: {type:Object},
        updater:{type:Function},
        creater:{type:Function}
    })

    let mdEditor = ref()

    let toSave = () => {
        let { anonymous, time, items, limit } = props.bean
        let questions = []
        for (let i = 0; i < items.length; i++) {
            const item = items[i]

            let errors = []
            if(!item.title.trim())                      errors.push(`标题不能为空`)
            if(item.type!=2 && !item.options)           errors.push(`选择项不能为空`)
            if(item.type==1 && (item.max < item.min))   errors.push(`最大选择数不能小于最小选择数`)
            if(errors.length)
                return M.dialog({type:"error", title:`题目 ${i+1} 配置有误`, content: UI.html(errors) })

            let q = {title:item.title, required:item.required,abbr:item.abbr, type:item.type}
            if(q.type != 2){
                if(q.type == 1){
                    if(item.min >= 0)  q.min = item.min
                    if(item.max >= 0)  q.max = item.max
                }

                q.options = item.options //item.options.split(",")
            }

            questions.push(q)
        }

        let model = { anonymous, limit, time, summary: mdEditor.value.getMarkdown(), items:questions }
        console.debug(model)
        props.updater(JSON.stringify(model), ()=> M.notice.ok(`问卷数据保存成功`))
    }
</script>
