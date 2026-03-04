export const normalizeRole = (role) => {
	const value = String(role || "").trim().toLowerCase();
	if (["admin", "administrator", "superadmin", "super_admin"].includes(value)) {
		return "admin";
	}
	return value;
};

export const isAdminRole = (role) => normalizeRole(role) === "admin";

export const decodeJwtRole = (token) => {
	try {
		const parts = String(token || "").split(".");
		if (parts.length < 2) return "";
		const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
		return normalizeRole(payload?.role);
	} catch {
		return "";
	}
};

export const normalizeAuthUser = (user, token) => {
	const roleFromToken = decodeJwtRole(token);
	if (!user || typeof user !== "object") {
		return roleFromToken ? { role: roleFromToken } : null;
	}

	const resolvedId = user.id || user._id || "";

	const roleFromUser = normalizeRole(user.role);
	const role = roleFromToken === "admin" ? "admin" : roleFromUser || roleFromToken;
	const normalizedUser = {
		...user,
		...(resolvedId ? { id: String(resolvedId), _id: String(resolvedId) } : {}),
	};

	return role ? { ...normalizedUser, role } : normalizedUser;
};
