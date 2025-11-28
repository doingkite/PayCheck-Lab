import React from "react";

interface Option { value: string; label: string; }

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange }) => {
  return (
    <div className="inline-flex bg-gray-100 rounded-lg p-1">
      {options.map((opt) => (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${value === opt.value ? "bg-white text-primary-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
