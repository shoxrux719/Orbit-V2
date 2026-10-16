const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
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
  minify: false,
}).outputFiles[0].text;

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
  source = 'import { orbitHeader, orbitHome, orbitGrammar, orbitAccountGuest, orbitSchool, orbitCampus } from "./orbit-design.js";\n' + source;
  // Parse each edited bundle before writing it to the running site.
  esbuild.transformSync(source, { loader: 'js', target: 'es2022' });
  fs.writeFileSync(file, source);
  if (relativePath.startsWith('client/')) {
    fs.writeFileSync(path.join(path.dirname(file), 'page-orbit-20261004.js'), source);
  }
  fs.writeFileSync(path.join(path.dirname(file), 'orbit-design.js'), compiled);
}

// The supplied production build cached its old content-hashed page for a year.
// Give the redesigned page a new module URL in every generated manifest.
const chunks = path.join(dist, 'client/_next/static/chunks');
const moduleNames = fs.readdirSync(chunks).filter(name => name.endsWith('.js') && !name.includes('-orbit') && name !== 'orbit-design.js');
const renamed = moduleNames.map(name => [name, name === 'page-wtzQnJwQ.js' ? 'page-orbit-20261004.js' : name.replace(/\.js$/, '-orbit.js')]);
function refreshReferences(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) refreshReferences(file);
    else if (/\.(js|json)$/.test(entry.name)) {
      const text = fs.readFileSync(file, 'utf8');
      let updated = text;
      for (const [oldName, newName] of renamed) updated = updated.replaceAll(oldName, newName);
      if (updated !== text) fs.writeFileSync(file, updated);
    }
  }
}
refreshReferences(dist);
for (const [oldName, newName] of renamed) {
  fs.copyFileSync(path.join(chunks, oldName), path.join(chunks, newName));
}

fs.copyFileSync(path.join(__dirname, 'theme.css'), path.join(dist, 'client/orbit-design.css'));
fs.copyFileSync(path.join(__dirname, 'learning.css'), path.join(dist, 'client/orbit-learning.css'));
fs.copyFileSync(path.join(__dirname, 'school.css'), path.join(dist, 'client/orbit-school.css'));
fs.copyFileSync(path.join(__dirname, 'school-server.js'), path.join(dist, 'server/school-server.js'));
for(const file of ['campus-server.js','practice-bank.js'])fs.copyFileSync(path.join(__dirname,file),path.join(dist,'server',file));
fs.copyFileSync(path.join(__dirname,'campus.css'),path.join(dist,'client/orbit-campus.css'));
fs.appendFileSync(path.join(dist,'client/orbit-campus.css'),'\n'+fs.readFileSync(path.join(__dirname,'auth.css'),'utf8'));
for(const [source,target] of [['auth-studio.png','orbit-auth-studio.png'],['auth-preview.jpg','orbit-auth-preview.jpg']])fs.copyFileSync(path.join(__dirname,'assets',source),path.join(dist,'client',target));
fs.copyFileSync(path.join(__dirname,'campus-schema.sql'),path.join(dist,'.openai/drizzle/0004_campus_experience.sql'));
fs.copyFileSync(path.join(__dirname,'campus-updates.sql'),path.join(dist,'.openai/drizzle/0005_support_slots.sql'));
fs.copyFileSync(path.join(__dirname,'student-phone.sql'),path.join(dist,'.openai/drizzle/0006_student_phone.sql'));
fs.copyFileSync(path.join(__dirname, 'school-schema.sql'), path.join(dist, '.openai/drizzle/0003_orbit_school.sql'));
fs.copyFileSync(path.join(__dirname, 'sphere.svg'), path.join(dist, 'client/orbit-sphere.svg'));
fs.copyFileSync(path.join(__dirname, 'worker.js'), path.join(dist, 'server/orbit-entry.js'));
fs.writeFileSync(path.join(dist, 'client/_headers'), '/_next/static/*\n  Cache-Control: no-store\n/orbit-design.css\n  Cache-Control: no-store\n/orbit-learning.css\n  Cache-Control: no-store\n/orbit-school.css\n  Cache-Control: no-store\n/orbit-campus.css\n  Cache-Control: no-store\n/orbit-sphere.svg\n  Cache-Control: no-cache\n');
console.log('ORBIT design built: server, browser, styles and artwork.');
