/**
 * Utility functions for authentication and JWT token handling
 */

export interface UserInfo {
  email: string;
  name: string;
  userType: "doctor" | "patient" | null;
  sub: string; // User ID
  "cognito:groups"?: string[];
  [key: string]: unknown;
}

/**
 * Decode a JWT token without verification (client-side only)
 * For production, tokens should be verified server-side
 */
function decodeJWT(token: string): UserInfo | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as UserInfo;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

/**
 * Get user information from stored UserInfo
 * Returns user type based on Cognito groups
 */
export function getUserInfo(): UserInfo | null {
  if (typeof window === "undefined") {
    return null; // Server-side rendering
  }

  const idToken = localStorage.getItem("idToken");

  if (!idToken) {
    return null;
  }

  const decoded = decodeJWT(idToken);

  if (!decoded) {
    return null;
  }

  // Extract Cognito groups to determine user type
  const groups = decoded["cognito:groups"] || [];

  let userType: "doctor" | "patient" | null = null;

  if (groups.includes("Doctors")) {
    userType = "doctor";
  } else if (groups.includes("Patients")) {
    userType = "patient";
  }

  return {
    email: decoded.email || "",
    name: decoded.name || "",
    userType,
    sub: decoded.sub || "",
  };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const accessToken = localStorage.getItem("accessToken");
  const idToken = localStorage.getItem("idToken");

  return !!(accessToken && idToken);
}

/**
 * Clear authentication tokens and log out
 */
export function logout(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("idToken");
  localStorage.removeItem("refreshToken");

  // Redirect to home page
  window.location.href = "/";
}

/**
 * Get the user's display name
 */
export function getUserDisplayName(): string {
  const userInfo = getUserInfo();
  return userInfo?.name || userInfo?.email || "User";
}
