import { createReadStream, existsSync, readFileSync, statSync, mkdirSync } from 'fs'
import WebSocket from 'ws'

import FormData from 'form-data'
import confirm from '@inquirer/confirm'

import { Command, Argument } from 'commander'
import { VERBOSE, appName, optionOfAid, optionOfFile, optionOfOutput, optionOfPid, optionOfUid, optionOfValue, encoding } from '../core/base.js'
import { buildHeaders, callServer, isDir, isFile, printDebug, printOK, printObj, printTable, remoteUrl, startLoading, stopLoading, zipDir } from '../core/util.js'
import { join, dirname } from 'path'
import chalk from 'chalk'

const DIST = "dist"
const H5 = "h5"

const loadPkgJSON = dir=>{
    let file = `${dir}/package.json`
    if(!isFile(file))   throw `${file} 文件不存在`

    return JSON.parse(readFileSync(file, {encoding}))
}

/**
 *
 * @param {*} packageName
 * @param {*} ps
 * @param {*} cmd
 */
const deploy = async (packageName, ps, cmd)=>{
    const debug = cmd.optsWithGlobals()[VERBOSE] === true
    debug && printDebug(`执行 page deploy 作业：package=${packageName}`, ps)
    let root
    let pkg
    if(packageName == undefined){
        debug && printDebug(`尝试从当前目录下 package.json 读取模块名...`)
        // 未指定时，则使用读取目录下的 package.json
        root = process.cwd()
        pkg = loadPkgJSON(root)
        packageName = pkg.name
    }
    //确定根目录
    if(root == undefined){
        root = (()=>{
            for(let p of ['', `${ps.dir}/`]){
                let d = `${p}${packageName}`
                if(isDir(d))
                    return d
            }
            throw `在当前目录或 ${ps.dir} 下均找不到模块 ${packageName}`
        })()
    }

    let packFile = `${root}/${packageName}.pack.zip`
    console.log(`即将对模块 ${packageName} 进行${ps.zip?"打包（Zip 压缩）":"部署"}操作...`)

    if(ps.zip===true){
        // 执行打包操作
        let originDir = isDir(`${root}/${DIST}`)? `${root}/${DIST}`: root
        await zipDir(originDir, packFile)
        console.log(`已打包到 ${packageName}.pack.zip （${(statSync(packFile).size/1024).toFixed(1)} KB）`)
    }

    if(!existsSync(packFile)) throw `文件 ${packFile} 不存在，请先打包...`

    if(!pkg){
        pkg = loadPkgJSON(root)
        debug && printDebug(`读取 package.json 文件，appId=${pkg.appId} pageId=${pkg.pageId} template=${pkg.template}`)
    }

    ps.aid ??= pkg.appId
    ps.pid ??= pkg.pageId
    ps.version ??= (now=>`${now.getFullYear()-2000}.${now.getMonth()+1}.${now.getDate()}`)(new Date)
    ps.message ??= ""
    if(!ps.aid || (pkg.template==H5 && !ps.pid))  throw `未指定 appId、pageId（请通过 -a、-p 或者 package.json 定义）`

    let body = new FormData()
    body.append('file', createReadStream(packFile))
    body.append('version', ps.version)
    body.append('summary', ps.message)
    body.append('aid', ps.aid)
    body.append('pid', ps.pid)

    debug && printDebug(`即将上传文件，template=${pkg.template} version=${ps.version} message=${ps.message}`)
    printTable({ template: pkg.template, version:ps.version, message: ps.message })

    let res = await callServer(`/page/${pkg.template==H5?H5:'terminal'}/deploy`, body, 2)
    printOK("部署完成")

    if(res.data)
        console.info(`${res.data}`.replace(/<br>/g, "\n"))
}

const detail = async id=>{
    let res = await callServer('/page/detail', {id, channel:"cli"})
    console.log(`页面 #${id} 详细`)
    console.log(res.data)
}

const create = async bean=> {
    if(!bean.aid)   throw `请通过 -a,--aid 指定应用ID`
    bean.name ||= `新建页面${bean.template}`

    printObj("尝试创建新页面/功能", bean)
    await callServer("/page/create", bean)
    printOK()
}

const pageModify = async (type, ps)=>{
    let id = ps.pid
    if(id.indexOf("/") > 0)
        id = id.split("/")[1]

    if(type == 'content'){
        let model = {id}
        if(ps.file){
            if(!isFile(ps.file))    throw `${ps.file} 不是一个有效的文件`
            model.value = readFileSync(ps.file, {encoding})
        }
        else
            model.value = ps.value

        if(model.value != '' && !model.value)    throw `请输入更新内容（参数 -v, --value 或 -f, --file）`
        await callServer("/page/content", model)
        printOK(`页面#${ps.pid} 的内容已更新`)
    }
    else {
        let model = {id, key:type}
        if(['active','main','search'].includes(type)){
            model.value = ps.value.toLowerCase() == 'true'
        }
        else
            model.value = ps.value

        await callServer("/page/modify", model)
        printOK(`页面#${id} 字段更新：${type}=${model.value}`)
    }
}

const pageLink = async ps=>{
    await callServer("/system/page/link/add", ps)
    printOK()
}

const pageLinks = async ps=>{
    let res = await callServer("/system/page/link/list", {form:{ EQ_uid: ps.uid }, pagination:{pageSize:50}})
    let cols = ['id', 'aid', 'pid', 'name', 'template', 'addOn']
    printTable(res.data.map(i=>cols.map(c=>i[c])), cols)
}

/**
 * 跟踪远程日志文件
 * @param {PageFileOptions} ps
 */
const _tailRemoteFile = async ps=>{
    let url = remoteUrl("/ws/file-tail", true)

    let headers = await buildHeaders()
    headers.params = JSON.stringify(ps)

    const client = new WebSocket(url, { headers })
    client.on('open', ()=> console.debug(chalk.magenta(`与服务器连接成功 （CTRL+C 退出）`)))
    // client.on('close',()=> console.debug(chalk.magenta(`\n与服务器连接关闭`)))
    client.on('error', e=> {
        console.debug(chalk.red(e))
    })
    client.on('message', /** @param {Buffer} buf */buf=>{
        let line = buf.toString()
        if(line.endsWith("\n") || line.endsWith("\r\n"))
            line = line.substring(0, line.length-2)
        console.debug(line)
    })
}

const listOrDownload = async ps=>{
    if(!ps.aid)   throw `请通过 -a,--aid 指定应用ID`
    if(ps.download===true){
        let output = join(ps.aid, ps.path)
        let dir = dirname(output)
        existsSync(dir) || mkdirSync(dir, { recursive: true })

        await callServer("/page/terminal/file", {id: ps.aid, key: ps.path, value:"download"}, 0, true, {}, output)
    }
    else if(ps.remove===true){
        let answer = await confirm({ message: `确定要删除远程文件 ${ps.path} 吗？` })
        if(answer != true)  return

        await callServer("/page/terminal/file", {id: ps.aid, key: ps.path, value:"delete"})
    }
    else if(ps.tail === true){
        _tailRemoteFile(ps)
    }
    else{
        let toRow = f=> [f.type==0?chalk.magenta('目录'):chalk.blue('文件'), f.name, f.type==0?"-":`${f.size} B`, f.time]
        let res = await callServer("/page/terminal/file", {id: ps.aid, key: ps.path})
        let { file, content } = res.data

        let row = toRow(file)
        console.log(`路径：${ps.path??"/"}`)
        console.log(`类型：${row[0]}`)
        console.log(`大小：${row[2]}`)
        console.log(`更新：${row[3]}`)
        console.log()

        if(file.type == 0)
            printTable((content??[]).map(toRow), `目录结构`)
        else{
            console.log(chalk.magenta(`文件前 10 行内容`))
            content.forEach(v=> console.log(v))
        }
    }
}

export default (app=new Command())=> {
    const page = app.command("page [id]")
        .alias("p")
        .description(
            Array.of(
                `功能页面相关`,
                `查看详情：${appName} page {id}`
            ).join("\n")
        )
        .action(detail)

    page.command("deploy [packageName]")
        .alias("d")
        .description(`
        部署功能（小程序或后端服务）
        注意，打包或者部署均针对包目录下的 ${DIST} 文件夹

        仅打包（zip 格式）：${appName} page deploy -z
        部署：
            ① 指定包名 packageName 则读取 packages 下的子包
            ② 不指定包名，此时需要当前目录下存在 package.json
        `)
        .option(...optionOfAid)
        .option(...optionOfPid)
        .option('-z, --zip [boolean]', "自动进行 ZIP 打包（命名：{包名}.pack.zip）")
        .option('-d, --dir [string]', "monorepo 项目下包存放目录", 'packages')
        .option('--version [string]', "版本号（默认为当前日期）")
        .option('-m, --message [string]', "更新描述信息")
        .action(deploy)

    page.command("file")
        .description(`显示后端服务部署的目录结构、下载/${chalk.underline('跟踪(--tail)')}文件（该功能仅限 template=server）`)
        .option(...optionOfAid)
        .option(...optionOfOutput)
        .option('-d, --download', "下载文件")
        .option('-r, --remove', "删除文件")
        .option('-p, --path [string]', "文件/目录路径，默认为根目录")
        .option('-t, --tail', '跟踪某个文本文件的更新', false)
        .option('-c, --charset [string]', '编码，默认 UTF-8', encoding)
        .action(listOrDownload)

    page.command("status [id]")
        .description(`显示后端服务的运行状态（该功能仅限 template=server）`)
        .option(...optionOfAid)
        .action(async (id, ps)=>{
            id??=ps.aid
            if(!id) throw `请通过 -a,--aid 指定应用ID`

            startLoading(`读取应用 #${id} 的运行状态...`)
            let res = await callServer("/page/terminal/overview", {id})
            stopLoading()

            printObj(res.data)
        })

    page.command("create")
        .alias("c")
        .description("创建新页面/功能")
        .requiredOption(...optionOfAid)
        .option("-n, --name <string>", "名称")
        .option("-t, --template <string>", "类型", H5)
        .action(create)

    page.command("update")
        .description(`更新页面属性`)
        .addArgument(new Argument('[type]', "字段/属性").default("active").choices(['active','search','main','name','serviceAuth','editAuth','content']))
        .requiredOption(...optionOfPid)
        .option(...optionOfFile)
        .option(...optionOfValue)
        .action(pageModify)

    page.command("link").alias("l")
        .description("新增或者取消页面关联")
        .requiredOption(...optionOfPid)
        .requiredOption(...optionOfUid)
        .action(pageLink)

    page.command("link-list")
        .description("查看执行用户的关联页面清单")
        .requiredOption(...optionOfUid)
        .action(pageLinks)
}
