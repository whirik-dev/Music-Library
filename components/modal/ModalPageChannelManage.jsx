"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

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
                    Created on <span className="font-bold">{formatDate(created_at)}</span>
                </div>
                <div className="flex flex-row gap-3 items-baseline justify-end">
                    <span className="text-foreground/50">Auto renewal</span>
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
                            Edit
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(id)}
                            className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-900/20"
                        >
                            Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

const ModalPageChannelManage = ({ }) => {

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
                    console.error('Failed to fetch channels:', res.status);
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
                console.error('Error fetching channels:', error);
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
            alert('Please enter a channel URL');
            return false;
        }
        if (!inputName.trim()) {
            alert('Please enter a channel name');
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
                alert(responseData.message || 'Failed to add channel');
            }
        } catch (error) {
            console.error('Error adding channel:', error);
            alert('Failed to add channel. Please try again.');
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
                alert(responseData.message || 'Failed to toggle auto renewal');
                return false;
            }
        } catch (error) {
            console.error('Error toggling auto renewal:', error);
            alert('Failed to toggle auto renewal. Please try again.');
            return false;
        }
    };

    const handleDeleteChannel = async (channelId) => {
        if (!confirm('Are you sure you want to delete this channel?')) return;

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
                alert(responseData.message || 'Failed to delete channel');
            }
        } catch (error) {
            console.error('Error deleting channel:', error);
            alert('Failed to delete channel. Please try again.');
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
                alert(responseData.message || 'Failed to update channel');
            }
        } catch (error) {
            console.error('Error updating channel:', error);
            alert('Failed to update channel. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ModalCard title="Manage Channels" desc="Organize and manage your connected channels" />
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
                            <p>No channels found. Add your first channel to get started!</p>
                        </div>
                    )}

                    {/* <ChannelElem name={`공룡TV : 공룡의 세계`} platform={`youtube`} url={`https://youtube.com/channel/ABC12X3Y`} expire={`25 Aug. 2025`} allowAutoRenewal={false} />
                    <ChannelElem name={`조류탐험 : 새들의 소리`} platform={`naver`} url={`https://youtube.com/channel/ABC12X31`} expire={`25 Aug. 2025`} allowAutoRenewal={true} />
                    <ChannelElem name={`조류탐험 : 새들의 소리`} platform={`tiktok`} url={`https://youtube.com/channel/ABC12X31`} expire={`25 Aug. 2025`} allowAutoRenewal={true} />
                    <ChannelElem name={`조류탐험 : 새들의 소리`} platform={`instagram`} url={`https://youtube.com/channel/ABC12X31`} expire={`25 Aug. 2025`} allowAutoRenewal={true} />
                    <ChannelElem name={`조류탐험 : 새들의 소리`} platform={`facebook`} url={`https://youtube.com/channel/ABC12X31`} expire={`25 Aug. 2025`} allowAutoRenewal={true} /> */}
                    <Button name="add channel" onClick={() => setPage(2)} />
                </>
            ) : page === 2 ? (
                <>
                    <InputField
                        className="mx-3 rounded-lg my-3"
                        placeholder="Please enter your channel URL"
                        value={inputUrl}
                        onChange={(e) => { setInputUrl(e.target.value) }}
                    />
                    <InputField
                        className="mx-3 rounded-lg my-3"
                        placeholder="Please enter your channel Name"
                        value={inputName}
                        onChange={(e) => { setInputName(e.target.value) }}
                    />
                    <InputField
                        className="mx-3 rounded-lg"
                        placeholder="Channel description (optional)"
                        value={inputDescription}
                        onChange={(e) => { setInputDescription(e.target.value) }}
                    />
                    {platform && inputName && (
                        <>
                            <Divider name="preview" />
                            <ChannelElem
                                name={inputName}
                                platform={platform}
                                url={inputUrl}
                                created_at={new Date().toISOString()}
                                auto_renewal={true}
                            />
                        </>
                    )}
                    <Button name="next" onClick={() => addChannelHandler()} disabled={loading} />
                    <Button name="cancel" onClick={() => setPage(1)} />
                </>
            ) : page === 3 ? (
                <>
                    <div className="mx-3 my-3 text-center">
                        <h3 className="text-lg font-semibold mb-2">Confirm Channel Addition</h3>
                        <p className="text-sm text-foreground/70 mb-4">Please review the channel information before adding</p>
                    </div>
                    <ChannelElem
                        name={inputName}
                        platform={platform}
                        url={inputUrl}
                        created_at={new Date().toISOString()}
                        auto_renewal={true}
                    />
                    <Button
                        name={loading ? "Adding..." : "confirm"}
                        onClick={() => confirmChannelHandler()}
                        disabled={loading}
                    />
                    <Button name="back" onClick={() => setPage(2)} disabled={loading} />
                </>
            ) : page === 4 ? (
                <>
                    <div className="mx-3 my-3 text-center">
                        <h3 className="text-lg font-semibold mb-2">Edit Channel</h3>
                        <p className="text-sm text-foreground/70 mb-4">Update your channel information</p>
                    </div>
                    <InputField
                        className="mx-3 rounded-lg my-3"
                        placeholder="Please enter your channel URL"
                        value={inputUrl}
                        onChange={(e) => { setInputUrl(e.target.value) }}
                    />
                    <InputField
                        className="mx-3 rounded-lg my-3"
                        placeholder="Please enter your channel Name"
                        value={inputName}
                        onChange={(e) => { setInputName(e.target.value) }}
                    />
                    <InputField
                        className="mx-3 rounded-lg"
                        placeholder="Channel description (optional)"
                        value={inputDescription}
                        onChange={(e) => { setInputDescription(e.target.value) }}
                    />
                    {platform && inputName && (
                        <>
                            <Divider name="preview" />
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
                        name={loading ? "Updating..." : "save changes"}
                        onClick={() => confirmEditHandler()}
                        disabled={loading}
                    />
                    <Button
                        name="cancel"
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