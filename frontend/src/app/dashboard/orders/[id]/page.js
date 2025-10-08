"use client";

import DashboardLayout from "../../layout";
import OrderDetailsPage from "../../../../components/order/orderDetailsPage";

export default function DashboardOrderDetails() {
  return (
    <DashboardLayout>
      <OrderDetailsPage dashboardMode />
    </DashboardLayout>
  );
}
