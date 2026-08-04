import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Landmark, 
  Percent, 
  Calculator, 
  ArrowRight, 
  AlertCircle,
  FileCheck,
  UserCheck,
  X
} from 'lucide-react';
import { LoanApplication, LoanKycDocument, User } from '../types';
import { SAMPLE_LOAN_APPLICATIONS, INDIAN_CITIES } from '../data/initialData';

interface BankLoanKycHubProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const BankLoanKycHub: React.FC<BankLoanKycHubProps> = ({ currentUser, onOpenAuth }) => {
  const [loanAmount, setLoanAmount] = useState<number>(200000);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [selectedBank, setSelectedBank] = useState<string>('SBI');
  
  const [applications, setApplications] = useState<LoanApplication[]>(SAMPLE_LOAN_APPLICATIONS);
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(SAMPLE_LOAN_APPLICATIONS[0]);

  // Form inputs for new loan
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [applicantName, setApplicantName] = useState<string>(currentUser?.name || '');
  const [applicantPhone, setApplicantPhone] = useState<string>(currentUser?.phone || '');
  const [applicantCity, setApplicantCity] = useState<string>(currentUser?.city || 'Delhi NCR');
  
  // KYC Files state
  const [docAadhaar, setDocAadhaar] = useState<string>('');
  const [docPan, setDocPan] = useState<string>('');
  const [docEBill, setDocEBill] = useState<string>('');
  const [docBankStatement, setDocBankStatement] = useState<string>('');
  const [docBoq, setDocBoq] = useState<string>('');

  const banksData = [
    {
      id: 'SBI',
      name: 'State Bank of India (SBI)',
      scheme: 'SBI Surya Ghar Solar Rooftop Loan',
      interestRate: 7.0,
      maxAmount: 600000,
      collateralFreeLimit: 600000,
      tenureMaxYears: 10,
      logoUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'Canara',
      name: 'Canara Bank',
      scheme: 'Canara Green Renewable Rooftop Credit',
      interestRate: 7.15,
      maxAmount: 1000000,
      collateralFreeLimit: 700000,
      tenureMaxYears: 8,
      logoUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'BoB',
      name: 'Bank of Baroda',
      scheme: 'BOB Solar Energy Scheme',
      interestRate: 7.25,
      maxAmount: 1000000,
      collateralFreeLimit: 600000,
      tenureMaxYears: 7,
      logoUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'HDFC',
      name: 'HDFC Bank',
      scheme: 'HDFC Green Roof & MEP Finance',
      interestRate: 8.5,
      maxAmount: 2500000,
      collateralFreeLimit: 1000000,
      tenureMaxYears: 10,
      logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=200&q=80'
    }
  ];

  const currentBankObj = banksData.find(b => b.id === selectedBank) || banksData[0];

  // Calculate EMI
  const monthlyRate = currentBankObj.interestRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  const calculatedEmi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );

  const handleApplyLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const docs: LoanKycDocument[] = [
      { docType: 'Aadhaar Card', fileName: docAadhaar || 'aadhaar_scan.pdf', isUploaded: true, isVerified: true, uploadedAt: '2026-07-28' },
      { docType: 'PAN Card', fileName: docPan || 'pan_card.pdf', isUploaded: true, isVerified: true, uploadedAt: '2026-07-28' },
      { docType: 'Electricity Bill', fileName: docEBill || 'ebill_recent.pdf', isUploaded: true, isVerified: true, uploadedAt: '2026-07-28' },
      { docType: '6 Month Bank Statement', fileName: docBankStatement || 'statement_6m.pdf', isUploaded: true, isVerified: false, uploadedAt: '2026-07-28' },
      { docType: 'Project BOQ Estimate', fileName: docBoq || 'solar_boq_estimate.pdf', isUploaded: true, isVerified: true, uploadedAt: '2026-07-28' }
    ];

    const newApp: LoanApplication = {
      id: `LN-2026-${Math.floor(100 + Math.random() * 900)}`,
      applicantName: applicantName || 'Registered Borrower',
      applicantPhone: applicantPhone || '+91 98765 43210',
      applicantCity: applicantCity,
      bankName: currentBankObj.name,
      schemeName: currentBankObj.scheme,
      loanType: 'PM Surya Ghar Solar Loan',
      requestedAmountINR: loanAmount,
      tenureMonths: totalMonths,
      interestRatePct: currentBankObj.interestRate,
      monthlyEmiINR: calculatedEmi,
      kycStatus: 'Pending Verification',
      appliedDate: new Date().toISOString().split('T')[0],
      documents: docs,
      cibilScore: 765
    };

    setApplications([newApp, ...applications]);
    setSelectedApp(newApp);
    setShowApplyModal(false);
    alert(`Bank Loan application #${newApp.id} submitted to ${currentBankObj.name}! Sanction notice will be sent after KYC verification.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Landmark className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Solar &amp; Green Project Bank Loans &amp; KYC Vault</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official PM Surya Ghar 7.0% Collateral-Free Bank Financing &amp; Digital File KYC Portal
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (!currentUser) onOpenAuth();
            else setShowApplyModal(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
        >
          <FileCheck className="w-4 h-4" />
          <span>+ Apply Solar Loan &amp; Upload KYC</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Loan Calculator */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              Instant Bank EMI Calculator
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 text-[10px] font-bold">
              PM Surya Ghar Special 7%
            </span>
          </div>

          {/* Select Bank */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Partnering PSU / Private Bank
            </label>
            <div className="grid grid-cols-2 gap-2">
              {banksData.map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBank(b.id)}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedBank === b.id
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold line-clamp-1">{b.name}</div>
                  <div className="text-[10px] text-blue-600 font-bold mt-0.5">{b.interestRate}% p.a.</div>
                </button>
              ))}
            </div>
          </div>

          {/* Loan Amount Range */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700 dark:text-slate-300">Loan Amount Required</span>
              <span className="text-blue-600 font-bold">₹{loanAmount.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={50000}
              max={currentBankObj.maxAmount}
              step={10000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹50,000</span>
              <span>₹5,000,000</span>
              <span>Max ₹{(currentBankObj.maxAmount / 100000).toFixed(1)} L</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700 dark:text-slate-300">Repayment Tenure</span>
              <span className="text-blue-600 font-bold">{tenureYears} Years ({totalMonths} Months)</span>
            </div>
            <input
              type="range"
              min={1}
              max={currentBankObj.tenureMaxYears}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Calculated EMI Display */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 text-white space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Monthly EMI Amount:</span>
              <span className="text-amber-400 font-bold">No Collateral Needed</span>
            </div>
            <div className="text-3xl font-extrabold text-blue-300">
              ₹{calculatedEmi.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">/ month</span>
            </div>
            <div className="text-[11px] text-slate-300 border-t border-slate-800 pt-2 flex justify-between">
              <span>Total Interest Payable:</span>
              <span className="font-bold text-emerald-400">₹{(calculatedEmi * totalMonths - loanAmount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (!currentUser) onOpenAuth();
              else setShowApplyModal(true);
            }}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Proceed with {currentBankObj.id} Application</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Side: Active Loan Applications & KYC Documents */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Submitted Bank Applications &amp; File KYC Verification Status
              </h2>
            </div>

            {/* List of Applications */}
            <div className="space-y-3">
              {applications.map(app => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selectedApp?.id === app.id
                      ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{app.id}</span>
                        <span className="text-xs text-slate-500">• {app.bankName}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Applicant: {app.applicantName} ({app.applicantCity}) • Amount: ₹{app.requestedAmountINR.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      app.kycStatus === 'KYC Verified' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : app.kycStatus === 'Approved & Sanctioned'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {app.kycStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Document Checklist for Selected Application */}
            {selectedApp && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Mandatory KYC Documents Checklist ({selectedApp.documents.length} Files)
                  </span>
                  {selectedApp.cibilScore && (
                    <span className="text-[11px] font-bold text-emerald-600">
                      Verified CIBIL Score: {selectedApp.cibilScore}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {selectedApp.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{doc.docType}</div>
                          <div className="text-[10px] text-slate-400">{doc.fileName}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {doc.isVerified ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Bank Verified
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-600 text-[10px] font-bold flex items-center gap-1 border border-amber-200">
                            <Clock className="w-3 h-3" /> Under Audit
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Apply Loan & KYC Upload Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Bank Loan Application &amp; Full KYC Upload</h2>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLoan} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Applicant Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="As on Aadhaar"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City *</label>
                <select
                  value={applicantCity}
                  onChange={(e) => setApplicantCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Document File Attachments simulation */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Mandatory KYC File Uploads (PDF / JPG)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">1. Aadhaar Card File</label>
                    <input
                      type="file"
                      onChange={(e) => setDocAadhaar(e.target.files?.[0]?.name || '')}
                      className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">2. PAN Card File</label>
                    <input
                      type="file"
                      onChange={(e) => setDocPan(e.target.files?.[0]?.name || '')}
                      className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">3. DISCOM Electricity Bill</label>
                    <input
                      type="file"
                      onChange={(e) => setDocEBill(e.target.files?.[0]?.name || '')}
                      className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">4. 6-Month Bank Statement</label>
                    <input
                      type="file"
                      onChange={(e) => setDocBankStatement(e.target.files?.[0]?.name || '')}
                      className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
