
import useMusicItemStore from "@/stores/useMusicItemStore";


function getTime(timeNum, sampleRate) {
    const durationInSeconds = timeNum / sampleRate;
    const durationMinutes = Math.floor(durationInSeconds / 60);
    const durationSeconds = Math.floor(durationInSeconds % 60);

    return `${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
}

function getTimeBySecond(second) {
    const durationMinutes = Math.floor(second / 60);
    const durationSeconds = Math.floor(second % 60);

    return `${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
}


const DurationMeter = ({ id, metadata }) => {
    const {
        status,
        playingTrackId,
        currentTime,
        duration,
    } = useMusicItemStore();
    const isActive = playingTrackId === id && status != null;

    const metaDuration = metadata?.find(item => item.type === "duration")?.content ?? "--";

    return (
        <div className={`relative select-none text-foreground ${status === 'loading' && isActive && 'animate-pulse'}`}>
            {status !== null && playingTrackId === id ? (
                <>
                    {status === 'loading' ? getTimeBySecond(metaDuration) : `${getTimeBySecond(currentTime)} / ${getTimeBySecond(metaDuration)}`}
                </>
            ) : (
                <>{getTimeBySecond(metaDuration)}</>
            )}
        </div>
    );
}
export default DurationMeter;