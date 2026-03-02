import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
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
  Plus,
  Eye,
  FileText,
  Calendar,
  DollarSign,
  Building,
  ChevronRight
} from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const pipelineStages = [
  { id: 'viewing', label: 'Viewing', color: 'bg-blue-500' },
  { id: 'offer', label: 'Offer', color: 'bg-yellow-500' },
  { id: 'booking', label: 'Booking', color: 'bg-purple-500' },
  { id: 'closed', label: 'Closed', color: 'bg-green-500' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    property_name: '',
    deal_value: '',
    commission_total: '',
    agent_commission: ''
  });

  useEffect(() => {
    fetchDeals();
    fetchClients();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/deals`);
      setDeals(response.data);
    } catch (error) {
      toast.error('Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/clients`);
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients');
    }
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/deals`, {
        ...formData,
        deal_value: parseFloat(formData.deal_value),
        commission_total: parseFloat(formData.commission_total) || 0,
        agent_commission: parseFloat(formData.agent_commission) || 0
      });
      toast.success('Deal created successfully');
      setDialogOpen(false);
      setFormData({
        client_id: '',
        property_name: '',
        deal_value: '',
        commission_total: '',
        agent_commission: ''
      });
      fetchDeals();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create deal');
    }
  };

  const handleUpdateStatus = async (dealId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/deals/${dealId}`, { status: newStatus });
      toast.success('Deal status updated');
      fetchDeals();
    } catch (error) {
      toast.error('Failed to update deal');
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown';
  };

  const getDealsByStage = (stage) => {
    return deals.filter(deal => deal.status === stage);
  };

  const DealCard = ({ deal }) => (
    <div 
      className="pipeline-card group"
      data-testid={`deal-card-${deal.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-white text-sm">{deal.property_name}</p>
          <p className="text-xs text-muted-foreground">{getClientName(deal.client_id)}</p>
        </div>
        <Select
          value={deal.status}
          onValueChange={(value) => handleUpdateStatus(deal.id, value)}
        >
          <SelectTrigger className="w-8 h-8 p-0 border-none bg-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-white/10">
            {pipelineStages.map(stage => (
              <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Deal Value</span>
          <span className="text-[#D4AF37] font-semibold">${deal.deal_value?.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Commission</span>
          <span className="text-green-400">${deal.agent_commission?.toLocaleString() || 0}</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="w-3 h-3" />
        {new Date(deal.created_at).toLocaleDateString()}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#D4AF37]">Loading deals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="deals-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Manrope']">Deals Pipeline</h1>
          <p className="text-muted-foreground">Track your deals through the sales pipeline</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gold" data-testid="add-deal-btn">
              <Plus className="w-4 h-4 mr-2" />
              New Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0F0F0F] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white font-['Manrope']">Create New Deal</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Add a new deal to your pipeline
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Client</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                >
                  <SelectTrigger className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]" data-testid="deal-client-select">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-white/10">
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Property Name</Label>
                <Input
                  value={formData.property_name}
                  onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
                  placeholder="e.g., Palm Jumeirah Villa"
                  className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                  required
                  data-testid="deal-property-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Deal Value (USD)</Label>
                <Input
                  type="number"
                  value={formData.deal_value}
                  onChange={(e) => setFormData({ ...formData, deal_value: e.target.value })}
                  placeholder="1,000,000"
                  className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                  required
                  data-testid="deal-value-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Total Commission</Label>
                  <Input
                    type="number"
                    value={formData.commission_total}
                    onChange={(e) => setFormData({ ...formData, commission_total: e.target.value })}
                    placeholder="20,000"
                    className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                    data-testid="deal-commission-total"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Agent Commission</Label>
                  <Input
                    type="number"
                    value={formData.agent_commission}
                    onChange={(e) => setFormData({ ...formData, agent_commission: e.target.value })}
                    placeholder="10,000"
                    className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                    data-testid="deal-agent-commission"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="btn-outline-gold">
                  Cancel
                </Button>
                <Button type="submit" className="btn-gold" data-testid="create-deal-submit">
                  Create Deal
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pipeline View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {pipelineStages.map((stage) => (
          <div key={stage.id} className="space-y-3" data-testid={`pipeline-${stage.id}`}>
            {/* Stage Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                <span className="text-sm font-medium text-white">{stage.label}</span>
              </div>
              <Badge variant="secondary" className="bg-white/5 text-muted-foreground">
                {getDealsByStage(stage.id).length}
              </Badge>
            </div>

            {/* Stage Cards */}
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-3 pr-2">
                {getDealsByStage(stage.id).length === 0 ? (
                  <div className="p-4 rounded-lg border border-dashed border-white/10 text-center">
                    <p className="text-xs text-muted-foreground">No deals</p>
                  </div>
                ) : (
                  getDealsByStage(stage.id).map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Pipeline</p>
                <p className="text-2xl font-bold text-white font-['Manrope']">
                  ${deals.filter(d => !['closed', 'cancelled'].includes(d.status))
                    .reduce((sum, d) => sum + (d.deal_value || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Closed Deals</p>
                <p className="text-2xl font-bold text-white font-['Manrope']">
                  ${deals.filter(d => d.status === 'closed')
                    .reduce((sum, d) => sum + (d.deal_value || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                <Building className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Commission</p>
                <p className="text-2xl font-bold text-[#D4AF37] font-['Manrope']">
                  ${deals.filter(d => d.status === 'closed')
                    .reduce((sum, d) => sum + (d.agent_commission || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DealsPage;
