export const navigateLevels=[['A1','Beginner'],['A2','Elementary'],['B1','Pre-intermediate']];
export const academyMenus={
 admin:[['home','Control center','home'],['users','Люди и доступ','people'],['groups','Группы','lessons'],['curriculum','Программа Navigate','book'],['files','Файлы центра','file'],['database','Данные и отчёты','settings'],['catalog','Campus studio','bag'],['audit','История действий','marks']],
 teacher:[['home','Home','home'],['lessons','Lessons','lessons'],['ranking','Ranking','ranking'],['tasks','Tasks','file'],['exams','Exams','marks'],['library','Library','book'],['vocabulary','Vocabulary','lessons']],
 student:[['home','Home','home'],['lessons','Lessons','lessons'],['practice','Practice','practice'],['marks','Marks','marks'],['ranking','Ranking','ranking'],['extra','Extra lesson','extra']]
};
const common=['account','messages','people','requests'];
export function roleAllows(role,view){
 if(common.includes(view)||academyMenus[role]?.some(([id])=>id===view))return true;
 if(role==='admin')return ['library','vocabulary'].includes(view);
 if(role==='teacher')return ['groups'].includes(view);
 return role==='student'&&['homework','library','vocabulary','shop','events','universities','videos','books','translator','speaking','dialogue','pronunciation','typing','progress'].includes(view);
}
export const flagNames={active:'Active',new:'New',lost:'Lost',potential:'Potential fail',absent:'Absent today',red:'Red list',black:'Black list'};
