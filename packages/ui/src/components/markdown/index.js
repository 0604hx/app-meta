export const ViewerProps = {
    code:{type:String},
    dark:{type:Boolean, default: ()=> window.DARK||false },
    height:{type:String, default:"auto"}
}

export const mdViewerSelector = ()=>{
    let lib = _MARKDOWN_LIB_ || "tui"

    return lib == 'tui'?".toastui-editor-contents":".md-editor-preview"
}
