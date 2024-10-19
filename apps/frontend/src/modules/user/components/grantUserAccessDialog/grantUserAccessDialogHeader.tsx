import { FC } from "react";
import { DialogHeader, DialogTitle } from "../../../../../@/components/ui/dialog";

interface GrantUserAccessDialogHeaderProps {
    bucketName: string;
  } 
export const GrantUserAccessDialogHeader: FC<GrantUserAccessDialogHeaderProps> = ({ bucketName }) => (
    <DialogHeader>
        <DialogTitle>
        Assign access to bucket <b>{bucketName}</b>{' '}
        </DialogTitle>
    </DialogHeader>
);
