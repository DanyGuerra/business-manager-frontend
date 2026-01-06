import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useAuthApi } from "@/lib/useAuthApi";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { handleApiError } from "@/utils/handleApiError";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";

export function useUser() {
    const { user, isLoading, setUser, setIsLoading, setIsChecked, logout: storeLogout } = useUserStore();
    const authApi = useAuthApi();
    const { startLoading, stopLoading } = useLoadingStore();
    const { accessToken, setAccessToken } = useAuth();

    const logout = async () => {
        localStorage.clear();
        Cookies.remove("refreshToken", { path: "/" });
        Cookies.remove("accessToken", { path: "/" });
        storeLogout();
        setAccessToken(null);
        setUser(null);
        try {
            await authApi.logout();
        } catch (error) {
            handleApiError(error);
        }

    };

    useEffect(() => {
        if (!accessToken) {
            if (user) logout();
            setIsLoading(false);
            setIsChecked(true);
            return;
        }

        const fetchUser = async () => {
            const isRefetching = !!user;

            if (!isRefetching) {
                setIsLoading(true);
                startLoading(LoadingsKeyEnum.GET_USER);
            }

            try {
                const { data } = await authApi.getMe();

                if (data && !data.is_verified) {
                    logout();
                    return;
                }

                setUser(data);
            } catch (error) {
                handleApiError(error);
                logout();
            } finally {
                setIsLoading(false);
                setIsChecked(true);
                stopLoading(LoadingsKeyEnum.GET_USER);
            }
        };

        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken]);

    return { user, isLoading, logout, setUser };
}
