export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src="/assets/sepnexus-mark.png" alt=""/>
          <span className="word">Sepnexus</span>
          <p>Agentic systems, automation and managed cloud for teams who refuse the status quo.</p>
        </div>
        <div className="footer-col">
          <h4>Practice</h4>
          <a href="#services">Agents</a>
          <a href="#services">Automation</a>
          <a href="#services">Data</a>
          <a href="#services">Cloud</a>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <a href="#about">About</a>
          <a href="#process">Process</a>
          <a href="#contact">Contact</a>
          <a href="#careers">Careers</a>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <a href="/auth.html">Sign in</a>
          <a href="/auth.html?mode=request">Request access</a>
          <a href="/dashboard.html">Dashboard</a>
          <a href="/admin.html">Admin</a>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Security</a>
          <a href="#">DPA</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Sepnexus, Inc.</span>
        <span>Crafted for systems that think.</span>
      </div>
    </footer>
  );
}
