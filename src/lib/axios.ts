"use client";

import axios, { AxiosHeaders } from "axios";
import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export function useAxios() {
  const { accessToken, setAccessToken } = useAuth();
  const tokenRef = useRef<string | null>(accessToken);
  const router = useRouter();

  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    let isRefreshing = false;
    let failedQueue: Array<{
      resolve: (value?: unknown) => void;
      reject: (error: unknown) => void;
    }> = [];

    const processQueue = (error: unknown, token: string | null = null) => {
      failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
      });
      failedQueue = [];
    };

    const requestInterceptor = api.interceptors.request.use((config) => {
      const token = tokenRef.current || localStorage.getItem("accessToken");
      if (token) {
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }
        config.headers.set("Authorization", `Bearer ${token}`);
      }
      return config;
    });

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes("auth/login")
        ) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then((token) => {
              if (!originalRequest.headers) {
                originalRequest.headers = new AxiosHeaders();
              }
              originalRequest.headers.set("Authorization", `Bearer ${token}`);
              return api.request(originalRequest);
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const refreshRes = await axios.post(
              "/api/auth/refresh",
              {},
              { withCredentials: true }
            );

            const newToken = refreshRes.data.data.access_token;
            setAccessToken(newToken);
            tokenRef.current = newToken;

            processQueue(null, newToken);

            if (!originalRequest.headers) {
              originalRequest.headers = new AxiosHeaders();
            }
            originalRequest.headers.set("Authorization", `Bearer ${newToken}`);

            return api.request(originalRequest);
          } catch (err) {
            processQueue(err, null);
            router.push("/login");
            return Promise.reject(err);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [setAccessToken, router]);

  return api;
}
