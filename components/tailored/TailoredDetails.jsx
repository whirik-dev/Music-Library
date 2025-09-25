
import { useEffect } from "react";
import { useTranslations } from 'next-intl';
import useTailoredStore from "@/stores/useTailoredStore";

import Button from "@/components/ui/Button2";
import InputField from "@/components/ui/InputField";
import InputTextarea from "@/components/ui/InputTextarea";

const TailoredDetails = ({id}) => {
    const { target, detail, setDetail, updateTailoredInfo, setTailoredInfoByPath, currentTailoredInfo } = useTailoredStore();
    const t = useTranslations('tailored');

    // items 배열 가져오기
    const items = currentTailoredInfo?.data?.sow?.items || [];

    function setAdditionalRequestHandler(e) {
        setTailoredInfoByPath('data.sow.comment1', e.target.value);
    }

    function setDetailRequestHandler(e) {
        setTailoredInfoByPath('data.sow.comment2', e.target.value);
    }

    // 시간 형식 검증 함수 (소수점 2자리)
    function validateTimeFormat(timeStr) {
        const timeRegex = /^\d{2}:\d{2}\.\d{2}$/;
        return timeRegex.test(timeStr);
    }

    // 시간 형식 변환 함수 (0000 -> 00:00.00)
    function formatTimeString(input) {
        if (input.length === 4 && /^\d{4}$/.test(input)) {
            return `${input.slice(0, 2)}:${input.slice(2)}.00`;
        }
        return input;
    }

    // 시간 문자열을 밀리초로 변환 (불완전한 입력도 처리)
    function timeToMilliseconds(timeStr) {
        if (!timeStr) return 0;

        // 완전한 형식인 경우
        if (validateTimeFormat(timeStr)) {
            const [minutes, seconds] = timeStr.split(':');
            const [sec, ms] = seconds.split('.');
            return parseInt(minutes) * 60000 + parseInt(sec) * 1000 + parseInt(ms);
        }

        // 불완전한 입력 처리
        let cleanStr = timeStr.replace(/[^0-9:.]/g, '');

        // 숫자만 있는 경우 (예: "123", "1234")
        if (/^\d+$/.test(cleanStr)) {
            if (cleanStr.length <= 2) {
                // 1-2자리: 초로 간주 (예: "5" -> 5초, "30" -> 30초)
                return parseInt(cleanStr) * 1000;
            } else if (cleanStr.length <= 4) {
                // 3-4자리: MMSS 형식으로 간주 (예: "130" -> 1:30, "1234" -> 12:34)
                const minutes = parseInt(cleanStr.slice(0, -2)) || 0;
                const seconds = parseInt(cleanStr.slice(-2)) || 0;
                return minutes * 60000 + seconds * 1000;
            }
        }

        // 부분적인 시간 형식 처리 (예: "1:", "1:30", "1:30.")
        const parts = cleanStr.split(':');
        if (parts.length >= 2) {
            const minutes = parseInt(parts[0]) || 0;
            const secondsPart = parts[1] || '0';
            const secParts = secondsPart.split('.');
            const seconds = parseInt(secParts[0]) || 0;
            const ms = parseInt(secParts[1]?.padEnd(2, '0').slice(0, 2)) * 10 || 0; // 센티초를 밀리초로 변환
            return minutes * 60000 + seconds * 1000 + ms;
        }

        // 분만 있는 경우 (예: "5")
        const minutes = parseInt(parts[0]) || 0;
        return minutes * 60000;
    }

    // 밀리초를 시간 문자열로 변환 (소수점 2자리)
    function millisecondsToTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const centiseconds = Math.floor((ms % 1000) / 10); // 10ms 단위로 변환
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    }

    // 키 입력 필터링 및 방향키 시간 조정
    function handleTimeKeyPress(e, itemIndex, field) {
        // 방향키 처리
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();

            const currentValue = e.target.value || '00:00.00';
            const currentMs = timeToMilliseconds(currentValue);

            // Shift + 방향키: 0.01초(10ms) 단위, 일반 방향키: 1초(1000ms) 단위
            const increment = e.shiftKey ? 10 : 1000;
            const newMs = e.key === 'ArrowUp'
                ? Math.max(0, currentMs + increment)
                : Math.max(0, currentMs - increment);

            const newTimeStr = millisecondsToTime(newMs);
            e.target.value = newTimeStr;

            // 스토어에 저장
            setTailoredInfoByPath(`data.sow.items.${itemIndex}.${field}`, newTimeStr);
            return;
        }

        // 기존 문자 필터링
        const allowedChars = /[0-9:.]/;
        if (!allowedChars.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
            e.preventDefault();
        }
    }

    // 시간 입력 핸들러
    function handleTimeInput(e, itemIndex, field) {
        let value = e.target.value;

        // 허용되지 않는 문자 제거
        value = value.replace(/[^0-9:.]/g, '');

        // 4자리 숫자인 경우 자동 변환
        if (value.length === 4 && /^\d{4}$/.test(value)) {
            value = formatTimeString(value);
        }

        // 입력 필드 값 업데이트
        e.target.value = value;

        // 스토어에 저장
        setTailoredInfoByPath(`data.sow.items.${itemIndex}.${field}`, value);
        return true;
    }

    // 코멘트 입력 핸들러
    function handleCommentInput(e, itemIndex) {
        setTailoredInfoByPath(`data.sow.items.${itemIndex}.comment`, e.target.value);
    }

    // 새 아이템 추가
    function addNewItem() {
        const newItem = {
            pos1: '',
            pos2: '',
            comment: ''
        };
        const newItems = [...items, newItem];
        setTailoredInfoByPath('data.sow.items', newItems);
    }

    // 아이템 삭제
    function removeItem(index) {
        const newItems = items.filter((_, i) => i !== index);
        setTailoredInfoByPath('data.sow.items', newItems);
    }

    useEffect(() => {
        // 현재 시간 + 3일
        const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

        setTailoredInfoByPath("data.title", `Tailored Jobs - ${id.slice(-6)}`);
        setTailoredInfoByPath("data.due-date", threeDaysLater.toISOString());
        setTailoredInfoByPath("data.sow.comment2", t('whirik_reference_work'));
        setTailoredInfoByPath("data.ref-music", `https://${process.env.NEXT_PUBLIC_ASSET_SERVER}/${id}?r=preview`);

        // 마운트시 기본적으로 1개행 추가
        if (items.length === 0) {
            addNewItem();
        }
    }, []);

    return (
        <>
            <div className="bg-gradient-to-r from-purple-500 to-blue-400 px-2 py-1 rounded-md font-bold">
                {t('modification_request_section')}
            </div>
            <div className="flex flex-row gap-3 items-center">
                <div className="w-1/5 text-xs text-center">
                    from
                </div>
                <div className="w-1/5 text-xs text-center">
                    to
                </div>
                <div className="flex-1 text-sm text-center">
                    modification request content
                </div>
                <div className="w-10 bg-transparent"/>
            </div>
            {/* 기존 아이템들 렌더링 */}
            {items.map((item, index) => (
                <div key={index} className="flex flex-row gap-3 mb-2">
                    <InputField
                        className="w-1/5 font-mono"
                        placeholder="00:00.00"
                        value={item.pos1 || ''}
                        onChange={(e) => handleTimeInput(e, index, 'pos1')}
                        onKeyDown={(e) => handleTimeKeyPress(e, index, 'pos1')}
                    />
                    <InputField
                        className="w-1/5 font-mono"
                        placeholder="00:00.00"
                        value={item.pos2 || ''}
                        onChange={(e) => handleTimeInput(e, index, 'pos2')}
                        onKeyDown={(e) => handleTimeKeyPress(e, index, 'pos2')}
                    />
                    <InputField
                        className="flex-1"
                        placeholder={t('modification_request_content')}
                        value={item.comment || ''}
                        onChange={(e) => handleCommentInput(e, index)}
                    />
                    <Button
                        className="py-1 px-2 flex items-center justify-center"
                        name="×"
                        onClick={() => removeItem(index)}
                    />
                </div>
            ))}

            {/* 새 아이템 추가 버튼 */}
            <Button className="py-1" name="+" onClick={addNewItem} />

            <div className="bg-gradient-to-r from-purple-500 to-blue-400 px-2 py-1 rounded-md font-bold mt-4">
                {t('additional_requests')}
            </div>
            <InputTextarea onChange={setAdditionalRequestHandler} value={currentTailoredInfo?.data?.sow?.comment1 || ""} />
            {/* <div className="">
                참고해야 할 사항
            </div>
            <InputTextarea onChange={setDetailRequestHandler} value={currentTailoredInfo?.data?.sow?.comment2 || ""} /> */}
            {/* <div className="">
                dev
            </div>
            <InputTextarea onChange={() => { }} value={JSON.stringify(currentTailoredInfo)} readOnly /> */}
        </>
    )
}

export default TailoredDetails;