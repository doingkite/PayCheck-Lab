import React from "react";

interface AlertCardProps {
  type: "success" | "warning" | "danger" | "info";
  title: string;
  children: React.ReactNode;
}

const AlertCard: React.FC<AlertCardProps> = ({ type, title, children }) => {
  const styles = {
    success: { bg: "bg-emerald-50", border: "border-emerald-200", title: "text-emerald-800", body: "text-emerald-700" },
    warning: { bg: "bg-amber-50", border: "border-amber-200", title: "text-amber-800", body: "text-amber-700" },
    danger: { bg: "bg-red-50", border: "border-red-200", title: "text-red-800", body: "text-red-700" },
    info: { bg: "bg-blue-50", border: "border-blue-200", title: "text-blue-800", body: "text-blue-700" },
  };
  const s = styles[type];

  return (
    <div className={`${s.bg} ${s.border} border rounded-xl p-4`}>
      <h4 className={`font-semibold ${s.title}`}>{title}</h4>
      <p className={`text-sm mt-1 ${s.body}`}>{children}</p>
    </div>
  );
};

export default AlertCard;
