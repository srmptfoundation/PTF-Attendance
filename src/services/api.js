import { format } from 'date-fns';
import { supabase } from '../config/supabase';
import useAuthStore from '../store/useAuthStore';

// Helper to format consistent { data } responses like Axios did
// to minimize changes needed in frontend components
const formatResponse = (data) => ({ data });

export const StudentService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('s_no', { ascending: true });
    if (error) throw error;
    return formatResponse(data);
  },
  create: async (student) => {
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select();
    if (error) throw error;
    return formatResponse(data && data.length > 0 ? data[0] : null);
  },
  update: async (id, studentInfo) => {
    const { data, error } = await supabase
      .from('students')
      .update(studentInfo)
      .eq('id', id)
      .select();
    if (error) throw error;
    return formatResponse(data && data.length > 0 ? data[0] : null);
  },
  delete: async (id) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return formatResponse({ message: 'Deleted' });
  },
};

export const AttendanceService = {
  mark: async (attendanceData, session) => {
    if (!attendanceData || attendanceData.length === 0) return formatResponse({ message: 'Success' });

    const { user } = useAuthStore.getState();

    if (!user || !user.id) {
      throw new Error("Security Violation: Action denied. Active session required to mutate database records.");
    }

    const records = attendanceData.map(record => ({
      ...record,
      session,
      marked_by: user.id
    }));

    const date = records[0].date;
    const studentIds = records.map(r => r.student_id);

    // Delete only this session's records — never touch the other session
    await supabase
      .from('attendance')
      .delete()
      .eq('date', date)
      .eq('session', session)
      .in('student_id', studentIds);

    const { data, error } = await supabase
      .from('attendance')
      .insert(records)
      .select();
    if (error) throw error;
    return formatResponse(data);
  },
  getByDate: async (date, session) => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, students(full_name, class)')
      .eq('date', date)
      .eq('session', session);
    if (error) throw error;
    return formatResponse(data);
  },
};

export const DashboardService = {
  getSummary: async () => {
    const today = format(new Date(), 'yyyy-MM-dd');

    // Total Students
    const { count: totalStudents, error: totalError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
    if (totalError) throw totalError;

    const activeSession = new Date().getHours() < 12 ? 'morning' : 'afternoon';

    // Attendance Today (current session only)
    const { data: attendanceToday, error: attendanceError } = await supabase
      .from('attendance')
      .select('status')
      .eq('date', today)
      .eq('session', activeSession);
    if (attendanceError) throw attendanceError;

    // Recent Activity (Last 5 records)
    const { data: recentActivity, error: recentError } = await supabase
      .from('attendance')
      .select('status, date, session, students(full_name)')
      .order('created_at', { ascending: false })
      .limit(5);
    if (recentError) throw recentError;

    const summary = {
      totalStudents: totalStudents || 0,
      activeSession,
      presentToday: attendanceToday.filter(a => a.status === 'present').length,
      absentToday: attendanceToday.filter(a => a.status === 'absent').length,
      permissionToday: attendanceToday.filter(a => a.status === 'permission').length,
      recentActivity: recentActivity || []
    };

    return formatResponse(summary);
  },
};


export const ReportService = {
  downloadMonthly: async (month, year) => {
    const startStr = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endStr = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id, full_name, class, s_no')
      .order('s_no', { ascending: true });
    if (studentError) throw studentError;

    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('student_id, date, session, status')
      .gte('date', startStr)
      .lte('date', endStr);
    if (attendanceError) throw attendanceError;

    // Process data for CSV — each session is a separate unit
    let csv = "ID,Full Name,Class,Morning Present,Morning Absent,Morning Permission,Afternoon Present,Afternoon Absent,Afternoon Permission,Overall %\n";

    students.forEach(student => {
      const sa = attendance.filter(a => a.student_id === student.id);
      const morning = sa.filter(a => a.session === 'morning');
      const afternoon = sa.filter(a => a.session === 'afternoon');

      const mPresent = morning.filter(a => a.status === 'present').length;
      const mAbsent = morning.filter(a => a.status === 'absent').length;
      const mPermission = morning.filter(a => a.status === 'permission').length;

      const aPresent = afternoon.filter(a => a.status === 'present').length;
      const aAbsent = afternoon.filter(a => a.status === 'absent').length;
      const aPermission = afternoon.filter(a => a.status === 'permission').length;

      const totalPresent = mPresent + aPresent;
      const totalSessions = sa.length;
      const percentage = totalSessions > 0 ? ((totalPresent / totalSessions) * 100).toFixed(2) + '%' : 'N/A';

      const idStr = student.id.substring(0, 8);
      let safeFullName = student.full_name ? `"${student.full_name.replace(/"/g, '""')}"` : '""';
      let safeClass = student.class ? `"${student.class.replace(/"/g, '""')}"` : '""';

      csv += `${idStr},${safeFullName},${safeClass},${mPresent},${mAbsent},${mPermission},${aPresent},${aAbsent},${aPermission},${percentage}\n`;
    });

    return formatResponse(new Blob([csv], { type: 'text/csv' }));
  },
  getLowAttendance: async (month, year) => {
    const startStr = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endStr = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id, full_name, class, department, s_no')
      .order('s_no', { ascending: true });
    if (studentError) throw studentError;

    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('student_id, date, status')
      .gte('date', startStr)
      .lte('date', endStr);
    if (attendanceError) throw attendanceError;

    const lowAttendanceStudents = [];

    students.forEach(student => {
      const studentAttendance = attendance.filter(a => a.student_id === student.id);
      const present = studentAttendance.filter(a => a.status === 'present').length;
      const absent = studentAttendance.filter(a => a.status === 'absent').length;
      const permission = studentAttendance.filter(a => a.status === 'permission').length;
      const totalDays = present + absent + permission;

      if (totalDays > 0) {
        const percentage = (present / totalDays) * 100;
        if (percentage < 75) {
          lowAttendanceStudents.push({
            id: student.id,
            name: student.full_name,
            class: student.class,
            department: student.department || '',
            present,
            absent,
            percentage: percentage.toFixed(2)
          });
        }
      }
    });

    return formatResponse(lowAttendanceStudents);
  }
};
