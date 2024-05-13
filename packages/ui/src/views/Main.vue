<template>
    <n-layout position="absolute">
        <n-layout-header :inverted="inverted" :style="{height: headerHeight}" class="px-4" bordered>
            <app-navigation v-if="inited" :inverted="inverted" :menus="menus" :otherMenus="otherMenus" :otherMenuClick="otherMenuClick" title-width="280px">
                <div :class="{white: inverted }">
                    <Back :color="inverted?'white':'black'" />
                    {{appName}}
                </div>

                <template #extra-left>
                    <SearchBar />
                </template>
            </app-navigation>
        </n-layout-header>
        <!--如需头部，设置 style top: 50px;-->
        <n-layout position="absolute" :style="{bottom:'36px', top: headerHeight}" class="layout" :content-style="{padding: padding+'px',height:'100%'}" :native-scrollbar="false">
            <router-view />
        </n-layout>
        <n-layout-footer position="absolute" style="height: 36px; padding:6px; text-align: center;" bordered>
            <component :is='footer' />
        </n-layout-footer>
    </n-layout>
</template>

<script setup>
    import { ref, h, watch, computed, onMounted, nextTick } from 'vue'
    import { RouterLink, useRouter } from "vue-router"
    import {
        Home, Cog, Cogs, Wrench, Database, ShieldAlt, Parking,GlobeAsia, Icons, ChartPie, UserShield, AppStore, InfoCircle, Html5, Bullhorn,
        Star, Users, Sitemap, TachometerAlt, Server, IdCard ,Code, UserCircle, Edit, Download, Link
    } from "@vicons/fa"

    import Banner from "@CC/Banner.vue"
    import AppNavigation from "@C/Navigation.vue"
    import Back from "@CC/Back.vue"
    import SearchBar from "./widget/search.vue"

    import LocalDev from "./widget/dev.local.vue"
    import ServiceMapping from "./widget/dev.service-mapping.vue"

    import { hasAnyRole, isAdminOr } from "@S/Auth"

    import { useUISetting } from "@/store/uiSetting"
    const uiSetting = useUISetting()

    const router = useRouter()

    const headerHeight = "40px"
    const inverted = computed(()=> uiSetting.darkNav)      //反转头部导航
    const inited = ref(false)

    const menuItem = (routeName, text, icon)=> ({
        label: () => h(RouterLink, { to: { name: routeName } }, ()=>text),
        key: routeName,
        icon: UI.buildIcon2(icon)
    })

    let appName = Config.name || _APPNAME_
    let menus = []
    let otherMenus = []
    let padding = ref(12)
    let footer = h(Banner, {text: Config.footer||undefined})

    const buildMenus = ()=>{
        let items = [
            menuItem("home", "首页", Home),
            menuItem("app-mine", "我的应用", AppStore)
        ]
        if(isAdminOr("DBM", "DBM_ADMIN")){
            items.push(menuItem("dbm-source", "数据源维护", Database))
        }
        // if(isAdminOr("API_ADMIN")){
        //     items.push(menuItem("api", "开放接口", Code))
        // }

        if(window.User && User.isAdmin){
            items.push({
                label:"管理员功能", key:"admin-menu", icon:UI.buildIcon2(ShieldAlt),
                children:[
                    menuItem("sys-dashboard", "数据总览", TachometerAlt),
                    {
                        label:"应用/页面维护", key:"app-manage", icon: UI.buildIcon2(AppStore),
                        children:[
                            menuItem("app-home", "应用管理", AppStore),
                            menuItem("sys-page-link", "页面关注维护", Star),
                            menuItem("sys-terminal", "后端服务/SERVER", Server),
                        ]
                    },
                    {
                        label:"组织及权限", key:"account", icon: UI.buildIcon2(Sitemap),
                        children:[
                            menuItem("sys-account", "用户管理", Users),
                        ]
                    },
                    {
                        label:"系统维护", key:"system", icon: UI.buildIcon2(Cog),
                        children:[
                            menuItem("sys-ui", "资源更新", Html5),
                            menuItem("sys-member", "授权会员终端", IdCard),
                            menuItem("sys-notice", "公告维护", Bullhorn),
                            menuItem("sys-setting", "系统设置", Wrench),
                        ]
                    }
                ]
            })
        }
        items.push(menuItem("o-about","关于", InfoCircle))
        return items
    }

    const buildOtherMens = ()=>{
        let items = [
            // 也可以设置子菜单
            // {
            //     label: '个人中心', key:"mine", icon:UI.buildIcon2(UserCircle),
            //     children:[
            //         { label: '我的关注', key:"mine-link", icon:UI.buildIcon2(Star) }
            //     ]
            // },
            { label: '我的应用', key:"app-mine", icon: UI.buildIcon2(AppStore) },
            { label: '我的关注', key:"mine-link", icon: UI.buildIcon2(Star) },
            { label: '我维护的功能页', key:"mine-edit", icon: UI.buildIcon2(Edit) },
        ]
        if(isAdminOr("DEVELOPER")){
            items.push({ type:"divider"})
            items.push({ label:"访问本地前端项目", key:"dev-h5", icon: UI.buildIcon2(Html5) })
            items.push({ label:"配置 SERVICE 映射", key:"dev-mapping", icon: UI.buildIcon2(Link)})
        }

        items.push({ type:"divider"})
        items.push({ label:"自助配置首页内容", key:"home-custom", icon: UI.buildIcon2(Cog) })
        items.push({ label:"下载客户端程序", key:"download-client", icon: UI.buildIcon2(Download) })
        items.push({ type:"divider"})
        return items
    }

    const otherMenuHandlers = {
        'dev-h5'            : ()=> M.dialog({title:`访问本地前端项目`, showIcon:false, content:()=> h(LocalDev), style:{width:"640px"}}),
        'dev-mapping'       : ()=> M.dialog({title:`配置 SERVICE 映射`, showIcon:false, content:()=> h(ServiceMapping), style:{width:"820px"}}),
        'home-custom'       : ()=> H.openUrl(router.resolve({name:`home-custom`}).href, { center: true }),
        'download-client'   : ()=> M.confirm(
            `下载平台客户端程序包`,
            UI.html(`客户端<b class='primary'>（原生环境）</b>支持执行 <b class='primary'>RPA机器人</b>，在交互上提供更好的用户体验，程序包解压后即可使用<br><br>确定下载吗？`),
            ()=> {
                let url = "/attach/client/meta-client.7z"
                if(window.isClient)
                    API("download-client", url)
                else
                    H.openUrl(`${window.SERVER}${url}`, {type:""})
            }
        )
    }

    const otherMenuClick = name=> {
        let handler = otherMenuHandlers[name]
        if(handler)
            handler()
        else
            E.emit('jumpTo', { name })
    }

    E.on("main.padding", (v=12)=> padding.value=v)

    onMounted(() => nextTick(()=>{
        menus = buildMenus()
        otherMenus = buildOtherMens()

        inited.value = true
    }))
</script>
