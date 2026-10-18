const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
const {createHash}=require('node:crypto');
const root = path.join(__dirname, '..');
const dist = path.join(root, 'publish-stage-20260920-1500/dist');
const backups = path.join(__dirname, 'original');
fs.mkdirSync(backups, { recursive: true });

const compiled = esbuild.buildSync({
  entryPoints: [path.join(__dirname, 'interface.jsx')],
  bundle: true,
  write: false,
  format: 'esm',
  jsxFactory: 'h',
  jsxFragment: 'runtime.Fragment',
  target: 'es2022',
  minify: true,
  charset: 'utf8',
}).outputFiles[0].text;
const styleFiles=['theme.css','learning.css','school.css','campus.css','auth.css','chat.css','academy.css','course-player.css'];
const optimizedAssets=[['auth-studio.webp','orbit-auth-studio'],['auth-studio-mobile.webp','orbit-auth-studio-mobile'],['auth-preview.webp','orbit-auth-preview'],['listening-hero.webp','listening-hero'],['homework-sprite.webp','homework-sprite'],['orbit-hero.webp','orbit-hero']];
const fingerprint=createHash('sha256').update(compiled);
fingerprint.update(fs.readFileSync(__filename));
for(const name of ['page-wtzQnJwQ.js','page-cJwt4FDc.js'])if(fs.existsSync(path.join(backups,name)))fingerprint.update(fs.readFileSync(path.join(backups,name)));
for(const file of styleFiles)fingerprint.update(fs.readFileSync(path.join(__dirname,file)));
for(const [file] of optimizedAssets)fingerprint.update(fs.readFileSync(path.join(__dirname,'assets',file)));
const version=fingerprint.digest('hex').slice(0,12),designName=`orbit-design-${version}.js`,pageName=`page-orbit-${version}.js`,indexName=`index-orbit-${version}.js`;
const assetReplacements=optimizedAssets.flatMap(([file,name])=>[[`/${name}.webp`,`/${name}-${version}.webp`],[`/${name}.png`,`/${name}-${version}.webp`],[`/${name}.jpg`,`/${name}-${version}.webp`]]);
const replaceAssets=text=>optimizedAssets.reduce((result,[,name])=>result.replace(new RegExp('/'+name+'-[a-f0-9]{12}\\.webp','g'),`/${name}-${version}.webp`),assetReplacements.reduce((result,[from,to])=>result.replaceAll(from,to),text));
const compiledVersion=replaceAssets(compiled);

for (const [relativePath, runtime, react] of [
  ['client/_next/static/chunks/page-wtzQnJwQ.js', 'W', 'U'],
  ['server/ssr/_next/static/page-cJwt4FDc.js', 'G', 'F'],
]) {
  const file = path.join(dist, relativePath);
  const backup = path.join(backups, path.basename(file));
  if (!fs.existsSync(backup)) fs.copyFileSync(file, backup);
  let source = fs.readFileSync(backup, 'utf8');
  const headerStart = source.indexOf(`(0,${runtime}.jsxs)(\`header\`,{className:\`topbar\``);
  const mainStart = source.indexOf(`(0,${runtime}.jsxs)(\`main\`,{className:\`workspace\``, headerStart);
  if (headerStart < 0 || mainStart < 0) throw Error('Original header was not found: ' + relativePath);
  source = source.slice(0, headerStart) + `orbitHeader(${runtime},${react},{view:n,navigate:w,locale:t,language:(0,${runtime}.jsx)(s,{}),name:i?.user?.displayName}),` + source.slice(mainStart);
  const homeStart = source.indexOf('function rc(');
  const homeEnd = source.indexOf('function ic(', homeStart);
  if (homeStart < 0 || homeEnd < 0) throw Error('Original home component was not found: ' + relativePath);
  source = source.slice(0, homeStart) + `function rc(props){let{locale}=A();return orbitHome(${runtime},${react},{...props,locale})}` + source.slice(homeEnd);
  const grammarName = runtime === 'W' ? 'Ss' : 'us';
  const grammarStart = source.indexOf(`function ${grammarName}(`);
  const grammarEnd = source.indexOf('function ', grammarStart + 10);
  const grammarOriginal = source.slice(grammarStart, grammarEnd);
  const dataName = grammarOriginal.match(/p=(\w+)\.filter/)[1];
  const tabs = runtime === 'W' ? ['Zo','$o','es'] : ['Ri','Bi','Vi'];
  const speech = grammarOriginal.match(/onClick:\(\)=>((?:\w+))\(e\.split/)[1];
  source = source.slice(0, grammarStart) + `function ${grammarName}(props){let{t:translate,locale}=A();return orbitGrammar(${runtime},${react},{...props,topics:${dataName},translate,locale,speak:${speech},primitives:{Tabs:${tabs[0]},TabsList:${tabs[1]},TabsTrigger:${tabs[2]}}})}` + source.slice(grammarEnd);
  const grammarProps = `(0,${runtime}.jsx)(${grammarName},{save:E,sessions:p})`;
  if (!source.includes(grammarProps)) throw Error('Grammar props were not found: ' + relativePath);
  source = source.replace(grammarProps, `(0,${runtime}.jsx)(${grammarName},{save:E,sessions:p,signedIn:!!i?.user,navigate:w})`);
  // Replace the account surface with the role-based school portal.
  source = source.replace('function Qs(', 'function OrbitLegacyAccount(');
  source = source.replace('window.location.href=`/signout-with-chatgpt?return_to=%2F%23account`', 'window.location.href=e?.user?.provider===`google`?`/#account`:`/signout-with-chatgpt?return_to=%2F%23account`');
  const homeworkView = `(0,${runtime}.jsx)(${runtime==='W'?'Ys':'Ws'},{})`;
  if (!source.includes(homeworkView)) throw Error('Homework view was not found: ' + relativePath);
  source = source.replace(homeworkView, `(0,${runtime}.jsx)(OrbitClassroom,{account:i,reload:o})`);
  source = `function Qs(props){let{locale}=A();return orbitSchool(${runtime},${react},{...props,locale})}function OrbitClassroom(props){let{locale}=A();return orbitSchool(${runtime},${react},{...props,locale,initialTab:'groups'})}\n` + source;
  // Keep the existing working learning engines, replace the outer application.
  const rootStart=source.indexOf('function tc('),rootEnd=source.indexOf('function nc(',rootStart);
  if(rootStart<0||rootEnd<0)throw Error('App root was not found.');
  const names=runtime==='W'?{vocabulary:'Cs',reading:'ws',listening:'Ms',writing:'Ps',books:'Ls',typing:'Es',translator:'Ks',pronunciation:'Gs',speaking:'Ds',dialogue:'Fs',progress:'Os'}:{vocabulary:'ds',reading:'fs',listening:'xs',writing:'Cs',books:'Os',typing:'ms',translator:'Vs',pronunciation:'Bs',speaking:'hs',dialogue:'ws',progress:'gs'};
  const cases=Object.entries(names).map(([name,component])=>`case '${name}':return (0,${runtime}.jsx)(${component},props);`).join('');
  const replacement=`function OrbitLearning({section,...props}){switch(section){case 'grammar':return (0,${runtime}.jsx)(${grammarName},props);${cases}default:return null;}}function tc(){let{locale}=A();return orbitCampus(${runtime},${react},{locale,Learning:OrbitLearning,language:(0,${runtime}.jsx)(s,{})})}`;
  source=source.slice(0,rootStart)+replacement+source.slice(rootEnd);
  source = `import { orbitHeader, orbitHome, orbitGrammar, orbitAccountGuest, orbitSchool, orbitCampus } from "./${designName}";\n` + source;
  source=replaceAssets(source);
  // Parse each edited bundle before writing it to the running site.
  esbuild.transformSync(source, { loader: 'js', target: 'es2022' });
  fs.writeFileSync(file, source);
  if (relativePath.startsWith('client/')) {
    fs.writeFileSync(path.join(path.dirname(file), 'page-orbit-20261004.js'), source);
  }
  fs.writeFileSync(path.join(path.dirname(file), 'orbit-design.js'), compiledVersion);
  fs.writeFileSync(path.join(path.dirname(file), designName), compiledVersion);
}

// The supplied production build cached its old content-hashed page for a year.
// Give the redesigned page a new module URL in every generated manifest.
const chunks = path.join(dist, 'client/_next/static/chunks');
const moduleNames = fs.readdirSync(chunks).filter(name => name.endsWith('.js') && !name.includes('-orbit') && !name.startsWith('orbit-design'));
const renamed = moduleNames.map(name => [name, name === 'page-wtzQnJwQ.js' ? pageName : name === 'index-C2LGDuAU.js' ? indexName : name.replace(/\.js$/, '-orbit.js')]);
function refreshReferences(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) refreshReferences(file);
    else if (/\.(js|json)$/.test(entry.name)&&!/^orbit-design-[a-f0-9]{12}\.js$/.test(entry.name)&&! /^(?:page|index)-orbit-[a-f0-9]{12}\.js$/.test(entry.name)) {
      const text = fs.readFileSync(file, 'utf8');
      let updated = text;
      for (const [oldName, newName] of renamed) updated = updated.replaceAll(oldName, newName);
      updated=updated.replace(/page-orbit-(?:20261004|[a-f0-9]{12})\.js/g,pageName).replace(/index-(?:C2LGDuAU-orbit|orbit-[a-f0-9]{12})\.js/g,indexName);
      if (updated !== text) fs.writeFileSync(file, updated);
    }
  }
}
refreshReferences(dist);
for (const [oldName, newName] of renamed) {
  fs.copyFileSync(path.join(chunks, oldName), path.join(chunks, newName));
}

for(const [files,name] of [[['theme.css'],'design'],[['learning.css'],'learning'],[['school.css'],'school'],[['campus.css','auth.css','chat.css','academy.css','course-player.css'],'campus']]){
 const raw=replaceAssets(files.map(file=>fs.readFileSync(path.join(__dirname,file),'utf8')).join('\n'));
 const css=esbuild.transformSync(raw,{loader:'css',minify:true}).code;
 fs.writeFileSync(path.join(dist,`client/orbit-${name}.css`),css);
 fs.writeFileSync(path.join(dist,`client/orbit-${name}-${version}.css`),css);
}
fs.copyFileSync(path.join(__dirname, 'school-server.js'), path.join(dist, 'server/school-server.js'));
for(const file of ['campus-server.js','practice-bank.js','chat-data.js','academy-server.js','exercise-check.js'])fs.copyFileSync(path.join(__dirname,file),path.join(dist,'server',file));
for(const [source,target] of [['auth-studio.png','orbit-auth-studio.png'],['auth-preview.jpg','orbit-auth-preview.jpg']])fs.copyFileSync(path.join(__dirname,'assets',source),path.join(dist,'client',target));
for(const [file,name] of optimizedAssets)fs.copyFileSync(path.join(__dirname,'assets',file),path.join(dist,`client/${name}-${version}.webp`));
for(const file of fs.readdirSync(path.join(dist,'client/_next/static/css')))if(file.endsWith('.css')){const target=path.join(dist,'client/_next/static/css',file);fs.writeFileSync(target,replaceAssets(fs.readFileSync(target,'utf8')));}
fs.copyFileSync(path.join(__dirname,'campus-schema.sql'),path.join(dist,'.openai/drizzle/0004_campus_experience.sql'));
fs.copyFileSync(path.join(__dirname,'campus-updates.sql'),path.join(dist,'.openai/drizzle/0005_support_slots.sql'));
fs.copyFileSync(path.join(__dirname,'student-phone.sql'),path.join(dist,'.openai/drizzle/0006_student_phone.sql'));
fs.copyFileSync(path.join(__dirname,'chat-updates.sql'),path.join(dist,'.openai/drizzle/0007_chat.sql'));
fs.copyFileSync(path.join(__dirname,'navigate-schema.sql'),path.join(dist,'.openai/drizzle/0008_navigate_academy.sql'));
fs.copyFileSync(path.join(__dirname,'wallet-opening.sql'),path.join(dist,'.openai/drizzle/0009_wallet_opening.sql'));
fs.copyFileSync(path.join(__dirname,'course-seed.sql'),path.join(dist,'.openai/drizzle/0010_original_course.sql'));
fs.cpSync(path.join(__dirname,'assets/lessons'),path.join(dist,'client/orbit-lessons'),{recursive:true});
fs.copyFileSync(path.join(__dirname, 'school-schema.sql'), path.join(dist, '.openai/drizzle/0003_orbit_school.sql'));
fs.copyFileSync(path.join(__dirname, 'sphere.svg'), path.join(dist, 'client/orbit-sphere.svg'));
fs.writeFileSync(path.join(dist,'server/orbit-entry.js'),fs.readFileSync(path.join(__dirname,'worker.js'),'utf8').replaceAll('__ORBIT_ASSET_VERSION__',version));
fs.writeFileSync(path.join(dist,'client/orbit-assets.json'),JSON.stringify({version,designName,pageName,indexName}));
// Remove only prior generated revisions; source assets and original bundles stay.
for(const directory of [path.join(dist,'client'),chunks,path.join(dist,'server/ssr/_next/static')])for(const file of fs.readdirSync(directory))if(/(?:^orbit-.*|^(?:page|index)-orbit|^listening-hero|^homework-sprite)-[a-f0-9]{12}\.(?:js|css|webp)$/.test(file)&&!file.includes(version))fs.unlinkSync(path.join(directory,file));
fs.writeFileSync(path.join(dist, 'client/_headers'), '/_next/static/*\n  Cache-Control: no-store\n/orbit-design.css\n  Cache-Control: no-store\n/orbit-learning.css\n  Cache-Control: no-store\n/orbit-school.css\n  Cache-Control: no-store\n/orbit-campus.css\n  Cache-Control: no-store\n/orbit-sphere.svg\n  Cache-Control: no-cache\n');
console.log('ORBIT design built: server, browser, styles and artwork.');
