export const phoneCountries=[
 {id:'uz',name:'Узбекистан',code:'+998',length:9,placeholder:'90 123 45 67'},
 {id:'kz',name:'Казахстан',code:'+7',length:10,placeholder:'700 123 45 67'},
 {id:'ru',name:'Россия',code:'+7',length:10,placeholder:'900 123 45 67'},
 {id:'gb',name:'Великобритания',code:'+44',length:10,placeholder:'7700 900 123'},
 {id:'us',name:'США / Канада',code:'+1',length:10,placeholder:'202 555 0123'},
 {id:'international',name:'Другой код страны',code:'+',length:15,placeholder:'Код страны и номер'},
];
export function parsePhoneInput(raw,country='uz'){
 const value=String(raw).trim(),digits=value.replace(/\D/g,'');
 if(value.startsWith('+')||(value.startsWith('00')&&digits.length>=10)){
  const full=value.startsWith('00')?digits.slice(2):digits;
  const matches=phoneCountries.filter(c=>c.id!=='international'&&full.startsWith(c.code.slice(1)));
  const match=matches.find(c=>c.id===country)||matches[0];
  return match?{country:match.id,number:full.slice(match.code.length-1)}:{country:'international',number:full};
 }
 const selected=phoneCountries.find(c=>c.id===country)||phoneCountries[0];
 // Pasting a complete number without '+' must not repeat the selected code.
 const number=selected.id!=='international'&&digits.length===selected.length+selected.code.length-1&&digits.startsWith(selected.code.slice(1))?digits.slice(selected.code.length-1):digits;
 return {country:selected.id,number};
}
export function studentPhone(number,country='uz'){
 const selected=phoneCountries.find(c=>c.id===country);
 if(!selected||!/^\d+$/.test(number))return '';
 if(selected.id!=='international'&&number.length!==selected.length)return '';
 const full=selected.code+number;
 return /^\+[1-9]\d{7,14}$/.test(full)?full:'';
}
