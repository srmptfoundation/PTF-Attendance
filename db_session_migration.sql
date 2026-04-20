-- ============================================================
-- PTF Attendance: Dual-Session Migration
-- Add morning / afternoon session support to attendance table
-- ============================================================

-- 1. Add session column (defaults to 'morning' so existing rows are non-null)
ALTER TABLE attendance
  ADD COLUMN session TEXT NOT NULL DEFAULT 'morning'
  CHECK (session IN ('morning', 'afternoon'));

-- 2. Drop the old unique constraint (student_id + date)
--    Find the real constraint name in Supabase Dashboard > Table Editor > attendance > Constraints
--    and replace 'attendance_student_id_date_key' below with the actual name.
ALTER TABLE attendance
  DROP CONSTRAINT IF EXISTS attendance_student_id_date_key;

-- 3. Add new unique constraint: one record per student per date per session
ALTER TABLE attendance
  ADD CONSTRAINT attendance_student_id_date_session_key
  UNIQUE (student_id, date, session);

-- 4. Index for fast date+session queries
CREATE INDEX IF NOT EXISTS idx_attendance_date_session
  ON attendance (date, session);

-- ============================================================
-- Verify
-- ============================================================
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'attendance';
