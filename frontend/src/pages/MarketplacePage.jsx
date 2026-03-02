import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize,
  Star,
  Search,
  Building,
  Home,
  Castle,
  Building2,
  Filter,
  Phone,
  Mail
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const propertyTypes = [
  { id: 'all', label: 'All', icon: Building },
  { id: 'apartment', label: 'Apartment', icon: Building },
  { id: 'villa', label: 'Villa', icon: Home },
  { id: 'penthouse', label: 'Penthouse', icon: Star },
  { id: 'townhouse', label: 'Townhouse', icon: Castle },
];

const MarketplacePage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    seedAndFetchProperties();
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [activeType]);

  const seedAndFetchProperties = async () => {
    try {
      // Seed sample data
      await axios.post(`${API_URL}/api/seed/properties`);
      fetchProperties();
    } catch (error) {
      console.error('Seed error:', error);
      fetchProperties();
    }
  };

  const fetchProperties = async () => {
    try {
      const params = {};
      if (activeType !== 'all') {
        params.property_type = activeType;
      }
      const response = await axios.get(`${API_URL}/api/properties`, { params });
      setProperties(response.data);
    } catch (error) {
      toast.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(prop =>
    prop.title?.toLowerCase().includes(search.toLowerCase()) ||
    prop.location?.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `AED ${(price / 1000000).toFixed(1)}M`;
    }
    return `AED ${price?.toLocaleString()}`;
  };

  const openDetails = (prop) => {
    setSelectedProperty(prop);
    setDetailsOpen(true);
  };

  const PropertyCard = ({ property }) => (
    <Card 
      className="bg-[#0F0F0F] border-white/5 overflow-hidden group cursor-pointer hover:border-[#D4AF37]/30 transition-all duration-300"
      onClick={() => openDetails(property)}
      data-testid={`property-card-${property.id}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={property.image_url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {property.is_featured && (
          <Badge className="absolute top-3 left-3 bg-[#D4AF37] text-black">
            <Star className="w-3 h-3 mr-1" /> Featured
          </Badge>
        )}
        <Button 
          size="icon" 
          variant="ghost" 
          className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white"
          onClick={(e) => {
            e.stopPropagation();
            toast.success('Added to favorites');
          }}
        >
          <Star className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-white text-lg mb-2 line-clamp-1 font-['Manrope']">
          {property.title}
        </h3>
        
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-4 h-4 text-[#D4AF37]" />
          {property.location}
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" /> {property.bedrooms}
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" /> {property.bathrooms}
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4" /> {property.size_sqm} m²
          </div>
        </div>

        {/* Price */}
        <p className="text-[#D4AF37] font-bold text-xl font-['Manrope']">
          {formatPrice(property.price)}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6" data-testid="marketplace-page">
      {/* Header with background */}
      <div 
        className="relative rounded-2xl overflow-hidden p-8 bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600)'
        }}
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white font-['Manrope'] mb-2">Marketplace</h1>
          <p className="text-muted-foreground">UAE Premium Properties</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Property Type Tabs */}
        <div className="flex gap-2 flex-wrap">
          {propertyTypes.map((type) => (
            <Button
              key={type.id}
              variant={activeType === type.id ? "default" : "outline"}
              className={activeType === type.id ? "btn-gold" : "bg-[#1A1A1A] border-white/10 text-white hover:border-[#D4AF37]/50"}
              onClick={() => setActiveType(type.id)}
              data-testid={`filter-${type.id}`}
            >
              <type.icon className="w-4 h-4 mr-2" />
              {type.label}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#1A1A1A] border-white/10 focus:border-[#D4AF37]"
            data-testid="marketplace-search"
          />
        </div>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-[#D4AF37]">Loading properties...</div>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No properties found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {/* Property Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-[#0F0F0F] border-white/10 max-w-2xl">
          {selectedProperty && (
            <>
              <div className="relative h-64 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
                <img 
                  src={selectedProperty.image_url}
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
                {selectedProperty.is_featured && (
                  <Badge className="absolute top-4 left-4 bg-[#D4AF37] text-black">
                    <Star className="w-3 h-3 mr-1" /> Featured
                  </Badge>
                )}
              </div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white font-['Manrope']">
                  {selectedProperty.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  {selectedProperty.location}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <p className="text-muted-foreground">{selectedProperty.description}</p>
                
                {/* Features */}
                <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-[#1A1A1A]">
                  <div className="text-center">
                    <Bed className="w-6 h-6 text-[#D4AF37] mx-auto mb-1" />
                    <p className="text-white font-semibold">{selectedProperty.bedrooms}</p>
                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                  </div>
                  <div className="text-center">
                    <Bath className="w-6 h-6 text-[#D4AF37] mx-auto mb-1" />
                    <p className="text-white font-semibold">{selectedProperty.bathrooms}</p>
                    <p className="text-xs text-muted-foreground">Bathrooms</p>
                  </div>
                  <div className="text-center">
                    <Maximize className="w-6 h-6 text-[#D4AF37] mx-auto mb-1" />
                    <p className="text-white font-semibold">{selectedProperty.size_sqm}</p>
                    <p className="text-xs text-muted-foreground">Sq. Meters</p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-[#D4AF37]/10">
                  <span className="text-muted-foreground">Price</span>
                  <span className="text-3xl font-bold text-[#D4AF37] font-['Manrope']">
                    {formatPrice(selectedProperty.price)}
                  </span>
                </div>

                {/* Contact Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button className="btn-gold" data-testid="contact-phone">
                    <Phone className="w-4 h-4 mr-2" /> Call Agent
                  </Button>
                  <Button variant="outline" className="btn-outline-gold" data-testid="contact-email">
                    <Mail className="w-4 h-4 mr-2" /> Send Inquiry
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketplacePage;
