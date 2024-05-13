import { defineConfig } from 'vitepress'
import { withMermaid } from "vitepress-plugin-mermaid"

const isProd = process.env.npm_lifecycle_event==='build'

// https://vitepress.dev/reference/site-config
export default withMermaid(
    defineConfig({
        title: "APP-META",
        description: "应用元宇宙",
        themeConfig: {
            // https://vitepress.dev/reference/default-theme-config
            nav: [
                { text: 'Home', link: '/' },
                { text: 'Examples', link: '/markdown-examples' }
            ],

            sidebar: [
                {
                    text: '使用说明',
                    items: [
                        { text: '关于 / About', link: '/guide/about' },
                    ]
                },
                {
                    text: '快应用',
                    items: [
                        { text: '数据表格 / Table', link: '/guide/fast/table' },
                    ]
                }
            ],

            socialLinks: [
                { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
            ],
            footer: {
                message: '基于<a href="https://github.com/0604hx/app-meta/LICENSE"> MIT</a> 许可发布',
                copyright: '版权所有 © 2023-至今 <a href="https://github.com/0604hx">0604hx/集成显卡</a>'
            },
        },
        vite:{
            server: {
                port: 3003
            },
            ssr: {
                /**
                 * Named export 'dateZhCN' not found. The requested module 'naive-ui' is a CommonJS module
                 *
                 * https://github.com/tusen-ai/naive-ui/issues/4641
                 */
                noExternal: ['naive-ui']
            },
            build:{
                chunkSizeWarningLimit: 2000
            }
        },
        mermaid: {
            // refer https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults for options
            flowchart: {

            }
        }
    })
)
