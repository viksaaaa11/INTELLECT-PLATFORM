import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  Building2,
  Users,
  ShoppingCart,
  DollarSign,
  Plus,
  Upload,
  Briefcase,
  TrendingUp
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    email: '',
    phone: '',
    license_number: ''
  });
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    nationality: '',
    budget_min: '',
    budget_max: '',
    property_type: '',
    area: '',
    source: '',
    price: ''
  });

  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdminStats();
      fetchCompanies();
    }
    fetchUsers();
  }, [isSuperAdmin]);

  const fetchAdminStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch admin stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/companies`);
      setCompanies(response.data);
    } catch (error) {
      console.error('Failed to fetch companies');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/companies`, companyForm);
      toast.success('Company created successfully');
      setCompanyDialogOpen(false);
      setCompanyForm({ name: '', email: '', phone: '', license_number: '' });
      fetchCompanies();
      fetchAdminStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create company');
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/leads`, {
        ...leadForm,
        budget_min: parseFloat(leadForm.budget_min) || 0,
        budget_max: parseFloat(leadForm.budget_max) || 0,
        price: parseFloat(leadForm.price) || 0
      });
      toast.success('Lead created successfully');
      setLeadDialogOpen(false);
      setLeadForm({
        name: '', phone: '', email: '', nationality: '',
        budget_min: '', budget_max: '', property_type: '',
        area: '', source: '', price: ''
      });
      fetchAdminStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create lead');
    }
  };

  if (user?.role !== 'super_admin' && user?.role !== 'company_admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="bg-card border-border/50 max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-['Manrope']">Admin Panel</h1>
        <p className="text-muted-foreground">
          {isSuperAdmin ? 'Platform administration' : 'Team management'}
        </p>
      </div>

      {/* Super Admin Stats */}
      {isSuperAdmin && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Companies</p>
                  <p className="text-4xl font-bold text-[#D4AF37] font-['Manrope']">{stats.total_companies}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-[#D4AF37]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Users</p>
                  <p className="text-4xl font-bold text-blue-400 font-['Manrope']">{stats.total_users}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Leads Sold</p>
                  <p className="text-4xl font-bold text-green-400 font-['Manrope']">{stats.sold_leads}</p>
                  <p className="text-sm text-muted-foreground">{stats.available_leads} available</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Revenue</p>
                  <p className="text-4xl font-bold text-purple-400 font-['Manrope']">{stats.total_revenue?.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">AED</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue={isSuperAdmin ? "companies" : "users"} className="space-y-6">
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          {isSuperAdmin && (
            <>
              <TabsTrigger value="companies" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                Companies
              </TabsTrigger>
              <TabsTrigger value="leads" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
                Add Leads
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="users" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            Users
          </TabsTrigger>
        </TabsList>

        {/* Companies Tab */}
        {isSuperAdmin && (
          <TabsContent value="companies" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-gold" data-testid="add-company-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Company
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0F0F0F] border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-white font-['Manrope']">Add New Company</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Register a new real estate agency
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCompany} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Company Name</Label>
                      <Input
                        value={companyForm.name}
                        onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                        placeholder="Agency Name"
                        className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                        required
                        data-testid="company-name-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Email</Label>
                      <Input
                        type="email"
                        value={companyForm.email}
                        onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                        placeholder="company@email.com"
                        className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                        required
                        data-testid="company-email-input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Phone</Label>
                        <Input
                          value={companyForm.phone}
                          onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                          placeholder="+971 4 123 4567"
                          className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                          data-testid="company-phone-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">License Number</Label>
                        <Input
                          value={companyForm.license_number}
                          onChange={(e) => setCompanyForm({ ...companyForm, license_number: e.target.value })}
                          placeholder="ORN-12345"
                          className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                          data-testid="company-license-input"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setCompanyDialogOpen(false)} className="btn-outline-gold">
                        Cancel
                      </Button>
                      <Button type="submit" className="btn-gold" data-testid="create-company-submit">
                        Create Company
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-card border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Company</TableHead>
                      <TableHead className="text-muted-foreground">Contact</TableHead>
                      <TableHead className="text-muted-foreground">License</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No companies registered yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      companies.map((company) => (
                        <TableRow key={company.id} className="border-white/5 table-row-hover">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-[#D4AF37]" />
                              </div>
                              <p className="font-medium text-white">{company.name}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-white">{company.email}</p>
                            <p className="text-xs text-muted-foreground">{company.phone || 'N/A'}</p>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {company.license_number || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={company.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                              {company.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(company.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Add Leads Tab */}
        {isSuperAdmin && (
          <TabsContent value="leads" className="space-y-6">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white font-['Manrope']">Add New Lead</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Create leads available for purchase by agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateLead} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Name *</Label>
                      <Input
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                        placeholder="Lead name"
                        className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                        required
                        data-testid="lead-name-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Phone *</Label>
                      <Input
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        placeholder="+971 50 123 4567"
                        className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                        required
                        data-testid="lead-phone-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Email</Label>
                      <Input
                        type="email"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        placeholder="lead@email.com"
                        className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                        data-testid="lead-email-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Nationality</Label>
                      <Input
                        value={leadForm.nationality}
                        onChange={(e) => setLeadForm({ ...leadForm, nationality: e.target.value })}
                        placeholder="e.g., Russian, British"
                        className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                        data-testid="lead-nationality-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Budget Min ($)</Label>
                      <Input
                        type="number"
                        value={leadForm.budget_min}
                        onChange={(e) => setLeadForm({ ...leadForm, budget_min: e.target.value })}
                        placeholder="500,000"
                        className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                        data-testid="lead-budget-min-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Budget Max ($)</Label>
                      <Input
                        type="number"
                        value={leadForm.budget_max}
                        onChange={(e) => setLeadForm({ ...leadForm, budget_max: e.target.value })}
                        placeholder="1,000,000"
                        className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                        data-testid="lead-budget-max-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Property Type</Label>
                      <Select
                        value={leadForm.property_type}
                        onValueChange={(value) => setLeadForm({ ...leadForm, property_type: value })}
                      >
                        <SelectTrigger className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]" data-testid="lead-property-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-white/10">
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                          <SelectItem value="penthouse">Penthouse</SelectItem>
                          <SelectItem value="plot">Plot</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Area</Label>
                      <Input
                        value={leadForm.area}
                        onChange={(e) => setLeadForm({ ...leadForm, area: e.target.value })}
                        placeholder="e.g., Palm Jumeirah, Downtown"
                        className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                        data-testid="lead-area-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Source</Label>
                      <Select
                        value={leadForm.source}
                        onValueChange={(value) => setLeadForm({ ...leadForm, source: value })}
                      >
                        <SelectTrigger className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]" data-testid="lead-source">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-white/10">
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="google">Google Ads</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="exhibition">Exhibition</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Lead Price (AED) *</Label>
                      <Input
                        type="number"
                        value={leadForm.price}
                        onChange={(e) => setLeadForm({ ...leadForm, price: e.target.value })}
                        placeholder="500"
                        className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                        required
                        data-testid="lead-price-input"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" className="btn-gold" data-testid="create-lead-submit">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Lead
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white font-['Manrope']">
                {isSuperAdmin ? 'All Users' : 'Team Members'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">User</TableHead>
                    <TableHead className="text-muted-foreground">Contact</TableHead>
                    <TableHead className="text-muted-foreground">Role</TableHead>
                    <TableHead className="text-muted-foreground">RERA ID</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id} className="border-white/5 table-row-hover">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-semibold">
                              {u.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <p className="font-medium text-white">{u.name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-white">{u.email}</p>
                          <p className="text-xs text-muted-foreground">{u.phone || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            u.role === 'super_admin' ? 'bg-purple-500/20 text-purple-400' :
                            u.role === 'company_admin' ? 'bg-blue-500/20 text-blue-400' :
                            u.role === 'team_manager' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }>
                            {u.role?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {u.rera_id || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge className={u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </Badge>
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

export default AdminPage;
