import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import PriceLibraryClient from "./PriceLibraryClient";

export default async function PriceLibraryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/login`);

  // Only admin and manager roles may access the price library
  const allowedRoles = ["admin", "manager"];
  const userRole = String(session.user.role || "").toLowerCase();
  if (!allowedRoles.includes(userRole)) {
    redirect(`/${locale}/dashboard`);
  }

  const priceItems = await prisma.priceItem.findMany({
    where: { isActive: true },
    include: {
      translations: { where: { languageCode: locale }, select: { label: true } },
      costLot: {
        include: {
          translations: { where: { languageCode: locale } },
          category: { include: { translations: { where: { languageCode: locale } } } },
        },
      },
      updateLogs: { orderBy: { updatedAt: "desc" }, take: 1 },
    },
    orderBy: [{ costLot: { sortOrder: "asc" } }, { itemCode: "asc" }],
  });

  const isAdmin = userRole === "admin";

  return <PriceLibraryClient items={priceItems} isAdmin={isAdmin} locale={locale} />;
}
