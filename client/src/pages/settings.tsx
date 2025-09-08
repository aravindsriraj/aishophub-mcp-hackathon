import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Key, Copy, Trash2, Plus, Calendar, Clock, Settings as SettingsIcon } from "lucide-react";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";

interface ApiToken {
  id: string;
  name: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
}

export default function Settings() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [newToken, setNewToken] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tokens', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTokens(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch API tokens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateToken = async () => {
    if (!newTokenName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a token name",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newTokenName })
      });

      if (response.ok) {
        const data = await response.json();
        setNewToken(data.token);
        setShowCreateDialog(false);
        setShowTokenDialog(true);
        setNewTokenName("");
        await fetchTokens();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to create token",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API token",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteToken = async (tokenId: string) => {
    setDeleting(tokenId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tokens/${tokenId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "API token deleted successfully"
        });
        await fetchTokens();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete token",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API token",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(newToken);
    toast({
      title: "Copied!",
      description: "Token copied to clipboard"
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>API Tokens</CardTitle>
                <CardDescription>
                  Manage your API tokens for programmatic access to the API
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2"
                data-testid="button-create-token"
              >
                <Plus className="h-4 w-4" />
                Generate New Token
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading tokens...
              </div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-8">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No API tokens yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create your first API token to start using the API
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.map((token) => (
                    <TableRow key={token.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-muted-foreground" />
                          {token.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(token.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {token.lastUsedAt ? (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(token.lastUsedAt), 'MMM dd, yyyy')}
                          </div>
                        ) : (
                          <Badge variant="secondary">Never</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {token.expiresAt ? (
                          <Badge variant={new Date(token.expiresAt) < new Date() ? "destructive" : "default"}>
                            {format(new Date(token.expiresAt), 'MMM dd, yyyy')}
                          </Badge>
                        ) : (
                          <Badge variant="outline">No expiry</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteToken(token.id)}
                          disabled={deleting === token.id}
                          data-testid={`button-delete-token-${token.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Token Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New API Token</DialogTitle>
              <DialogDescription>
                Enter a name for your new API token. This will help you identify it later.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Token name (e.g., Production API)"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateToken()}
                data-testid="input-token-name"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateToken} disabled={creating}>
                {creating ? "Creating..." : "Create Token"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Show Token Dialog */}
        <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Your New API Token</DialogTitle>
              <DialogDescription>
                Save this token securely. You won't be able to see it again!
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-muted p-4 rounded-lg font-mono text-sm break-all">
                {newToken}
              </div>
              <Button
                onClick={copyToken}
                className="w-full mt-4"
                variant="outline"
                data-testid="button-copy-token"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Token
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => {
                setShowTokenDialog(false);
                setNewToken("");
              }}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}