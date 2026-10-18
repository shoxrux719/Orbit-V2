CREATE TABLE navigate_units (
 id TEXT PRIMARY KEY, level TEXT NOT NULL CHECK(level IN ('A1','A2','B1')),
 code TEXT NOT NULL, position INTEGER NOT NULL, title TEXT NOT NULL,
 edition TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
 steps TEXT NOT NULL DEFAULT '[]', total_questions INTEGER NOT NULL DEFAULT 0,
 updated_at INTEGER NOT NULL DEFAULT 0, UNIQUE(level,code)
);
WITH RECURSIVE numbers(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM numbers WHERE n<12),
 levels(level) AS (VALUES('A1'),('A2'),('B1')), sections(s) AS (VALUES(1),(2),(3))
INSERT INTO navigate_units(id,level,code,position,title)
 SELECT level||'-'||n||'.'||s,level,n||'.'||s,n*10+s,'Unit '||n||'.'||s FROM levels,numbers,sections;
CREATE TABLE navigate_assignments (
 id TEXT PRIMARY KEY, group_id TEXT NOT NULL REFERENCES school_groups(id),
 unit_id TEXT NOT NULL REFERENCES navigate_units(id), kind TEXT NOT NULL DEFAULT 'homework' CHECK(kind IN ('homework','exam')),
 lesson_date TEXT NOT NULL, due_at TEXT NOT NULL, created_by TEXT NOT NULL REFERENCES school_users(id), created_at INTEGER NOT NULL,
 UNIQUE(group_id,unit_id,kind)
);
CREATE INDEX navigate_assignments_group ON navigate_assignments(group_id,lesson_date);
CREATE TABLE navigate_progress (
 student_id TEXT NOT NULL REFERENCES school_users(id), unit_id TEXT NOT NULL REFERENCES navigate_units(id), kind TEXT NOT NULL CHECK(kind IN ('homework','exam')),
 step_index INTEGER NOT NULL, question_index INTEGER NOT NULL, completed_at INTEGER NOT NULL,
 PRIMARY KEY(student_id,unit_id,kind,step_index,question_index)
);
CREATE TABLE campus_student_flags (
 student_id TEXT PRIMARY KEY REFERENCES school_users(id),
 status TEXT NOT NULL CHECK(status IN ('active','lost','potential','red','black')),
 note TEXT NOT NULL DEFAULT '', updated_by TEXT NOT NULL REFERENCES school_users(id), updated_at INTEGER NOT NULL
);
CREATE TABLE campus_coin_grants (
 id TEXT PRIMARY KEY, teacher_id TEXT NOT NULL REFERENCES school_users(id), student_id TEXT NOT NULL REFERENCES school_users(id),
 amount INTEGER NOT NULL CHECK(amount BETWEEN 1 AND 500), reason TEXT NOT NULL,
 client_id TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(teacher_id,client_id)
);
CREATE INDEX campus_coin_grants_student ON campus_coin_grants(student_id);
CREATE TABLE campus_action_limits (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, window_start INTEGER NOT NULL);
CREATE TABLE campus_resources (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('file','library','vocabulary')),
 level TEXT NOT NULL, url TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '',
 created_by TEXT NOT NULL REFERENCES school_users(id), created_at INTEGER NOT NULL
);
CREATE VIEW navigate_scores AS
 SELECT p.student_id,p.unit_id,p.kind,COUNT(*) AS done,u.total_questions AS total,
 MIN(100,CAST(100.0*COUNT(*)/u.total_questions AS INTEGER)) AS percent
 FROM navigate_progress p JOIN navigate_units u ON u.id=p.unit_id
 WHERE u.total_questions>0 GROUP BY p.student_id,p.unit_id,p.kind;
