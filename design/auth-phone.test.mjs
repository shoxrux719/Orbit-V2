import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePhoneInput,studentPhone} from './auth-phone.js';

test('student phone field accepts local and pasted full numbers without repeating the country code',()=>{
 for(const value of ['90 123 45 67','998901234567','+998 (90) 123-45-67','00998 90 123 45 67']){
  const parsed=parsePhoneInput(value,'uz');assert.equal(studentPhone(parsed.number,parsed.country),'+998901234567');
 }
 assert.deepEqual(parsePhoneInput('000 123 456','uz'),{country:'uz',number:'000123456'});
 const uk=parsePhoneInput('+44 7700 900123','uz');assert.equal(uk.country,'gb');assert.equal(studentPhone(uk.number,uk.country),'+447700900123');
 const russian=parsePhoneInput('+7 900 123 45 67','ru');assert.equal(russian.country,'ru');assert.equal(studentPhone(russian.number,russian.country),'+79001234567');
 const other=parsePhoneInput('+380 50 123 45 67','uz');assert.equal(other.country,'international');assert.equal(studentPhone(other.number,other.country),'+380501234567');
});
test('incomplete or overlong numbers cannot enable Student Next or silently become a different valid number',()=>{
 for(const value of ['','90123456','+99890123456789','123456789012345678']){
  const parsed=parsePhoneInput(value,'uz');assert.equal(studentPhone(parsed.number,parsed.country),'');
 }
 assert.equal(studentPhone('012345678','international'),'');
 assert.equal(studentPhone('901234567','kz'),'');
 assert.equal(studentPhone('2025550123','us'),'+12025550123');
});
