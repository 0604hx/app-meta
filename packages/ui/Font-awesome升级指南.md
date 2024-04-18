# FONT-AWESOME 图标库升级指南
> 此处以升级到`6.2.0`为例说明

## 楔子

由于平台支持 SFC，故增加`font-awesome`图标库方便全局使用。

## 下载最新版本

前往[官网](https://fontawesome.com/download)下载最新的压缩包（选择`Free For Web`即可）

## 更新文件

1. 将压缩包解压，挑选指定文件复制到`public/static`目录
2. 更新 `public/index.html` 内对于图标库的引用

```text
# 目录结构
public
    static\
        font-awesome\
            css\     
                brands.min.css            
                fontawesome.min.css       
                regular.min.css           
                solid.min.css                        
            webfonts\              
                fa-brands-400.woff2  
                fa-regular-400.woff2 
                fa-solid-900.woff2   
```

## 图标如何使用

```html
<span class="fab fa-vuejs" />
<i class="fas fa-user" />
```
