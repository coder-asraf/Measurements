import React, { useState } from 'react';
import { UnitSystem, MeasurementRecord, SurveyProject } from '../types/survey';
import {
  getProjects,
  saveProjects,
  getMeasurements,
  saveMeasurements,
  deleteMeasurement,
  exportToCSV
} from '../services/projectStorage';
import { formatWithUnit } from '../services/mathEngine';
import {
  BookOpen,
  FolderPlus,
  Download,
  Trash2,
  FileText,
  Printer,
  Calendar,
  MapPin,
  Compass,
  TrendingUp,
  Tag,
  Plus
} from 'lucide-react';

interface NotebookViewProps {
  unit: UnitSystem;
}

export const NotebookView: React.FC<NotebookViewProps> = ({ unit }) => {
  const [projects, setProjects] = useState<SurveyProject[]>(() => getProjects());
  const [activeProjectId, setActiveProjectId] = useState<string>('all');
  const [records, setRecords] = useState<MeasurementRecord[]>(() => getMeasurements());
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [newProjectDesc, setNewProjectDesc] = useState<string>('');
  const [showPrintReport, setShowPrintReport] = useState<boolean>(false);

  const filteredRecords = activeProjectId === 'all'
    ? records
    : records.filter((r) => r.projectId === activeProjectId);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const newProj: SurveyProject = {
      id: `proj_${Date.now()}`,
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      createdAt: Date.now(),
    };
    const updated = [newProj, ...projects];
    setProjects(updated);
    saveProjects(updated);
    setActiveProjectId(newProj.id);
    setNewProjectName('');
    setNewProjectDesc('');
    setShowNewProjectModal(false);
  };

  const handleDeleteRecord = (id: string) => {
    deleteMeasurement(id);
    setRecords(getMeasurements());
  };

  const handleExportCSV = () => {
    const csvContent = exportToCSV(filteredRecords);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `XYZ_Measure_Survey_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
              SCIENTIFIC MEASUREMENT NOTEBOOK & DATABASE
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-cyan-300 border border-zinc-700">
              Offline Persistence (Room API)
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Structured field observations with timestamps, ENU coordinates, and uncertainty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
            <span>New Project</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-cyan-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowPrintReport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Project Selector Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-mono">
        <button
          onClick={() => setActiveProjectId('all')}
          className={`px-3 py-1.5 rounded-xl border transition-all ${
            activeProjectId === 'all'
              ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow'
              : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          All Observations ({records.length})
        </button>
        {projects.map((proj) => (
          <button
            key={proj.id}
            onClick={() => setActiveProjectId(proj.id)}
            className={`px-3 py-1.5 rounded-xl border truncate max-w-[220px] transition-all ${
              activeProjectId === proj.id
                ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {proj.name}
          </button>
        ))}
      </div>

      {/* Observations Records List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 text-center text-zinc-400 font-mono text-xs">
            No measurement records found in this project. Use the Dashboard or Target Sight to log measurements!
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all shadow-md group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded bg-cyan-400" />
                  <h3 className="text-sm font-bold text-white font-sans">{rec.title}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-cyan-300 border border-zinc-700">
                    {rec.type}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                    {rec.method}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{new Date(rec.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </span>
                  <button
                    onClick={() => handleDeleteRecord(rec.id)}
                    className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3 text-xs font-mono">
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase">Vertical Height</span>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    {formatWithUnit(rec.verticalHeight, unit, 3)}
                  </div>
                  <span className="text-[10px] text-zinc-500">±{rec.uncertainty.toFixed(3)}m</span>
                </div>

                <div>
                  <span className="text-zinc-500 text-[10px] uppercase">Baseline Run</span>
                  <div className="text-lg font-bold text-cyan-300 mt-0.5">
                    {formatWithUnit(rec.horizontalDistance, unit, 3)}
                  </div>
                  <span className="text-[10px] text-zinc-500">Direct / Staked</span>
                </div>

                <div>
                  <span className="text-zinc-500 text-[10px] uppercase">Sighted Angles</span>
                  <div className="text-sm font-bold text-white mt-1">
                    Top: {rec.topAngle.toFixed(1)}° | Base: {rec.baseAngle.toFixed(1)}°
                  </div>
                  <span className="text-[10px] text-amber-400">Δθ = {(rec.topAngle - rec.baseAngle).toFixed(2)}°</span>
                </div>

                <div>
                  <span className="text-zinc-500 text-[10px] uppercase">ENU Displacement</span>
                  <div className="text-xs text-zinc-300 mt-1">
                    X: {rec.enuX.toFixed(1)}m | Y: {rec.enuY.toFixed(1)}m
                  </div>
                  <span className="text-[10px] text-purple-300">D_3D = {rec.slopeDistance.toFixed(2)}m</span>
                </div>
              </div>

              {rec.notes && (
                <div className="text-xs text-zinc-400 bg-zinc-950/70 p-2 rounded-lg border border-zinc-800/60 font-mono">
                  {rec.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal: New Project */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold font-mono uppercase text-white flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-cyan-400" />
              <span>Create New Survey Project</span>
            </h3>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Project Name</label>
              <input
                type="text"
                placeholder="e.g. West Campus Utility Tower Survey"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Description / Scope</label>
              <textarea
                placeholder="Brief project notes or site coordinates..."
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono shadow"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Printable Report */}
      {showPrintReport && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-700 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 my-8 text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold font-mono uppercase text-cyan-400">
                  XYZ MEASURE • FIELD SURVEY REPORT
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Generated {new Date().toLocaleString()} • ISO/IEC Guide 98-3 Error Model
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs font-mono shadow"
                >
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowPrintReport(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-mono"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="py-2">Item Title</th>
                    <th>Type</th>
                    <th>Distance (m)</th>
                    <th>Height (m)</th>
                    <th>Angles (Top/Base)</th>
                    <th>Uncertainty (σ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredRecords.map((r) => (
                    <tr key={r.id} className="text-zinc-200">
                      <td className="py-2 font-medium">{r.title}</td>
                      <td className="text-cyan-300">{r.type}</td>
                      <td>{r.horizontalDistance.toFixed(2)}</td>
                      <td className="text-emerald-400 font-bold">{r.verticalHeight.toFixed(3)}</td>
                      <td>{r.topAngle.toFixed(1)}° / {r.baseAngle.toFixed(1)}°</td>
                      <td className="text-amber-300">±{r.uncertainty.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
