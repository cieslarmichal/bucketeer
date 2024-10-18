import { useState } from "react";
import { CreateBucketDialog } from "../../bucket/components/createBucketDialog/createBucketDialog"
import { AdminTabSelector } from "./AdminTabSelector"

export const BucketTopBar = () => {
    const [createBucketDialogOpen, setCreateBucketDialogOpen] = useState(false);

    return (
      <div className="max-w-[40rem] md:max-w-screen-xl md:min-w-[50rem] flex flex-col w-full justify-center items-center px-4">
        <AdminTabSelector currentlySelected="bucket" />
        <div className="pt-4 w-full">
            <CreateBucketDialog
              dialogOpen={createBucketDialogOpen}
              onOpenChange={setCreateBucketDialogOpen}
            />
        </div>
      </div>
    );
}
