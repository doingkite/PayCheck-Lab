export type RecordType = "employee" | "freelancer";

export interface PayRecord {
  id: string;
  type: RecordType;
  createdAt: string;
  label: string;
  gross: number;
  net: number;
}

export type WageMode = "hourly" | "monthly";
export type EmploymentType = "fulltime" | "parttime";
export type ContractType = "oneoff" | "retainer";
export type WithholdingType = "3.3" | "custom";
export type IncomeBracket = "under20" | "20to40" | "40to80" | "over80";
export type Unit = "hourly" | "daily" | "monthly" | "project";
export type Role = "employee" | "freelancer";
