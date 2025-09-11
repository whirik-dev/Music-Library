"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';

import useToggle from "@/utils/useToggle";
import modalStore from "@/stores/modalStore";

import ModalCard from "@/components/modal/ModalCard";
import Button from "@/components/ui/Button";
import ToggleRadio from '@/components/ui/ToggleRadio';
import InputField from "@/components/ui/InputField";
import Divider from "@/components/ui/Divider";


import IconYoutube from "@/components/misc/IconYoutube";
import IconNaver from "@/components/misc/IconNaver";
import IconInstagram from "@/components/misc/IconInstagram";
import IconFacebook from "@/components/misc/IconFacebook";
import IconTiktok from "@/components/misc/IconTiktok";

/**
 * 
 * @param {string} id
 * @param {string} name
 * @param {string} platform
 * @param {string} url
 * @param {string} created_at
 * @param {boolean} auto_renewal 
 * @param {function} onToggleAutoRenewal
 * @param {function} onDelete
 * @param {function} onEdit
 * @returns 
 */
const ChannelElem = ({ id, name, platform, url, created_at, auto_renewal, onToggleAutoRenewal, onDelete, onEdit }) => {
    const t = useTranslations('modal');
    const [allowAutoRenewalValue, setAllowAutoRenewalValue] = useState(auto_renewal)
    const [isToggling, setIsToggling] = useState(false)

    const toggleAutoRenewal = async () => {
        if (isToggling) return;

        setIsToggling(true);
        const newValue = !allowAutoRenewalValue;

        try {
            if (onToggleAutoRenewal) {
                const success = await onToggleAutoRenewal(id, newValue);
                if (success) {
                    setAllowAutoRenewalValue(newValue);
                }
            }
        } finally {
            setIsToggling(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="mx-3 my-3 px-4 py-4 bg-zinc-800 rounded-lg flex flex-col gap-3 ">
            <div className="flex flex-row items-center gap-2">
                {platform === 'youtube' ? (<IconYoutube size="36" />)
                    : platform === 'instagram' ? (<IconInstagram size="36" />)
                        : platform === 'facebook' ? (<IconFacebook size="36" />)
                            : platform === 'tiktok' ? (<IconTiktok size="36" />)
                                : platform === 'naver' ? (<IconNaver size="36" />)
                                    : ""}
                <div className="font-bold">
                    {name}
                </div>
            </div>
            <div className="text-xs bg-zinc-900/50 px-2 py-2 rounded-sm text-foreground/50">
                {url}
            </div>
            <div className="flex flex-row justify-between items-baseline">
                <div className="">
                    {t('created_on')} <span className="font-bold">{formatDate(created_at)}</span>
                </div>
                <div className="flex flex-row gap-3 items-baseline justify-end">
                    <span className="text-foreground/50">{t('auto_renewal')}</span>
                    <ToggleRadio
                        state={allowAutoRenewalValue}
                        onClick={toggleAutoRenewal}
                        disabled={isToggling}
                    />
                </div>
            </div>
            {(onDelete || onEdit) && (
                <div className="flex justify-end gap-2">
                    {onEdit && (
                        <button
                            onClick={() => onEdit(id, name, url)}
                            className="text-blue-400 hover:text-blue-300 text-sm px-2 py-1 rounded hover:bg-blue-900/20"
                        >
                            {t('edit')}
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(id)}
                            className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-900/20"
                        >
                            {t('delete')}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

const ModalPageChannelManage = ({ }) => {
    const t = useTranslations('modal');
    const tError = useTranslations('errors');

    useToggle(() => {
        setDepth(2);
    });

    const { path, depth, setDepth } = modalStore();
    const { data: session, status } = useSession();

    // 여기서부터 시작

    const [page, setPage] = useState(1);
    const [inputName, setInputName] = useState("");
    const [inputUrl, setInputUrl] = useState("");
    const [inputDescription, setInputDescription] = useState("");
    const [platform, setPlatform] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingChannel, setEditingChannel] = useState(null);

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/channels`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.ssid}`
                    }
                });

                if (!res.ok) {
                    console.error(tError('failed_to_fetch_channels'), res.status);
                    return;
                }

                const responseData = await res.json();

                // API 응답 구조를 안전하게 처리
                if (responseData && responseData.success) {
                    // data.channels 배열이 있는 경우
                    if (responseData.data && Array.isArray(responseData.data.channels)) {
                        setData(responseData.data.channels);
                    }
                    // data가 직접 배열인 경우 (다른 API 구조)
                    else if (Array.isArray(responseData.data)) {
                        setData(responseData.data);
                    }
                    // 빈 응답이거나 채널이 없는 경우
                    else {
                        console.log('No channels found or empty response');
                        setData([]);
                    }
                } else {
                    // API 호출은 성공했지만 success가 false이거나 빈 객체인 경우
                    console.log('API response:', responseData);
                    setData([]);
                }
            } catch (error) {
                console.error(tError('error_fetching_channels'), error);
                setData([]); // Fallback to empty array
            }
        };

        if (session?.user?.ssid) {
            fetchChannels();
        }

    }, [session?.user?.ssid]);

    useEffect(() => {
        const platformDetected = detectPlatform(inputUrl);
        setPlatform(platformDetected);
    }, [inputUrl]);

    function detectPlatform(url) {
        if (!url) return "";

        const lowerUrl = url.toLowerCase();

        if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) return "youtube";
        if (lowerUrl.includes("instagram.com")) return "instagram";
        if (lowerUrl.includes("facebook.com")) return "facebook";
        if (lowerUrl.includes("tiktok.com")) return "tiktok";
        if (lowerUrl.includes("naver.com") || lowerUrl.includes("blog.naver.com")) return "naver";

        return ""; // fallback
    }

    const validateInputs = () => {
        if (!inputUrl.trim()) {
            alert(t('enter_channel_url_validation'));
            return false;
        }
        if (!inputName.trim()) {
            alert(t('enter_channel_name_validation'));
            return false;
        }
        return true;
    };

    function addChannelHandler() {
        if (!validateInputs()) return;
        setPage(3);
    }

    const confirmChannelHandler = async () => {
        if (!validateInputs()) return;

        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/channel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.ssid}`
                },
                body: JSON.stringify({
                    name: inputName,
                    description: inputDescription || `${platform} channel`,
                    platform: platform,
                    url: inputUrl,
                    auto_renewal: true,
                    channel_type: "music"
                })
            });

            const responseData = await res.json();

            if (res.ok && responseData.success) {
                // 성공적으로 추가됨 - 채널 목록 새로고침
                const channelsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/channels`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.ssid}`
                    }
                });

                if (channelsRes.ok) {
                    const channelsData = await channelsRes.json();
                    if (channelsData && channelsData.success) {
                        if (channelsData.data && Array.isArray(channelsData.data.channels)) {
                            setData(channelsData.data.channels);
                        } else if (Array.isArray(channelsData.data)) {
                            setData(channelsData.data);
                        }
                    }
                }

                // 입력 필드 초기화 및 첫 페이지로 이동
                setInputName("");
                setInputUrl("");
                setInputDescription("");
                setPlatform("");
                setPage(1);
            } else {
                alert(responseData.message || tError('failed_to_add_channel'));
            }
        } catch (error) {
            console.error(tError('failed_to_add_channel'), error);
            alert(tError('failed_to_add_channel_retry'));
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAutoRenewal = async (channelId, newValue) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/channel/${channelId}/auto-renewal`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.ssid}`
                }
            });

            const responseData = await res.json();

            if (res.ok && responseData.success) {
                // 로컬 상태 업데이트
                setData(prevData =>
                    prevData.map(channel =>
                        channel.id === channelId
                            ? { ...channel, auto_renewal: responseData.data.auto_renewal }
                            : channel
                    )
                );
                return true;
            } else {
                alert(responseData.message || tError('failed_to_toggle_auto_renewal'));
                return false;
            }
        } catch (error) {
            console.error(tError('failed_to_toggle_auto_renewal'), error);
            alert(tError('failed_to_toggle_auto_renewal_retry'));
            return false;
        }
    };

    const handleDeleteChannel = async (channelId) => {
        if (!confirm(t('delete_channel_confirmation'))) return;

        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/channel/${channelId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.ssid}`
                }
            });

            const responseData = await res.json();

            if (res.ok && responseData.success) {
                // 성공적으로 삭제됨 - 로컬 상태에서 제거
                setData(prevData => prevData.filter(channel => channel.id !== channelId));
            } else {
                alert(responseData.message || tError('failed_to_delete_channel'));
            }
        } catch (error) {
            console.error(tError('failed_to_delete_channel'), error);
            alert(tError('failed_to_delete_channel_retry'));
        } finally {
            setLoading(false);
        }
    };

    const handleEditChannel = (channelId, currentName, currentUrl) => {
        const channel = data.find(ch => ch.id === channelId);
        if (channel) {
            setEditingChannel(channel);
            setInputName(currentName);
            setInputUrl(currentUrl);
            setInputDescription(channel.description || '');
            setPlatform(channel.platform);
            setPage(4); // 새로운 편집 페이지
        }
    };

    const confirmEditHandler = async () => {
        if (!validateInputs()) return;

        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/channel/${editingChannel?.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.ssid}`
                },
                body: JSON.stringify({
                    name: inputName,
                    description: inputDescription || `${platform} channel`,
                    platform: platform,
                    url: inputUrl,
                    auto_renewal: editingChannel?.auto_renewal || true,
                    channel_type: editingChannel?.channel_type || "music"
                })
            });

            const responseData = await res.json();

            if (res.ok && responseData.success) {
                // 로컬 상태 업데이트
                setData(prevData =>
                    prevData.map(channel =>
                        channel.id === editingChannel?.id
                            ? { ...channel, ...responseData.data }
                            : channel
                    )
                );

                // 입력 필드 초기화 및 첫 페이지로 이동
                setInputName("");
                setInputUrl("");
                setInputDescription("");
                setPlatform("");
                setEditingChannel(null);
                setPage(1);
            } else {
                alert(responseData.message || tError('failed_to_update_channel'));
            }
        } catch (error) {
            console.error(tError('failed_to_update_channel'), error);
            alert(tError('failed_to_update_channel_retry'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ModalCard title={t('manage_channels')} desc={t('organize_manage_channels')} />
            {page === 1 ? (
                <>
                    {Array.isArray(data) && data.length > 0 ? (
                        data.map((elem) => (
                            <ChannelElem
                                key={elem.id}
                                id={elem.id}
                                name={elem.name}
                                platform={elem.platform}
                                url={elem.url}
                                created_at={elem.created_at}
                                auto_renewal={elem.auto_renewal}
                                onToggleAutoRenewal={handleToggleAutoRenewal}
                                onDelete={handleDeleteChannel}
                                onEdit={handleEditChannel}
                            />
                        ))
                    ) : (
                        <div className="mx-3 my-6 text-center text-foreground/50">
                            <p>{t('no_channels_found')}</p>
                        </div>
                    )}

                    <Button name={t('add_channel_button')} onClick={() => setPage(2)} />
                </>
            ) : page === 2 ? (
                <>
                    <InputField
                        className="mx-3 rounded-lg my-3"
                        placeholder={t('enter_channel_url')}
                        value={inputUrl}
                        onChange={(e) => { setInputUrl(e.target.value) }}
                    />
                    <InputField
                        className="mx-3 rounded-lg my-3"
                        placeholder={t('enter_channel_name')}
                        value={inputName}
                        onChange={(e) => { setInputName(e.target.value) }}
                    />
                    <InputField
                        className="mx-3 rounded-lg"
                        placeholder={t('channel_description_optional')}
                        value={inputDescription}
                        onChange={(e) => { setInputDescription(e.target.value) }}
                    />
                    {platform && inputName && (
                        <>
                            <Divider name={t('preview')} />
                            <ChannelElem
                                name={inputName}
                                platform={platform}
                                url={inputUrl}
                                created_at={new Date().toISOString()}
                                auto_renewal={true}
                            />
                        </>
                    )}
                    <Button name={t('next')} onClick={() => addChannelHandler()} disabled={loading} />
                    <Button name={t('cancel')} onClick={() => setPage(1)} />
                </>
            ) : page === 3 ? (
                <>
                    <div className="mx-3 my-3 text-center">
                        <h3 className="text-lg font-semibold mb-2">{t('confirm_channel_addition')}</h3>
                        <p className="text-sm text-foreground/70 mb-4">{t('review_channel_info')}</p>
                    </div>
                    <ChannelElem
                        name={inputName}
                        platform={platform}
                        url={inputUrl}
                        created_at={new Date().toISOString()}
                        auto_renewal={true}
                    />
                    <Button
                        name={loading ? t('adding') : t('confirm')}
                        onClick={() => confirmChannelHandler()}
                        disabled={loading}
                    />
                    <Button name={t('back')} onClick={() => setPage(2)} disabled={loading} />
                </>
            ) : page === 4 ? (
                <>
                    <div className="mx-3 my-3 text-center">
                        <h3 className="text-lg font-semibold mb-2">{t('edit_channel')}</h3>
                        <p className="text-sm text-foreground/70 mb-4">{t('update_channel_info')}</p>
                    </div>
                    <InputField
                        className="mx-3 rounded-lg my-3"
                        placeholder={t('enter_channel_url')}
                        value={inputUrl}
                        onChange={(e) => { setInputUrl(e.target.value) }}
                    />
                    <InputField
                        className="mx-3 rounded-lg my-3"
                        placeholder={t('enter_channel_name')}
                        value={inputName}
                        onChange={(e) => { setInputName(e.target.value) }}
                    />
                    <InputField
                        className="mx-3 rounded-lg"
                        placeholder={t('channel_description_optional')}
                        value={inputDescription}
                        onChange={(e) => { setInputDescription(e.target.value) }}
                    />
                    {platform && inputName && (
                        <>
                            <Divider name={t('preview')} />
                            <ChannelElem
                                name={inputName}
                                platform={platform}
                                url={inputUrl}
                                created_at={editingChannel?.created_at}
                                auto_renewal={editingChannel?.auto_renewal}
                            />
                        </>
                    )}
                    <Button
                        name={loading ? t('updating') : t('save_changes')}
                        onClick={() => confirmEditHandler()}
                        disabled={loading}
                    />
                    <Button
                        name={t('cancel')}
                        onClick={() => {
                            setInputName("");
                            setInputUrl("");
                            setInputDescription("");
                            setPlatform("");
                            setEditingChannel(null);
                            setPage(1);
                        }}
                        disabled={loading}
                    />
                </>
            ) : null}
        </>
    )
}
export default ModalPageChannelManage;