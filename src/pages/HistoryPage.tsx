import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import { PayRecord } from "../types";
import { getRecords, deleteRecord } from "../utils/storage";
import { formatCurrency } from "../utils/calculations";

type FilterType = "all" | "employee" | "freelancer";

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<PayRecord[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => { setRecords(getRecords()); }, []);

  const filteredRecords = useMemo(() => filter === "all" ? records : records.filter((r) => r.type === filter), [records, filter]);

  const thisMonth = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return records.filter((r) => new Date(r.createdAt) >= startOfMonth);
  }, [records]);

  const thisYear = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return records.filter((r) => new Date(r.createdAt) >= startOfYear);
  }, [records]);

  const monthlyGross = thisMonth.reduce((sum, r) => sum + r.gross, 0);
  const monthlyNet = thisMonth.reduce((sum, r) => sum + r.net, 0);
  const yearlyGross = thisYear.reduce((sum, r) => sum + r.gross, 0);
  const yearlyNet = thisYear.reduce((sum, r) => sum + r.net, 0);

  const handleDelete = (id: string) => {
    if (window.confirm("이 기록을 삭제하시겠습니까?")) {
      deleteRecord(id);
      setRecords(getRecords());
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
  const getTypeLabel = (type: "employee" | "freelancer") => type === "employee" ? "근로소득" : "프리랜서";
  const getTypeBadgeColor = (type: "employee" | "freelancer") => type === "employee" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700";

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">수입 기록</h1>
            <p className="text-gray-600">저장된 계산 기록을 확인하세요.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/employee")}>근로자 계산</Button>
            <Button variant="outline" onClick={() => navigate("/freelancer")}>프리랜서 계산</Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card><p className="text-sm text-gray-500 mb-1">이번 달 총 수입</p><p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyGross)}원</p></Card>
          <Card><p className="text-sm text-gray-500 mb-1">이번 달 실수령액</p><p className="text-2xl font-bold text-primary-600">{formatCurrency(monthlyNet)}원</p></Card>
          <Card><p className="text-sm text-gray-500 mb-1">올해 총 수입</p><p className="text-2xl font-bold text-gray-900">{formatCurrency(yearlyGross)}원</p></Card>
          <Card><p className="text-sm text-gray-500 mb-1">올해 실수령액</p><p className="text-2xl font-bold text-primary-600">{formatCurrency(yearlyNet)}원</p></Card>
        </div>

        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold text-gray-900">기록 목록</h2>
            <div className="flex gap-2">
              {(["all", "employee", "freelancer"] as FilterType[]).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === f ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {f === "all" ? "전체" : f === "employee" ? "근로소득" : "프리랜서"}
                </button>
              ))}
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-4">📋</p>
              <p className="text-gray-500">저장된 기록이 없습니다.</p>
              <p className="text-gray-400 text-sm mt-1">계산 후 "기록에 저장" 버튼을 눌러 저장하세요.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">날짜</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">유형</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">메모</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">세전</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">실수령</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2 text-sm text-gray-600">{formatDate(record.createdAt)}</td>
                      <td className="py-3 px-2"><span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getTypeBadgeColor(record.type)}`}>{getTypeLabel(record.type)}</span></td>
                      <td className="py-3 px-2 text-sm text-gray-900">{record.label}</td>
                      <td className="py-3 px-2 text-sm text-gray-600 text-right">{formatCurrency(record.gross)}원</td>
                      <td className="py-3 px-2 text-sm font-semibold text-primary-600 text-right">{formatCurrency(record.net)}원</td>
                      <td className="py-3 px-2">
                        <button onClick={() => handleDelete(record.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="삭제">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default HistoryPage;

