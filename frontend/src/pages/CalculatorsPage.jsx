import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Slider } from '../components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  Calculator, 
  Home, 
  TrendingUp, 
  Receipt,
  DollarSign,
  Percent,
  Calendar,
  PiggyBank,
  Building
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CalculatorsPage = () => {
  // Mortgage state
  const [mortgageData, setMortgageData] = useState({
    property_price: 2000000,
    down_payment_percent: 20,
    loan_term_years: 25,
    interest_rate: 4.5
  });
  const [mortgageResult, setMortgageResult] = useState(null);

  // ROI state
  const [roiData, setRoiData] = useState({
    property_price: 2000000,
    annual_rent: 120000,
    service_charges: 15000,
    maintenance: 5000
  });
  const [roiResult, setRoiResult] = useState(null);

  // Expenses state
  const [expensesData, setExpensesData] = useState({
    property_price: 2000000,
    property_type: 'apartment'
  });
  const [expensesResult, setExpensesResult] = useState(null);

  const calculateMortgage = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/calculators/mortgage`, mortgageData);
      setMortgageResult(response.data);
    } catch (error) {
      console.error('Mortgage calculation error:', error);
    }
  };

  const calculateROI = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/calculators/roi`, roiData);
      setRoiResult(response.data);
    } catch (error) {
      console.error('ROI calculation error:', error);
    }
  };

  const calculateExpenses = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/calculators/expenses`, expensesData);
      setExpensesResult(response.data);
    } catch (error) {
      console.error('Expenses calculation error:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6" data-testid="calculators-page">
      {/* Header */}
      <div 
        className="relative rounded-2xl overflow-hidden p-8 bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1600)'
        }}
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white font-['Manrope'] flex items-center gap-3">
            <Calculator className="w-8 h-8 text-[#D4AF37]" />
            Financial Calculators
          </h1>
          <p className="text-muted-foreground mt-1">Plan your investment with our smart calculators</p>
        </div>
      </div>

      <Tabs defaultValue="mortgage" className="space-y-6">
        <TabsList className="bg-[#1A1A1A] border border-white/5 grid w-full grid-cols-3">
          <TabsTrigger value="mortgage" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            <Home className="w-4 h-4 mr-2" />
            Mortgage
          </TabsTrigger>
          <TabsTrigger value="roi" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            <TrendingUp className="w-4 h-4 mr-2" />
            ROI
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            <Receipt className="w-4 h-4 mr-2" />
            Expenses
          </TabsTrigger>
        </TabsList>

        {/* Mortgage Calculator */}
        <TabsContent value="mortgage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white font-['Manrope']">
                  Mortgage Calculator
                </CardTitle>
                <CardDescription>Calculate your monthly mortgage payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-300 flex justify-between">
                    Property Price
                    <span className="text-[#D4AF37]">{formatCurrency(mortgageData.property_price)}</span>
                  </Label>
                  <Slider
                    value={[mortgageData.property_price]}
                    onValueChange={([value]) => setMortgageData({ ...mortgageData, property_price: value })}
                    min={500000}
                    max={50000000}
                    step={100000}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 flex justify-between">
                    Down Payment
                    <span className="text-[#D4AF37]">{mortgageData.down_payment_percent}%</span>
                  </Label>
                  <Slider
                    value={[mortgageData.down_payment_percent]}
                    onValueChange={([value]) => setMortgageData({ ...mortgageData, down_payment_percent: value })}
                    min={20}
                    max={80}
                    step={5}
                    className="py-4"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Loan Term (Years)</Label>
                    <Select
                      value={mortgageData.loan_term_years.toString()}
                      onValueChange={(value) => setMortgageData({ ...mortgageData, loan_term_years: parseInt(value) })}
                    >
                      <SelectTrigger className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-white/10">
                        <SelectItem value="10">10 Years</SelectItem>
                        <SelectItem value="15">15 Years</SelectItem>
                        <SelectItem value="20">20 Years</SelectItem>
                        <SelectItem value="25">25 Years</SelectItem>
                        <SelectItem value="30">30 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Interest Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={mortgageData.interest_rate}
                      onChange={(e) => setMortgageData({ ...mortgageData, interest_rate: parseFloat(e.target.value) })}
                      className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <Button className="w-full btn-gold" onClick={calculateMortgage} data-testid="calculate-mortgage">
                  Calculate Mortgage
                </Button>
              </CardContent>
            </Card>

            {/* Mortgage Results */}
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white font-['Manrope']">
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mortgageResult ? (
                  <div className="space-y-4">
                    <div className="p-6 rounded-xl bg-[#D4AF37]/10 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
                      <p className="text-4xl font-bold text-[#D4AF37] font-['Manrope']">
                        {formatCurrency(mortgageResult.monthly_payment)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-[#1A1A1A]">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-xs text-muted-foreground">Loan Amount</span>
                        </div>
                        <p className="text-lg font-semibold text-white">{formatCurrency(mortgageResult.loan_amount)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-[#1A1A1A]">
                        <div className="flex items-center gap-2 mb-2">
                          <PiggyBank className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-xs text-muted-foreground">Down Payment</span>
                        </div>
                        <p className="text-lg font-semibold text-white">{formatCurrency(mortgageResult.down_payment)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-[#1A1A1A]">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-xs text-muted-foreground">Total Payment</span>
                        </div>
                        <p className="text-lg font-semibold text-white">{formatCurrency(mortgageResult.total_payment)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-[#1A1A1A]">
                        <div className="flex items-center gap-2 mb-2">
                          <Percent className="w-4 h-4 text-red-400" />
                          <span className="text-xs text-muted-foreground">Total Interest</span>
                        </div>
                        <p className="text-lg font-semibold text-red-400">{formatCurrency(mortgageResult.total_interest)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter details and click calculate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ROI Calculator */}
        <TabsContent value="roi" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white font-['Manrope']">
                  ROI Calculator
                </CardTitle>
                <CardDescription>Calculate rental yield and return on investment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-300 flex justify-between">
                    Property Price
                    <span className="text-[#D4AF37]">{formatCurrency(roiData.property_price)}</span>
                  </Label>
                  <Slider
                    value={[roiData.property_price]}
                    onValueChange={([value]) => setRoiData({ ...roiData, property_price: value })}
                    min={500000}
                    max={50000000}
                    step={100000}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Annual Rent (AED)</Label>
                  <Input
                    type="number"
                    value={roiData.annual_rent}
                    onChange={(e) => setRoiData({ ...roiData, annual_rent: parseFloat(e.target.value) || 0 })}
                    className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Service Charges/Year</Label>
                    <Input
                      type="number"
                      value={roiData.service_charges}
                      onChange={(e) => setRoiData({ ...roiData, service_charges: parseFloat(e.target.value) || 0 })}
                      className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Maintenance/Year</Label>
                    <Input
                      type="number"
                      value={roiData.maintenance}
                      onChange={(e) => setRoiData({ ...roiData, maintenance: parseFloat(e.target.value) || 0 })}
                      className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <Button className="w-full btn-gold" onClick={calculateROI} data-testid="calculate-roi">
                  Calculate ROI
                </Button>
              </CardContent>
            </Card>

            {/* ROI Results */}
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white font-['Manrope']">
                  Investment Returns
                </CardTitle>
              </CardHeader>
              <CardContent>
                {roiResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 rounded-xl bg-green-500/10 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Gross Yield</p>
                        <p className="text-3xl font-bold text-green-400 font-['Manrope']">
                          {roiResult.gross_yield}%
                        </p>
                      </div>
                      <div className="p-6 rounded-xl bg-[#D4AF37]/10 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Net Yield</p>
                        <p className="text-3xl font-bold text-[#D4AF37] font-['Manrope']">
                          {roiResult.net_yield}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-[#1A1A1A]">
                        <p className="text-xs text-muted-foreground mb-1">Monthly Income</p>
                        <p className="text-lg font-semibold text-white">{formatCurrency(roiResult.monthly_income)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-[#1A1A1A]">
                        <p className="text-xs text-muted-foreground mb-1">Annual Net Income</p>
                        <p className="text-lg font-semibold text-white">{formatCurrency(roiResult.net_annual_income)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-[#1A1A1A] col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">Payback Period</p>
                        <p className="text-lg font-semibold text-white">{roiResult.payback_years} years</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter details and click calculate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expenses Calculator */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white font-['Manrope']">
                  Expenses Calculator
                </CardTitle>
                <CardDescription>Calculate all costs for property purchase in UAE</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-300 flex justify-between">
                    Property Price
                    <span className="text-[#D4AF37]">{formatCurrency(expensesData.property_price)}</span>
                  </Label>
                  <Slider
                    value={[expensesData.property_price]}
                    onValueChange={([value]) => setExpensesData({ ...expensesData, property_price: value })}
                    min={500000}
                    max={50000000}
                    step={100000}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Property Type</Label>
                  <Select
                    value={expensesData.property_type}
                    onValueChange={(value) => setExpensesData({ ...expensesData, property_type: value })}
                  >
                    <SelectTrigger className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-white/10">
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="penthouse">Penthouse</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full btn-gold" onClick={calculateExpenses} data-testid="calculate-expenses">
                  Calculate Expenses
                </Button>
              </CardContent>
            </Card>

            {/* Expenses Results */}
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white font-['Manrope']">
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expensesResult ? (
                  <div className="space-y-4">
                    <div className="p-6 rounded-xl bg-[#D4AF37]/10 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Total One-Time Costs</p>
                      <p className="text-3xl font-bold text-[#D4AF37] font-['Manrope']">
                        {formatCurrency(expensesResult.total_one_time_costs)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {expensesResult.percentage_of_price}% of property price
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-[#1A1A1A]">
                        <span className="text-muted-foreground">DLD Fee (4%)</span>
                        <span className="text-white font-semibold">{formatCurrency(expensesResult.dld_fee)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-[#1A1A1A]">
                        <span className="text-muted-foreground">Registration Fee</span>
                        <span className="text-white font-semibold">{formatCurrency(expensesResult.registration_fee)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-[#1A1A1A]">
                        <span className="text-muted-foreground">Agent Commission (2%)</span>
                        <span className="text-white font-semibold">{formatCurrency(expensesResult.agent_commission)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-[#1A1A1A]">
                        <span className="text-muted-foreground">NOC Fee</span>
                        <span className="text-white font-semibold">{formatCurrency(expensesResult.noc_fee)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-[#1A1A1A]">
                        <span className="text-muted-foreground">Trustee Fee</span>
                        <span className="text-white font-semibold">{formatCurrency(expensesResult.trustee_fee)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-[#1A1A1A]">
                        <span className="text-muted-foreground">DEWA Deposit</span>
                        <span className="text-white font-semibold">{formatCurrency(expensesResult.dewa_deposit)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-blue-500/10">
                        <span className="text-blue-400">+ Mortgage Registration</span>
                        <span className="text-blue-400 font-semibold">{formatCurrency(expensesResult.mortgage_registration)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter details and click calculate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalculatorsPage;
