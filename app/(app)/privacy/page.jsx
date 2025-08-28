import DocWrapper from "@/components/ui/DocWrapper";
import Typography from "@/components/ui/Typography";
const { H1, H2, H3, Paragraph, Caption } = Typography;

export const metadata = {
    title: "Privacy Policy - WhiRik",
    description: "This Privacy Policy outlines how WhiRik collects, uses, and protects your data when using our services.",
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen relative">
            <DocWrapper>
                <H1>Privacy Policy</H1>
                <Caption>Last updated: March 16, 2025</Caption>
                <Paragraph>
                    This Privacy Policy describes Our policies and procedures on the collection, use, and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
                </Paragraph>
                <Paragraph>
                    We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
                </Paragraph>

                <H2>Interpretation and Definitions</H2>
                <H3>Interpretation</H3>
                <Paragraph>
                    The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
                </Paragraph>

                <H3>Definitions</H3>
                <Paragraph>For the purposes of this Privacy Policy:</Paragraph>
                <ul className="list-disc pl-6 space-y-1">
                    <li><Paragraph><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</Paragraph></li>
                    <li><Paragraph><strong>Company</strong> refers to Whirik.</Paragraph></li>
                    <li><Paragraph><strong>Cookies</strong> are small files placed on Your device that store browsing details among other uses.</Paragraph></li>
                    <li><Paragraph><strong>Country</strong> refers to: South Korea</Paragraph></li>
                    <li><Paragraph><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone, or a digital tablet.</Paragraph></li>
                    <li><Paragraph><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</Paragraph></li>
                    <li><Paragraph><strong>Service</strong> refers to the Website.</Paragraph></li>
                    <li><Paragraph><strong>Service Provider</strong> refers to any third-party who processes data on behalf of the Company.</Paragraph></li>
                    <li><Paragraph><strong>Usage Data</strong> refers to data collected automatically, like page visit duration.</Paragraph></li>
                    <li><Paragraph><strong>Website</strong> refers to Orchestra de Arte, accessible from <a href="https://ref.whirik.com" className="underline text-teal-600">https://ref.whirik.com</a></Paragraph></li>
                    <li><Paragraph><strong>You</strong> means the individual accessing or using the Service.</Paragraph></li>
                </ul>

                <H2>Collecting and Using Your Personal Data</H2>
                <H3>Types of Data Collected</H3>
                <H3>Personal Data</H3>
                <Paragraph>
                    While using Our Service, We may ask You to provide Us with certain personally identifiable information. This may include but is not limited to:
                </Paragraph>
                <ul className="list-disc pl-6">
                    <li><Paragraph>Email address</Paragraph></li>
                    <li><Paragraph>First name and last name</Paragraph></li>
                    <li><Paragraph>Phone number</Paragraph></li>
                </ul>

                <H3>Usage Data</H3>
                <Paragraph>
                    Usage Data is collected automatically when using the Service. It may include details such as IP address, browser type, pages visited, time spent, device type, etc.
                </Paragraph>

                <H3>Tracking Technologies and Cookies</H3>
                <Paragraph>
                    We use Cookies and similar tracking technologies to track activity and store information. These include:
                </Paragraph>
                <ul className="list-disc pl-6 space-y-1">
                    <li><Paragraph><strong>Cookies or Browser Cookies</strong>: You can instruct Your browser to refuse all Cookies.</Paragraph></li>
                    <li><Paragraph><strong>Web Beacons</strong>: Used to monitor page views or email opens.</Paragraph></li>
                </ul>

                <Paragraph>Cookies can be “Persistent” or “Session” Cookies:</Paragraph>
                <ul className="list-disc pl-6 space-y-1">
                    <li><Paragraph><strong>Persistent Cookies</strong> remain on your device when offline.</Paragraph></li>
                    <li><Paragraph><strong>Session Cookies</strong> are deleted once the browser is closed.</Paragraph></li>
                </ul>

                <H3>Cookie Purposes</H3>
                <ul className="list-disc pl-6 space-y-1">
                    <li><Paragraph><strong>Essential Cookies</strong> – Needed to use the Service.</Paragraph></li>
                    <li><Paragraph><strong>Notice Acceptance Cookies</strong> – To remember your cookie consent.</Paragraph></li>
                    <li><Paragraph><strong>Functionality Cookies</strong> – Remember user preferences and login.</Paragraph></li>
                </ul>

                <Paragraph>
                    For more info on cookies and your options, please visit our Cookies Policy or the cookies section of this Privacy Policy.
                </Paragraph>

                <H2>Contact Us</H2>
                <Paragraph>
                    If you have any questions about this Privacy Policy, You can contact us:
                </Paragraph>
                <ul className="list-disc pl-6">
                    <li><Paragraph>By email: changhyun.me@gmail.com</Paragraph></li>
                </ul>
            </DocWrapper>
        </div>
    );
}