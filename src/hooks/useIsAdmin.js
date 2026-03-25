// chat-app-client/src/hooks/useIsAdmin.js
"use client";
import { useMemo } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import useAuth from "@/hooks/useAuth";

/**
 * Returns true if the current user is an admin in the given workspace.
 *
 * Admin = any of:
 *   1. member.role === "owner"
 *   2. member.role === "admin"  (legacy)
 *   3. Any roleId resolves to a workspace role with "ADMINISTRATOR" in permissions
 */
export default function useIsAdmin(workspaceId) {
  const { workspaces, membersCache } = useWorkspace();
  const { user } = useAuth();

  return useMemo(() => {
    if (!user || !workspaceId) return false;

    const workspace = workspaces.find((w) => w._id === workspaceId);
    const members = membersCache[workspaceId] || [];
    const me = members.find((m) => m.user?._id?.toString() === user._id?.toString());

    if (!me) return false;
    if (me.role === "owner" || me.role === "admin") return true;

    const roles = workspace?.roles || [];
    return (me.roleIds || []).some((rid) => {
      const role = roles.find((r) => r._id === rid || r._id?.toString() === rid?.toString());
      return role?.permissions?.includes("ADMINISTRATOR");
    });
  }, [user, workspaceId, workspaces, membersCache]);
}
