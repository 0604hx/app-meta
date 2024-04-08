<template>
    <n-card>
        <template #header>
            <QuestionCircle class="icon" />
            应用/页面无法正常访问的原因
        </template>

        <n-tag size="small" :bordered="false" type="primary">页面</n-tag> 是应用向您提供服务的主要路径，由 <b>管理员</b> 或者 <b>应用维护人员</b> 创建并发布。
        若您无法正常访问，请按以下原因进行排查：

        <n-table :bordered="false" class="mt-3" size="small">
            <thead>
                <tr><th width="100">情况</th><th>说明</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td> <n-tag type="primary">不存在</n-tag> </td>
                    <td>您正尝试访问一个不存在的 <b>页面</b>，可能该页面并 <b>未被创建</b> 或 <b>已被删除</b>（曾经能正常访问，现在提示不存在）</td>
                </tr>
                <tr>
                    <td><n-tag type="primary">不可见</n-tag></td>
                    <td>您访问的页面已被创建，但未设置为 <b>可见</b> 状态，请联系管理员操作后重试</td>
                </tr>
                <tr>
                    <td><n-tag type="primary">未授权</n-tag></td>
                    <td>您访问的页面已被创建且为 <b>可见</b> 状态，但您未被授权访问，请联系管理员 <b>分配权限</b> 后重试</td>
                </tr>
            </tbody>
        </n-table>
    </n-card>
</template>

<script setup>
    import { QuestionCircle } from '@vicons/fa'
</script>
