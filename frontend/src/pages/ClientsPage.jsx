import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';
import { Textarea } from '../components/ui/textarea';
import { 
  Search, 
  Plus,
  Phone,
  Mail,
  User,
  MessageSquare,
  Calendar,
  Send
} from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/clients`);
      setClients(response.data);
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (clientId) => {
    try {
      const response = await axios.get(`${API_URL}/api/notes/client/${clientId}`);
      setNotes(response.data);
    } catch (error) {
      console.error('Failed to fetch notes');
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/clients`, formData);
      toast.success('Client created successfully');
      setDialogOpen(false);
      setFormData({ name: '', phone: '', email: '' });
      fetchClients();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create client');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedClient) return;
    
    try {
      await axios.post(`${API_URL}/api/notes`, {
        entity_type: 'client',
        entity_id: selectedClient.id,
        text: newNote
      });
      setNewNote('');
      fetchNotes(selectedClient.id);
      toast.success('Note added');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const openClientDetails = (client) => {
    setSelectedClient(client);
    fetchNotes(client.id);
    setSheetOpen(true);
  };

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(search.toLowerCase()) ||
    client.phone?.includes(search) ||
    client.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="clients-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Manrope']">Clients</h1>
          <p className="text-muted-foreground">Manage your client relationships</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gold" data-testid="add-client-btn">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0F0F0F] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white font-['Manrope']">Add New Client</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter the client's information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Client name"
                  className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                  required
                  data-testid="client-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+971 50 123 4567"
                  className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                  required
                  data-testid="client-phone-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="client@email.com"
                  className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
                  data-testid="client-email-input"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="btn-outline-gold">
                  Cancel
                </Button>
                <Button type="submit" className="btn-gold" data-testid="create-client-submit">
                  Create Client
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
              data-testid="clients-search"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Client</TableHead>
                <TableHead className="text-muted-foreground">Contact</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Created</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading clients...
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No clients found
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow 
                    key={client.id} 
                    className="border-white/5 table-row-hover cursor-pointer"
                    onClick={() => openClientDetails(client)}
                    data-testid={`client-row-${client.id}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <p className="font-medium text-white">{client.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" /> {client.phone}
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" /> {client.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={client.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(client.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          openClientDetails(client);
                        }}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Client Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-[#0F0F0F] border-white/10 w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-white font-['Manrope']">{selectedClient?.name}</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Client details and notes
            </SheetDescription>
          </SheetHeader>
          
          {selectedClient && (
            <div className="mt-6 space-y-6">
              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contact</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white">
                    <Phone className="w-4 h-4 text-[#D4AF37]" />
                    {selectedClient.phone}
                  </div>
                  {selectedClient.email && (
                    <div className="flex items-center gap-2 text-white">
                      <Mail className="w-4 h-4 text-[#D4AF37]" />
                      {selectedClient.email}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Added {new Date(selectedClient.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Notes</h4>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {notes.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No notes yet</p>
                    ) : (
                      notes.map((note) => (
                        <div key={note.id} className="p-3 rounded-lg bg-[#1A1A1A]">
                          <p className="text-white text-sm">{note.text}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(note.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                
                {/* Add Note */}
                <div className="flex gap-2">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37] resize-none"
                    rows={2}
                    data-testid="add-note-input"
                  />
                  <Button 
                    size="icon" 
                    className="btn-gold h-auto"
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    data-testid="add-note-btn"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ClientsPage;
