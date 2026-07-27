"use client";

import * as React from "react";
import {
    GridColumnMenuItemGroup,
    GridColumnMenuItem,
    GridColumnMenuGroup,
    GridColumnMenuProps,
    GridColumnMenuFilter,
    GridColumnMenuCheckboxFilter
} from "@progress/kendo-react-grid";
import { windowRestoreIcon, colResizeIcon } from "@progress/kendo-svg-icons";
import { GridColumn } from "@/types/metadata";

interface CustomColumnMenuPropsExtended extends GridColumnMenuProps {
    columns: GridColumn[];
    setColumns: React.Dispatch<React.SetStateAction<GridColumn[]>>;
    onOpenReorderWindow: (column: any) => void;
    onOpenResizeWindow: (column: any) => void;
    data: any[];
}

export const CustomColumnMenu: React.FC<CustomColumnMenuPropsExtended> = ({
    columns,
    setColumns,
    onOpenReorderWindow,
    onOpenResizeWindow,
    data,
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

    const colMetadata = columns.find((c) => c.field === props.column.field);
    const colType = colMetadata?.type;

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
            {colType === "number" || colType === "date" ? (
                <GridColumnMenuFilter {...props} alwaysExpand={true} />
            ) : (
                <GridColumnMenuCheckboxFilter {...props} data={data} alwaysExpand={true} />
            )}
        </div>
    );
};
