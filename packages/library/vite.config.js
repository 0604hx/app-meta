import { defineConfig } from 'vite'

const VERSION = (()=>{
    let now = new Date
    return `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`
})()

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: '../ui/public',
        lib:{
            entry: './index.js',
            name: 'H',
            formats: ['umd'],
            fileName: ()=> `meta-helper.js`
        }
    },
    define:{
        "_VERSION_": JSON.stringify(VERSION),
    },
    // 解决产物编码问题
    esbuild:{
        charset:'ascii'
    }
})
