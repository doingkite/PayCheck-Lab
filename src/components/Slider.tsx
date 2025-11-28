import React from "react";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  helperText?: string;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, step = 1, onChange, formatValue, helperText }) => {
  const displayValue = formatValue ? formatValue(value) : value.toString();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-primary-600">{displayValue}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
      {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};

export default Slider;
