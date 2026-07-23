"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Gantt,
  GanttWeekView,
  GanttMonthView,
  GanttDayView,
  orderBy,
  mapTree,
  extendDataItem,
  GanttExpandChangeEvent,
  GanttSortChangeEvent,
} from "@progress/kendo-react-gantt";
import { getter } from "@progress/kendo-react-common";
import { GridColumn } from "@/types/metadata";

interface GenericGanttProps {
  data: any[];
  dependencies: any[];
  columns: GridColumn[];
  taskModelFields: {
    id: string;
    start: string;
    end: string;
    title: string;
    percentComplete: string;
    isRollup: string;
    isExpanded: string;
    isInEdit: string;
    children: string;
  };
  dependencyModelFields: {
    id: string;
    fromId: string;
    toId: string;
    type: string;
  };
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onRowClick?: (item: any) => void;
  dataItemKey?: string;
}

const ganttStyle = {
  height: 550,
  width: "100%",
};

export default function GenericGantt({
  data,
  dependencies,
  columns,
  taskModelFields,
  dependencyModelFields,
  onEdit,
  onDelete,
  onRowClick,
  dataItemKey = "id",
}: GenericGanttProps) {
  const getTaskId = useMemo(() => getter(taskModelFields.id), [taskModelFields.id]);

  // State for expanded rows
  const [expandedState, setExpandedState] = useState<number[]>([1, 4, 7]);

  // State for sorting
  const [sort, setSort] = useState<any[]>([{ field: "id", dir: "asc" }]);

  const onSortChange = useCallback((event: GanttSortChangeEvent) => {
    setSort(event.sort);
  }, []);

  const onExpandChange = useCallback(
    (event: GanttExpandChangeEvent) => {
      const id = getTaskId(event.dataItem);
      const newExpandedState = event.value
        ? expandedState.filter((currentId) => currentId !== id)
        : [...expandedState, id];

      setExpandedState(newExpandedState);
    },
    [expandedState, getTaskId]
  );

  // Process data with sorting and expanded state
  const processedData = useMemo(() => {
    const sortedData = orderBy(data, sort, taskModelFields.children);

    return mapTree(sortedData, taskModelFields.children, (task: any) =>
      extendDataItem(task, taskModelFields.children, {
        [taskModelFields.isExpanded]: expandedState.includes(getTaskId(task)),
      })
    );
  }, [data, sort, expandedState, taskModelFields.children, taskModelFields.isExpanded, getTaskId]);

  // Action Buttons Renderer
  const ActionsCell = useCallback((props: any) => {
    const item = props.dataItem;
    return (
      <td style={{ textAlign: "right" }} className="px-6 py-3 space-x-2 actions-cell">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onEdit) onEdit(item);
          }}
          className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded transition-colors cursor-pointer text-xs font-semibold"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete(item);
          }}
          className="text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded transition-colors cursor-pointer text-xs font-semibold"
        >
          Delete
        </button>
      </td>
    );
  }, [onEdit, onDelete]);

  const ganttColumns = useMemo(() => {
    const baseCols = columns.map((col) => ({
      field: col.field,
      title: col.title,
      width: col.width || 150,
      expandable: col.field === taskModelFields.title,
    }));

    return [
      ...baseCols,
      {
        field: "actions",
        title: "Actions",
        width: 160,
        cell: ActionsCell,
      },
    ];
  }, [columns, taskModelFields.title, ActionsCell]);

  return (
    <div className="relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-1 k-gantt-wrapper">
      <Gantt
        style={ganttStyle}
        taskData={processedData}
        taskModelFields={taskModelFields}
        dependencyData={dependencies}
        dependencyModelFields={dependencyModelFields}
        sortable={true}
        sort={sort}
        onSortChange={onSortChange}
        onExpandChange={onExpandChange}
        onRowClick={(e: any) => {
          const target = e.syntheticEvent.target as HTMLElement;
          if (target.closest('.actions-cell') || target.tagName === 'BUTTON') {
            return;
          }
          if (onRowClick) {
            onRowClick(e.dataItem);
          }
        }}
        className="border-none"
        columns={ganttColumns}
      >
        <GanttWeekView />
        <GanttDayView />
        <GanttMonthView />
      </Gantt>

      {/* Contextual Action Help Text in Gantt Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 font-medium">
        <div>
          <span>💡 <strong>Timeline Navigation:</strong> Select Day, Week, or Month view in the top header. Use the vertical splitter to adjust grid vs timeline widths.</span>
        </div>
        <div>
          <span className="text-green-700 font-semibold">Key360 Enterprise Project Planning View</span>
        </div>
      </div>
    </div>
  );
}
