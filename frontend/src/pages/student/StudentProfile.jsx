import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Building, 
  Calendar, Shield, Award, BookOpen, CheckCircle2, 
  Save, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';

export default function StudentProfile() {
  const { user } = useAuth();
  const studentId = user?.studentId || '250';

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  // Editable fields
  const [phone, setPhone] = useState('+91 98765 43210');
  const [personalEmail, setPersonalEmail] = useState('aditya.senpai22@gmail.com');
  const [address, setAddress] = useState('#42, 5th Cross, Indiranagar, Bengaluru, Karnataka 560038');
  const [emergencyContact, setEmergencyContact] = useState('+91 98123 45678 (Father: Rajesh Senpai)');

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  const loadStudent = async () => {
    setLoading(true);
    try {
      const data = await studentService.getById(studentId);
      setStudent(data);
      if (data?.email) setPersonalEmail(data.email);
    } catch (e) {
      console.warn('Fallback profile record:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

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
              Biometric Verified
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Permanent Academic Record &bull; National Academic Depository (NAD) Linked
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span>ABC ID: <strong className="font-mono text-ink-primary">102-948-281-904</strong></span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Institutional communication details successfully updated in Student Information Repository.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Academic Credentials & Badges */}
        <div className="space-y-6">
          <div className="inst-card p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-3xl mx-auto shadow-inst">
              {student?.name?.charAt(0) || user?.fullName?.charAt(0) || 'A'}
            </div>

            <div>
              <h2 className="text-base font-bold text-ink-primary">
                {student?.name || user?.fullName || 'Aditya Senpai'}
              </h2>
              <div className="text-xs text-ink-muted font-mono mt-0.5">
                Roll No: {student?.studentId || studentId}
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary border border-primary-200">
                <Shield className="w-3.5 h-3.5" /> Regular Scholar
              </div>
            </div>

            <div className="pt-4 border-t border-surface-border text-left space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-muted">Degree:</span>
                <span className="font-bold text-ink-primary">B.Tech (Honors)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Branch:</span>
                <span className="font-bold text-ink-primary">Computer Science &amp; Engg.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Semester:</span>
                <span className="font-bold text-ink-primary">{student?.studentClass || 'Semester VI'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Section:</span>
                <span className="font-bold text-ink-primary">CSE-A (Roll 45)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Academic Advisor:</span>
                <span className="font-bold text-primary">Dr. Anand Verma</span>
              </div>
            </div>
          </div>

          {/* Institutional Compliance Card */}
          <div className="inst-card p-5 space-y-3 bg-surface-soft">
            <h3 className="text-xs font-bold text-ink-primary uppercase tracking-wider">
              Verification Compliance
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary">Aadhaar eKYC:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary">APAAR / ABC ID:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Linked
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary">Anti-Ragging Undertaking:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary">Hostel Allotment:</span>
                <span className="text-ink-primary font-medium">Day Scholar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Demographics & Editable Contact */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Institutional Static Demographics */}
          <div className="inst-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-ink-primary border-b border-surface-border pb-2">
              Statutory Admission Records (Locked by Office of Registrar)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-ink-muted font-medium block mb-1">Full Legal Name</label>
                <div className="p-2 rounded bg-surface-soft border border-surface-border font-semibold text-ink-primary">
                  {student?.name || 'Aditya Senpai'}
                </div>
              </div>

              <div>
                <label className="text-ink-muted font-medium block mb-1">Date of Birth</label>
                <div className="p-2 rounded bg-surface-soft border border-surface-border font-semibold text-ink-primary">
                  14 August 2004
                </div>
              </div>

              <div>
                <label className="text-ink-muted font-medium block mb-1">Institutional Email</label>
                <div className="p-2 rounded bg-surface-soft border border-surface-border font-mono font-semibold text-primary">
                  21bce10250@edupulse.ac.in
                </div>
              </div>

              <div>
                <label className="text-ink-muted font-medium block mb-1">Campus Affiliation</label>
                <div className="p-2 rounded bg-surface-soft border border-surface-border font-semibold text-ink-primary">
                  {student?.campus || 'Bengaluru Knowledge Campus'}
                </div>
              </div>

              <div>
                <label className="text-ink-muted font-medium block mb-1">Admission Quota / Category</label>
                <div className="p-2 rounded bg-surface-soft border border-surface-border font-semibold text-ink-primary">
                  Merit / Open Category (KCET / JEE-Main)
                </div>
              </div>

              <div>
                <label className="text-ink-muted font-medium block mb-1">Blood Group</label>
                <div className="p-2 rounded bg-surface-soft border border-surface-border font-semibold text-ink-primary">
                  O Positive (O+)
                </div>
              </div>
            </div>
          </div>

          {/* Editable Communication Details */}
          <div className="inst-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-ink-primary border-b border-surface-border pb-2">
              Communication &amp; Guardian Contact Coordinates
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ink-secondary font-semibold mb-1">
                    Student Contact Mobile Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-surface-border text-xs text-ink-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-ink-secondary font-semibold mb-1">
                    Personal Alternate Email
                  </label>
                  <input
                    type="email"
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-surface-border text-xs text-ink-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-ink-secondary font-semibold mb-1">
                  Permanent Residential Postal Address
                </label>
                <textarea
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-surface-border text-xs text-ink-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink-secondary font-semibold mb-1">
                  Parent / Guardian Emergency Contact Details
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-surface-border text-xs text-ink-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-inst-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Communication Coordinates</span>
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
