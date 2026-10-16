-- Keep the sign-in identity separate from the editable profile contact number.
ALTER TABLE school_users ADD COLUMN login_phone TEXT;

-- Preserve existing students. Migrate only valid, unambiguous contact numbers.
-- Nine local digits use Uzbekistan's +998 prefix; other numbers include country code.
WITH cleaned AS (
 SELECT id,replace(replace(replace(replace(trim(phone),' ',''),'-',''),'(',''),')','') AS digits
 FROM school_users WHERE role='student' AND trim(phone)<>''
 AND trim(phone) NOT GLOB '*[^+0-9 ()-]*'
), normalized AS (
 SELECT id,CASE WHEN substr(digits,1,1)='+' THEN digits
 WHEN length(digits)=9 THEN '+998'||digits
 WHEN substr(digits,1,2)='00' THEN '+'||substr(digits,3) ELSE '+'||digits END AS number
 FROM cleaned
), valid AS (
 SELECT id,number FROM normalized WHERE length(number) BETWEEN 9 AND 16
 AND substr(number,2,1) BETWEEN '1' AND '9'
 AND substr(number,2) NOT GLOB '*[^0-9]*'
), unique_numbers AS (
 SELECT number FROM valid GROUP BY number HAVING count(*)=1
)
UPDATE school_users SET login_phone=(SELECT v.number FROM valid v JOIN unique_numbers u ON u.number=v.number WHERE v.id=school_users.id)
WHERE role='student';

CREATE UNIQUE INDEX school_users_login_phone ON school_users(login_phone) WHERE login_phone IS NOT NULL;
