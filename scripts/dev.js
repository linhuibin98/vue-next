const {build} = require('esbuild');
const args = require('minimist')(process.argv.slice(2));
const {resolve} = require('path');

// 开发环境打包某一个包
const target = args._[0] || 'reactivity';
const format = args.f || 'global';

const pkg = require(resolve(__dirname, `../packages/${target}/package.json`));

// iife 立即执行函数
// cjs node中的模块
// esm 流览器中的esModule摸块
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm';
const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.js`);

let rebuildCount = 0; // 记录watch触发重新构建的次数

build({
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile,
    bundle: true,
    sourcemap: true,
    format: outputFormat,
    globalName: pkg.buildOptions?.name,
    platform: format === 'cjs' ? 'node' : 'browser',
    watch: {
        onRebuild(error) {
            if (!error) {
                console.log(`${target} rebuild success, count ${++rebuildCount}.`);
            }
        }
    }
}).then(() => {
    console.log(`${target} build success.`);
}).catch(() => process.exit(1));
