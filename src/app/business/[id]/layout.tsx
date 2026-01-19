import { cookies } from "next/headers";
import { getMe, getUserRoles } from "@/lib/serverApi";
import { refreshServerToken } from "@/lib/serverAuth";
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
  let token = cookieStore.get("accessToken")?.value || "";

  let me = await getMe(token);

  if (!me) {
    const newToken = await refreshServerToken();
    if (newToken) {
      token = newToken;
      me = await getMe(newToken);
    }
  }

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
