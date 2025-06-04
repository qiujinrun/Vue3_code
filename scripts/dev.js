//这个文件会帮我们打包packages下的模块，最终打包除js文件

//node dev.js 要打包的名字 -f 打包的格式

import minimist from "minimist";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { createRequire} from "module";
import esbuild from 'esbuild'
//node中的命令函数参数通过procss 来获取 process.argv
const args = minimist(process.argv.slice(2))
const __filename = fileURLToPath(import.meta.url) //当前文件的绝对路径

//esm使用commonjs变量
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)
const target = args._[0] || 'reactivity';//默认打包reactivity，打包哪个项目
const format = args.f || 'life';//打包后的模块化规范
console.log(args,format);

//node中esm模块没有 __dirname
//入口文件，根据命令行提供的路径来进行解析
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`);
const pkg = require(`../packages/${target}/package.json`)

//根据所需去打包

esbuild
  .context({
    entryPoints: [entry], //打包的入口文件
    outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`), //打包的出口文件
    format, //打包的格式,esm,commonjs,umd 
    bundle: true, //打包的格式
    platform: "browser", //打包的平台,打包后给浏览器使用
    sourcemap: true, //生成sourcemap文件，可以调试源代码
    globalName: pkg.buildOptions?.name, //打包后的全局变量名
  })
    .then((ctx) => { //打包的上下文
        
        return ctx.watch() //监听文件变化，自动打包
    })