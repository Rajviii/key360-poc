"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  AppBarSection,
  AppBarSpacer,
  Avatar,
  Drawer,
  DrawerContent,
  DrawerSelectEvent
} from "@progress/kendo-react-layout";
import { Button } from "@progress/kendo-react-buttons";
import * as svgIcons from "@progress/kendo-svg-icons";

const kendokaAvatar = "https://demos.telerik.com/kendo-react-ui/assets/suite/kendoka-react.png";

export default function DrawerRouterContainer(props: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Expanded state for drawer collapsing
  const [expanded, setExpanded] = React.useState<boolean>(true);

  // Key360 Menu items mapping to the Kendo SVG icons and Next.js routes
  const items = [
    {
      text: "Dashboard",
      svgIcon: svgIcons.gridLayoutIcon,
      route: "/",
      selected: pathname === "/",
    },
    {
      separator: true,
    },
    {
      text: "Timesheets",
      svgIcon: svgIcons.calendarIcon,
      route: "/timesheet",
      selected: pathname === "/timesheet",
    },
    {
      separator: true,
    },
    {
      text: "Assets (Future)",
      svgIcon: svgIcons.gearsIcon,
      route: "#",
      disabled: true,
    },
    {
      separator: true,
    },
    {
      text: "Vendors (Future)",
      svgIcon: svgIcons.cartIcon,
      route: "#",
      disabled: true,
    },
    {
      separator: true,
    },
    {
      text: "Work Orders (Future)",
      svgIcon: svgIcons.fileTextIcon,
      route: "#",
      disabled: true,
    },
    {
      separator: true,
    },
    {
      text: "Projects (Future)",
      svgIcon: svgIcons.folderIcon,
      route: "#",
      disabled: true,
    },
  ];

  const [selected, setSelected] = React.useState(() => {
    const activeIdx = items.findIndex((x) => x.route === pathname);
    return activeIdx !== -1 ? activeIdx : 0;
  });

  // Sync selected index when pathname changes
  React.useEffect(() => {
    const activeIdx = items.findIndex((x) => x.route === pathname);
    if (activeIdx !== -1) {
      setSelected(activeIdx);
    }
  }, [pathname]);

  const handleClick = () => {
    setExpanded(!expanded);
  };

  const onSelect = (e: DrawerSelectEvent) => {
    const item = items[e.itemIndex];
    if (item && !item.disabled && item.route && item.route !== "#") {
      router.push(item.route);
      setSelected(e.itemIndex);
    }
  };

  return (
    <>
      <AppBar className="bg-[#004d26] text-white border-none h-14 flex items-center justify-between px-4 z-50">
        <AppBarSection>
          <Button svgIcon={svgIcons.layoutIcon} fillMode="flat" onClick={handleClick} className="text-white hover:bg-[#00381b] cursor-pointer" />
        </AppBarSection>

        <AppBarSection className="flex items-center gap-3">
          <h1 className="title font-extrabold text-base tracking-widest text-white select-none cursor-pointer" onClick={() => router.push("/")}>
            KEY360
          </h1>
          <span className="text-green-500 hidden xs:inline">|</span>
          <span className="text-xs text-green-200 hidden xs:inline font-medium">
            Training &bull; Demo Work &bull; <span className="font-bold text-white">DIW001</span>
          </span>
        </AppBarSection>

        <AppBarSpacer />

        <AppBarSection className="flex items-center gap-3.5">
          {/* Notifications bell */}
          <div className="relative cursor-pointer p-1 rounded hover:bg-[#00381b] transition-colors flex items-center justify-center">
            <span className="k-icon k-i-bell text-lg text-white"></span>
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-600 rounded-full text-[8px] font-bold flex items-center justify-center text-white ring-1 ring-[#004d26]">
              3
            </span>
          </div>

          <Avatar type="image" className="w-8 h-8 rounded-full border border-green-600 cursor-pointer">
            <img src={kendokaAvatar} alt="KendoReact Layout Kendoka Avatar" />
          </Avatar>
        </AppBarSection>
      </AppBar>

      <Drawer
        expanded={expanded}
        mode="push"
        position="start"
        mini={true}
        items={items.map((item, index) => ({
          ...item,
          selected: index === selected,
        }))}
        onSelect={onSelect}
      >
        <DrawerContent>
          <div className="content">
            {props.children}
          </div>
        </DrawerContent>
      </Drawer>
      <style>{`
        .header { padding: 20px; text-align: center; }
        .content { padding: 30px 24px; }
      `}</style>
    </>
  );
}
