import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import Select from "../components/Select";
import NumberInput from "../components/NumberInput";
import { formatCurrency } from "../utils/calculations";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("employee");
  const [grossAmount, setGrossAmount] = useState(0);
  const [unit, setUnit] = useState("hourly");
  const [quickResult, setQuickResult] = useState<number | null>(null);

  const roleOptions = [
    { value: "employee", label: "근로자 / 알바" },
    { value: "freelancer", label: "프리랜서 / 개인사업자" },
  ];

  const unitOptions = [
    { value: "hourly", label: "시급" },
    { value: "daily", label: "일급" },
    { value: "monthly", label: "월급" },
    { value: "project", label: "프로젝트당" },
  ];

  const handleQuickEstimate = () => {
    if (grossAmount <= 0) return;
    let monthlyGross = grossAmount;
    if (unit === "hourly") {
      monthlyGross = grossAmount * 8 * 5 * 4.345;
    } else if (unit === "daily") {
      monthlyGross = grossAmount * 5 * 4.345;
    }
    const deductionRate = role === "employee" ? 0.08 : 0.033;
    const netPay = monthlyGross * (1 - deductionRate);
    setQuickResult(Math.round(netPay));
  };

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary-50 via-white to-blue-50 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            내 실수령액, <br className="md:hidden" />
            <span className="text-primary-600">한 곳에서</span> 확인하세요
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            근로자와 프리랜서 모두를 위한 실수령액 계산기. <br className="hidden md:block" />
            권리 확인과 세금 리스크까지 한눈에 파악하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/employee")}>근로자 계산 시작</Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/freelancer")}>프리랜서 계산 시작</Button>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">빠른 예상 계산</h2>
            <div className="space-y-4">
              <Select label="유형 선택" value={role} onChange={setRole} options={roleOptions} />
              <NumberInput label="총 금액" value={grossAmount} onChange={setGrossAmount} placeholder="금액을 입력하세요" suffix="원" min={0} />
              <Select label="단위" value={unit} onChange={setUnit} options={unitOptions} />
              <Button fullWidth onClick={handleQuickEstimate}>빠른 예상 계산</Button>
              {quickResult !== null && (
                <div className="mt-6 p-4 bg-primary-50 rounded-lg animate-fadeIn">
                  <p className="text-center">
                    <span className="text-gray-600">예상 월 실수령액: </span>
                    <span className="text-2xl font-bold text-primary-600">{formatCurrency(quickResult)}원</span>
                  </p>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    자세한 계산은{" "}
                    <button onClick={() => navigate(role === "employee" ? "/employee" : "/freelancer")} className="text-primary-600 hover:underline font-medium">상세 계산기</button>
                    를 이용하세요.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">이런 분들께 추천해요</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">알바생 / 파트타임</h3>
              <p className="text-sm text-gray-600">시급으로 계약했지만 실제 월급이 얼마인지, 최저시급은 지켜지는지 확인하세요.</p>
            </Card>
            <Card>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">직장인</h3>
              <p className="text-sm text-gray-600">월급에서 4대보험이 얼마나 빠지는지, 실수령액은 얼마인지 계산해보세요.</p>
            </Card>
            <Card>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">💻</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">프리랜서</h3>
              <p className="text-sm text-gray-600">3.3% 원천징수 후 실수령액과 종합소득세 신고 시 세금 리스크를 확인하세요.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-sm text-gray-500">
            ⚠️ 이 계산기는 대략적인 예상치를 제공하며, 법적 효력이 없습니다. 정확한 세금 계산은 세무사나 관련 기관에 문의하세요.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

