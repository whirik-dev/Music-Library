import DocWrapper from "@/components/ui/DocWrapper";
import Typography from "@/components/ui/Typography";
import Footer from "@/components/ui/Footer";

const { H1, H2, H3, Paragraph, Caption } = Typography;

export const metadata = {
    title: "이용약관",
    description: "휘릭 서비스 이용약관을 읽어보세요. 이 페이지는 이용자의 책임, 회사의 책임 제한 및 기타 법적 동의사항을 규정합니다.",
};
  
export default function Terms() 
{
    return (
        <div className="min-h-screen relative">
            <DocWrapper>
                <H1>이용약관</H1>
                <Caption>최종 업데이트: 2025년 3월 16일</Caption>
                <Paragraph>본 서비스를 이용하기 전에 본 이용약관을 주의 깊게 읽어 주시기 바랍니다.</Paragraph>

                <H2>제1조 (목적)</H2>
                <Paragraph>
                    이 약관은 주식회사 휘릭에이아이 (이하 “회사”)와 “이용자”간에 “회사”가 제공하는 콘텐츠 서비스인 휘릭 레퍼런스 (ref.whirik.com) 및 제반 서비스를 이용함에 있어 회사와 이용자의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
                </Paragraph>

                <H2>제2조 (정의)</H2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        <Paragraph>
                            <strong>① “서비스”</strong>란 회사가 음원을 회원에게 배포하기 위해 회사에서 제공하는 홈페이지를 포함한 제반 서비스를 의미합니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>② “이용자”</strong>란 서비스에 접속하여 이 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>③ “회원”</strong>이라 함은 서비스에 회원등록을 한 자로서, 계속적으로 서비스를 이용할 수 있는 자를 말합니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>④ “비회원”</strong>이라 함은 회원에 가입하지 않고 서비스가 제공하는 서비스를 이용하는 자를 말합니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>⑤</strong> 기타 개별 유료 디지털 상품에 대한 사항은 별도 약관 또는 특약에 따르며, 상충 시 해당 약관이 우선합니다.
                        </Paragraph>
                    </li>
                </ul>

                <H2>제3조 (약관 등의 명시와 설명 및 개정)</H2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        <Paragraph>
                            <strong>①</strong> 회사는 이 약관의 내용, 상호, 대표자, 주소, 연락처, 개인정보책임자 등을 초기화면에 게시합니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>②</strong> 회사는 이용자가 약관에 동의하기 전에 중요한 내용을 별도 화면으로 고지하여 확인을 받습니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>③</strong> 회사는 관련 법을 위배하지 않는 범위 내에서 약관을 개정할 수 있습니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>④</strong> 회사가 약관을 개정할 경우 30일 이전부터 시행일까지 변경 내용 및 사유를 공지하며, 불리한 변경의 경우 별도 통지를 병행합니다.
                        </Paragraph>
                    </li>
                </ul>

                <H2>제4조 (서비스의 제공 및 변경)</H2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        <Paragraph>
                            <strong>①</strong> 회사는 다음 각 호의 서비스를 제공합니다.
                        </Paragraph>
                        <ul className="list-disc pl-6">
                            <li><Paragraph>음원 미리듣기 서비스 제공</Paragraph></li>
                            <li><Paragraph>구매된 콘텐츠의 다운로드 서비스</Paragraph></li>
                            <li><Paragraph>고객지원 등 기타 서비스 운영에 필요한 서비스</Paragraph></li>
                        </ul>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>②</strong> 회사는 음원 제작 및 배급환경의 변화에 따라 계약 내용을 사전 고지 후 변경할 수 있습니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>③</strong> 서비스 내용 변경 시 이용자에게 이메일 등으로 통지합니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>④</strong> 회사의 고의 또는 과실이 없는 경우에는 손해배상 책임을 지지 않습니다.
                        </Paragraph>
                    </li>
                </ul>

                <H2>제5조 (서비스의 범위)</H2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        <Paragraph>
                            <strong>①</strong> 서비스에서 제공하는 콘텐츠는 목적에 관계 없이 자유롭게 사용할 수 있습니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>②</strong> 콘텐츠의 무단 복제, 배포, 공유, 재판매 등은 금지됩니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>③</strong> 회사는 콘텐츠의 사용범위 제한을 위반한 경우 해당 계정의 서비스 이용을 제한할 수 있습니다.
                        </Paragraph>
                    </li>
                </ul>

                <H2>제6조 (서비스의 중단)</H2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        <Paragraph>
                            <strong>①</strong> 회사는 시스템 점검, 고장, 통신두절 등의 사유로 서비스 제공을 일시적으로 중단할 수 있습니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>②</strong> 불가피한 사유로 중단이 발생할 경우 이용자에게 지체 없이 통지하며, 사후 복구에 최선을 다합니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>③</strong> 고의 또는 과실이 없는 경우 회사는 손해배상 책임을 지지 않습니다.
                        </Paragraph>
                    </li>
                </ul>

                <H2>제7조 (정기구독 서비스)</H2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        <Paragraph>
                            <strong>①</strong> 정기구독 서비스는 이용자가 일정 요금을 결제하고, 정해진 기간 내 정해진 수량의 콘텐츠를 다운로드할 수 있는 서비스입니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>②</strong> 정기구독 콘텐츠는 구독 기간 내 다운로드가 완료되어야 하며, 이월 또는 환불되지 않습니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>③</strong> 구독 중 다운로드한 콘텐츠는 구독기간 이후 영상물 내 사용은 허용되나, 새 영상 제작 시 사용은 불가합니다.
                        </Paragraph>
                    </li>
                </ul>

                <H2>제8조 (환불)</H2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        <Paragraph>
                            <strong>①</strong> 회원이 결제한 유료 서비스에 대한 환불은 다음 각 호에 따라 처리됩니다:
                        </Paragraph>
                        <ul className="list-disc pl-6">
                            <li><Paragraph>콘텐츠를 다운로드하지 않은 경우: 결제일로부터 7일 이내 전액 환불</Paragraph></li>
                            <li><Paragraph>일부 콘텐츠를 다운로드한 경우: 미사용 콘텐츠에 대해서만 부분 환불</Paragraph></li>
                            <li><Paragraph>회사의 귀책사유로 서비스 이용이 불가능한 경우: 전액 환불</Paragraph></li>
                        </ul>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>②</strong> 정기구독 서비스의 환불은 다음과 같이 처리됩니다:
                        </Paragraph>
                        <ul className="list-disc pl-6">
                            <li><Paragraph>구독 개시 후 7일 이내이고 콘텐츠를 다운로드하지 않은 경우: 전액 환불</Paragraph></li>
                            <li><Paragraph>구독 개시 후 7일 경과 또는 콘텐츠 다운로드 후: 잔여 기간에 대한 일할 계산 환불</Paragraph></li>
                        </ul>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>③</strong> 환불 신청은 고객센터를 통해 접수하며, 승인된 환불은 결제수단별로 3~7영업일 내에 처리됩니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>④</strong> 다음의 경우에는 환불이 제한됩니다:
                        </Paragraph>
                        <ul className="list-disc pl-6">
                            <li><Paragraph>회원의 귀책사유로 이용제한 또는 계약해지된 경우</Paragraph></li>
                            <li><Paragraph>약관 위반으로 서비스 이용이 중단된 경우</Paragraph></li>
                            <li><Paragraph>콘텐츠를 이용하여 영상물을 제작·배포한 후 환불을 요청하는 경우</Paragraph></li>
                        </ul>
                    </li>
                </ul>

                <H2>제9조 (회사의 의무)</H2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        <Paragraph>
                            <strong>①</strong> 회사는 법령 및 약관에 따라 안정적이고 지속적인 서비스를 제공할 의무가 있습니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>②</strong> 회사는 개인정보 보호를 위해 보안시스템을 갖추고 운영합니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>③</strong> 불법 콘텐츠 발견 시 즉시 삭제 또는 차단 조치를 할 수 있습니다.
                        </Paragraph>
                    </li>
                </ul>

                <H2>제10조 (회원의 의무)</H2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        <Paragraph>
                            <strong>①</strong> 회원은 ID 및 비밀번호를 타인에게 양도 또는 공유할 수 없습니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>②</strong> 타인의 권리를 침해하거나 시스템에 악영향을 미치는 행위를 해서는 안 됩니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>③</strong> 위반 시 회사는 이용을 제한하거나 계약을 해지할 수 있습니다.
                        </Paragraph>
                    </li>
                </ul>

                <H2>제11조 (회원가입)</H2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        <Paragraph>
                            <strong>①</strong> 이용자는 가입 양식 작성과 약관 동의를 통해 회원가입을 신청합니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>②</strong> 회사의 승낙 시점에 회원가입 계약이 성립합니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>③</strong> 정보 변경 시 회원은 지체 없이 수정하여야 하며, 미이행으로 인한 손해에 회사는 책임을 지지 않습니다.
                        </Paragraph>
                    </li>
                </ul>

                <H2>제12조 (회원 탈퇴 및 자격 상실)</H2>
                <Paragraph>
                    회원은 언제든지 탈퇴를 요청할 수 있으며 회사는 이를 즉시 처리합니다.
                </Paragraph>

                <H2>제13조 (회원에 대한 통지)</H2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        <Paragraph>
                            <strong>①</strong> 회사는 회원이 등록한 이메일로 통지를 할 수 있습니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>②</strong> 불특정 다수의 통지는 1주일 이상 공지사항 게시로 갈음할 수 있습니다.
                        </Paragraph>
                    </li>
                </ul>

                <H2>제14조 (회사의 면책)</H2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        <Paragraph>
                            <strong>①</strong> 회사는 회원 간 거래에서 발생하는 분쟁에 개입하지 않으며 책임을 지지 않습니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>②</strong> 회사는 서비스 중단, 데이터 손실, 계정 도용 등의 경우 고의 또는 중대한 과실이 없는 한 면책됩니다.
                        </Paragraph>
                    </li>
                </ul>

                <H2>제15조 (기타 조항)</H2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        <Paragraph>
                            <strong>①</strong> 이 약관에 명시되지 않은 사항은 개별 약관, 운영정책, 관계법령 또는 상관례에 따릅니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>②</strong> 회사는 서비스 운영 상 필요 시 일부 기능을 변경하거나 종료할 수 있습니다.
                        </Paragraph>
                    </li>
                </ul>

                <H2>제16조 (분쟁해결)</H2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        <Paragraph>
                            <strong>①</strong> 회사는 고객센터를 운영하여 정당한 불만을 접수받고, 이를 신속히 처리합니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>②</strong> 처리기간이 지연될 경우 그 사유와 일정을 별도 고지합니다.
                        </Paragraph>
                    </li>
                </ul>

                <H2>제17조 (재판권 및 준거법)</H2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        <Paragraph>
                            <strong>①</strong> 회사와 이용자 간에 발생한 분쟁에 관한 소송은 다음과 각 호와 같이 관할법원을 정합니다:
                        </Paragraph>
                        <ul className="list-disc pl-6">
                            <li><Paragraph>소비자인 이용자가 제기하는 소송: 이용자의 주소지 또는 회사 본사 소재지 관할법원 중 이용자가 선택</Paragraph></li>
                            <li><Paragraph>사업자인 이용자 또는 회사가 제기하는 소송: 회사 본사 소재지 관할법원</Paragraph></li>
                            <li><Paragraph>주소 또는 거소가 분명하지 않거나 외국 거주자의 경우: 민사소송법에 따른 관할법원</Paragraph></li>
                        </ul>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>②</strong> 회사와 이용자 간에 제기된 모든 분쟁 및 소송에는 대한민국 법률을 적용합니다.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph>
                            <strong>③</strong> 국경간 거래에서 발생하는 분쟁의 경우, 관련 국제협약 및 조약이 우선 적용될 수 있습니다.
                        </Paragraph>
                    </li>
                </ul>

                <H2>부칙</H2>
                <Paragraph>
                    이 약관은 2025년 7월 23일부터 시행합니다.
                </Paragraph>
            </DocWrapper>
            <Footer />
        </div>
    );
}