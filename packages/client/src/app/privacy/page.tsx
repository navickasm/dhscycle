import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | DHS Bell Schedule",
    description: "Privacy policy for the DHS Bell Schedule website",
};

const headingStyle: React.CSSProperties = {
    color: "var(--main)",
    marginTop: "25px",
    marginBottom: "10px",
};

export default function PrivacyPolicy() {
    return (
        <div style={{maxWidth: "700px", margin: "0 auto", padding: "20px", lineHeight: 1.6}}>
            <h1>Privacy Policy</h1>
            <p style={{marginTop: "10px", fontStyle: "italic"}}>Last Updated: August 11, 2026</p>
            <p style={{marginTop: "15px"}}>
                Your privacy is important to us. This policy outlines what data we collect when you visit this website and how it is used.
            </p>

            <h2 style={headingStyle}>Data Collection & Infrastructure</h2>
            <p>We believe in minimalism and transparency regarding data collection across our network architecture:</p>
            <ul style={{paddingLeft: "25px", marginTop: "10px"}}>
                <li style={{marginBottom: "10px"}}>
                    <strong>Security & CDN (Cloudflare): </strong>
                    Traffic routed to our services passes through Cloudflare, which acts as a reverse proxy and security layer.
                    Cloudflare processes technical logs (including IP addresses and request metadata) to block malicious traffic, mitigate security threats, and optimize performance in accordance with <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" style={{color: "var(--main)"}}>Cloudflare's Privacy Policy</a>.
                </li>
                <li style={{marginBottom: "10px"}}>
                    <strong>Hosting (GitHub Pages): </strong>
                    The user-facing part of this website is hosted on GitHub Pages.
                    When you view the site, GitHub may collect technical logs and IP addresses in accordance with <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer" style={{color: "var(--main)"}}>GitHub's Privacy Statement</a>.
                </li>
                <li style={{marginBottom: "10px"}}>
                    <strong>Backend Infrastructure (DigitalOcean): </strong>
                    DigitalOcean processes infrastructure-level data and physical network traffic necessary to maintain and secure the virtual private server's environment, subject to <a href="https://www.digitalocean.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{color: "var(--main)"}}>DigitalOcean's Privacy Policy</a>.
                </li>
                <li style={{marginBottom: "10px"}}>
                    <strong>Backend Server Logs: </strong>
                    Our server automatically records standard request info (such as anonymized IP addresses, browser types, and timestamps) for technical administration and server security.
                    To protect your privacy, we enforce a strict log rotation and short retention policy.
                    Server log files are deleted after a maximum of 14 days.
                </li>
                <li style={{marginBottom: "10px"}}>
                    <strong>Usage Tracking: </strong>
                    We do not use third-party analytics or cookies for tracking.
                    Internal methods are used to gauge site traffic without linking your identity to your visits.
                </li>
                <li style={{marginBottom: "10px"}}>
                    <strong>Local Customization: </strong>
                    The &quot;Color Editor&quot; allows you to customize the site&apos;s theme.
                    Your preferences are saved exclusively in your browser&apos;s Local Storage and are never transmitted to or stored on our servers.
                </li>
            </ul>

            <h2 style={headingStyle}>Data Sharing</h2>
            <p>We do not sell, rent, or share personal information with third parties, except with essential infrastructure and security providers strictly required to deliver and secure the site.</p>

            <h2 style={headingStyle}>Your Rights</h2>
            <p>
                Because we do not require user accounts, collect names, or store persistent profiles, we generally cannot identify individual visitors.
            </p>

            <h2 style={headingStyle}>Contact</h2>
            <p>
                If you have any questions regarding this policy, please reach out to us at privacy@dhscycle.com.
            </p>

            <p style={{marginTop: "30px"}}>
                <a href="/">&larr; Back to schedule</a>
            </p>
        </div>
    );
}
