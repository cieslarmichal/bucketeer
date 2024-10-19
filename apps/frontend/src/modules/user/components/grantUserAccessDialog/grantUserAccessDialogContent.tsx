import { FC } from "react";
import { DialogContent } from "../../../../../@/components/ui/dialog";
import { GrantUserAccessDialogForm } from "./grantUserAccessDialogForm";
import { GrantUserAccessDialogHeader } from "./grantUserAccessDialogHeader";

interface GrantUserAccessDialogContentProps {
    bucketName: string;
    onOpenChange: (val: boolean) => void;
  }
export   const GrantUserAccessDialogContent: FC<GrantUserAccessDialogContentProps> = ({ bucketName, onOpenChange }) => {
    return (
      <DialogContent className="sm:max-w-md">
        <GrantUserAccessDialogHeader bucketName={bucketName} />
        <GrantUserAccessDialogForm bucketName={bucketName} onConfirm={onOpenChange}/>
      </DialogContent>
    )
}
  