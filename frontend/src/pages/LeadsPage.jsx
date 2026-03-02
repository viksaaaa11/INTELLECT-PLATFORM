import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
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
  Search, 
  ShoppingCart, 
  Filter,
  Plus,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Building
} from 'lucide-react';
import { Label } from '../components/ui/label';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const statusColors = {
  new: 'bg-blue-500/20 text-blue-400',
  qualified: 'bg-green-500/20 text-green-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  client: 'bg-purple-500/20 text-purple-400',
  closed: 'bg-[#D4AF37]/20 text-[#D4AF37]',
  lost: 'bg-red-500/20 text-red-400',
};

const LeadsPage = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    fetchLeads();
    fetchWallet();
  }, [filterAvailable]);

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/leads`, {
        params: { available_only: filterAvailable }
      });
      setLeads(response.data);
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/wallet`);
      setWallet(response.data);
    } catch (error) {
      console.error('Failed to fetch wallet');
    }
  };

  const handleBuyLead = async () => {
    if (!selectedLead) return;
    
    try {
      await axios.post(`${API_URL}/api/leads/${selectedLead.id}/buy`);
      toast.success('Lead purchased successfully!');
      setBuyDialogOpen(false);
      setSelectedLead(null);
      fetchLeads();
      fetchWallet();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to purchase lead');
    }
  };

  const handleUpdateStatus = async (leadId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/leads/${leadId}`, { status: newStatus });
      toast.success('Lead status updated');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to update lead');
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name?.toLowerCase().includes(search.toLowerCase()) ||
    lead.phone?.includes(search) ||
    lead.area?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="leads-page">
      {/* Header with background */}
      <div 
        className="relative rounded-2xl overflow-hidden p-8 bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600)'
        }}
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white font-['Manrope']">Leads</h1>
            <p className="text-muted-foreground">Manage and purchase leads</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground bg-black/50 px-4 py-2 rounded-lg">
              Wallet: <span className="text-[#D4AF37] font-semibold">{wallet?.balance?.toLocaleString() || 0} AED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                data-testid="leads-search"
              />
            </div>
            <Button
              variant={filterAvailable ? "default" : "outline"}
              className={filterAvailable ? "btn-gold" : "btn-outline-gold"}
              onClick={() => setFilterAvailable(!filterAvailable)}
              data-testid="filter-available"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Available Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Contact</TableHead>
                <TableHead className="text-muted-foreground">Budget</TableHead>
                <TableHead className="text-muted-foreground">Area</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Price</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading leads...
                  </TableCell>
                </TableRow>
              ) : filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow 
                    key={lead.id} 
                    className="border-white/5 table-row-hover"
                    data-testid={`lead-row-${lead.id}`}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.nationality || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" /> {lead.phone}
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" /> {lead.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-white">
                        ${lead.budget_min?.toLocaleString() || 0} - ${lead.budget_max?.toLocaleString() || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {lead.area || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.is_available ? (
                        <Badge className="bg-green-500/20 text-green-400">Available</Badge>
                      ) : (
                        <Select
                          value={lead.status}
                          onValueChange={(value) => handleUpdateStatus(lead.id, value)}
                        >
                          <SelectTrigger className={`w-28 h-7 ${statusColors[lead.status]} border-none`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1A1A1A] border-white/10">
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-[#D4AF37] font-semibold">
                        {lead.price?.toLocaleString() || 0} AED
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {lead.is_available ? (
                        <Dialog open={buyDialogOpen && selectedLead?.id === lead.id} onOpenChange={(open) => {
                          setBuyDialogOpen(open);
                          if (!open) setSelectedLead(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              className="btn-gold"
                              onClick={() => setSelectedLead(lead)}
                              data-testid={`buy-lead-${lead.id}`}
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Buy
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#0F0F0F] border-white/10">
                            <DialogHeader>
                              <DialogTitle className="text-white font-['Manrope']">Purchase Lead</DialogTitle>
                              <DialogDescription className="text-muted-foreground">
                                Confirm your purchase of this lead
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="p-4 rounded-lg bg-[#1A1A1A]">
                                <p className="text-lg font-semibold text-white">{selectedLead?.name}</p>
                                <p className="text-muted-foreground">{selectedLead?.phone}</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <Building className="w-4 h-4 text-[#D4AF37]" />
                                  <span className="text-sm text-muted-foreground">{selectedLead?.property_type || 'Any'} in {selectedLead?.area || 'Dubai'}</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                                  <span className="text-sm text-muted-foreground">Budget: ${selectedLead?.budget_min?.toLocaleString()} - ${selectedLead?.budget_max?.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-4 rounded-lg bg-[#D4AF37]/10">
                                <span className="text-muted-foreground">Lead Price:</span>
                                <span className="text-2xl font-bold text-[#D4AF37]">{selectedLead?.price?.toLocaleString()} AED</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Your Balance:</span>
                                <span className={wallet?.balance >= selectedLead?.price ? "text-green-400" : "text-red-400"}>
                                  {wallet?.balance?.toLocaleString()} AED
                                </span>
                              </div>
                              {wallet?.balance < selectedLead?.price && (
                                <p className="text-red-400 text-sm">Insufficient balance. Please top up your wallet.</p>
                              )}
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setBuyDialogOpen(false)} className="btn-outline-gold">
                                Cancel
                              </Button>
                              <Button 
                                className="btn-gold" 
                                onClick={handleBuyLead}
                                disabled={wallet?.balance < selectedLead?.price}
                                data-testid="confirm-buy-lead"
                              >
                                Confirm Purchase
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <span className="text-xs text-muted-foreground">Assigned</span>
                      )}
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

export default LeadsPage;
