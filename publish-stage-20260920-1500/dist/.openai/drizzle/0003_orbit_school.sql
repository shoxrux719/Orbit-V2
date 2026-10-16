PRAGMA foreign_keys = ON;
CREATE TABLE school_users (
 id TEXT PRIMARY KEY, number TEXT NOT NULL UNIQUE, login TEXT NOT NULL UNIQUE COLLATE NOCASE,
 password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','teacher','student')),
 first_name TEXT NOT NULL, last_name TEXT NOT NULL DEFAULT '', gender TEXT NOT NULL DEFAULT 'unspecified' CHECK(gender IN ('male','female','unspecified')),
 bio TEXT NOT NULL DEFAULT '', level TEXT NOT NULL DEFAULT 'A1', phone TEXT NOT NULL DEFAULT '',
 avatar_id TEXT, banner_id TEXT, banner_style TEXT NOT NULL DEFAULT 'blue', active INTEGER NOT NULL DEFAULT 1,
 created_at INTEGER NOT NULL
);
CREATE TABLE school_sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES school_users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL);
CREATE INDEX school_sessions_user ON school_sessions(user_id);
CREATE TABLE school_login_limits (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, window_start INTEGER NOT NULL);
CREATE TABLE school_groups (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, level TEXT NOT NULL, teacher_id TEXT NOT NULL REFERENCES school_users(id),
 schedule TEXT NOT NULL DEFAULT '', room TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL
);
CREATE TABLE school_members (group_id TEXT NOT NULL REFERENCES school_groups(id) ON DELETE CASCADE, student_id TEXT NOT NULL REFERENCES school_users(id), joined_at INTEGER NOT NULL, PRIMARY KEY(group_id,student_id));
CREATE INDEX school_members_student ON school_members(student_id);
CREATE TABLE school_lessons (id TEXT PRIMARY KEY, group_id TEXT NOT NULL REFERENCES school_groups(id), date TEXT NOT NULL, title TEXT NOT NULL, created_by TEXT NOT NULL REFERENCES school_users(id), created_at INTEGER NOT NULL);
CREATE INDEX school_lessons_group ON school_lessons(group_id,date);
CREATE TABLE school_attendance (lesson_id TEXT NOT NULL REFERENCES school_lessons(id) ON DELETE CASCADE, student_id TEXT NOT NULL REFERENCES school_users(id), status TEXT NOT NULL CHECK(status IN ('present','absent','late','excused')), note TEXT NOT NULL DEFAULT '', updated_by TEXT NOT NULL REFERENCES school_users(id), updated_at INTEGER NOT NULL, PRIMARY KEY(lesson_id,student_id));
CREATE TABLE school_marks (lesson_id TEXT NOT NULL REFERENCES school_lessons(id) ON DELETE CASCADE, student_id TEXT NOT NULL REFERENCES school_users(id), skill TEXT NOT NULL, score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100), comment TEXT NOT NULL DEFAULT '', updated_by TEXT NOT NULL REFERENCES school_users(id), updated_at INTEGER NOT NULL, PRIMARY KEY(lesson_id,student_id,skill));
CREATE TABLE school_assignments (id TEXT PRIMARY KEY, group_id TEXT NOT NULL REFERENCES school_groups(id), title TEXT NOT NULL, instructions TEXT NOT NULL, checklist TEXT NOT NULL, skill TEXT NOT NULL, due_at TEXT NOT NULL, created_by TEXT NOT NULL REFERENCES school_users(id), created_at INTEGER NOT NULL);
CREATE INDEX school_assignments_group ON school_assignments(group_id);
CREATE TABLE school_submissions (assignment_id TEXT NOT NULL REFERENCES school_assignments(id) ON DELETE CASCADE, student_id TEXT NOT NULL REFERENCES school_users(id), answer TEXT NOT NULL DEFAULT '', completed TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL CHECK(status IN ('draft','submitted','reviewed','returned')), score INTEGER CHECK(score BETWEEN 0 AND 100), feedback TEXT NOT NULL DEFAULT '', submitted_at INTEGER, reviewed_by TEXT REFERENCES school_users(id), updated_at INTEGER NOT NULL, PRIMARY KEY(assignment_id,student_id));
CREATE TABLE school_skill_levels (user_id TEXT NOT NULL REFERENCES school_users(id), skill TEXT NOT NULL, level TEXT NOT NULL, assessed_by TEXT NOT NULL REFERENCES school_users(id), updated_at INTEGER NOT NULL, PRIMARY KEY(user_id,skill));
CREATE TABLE school_media (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES school_users(id), kind TEXT NOT NULL CHECK(kind IN ('avatar','banner')), mime TEXT NOT NULL, data TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE school_audit (id TEXT PRIMARY KEY, actor_id TEXT NOT NULL REFERENCES school_users(id), action TEXT NOT NULL, detail TEXT NOT NULL, created_at INTEGER NOT NULL);
