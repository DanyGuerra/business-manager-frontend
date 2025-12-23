import { cookies } from "next/headers";
import { getMe, getUserRoles } from "@/lib/serverApi";
import BusinessLayoutClient from "./BusinessLayoutClient";
import { UserRolesBusiness } from "@/lib/useUserRolesBusiness";

export default async function BusinessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value || "";

  const mePromise = getMe(token);

  const [me] = await Promise.all([mePromise]);

  let userRoles: UserRolesBusiness[] = [];
  if (me) {
    userRoles = await getUserRoles(me.id, id, token);
  }

  return (
    <BusinessLayoutClient
      businessId={id}
      initialUserRoles={userRoles}
    >
      {children}
    </BusinessLayoutClient>
  );
}
