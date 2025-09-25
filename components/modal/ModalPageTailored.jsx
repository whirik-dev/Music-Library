import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';
import { IconLoader2 } from "@tabler/icons-react";
import useToggle from "@/utils/useToggle";

import Indicator from "@/components/ui/Indicator";
import ModalCard from "@/components/modal/ModalCard";

import modalStore from "@/stores/modalStore";

const ModaTailoredListItem = ({ type, data, action }) => {
    const t = useTranslations('modal');
    const { setPath, setModalParameter } = modalStore();

    const tailoredDetailHandler = (param) => {
        if (param != null) {
            setPath('tailored/detail');
            setModalParameter(param);
        }
    }

    return (
        <div className="border-b-1 border-zinc-500/50">
            <div className={`flex flex-row w-full py-2 ${type === "head" ? "text-foreground" : "text-foreground/50"}`}>
                <div className="w-3/5 flex justify-start">
                    {type === "head" ? t('work_name') : data.name}
                </div>
                <div className="w-1/5 flex flex-row gap-2 items-center justify-start capitalize">
                    <div className="w-3 items-center justify-center text-center">
                        {type != "head" && (
                            data.rawStatus === 'processing' ?
                                <IconLoader2 className="animate-spin" size={12} /> :
                                <Indicator status={data.indicatorStatus} />
                        )}
                    </div>
                    {type === "head" ? t('status') : data.status}
                </div>
                <div className="w-1/5 flex flex-row gap-2 items-center justify-start capitalize">
                    {type === "head" ? t('last_updated') : data.last_updated}
                </div>
                <div className="ml-auto">
                    {action != null && type != "head" ? (
                        <div className="cursor-pointer hover:opacity-70 bg-foreground/30 text-foreground text-xs font-bold px-1.5 py-1 rounded-sm uppercase"
                            onClick={() => tailoredDetailHandler(action.param)}>
                            {action.name}
                        </div>
                    ) : ""}
                </div>
            </div>
        </div>
    )
}

const ModalPageTailored = ({ }) => {
    const t = useTranslations('modal');
    const { data: session } = useSession();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useToggle(
        () => {
            toggleExpand();
            setDepth(1);
        },
        () => {
            toggleExpand();
        }
    );
    const { toggleExpand, setPath, setDepth } = modalStore();

    const fetchJobs = async () => {
        if (!session?.user?.ssid) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs/list`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.ssid}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setJobs(data.data.jobs);
            } else {
                throw new Error(data.message || 'Failed to fetch jobs');
            }
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.ssid) {
            fetchJobs();
        }
    }, [session]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const mapJobStatus = (status) => {
        switch (status) {
            case 'pending': return 'pending';
            case 'estimated': return 'estimated';
            case 'processing': return 'in progress';
            case 'confirm': return 'confirming';
            case 'completed': return 'completed';
            case 'failed': return 'failed';
            case 'cancelled': return 'cancelled';
            default: return status;
        }
    };

    const getIndicatorStatus = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'processing': return 'warning';
            case 'estimated': return 'info';
            case 'confirm': return 'warning';
            case 'failed': return 'error';
            case 'cancelled': return 'error';
            case 'pending': return 'off';
            default: return 'off';
        }
    };

    return (
        <>
            <ModalCard title={t('tailored_service')} desc={t('desc')} />
            <div className="flex flex-col px-3">
                <ModaTailoredListItem type="head" action={{ name: "head", param: null }} />

                {loading && (
                    <div className="text-center py-4 text-gray-500">
                        loading...
                    </div>
                )}

                {error && (
                    <div className="text-center py-4 text-red-500">
                        error: {error}
                    </div>
                )}

                {jobs.length > 0 && jobs.map((job) => (
                    <ModaTailoredListItem
                        key={job.jobId}
                        data={{
                            name: job.requestInfo?.title || 'an untitled jobs',
                            last_updated: formatDate(job.updated_at),
                            status: mapJobStatus(job.status),
                            rawStatus: job.status,
                            indicatorStatus: getIndicatorStatus(job.status),
                            feedback: job.errorMessage || ""
                        }}
                        action={{
                            name: `detail`,
                            param: job.jobId
                        }}
                    />
                ))}

                {!loading && !error && jobs.length === 0 && session && (
                    <div className="text-center py-4 text-gray-500">
                        no items.
                    </div>
                )}

                {/* 세션이 없을 때는 기존 더미 데이터 표시 */}
                {!session && (
                    <>
                        {/* <ModaTailoredListItem data={{ name: "work name1", last_updated: "2024-02-13 11:32:51", status: "closed", feedback: "?url" }} />
                        <ModaTailoredListItem data={{ name: "work name2", last_updated: "2024-02-13 11:32:51", status: "done", feedback: "?url" }} />
                        <ModaTailoredListItem data={{ name: "work name3", last_updated: "2024-02-13 11:32:51", status: "in progress", feedback: "?url" }} />
                        <ModaTailoredListItem data={{ name: "work name4", last_updated: "2024-02-13 11:32:51", status: "closed", feedback: "?url" }} /> */}
                    </>
                )}
            </div>
        </>
    )
}
export default ModalPageTailored