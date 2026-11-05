import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES, AndroidFileDefinition, createAndroidProjectZip } from '../services/androidExporter';
import {
  FolderCode,
  Download,
  Copy,
  Check,
  FileCode,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const AndroidProjectHub: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFileDefinition>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Gradle Build', 'Manifest & Res', 'Kotlin Math', 'Kotlin Sensors', 'Kotlin Database', 'Jetpack Compose UI'];

  const filteredFiles = activeCategory === 'All'
    ? ANDROID_PROJECT_FILES
    : ANDROID_PROJECT_FILES.filter((f) => f.category === activeCategory);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zipBlob = await createAndroidProjectZip();
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'XYZMeasure-AndroidStudio-Project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Title & 1-Click ZIP Exporter Banner */}
      <div className="bg-gradient-to-r from-emerald-950/90 via-zinc-900 to-cyan-950/80 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500 text-black font-bold uppercase">
                Complete Native Android Studio Project
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                Kotlin 2.0 • Jetpack Compose • Material 3 • Room
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1.5">
              XYZ Measure Android Studio Source & APK Compiler Hub
            </h2>
            <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
              Every file required to open, compile, and build the APK in Android Studio is ready. Click the button below to download the complete zipped project with Gradle wrappers, Room database, sensor fusion, and Compose UI!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black font-bold text-sm font-mono transition-all shadow-lg shadow-emerald-900/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className={`w-4 h-4 ${isZipping ? 'animate-bounce' : ''}`} />
              <span>{isZipping ? 'Packaging ZIP...' : 'Download Android Studio (.ZIP)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Build Guide Accordion */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 font-mono text-xs">
        <div className="flex items-center gap-2 text-zinc-200 font-bold mb-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>QUICK APK BUILD TERMINAL COMMANDS</span>
        </div>
        <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-zinc-300 space-y-1">
          <div className="text-zinc-500"># 1. Unzip and enter project directory</div>
          <div>cd XYZMeasure-AndroidStudio</div>
          <div className="text-zinc-500 mt-2"># 2. Compile and assemble debug APK</div>
          <div className="text-emerald-400 font-bold">./gradlew assembleDebug</div>
          <div className="text-zinc-500 mt-2"># 3. Output APK location:</div>
          <div className="text-cyan-300">app/build/outputs/apk/debug/app-debug.apk</div>
        </div>
      </div>

      {/* File Category Filter */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-mono">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              activeCategory === cat
                ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: File Tree List */}
        <div className="lg:col-span-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 space-y-1.5 max-h-[550px] overflow-y-auto">
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider px-2 py-1 font-semibold">
            PROJECT SOURCE TREE ({filteredFiles.length} files)
          </div>
          {filteredFiles.map((file) => {
            const isSelected = selectedFile.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono transition-all flex flex-col gap-0.5 border ${
                  isSelected
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60 shadow-sm'
                    : 'bg-zinc-950/60 text-zinc-300 border-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate font-semibold">
                  <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-cyan-400' : 'text-zinc-500'}`} />
                  <span className="truncate">{file.path}</span>
                </div>
                <div className="text-[10px] text-zinc-500 truncate pl-5">
                  {file.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-8 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-xl">
          {/* Code Viewer Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono">
            <div className="flex items-center gap-2 truncate">
              <span className="text-zinc-400 truncate">{selectedFile.path}</span>
              <span className="px-2 py-0.5 rounded bg-zinc-950 text-cyan-400 border border-zinc-800 text-[10px]">
                {selectedFile.category}
              </span>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Code Body */}
          <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto max-h-[500px] leading-relaxed selection:bg-cyan-500 selection:text-black">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
