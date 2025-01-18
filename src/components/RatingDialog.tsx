import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RatingSteps } from './RatingSteps';
import { saveRating } from '@/utils/ratingUtils';
import { cn } from "@/lib/utils";

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skipNameStep?: boolean;
  onSuccess?: () => void;
  initialClientName?: string;
}

export const RatingDialog = ({ 
  open, 
  onOpenChange, 
  skipNameStep = false, 
  onSuccess,
  initialClientName = ''
}: RatingDialogProps) => {
  const [step, setStep] = useState(skipNameStep ? 1 : 0);
  const [name, setName] = useState(initialClientName);
  const [responded, setResponded] = useState<boolean | null>(null);
  const [paid, setPaid] = useState<'yes' | 'no' | 'late' | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setStep(skipNameStep ? 1 : 0);
      setName(initialClientName);
      setResponded(null);
      setPaid(null);
      setConfirmed(false);
    }
  }, [open, skipNameStep, initialClientName]);

  const handleSubmit = async () => {
    try {
      await saveRating(name, responded, paid);
      
      toast({
        title: "Valutazione salvata con successo!",
        description: "La tua valutazione è stata registrata.",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving client:', error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante il salvataggio.",
        variant: "destructive"
      });
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return name.length > 0;
      case 1:
        return responded !== null;
      case 2:
        return paid !== null;
      case 3:
        return confirmed;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white p-6 max-w-md mx-auto">
        <DialogTitle className="sr-only">Valuta Cliente</DialogTitle>
        
        {/* Stepper */}
        <div className="flex justify-center mb-8">
          {[0, 1, 2, 3].map((_, index) => (
            <React.Fragment key={index}>
              {index > 0 && <div className="w-4" />}
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  step === index ? "bg-black" : "bg-gray-300"
                )}
              />
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <RatingSteps
          step={step}
          name={name}
          responded={responded}
          paid={paid}
          confirmed={confirmed}
          setName={setName}
          setResponded={setResponded}
          setPaid={setPaid}
          setConfirmed={setConfirmed}
          setStep={setStep}
        />

        {/* Actions */}
        <div className="mt-8 flex justify-center">
          {step === 3 ? (
            <Button
              disabled={!canProceed()}
              onClick={handleSubmit}
              className="bg-black text-white hover:bg-white hover:text-black border-2 border-black transition-colors"
            >
              Pubblica
            </Button>
          ) : (
            <Button
              disabled={!canProceed()}
              onClick={() => setStep(step + 1)}
              className="bg-black text-white hover:bg-white hover:text-black border-2 border-black transition-colors"
            >
              Prosegui
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};