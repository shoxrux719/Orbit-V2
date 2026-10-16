const {spawn}=require('node:child_process');
const path=require('node:path');
const executable=Number(process.versions.node.split('.')[0])>=22?process.execPath:path.join(process.env.USERPROFILE||'','.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe');
const child=spawn(executable,['--test','design/grammar-content.test.mjs','design/auth-flow.test.mjs','design/school.test.mjs','design/campus.test.mjs'],{cwd:path.join(__dirname,'..'),stdio:'inherit'});
child.on('error',e=>{console.error(e.message);process.exitCode=1;});child.on('exit',code=>process.exitCode=code||0);
