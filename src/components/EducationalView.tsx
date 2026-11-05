import React, { useState } from 'react';
import { UnitSystem } from '../types/survey';
import { EXPERIMENTS_LIST } from '../services/experimentsData';
import { formatWithUnit } from '../services/mathEngine';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  BookmarkPlus,
  HelpCircle,
  Play
} from 'lucide-react';

interface EducationalViewProps {
  unit: UnitSystem;
  onSaveMeasurement: (record: any) => void;
}

export const EducationalView: React.FC<EducationalViewProps> = ({ unit, onSaveMeasurement }) => {
  const [selectedExpId, setSelectedExpId] = useState<string>('exp_1');
  const [experimentInputs, setExperimentInputs] = useState<Record<string, Record<string, number>>>(() => {
    const initial: Record<string, Record<string, number>> = {};
    EXPERIMENTS_LIST.forEach((exp) => {
      initial[exp.id] = {};
      exp.requiredInputs.forEach((inp) => {
        initial[exp.id][inp.key] = inp.defaultValue;
      });
    });
    return initial;
  });

  const activeExp = EXPERIMENTS_LIST.find((e) => e.id === selectedExpId) || EXPERIMENTS_LIST[0];
  const currentInputs = experimentInputs[activeExp.id] || {};

  const handleInputChange = (key: string, val: number) => {
    setExperimentInputs((prev) => ({
      ...prev,
      [activeExp.id]: {
        ...prev[activeExp.id],
        [key]: val,
      },
    }));
  };

  const outcome = activeExp.calculate(currentInputs);

  return (
    <div className="space-y-4 pb-20">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
              EDUCATIONAL EXPLORATION LAB • 8 GUIDED EXPERIMENTS
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-cyan-300 border border-zinc-700">
              Science & Practical STEM
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Understand mathematical principles through real-world experiments and error analysis.
          </p>
        </div>

        <span className="text-xs font-mono text-emerald-400">
          8/8 Experiments Available
        </span>
      </div>

      {/* Horizontal Experiment Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {EXPERIMENTS_LIST.map((exp, idx) => (
          <button
            key={exp.id}
            onClick={() => setSelectedExpId(exp.id)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-mono transition-all text-left border ${
              selectedExpId === exp.id
                ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-md shadow-cyan-950/40'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80'
            }`}
          >
            <div className="text-[10px] opacity-75 font-semibold">EXP {idx + 1}</div>
            <div className="truncate max-w-[150px]">{exp.title.split(': ')[1]}</div>
          </button>
        ))}
      </div>

      {/* Active Experiment Main Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
            <GraduationCap className="w-4 h-4" />
            <span>{activeExp.category.toUpperCase()} • {activeExp.title}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            {activeExp.subtitle}
          </h2>
          <p className="text-xs text-zinc-300 mt-2 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 font-mono">
            🎯 <strong>Objective:</strong> {activeExp.objective}
          </p>
        </div>

        {/* Interactive Experiment Inputs */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 mb-3 flex items-center gap-1.5">
            <span>EXPERIMENTAL MEASUREMENT INPUTS</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeExp.requiredInputs.map((inp) => (
              <div key={inp.key} className="bg-zinc-900/70 p-3 rounded-xl border border-zinc-800">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-300 truncate">{inp.label}</span>
                  <span className="text-cyan-400 font-bold">
                    {currentInputs[inp.key]} {inp.unit}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min={inp.min}
                  max={inp.max}
                  value={currentInputs[inp.key] ?? inp.defaultValue}
                  onChange={(e) => handleInputChange(inp.key, parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
                <p className="text-[10px] text-zinc-500 font-mono mt-1 truncate">{inp.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Calculated Primary Result */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-emerald-500/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
              EXPERIMENTAL RESULT: {outcome.primaryLabel}
            </span>
            <div className="text-4xl font-mono font-bold text-white mt-1">
              {outcome.primaryValue.toFixed(3)} {outcome.primaryUnit}
            </div>
            {outcome.uncertainty > 0 && (
              <div className="text-xs font-mono text-zinc-400 mt-1">
                Estimated Uncertainty (σ): <strong className="text-emerald-400">±{outcome.uncertainty.toFixed(3)} {outcome.primaryUnit}</strong>
              </div>
            )}
          </div>

          <button
            onClick={() =>
              onSaveMeasurement({
                projectId: 'proj_default',
                title: `${activeExp.title.split(':')[0]}: ${outcome.primaryLabel}`,
                type: 'TWO_ANGLE_HEIGHT',
                method: 'MANUAL_MATH',
                horizontalDistance: currentInputs['distance'] || currentInputs['run'] || 20,
                verticalHeight: outcome.primaryValue,
                baseAngle: currentInputs['baseAngle'] || 0,
                topAngle: currentInputs['topAngle'] || 0,
                slopeDistance: outcome.primaryValue * 1.2,
                enuX: 0,
                enuY: 0,
                enuZ: outcome.primaryValue,
                instrumentHeight: 1.6,
                uncertainty: outcome.uncertainty,
                notes: `Guided Lab Experiment: ${activeExp.title}`,
                timestamp: Date.now(),
              })
            }
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono transition-colors shadow flex-shrink-0"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>Record in Lab Notebook</span>
          </button>
        </div>

        {outcome.warning && (
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{outcome.warning}</span>
          </div>
        )}

        {/* Step-by-Step Instructions & Solution Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Instructions */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" />
              <span>STEP-BY-STEP INSTRUCTIONS</span>
            </h4>
            <div className="space-y-1.5 text-xs text-zinc-300 font-mono">
              {activeExp.instructions.map((inst, i) => (
                <div key={i} className="py-1 border-b border-zinc-900 last:border-0">
                  {inst}
                </div>
              ))}
            </div>
          </div>

          {/* Mathematical Solution */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>MATHEMATICAL DEDUCTION</span>
            </h4>
            <div className="space-y-1.5 text-xs text-zinc-300 font-mono">
              {outcome.steps.map((st, i) => (
                <div
                  key={i}
                  className={`py-1 ${
                    i === 0 ? 'text-cyan-300 font-bold' : i === outcome.steps.length - 1 ? 'text-emerald-400 font-bold' : ''
                  }`}
                >
                  {st}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conceptual Explanation: Why the Math Works */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold uppercase">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>WHY THE MATHEMATICAL FORMULA WORKS (CONCEPTUAL FOUNDATION)</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            {activeExp.conceptualExplanation}
          </p>

          <div className="pt-2 border-t border-zinc-900 text-xs font-mono text-zinc-400">
            <span className="text-amber-400 font-semibold">Experimental Limitations: </span>
            {activeExp.limitations}
          </div>
        </div>
      </div>
    </div>
  );
};
