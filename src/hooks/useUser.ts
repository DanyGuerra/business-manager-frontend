import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useAuthApi } from "@/lib/useAuthApi";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";

export function useUser() {
    const { user, isLoading, isChecked, setUser, setIsLoading, setIsChecked, logout } = useUserStore();
    const authApi = useAuthApi();
    const { startLoading, stopLoading } = useLoadingStore();

    useEffect(() => {
        if (isChecked) {
            if (isLoading) setIsLoading(false);
            return;
        }

        if (user) {
            setIsChecked(true);
            setIsLoading(false);
            return;
        }

        (async () => {
            setIsLoading(true);
            startLoading(LoadingsKeyEnum.GET_USER);
            try {
                const { data } = await authApi.getMe();
                setUser(data);
            } catch (error) {
                console.error(error);
                setUser(null);
            } finally {
                setIsLoading(false);
                setIsChecked(true);
                stopLoading(LoadingsKeyEnum.GET_USER);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isChecked, user]);

    return { user, isLoading, logout, setUser };
}
