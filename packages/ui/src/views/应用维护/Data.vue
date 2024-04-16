<template>
    <n-tabs @update:value="onTabChange">
        <n-tab-pane name="block" tab="数据块 / BLOCK">
            <div v-if="!blockLoaded" class="text-center"><n-spin /></div>
            <n-table v-else :bordered="false">
                <thead>
                    <tr>
                        <th width="180">UUID</th>
                        <th>内容</th>
                        <th width="80">
                            <n-button type="primary" size="small" secondary @click="editBlock()">新增数据块</n-button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in blocks">
                        <td>{{item.uuid}}</td>
                        <td @dblclick="editBlock(item)"><n-ellipsis>{{item.text}}</n-ellipsis></td>
                        <td class="text-center">
                            <n-popconfirm :negative-text="null" @positive-click="()=>delBlock(item.uuid, index)" placement="top-end">
                                <template #trigger>
                                    <n-button type="error" size="tiny" circle><template #icon><n-icon :component="Trash" /></template></n-button>
                                </template>
                                删除数据块⌈{{item.uuid}}⌋吗？
                            </n-popconfirm>
                        </td>
                    </tr>
                </tbody>
            </n-table>
        </n-tab-pane>

        <n-tab-pane name="data" tab="业务数据 / DATA">
            该功能正在计划中（很可能不会有），请直接修改数据库...
        </n-tab-pane>
    </n-tabs>

    <n-modal v-model:show="block.show" preset="card" :style="{width: '1000px'}" :mask-closable="false" title="编辑数据块">
        <!-- <n-alert :bordered="false" type="info" title="规则说明"></n-alert> -->
        <n-form :show-feedback="false" :label-width="80" label-placement="left">
            <n-space vertical>
                <n-form-item label="数据编号">
                    <n-input :disabled="!block.isNew" v-model:value="block.bean.uuid"></n-input>
                </n-form-item>
                <n-form-item label="数据内容">
                    <n-input v-model:value="block.bean.text" :rows="18" type="textarea" placeholder="输入空则表示删除该数据块"></n-input>
                </n-form-item>
                <div class="text-right">
                    <n-button @click="importor.open" size="small" type="info" secondary>从数据文件中导入</n-button>
                </div>
            </n-space>

            <div class="text-center mt-4">
                <n-button type="primary" size="large" :disabled="!block.bean.uuid" secondary @click="saveBlock"><template #icon><n-icon :component="Check" /></template>确认</n-button>
            </div>
        </n-form>
    </n-modal>

    <FileImportor ref="importor" @update="onData" />
</template>

<script setup>
    import { ref,reactive, onMounted } from 'vue'
    import { useRoute } from 'vue-router'
    import { Trash, Check } from "@vicons/fa"

    import { categories } from "@S/Common"
    import FileImportor from "@CC/file.import.vue"

    const route = useRoute()
    const aid = route.params.id

    let blockLoaded = ref(false)
    let blocks      = ref([])
    let block       = reactive({show:false, bean:{}, isNew:false})
    let importor    = ref()

    const loadBlock = ()=> H.data.listBlock(aid).then(d=>{
        blocks.value = d.data
        blockLoaded.value = true
    })
    const onTabChange = tab=>{
        if(tab == 'block' && !blockLoaded.value){
            loadBlock()
        }
    }
    const editBlock = (row={uuid:"", text:""})=>{
        block.bean = row
        block.isNew = !row.uuid
        block.show = true
    }
    const saveBlock = ()=>{
        let {uuid, text} = block.bean
        if(!text.trim())    return M.warn(`内容不能为空`)

        H.data.setBlock(aid, uuid, text).then(d=>{
            M.ok(`数据块⌈${uuid}⌋已更新`)
            block.show = false

            if(block.isNew) blocks.value.unshift({uuid, text})
        })
    }
    const delBlock = (uuid, index)=> H.data.setBlock(aid, uuid).then(d=> {
        blocks.value.splice(index, 1)
        M.ok(`数据块⌈${uuid}⌋已删除`)
    })

    const onData = d=>{
        importor.value.close()
        block.bean.text = d

        M.ok(`数据已导入`)
    }

    onMounted(() => {
        loadBlock()
    })
</script>
