<template>
    <div ref="editor" class="w-full" :class="dark?'toastui-editor-dark':''"></div>
</template>

<script setup>
    import { ref,onMounted, computed, watch } from 'vue'

    import Editor from '@toast-ui/editor'
    // 暗黑模式文字颜色 rgba(255, 255, 255, 0.82)
    import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'
    import '@toast-ui/editor/dist/toastui-editor.css'

    import '@toast-ui/editor/dist/i18n/zh-cn'

    import { plugins } from "./md.plugin"

    import { ViewerProps } from '../'

    const props = defineProps(ViewerProps)

    let editor = ref(null)
    let editorNode = null

    let getMarkdown = ()=> editorNode.getMarkdown()
    let getHtml     = ()=> editorNode.getHtml()

    watch(()=>props.code, ()=> editorNode && editorNode.setMarkdown(props.code))

    onMounted(() => {
        editorNode = new Editor({
            el: editor.value,
            height: props.height,
            initialValue: props.code,
            previewStyle: 'vertical',
            plugins,
            language: "zh-CN",
            placeholder: '请输入内容 ^.^',
            hooks: {
                /**
                 * 示例代码
                 *
                    const formData = new FormData()
                    formData.append('file', imgeBlob)
                    uploadApi.uploadOssFileCms(formData).then(res => {
                        callback(res.result, '')
                    }).catch(error => {
                        console.log(error)
                    })
                 */
                addImageBlobHook (file, callback) {
                    UPLOAD("/attachment/upload-image", {file}, d=>{
                        console.debug("文件上传成功", d)
                        callback(window.SERVER+"/"+d.data.replace("\\","/"), file.name);
                    })
                },
            }
        })
    })

    defineExpose({ getMarkdown , getHtml })
</script>

<style>
    /*修复颜色选择插件样式*/
    .tui-colorpicker-clearfix .tui-colorpicker-palette-hex {
        width: 100% !important;
        height: 32px !important;
    }
</style>
