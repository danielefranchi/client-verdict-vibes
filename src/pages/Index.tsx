import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { ClientCard } from '@/components/ClientCard';
import { RatingDialog } from '@/components/RatingDialog';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Fetch clients
  const { data: clients = [], refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearching(value.length > 0);
  };

  // Split clients into good and bad based on response and payment
  const goodClients = filteredClients.filter(client => 
    client.responded && client.paid === 'yes'
  );

  const badClients = filteredClients.filter(client => 
    !client.responded || client.paid === 'no'
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      {/* Logo */}
      <div className="text-center mb-8">
        <img 
          src="/lovable-uploads/0ce1c75d-20f4-4971-9813-501d311e4180.png" 
          alt="Logo"
          className="h-12 mx-auto mb-4"
        />
        <h1 className="text-[1.17rem] font-medium mb-2">
          Scopri se un cliente risponde al tuo preventivo
        </h1>
        <p className="text-gray-600">e se paga davvero.</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <Input
          className="h-12"
          placeholder="Cerca nome azienda, progetto o cliente"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <Separator className="my-16" />

      {!isSearching ? (
        <div className="max-w-[600px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Bad Clients */}
            <div>
              <h2 className="text-xl font-semibold mb-16 flex items-center justify-center gap-2">
                <span>🚨</span>
                <span>Evitali</span>
                <span>🚨</span>
              </h2>
              <div className="space-y-12">
                {badClients.map(client => (
                  <ClientCard
                    key={client.id}
                    name={client.name}
                    ratings={1}
                    responseRate={client.responded ? 100 : 0}
                    paymentRate={client.paid === 'yes' ? 100 : client.paid === 'late' ? 50 : 0}
                    onRate={() => setShowRatingDialog(true)}
                  />
                ))}
              </div>
            </div>

            {/* Good Clients */}
            <div>
              <h2 className="text-xl font-semibold mb-16 flex items-center justify-center gap-2">
                <span>✨</span>
                <span>Migliori clienti</span>
                <span>✨</span>
              </h2>
              <div className="space-y-12">
                {goodClients.map(client => (
                  <ClientCard
                    key={client.id}
                    name={client.name}
                    ratings={1}
                    responseRate={100}
                    paymentRate={100}
                    onRate={() => setShowRatingDialog(true)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          {filteredClients.length === 0 && (
            <div className="space-y-4">
              <p>Nessun cliente trovato con questo nome.</p>
              <Button
                onClick={() => setShowRatingDialog(true)}
                className="rounded-full px-6 bg-black hover:bg-white hover:text-black border-2 border-black transition-colors"
              >
                Aggiungi nuovo cliente
              </Button>
            </div>
          )}
        </div>
      )}

      <RatingDialog 
        open={showRatingDialog} 
        onOpenChange={setShowRatingDialog}
        skipNameStep={!isSearching}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default Index;