import React, { useState, useEffect } from 'react';
import { FileBarChart, Calendar, RefreshCw, Download, FileText, Filter, Check } from 'lucide-react';
import { Project, Unit, Defect } from '../../services/mockDb';
import { projectsApi, defectsApi, unitsApi } from '../../api/services';
import { PageLoading, ButtonLoading } from '../../components/LoadingState';

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Report Generation State
  const [selectedReport, setSelectedReport] = useState('defects');
  const [selectedProject, setSelectedProject] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCsv, setGeneratedCsv] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const p = await projectsApi.getProjects();
      setProjects(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setGeneratedCsv(null);
    
    try {
      // Simulate API latency for report generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let csvContent = '';
      if (selectedReport === 'defects') {
        const defects = await defectsApi.getDefects();
        const filtered = selectedProject === 'all' ? defects : defects.filter(d => d.projectId === selectedProject);
        
        csvContent = 'ID,Title,Location,Severity,Status,Contractor\n';
        filtered.forEach(d => {
          csvContent += `${d.id},"${d.title}","${d.location}",${d.severity},${d.status},${d.contractorId}\n`;
        });
      } else if (selectedReport === 'units') {
        const units = await unitsApi.getUnits();
        const filtered = selectedProject === 'all' ? units : units.filter(u => u.projectId === selectedProject);
        
        csvContent = 'ID,Name,Status,InspectionStatus,DocsCleared,PaymentCleared,DefectsCleared\n';
        filtered.forEach(u => {
          csvContent += `${u.id},${u.name},${u.status},${u.inspectionStatus},${u.docsCleared},${u.paymentCleared},${u.defectsCleared}\n`;
        });
      }
      
      setGeneratedCsv(csvContent);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedCsv) return;
    const blob = new Blob([generatedCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <PageLoading message="Loading reports module..." />;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '48px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0' }}>Report Generator</h1>
          <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginTop: '4px' }}>
            Generate and export operations data.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
        
        {/* Left Col: Configurator */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--admin-border)', padding: '24px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--admin-navy)', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} /> CONFIGURATION
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Report Type</label>
              <select 
                value={selectedReport}
                onChange={e => setSelectedReport(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'white' }}
              >
                <option value="defects">Defects & Snags Audit</option>
                <option value="units">Unit Handover Readiness</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Project Target</label>
              <select 
                value={selectedProject}
                onChange={e => setSelectedProject(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'white' }}
              >
                <option value="all">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <button 
              className="btn-primary" 
              style={{ justifyContent: 'center', marginTop: '16px' }}
              disabled={isGenerating}
              onClick={handleGenerateReport}
            >
              {isGenerating ? <ButtonLoading label="Processing..." /> : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Right Col: Preview & Download */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--admin-border)', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--admin-navy)', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> PREVIEW</div>
            {generatedCsv && (
              <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleDownload}>
                <Download size={14} /> Export CSV
              </button>
            )}
          </h3>

          {!generatedCsv && !isGenerating ? (
            <div style={{ textAlign: 'center', padding: '64px', color: 'var(--admin-text-secondary)' }}>
              <FileBarChart size={32} style={{ opacity: 0.5, marginBottom: '16px' }} />
              <div style={{ fontSize: '14px' }}>Select options and generate a report to preview data.</div>
            </div>
          ) : isGenerating ? (
            <div style={{ textAlign: 'center', padding: '64px' }}>
              <PageLoading message="Compiling data from modules..." />
            </div>
          ) : (
            <div style={{ backgroundColor: '#1E293B', color: '#E2E8F0', padding: '16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflowX: 'auto', maxHeight: '400px' }}>
              {generatedCsv}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Reports;
