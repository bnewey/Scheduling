import React from "react";

const navButtons = [
    {
        label: "Home",
        path: ""
    },
    {
        label: "Work Orders",
        path: "work_orders",
    },
    {
        label: "Purchase Orders",
        path: "purchase_orders",
    },
    {
        label: "Entities",
        path: "entities",
    },
    {
        label: "Signs",
        path: "signs",
    },
    {
        label: "Inventory",
        path: "inventory",
    },
    {
        label: "WO Table",
        path: "work_orders_table"
    },
    {
        label: "Search Items",
        path: "search_items"
    },
    {
        label: "Admin",
        path: 'admin',
        adminOnly: true
    }
];

export default navButtons;
