// Local first-administrator provisioning; there is no public registration route.
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {randomBytes,randomUUID,pbkdf2Sync}=require('node:crypto');
const root=path.join(__dirname,'..');
const cli=(args)=>{const result=spawnSync(process.execPath,[path.join(root,'run-wrangler.cjs'),'d1','execute','DB','--local','--config','wrangler.local.json',...args],{cwd:root,encoding:'utf8'});if(result.status!==0)throw Error(result.stderr||'Не удалось подготовить администратора.');return result.stdout;};
const count=JSON.parse(cli(['--command',"SELECT count(*) AS count FROM school_users WHERE role='admin'",'--json']))[0].results[0].count;
if(count){console.log('Администратор уже существует. Его данные сохранены без изменений.');process.exit(0);}
const password=randomBytes(12).toString('base64url'),salt=randomBytes(16).toString('hex');
const hash=`pbkdf2:100000:${salt}:${pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex')}`;
const number='OR-'+randomBytes(5).toString('hex').toUpperCase();
const temporary=path.join(root,'.school-bootstrap.sql');
fs.writeFileSync(temporary,`INSERT INTO school_users(id,number,login,password_hash,role,first_name,created_at) VALUES('${randomUUID()}','${number}','admin','${hash}','admin','Администратор',${Date.now()});`);
try{cli(['--file',temporary]);fs.writeFileSync(path.join(root,'.local-admin.txt'),`ORBIT 1.0 — администрация\n\nАдрес: http://127.0.0.1:3000/admin\nЛогин: admin\nНомер: ${number}\nПароль: ${password}\n\nЭтот файл содержит данные первого администратора и исключён из Git.\nАккаунты учителей и учеников создаются в разделе «Аккаунты».\n`);console.log('Первый администратор создан. Данные записаны в .local-admin.txt.');}finally{fs.unlinkSync(temporary);}
