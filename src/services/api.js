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
  mark: async (attendanceData) => {
    if (!attendanceData || attendanceData.length === 0) return formatResponse({ message: 'Success' });
    
    // Ensure all records have the marked_by user ID properly
    const { user } = useAuthStore.getState();
    
    if (!user || !user.id) {
      throw new Error("Security Violation: Action denied. Active session required to mutate database records.");
    }

    const records = attendanceData.map(record => ({
      ...record,
      marked_by: user.id
    }));

    const date = records[0].date;
    const studentIds = records.map(r => r.student_id);

    // Delete existing for these students on this date
    await supabase
      .from('attendance')
      .delete()
      .eq('date', date)
      .in('student_id', studentIds);

    const { data, error } = await supabase
      .from('attendance')
      .insert(records)
      .select();
    if (error) throw error;
    return formatResponse(data);
  },
  getByDate: async (date) => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, students(full_name, class)')
      .eq('date', date);
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

    // Attendance Today
    const { data: attendanceToday, error: attendanceError } = await supabase
      .from('attendance')
      .select('status')
      .eq('date', today);
    if (attendanceError) throw attendanceError;

    // Recent Activity (Last 5 records)
    const { data: recentActivity, error: recentError } = await supabase
      .from('attendance')
      .select('status, date, students(full_name)')
      .order('created_at', { ascending: false })
      .limit(5);
    if (recentError) throw recentError;

    const summary = {
      totalStudents: totalStudents || 0,
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
      .select('student_id, date, status')
      .gte('date', startStr)
      .lte('date', endStr);
    if (attendanceError) throw attendanceError;

    // Process data for CSV
    let csv = "ID,Full Name,Class,Present,Absent,Permission,Attendance %\n";
    
    students.forEach(student => {
      const studentAttendance = attendance.filter(a => a.student_id === student.id);
      const present = studentAttendance.filter(a => a.status === 'present').length;
      const absent = studentAttendance.filter(a => a.status === 'absent').length;
      const permission = studentAttendance.filter(a => a.status === 'permission').length;
      const totalDays = present + absent + permission;
      const percentage = totalDays > 0 ? ((present / totalDays) * 100).toFixed(2) + '%' : 'N/A';

      const idStr = student.id.substring(0, 8);
      // Basic CSV escaping for full_name and class just in case
      let safeFullName = student.full_name ? `"${student.full_name.replace(/"/g, '""')}"` : '""';
      let safeClass = student.class ? `"${student.class.replace(/"/g, '""')}"` : '""';

      csv += `${idStr},${safeFullName},${safeClass},${present},${absent},${permission},${percentage}\n`;
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
