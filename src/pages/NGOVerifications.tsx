import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Eye, FileText, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NGOVerification {
  id: string;
  name: string;
  darpan_id: string;
  registration_cert_url: string;
  pan_url: string;
  verification_status: string;
  created_at: string;
}

export default function NGOVerifications() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState<NGOVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNGO, setSelectedNGO] = useState<NGOVerification | null>(null);
  const [viewDocDialog, setViewDocDialog] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (profile && profile.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    
    fetchVerifications();
  }, [profile, navigate]);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, darpan_id, registration_cert_url, pan_url, verification_status, created_at')
        .eq('role', 'NGO')
        .not('darpan_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load verification requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async (ngoId: string, action: 'VERIFIED' | 'REJECTED') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          verification_status: action,
          verified_at: action === 'VERIFIED' ? new Date().toISOString() : null,
          verification_notes: notes
        })
        .eq('id', ngoId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `NGO ${action === 'VERIFIED' ? 'verified' : 'rejected'} successfully`
      });

      setSelectedNGO(null);
      setNotes('');
      fetchVerifications();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to update verification status',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      PENDING: { variant: "secondary", label: "Pending" },
      VERIFIED: { variant: "default", label: "Verified" },
      REJECTED: { variant: "destructive", label: "Rejected" },
      UNVERIFIED: { variant: "outline", label: "Unverified" }
    };
    
    const config = variants[status] || variants.UNVERIFIED;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">NGO Verifications</h1>
              <p className="text-sm text-muted-foreground">Review and approve NGO verification requests</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Verification Requests</CardTitle>
            <CardDescription>Review NGO documents and approve or reject verification requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NGO Name</TableHead>
                  <TableHead>DARPAN ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.map((ngo) => (
                  <TableRow key={ngo.id}>
                    <TableCell className="font-medium">{ngo.name}</TableCell>
                    <TableCell>{ngo.darpan_id}</TableCell>
                    <TableCell>{getStatusBadge(ngo.verification_status)}</TableCell>
                    <TableCell>{new Date(ngo.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedNGO(ngo);
                            setViewDocDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={viewDocDialog} onOpenChange={setViewDocDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review NGO Verification</DialogTitle>
            <DialogDescription>
              Review documents and approve or reject this NGO verification request
            </DialogDescription>
          </DialogHeader>
          
          {selectedNGO && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">NGO Name:</p>
                <p className="text-muted-foreground">{selectedNGO.name}</p>
              </div>

              <div>
                <p className="font-semibold">DARPAN ID:</p>
                <p className="text-muted-foreground">{selectedNGO.darpan_id}</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">Documents:</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedNGO.registration_cert_url, '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Registration Certificate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedNGO.pan_url, '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View PAN Document
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this verification..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewDocDialog(false);
                    setSelectedNGO(null);
                    setNotes('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleVerificationAction(selectedNGO.id, 'REJECTED')}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleVerificationAction(selectedNGO.id, 'VERIFIED')}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}