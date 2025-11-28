import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import NumberInput from "../components/NumberInput";
import Toggle from "../components/Toggle";
import Select from "../components/Select";
import Slider from "../components/Slider";
import AlertCard from "../components/AlertCard";
import { calculateFreelancerPay, formatCurrency, FreelancerResult, getTaxRiskByExpenseRatio } from "../utils/calculations";
import { saveRecord, generateId } from "../utils/storage";

type WithholdingType = "3.3" | "custom";
type IncomeBracket = "under20" | "20to40" | "40to80" | "over80";

const FreelancerPage: React.FC = () => {
  const navigate = useNavigate();
  const [contractType, setContractType] = useState("oneoff");
  const [contractAmount, setContractAmount] = useState(0);
  const [withholdingType, setWithholdingType] = useState<WithholdingType>("3.3");
  const [customRate, setCustomRate] = useState(3.3);
  const [includesVAT, setIncludesVAT] = useState(false);
  const [expenseRatio, setExpenseRatio] = useState(30);
  const [incomeBracket, setIncomeBracket] = useState<IncomeBracket>("under20");
  const [result, setResult] = useState<FreelancerResult | null>(null);
  const [label, setLabel] = useState("");
  const [scenarioExpenseRatio, setScenarioExpenseRatio] = useState(30);

  const contractTypeOptions = [{ value: "oneoff", label: "단건 프로젝트" }, { value: "retainer", label: "월 계약 (리테이너)" }];
  const withholdingOptions = [{ value: "3.3", label: "3.3% (프리랜서 일반)" }, { value: "custom", label: "직접 입력" }];
  const incomeBracketOptions = [
    { value: "under20", label: "2,000만원 미만" },
    { value: "20to40", label: "2,000만원 ~ 4,000만원" },
    { value: "40to80", label: "4,000만원 ~ 8,000만원" },
    { value: "over80", label: "8,000만원 이상" },
  ];

  const handleCalculate = () => {
    const calcResult = calculateFreelancerPay({ contractAmount, withholdingType, customRate, includesVAT, expenseRatio, incomeBracket });
    setResult(calcResult);
    setScenarioExpenseRatio(expenseRatio);
  };

  const adjustedTaxRisk = useMemo(() => getTaxRiskByExpenseRatio(scenarioExpenseRatio, incomeBracket), [scenarioExpenseRatio, incomeBracket]);

  const handleSaveToHistory = () => {
    if (!result) return;
    saveRecord({ id: generateId(), type: "freelancer", createdAt: new Date().toISOString(), label: label || "프리랜서 수입", gross: result.gross, net: result.netPayout });
    alert("기록이 저장되었습니다.");
    navigate("/history");
  };

  const getRiskBadgeColor = (level: "low" | "medium" | "high") => {
    const colors = { low: "bg-emerald-100 text-emerald-700", medium: "bg-amber-100 text-amber-700", high: "bg-red-100 text-red-700" };
    return colors[level];
  };
  const getRiskLabel = (level: "low" | "medium" | "high") => ({ low: "낮음", medium: "중간", high: "높음" }[level]);

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">프리랜서 실수령액 계산기</h1>
        <p className="text-gray-600 mb-8">계약 금액과 원천징수 조건을 입력하고 예상 실수령액과 세금 리스크를 확인하세요.</p>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <div className="space-y-6">
              <Select label="계약 유형" value={contractType} onChange={setContractType} options={contractTypeOptions} />
              <NumberInput label="계약 금액 (세전)" value={contractAmount} onChange={setContractAmount} suffix="원" min={0} helperText="원천징수 전 계약 금액을 입력하세요." />
              <Select label="원천징수 유형" value={withholdingType} onChange={(v) => setWithholdingType(v as WithholdingType)} options={withholdingOptions} />
              {withholdingType === "custom" && <NumberInput label="원천징수율" value={customRate} onChange={setCustomRate} suffix="%" min={0} max={100} step={0.1} />}
              <Toggle label="부가세(VAT) 포함 금액인가요?" checked={includesVAT} onChange={setIncludesVAT} helperText="부가세 포함 여부는 참고용입니다." />
              <Slider label="경비율 (필요경비 공제 비율)" value={expenseRatio} min={0} max={60} step={5} onChange={setExpenseRatio} formatValue={(v) => `${v}%`} helperText="종합소득세 신고 시 인정되는 경비 비율입니다." />
              <Select label="연간 예상 프리랜서 소득" value={incomeBracket} onChange={(v) => setIncomeBracket(v as IncomeBracket)} options={incomeBracketOptions} helperText="전체 프리랜서 수입 기준으로 선택하세요." />
              <Button fullWidth onClick={handleCalculate}>실수령액 및 세금 리스크 계산</Button>
            </div>
          </Card>
          <div className="space-y-6">
            {result ? (
              <>
                <Card className="animate-fadeIn">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">계산 결과</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">계약 금액</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(result.gross)}원</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">원천징수세액 (약)</span>
                      <span className="font-semibold text-red-500">-{formatCurrency(result.withholdingTax)}원</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">예상 실수령액</span>
                      <span className="font-bold text-xl text-primary-600">{formatCurrency(result.netPayout)}원</span>
                    </div>
                  </div>
                </Card>
                <Card>
                  <h3 className="font-bold text-gray-900 mb-4">연간 세금 리스크 분석</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-gray-600">추가 세금 위험도:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBadgeColor(result.taxRiskLevel)}`}>{getRiskLabel(result.taxRiskLevel)}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{result.taxRiskDescription}</p>
                </Card>
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">주의사항</h3>
                  <AlertCard type="info" title="종합소득세 신고 안내">프리랜서 소득은 다음 해 5월에 종합소득세 신고를 해야 합니다.</AlertCard>
                  {includesVAT && <AlertCard type="warning" title="부가세 관련 안내">계약 금액에 부가세가 포함되어 있다고 하셨습니다. 부가세 신고 의무가 있을 수 있습니다.</AlertCard>}
                  <AlertCard type="warning" title="참고 안내">이 계산은 대략적인 예상치입니다. 정확한 세금 계산은 세무사에게 문의하세요.</AlertCard>
                </div>
                <Card>
                  <h3 className="font-bold text-gray-900 mb-4">경비율 변경 시뮬레이션</h3>
                  <Slider label="경비율 조정" value={scenarioExpenseRatio} min={0} max={60} step={5} onChange={setScenarioExpenseRatio} formatValue={(v) => `${v}%`} />
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      경비율을 <span className="font-semibold">{scenarioExpenseRatio}%</span>로 설정하면, 세금 리스크는{" "}
                      <span className={`font-semibold ${adjustedTaxRisk.level === "low" ? "text-emerald-600" : adjustedTaxRisk.level === "medium" ? "text-amber-600" : "text-red-600"}`}>{adjustedTaxRisk.description}</span>
                      으로 예상됩니다.
                    </p>
                  </div>
                </Card>
                <Card>
                  <h3 className="font-bold text-gray-900 mb-4">기록 저장</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">메모 (선택사항)</label>
                      <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="예: 앱 디자인 프로젝트" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
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

export default FreelancerPage;

