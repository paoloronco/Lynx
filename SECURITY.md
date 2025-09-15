## 🔒 Security Policy

Security is a top priority for the **Lynx** project.  

### Reporting a Vulnerability
If you discover a security issue, please report it responsibly:
- **Preferred:** [GitHub Security Advisory](../../security/advisories/new) — creates a private, coordinated channel with maintainers.  
- **Email:** `info@paoloronco.it`.  
- **Do not** open public issues for unpatched vulnerabilities.

Include in your report:
1. Clear description of the issue and its impact.  
2. Steps to reproduce (PoC, payload, HTTP requests, required accounts).  
3. Affected versions/commits and environment details (OS, Node.js, browser).  
4. Known mitigations or workarounds if any.  

### Response Timeline
- **Acknowledgement:** within 72 hours.  
- **Triage:** within 7 days.  
- **Fix & Release:** usually within 90 days of confirmation (faster for critical issues).  

### Scope
In-scope vulnerabilities include:
- Authentication and session flaws  
- Authorization/privilege escalation  
- Injection (SQLi, command injection, template injection)  
- XSS with practical impact  
- Path traversal, RCE, LFI/RFI  
- Exposed secrets or misconfigurations with impact  
- Vulnerable dependencies with exploitable vectors  

### Out of Scope
- **Demo instance**: credentials `admin/demo123` reset every ~15 minutes by design.  
- DoS/DDoS without demonstrated impact.  
- Purely theoretical issues.  
- Browser or third-party platform vulnerabilities.  
- Automated scanner reports without PoC.  

### Supported Versions
| Version | Security status |
|---------|-----------------|
| 3.x (≥ 3.0.0) | ✅ Supported |
| 2.x and earlier | ❌ Not supported |

### Security Practices
- Password hashing with *bcryptjs* (12 salt rounds)  
- JWT authentication with 7-day expiry  
- HttpOnly + SameSite cookies  
- Parameterized queries for SQLite  

We recommend deployers to enforce HTTPS, use proper security headers, rate limiting, least privilege runtime, encrypted backups, and keep Node.js & dependencies updated.

### Disclosure
Please **do not disclose** details publicly until a fix is released.  
Safe Harbor applies for good-faith security research following this policy.  

### Bug Bounty
No paid bug bounty at this time. Researchers may be credited in release notes at the maintainers’ discretion.  

---
