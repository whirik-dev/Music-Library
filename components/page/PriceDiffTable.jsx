import { IconX, IconCircle } from "@tabler/icons-react"

const PriceDiffTable = () => {
    // 플랜 정보
    const plans = ['Free', 'Basic', 'Pro', 'Master'];

    // 테이블 데이터 구조화
    const tableData = [
        {
            feature: 'Download Music',
            values: ['10 music per month', 'unlimited', 'unlimited', 'unlimited']
        },
        {
            feature: 'Download Music Quality',
            values: ['192kbps mp3', 'WAV 24bit', 'WAV 24bit', 'WAV 24bit']
        },
        {
            feature: 'Credits',
            values: ['20 Credits', '70 Credits', '150 Credits', '500 Credits']
        },
        {
            feature: 'Commercial Use',
            values: [false, true, true, true],
            isBoolean: true
        },
        {
            feature: 'Preview',
            values: [true, true, true, true],
            isBoolean: true
        }
    ];

    const thClass = "border-b-1 border-white/10 py-5 text-xl font-black";
    const tdClass = "border-b-1 border-r-1 last:border-r-0 border-white/10 text-center first:text-left py-5";
    const iconClass = "inline";

    const renderCellContent = (value, isBoolean) => {
        if (isBoolean) {
            return value ?
                <IconCircle size="18" className={iconClass} /> :
                <IconX size="18" className={iconClass} />;
        }
        return value;
    };

    return (
        <div className="w-full">
            <table className="table-fixed w-full">
                <thead>
                    <tr>
                        <th className={thClass}></th>
                        {plans.map((plan) => (
                            <th key={plan} className={thClass}>{plan}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row, index) => (
                        <tr key={index}>
                            <td className={tdClass}>{row.feature}</td>
                            {row.values.map((value, valueIndex) => (
                                <td key={valueIndex} className={tdClass}>
                                    {renderCellContent(value, row.isBoolean)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
export default PriceDiffTable;