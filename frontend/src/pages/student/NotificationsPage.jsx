import React, { useState } from 'react';
import { 
  Bell, CheckCircle2, AlertTriangle, Calendar, 
  FileText, Shield, Award, Filter, Search 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead } = useApp();
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Comprehensive official notifications list
  const institutionalNotices = [
    {
      id: 'notif-1',
      title: 'End-Semester Theory Examination Schedule Published',
      category: 'EXAMINATION',
      authority: 'Controller of Examinations',
      date: '20-Mar-2026',
      time: '10:30 AM',
      unread: true,
      priority: 'HIGH',
      content: 'The finalized timetable for B.Tech Semester VI Even Term Examinations (May-June 2026) has been ratified by the Academic Council. Hall tickets will be issued via the portal from 15th April 2026 to students maintaining >=75% statutory attendance.'
    },
    {
      id: 'notif-2',
      title: 'Attendance Shortage Alert: Computer Networks (CS605)',
      category: 'ATTENDANCE',
      authority: 'Department of Computer Science',
      date: '19-Mar-2026',
      time: '04:15 PM',
      unread: true,
      priority: 'HIGH',
      content: 'Your current attendance percentage in Computer Networks & Security (CS605) is 73.5%, which is below the mandatory 75% cutoff. You are advised to attend all upcoming lectures and submit condonation documentation to your HOD immediately.'
    },
    {
      id: 'notif-3',
      title: 'Consolidated Semester V Transcripts Available on DigiLocker / NAD',
      category: 'ACADEMIC',
      authority: 'National Academic Depository Cell',
      date: '16-Mar-2026',
      time: '02:00 PM',
      unread: false,
      priority: 'NORMAL',
      content: 'Digital transcripts for Semester V have been pushed to your APAAR / ABC ID account. You may download digitally signed transcripts for higher education or internship applications.'
    },
    {
      id: 'notif-4',
      title: 'Symposium Call for Papers: National Conclave on Cloud Computing',
      category: 'GENERAL',
      authority: 'Dean of Research & Innovation',
      date: '14-Mar-2026',
      time: '11:45 AM',
      unread: false,
      priority: 'NORMAL',
      content: 'Undergraduate scholars are invited to submit research papers on microservices, event streaming, and cloud architectures. Selected papers will be indexed in IEEE Xplore.'
    },
    {
      id: 'notif-5',
      title: 'Internal Assessment (Test-2) Marks Uploaded',
      category: 'ACADEMIC',
      authority: 'Faculty of Engineering',
      date: '10-Mar-2026',
      time: '05:30 PM',
      unread: false,
      priority: 'NORMAL',
      content: 'Continuous internal assessment scores for Algorithms, DBMS, and Microservices have been published. Grievances regarding scoring must be registered within 3 business days.'
    }
  ];

  const filteredNotices = institutionalNotices.filter((n) => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.authority.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'ALL') return true;
    return n.category === filterType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="inst-card p-5 sm:p-6 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink-primary">
              Institutional Circulars &amp; Official Notifications
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-50 text-primary border border-primary-200">
              Registrar &amp; CoE Dispatch
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Official academic circulars, exam notifications, and statutory attendance notices
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-muted">
            Academic Session 2025-26
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="inst-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'EXAMINATION', 'ATTENDANCE', 'ACADEMIC', 'GENERAL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterType === cat
                  ? 'bg-primary text-white shadow-inst-sm'
                  : 'bg-surface-soft text-ink-secondary hover:bg-surface-alt'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-surface-border text-xs text-ink-primary placeholder-ink-light focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {filteredNotices.map((notice) => (
          <div
            key={notice.id}
            className={`inst-card p-5 transition ${
              notice.unread ? 'border-l-4 border-l-secondary bg-surface' : 'bg-surface-soft'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  notice.category === 'ATTENDANCE'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : notice.category === 'EXAMINATION'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-primary-50 text-primary border border-primary-200'
                }`}>
                  {notice.category}
                </span>
                <span className="text-xs font-semibold text-ink-muted">
                  Issued by: <strong className="text-ink-secondary">{notice.authority}</strong>
                </span>
              </div>

              <div className="text-[11px] text-ink-muted flex items-center gap-2">
                <span>{notice.date} at {notice.time}</span>
                {notice.unread && (
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                )}
              </div>
            </div>

            <h3 className="text-sm font-bold text-ink-primary">
              {notice.title}
            </h3>

            <p className="text-xs text-ink-secondary leading-relaxed mt-2">
              {notice.content}
            </p>

            <div className="mt-3 pt-3 border-t border-surface-border flex items-center justify-between text-xs">
              <span className="text-[11px] text-ink-muted">
                Official Institutional Dispatch &bull; Reference Ref: EDU/CIR/2026/04
              </span>
              <button
                onClick={() => markNotificationAsRead(notice.id)}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Acknowledge Receipt
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
