<template>
    <n-layout position="absolute">
        <n-layout position="absolute" style="top: 0px;bottom:36px;" class="layout"  :content-style="{padding: padding+'px'}" :native-scrollbar="false">
            <router-view />

            <BottomMenu />
        </n-layout>
        <n-layout-footer position="absolute" style="height: 36px; padding:6px; text-align: center;" bordered>
            <component :is="footer" />
        </n-layout-footer>
    </n-layout>
</template>

<script setup>
    import { ref,h } from 'vue'
    import { useRoute } from 'vue-router'

    import Banner from "@CC/Banner.vue"

    import BottomMenu from "./widget/bottom-menu-editor.vue"

    import { saveCache } from "."

    const { aid, id } = useRoute().params

    let footer = h(Banner, {text: Config.footer||undefined})

    let padding = ref(12)
    E.on("main.padding", (v=12)=> padding.value=v)

    E.on("editor.cache", ({data, limit=10})=> saveCache(id, data, limit))
</script>
