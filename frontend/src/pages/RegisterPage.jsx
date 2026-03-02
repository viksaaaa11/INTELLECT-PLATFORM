import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Building2, Mail, Lock, User, Phone, ArrowRight, CreditCard } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'agent',
    rera_id: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Left side - Image */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1757439402296-000be181e38b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHxfHxtb2Rlcm4lMjBsdXh1cnklMjB2aWxsYSUyMGV4dGVyaW9yJTIwbmlnaHR8ZW58MHx8fHwxNzcyNDY4OTQxfDA&ixlib=rb-4.1.0&q=85)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <h2 className="text-4xl font-bold text-white font-['Manrope'] mb-4">
            Join the Leading
            <span className="text-[#D4AF37]"> Real Estate Platform</span>
          </h2>
          <p className="text-gray-300 text-lg max-w-md">
            Connect with leads, manage deals, and collaborate with other brokers. Start your journey today.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center gold-glow">
              <Building2 className="w-7 h-7 text-black" />
            </div>
            <div>
              <span className="font-bold text-2xl text-white font-['Manrope']">INTELLECT</span>
              <p className="text-xs text-muted-foreground">Real Estate Platform</p>
            </div>
          </div>

          <Card className="bg-[#0F0F0F] border-white/5">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-white font-['Manrope']">Create account</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your details to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 bg-[#1A1A1A] border-transparent focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                      required
                      data-testid="register-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 bg-[#1A1A1A] border-transparent focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                      required
                      data-testid="register-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+971 50 123 4567"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10 bg-[#1A1A1A] border-transparent focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                      data-testid="register-phone"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 bg-[#1A1A1A] border-transparent focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                      required
                      data-testid="register-password"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Role</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger className="bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]" data-testid="register-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-white/10">
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="team_manager">Team Manager</SelectItem>
                        <SelectItem value="company_admin">Company Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rera_id" className="text-gray-300">RERA ID</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="rera_id"
                        name="rera_id"
                        placeholder="BRN-12345"
                        value={formData.rera_id}
                        onChange={handleChange}
                        className="pl-10 bg-[#1A1A1A] border-transparent focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                        data-testid="register-rera"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-gold h-11"
                  disabled={loading}
                  data-testid="register-submit"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#D4AF37] hover:underline font-medium" data-testid="login-link">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
