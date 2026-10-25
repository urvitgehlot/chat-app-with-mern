import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOnlineStatus } from "../store/appSlice";

export const useNetworkStatus = () => {
    const dispatch = useDispatch();
    const isOnline = useSelector((state) => state.app.isOnline);

    useEffect(() => {
        const handleOnline = () => {
            dispatch(setOnlineStatus(true));
        };

        const handleOffline = () => {
            dispatch(setOnlineStatus(false));
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [dispatch]);

    return isOnline;
};
