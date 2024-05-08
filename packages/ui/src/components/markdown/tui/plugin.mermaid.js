/**
 * 集成 mermaid
 *
 * 参考 https://github.com/nhn/tui.editor/issues/2838
 */
import mermaid from 'mermaid'

// export default ()=>({
//     // in customHtmlRenderer
//     toHTMLRenderers :{
//         mermaid(node) {
//             console.debug("-------------------------------")
//             let html = "";
//             mermaid.mermaidAPI.render("mermaid", node.literal, (h) => {
//                 html = h;
//             })
//             return [
//                 { type: 'openTag', tagName: 'div', outerNewLine: true, classNames: ["mermaid-block"] },
//                 { type: 'html', content: html },
//                 { type: 'closeTag', tagName: 'div', outerNewLine: true }
//             ];
//         },
//     }
// })

export default ()=>({
    toHTMLRenderers  : {
        // Demo https://mermaid.live/edit
        mermaid(node) {
            // se possivel usar esse timer do typescript
            // https://github.com/nhn/tui.editor/blob/master/plugins/chart/src/index.ts#L332

            // TODO: existe uma chance desse metodo ser chamado mais de uma vez (para cada diagrama).
            // setTimeout(() => mermaid.init(), 100);
            import("mermaid").then(m=> m.default.init())

            return [
                { type: 'openTag', tagName: 'pre', outerNewLine: true, attributes: { 'class': "mermaid" } },
                { type: 'html', content: node.literal },
                { type: 'closeTag', tagName: 'pre', outerNewLine: true }
            ];
        }
    }
})
