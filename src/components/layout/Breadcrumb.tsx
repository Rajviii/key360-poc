"use client";

import * as React from "react";
import { Breadcrumb } from "@progress/kendo-react-layout";

interface BreadcrumbProps {
  items: string[];
}

export default function BreadcrumbComponent({ items }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  const initialItems = items.map((item, index) => ({
    id: `item-${index}`,
    title: item,
    iconClass: index === 0 ? "k-i-home" : undefined,
  }));

  const [data, setData] = React.useState(initialItems);

  React.useEffect(() => {
    setData(initialItems);
  }, [items]);

  const handleItemSelect = (event: any) => {
    const itemIndex = data.findIndex((curValue) => curValue.id === event.target.props.id);
    if (itemIndex !== -1) {
      const newData = data.slice(0, itemIndex + 1);
      setData(newData);
    }
  };

  return (
    <div className="mb-2">
      <Breadcrumb
        data={data}
        textField={"title"}
        onItemSelect={handleItemSelect}
      />
    </div>
  );
}
