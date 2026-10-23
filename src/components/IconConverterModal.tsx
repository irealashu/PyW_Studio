import React, { useState } from 'react';
import { X, Image, Download, Check, Sparkles, Layers, ShieldCheck } from 'lucide-react';

interface IconConverterModalProps {
  onClose: () => void;
  onApplyIcon: (iconPath: string) => void;
}

const PRESET_ICONS = [
  { id: 'calc', name: 'Calculator Blue', iconEmoji: '🧮', color: 'bg-sky-600', path: 'assets/calculator.ico' },
  { id: 'arcade', name: 'Retro Arcade', iconEmoji: '🎮', color: 'bg-purple-600', path: 'assets/arcade.ico' },
  { id: 'cleaner', name: 'System Gear', iconEmoji: '⚙️', color: 'bg-emerald-600', path: 'assets/cleaner.ico' },
  { id: 'terminal', name: 'Python Terminal', iconEmoji: '⚡', color: 'bg-amber-600', path: 'assets/app.ico' },
  { id: 'rocket', name: 'Fast App', iconEmoji: '🚀', color: 'bg-rose-600', path: 'assets/rocket.ico' },
  { id: 'shield', name: 'Secure Utility', iconEmoji: '🛡️', color: 'bg-indigo-600', path: 'assets/shield.ico' },
];

export const IconConverterModal: React.FC<IconConverterModalProps> = ({
  onClose,
  onApplyIcon,
}) => {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_ICONS[3]);
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    onApplyIcon(selectedPreset.path);
    setApplied(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Windows Executable Icon (.ico) Converter & Inspector
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6 text-xs text-slate-300">
          <div>
            <span className="font-semibold text-slate-200 block mb-2">
              Select or Customize Windows Application Icon
            </span>
            <p className="text-[11px] text-slate-400 mb-3">
              Windows executables require multi-resolution ICO containers containing 16x16, 32x32, 48x48, and 256x256 layers.
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              {PRESET_ICONS.map((preset) => {
                const isSelected = preset.id === selectedPreset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset)}
                    className={`p-3 rounded-lg border cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
                      isSelected
                        ? 'bg-sky-950/40 border-sky-500 shadow-md'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${preset.color} text-white shadow-sm mb-1.5`}
                    >
                      {preset.iconEmoji}
                    </div>
                    <span className="text-[11px] font-bold text-slate-200">{preset.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">{preset.path}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multi-Resolution Layers Inspector */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                PE32+ RT_ICON Resource Previews
              </span>
              <span className="text-emerald-400 font-mono text-[10px]">RGBA 32-bit</span>
            </div>

            <div className="flex items-end justify-around gap-2 pt-2 border-t border-slate-800/80">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-16 h-16 rounded-lg ${selectedPreset.color} flex items-center justify-center text-2xl shadow-md`}
                >
                  {selectedPreset.iconEmoji}
                </div>
                <span className="text-[10px] font-mono text-slate-400">256x256</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-12 h-12 rounded-lg ${selectedPreset.color} flex items-center justify-center text-xl shadow-md`}
                >
                  {selectedPreset.iconEmoji}
                </div>
                <span className="text-[10px] font-mono text-slate-400">48x48</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-md ${selectedPreset.color} flex items-center justify-center text-sm shadow-sm`}
                >
                  {selectedPreset.iconEmoji}
                </div>
                <span className="text-[10px] font-mono text-slate-400">32x32</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-5 h-5 rounded ${selectedPreset.color} flex items-center justify-center text-[10px] shadow-xs`}
                >
                  {selectedPreset.iconEmoji}
                </div>
                <span className="text-[10px] font-mono text-slate-400">16x16</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Target: <code className="text-sky-300">{selectedPreset.path}</code>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {applied ? <Check className="w-3.5 h-3.5 text-white" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{applied ? 'Applied to Profile!' : 'Set as Project Icon'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
