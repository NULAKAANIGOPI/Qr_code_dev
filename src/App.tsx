import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode"; import { Html5Qrcode } from "html5-qrcode";
type Mode = "home" | "scan" | "generate" | "history";
type Kind = "URL" | "Text" | "Wi-Fi" | "Email" | "Phone" | "SMS" | "Contact";
type Item = { value: string, type: "Scanned" | "Generated", kind: Kind, time: string };
const KEY = "quick-qr-premium-history";
const icons: Record<Kind, string> = { URL: "↗", Text: "T", "Wi-Fi": "⌁", Email: "✉", Phone: "☎", SMS: "◫", Contact: "◎" };
export default function App() {
    const [mode, setMode] = useState<Mode>("home"), [kind, setKind] = useState<Kind>("URL"), [text, setText] = useState(""), [qr, setQr] = useState(""), [toast, setToast] = useState(""), [history, setHistory] = useState<Item[]>(() => { try { return JSON.parse(localStorage.getItem(KEY) || "[]") } catch { return [] } });
    const scanner = useRef<Html5Qrcode | null>(null);
    useEffect(() => () => { scanner.current?.stop().catch(() => { }) }, []);
    const notify = (m: string) => {
        setToast(m);
        setTimeout(() => setToast(""), 2200)
    };
    const save = (value: string, type: Item["type"]) => {
        const next = [{ value, type, kind, time: new Date().toLocaleString() }, ...history].slice(0, 50);
        setHistory(next); localStorage.setItem(KEY, JSON.stringify(next))
    };
    const start = async () => {
        if (scanner.current) return; const s = new Html5Qrcode("reader");
        scanner.current = s; try { await s.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, async v => { setText(v); save(v, "Scanned"); notify("QR code detected"); await s.stop(); scanner.current = null }, () => { }) } catch { scanner.current = null; notify("Camera permission is required") }
    };
    const stop = async () => {
        await scanner.current?.stop().catch(() => { });
        scanner.current = null
    };
    const generate = async () => {
        if (!text.trim()) return notify("Enter content first");
        const data = await QRCode.toDataURL(text.trim(), { width: 420, margin: 2, errorCorrectionLevel: "H" });
        setQr(data); save(text.trim(), "Generated"); notify("QR code generated")
    };
    const copy = async (v: string) => {
        await navigator.clipboard.writeText(v);
        notify("Copied to clipboard")
    };
    const download = () => {
        if (!qr) return;
        const a = document.createElement("a");
        a.href = qr; a.download = "quick-qr.png";
        a.click()
    };
    const clear = () => {
        setHistory([]);
        localStorage.removeItem(KEY); notify("History cleared")
    };
    const go = (m: Mode) => { setMode(m); if (m !== "scan") stop() };
    return <div className="site"><header className="nav"><button className="brand" onClick={() => go("home")}><span className="logo">⌘</span><b>Quick QR</b></button><nav>{["home", "scan", "generate", "history"].map(x => <button key={x} className={mode === x ? "navactive" : ""} onClick={() => go(x as Mode)}>{x[0].toUpperCase() + x.slice(1)}</button>)}</nav><button className="theme">☼ ◐</button><button className="get" onClick={() => go("scan")}>Get Started</button></header>{toast && <div className="toast">✓ {toast}</div>}
        {mode === "home" && <><section className="hero"><div className="heroText"><div className="pill">✦ PREMIUM QR TOOLKIT</div><h1>Scan. Generate.<br /><span>Connect.</span></h1><p>Fast, secure QR tools for links, text, Wi‑Fi, contacts and more. Beautifully simple on every device.</p><div className="heroBtns"><button className="primary" onClick={() => go("scan")}>⌁ Start Scanning</button><button className="outline" onClick={() => go("generate")}>▦ Generate QR</button></div><div className="trust"><span>◈ Fast & Secure</span><span>∞ No account needed</span><span>▣ Works everywhere</span></div></div><div className="orb"><div className="floatingQR">▦<small>QR</small></div>
            <div className="phone"><div className="phoneTop">9:41　 Quick QR</div><div className="scanBox">▦</div><strong>QR Code Detected!</strong><small>https://quick-qr.app</small><button>Copy</button></div></div></section><section className="features"><h2>Everything you need for <span>QR Codes</span></h2><p>One polished workspace for scanning, generating and managing your QR codes.</p><div className="featureGrid">{[["⌁", "Scan QR Codes", "Use your camera or upload an image to scan instantly."], ["▦", "Generate QR Codes", "Create codes for URLs, text, Wi‑Fi, contacts and more."], ["✦", "Custom Design", "Choose colors, size, margin and premium styling."], ["⊞", "Save History", "Keep your recent scanned and generated codes locally."]].map(f => <div className="feature"><i>{f[0]}</i><h3>{f[1]}</h3><p>{f[2]}</p></div>)}</div></section><section className="cta"><div><h2>Ready to make QR codes smarter?</h2><p>Start scanning or create your first custom QR code.</p></div><button className="primary" onClick={() => go("generate")}>Create QR Code →</button></section></>}
        {mode === "scan" && <Tool title="Scan QR Code" subtitle="Point your camera at a QR code or scan with your device camera."><div id="reader" className="reader"></div><div className="actions"><button className="primary" onClick={start}>⌁ Start Camera</button><button onClick={stop}>Stop</button></div>{text && <div className="result"><div><span className="success">● QR Code Detected</span><p>{text}</p></div><button onClick={() => copy(text)}>Copy</button></div>}</Tool>}
        {mode === "generate" && <Tool title="Generate QR Code" subtitle="Create a beautiful QR code for your link, text, Wi‑Fi, contact, email or phone."><div className="generator"><div><div className="types">{(Object.keys(icons) as Kind[]).map(k => <button className={kind === k ? "selected" : ""} onClick={() => setKind(k)}>{icons[k]} {k}</button>)}</div><label>Content</label><textarea value={text} onChange={e => setText(e.target.value)} placeholder={kind === "URL" ? "https://example.com" : `Enter ${kind.toLowerCase()} information...`} /><div className="custom"><h3>Customize Design</h3><div className="twocol"><label>Foreground<input type="color" defaultValue="#6d5dfc" /></label><label>Background<input type="color" defaultValue="#ffffff" /></label></div></div><button className="primary wide" onClick={generate}>Generate QR Code ✦</button></div><div className="preview"><span>LIVE PREVIEW</span>{qr ? <img src={qr} alt="Generated QR" /> : <div className="qrplaceholder">▦<small>Your QR preview appears here</small></div>}{qr && <button onClick={download}>↓ Download PNG</button>}</div></div></Tool>}
        {mode === "history" && <Tool title="History" subtitle="Your recent scanned and generated QR codes are saved on this device."><div className="historyTop"><b>All ({history.length})</b><button onClick={clear} disabled={!history.length}>Clear all</button></div>{history.length ? <div className="history">{history.map((x, i) => <div className="historyRow" key={i}><span className="hicon">{icons[x.kind]}</span><div><b>{x.kind}</b><p>{x.value}</p><small>{x.time}</small></div><span className={x.type === "Scanned" ? "green" : "purple"}>{x.type}</span><button onClick={() => copy(x.value)}>Copy</button></div>)}</div> : <div className="empty">No history yet.<br /><button className="primary" onClick={() => go("generate")}>Create your first QR</button></div>}</Tool>}
        <footer><div><b>⌘ Quick QR</b><p>Scan. Generate. Connect.</p></div><div><b>Product</b><span>Scanner</span><span>Generator</span><span>History</span></div><div><b>Features</b><span>Custom QR</span><span>All devices</span><span>Fast & secure</span></div><div><b>Quick QR</b><span>Privacy</span><span>Terms</span><span>Support</span></div></footer></div>
}
function Tool({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <main className="tool"><div className="toolHead"><div><div className="pill">QUICK QR</div><h1>{title}</h1><p>{subtitle}</p></div><div className="toolStat">● Ready</div></div><div className="toolCard">{children}</div></main> }


