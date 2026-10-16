// One-time asset preparation. Generated WebP files are committed; deployment
// copies them without requiring an image processor in the server runtime.
const sharp=require('sharp');
const path=require('node:path');
const fs=require('node:fs/promises');
const root=path.resolve(__dirname,'..'),client=path.join(root,'publish-stage-20260920-1500/dist/client');
async function main(){
 const jobs=[['auth-studio.png','auth-studio.webp',1440,78],['auth-studio.png','auth-studio-mobile.webp',640,76],['auth-preview.jpg','auth-preview.webp',1100,80]];
 for(const [source,target,width,quality] of jobs)await sharp(path.join(__dirname,'assets',source)).resize({width,withoutEnlargement:true}).webp({quality,effort:6}).toFile(path.join(__dirname,'assets',target));
 for(const name of ['listening-hero','homework-sprite','orbit-hero'])await sharp(path.join(client,name+'.png')).webp({quality:80,effort:6}).toFile(path.join(__dirname,'assets',name+'.webp'));
 for(const name of [...jobs.map(job=>job[1]),'listening-hero.webp','homework-sprite.webp','orbit-hero.webp'])console.log(name+': '+(await fs.stat(path.join(__dirname,'assets',name))).size+' bytes');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
