import { Loader2 } from 'lucide-react';

export const SmallSpinnerLoader = ({ size = 18 }: { size?: number }) => (
  <Loader2 size={size} className="animate-spin" />
);
