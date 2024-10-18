import { FC, ReactNode } from "react";

export interface TableLayoutProps {
    TopBar: ReactNode;
    Table: ReactNode;
}

export const TableLayout: FC<TableLayoutProps> = ({ Table, TopBar }) => {
    return (
        <div className="w-full flex flex-col items-center justify-center p-4">
            {TopBar}
            {Table}
        </div>
    );
}
