import { useState } from 'react';

import { Button } from '../../../../../@/components/ui/button';
import { Dialog, DialogTrigger } from '../../../../../@/components/ui/dialog';
import { GrantUserAccessDialogContent } from './grantUserAccessDialogContent';

interface GrantUserAccessDialog {
  bucketName: string;
}

export const GrantUserAccessDialog = ({ bucketName }: GrantUserAccessDialog): JSX.Element => {
  const [open, setOpen] = useState(false);

  const onOpenChange = (val: boolean): void => {
    setOpen(val);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger asChild>
        <Button>Grant access</Button>
      </DialogTrigger>
      <GrantUserAccessDialogContent bucketName={bucketName} onOpenChange={onOpenChange} />
    </Dialog>
  );
};
