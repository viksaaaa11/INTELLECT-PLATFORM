import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../components/ui/dialog';
import { 
  Wallet, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Clock,
  TrendingUp,
  Check,
  Crown,
  Rocket,
  User,
  Star
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const WalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [mySubscription, setMySubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
    fetchPlans();
    fetchMySubscription();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/wallet`);
      setWallet(response.data);
    } catch (error) {
      toast.error('Failed to fetch wallet');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/wallet/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions');
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/subscriptions/plans`);
      setPlans(response.data);
    } catch (error) {
      console.error('Failed to fetch plans');
    }
  };

  const fetchMySubscription = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/subscriptions/my`);
      setMySubscription(response.data);
    } catch (error) {
      console.error('No subscription found');
    }
  };

  const handleTopup = async (e) => {
    e.preventDefault();
    const amount = parseFloat(topupAmount);
    if (amount <= 0) {
      toast.error('Amount must be positive');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/wallet/topup`, { amount });
      toast.success('Wallet topped up successfully!');
      setDialogOpen(false);
      setTopupAmount('');
      fetchWallet();
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to top up wallet');
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      await axios.post(`${API_URL}/api/subscriptions/subscribe?plan_id=${planId}`);
      toast.success('Subscription activated!');
      fetchWallet();
      fetchTransactions();
      fetchMySubscription();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to subscribe');
    }
  };

  const quickAmounts = [500, 1000, 2500, 5000, 10000];

  const totalDeposits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);

  const getPlanIcon = (name) => {
    switch(name.toLowerCase()) {
      case 'standard': return User;
      case 'pro': return Rocket;
      case 'enterprise': return Crown;
      default: return User;
    }
  };

  return (
    <div className="space-y-6" data-testid="wallet-page">
      {/* Header with background */}
      <div 
        className="relative rounded-2xl overflow-hidden p-8 bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(https://images.unsplash.com/photo-1618044733300-9472054094ee?w=1600)'
        }}
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white font-['Manrope']">Wallet</h1>
            <p className="text-muted-foreground">Manage your balance and subscriptions</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gold" data-testid="topup-btn">
                <Plus className="w-4 h-4 mr-2" />
                Top Up
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0F0F0F] border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white font-['Manrope']">Top Up Wallet</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Add funds to your wallet
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleTopup} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Amount (AED)</Label>
                  <Input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37] text-2xl h-14 text-center"
                    required
                    data-testid="topup-amount-input"
                  />
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {quickAmounts.map(amount => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      className="btn-outline-gold text-xs"
                      onClick={() => setTopupAmount(amount.toString())}
                    >
                      {amount.toLocaleString()}
                    </Button>
                  ))}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="btn-outline-gold">
                    Cancel
                  </Button>
                  <Button type="submit" className="btn-gold" data-testid="confirm-topup">
                    Top Up
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-[#1A1614] to-[#0F0F0F] border-[#D4AF37]/20 overflow-hidden relative" data-testid="balance-card">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37]/3 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <CardContent className="p-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#D4AF37] flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-black" />
                </div>
                <span className="text-sm text-muted-foreground">Available Balance</span>
              </div>
              <p className="text-5xl font-bold text-white font-['Manrope']">
                {loading ? '...' : wallet?.balance?.toLocaleString() || 0}
                <span className="text-2xl text-[#D4AF37] ml-2">AED</span>
              </p>
              {mySubscription && (
                <Badge className="mt-3 bg-[#D4AF37]/20 text-[#D4AF37]">
                  <Crown className="w-3 h-3 mr-1" /> {mySubscription.plan_name} Member
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="btn-outline-gold">
                <ArrowDownRight className="w-4 h-4 mr-2" /> Withdraw
              </Button>
              <Button variant="outline" className="bg-[#1A1A1A] border-white/10 text-white hover:bg-white/10">
                <TrendingUp className="w-4 h-4 mr-2" /> Statistics
              </Button>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-between text-sm">
            <div className="flex gap-1">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-3 h-3 rounded-full bg-[#D4AF37]/30" />
              ))}
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Member since</p>
              <p className="text-sm text-white">2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Earned</p>
                <p className="text-2xl font-bold text-green-400 font-['Manrope']">
                  {totalDeposits.toLocaleString()} AED
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Withdrawn</p>
                <p className="text-2xl font-bold text-red-400 font-['Manrope']">
                  {totalSpent.toLocaleString()} AED
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Subscriptions and Transactions */}
      <Tabs defaultValue="subscriptions" className="space-y-6">
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            <Crown className="w-4 h-4 mr-2" />
            Club Membership
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            <Clock className="w-4 h-4 mr-2" />
            Transaction History
          </TabsTrigger>
        </TabsList>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white font-['Manrope']">Club Membership</h3>
            <p className="text-muted-foreground text-sm">Choose your membership plan and unlock exclusive benefits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const PlanIcon = getPlanIcon(plan.name);
              const isCurrentPlan = mySubscription?.plan_name === plan.name;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`bg-card border-border/50 relative overflow-hidden ${
                    plan.is_recommended ? 'border-[#D4AF37]/50' : ''
                  } ${isCurrentPlan ? 'ring-2 ring-[#D4AF37]' : ''}`}
                  data-testid={`plan-${plan.id}`}
                >
                  {plan.is_recommended && (
                    <Badge className="absolute top-4 right-4 bg-[#D4AF37] text-black">
                      <Star className="w-3 h-3 mr-1" /> RECOMMENDED
                    </Badge>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        plan.name === 'Pro' ? 'bg-[#D4AF37]/20' : 'bg-white/5'
                      }`}>
                        <PlanIcon className={`w-6 h-6 ${
                          plan.name === 'Pro' ? 'text-[#D4AF37]' : 'text-white'
                        }`} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white font-['Manrope']">{plan.name}</h4>
                      </div>
                    </div>

                    <div className="mb-6">
                      <span className="text-3xl font-bold text-[#D4AF37] font-['Manrope']">
                        AED {plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm"> /month</span>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className={`w-full ${isCurrentPlan ? 'bg-green-500 hover:bg-green-600' : 'btn-gold'}`}
                      onClick={() => !isCurrentPlan && handleSubscribe(plan.id)}
                      disabled={isCurrentPlan}
                      data-testid={`subscribe-${plan.id}`}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white font-['Manrope']">Transaction History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Description</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow 
                        key={transaction.id} 
                        className="border-white/5 table-row-hover"
                        data-testid={`transaction-${transaction.id}`}
                      >
                        <TableCell>
                          <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center
                            ${transaction.type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'}
                          `}>
                            {transaction.type === 'credit' ? (
                              <ArrowDownRight className="w-4 h-4 text-green-400" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-white">{transaction.description}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${
                          transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{transaction.amount.toLocaleString()} AED
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletPage;
