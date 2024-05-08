<template>
    <div>
        <n-card v-if="items.length" size="small" title="文档/附件">
            <template #header-extra><n-text depth="3">支持在线预览图片、PDF、WORD等附件</n-text></template>
            <n-table :bordered="false" size="small" :bottom-bordered="false">
                <thead>
                    <tr>
                        <th>文件名</th>
                        <th width="70">文件大小</th>
                        <th width="180">备注</th>
                        <th width="80">上传者</th>
                        <th width="50">下载</th>
                        <th width="40" class="text-center"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item,index) in items">
                        <td>
                            <a @click="toPreview(item)" class="cursor-pointer">
                                <n-ellipsis><n-tag :bordered="false" size="small" class="mr-2">{{item.ext}}</n-tag>{{item.filename}}</n-ellipsis>
                            </a>
                        </td>
                        <td>{{filesize(item.size)}}</td>
                        <td><n-ellipsis style="max-width: 150px">{{item.summary}}</n-ellipsis></td>
                        <td>{{item.uid}}</td>
                        <td>{{item.download}}</td>
                        <td>
                            <n-button secondary size="tiny" @click="toDownload(item)" circle><template #icon><n-icon :component="Download" /></template></n-button>
                        </td>
                    </tr>
                </tbody>
            </n-table>
        </n-card>
        <n-card v-else-if="!hideOnEmpty" size="small" title="文档/附件">
            <n-text depth="3">暂无附件</n-text>
        </n-card>

        <Previewer ref="viewer" tip />
        <!-- <n-drawer v-model:show="preview.show" default-width="60%" :close-on-esc="false" :mask-closable="false" resizable>
            <n-drawer-content :title="preview.title" :native-scrollbar="false" closable :body-content-style="{padding:'0px'}">
                <template #header>
                    <n-tag type="primary" :bordered="false">文档预览</n-tag> {{preview.title}}
                </template>
                <Previewer ref="viewer" />
            </n-drawer-content>
        </n-drawer> -->
    </div>
</template>
<script setup>
    import { ref,onMounted, reactive, nextTick } from 'vue'
    import { Download } from '@vicons/fa'

    import Previewer from "@CC/preview.vue"

    const props = defineProps({
        pid: {type:[Number,String], default:""},
        hideOnEmpty: {type:Boolean, default:true}
    })

    let items = ref([])

    let viewer = ref()

    const filesize = r=> H.filesize(r)
    const refresh = id => id && RESULT("/page/document-list", {id}, d=> items.value = d.data)
    const toDownload = row=> DOWNLOAD("/page/document-download", {id: row.id, pid:row.pid})
    const toPreview = row=> viewer.value.open(row)

    onMounted(()=> refresh(props.pid) )
    defineExpose({ refresh })
</script>
