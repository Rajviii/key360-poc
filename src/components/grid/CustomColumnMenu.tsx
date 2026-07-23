"use client";

import * as React from "react";
import {
    GridColumnMenuItemGroup,
    GridColumnMenuItem,
    GridColumnMenuGroup,
    GridColumnMenuProps
} from "@progress/kendo-react-grid";
import { windowRestoreIcon, colResizeIcon } from "@progress/kendo-svg-icons";
import { GridColumn } from "@/types/metadata";

interface CustomColumnMenuPropsExtended extends GridColumnMenuProps {
    columns: GridColumn[];
    setColumns: React.Dispatch<React.SetStateAction<GridColumn[]>>;
    onOpenReorderWindow: (column: any) => void;
    onOpenResizeWindow: (column: any) => void;
}

export const CustomColumnMenu: React.FC<CustomColumnMenuPropsExtended> = ({
    columns,
    setColumns,
    onOpenReorderWindow,
    onOpenResizeWindow,
    ...props
}) => {
    const [columnsExpanded, setColumnsExpanded] = React.useState<boolean>(false);
    const [filterExpanded, setFilterExpanded] = React.useState<boolean>(false);

    const onMenuItemClick = (e: any) => {
        const value = !columnsExpanded;
        setColumnsExpanded(value);
        setFilterExpanded(value ? false : filterExpanded);
        onOpenReorderWindow(props.column);
        if (props.onCloseMenu) {
            props.onCloseMenu();
        }
    };

    const onResizeMenuItemClick = () => {
        onOpenResizeWindow(props.column);
        if (props.onCloseMenu) {
            props.onCloseMenu();
        }
    };

    return (
        <div>
            <GridColumnMenuItemGroup>
                <GridColumnMenuItem
                    title={"Reorder Columns"}
                    iconClass={"k-i-columns"}
                    onClick={onMenuItemClick}
                    svgIcon={windowRestoreIcon}
                />
                <GridColumnMenuItem
                    title={"Resize Column"}
                    iconClass={"k-i-resize"}
                    onClick={onResizeMenuItemClick}
                    svgIcon={colResizeIcon}
                />
            </GridColumnMenuItemGroup>
            <GridColumnMenuGroup {...(props as any)} />
        </div>
    );
};
