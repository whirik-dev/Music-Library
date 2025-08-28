import crypto from 'crypto';

// const generateRandomDate = () => {
//     const randomDate = new Date(2000, Math.floor(Math.random() * 12), Math.floor(Math.random() * 31) + 1);
//     return randomDate.toISOString().slice(0, 19).replace('T', ' ');  // 날짜 형식 "YYYY-MM-DD HH:MM:SS"
// };

function generateDeterministicColor(id) {
    // id를 기반으로 해시 생성
    const hash = crypto.createHash('sha256').update(id.toString()).digest('hex');

    // 해시의 일부를 숫자로 변환하여 hue, chroma, lightness 계산
    const hue = parseInt(hash.substr(0, 4), 16) % 360;
    const chroma = (parseInt(hash.substr(4, 4), 16) % 8000) / 10000 + 0.2; // 0.2 ~ 1.0
    const lightness = (parseInt(hash.substr(8, 4), 16) % 6000) / 10000 + 0.2; // 0.2 ~ 0.8

    return `oklch(${lightness} ${chroma} ${hue}deg)`;
}

const generateSample = (id) => {
    return {
        id: `SAMPLE-${id}-HASHED-SAMPLE`,
        created_at: '1993-08-27 14:03:01',
        last_modifyed: '1993-08-27 14:03:01',
        test_color: generateDeterministicColor(id),
        metadata: [
            { type: "title", content: `Title ${id}-T` },
            { type: "subtitle", content: `Subtitle ${id}-S` },
            { type: "composer", content: `Composer ${id}-C` },
            { type: "duration", content: 10661572 },
            { type: "channel", content: "2" },
            { type: "sampleRate", content: "44100" },
            { type: "bitRate", content: "192kbps" },
            { type: "SHA-1", content: `SHA1-${id}` },
        ],
        term: [
            { type: "category", name: "music" },
            { type: "tag", name: `Tag ${id}-1` },
            { type: "tag", name: `Tag ${id}-2` },
            { type: "scene", name: `Scene ${id}` },
        ],
        file: [
            {
                fid: "file-sample-001",
                type: "origin",
                path: "/sample.mp3",
                size: 5801690, // byte
                mime: {
                    type: "audio/mp3",
                    ext: "mp3",
                }
            },
            {
                fid: "file-sample-002",
                type: "preview",
                path: "/sample.mp3",
                size: 5801690, // byte
                mime: {
                    type: "audio/mp3",
                    ext: "mp3",
                }
            },
            {
                fid: "file-sample-003",
                type: "waveform",
                path: "/sample.png",
                mime: {
                    type: "image/png",
                    ext: "png",
                }
            }
        ]
    };
};

const assetSample = [];
for (let i = 1; i <8; i++) {
    assetSample.push(generateSample(i));
}

// console.log(assetSample);
export default assetSample;