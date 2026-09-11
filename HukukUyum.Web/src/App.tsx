import type { ReactElement } from "react";
import { useEffect, useState } from "react";

import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import AuditLogsPage from "./pages/AuditLogsPage";
import EmployeeLayout from "./layouts/EmployeeLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import UserLayout from "./layouts/UserLayout";
import api from "./api/axios";
import RequestDetailPage from "./pages/RequestDetailPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import CreateRequestPage from "./pages/CreateRequestPage";
import CreateTaskPage from "./pages/CreateTaskPage";
import DashboardPage from "./pages/DashboardPage";
import FilesPage from "./pages/FilesPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import GroupsPage from "./pages/GroupsPage";
import LoginPage from "./pages/LoginPage";
import LeaveManagementPage from "./pages/LeaveManagementPage";
import ManagerDelegationsPage from "./pages/ManagerDelegationsPage";
import MembersPage from "./pages/MembersPage";
import MyRequestsPage from "./pages/MyRequestsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import ReportsPage from "./pages/ReportsPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SettingsPage from "./pages/SettingsPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import TasksPage from "./pages/TasksPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import UserApplicationPage from "./pages/UserApplicationPage";
import UserApplicationsPage from "./pages/UserApplicationsPage";
import UsersPage from "./pages/UsersPage";

import {
    clearAuth,
    getCurrentUserRoles,
    hasAnyRole,
    isTokenExpired,
    type AppRole,
} from "./utils/auth";

interface RoleRouteProps {
    roles: AppRole[];
    element: ReactElement;
    allowDelegatedManager?: boolean;
    hasDelegatedManagerAccess?: boolean;
}

function RoleRoute({
    roles,
    element,
    allowDelegatedManager = false,
    hasDelegatedManagerAccess = false,
}: RoleRouteProps) {
    const hasRoleAccess =
        hasAnyRole(roles);

    const delegatedAccess =
        allowDelegatedManager &&
        hasDelegatedManagerAccess;

    if (!hasRoleAccess &&
        !delegatedAccess) {
        return (
            <Navigate
                to="/unauthorized"
                replace
            />
        );
    }

    return element;
}

interface AppLayoutProps {
    onLogout: () => void;
    hasDelegatedManagerAccess: boolean;
}

function AppLayout({
    onLogout,
    hasDelegatedManagerAccess,
}: AppLayoutProps) {
    const roles =
        getCurrentUserRoles();

    if (
        roles.includes(
            "Admin"
        )
    ) {
        return (
            <AdminLayout
                onLogout={
                    onLogout
                }
            />
        );
    }

    if (
        roles.includes(
            "Manager"
        )
    ) {
        return (
            <ManagerLayout
                onLogout={
                    onLogout
                }
            />
        );
    }

    if (
        roles.includes(
            "Employee"
        ) &&
        hasDelegatedManagerAccess
    ) {
        return (
            <ManagerLayout
                onLogout={
                    onLogout
                }
                isDelegated
            />
        );
    }

    if (
        roles.includes(
            "User"
        )
    ) {
        return (
            <UserLayout
                onLogout={
                    onLogout
                }
            />
        );
    }

    return (
        <EmployeeLayout
            onLogout={
                onLogout
            }
        />
    );
}

function DefaultPage() {
    return (
        <Navigate
            to="/dashboard"
            replace
        />
    );
}

function App() {
    const token =
        localStorage.getItem(
            "token"
        );

    const [
        isAuthenticated,
        setIsAuthenticated,
    ] = useState(
        Boolean(token) &&
        !isTokenExpired()
    );

    const [
        hasDelegatedManagerAccess,
        setHasDelegatedManagerAccess,
    ] = useState(
        localStorage.getItem(
            "delegatedManagerAccess"
        ) === "true"
    );

    const [
        mustChangePassword,
        setMustChangePassword,
    ] = useState(
        localStorage.getItem(
            "mustChangePassword"
        ) === "true"
    );

    useEffect(() => {
        const loadDelegatedManagerAccess =
            async () => {
                if (
                    !isAuthenticated ||
                    mustChangePassword
                ) {
                    setHasDelegatedManagerAccess(
                        false
                    );

                    localStorage.removeItem(
                        "delegatedManagerAccess"
                    );

                    return;
                }

                const roles =
                    getCurrentUserRoles();

                if (
                    !roles.includes(
                        "Employee"
                    ) ||
                    roles.includes(
                        "Manager"
                    ) ||
                    roles.includes(
                        "Admin"
                    )
                ) {
                    setHasDelegatedManagerAccess(
                        false
                    );

                    localStorage.removeItem(
                        "delegatedManagerAccess"
                    );

                    return;
                }

                try {
                    const response =
                        await api.get<{
                            hasDelegatedManagerAccess:
                            boolean;
                            groupIds:
                            number[];
                        }>(
                            "/ManagerDelegations/access"
                        );

                    const hasAccess =
                        response.data
                            .hasDelegatedManagerAccess;

                    setHasDelegatedManagerAccess(
                        hasAccess
                    );

                    localStorage.setItem(
                        "delegatedManagerAccess",
                        String(
                            hasAccess
                        )
                    );
                } catch (
                error
                ) {
                    console.error(
                        "Vekalet erişimi kontrol edilemedi:",
                        error
                    );

                    setHasDelegatedManagerAccess(
                        false
                    );

                    localStorage.removeItem(
                        "delegatedManagerAccess"
                    );
                }
            };

        void loadDelegatedManagerAccess();
    }, [
        isAuthenticated,
        mustChangePassword,
    ]);

    const handleLoginSuccess = (
        passwordChangeRequired:
            boolean
    ) => {
        setMustChangePassword(
            passwordChangeRequired
        );

        setIsAuthenticated(
            true
        );
    };

    const handleLogout =
        () => {
            clearAuth();

            localStorage.removeItem(
                "mustChangePassword"
            );

            localStorage.removeItem(
                "delegatedManagerAccess"
            );

            setHasDelegatedManagerAccess(
                false
            );

            setMustChangePassword(
                false
            );

            setIsAuthenticated(
                false
            );
        };

    const handlePasswordChanged =
        () => {
            clearAuth();

            localStorage.removeItem(
                "mustChangePassword"
            );

            localStorage.removeItem(
                "delegatedManagerAccess"
            );

            setHasDelegatedManagerAccess(
                false
            );

            setMustChangePassword(
                false
            );

            setIsAuthenticated(
                false
            );
        };

    return (
        <BrowserRouter>
            {!isAuthenticated ? (
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <LoginPage
                                onLoginSuccess={
                                    handleLoginSuccess
                                }
                            />
                        }
                    />

                    <Route
                        path="/forgot-password"
                        element={
                            <ForgotPasswordPage />
                        }
                    />

                    <Route
                        path="/reset-password"
                        element={
                            <ResetPasswordPage />
                        }
                    />

                    <Route
                        path="/apply"
                        element={
                            <UserApplicationPage />
                        }
                    />

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/login"
                                replace
                            />
                        }
                    />
                </Routes>
            ) : mustChangePassword ? (
                <Routes>
                    <Route
                        path="/change-password"
                        element={
                            <ChangePasswordPage
                                onPasswordChanged={
                                    handlePasswordChanged
                                }
                            />
                        }
                    />

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/change-password"
                                replace
                            />
                        }
                    />
                </Routes>
            ) : (
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        }
                    />

                    <Route
                        element={
                            <AppLayout
                                onLogout={
                                    handleLogout
                                }
                                hasDelegatedManagerAccess={
                                    hasDelegatedManagerAccess
                                }
                            />
                        }
                    >
                        <Route
                            index
                            element={
                                <DefaultPage />
                            }
                        />

                        {/* DASHBOARD */}

                        <Route
                            path="/dashboard"
                            element={
                                <RoleRoute
                                    roles={[
                                        "Admin",
                                        "Manager",
                                        "Employee",
                                        "User",
                                    ]}
                                    element={
                                        <DashboardPage />
                                    }
                                />
                            }
                        />

                        {/* PROFİL */}

                        <Route
                            path="/profile"
                            element={
                                <RoleRoute
                                    roles={[
                                        "Admin",
                                        "Manager",
                                        "Employee",
                                        "User",
                                    ]}
                                    element={
                                        <ProfilePage />
                                    }
                                />
                            }
                        />

                        {/* YETKİSİZ ERİŞİM */}

                        <Route
                            path="/unauthorized"
                            element={
                                <UnauthorizedPage />
                            }
                        />

                        {/* GÖREVLER */}

                        <Route
                            path="/tasks"
                            element={
                                <RoleRoute
                                    roles={[
                                        "Admin",
                                        "Manager",
                                        "Employee",
                                    ]}
                                    element={
                                        <TasksPage />
                                    }
                                />
                            }
                        />

                        <Route
                            path="/tasks/:id"
                            element={
                                <RoleRoute
                                    roles={[
                                        "Admin",
                                        "Manager",
                                        "Employee",
                                    ]}
                                    element={
                                        <TaskDetailPage />
                                    }
                                />
                            }
                        />

                        <Route
                            path="/tasks/create"
                            element={
                                <RoleRoute
                                    roles={[
                                        "Admin",
                                        "Manager",
                                    ]}
                                    allowDelegatedManager
                                    hasDelegatedManagerAccess={
                                        hasDelegatedManagerAccess
                                    }
                                    element={
                                        <CreateTaskPage />
                                    }
                                />
                            }
                        />

                        <Route
                            path="/members"
                            element={
                                <RoleRoute
                                    roles={["Manager"]}
                                    allowDelegatedManager
                                    hasDelegatedManagerAccess={hasDelegatedManagerAccess}
                                    element={<MembersPage />}
                                />
                            }
                        />

                        {/* TALEP KULLANICISI */}

                        <Route
                            path="/requests/create"
                            element={
                                <RoleRoute
                                    roles={[
                                        "User",
                                    ]}
                                    element={
                                        <CreateRequestPage />
                                    }
                                />
                            }
                        />
                        <Route
                            path="/requests/:id"
                            element={
                                <RoleRoute
                                    roles={[
                                        "User",
                                    ]}
                                    element={
                                        <RequestDetailPage />
                                    }
                                />
                            }
                        />
                        <Route
                            path="/my-requests"
                            element={
                                <RoleRoute
                                    roles={[
                                        "User",
                                    ]}
                                    element={
                                        <MyRequestsPage />
                                    }
                                />
                            }
                        />

                        {/* KULLANICILAR */}

                        <Route
                            path="/users"
                            element={
                                <RoleRoute
                                    roles={[
                                        "Admin",
                                    ]}
                                    element={
                                        <UsersPage />
                                    }
                                />
                            }
                        />

                        <Route
                            path="/user-applications"
                            element={
                                <RoleRoute
                                    roles={[
                                        "Admin",
                                    ]}
                                    element={
                                        <UserApplicationsPage />
                                    }
                                />
                            }
                        />

                        {/* GRUPLAR */}

                        <Route
                            path="/groups"
                            element={
                                <RoleRoute
                                    roles={[
                                        "Admin",
                                    ]}
                                    element={
                                        <GroupsPage />
                                    }
                                />
                            }
                        />

                        {/* DOSYALAR */}

                        <Route
                            path="/files"
                            element={
                                <RoleRoute
                                    roles={[
                                        "Admin",
                                        "Manager",
                                    ]}
                                    element={
                                        <FilesPage />
                                    }
                                />
                            }
                        />

                        {/* RAPORLAR */}

                        <Route
                            path="/reports"
                            element={
                                <RoleRoute
                                    roles={[
                                        "Admin",
                                        "Manager",
                                    ]}
                                    element={
                                        <ReportsPage />
                                    }
                                />
                            }
                        />

                        {/* İZİN YÖNETİMİ */}

                        <Route
                            path="/leaves"
                            element={
                                <RoleRoute
                                    roles={[
                                        "Admin",
                                        "Manager",
                                        "Employee",
                                    ]}
                                    element={
                                        <LeaveManagementPage />
                                    }
                                />
                            }
                        />

                        {/* YÖNETİCİ VEKALETLERİ */}

                        <Route
                            path="/manager-delegations"
                            element={
                                <RoleRoute
                                    roles={[
                                        "Admin",
                                        "Manager",
                                    ]}
                                    element={
                                        <ManagerDelegationsPage />
                                    }
                                />
                            }
                        />

                        {/* SİSTEM HAREKETLERİ */}

                        <Route
                            path="/audit-logs"
                            element={
                                <RoleRoute
                                    roles={[
                                        "Admin",
                                    ]}
                                    element={
                                        <AuditLogsPage />
                                    }
                                />
                            }
                        />

                        {/* AYARLAR */}

                        <Route
                            path="/settings"
                            element={
                                <RoleRoute
                                    roles={[
                                        "Admin",
                                        "Manager",
                                        "Employee",
                                        "User",
                                    ]}
                                    element={
                                        <SettingsPage />
                                    }
                                />
                            }
                        />

                        {/* NORMAL ŞİFRE DEĞİŞTİRME */}

                        <Route
                            path="/account/change-password"
                            element={
                                <RoleRoute
                                    roles={[
                                        "Admin",
                                        "Manager",
                                        "Employee",
                                        "User",
                                    ]}
                                    element={
                                        <ChangePasswordPage
                                            onPasswordChanged={
                                                handlePasswordChanged
                                            }
                                        />
                                    }
                                />
                            }
                        />

                        {/* 404 */}

                        <Route
                            path="*"
                            element={
                                <NotFoundPage />
                            }
                        />
                    </Route>
                </Routes>
            )}
        </BrowserRouter>
    );
}

export default App;
