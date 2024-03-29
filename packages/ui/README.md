# APP 元宇宙/UI

## 二次开发

### 问题集锦

* 热更新无效（HMR）
> 需要重载页面方可看到修改的效果

原因未明，此时两个解决方法

1. 删除根目录的 node_modules，重新进行`pnpm i`
2. 删除配置项`config.cache`（见 vue.config.js 文件）

## 附录

### 工具库

名称|说明
-|-
[pako](http://nodeca.github.io/pako)|文本压缩、还原工具
[mustache](https://github.com/janl/mustache.js)|JS 模板引擎
[mammoth](https://github.com/mwilliamson/mammoth.js)|转换 docx 文件到 html
[html-to-docx](https://github.com/privateOmega/html-to-docx)|将 html 转换为 word
[html2pdf.js](https://github.com/eKoopmans/html2pdf.js)|将 html 元素转换为 PDF（canvas 方式）

### 打包后体积

日期|原始大小|压缩大小|说明
-|-|-|-
2023-03-10|4.44M|`7z`1014KB|
2023-03-22|4.56M|`7z`1053KB|增加 `lodash`、`pako` 库
2023-04-12|6.1M|`7z`1350KB|增加`echarts`
2023-04-13|6.28MB|`7z`1378KB|增加`docx-preview`库
2023-05-09|6.8MB|2304KB|增加`font-awesome`图标库
2023-05-12|7.65MB|2630KB|增加`dompurify`、`html2pdf.js`库
2023-06-02|9.10MB|3003KB|增加`vue3-sfc-loader`库
2023-08-08|12.3MB|4004KB|增加`mermaid`库（渲染 uml）
2024-03-26|9.12MB|3206KB|打包工具更换为`vite5`
2024-03-29|9.57MB|3353KB|增加`vant4`（SFC组件）
2024-03-29|10.2MB|3552KB|增加`varlet`（SFC组件）
