import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
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
  Clock
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const WalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
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

  const quickAmounts = [500, 1000, 2500, 5000, 10000];

  return (
    <div className="space-y-6" data-testid="wallet-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Manrope']">Wallet</h1>
          <p className="text-muted-foreground">Manage your balance and transactions</p>
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
              
              {/* Quick amounts */}
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

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-[#1A1614] to-[#0F0F0F] border-[#D4AF37]/20 overflow-hidden relative" data-testid="balance-card">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-8 relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
              <p className="text-5xl font-bold text-white font-['Manrope']">
                {loading ? '...' : wallet?.balance?.toLocaleString() || 0}
                <span className="text-2xl text-[#D4AF37] ml-2">AED</span>
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center gold-glow">
              <CreditCard className="w-8 h-8 text-black" />
            </div>
          </div>
          
          {/* Card design elements */}
          <div className="mt-8 flex items-center justify-between">
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <ArrowDownRight className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Deposits</p>
                <p className="text-2xl font-bold text-green-400 font-['Manrope']">
                  {transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0).toLocaleString()} AED
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
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Spent</p>
                <p className="text-2xl font-bold text-red-400 font-['Manrope']">
                  {transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0).toLocaleString()} AED
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Transactions</p>
                <p className="text-2xl font-bold text-white font-['Manrope']">
                  {transactions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
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
    </div>
  );
};

export default WalletPage;
