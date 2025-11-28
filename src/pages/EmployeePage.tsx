import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import NumberInput from "../components/NumberInput";
import Toggle from "../components/Toggle";
import Select from "../components/Select";
import SegmentedControl from "../components/SegmentedControl";
import Slider from "../components/Slider";
import AlertCard from "../components/AlertCard";
import { calculateEmployeePay, formatCurrency, EmployeeResult } from "../utils/calculations";
import { MIN_WAGE_2025, DEFAULT_WEEKS_PER_MONTH } from "../utils/constants";
import { saveRecord, generateId } from "../utils/storage";

const EmployeePage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"hourly" | "monthly">("hourly");
  const [hourlyWage, setHourlyWage] = useState(0);
  const [hoursPerDay, setHoursPerDay] = useState(0);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [weeksPerMonth, setWeeksPerMonth] = useState(DEFAULT_WEEKS_PER_MONTH);
  const [monthlySalary, setMonthlySalary] = useState(0);
  const [workingHoursPerWeek, setWorkingHoursPerWeek] = useState(0);
  const [hasOver15Hours, setHasOver15Hours] = useState(true);
  const [hasSocialInsurance, setHasSocialInsurance] = useState(true);
  const [employmentType, setEmploymentType] = useState("fulltime");
  const [result, setResult] = useState<EmployeeResult | null>(null);
  const [label, setLabel] = useState("");
  const [wageAdjustment, setWageAdjustment] = useState(0);
  const [hoursAdjustment, setHoursAdjustment] = useState(0);

  const modeOptions = [{ value: "hourly", label: "시급 기준" }, { value: "monthly", label: "월급 기준" }];
  const employmentOptions = [{ value: "fulltime", label: "정규직 / 계약직" }, { value: "parttime", label: "파트타임 / 시급제" }];

  const handleCalculate = () => {
    const calcResult = calculateEmployeePay({ mode, hourlyWage, hoursPerDay, daysPerWeek, weeksPerMonth, monthlySalary, workingHoursPerWeek, hasOver15Hours, hasSocialInsurance });
    setResult(calcResult);
  };

  const adjustedWageResult = useMemo(() => {
    if (!result || mode !== "hourly") return null;
    return calculateEmployeePay({ mode, hourlyWage: hourlyWage + wageAdjustment, hoursPerDay, daysPerWeek, weeksPerMonth, monthlySalary, workingHoursPerWeek, hasOver15Hours, hasSocialInsurance });
  }, [result, mode, hourlyWage, wageAdjustment, hoursPerDay, daysPerWeek, weeksPerMonth, monthlySalary, workingHoursPerWeek, hasOver15Hours, hasSocialInsurance]);

  const adjustedHoursResult = useMemo(() => {
    if (!result) return null;
    const factor = 1 + hoursAdjustment / 100;
    return calculateEmployeePay({ mode, hourlyWage, hoursPerDay: mode === "hourly" ? hoursPerDay * factor : hoursPerDay, daysPerWeek, weeksPerMonth, monthlySalary, workingHoursPerWeek: mode === "monthly" ? workingHoursPerWeek * factor : workingHoursPerWeek, hasOver15Hours, hasSocialInsurance });
  }, [result, mode, hourlyWage, hoursPerDay, hoursAdjustment, daysPerWeek, weeksPerMonth, monthlySalary, workingHoursPerWeek, hasOver15Hours, hasSocialInsurance]);

  const handleSaveToHistory = () => {
    if (!result) return;
    saveRecord({ id: generateId(), type: "employee", createdAt: new Date().toISOString(), label: label || "근로소득 계산", gross: result.monthlyGross, net: result.monthlyNet });
    alert("기록이 저장되었습니다.");
    navigate("/history");
  };

  const weeklyHours = mode === "hourly" ? hoursPerDay * daysPerWeek : workingHoursPerWeek;

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">근로자 실수령액 계산기</h1>
        <p className="text-gray-600 mb-8">시급 또는 월급을 입력하고 예상 실수령액을 계산해보세요.</p>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">계산 방식</label>
                <SegmentedControl options={modeOptions} value={mode} onChange={(v) => setMode(v as "hourly" | "monthly")} />
              </div>
              {mode === "hourly" ? (
                <>
                  <NumberInput label="시급" value={hourlyWage} onChange={setHourlyWage} suffix="원" min={0} helperText={`2025년 최저시급: ${formatCurrency(MIN_WAGE_2025)}원`} />
                  <NumberInput label="하루 근무시간" value={hoursPerDay} onChange={setHoursPerDay} suffix="시간" min={0} max={24} step={0.5} />
                  <NumberInput label="주간 근무일수" value={daysPerWeek} onChange={setDaysPerWeek} suffix="일" min={1} max={7} />
                  <NumberInput label="월 평균 주수" value={weeksPerMonth} onChange={setWeeksPerMonth} min={1} max={5} step={0.001} helperText="일반적으로 월 평균 4.345주입니다." />
                </>
              ) : (
                <>
                  <NumberInput label="월급 (세전)" value={monthlySalary} onChange={setMonthlySalary} suffix="원" min={0} />
                  <NumberInput label="주간 근무시간" value={workingHoursPerWeek} onChange={setWorkingHoursPerWeek} suffix="시간" min={0} max={168} />
                  <NumberInput label="주간 근무일수" value={daysPerWeek} onChange={setDaysPerWeek} suffix="일" min={1} max={7} />
                </>
              )}
              <div className="border-t border-gray-200 pt-4 space-y-4">
                <Toggle label="주 15시간 이상 근무하나요?" checked={hasOver15Hours} onChange={setHasOver15Hours} helperText="주휴수당 및 4대보험 적용 기준입니다." />
                <Toggle label="4대보험 가입 여부" checked={hasSocialInsurance} onChange={setHasSocialInsurance} helperText="가입 시 약 8% 공제됩니다." />
                <Select label="고용 형태" value={employmentType} onChange={setEmploymentType} options={employmentOptions} />
              </div>
              <Button fullWidth onClick={handleCalculate}>실수령액 계산하기</Button>
            </div>
          </Card>
          <div className="space-y-6">
            {result ? (
              <>
                <Card className="animate-fadeIn">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">계산 결과</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">월 세전 급여</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(result.monthlyGross)}원</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">예상 공제액</span>
                      <span className="font-semibold text-red-500">-{formatCurrency(result.deductions)}원</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">예상 월 실수령액</span>
                      <span className="font-bold text-xl text-primary-600">{formatCurrency(result.monthlyNet)}원</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">예상 일 실수령액</span>
                      <span className="font-semibold text-gray-900">약 {formatCurrency(result.dailyNet)}원</span>
                    </div>
                  </div>
                </Card>
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">권리 및 리스크 확인</h3>
                  {result.hourlyRate < MIN_WAGE_2025 ? (
                    <AlertCard type="danger" title="최저시급 미달">계산된 시급({formatCurrency(result.hourlyRate)}원)이 2025년 최저시급({formatCurrency(MIN_WAGE_2025)}원)보다 낮습니다.</AlertCard>
                  ) : (
                    <AlertCard type="success" title="최저시급 충족">계산된 시급({formatCurrency(result.hourlyRate)}원)이 최저시급 기준을 충족합니다.</AlertCard>
                  )}
                  {hasOver15Hours && daysPerWeek >= 3 ? (
                    <AlertCard type="info" title="주휴수당 대상">주 15시간 이상 근무하므로 주휴수당을 받을 수 있습니다.</AlertCard>
                  ) : (
                    <AlertCard type="warning" title="주휴수당 조건 미충족">현재 근무 조건으로는 주휴수당 적용 대상이 아닐 수 있습니다.</AlertCard>
                  )}
                  {!hasSocialInsurance && hasOver15Hours && (
                    <AlertCard type="warning" title="4대보험 미가입 주의">주 15시간 이상 근무 시 4대보험 가입이 의무일 수 있습니다.</AlertCard>
                  )}
                </div>
                <Card>
                  <h3 className="font-bold text-gray-900 mb-4">조건 변경해보기</h3>
                  <div className="space-y-6">
                    {mode === "hourly" && (
                      <div>
                        <Slider label="시급 조정" value={wageAdjustment} min={0} max={2000} step={100} onChange={setWageAdjustment} formatValue={(v) => `+${formatCurrency(v)}원`} />
                        {adjustedWageResult && wageAdjustment > 0 && (
                          <p className="mt-2 text-sm text-gray-600">시급이 {formatCurrency(hourlyWage + wageAdjustment)}원이 되면, 월 실수령액은 <span className="font-semibold text-primary-600">{formatCurrency(adjustedWageResult.monthlyNet)}원</span>입니다.</p>
                        )}
                      </div>
                    )}
                    <div>
                      <Slider label="근무시간 조정" value={hoursAdjustment} min={-10} max={10} step={1} onChange={setHoursAdjustment} formatValue={(v) => `${v > 0 ? "+" : ""}${v}%`} />
                      {adjustedHoursResult && hoursAdjustment !== 0 && (
                        <p className="mt-2 text-sm text-gray-600">근무시간이 {hoursAdjustment > 0 ? "+" : ""}{hoursAdjustment}% 변경되면, 월 실수령액은 <span className="font-semibold text-primary-600">{formatCurrency(adjustedHoursResult.monthlyNet)}원</span>입니다.</p>
                      )}
                    </div>
                  </div>
                </Card>
                <Card>
                  <h3 className="font-bold text-gray-900 mb-4">기록 저장</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">메모 (선택사항)</label>
                      <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="예: 편의점 야간 알바" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <Button fullWidth variant="secondary" onClick={handleSaveToHistory}>이 결과 기록에 저장</Button>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="flex items-center justify-center min-h-[300px]">
                <div className="text-center text-gray-500">
                  <p className="text-4xl mb-4">📊</p>
                  <p>왼쪽 양식을 입력하고</p>
                  <p className="font-medium">계산하기 버튼을 눌러주세요.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePage;

