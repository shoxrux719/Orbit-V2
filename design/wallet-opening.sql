-- Retain coins earned before homework-only scoring starts. This is a one-time
-- opening credit; future practice runs cannot change it. Orders stay deducted.
CREATE TABLE campus_wallet_openings (user_id TEXT PRIMARY KEY REFERENCES school_users(id), amount INTEGER NOT NULL);
WITH practice AS (SELECT user_id,SUM(ROUND(accuracy*20)) AS earned FROM (SELECT user_id,kind,item_id,MAX(1.0*score/total) AS accuracy FROM sessions GROUP BY user_id,kind,item_id) GROUP BY user_id),
 work AS (SELECT student_id AS user_id,SUM(ROUND(score/5.0)) AS earned FROM school_submissions WHERE status='reviewed' GROUP BY student_id),
 game AS (SELECT user_id,SUM(ROUND(accuracy*20)) AS earned FROM (SELECT user_id,mode,MAX(1.0*score/total) AS accuracy FROM campus_attempts WHERE score IS NOT NULL GROUP BY user_id,mode) GROUP BY user_id)
INSERT INTO campus_wallet_openings SELECT u.id,COALESCE(p.earned,0)+COALESCE(w.earned,0)+COALESCE(g.earned,0) FROM school_users u LEFT JOIN practice p ON p.user_id=u.id LEFT JOIN work w ON w.user_id=u.id LEFT JOIN game g ON g.user_id=u.id WHERE u.role='student';
