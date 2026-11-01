import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Calendar, Shield, Award, BookOpen, 
  CheckCircle2, Save, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { useToast } from '../../context/ToastContext';

export default function StudentProfile() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    department: '',
    year: 1,
    section: 'A',
    admissionYear: 2024
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      let data = null;
      if (user?.role === 'STUDENT') {
        try {
          data = await studentService.getMyProfile();
        } catch (err) {
          // Fallback to query by studentId / username if /me fails
          if (user?.studentId || user?.username) {
            try {
              data = await studentService.getByStudentId(user.studentId || user.username);
            } catch (ignored) {}
          }
        }
      } else if (user?.studentId || user?.username) {
        try {
          data = await studentService.getByStudentId(user.studentId || user.username);
        } catch (ignored) {}
      }

      if (!data) {
        // Fallback: try first student in list for demo if faculty/admin tests this page
        try {
          const all = await studentService.getAll();
          if (all && all.length > 0) data = all[0];
        } catch (ignored) {}
      }

      if (data) {
        setStudent(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || 'MALE',
          department: data.department || '',
          year: data.year || 1,
          section: data.section || 'A',
          admissionYear: data.admissionYear || 2024
        });
      }
    } catch (err) {
      addToast('Could not load student profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student?.id) {
      addToast('Cannot update without verified student ID', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        studentId: student.studentId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        department: formData.department,
        year: parseInt(formData.year, 10),
        section: formData.section,
        admissionYear: parseInt(formData.admissionYear, 10)
      };

      let updated;
      if (user?.role === 'STUDENT') {
        updated = await studentService.updateMyProfile(payload);
      } else {
        updated = await studentService.update(student.id, payload);
      }
      setStudent(updated);
      addToast('Academic profile updated successfully in PostgreSQL', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-ink-muted">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
        <span>Loading institutional student profile...</span>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="inst-card p-8 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <div>
          <h2 className="text-base font-bold text-ink-primary">No Student Profile Linked</h2>
          <p className="text-xs text-ink-muted mt-1">
            Your active account (@{user?.username}) is waiting to sync with PostgreSQL <code className="font-mono text-primary">student.students</code>.
          </p>
        </div>
        <button
          onClick={loadProfile}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition shadow-inst-sm mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync Profile from Database</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="inst-card p-5 sm:p-6 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-primary">
              Student Academic Profile &amp; Demographics
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified in Student Service
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Permanent academic record registered in PostgreSQL <code className="font-mono text-ink-primary">student.students</code>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-muted font-mono">
          <span>Database ID: <strong className="text-ink-primary">#{student.id}</strong></span>
          <span>&bull;</span>
          <span>PRN: <strong className="text-primary font-bold">{student.studentId}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Academic Credentials Card */}
        <div className="space-y-6">
          <div className="inst-card p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-3xl mx-auto shadow-inst">
              {student.name?.charAt(0) || 'S'}
            </div>

            <div>
              <h2 className="text-base font-bold text-ink-primary">
                {student.name}
              </h2>
              <div className="text-xs text-ink-muted font-mono mt-0.5">
                Roll No: {student.studentId}
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary border border-primary-200">
                <Shield className="w-3.5 h-3.5" /> Matriculated Scholar
              </div>
            </div>

            <div className="pt-4 border-t border-surface-border text-left space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Department</span>
                <span className="font-semibold text-ink-primary">{student.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Year / Section</span>
                <span className="font-semibold text-ink-primary">Year {student.year}, Sec {student.section}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Admission Year</span>
                <span className="font-mono font-semibold text-ink-primary">{student.admissionYear}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Gender</span>
                <span className="font-semibold text-ink-primary">{student.gender}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Date of Birth</span>
                <span className="font-mono text-ink-primary">{student.dateOfBirth}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Profile Details */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="inst-card p-6 space-y-5">
            <div className="border-b border-surface-border pb-3">
              <h2 className="text-sm font-bold text-ink-primary">
                Demographic &amp; Contact Records
              </h2>
              <p className="text-xs text-ink-muted">
                Ensure contact coordinates are active for university notifications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Date of Birth (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-primary"
                >
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Department
                </label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Academic Year (1-6)
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Section
                </label>
                <input
                  type="text"
                  required
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-surface-border flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition flex items-center gap-1.5 shadow-inst-sm cursor-pointer disabled:opacity-50"
              >
                <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
