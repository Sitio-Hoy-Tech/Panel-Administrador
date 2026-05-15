import { getCupones } from "@/actions/emprendimiento/cupones";
import { CouponsClient } from "./CouponsClient";

export default async function CuponesPage() {
  const result = await getCupones();
  const coupons = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <CouponsClient initialCoupons={coupons} />
    </div>
  );
}
