import { useState } from "react";
import { CreateUserDialog } from "../../user/components/createUserDialog/createUserDialog"
import { AdminTabSelector } from "./AdminTabSelector"


export const UserTopBar = () => {
    const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);

    return (
        <div className="max-w-[40rem] md:max-w-screen-xl md:min-w-[50rem] flex flex-col w-full justify-center items-center px-4">
            <AdminTabSelector currentlySelected="user" />
            <div className="pt-4 w-full">
            <CreateUserDialog
                    onOpenChange={setCreateUserDialogOpen}
                    open={createUserDialogOpen}
                />
            </div>
        </div>
    );
}
