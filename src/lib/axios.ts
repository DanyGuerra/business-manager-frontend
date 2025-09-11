"use client";

import axios, { AxiosHeaders } from "axios";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export function useAxios() {
  const { accessToken, setAccessToken } = useAuth();

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use((config) => {
      if (accessToken) {
        if (!config.headers) config.headers = new AxiosHeaders();
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshRes = await axios.post(
              "/api/auth/refresh",
              {},
              { withCredentials: true }
            );

            if (refreshRes.status === 200) {
              const newToken = refreshRes.data.data.access_token;
              setAccessToken(newToken);

              if (!originalRequest.headers) originalRequest.headers = {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;

              return api.request(originalRequest);
            }
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, setAccessToken]);

  return api;
}
