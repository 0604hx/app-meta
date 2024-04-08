<!--
    代码编辑器
    更多配置请参考 https://github.com/surmon-china/vue-codemirror
-->
<template>
    <Codemirror
        v-model="code"
        :indentWithTab="false"
        :placeholder="placeholder"
        :style="{ height }"
        :autofocus="autofocus"
        :indent-with-tab="true"
        :tab-size="tabSize"
        :disabled="readOnly"
        :extensions="extensions"
        @change="v=>emits('update:value', v)"
    />
</template>

<script setup>
    import { ref,onMounted, watch } from 'vue'

    import { keymap} from "@codemirror/view"
    import { Prec, EditorState } from "@codemirror/state";
    import { Codemirror } from 'vue-codemirror'
    import { javascript } from '@codemirror/lang-javascript'
    import { html } from '@codemirror/lang-html'
    import { sql } from '@codemirror/lang-sql'
    import { vue } from '@codemirror/lang-vue'
    import { oneDark } from '@codemirror/theme-one-dark'

    const emits = defineEmits(['update:value'])
    const props = defineProps({
        value:{type:String, default:""},
        readOnly:{type:Boolean, default:false},
        autofocus: {type:Boolean, default:false},
        tabSize:{type:Number, default:4},
        height: {type:String, default:"300px"},
        placeholder:{type:String, default:"请输入代码"},
        language:{type:String, default:"js"},
        keyBinds:{type:Array, default:[]}
    })

    const extensions = []

    if(props.language == 'html')        extensions.push(html())
    else if(props.language == 'sql')    extensions.push(sql())
    else if(props.language == 'vue')    extensions.push(vue())
    else                                extensions.push(javascript())

    if(window.DARD === true)            extensions.push(oneDark)
    /**
     * 注册自定义按键
     * https://github.com/surmon-china/vue-codemirror/issues/150
     *
     * 传递 {key，handler}，如果 handler 为空则默认屏蔽该快捷键
     */
    if(props.keyBinds.length>0){
        props.keyBinds.forEach(({key, handler })=> {
            extensions.push(
                Prec.high(
                    keymap.of([{key, run: handler?? (()=>true) }])
                )
            )
            if(window.Config?.isDev===true) console.debug(`[CODE-MIRROR] 注册快捷键 ${key}：${handler==null?"未传递处理函数（即屏蔽默认行为）":"自定义处理函数"}`)
        })
    }
    extensions.push(Prec.high(keymap.of([{key:'Ctrl-Y', run:'deleteLine'}])))

    let code = ref(props.value)

    watch(()=>props.value, ()=> code.value=props.value)

    onMounted(() => {
    })
</script>
