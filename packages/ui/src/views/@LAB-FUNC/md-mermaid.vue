<template>
    <MDEditor ref="editor" height="600px" :code="code" />
</template>

<script setup>
    import MDRender from "@md.viewer"
    import MDEditor from "@md.editor"

    const code = `# Markdown 插件
> 此页面演示 markdown 插件功能

$$mermaid
flowchart LR;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
$$

$$mermaid
%%{init: {'theme':'forest'}}%%
sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-)John: See you later!
$$
    `
</script>
