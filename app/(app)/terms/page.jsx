import DocWrapper from "@/components/ui/DocWrapper";
import Typography from "@/components/ui/Typography";
const { H1, H2, H3, Paragraph, Caption } = Typography;

export const metadata = {
    title: "Terms and Conditions - WhiRik",
    description: "Read the terms and conditions for using WhiRik's services. This page outlines user responsibilities, limitations of liability, and other legal agreements.",
};
  
export default function Terms() 
{
    return (
        <div className="min-h-screen relative">
            <DocWrapper>
                <H1>Terms and Conditions</H1>
                <Caption>Last updated: March 16, 2025</Caption>
                <Paragraph>Please read these terms and conditions carefully before using Our Service.</Paragraph>

                <H2>Interpretation and Definitions</H2>
                <H3>Interpretation</H3>
                <Paragraph>
                    The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
                </Paragraph>

                <H3>Definitions</H3>
                <Paragraph>For the purposes of these Terms and Conditions:</Paragraph>
                <ul className="list-disc pl-6 space-y-1">
                    <li>
                        <Paragraph>
                            <strong>Affiliate</strong> means an entity that controls, is controlled by, or is under common control with a party, where “control” means ownership of 50% or more of the shares, equity interest, or other securities entitled to vote for election of directors or other managing authority.
                        </Paragraph>
                    </li>
                    <li>
                        <Paragraph><strong>Country</strong> refers to: South Korea</Paragraph>
                    </li>
                    <li>
                        <Paragraph><strong>Company</strong> (referred to as either “the Company”, “We”, “Us” or “Our” in this Agreement) refers to Whirik.</Paragraph>
                    </li>
                    <li>
                        <Paragraph><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone, or a digital tablet.</Paragraph>
                    </li>
                    <li>
                        <Paragraph><strong>Service</strong> refers to the Website.</Paragraph>
                    </li>
                    <li>
                        <Paragraph><strong>Terms and Conditions</strong> (also referred to as “Terms”) mean these Terms and Conditions that form the entire agreement between You and the Company regarding the use of the Service.</Paragraph>
                    </li>
                    <li>
                        <Paragraph><strong>Third-party Social Media Service</strong> means any services or content (including data, information, products, or services) provided by a third-party that may be displayed, included, or made available by the Service.</Paragraph>
                    </li>
                    <li>
                        <Paragraph><strong>Website</strong> refers to Orchestra de Arte, accessible from <a href="https://ref.whirik.com" className="underline text-teal-600">https://ref.whirik.com</a></Paragraph>
                    </li>
                    <li>
                        <Paragraph><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</Paragraph>
                    </li>
                </ul>

                <H2>Acknowledgment</H2>
                <Paragraph>
                    These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.
                </Paragraph>
                <Paragraph>
                    Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users, and others who access or use the Service.
                </Paragraph>
                <Paragraph>
                    By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.
                </Paragraph>
                <Paragraph>
                    You represent that you are over the age of 19. The Company does not permit those under 19 to use the Service.
                </Paragraph>
                <Paragraph>
                    Your access to and use of the Service is also conditioned on Your acceptance of and compliance with the Privacy Policy of the Company. Our Privacy Policy describes Our policies and procedures on the collection, use, and disclosure of Your personal information when You use the Application or the Website and tells You about Your privacy rights and how the law protects You. Please read Our Privacy Policy carefully before using Our Service.
                </Paragraph>

                <H2>Links to Other Websites</H2>
                <Paragraph>
                    Our Service may contain links to third-party websites or services that are not owned or controlled by the Company.
                </Paragraph>
                <Paragraph>
                    The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services.
                </Paragraph>
                <Paragraph>
                    We strongly advise You to read the terms and conditions and privacy policies of any third-party websites or services that You visit.
                </Paragraph>

                <H2>Termination</H2>
                <Paragraph>
                    We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.
                </Paragraph>
                <Paragraph>
                    Upon termination, Your right to use the Service will cease immediately.
                </Paragraph>

                <H2>Limitation of Liability</H2>
                <Paragraph>
                    Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of these Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 10,000 KRW if You haven’t purchased anything through the Service.
                </Paragraph>
                <Paragraph>
                    To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service, third-party software and/or third-party hardware used with the Service, or otherwise in connection with any provision of these Terms), even if the Company or any supplier has been advised of the possibility of such damages and even if the remedy fails of its essential purpose.
                </Paragraph>

                <H2>“AS IS” and “AS AVAILABLE” Disclaimer</H2>
                <Paragraph>
                    The Service is provided to You “AS IS” and “AS AVAILABLE” and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory, or otherwise, with respect to the Service, including all implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement, and warranties that may arise out of course of dealing, course of performance, usage, or trade practice.
                </Paragraph>

                <H2>Governing Law</H2>
                <Paragraph>
                    The laws of the Country, excluding its conflicts of law rules, shall govern these Terms and Your use of the Service. Your use of the Application may also be subject to other local, national, or international laws.
                </Paragraph>

                <H2>Disputes Resolution</H2>
                <Paragraph>
                    If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company.
                </Paragraph>

                <H2>Severability and Waiver</H2>
                <H3>Severability</H3>
                <Paragraph>
                    If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.
                </Paragraph>
                <H3>Waiver</H3>
                <Paragraph>
                    Except as provided herein, the failure to exercise a right or to require performance of an obligation under these Terms shall not affect a party’s ability to exercise such right or require such performance at any time thereafter nor shall the waiver of a breach constitute a waiver of any subsequent breach.
                </Paragraph>

                <H2>Changes to These Terms and Conditions</H2>
                <Paragraph>
                    We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material, We will make reasonable efforts to provide at least 30 days’ notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.
                </Paragraph>
                <Paragraph>
                    By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the website and the Service.
                </Paragraph>

                <H2>Contact Us</H2>
                <Paragraph>
                    If you have any questions about these Terms and Conditions, You can contact us:
                </Paragraph>
                <ul className="list-disc pl-6">
                    <li><Paragraph>By email: changhyun.me@gmail.com</Paragraph></li>
                </ul>
            </DocWrapper>
        </div>
    );
}
