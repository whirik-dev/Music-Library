'use client';
import { useEffect, useState } from 'react';
import ServerDown from "@/components/ServerDown";

const HealthCheckProvider = ({ children }) => {
    const [isHealthy, setIsHealthy] = useState(null);

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch('/api/health');
                const data = await res.json();
                setIsHealthy(data.status === "ok" && true);
            } catch (err) {
                setIsHealthy(false);
            }
        };
        checkHealth();
    }, []);

    if (isHealthy === null) {
        return <></>;
    }

    return isHealthy ? <>{children}</> : <ServerDown />;
};

export default HealthCheckProvider;
