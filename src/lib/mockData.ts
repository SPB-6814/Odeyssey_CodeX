export const falseNegativePool = [
  { title: "CryptoWallet Pro", status: "Flagged Safe", issue: "Malware Payload Detected", time: "2m ago" },
  { title: "SecureVPN Ext", status: "Clean Scan", issue: "Data Exfiltration", time: "15m ago" },
  { title: "DefiSwap Portal", status: "No Threat", issue: "Phishing Redirect", time: "1h ago" },
  { title: "AuthGuard App", status: "Trusted", issue: "Credential Harvesting", time: "3h ago" },
  { title: "SafeBrowser AI", status: "Verified", issue: "Hidden Tracker", time: "4h ago" },
  { title: "CloudSync Max", status: "Low Risk", issue: "Ransomware Dropper", time: "5h ago" },
  { title: "PrivacyShield", status: "Clean Scan", issue: "Keylogger Embedded", time: "6h ago" },
  { title: "PassVault Pro", status: "Flagged Safe", issue: "Backdoor Vulnerability", time: "7h ago" },
  { title: "AdBlock Plus+", status: "Trusted", issue: "Adware Injection", time: "8h ago" },
  { title: "NetBooster", status: "Verified", issue: "Cryptojacking Script", time: "10h ago" }
];

export const falsePositivePool = [
  { title: "IndieGame Studio", status: "Blocked", resolution: "Verified Authentic", time: "10m ago" },
  { title: "CharityFund DAO", status: "High Risk", resolution: "Legitimate Entity", time: "45m ago" },
  { title: "LocalNews Blog", status: "Bot Activity", resolution: "Organic Viral Traffic", time: "2h ago" },
  { title: "ArtisanMarket", status: "Scam Warning", resolution: "Secure Transactions", time: "5h ago" },
  { title: "OpenSource Hub", status: "Suspicious", resolution: "Code Repository", time: "6h ago" },
  { title: "HealthTech AI", status: "Phishing Alert", resolution: "Official API Access", time: "8h ago" },
  { title: "EduLearn Portal", status: "Malware Risk", resolution: "Safe Downloads", time: "9h ago" },
  { title: "FinTech Startup", status: "Fraud Warning", resolution: "Licensed Bank", time: "11h ago" },
  { title: "EcoStore Online", status: "Unsafe Link", resolution: "SSL Certificate Renewed", time: "12h ago" },
  { title: "Community Forum", status: "Spam Detected", resolution: "Active Moderation", time: "14h ago" }
];

export const cleanReviewPool = [
  {
    title: "ZenBook Pro 15",
    icon: "laptop_mac",
    iconBgClass: "bg-blue-500/10",
    iconTextClass: "text-blue-400",
    review: "\"Exceptional build quality and no bloatware out of the box. SentinelScan shows zero bundled adware or tracking telemetry.\"",
    initials: "JD",
    author: "Verified Tech Reviewer"
  },
  {
    title: "NetGuard Mesh WiFi",
    icon: "router",
    iconBgClass: "bg-purple-500/10",
    iconTextClass: "text-purple-400",
    review: "\"Thoroughly audited the firmware. It's completely open-source and respects user privacy without sending traffic data to third-party servers.\"",
    initials: "SA",
    author: "Security Analyst"
  },
  {
    title: "Aegis Crypto Wallet",
    icon: "account_balance_wallet",
    iconBgClass: "bg-orange-500/10",
    iconTextClass: "text-orange-400",
    review: "\"100% clean record. Multi-sig architecture is flawless, and the community audits show no vulnerabilities or malicious intents.\"",
    initials: "MK",
    author: "DeFi Enthusiast"
  },
  {
    title: "SecureDrive SSD",
    icon: "hard_drive",
    iconBgClass: "bg-emerald-500/10",
    iconTextClass: "text-emerald-400",
    review: "\"Hardware encryption works exactly as advertised. No hidden backup partitions or shady recovery tools pre-installed.\"",
    initials: "PT",
    author: "Privacy Advocate"
  },
  {
    title: "PrivacyPhone X",
    icon: "smartphone",
    iconBgClass: "bg-rose-500/10",
    iconTextClass: "text-rose-400",
    review: "\"The custom OS is beautifully stripped down. Tested all network traffic and found zero phoning home. A true privacy device.\"",
    initials: "RL",
    author: "Cybersecurity Expert"
  },
  {
    title: "SafeCam Pro",
    icon: "videocam",
    iconBgClass: "bg-cyan-500/10",
    iconTextClass: "text-cyan-400",
    review: "\"Physical shutter and local-only storage options are perfect. The app requires no unnecessary permissions. Highly recommended.\"",
    initials: "DW",
    author: "Smart Home Reviewer"
  }
];

export function getRandomItems<T>(pool: T[], count: number): T[] {
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
