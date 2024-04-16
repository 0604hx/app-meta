<template>
    <n-data-table class="mt-2" :columns="columns" size="small" :remote="true" :loading="loading" striped :data="beans" :style="{height}" flex-height>
    </n-data-table>
</template>

<script setup>
    import { ref, onMounted, h } from 'vue'
    import { NPopconfirm } from 'naive-ui'
    import { Trash } from '@vicons/fa'

    const props = defineProps({aid:String, pid:[String, Number]})

    let loading = ref(false)
    let beans   = ref([])
    let height = "calc(100vh - 130px)"
    let columns = [
        { title:"#", width:60, render:(row, i)=> i+1},
        { title:"批次号", width:180, key:"batch" },
        { title:"导入者", width:120, key:"uid" },
        { title:"来源/文件名", key:"origin" },
        { title:"数据量", width:150, key:"size" },
        {
            width:50, align:"center", title:"操作",
            render(row, rowIndex) {
                return [
                    h(
                        NPopconfirm,
                        {
                            onPositiveClick:()=> remove(row),
                            "positive-button-props": {type:"error"}
                        },
                        {
                            default: ()=>`删除批次⌈${row.batch}⌋下的全部数据吗？`,
                            trigger: ()=>UI.iconBtn(Trash, null, {type:"error", disabled: !row.active})
                        }
                    )
                ]
            }
        }
    ]
    const refresh = ()=>{
        RESULT("/page/batch-list", {aid: props.aid, pid: props.pid}, d=>beans.value = d.data, {loading})
    }
    const remove = row=> RESULT("/page/batch-clear", {id: row.id}, d=> {
        M.notice.ok(`删除批次下 ${d.data} 条数据`)
        row.active = false
    })

    onMounted( refresh )
</script>
