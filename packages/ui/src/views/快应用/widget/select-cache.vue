<template>
    <n-alert type="info" :show-icon="false">
        共有 {{items.length}} 则本地缓存（点击可复制内容）
    </n-alert>
    <n-table striped size="small" :bordered="false" class="mt-2">
        <thead>
            <tr>
                <th width="180px">缓存日期</th>
                <th>内容预览</th>
                <th width="150px">哈希（MD5）</th>
                <th width="80px">
                    <n-popconfirm @positive-click="clean(-1)">
                        <template #trigger>
                            <n-button type="error" secondary>清空</n-button>
                        </template>
                        确认删除此页面的全部本地缓存吗？
                    </n-popconfirm>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in items">
                <td>{{item.date}}</td>
                <td class="cursor-pointer" @click="toCopy(item.value)"><n-ellipsis :tooltip="false" :line-clamp="1">{{item.value}}</n-ellipsis></td>
                <td>{{item.hash}}</td>
                <td><n-button @click="use(item)" size="small" tertiary>使用</n-button></td>
            </tr>
        </tbody>
    </n-table>
</template>

<script setup>
    import { ref, onMounted } from 'vue'

    import { listCache, deleteCache } from ".."

    const props = defineProps({
        pid:{ type:[Number, String], default:""},
        onSelect: {type:Function}
    })

    let items = ref([])

    const use = row=> M.confirm(`数据恢复`, `使用${row.date}的数据还原到编辑区吗？`, ()=>{
        E.emit('editor.cache.read', row.value)

        props.onSelect()
    })

    const toCopy = text=> {
        H.copyTo(text)
        M.ok(`数据已复制到粘贴板`)
    }

    const clean = idx=> deleteCache(props.pid, idx).then(count=> {
        if(count){
            items.value.length = 0
            M.info(`本地缓存已清空`)
        }
    })

    onMounted(() => listCache(props.pid).then(list=> items.value = list))
</script>
