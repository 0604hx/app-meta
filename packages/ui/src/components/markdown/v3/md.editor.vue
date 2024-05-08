<template>
    <MdEditor v-model="shadow" :theme="dark?'dark':'light'" :previewTheme :mdHeadingId
        :style="{ height }" :toolbars @onUploadImg="uploadImg" >
        <template #defToolbars>
            <Emoji />
        </template>
    </MdEditor>
</template>

<script setup>
    import { ref } from 'vue'

    import { MdEditor } from 'md-editor-v3'
    import { Emoji } from '@vavt/v3-extension'

    import '@vavt/v3-extension/lib/asset/style.css'
    import 'md-editor-v3/lib/style.css'

    import { mdHeadingId, previewTheme, showCodeRowNumber, toolbars } from "."
    import { ViewerProps } from '../'

    const props = defineProps(ViewerProps)

    const shadow = ref(props.code)

    let getMarkdown = ()=> shadow.value
    let getHtml     = ()=> ""

    const uploadImg = async (files, callback)=>{
        console.debug(files)
        // UPLOAD("/attachment/upload-image", {file}, d=>{
        //     console.debug("文件上传成功", d)
        //     callback(window.SERVER+"/"+d.data.replace("\\","/"), file.name);
        // })
        const urls = await Promise.all(
            files.map(file => new Promise((rev, rej) => {
                UPLOAD("/attachment/upload-image", {file}, d=>{
                    console.debug("文件上传成功", d)
                    rev(window.SERVER+"/"+d.data.replace("\\","/"))
                })
            }))
        )
        callback(urls)
    }

    defineExpose({ getMarkdown , getHtml })
</script>
