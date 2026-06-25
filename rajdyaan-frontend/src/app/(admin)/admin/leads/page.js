'use client';

import { useState, useEffect } from 'react';
import styles from './leads.module.css';

const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

export default function LeadsPage() {
  const [b2bLeads, setB2bLeads] = useState([]);
  const [contactLeads, setContactLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('b2b');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    try {
      if (!GOOGLE_SCRIPT_URL) {
        throw new Error('Google Script URL not configured. Set NEXT_PUBLIC_GOOGLE_SCRIPT_URL in .env.local');
      }
      const res = await fetch(GOOGLE_SCRIPT_URL);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to fetch leads');
      setB2bLeads((json.data?.b2b || []).reverse());
      setContactLeads((json.data?.contact || []).reverse());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Filter by search term
  const filteredB2b = b2bLeads.filter((lead) => {
    const term = searchTerm.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(term) ||
      lead.businessName?.toLowerCase().includes(term) ||
      lead.email?.toLowerCase().includes(term) ||
      lead.phone?.toString().includes(term) ||
      lead.product?.toLowerCase().includes(term)
    );
  });

  const filteredContact = contactLeads.filter((lead) => {
    const term = searchTerm.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(term) ||
      lead.email?.toLowerCase().includes(term) ||
      lead.phone?.toString().includes(term) ||
      lead.subject?.toLowerCase().includes(term)
    );
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>📋 Lead Management</h1>
          <p className={styles.subtitle}>All enquiries from B2B and Contact forms</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchLeads} disabled={loading}>
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{b2bLeads.length}</span>
          <span className={styles.statLabel}>B2B Enquiries</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{contactLeads.length}</span>
          <span className={styles.statLabel}>Contact Messages</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{b2bLeads.length + contactLeads.length}</span>
          <span className={styles.statLabel}>Total Leads</span>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className={styles.controlsRow}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'b2b' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('b2b')}
          >
            B2B Enquiries ({filteredB2b.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'contact' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact Messages ({filteredContact.length})
          </button>
        </div>
        <input
          type="text"
          placeholder="Search leads..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className={styles.errorBox}>
          ⚠️ {error}
        </div>
      )}

      {/* B2B Table */}
      {activeTab === 'b2b' && (
        <div className={styles.tableWrap}>
          {filteredB2b.length === 0 && !loading ? (
            <div className={styles.emptyState}>No B2B enquiries found</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Timestamp</th>
                  <th>Name</th>
                  <th>Business</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {filteredB2b.map((lead, i) => (
                  <tr key={i}>
                    <td className={styles.tdIndex}>{i + 1}</td>
                    <td className={styles.tdTimestamp}>{lead.timestamp}</td>
                    <td className={styles.tdName}>{lead.name}</td>
                    <td>{lead.businessName}</td>
                    <td>
                      <a href={`tel:${lead.phone}`} className={styles.phoneLink}>{lead.phone}</a>
                    </td>
                    <td>
                      <a href={`mailto:${lead.email}`} className={styles.emailLink}>{lead.email}</a>
                    </td>
                    <td><span className={styles.productBadge}>{lead.product}</span></td>
                    <td>{lead.quantity}</td>
                    <td className={styles.tdMessage}>{lead.message || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Contact Table */}
      {activeTab === 'contact' && (
        <div className={styles.tableWrap}>
          {filteredContact.length === 0 && !loading ? (
            <div className={styles.emptyState}>No contact messages found</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Timestamp</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {filteredContact.map((lead, i) => (
                  <tr key={i}>
                    <td className={styles.tdIndex}>{i + 1}</td>
                    <td className={styles.tdTimestamp}>{lead.timestamp}</td>
                    <td className={styles.tdName}>{lead.name}</td>
                    <td>
                      <a href={`tel:${lead.phone}`} className={styles.phoneLink}>{lead.phone}</a>
                    </td>
                    <td>
                      <a href={`mailto:${lead.email}`} className={styles.emailLink}>{lead.email}</a>
                    </td>
                    <td><span className={styles.subjectBadge}>{lead.subject}</span></td>
                    <td className={styles.tdMessage}>{lead.message || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
