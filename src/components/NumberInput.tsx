import React from "react";

interface NumberInputProps {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  placeholder?: string;
  helperText?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label, value, onChange, placeholder, helperText, suffix, min, max, step = 1, error
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") { onChange(0); } else {
      const num = parseFloat(val);
      if (!isNaN(num)) { onChange(num); }
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input type="number" value={value === 0 ? "" : value} onChange={handleChange}
          placeholder={placeholder} min={min} max={max} step={step}
          className={`w-full px-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${error ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"} ${suffix ? "pr-12" : ""}`} />
        {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{suffix}</span>}
      </div>
      {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default NumberInput;
