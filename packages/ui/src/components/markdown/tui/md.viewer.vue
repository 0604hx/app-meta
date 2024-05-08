<!--Markdown展示组件-->
<template>
    <div ref="viewer" :class="dark?'toastui-editor-dark':''"></div>
</template>

<script setup>
    import { ref,onMounted, computed, watch } from 'vue'

    import dompurify from 'dompurify'
    import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
    // 暗黑模式文字颜色 rgba(255, 255, 255, 0.82)
    import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'
    import '@toast-ui/editor/dist/toastui-editor-viewer.css'

    import { pluginsForViewer } from "./md.plugin"

    import { ViewerProps } from '../'

    const props = defineProps(ViewerProps)

    let mdViewer
    let viewer = ref(null)

    watch(()=>props.code, ()=> mdViewer && mdViewer.setMarkdown(props.code))

    onMounted(() => {
        mdViewer = new Viewer({
            el: viewer.value,
            height: props.height,
            initialValue: props.code,
            /**
             * 定义 customHTMLSanitizer，将 onclick 标签加入到白名单中
             * 代码源自 https://github.com/nhn/tui.editor/blob/master/apps/editor/src/sanitizer/htmlSanitizer.ts#L13
             */
            customHTMLSanitizer : html=> dompurify.sanitize(html, {
                ADD_ATTR: ['rel', 'target', 'hreflang', 'type', 'onclick'],
                FORBID_TAGS: [
                    'input',
                    'script',
                    'textarea',
                    'form',
                    'button',
                    'select',
                    'meta',
                    'style',
                    'link',
                    'title',
                    'object',
                    'base',
                ]
            }),
            plugins: pluginsForViewer
        })
    })
</script>

<style>
    /* 自定义样式 */
    .toastui-editor-contents {
        font-size: 14px !important;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" !important;
    }
</style>
