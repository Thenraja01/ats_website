import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/utils';

export default function ErrorState({ error, onRetry, className, title = 'Something went wrong' }) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="size-4" />
      <AlertTitle className="text-sm">{title}</AlertTitle>
      <AlertDescription className="flex items-center gap-2 text-xs">
        <span className="break-words">{getApiErrorMessage(error, 'Unable to load data.')}</span>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry} className="mt-1 h-7 gap-1.5">
            <RefreshCw className="size-3.5" /> Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}