import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePhoneInput,studentPhone,formatStudentNumber,phoneCaretForDigits} from './auth-phone.js';

test('student phone field accepts local and pasted full numbers without repeating the country code',()=>{
 for(const value of ['90 123 45 67','998901234567','+998 (90) 123-45-67','00998 90 123 45 67']){
  const parsed=parsePhoneInput(value,'uz');assert.equal(studentPhone(parsed.number,parsed.country),'+998901234567');
 }
 assert.deepEqual(parsePhoneInput('000 123 456','uz'),{country:'uz',number:'000123456'});
 const uk=parsePhoneInput('+44 7700 900123','uz');assert.equal(uk.country,'gb');assert.equal(studentPhone(uk.number,uk.country),'+447700900123');
 const russian=parsePhoneInput('+7 900 123 45 67','ru');assert.equal(russian.country,'ru');assert.equal(studentPhone(russian.number,russian.country),'+79001234567');
 const other=parsePhoneInput('+380 50 123 45 67','uz');assert.equal(other.country,'international');assert.equal(studentPhone(other.number,other.country),'+380501234567');
});

test('Student displays Uzbek numbers in 2-3-2-2 groups while preserving canonical login and editing positions',()=>{
 const expected=['','9','90','90 1','90 12','90 123','90 123 4','90 123 45','90 123 45 6','90 123 45 67'];
 for(let length=0;length<=9;length++)assert.equal(formatStudentNumber('901234567'.slice(0,length)),expected[length]);
 const formatted=formatStudentNumber('901234567');
 assert.equal(studentPhone(parsePhoneInput(formatted).number),'+998901234567');
 assert.equal(formatStudentNumber('90123456789'),'90 123 45 67 89');
 assert.equal(studentPhone(parsePhoneInput('90 123 45 67 89').number),'');
 assert.equal(formatStudentNumber('7700900123','gb'),'7700 900 123');
 assert.equal(phoneCaretForDigits(formatted,0),0);
 assert.equal(phoneCaretForDigits(formatted,2),2);
 assert.equal(phoneCaretForDigits(formatted,3),4);
 assert.equal(phoneCaretForDigits(formatted,9),12);
});
test('incomplete or overlong numbers cannot enable Student Next or silently become a different valid number',()=>{
 for(const value of ['','90123456','+99890123456789','123456789012345678']){
  const parsed=parsePhoneInput(value,'uz');assert.equal(studentPhone(parsed.number,parsed.country),'');
 }
 assert.equal(studentPhone('012345678','international'),'');
 assert.equal(studentPhone('901234567','kz'),'');
 assert.equal(studentPhone('2025550123','us'),'+12025550123');
});
