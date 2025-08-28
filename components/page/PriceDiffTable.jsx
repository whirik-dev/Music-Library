import { IconX, IconCircle } from "@tabler/icons-react"

const PriceDiffTable = () => {

    const priceDiffTable = [

    ]

    const thClass = "border-b-1 border-white/10 py-5 text-xl font-black";
    const tdClass = "border-b-1 border-r-1 last:border-r-0 border-white/10 text-center first:text-left py-5";
    const iconClass = "inline"

    return (
        <div className="w-full">  
            <table className="table-fixed w-full">
                <thead>
                    <tr>
                        <th className={`${thClass}`}></th>
                        <th className={`${thClass}`}>Free</th>
                        <th className={`${thClass}`}>Basic</th>
                        <th className={`${thClass}`}>Pro</th>
                        <th className={`${thClass}`}>Master</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className={`${tdClass}`}>Download Music</td>
                        <td className={`${tdClass}`}>10 music per month</td>
                        <td className={`${tdClass}`}>unlimited</td>
                        <td className={`${tdClass}`}>unlimited</td>
                        <td className={`${tdClass}`}>unlimited</td>
                    </tr>
                    <tr>
                        <td className={`${tdClass}`}>Download Music Quality</td>
                        <td className={`${tdClass}`}>192kbps mp3</td>
                        <td className={`${tdClass}`}>WAV 24bit</td>
                        <td className={`${tdClass}`}>WAV 24bit</td>
                        <td className={`${tdClass}`}>WAV 24bit</td>
                    </tr>
                    <tr>
                        <td className={`${tdClass}`}>Credits</td>
                        <td className={`${tdClass}`}>20 Credits</td>
                        <td className={`${tdClass}`}>70 Credits</td>
                        <td className={`${tdClass}`}>150 Credits</td>
                        <td className={`${tdClass}`}>500 Credits</td>
                    </tr>
                    <tr>
                        <td className={`${tdClass}`}>Commercial Use</td>
                        <td className={`${tdClass}`}><IconX size="18" className={`${iconClass}`}/></td>
                        <td className={`${tdClass}`}><IconCircle size="18" className={`${iconClass}`}/></td>
                        <td className={`${tdClass}`}><IconCircle size="18" className={`${iconClass}`}/></td>
                        <td className={`${tdClass}`}><IconCircle size="18" className={`${iconClass}`}/></td>
                    </tr>
                    <tr>
                        <td className={`${tdClass}`}>Preview</td>
                        <td className={`${tdClass}`}><IconCircle size="18" className={`${iconClass}`}/></td>
                        <td className={`${tdClass}`}><IconCircle size="18" className={`${iconClass}`}/></td>
                        <td className={`${tdClass}`}><IconCircle size="18" className={`${iconClass}`}/></td>
                        <td className={`${tdClass}`}><IconCircle size="18" className={`${iconClass}`}/></td>
                    </tr>
                </tbody>
            </table>
            이하 더 비교할점을 찾아보면 좋ㄹ겠음
        </div>
    )
}
export default PriceDiffTable;