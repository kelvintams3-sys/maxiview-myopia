'use strict';
const path=require('node:path'),{spawnSync}=require('node:child_process');
for(const brand of ['stellest','hoya','zeiss']){
 const result=spawnSync(process.execPath,['qa/verify-printer-lock.cjs'],{cwd:path.join(__dirname,'..','catalogues',brand),encoding:'utf8'});
 process.stdout.write(brand+'\n'+result.stdout);if(result.stderr)process.stderr.write(result.stderr);
 if(result.status!==0)process.exit(result.status||1);
}
