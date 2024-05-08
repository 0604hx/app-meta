import { join } from 'path'

import { defineConfig, createLogger } from 'vite'
import vue from '@vitejs/plugin-vue'
import ViteCompress from 'vite-plugin-compression2'

const isProduction = process.env.NODE_ENV === 'production'

const MARKDOWN = 'v3'

const resolve = dir=>join(__dirname, dir)
const pkg = require("./package.json")

const BACKEND_CONTEXT   = "/app-meta"      //后端服务地址前缀
const BACKEND_HOST      =  "http://localhost:10086"

const VERSION = (()=>{
    let now = new Date
    return `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`
})()

const customLogger = (()=>{
    const logger = createLogger()
    logger.warn = (msg, options) => {}
    return logger
})()

// https://vitejs.dev/config/
export default defineConfig({
    base: isProduction? `${BACKEND_CONTEXT}/`: "/",
    server:{
        port: 3000,
        host: "localhost",
        proxy: { [BACKEND_CONTEXT]: BACKEND_HOST }
    },
    resolve:{
        extensions: ['.js', '.vue', '.json', ".css"],
        alias:{
            '@P'            : resolve('public'),
            '@'             : resolve('src'),                               //代码目录
            '@M'            : resolve("src/components/macro"),              //宏组件
            '@C'            : resolve("src/components"),                    //常用组件
            '@CN'           : resolve("src/components/naive-ui"),           //常用组件（适配 NaiveUI）
            '@CC'           : resolve("src/components/common"),             //常用组件（通用）
            '@CM'           : resolve("src/components/mixin"),              //mixin 组件
            '@Pagination'   : resolve("src/components/mixin/Pagination"),
            '@V'            : resolve("src/views"),                         //视图目录
            '@VW'           : resolve("src/views/widget"),
            '@Store'        : resolve("src/store"),
            '@S'            : resolve("src/service"),                       //接口相关
            '@T'            : resolve("src/theme"),                         //主题相关
            '@U'            : resolve("src/util"),                          //通用工具
            '@F'            : resolve("src/views/快应用"),
            '@md.viewer'    : resolve(`src/components/markdown/${MARKDOWN}/md.viewer.vue`),
            '@md.editor'    : resolve(`src/components/markdown/${MARKDOWN}/md.editor.vue`),
        }
    },
    define:{
        //关闭 vue3 的警告信息
        "__VUE_OPTIONS_API__": true,
        "__VUE_PROD_DEVTOOLS__": false,
        "__VUE_PROD_HYDRATION_MISMATCH_DETAILS__": false,
        "process.env.VUE_APP_CONTEXT": JSON.stringify(BACKEND_CONTEXT),
        "_MARKDOWN_LIB_": JSON.stringify(MARKDOWN),
        "_APPNAME_": JSON.stringify(pkg.appName),
        "_VERSION_": JSON.stringify(isProduction? VERSION : process.env.NODE_ENV),
        "_CONTEXT_": JSON.stringify(process.env.VUE_APP_CONTEXT||""),
        "_APP_INFO_": JSON.stringify({ dependencies: pkg.dependencies, devDependencies: pkg.devDependencies })
    },
    build:{
        assetsDir:"static/assets",
        chunkSizeWarningLimit: 5000,
        reportCompressedSize: false,
        rollupOptions:{
            output:{
                assetFileNames: "static/assets/[hash][extname]",
                chunkFileNames: "static/js/[hash].js",
                entryFileNames: "static/js/[name].[hash].js"
            }
        }
    },
    customLogger,
    plugins: [
        vue(),
        // ViteCompress({
        //     algorithm: 'gzip',
        //     deleteOriginalAssets: true,
        //     exclude:[/\.(png|gz|html|svg)$/],
        //     threshold: 1024 * 1024
        // }),
        // 修改 html 的标题
        {
            name:"repair-html-title",
            transformIndexHtml: (/**@type {String} */ html)=> html.replace("<%= title %>", pkg.appName)
        }
    ]
})
