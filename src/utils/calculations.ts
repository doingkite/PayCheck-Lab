import { SOCIAL_INSURANCE_RATE, MIN_WITHHOLDING_RATE, FREELANCER_WITHHOLDING_RATE } from "./constants";

export interface EmployeeInputs {
  mode: "hourly" | "monthly";
  hourlyWage?: number;
  hoursPerDay?: number;
  daysPerWeek: number;
  weeksPerMonth: number;
  monthlySalary?: number;
  workingHoursPerWeek?: number;
  hasOver15Hours: boolean;
  hasSocialInsurance: boolean;
}

export interface EmployeeResult {
  monthlyGross: number;
  deductions: number;
  monthlyNet: number;
  dailyNet: number;
  hourlyRate: number;
}

export const calculateEmployeePay = (inputs: EmployeeInputs): EmployeeResult => {
  let monthlyGross = 0;
  let hourlyRate = 0;

  if (inputs.mode === "hourly" && inputs.hourlyWage && inputs.hoursPerDay) {
    const monthlyHours = inputs.hoursPerDay * inputs.daysPerWeek * inputs.weeksPerMonth;
    monthlyGross = inputs.hourlyWage * monthlyHours;
    hourlyRate = inputs.hourlyWage;
  } else if (inputs.mode === "monthly" && inputs.monthlySalary && inputs.workingHoursPerWeek) {
    monthlyGross = inputs.monthlySalary;
    const monthlyHours = inputs.workingHoursPerWeek * inputs.weeksPerMonth;
    hourlyRate = monthlyHours > 0 ? monthlyGross / monthlyHours : 0;
  }

  const deductionRate = inputs.hasSocialInsurance ? SOCIAL_INSURANCE_RATE : MIN_WITHHOLDING_RATE;
  const deductions = Math.round(monthlyGross * deductionRate);
  const monthlyNet = monthlyGross - deductions;
  const workingDaysPerMonth = inputs.daysPerWeek * inputs.weeksPerMonth;
  const dailyNet = workingDaysPerMonth > 0 ? Math.round(monthlyNet / workingDaysPerMonth) : 0;

  return {
    monthlyGross: Math.round(monthlyGross),
    deductions,
    monthlyNet,
    dailyNet,
    hourlyRate: Math.round(hourlyRate),
  };
};

export interface FreelancerInputs {
  contractAmount: number;
  withholdingType: "3.3" | "custom";
  customRate?: number;
  includesVAT: boolean;
  expenseRatio: number;
  incomeBracket: "under20" | "20to40" | "40to80" | "over80";
}

export interface FreelancerResult {
  gross: number;
  withholdingTax: number;
  netPayout: number;
  taxRiskLevel: "low" | "medium" | "high";
  taxRiskDescription: string;
}

export const calculateFreelancerPay = (inputs: FreelancerInputs): FreelancerResult => {
  const withholdingRate = inputs.withholdingType === "3.3" ? FREELANCER_WITHHOLDING_RATE : (inputs.customRate || 0) / 100;
  const withholdingTax = Math.round(inputs.contractAmount * withholdingRate);
  const netPayout = inputs.contractAmount - withholdingTax;

  const isHighIncome = inputs.incomeBracket === "40to80" || inputs.incomeBracket === "over80";
  const isLowExpense = inputs.expenseRatio < 30;
  const isMediumExpense = inputs.expenseRatio >= 30 && inputs.expenseRatio < 50;

  let taxRiskLevel: "low" | "medium" | "high" = "low";
  let taxRiskDescription = "";

  if (isHighIncome && isLowExpense) {
    taxRiskLevel = "high";
    taxRiskDescription = "현재 소득 수준과 낮은 경비율을 고려할 때, 종합소득세 신고 시 추가 납부 세액이 발생할 가능성이 높습니다.";
  } else if (isHighIncome && isMediumExpense) {
    taxRiskLevel = "medium";
    taxRiskDescription = "중간 수준의 경비율로 어느 정도 세금 부담을 줄일 수 있지만, 고소득 구간이므로 정확한 경비 증빙이 중요합니다.";
  } else if (!isHighIncome && isLowExpense) {
    taxRiskLevel = "medium";
    taxRiskDescription = "소득 수준은 낮지만 경비율도 낮아 신고 시 예상보다 세금이 발생할 수 있습니다.";
  } else {
    taxRiskLevel = "low";
    taxRiskDescription = "현재 소득 수준과 경비율을 고려할 때 큰 추가 세금 부담 없이 신고가 가능할 것으로 예상됩니다.";
  }

  return { gross: inputs.contractAmount, withholdingTax, netPayout, taxRiskLevel, taxRiskDescription };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ko-KR").format(amount);
};

export const getTaxRiskByExpenseRatio = (expenseRatio: number, incomeBracket: "under20" | "20to40" | "40to80" | "over80") => {
  const isHighIncome = incomeBracket === "40to80" || incomeBracket === "over80";
  const isLowExpense = expenseRatio < 30;
  const isMediumExpense = expenseRatio >= 30 && expenseRatio < 50;

  if (isHighIncome && isLowExpense) return { level: "high" as const, description: "높은 추가 세금 위험" };
  if (isHighIncome && isMediumExpense) return { level: "medium" as const, description: "중간 수준의 세금 위험" };
  if (!isHighIncome && isLowExpense) return { level: "medium" as const, description: "중간 수준의 세금 위험" };
  return { level: "low" as const, description: "낮은 세금 위험" };
};
