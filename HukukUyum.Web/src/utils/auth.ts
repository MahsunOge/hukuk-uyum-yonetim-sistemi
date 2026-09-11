export type AppRole =
    | "Admin"
    | "Manager"
    | "Employee"
    | "User";

interface JwtPayload {
    exp?: number;

    role?: string | string[];
    roles?: string | string[];

    name?: string;
    unique_name?: string;
    email?: string;
    sub?: string;

    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?:
    | string
    | string[];

    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?:
    string;

    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"?:
    string;

    [key: string]: unknown;
}

const ROLE_CLAIM =
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const NAME_CLAIM =
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";

const EMAIL_CLAIM =
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";

const NAME_IDENTIFIER_CLAIM =
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

const decodeBase64Url = (
    value: string
): string => {
    const normalized = value
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const padded = normalized.padEnd(
        Math.ceil(normalized.length / 4) * 4,
        "="
    );

    const decoded = window.atob(padded);

    const bytes = Uint8Array.from(
        decoded,
        (character) =>
            character.charCodeAt(0)
    );

    return new TextDecoder().decode(bytes);
};

export const getTokenPayload =
    (): JwtPayload | null => {
        const token =
            localStorage.getItem("token");

        if (!token) {
            return null;
        }

        try {
            const parts = token.split(".");

            if (parts.length !== 3) {
                return null;
            }

            const payloadJson =
                decodeBase64Url(parts[1]);

            return JSON.parse(
                payloadJson
            ) as JwtPayload;
        } catch (error) {
            console.error(
                "JWT çözümlenemedi:",
                error
            );

            return null;
        }
    };

const normalizeRoles = (
    roleValue: unknown
): string[] => {
    if (typeof roleValue === "string") {
        return [roleValue];
    }

    if (
        Array.isArray(roleValue) &&
        roleValue.every(
            (role) =>
                typeof role === "string"
        )
    ) {
        return roleValue;
    }

    return [];
};

const getStringClaim = (
    value: unknown
): string | null => {
    if (
        typeof value === "string" &&
        value.trim()
    ) {
        return value.trim();
    }

    return null;
};

export const getCurrentUserRoles =
    (): AppRole[] => {
        const payload = getTokenPayload();

        if (!payload) {
            return [];
        }

        const roleValue =
            payload[ROLE_CLAIM] ??
            payload.roles ??
            payload.role;

        return normalizeRoles(roleValue)
            .filter(
                (role): role is AppRole =>
                    role === "Admin" ||
                    role === "Manager" ||
                    role === "Employee" ||
                    role === "User"
            );
    };
export const getCurrentUserId =
    (): string | null => {
        const payload = getTokenPayload();

        if (!payload) {
            return null;
        }

        return (
            getStringClaim(
                payload[
                NAME_IDENTIFIER_CLAIM
                ]
            ) ??
            getStringClaim(payload.sub)
        );
    };

export const getCurrentUserEmail =
    (): string | null => {
        const payload = getTokenPayload();

        if (!payload) {
            return null;
        }

        return (
            getStringClaim(
                payload[EMAIL_CLAIM]
            ) ??
            getStringClaim(payload.email) ??
            getStringClaim(payload.unique_name)
        );
    };

export const getCurrentUserName =
    (): string => {
        const payload = getTokenPayload();

        if (!payload) {
            return "Kullanıcı";
        }

        const fullName =
            getStringClaim(
                payload[NAME_CLAIM]
            ) ??
            getStringClaim(payload.name);

        if (fullName) {
            return fullName;
        }

        const email =
            getCurrentUserEmail();

        if (email) {
            return email.split("@")[0];
        }

        return "Kullanıcı";
    };

export const hasAnyRole = (
    allowedRoles: AppRole[]
): boolean => {
    const currentRoles =
        getCurrentUserRoles();

    return allowedRoles.some((role) =>
        currentRoles.includes(role)
    );
};

export const isTokenExpired =
    (): boolean => {
        const payload = getTokenPayload();

        if (!payload?.exp) {
            return true;
        }

        return (
            payload.exp * 1000 <=
            Date.now()
        );
    };

export const clearAuth = () => {
    localStorage.removeItem("token");

    window.dispatchEvent(
        new CustomEvent(
            "auth-state-changed"
        )
    );
};
