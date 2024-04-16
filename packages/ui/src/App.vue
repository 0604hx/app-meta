<template>
    <n-config-provider :theme="theme" :locale="locale" :date-locale="dateLocale" :theme-overrides="customVars" :hljs="hljs">
        <AppProvider>
            <div :class="{ 'default-background': theme != darkTheme }">
                <!--
                    为了更好地简化代码
                    在项目中会用到 setup 顶层 await，此时需要配合异步组件 Suspense
                    详见 https://vuejs.org/guide/built-ins/suspense.html

                    否则会报错 setup function returned a promise, but no <Suspense> boundary

                    使用 Suspense 组件后，console 会显示：
                        <Suspense> is an experimental feature and its API will likely change.
                -->
                <!-- <Suspense>
                    <router-view></router-view>
                    <template #fallback>
                        <div class="text-center">
                            <n-spin size="large">
                                <template #description>组件初始化中...</template>
                            </n-spin>
                        </div>
                    </template>
                </Suspense> -->
                <router-view v-if="routerEnable"></router-view>
            </div>

            <n-watermark v-if="watermark" :content="water.text" cross fullscreen :font-color="water.color"
                :font-size="water.fontSize" :line-height="16" :width="water.width" :height="384" :x-offset="60" :y-offset="90" :rotate="water.rotate" />
        </AppProvider>
    </n-config-provider>
</template>

<script setup>
    import { ref, computed, onMounted, nextTick } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    import { darkTheme, useOsTheme, zhCN, dateZhCN } from 'naive-ui'

    import hljs from 'highlight.js/lib/core'
    import javascript from 'highlight.js/lib/languages/javascript'

    import AppNavigation from '@C/Navigation.vue'
    import AppProvider from "@CN/Application.vue"

    import { getPrimaryColor } from "@/theme/colors"

    import { useUISetting } from "@/store/uiSetting"
    const uiSetting = useUISetting()

    const router = useRouter()
    const route = useRoute()

    let osTheme     = useOsTheme()
    let locale      = computed(()=> zhCN)
    let dateLocale  = computed(()=> dateZhCN)
    let theme       = computed(()=> {
        let _theme = uiSetting.theme == 'dark'? darkTheme: uiSetting.theme == 'auto'? (osTheme.value === 'dark'? darkTheme: null): null
        window.DARK = _theme == darkTheme
        return _theme
    })

    let routerEnable = ref(true)

    let watermark       = ref(false)
    let water = { text:"", fontSize:16, rotate:-15, color:"rgba(128, 128, 128, .15)" }

    /**
     * @type import('naive-ui').GlobalThemeOverrides
     */
    let customVars  = {
        common: getPrimaryColor(uiSetting.color)
    }
    window.color = customVars.common?.primaryColor

    let jumpTo = (pathOrObj)=> {
        let newRoute = typeof(pathOrObj)==='object'?pathOrObj:{name:pathOrObj}
        if(newRoute.name === "login"){
            if(!newRoute.query)    newRoute.query = {}
            newRoute.query['from'] = route.fullPath
        }
        router.push(newRoute)
    }

    /**
     * 手动刷新 vue-router
     * 不会出现页面空白,地址栏会不会出现快速切换的过程,用户体验好
     */
    const refreshRouter = ()=>{
        routerEnable.value = false
        nextTick(()=> routerEnable.value = true)
    }

    /**
     * 设置用户信息
     *
     * @params {Object} user
     * @params {Function} 回调函数
     */
    const setupUser = (user, onDone)=>{
        let account = { ...user, isAdmin: Array.isArray(user.roles) && user.roles.includes("ADMIN") }
        //锁定用户对象，不支持修改
        Object.keys(account).forEach(k => {
            Object.defineProperty(account, k, { value: account[k], writable: false, enumerable: true, configurable: true })
        })
        window.User = account

        const isPure = location.hash.startsWith("#/app-pure/")
        if(Config.watermark != 'false' && !isPure){
            let r           = Math.random()
            water.text      = H.io.render(Config.watermark_text||`{{id}}（{{date}}）`, {id:user.id, name:user.name, date: H.date.date(), ip: user.ip})
            water.width     = Math.floor(Config.watermark_width||"380")
            water.color     = Config.watermark_color
            water.fontSize  = r*10 + 16
            water.rotate    = r > 0.5? -15 : r > 0.3? 15:30
            watermark.value = true
        }

        onDone && onDone()
    }

    onMounted(() => {
        //如需使用请通过 'npm i -S highlight.js' 安装组件
        hljs.registerLanguage('javascript', javascript)

        E.on('jumpTo', jumpTo)
        E.on('user-loaded', user=>{
            if(user && user.id)
                setupUser(user)
            else
                RESULT("/whoami", {}, d=> setupUser(d.data, null)) //()=> setTimeout(refreshRouter, 1000)
        })

        //刷新路由
        E.on('reload-router', refreshRouter)
    })
</script>
