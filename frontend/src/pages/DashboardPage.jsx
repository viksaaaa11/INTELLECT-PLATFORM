import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Users, 
  Briefcase, 
  Wallet, 
  TrendingUp, 
  ShoppingCart,
  UserCheck,
  DollarSign,
  Target
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/dashboard`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock chart data
  const chartData = [
    { name: 'Jan', leads: 40, deals: 24 },
    { name: 'Feb', leads: 30, deals: 13 },
    { name: 'Mar', leads: 45, deals: 28 },
    { name: 'Apr', leads: 50, deals: 35 },
    { name: 'May', leads: 49, deals: 30 },
    { name: 'Jun', leads: 60, deals: 42 },
  ];

  const MetricCard = ({ title, value, icon: Icon, subtext, color = "text-[#D4AF37]" }) => (
    <Card className="metric-card" data-testid={`metric-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-['Inter']">{title}</p>
            <p className={`text-4xl font-bold font-['Manrope'] ${color}`}>{value}</p>
            {subtext && <p className="text-sm text-muted-foreground mt-1">{subtext}</p>}
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-[#D4AF37]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#D4AF37]">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white font-['Manrope']">
          Welcome back, <span className="text-[#D4AF37]">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your business today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="New Leads" 
          value={stats?.today_leads || 0}
          icon={Users}
          subtext={`${stats?.active_leads || 0} active`}
        />
        <MetricCard 
          title="Active Deals" 
          value={stats?.active_deals || 0}
          icon={Briefcase}
          subtext={`${stats?.total_deals || 0} total`}
        />
        <MetricCard 
          title="Total Earnings" 
          value={`$${(stats?.total_earnings || 0).toLocaleString()}`}
          icon={DollarSign}
          subtext="Commission earned"
        />
        <MetricCard 
          title="Wallet Balance" 
          value={`${(stats?.wallet_balance || 0).toLocaleString()} AED`}
          icon={Wallet}
          subtext="Available for leads"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Available Leads" 
          value={stats?.available_leads || 0}
          icon={ShoppingCart}
          subtext="Ready to purchase"
          color="text-green-400"
        />
        <MetricCard 
          title="Total Clients" 
          value={stats?.total_clients || 0}
          icon={UserCheck}
          subtext="In your CRM"
        />
        <MetricCard 
          title="Conversion Rate" 
          value={stats?.total_leads > 0 ? Math.round((stats?.total_clients / stats?.total_leads) * 100) : 0}
          icon={Target}
          subtext="Lead to client"
          color="text-blue-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads & Deals Chart */}
        <Card className="bg-card border-border/50" data-testid="leads-chart">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white font-['Manrope']">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] min-h-[300px]">
              <ResponsiveContainer width="100%" height={280} minWidth={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDeals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888' }} />
                  <YAxis stroke="#666" tick={{ fill: '#888' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0F0F0F', 
                      border: '1px solid rgba(212,175,55,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="leads" stroke="#D4AF37" fillOpacity={1} fill="url(#colorLeads)" />
                  <Area type="monotone" dataKey="deals" stroke="#22C55E" fillOpacity={1} fill="url(#colorDeals)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue Chart */}
        <Card className="bg-card border-border/50" data-testid="revenue-chart">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white font-['Manrope']">Monthly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] min-h-[300px]">
              <ResponsiveContainer width="100%" height={280} minWidth={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888' }} />
                  <YAxis stroke="#666" tick={{ fill: '#888' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0F0F0F', 
                      border: '1px solid rgba(212,175,55,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="leads" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deals" fill="#B8860B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border/50" data-testid="quick-actions">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white font-['Manrope']">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/leads" className="p-4 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 transition-colors flex flex-col items-center gap-2 text-center">
              <ShoppingCart className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-sm text-white">Buy Leads</span>
            </a>
            <a href="/clients" className="p-4 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 transition-colors flex flex-col items-center gap-2 text-center">
              <UserCheck className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-sm text-white">Add Client</span>
            </a>
            <a href="/deals" className="p-4 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 transition-colors flex flex-col items-center gap-2 text-center">
              <Briefcase className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-sm text-white">New Deal</span>
            </a>
            <a href="/wallet" className="p-4 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 transition-colors flex flex-col items-center gap-2 text-center">
              <Wallet className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-sm text-white">Top Up Wallet</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
