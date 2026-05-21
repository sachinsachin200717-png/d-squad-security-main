// Demo Indian banking dataset. Synthetic, never real customer data.

export const INDIAN_BANKS = [
  { name: "State Bank of India", code: "SBIN" },
  { name: "HDFC Bank", code: "HDFC" },
  { name: "ICICI Bank", code: "ICIC" },
  { name: "Axis Bank", code: "UTIB" },
  { name: "Canara Bank", code: "CNRB" },
  { name: "Punjab National Bank", code: "PUNB" },
  { name: "Bank of Baroda", code: "BARB" },
  { name: "Kotak Mahindra Bank", code: "KKBK" },
  { name: "Union Bank of India", code: "UBIN" },
  { name: "Indian Bank", code: "IDIB" },
  { name: "Yes Bank", code: "YESB" },
  { name: "IDFC First Bank", code: "IDFB" },
];

const NAMES = [
  "Aarav Sharma", "Priya Iyer", "Rohan Mehta", "Ananya Verma", "Vikram Singh",
  "Sneha Reddy", "Arjun Khanna", "Kavya Nair", "Rahul Gupta", "Pooja Joshi",
  "Karthik Rao", "Isha Patel", "Sandeep Kulkarni", "Meera Bose", "Aditya Pillai",
  "Riya Banerjee", "Nikhil Saxena", "Diya Chatterjee", "Manish Dube", "Tanvi Shah",
];

const CITIES = [
  ["Mumbai", "Maharashtra"], ["Bengaluru", "Karnataka"], ["Delhi", "Delhi"],
  ["Hyderabad", "Telangana"], ["Chennai", "Tamil Nadu"], ["Kolkata", "West Bengal"],
  ["Pune", "Maharashtra"], ["Ahmedabad", "Gujarat"], ["Jaipur", "Rajasthan"],
  ["Lucknow", "Uttar Pradesh"], ["Kochi", "Kerala"], ["Indore", "Madhya Pradesh"],
];

const DEVICES = ["iPhone 15 Pro", "Samsung Galaxy S24", "OnePlus 12", "Pixel 8", "MacBook Pro", "Windows 11 Laptop", "iPad Air", "Redmi Note 13"];
const BROWSERS = ["Chrome 124", "Safari 17", "Edge 124", "Firefox 125", "Brave 1.66"];
const OS_LIST = ["iOS 17.4", "Android 14", "macOS 14.4", "Windows 11", "Linux"];

const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type RiskLevel = typeof RISK_LEVELS[number];

const SCAM_TYPES = [
  "Fake UPI Request", "Fake Bank SMS", "OTP Sharing Attempt", "Fake Customer Care Call",
  "Screen Sharing Scam", "KYC Update Fraud", "QR Code Scam", "Phishing Website",
  "Account Takeover", "SIM Swap Attempt", "Fake Loan App", "Reward Points Scam",
];

let seed = 1337;
const rand = () => {
  // mulberry32
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T>(a: readonly T[]) => a[Math.floor(rand() * a.length)];
const intBetween = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

const acctNum = () => Array.from({ length: 4 }, () => intBetween(1000, 9999)).join(" ");
const ifsc = (code: string) => `${code}0${intBetween(100000, 999999)}`;
const upi = (name: string, code: string) =>
  `${name.toLowerCase().split(" ")[0]}${intBetween(10, 99)}@${code.toLowerCase()}`;
const ip = () => `${intBetween(14, 223)}.${intBetween(0, 255)}.${intBetween(0, 255)}.${intBetween(1, 254)}`;
const txnId = () => `TXN${intBetween(100000000, 999999999)}`;
const phone = () => `+91 ${intBetween(70000, 99999)}${intBetween(10000, 99999)}`;

export interface BankingRow {
  id: string;
  user: string;
  bank: string;
  account: string;
  txnId: string;
  ifsc: string;
  upi: string;
  device: string;
  os: string;
  browser: string;
  ip: string;
  city: string;
  state: string;
  loginTime: string;
  amount: number;
  risk: RiskLevel;
  otpStatus: "VERIFIED" | "PENDING" | "FAILED" | "BYPASSED";
  phone: string;
  type: "DEBIT" | "CREDIT" | "UPI" | "TRANSFER";
}

export function generateBankingRows(n = 24): BankingRow[] {
  seed = 1337; // deterministic for nice demo
  return Array.from({ length: n }).map((_, i) => {
    const name = pick(NAMES);
    const bank = pick(INDIAN_BANKS);
    const [city, state] = pick(CITIES);
    const r = rand();
    const risk: RiskLevel = r < 0.5 ? "LOW" : r < 0.78 ? "MEDIUM" : r < 0.93 ? "HIGH" : "CRITICAL";
    const otp =
      risk === "CRITICAL" ? "BYPASSED"
      : risk === "HIGH" ? (rand() < 0.5 ? "FAILED" : "PENDING")
      : "VERIFIED";
    const minutesAgo = intBetween(1, 60 * 12);
    const loginTime = new Date(Date.now() - minutesAgo * 60_000).toISOString();
    return {
      id: `row-${i}`,
      user: name,
      bank: bank.name,
      account: acctNum(),
      txnId: txnId(),
      ifsc: ifsc(bank.code),
      upi: upi(name, bank.code),
      device: pick(DEVICES),
      os: pick(OS_LIST),
      browser: pick(BROWSERS),
      ip: ip(),
      city,
      state,
      loginTime,
      amount: intBetween(150, 250000),
      risk,
      otpStatus: otp,
      phone: phone(),
      type: pick(["DEBIT", "CREDIT", "UPI", "TRANSFER"] as const),
    };
  });
}

export interface ScamAlert {
  id: string;
  type: string;
  message: string;
  severity: RiskLevel;
  source: string;
  time: string;
}

export function generateScamAlerts(n = 8): ScamAlert[] {
  seed = 9001;
  return Array.from({ length: n }).map((_, i) => {
    const t = pick(SCAM_TYPES);
    const r = rand();
    const sev: RiskLevel = r < 0.2 ? "LOW" : r < 0.55 ? "MEDIUM" : r < 0.85 ? "HIGH" : "CRITICAL";
    const bank = pick(INDIAN_BANKS).name;
    return {
      id: `alert-${i}`,
      type: t,
      message: messageFor(t, bank),
      severity: sev,
      source: bank,
      time: new Date(Date.now() - intBetween(2, 240) * 60_000).toISOString(),
    };
  });
}

function messageFor(type: string, bank: string): string {
  const map: Record<string, string> = {
    "Fake UPI Request": `Suspicious collect request of ₹${intBetween(2000, 50000)} from unverified VPA targeting ${bank} customer.`,
    "Fake Bank SMS": `Spoofed SMS impersonating ${bank} requesting OTP and PAN update — flagged by spam engine.`,
    "OTP Sharing Attempt": `Caller asked customer to read out OTP for ${bank} app activation. Blocked by behavioral filter.`,
    "Fake Customer Care Call": `Inbound call posing as ${bank} support requesting remote access to device.`,
    "Screen Sharing Scam": `AnyDesk install attempted during ${bank} session. Auto-revoked by endpoint guard.`,
    "KYC Update Fraud": `Fraudulent KYC link sent over WhatsApp impersonating ${bank} — domain blacklisted.`,
    "QR Code Scam": `Pay-to-receive QR scam detected — receiver tried to scan for ₹${intBetween(500, 9000)}.`,
    "Phishing Website": `Lookalike domain mimicking ${bank} login portal. Reported to CERT-In.`,
    "Account Takeover": `Multiple failed logins from new geo for ${bank} account — temporary block engaged.`,
    "SIM Swap Attempt": `New SIM activation flagged by telco partner. ${bank} freezes outgoing OTP.`,
    "Fake Loan App": `Unregistered lending app harvesting credentials of ${bank} customers.`,
    "Reward Points Scam": `Phishing email claiming ${bank} reward redemption — credentials harvesting form.`,
  };
  return map[type] ?? `Suspicious ${type.toLowerCase()} detected for ${bank}.`;
}

export const RISK_COLOR: Record<RiskLevel, string> = {
  LOW: "text-cyber-green",
  MEDIUM: "text-cyber-yellow",
  HIGH: "text-cyber-red",
  CRITICAL: "text-cyber-red",
};

export const RISK_BG: Record<RiskLevel, string> = {
  LOW: "bg-cyber-green/15 border-cyber-green/40 text-cyber-green",
  MEDIUM: "bg-cyber-yellow/15 border-cyber-yellow/40 text-cyber-yellow",
  HIGH: "bg-cyber-red/15 border-cyber-red/50 text-cyber-red",
  CRITICAL: "bg-cyber-red/25 border-cyber-red text-cyber-red animate-blink-danger",
};
