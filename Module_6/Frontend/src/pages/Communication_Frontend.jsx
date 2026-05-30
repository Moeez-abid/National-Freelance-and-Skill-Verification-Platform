import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import {
  fetchContacts, fetchRooms, fetchMessages, fetchSharedFiles,
  fetchChatStats, fetchMeetings, fetchNotifications,
  markRoomRead, markAllNotifsRead, markOneNotifRead,
  createMeeting, uploadFile, createRoom,
} from "../api.js";

const genId = () => crypto.randomUUID();

// ─── THEME ───────────────────────────────────────────────────
const LIGHT = {
  bg: "#f9f9ff", surface: "#fff", surfaceContainer: "#f0f3ff",
  border: "#e7eeff", borderStrong: "#c4c6d0",
  text: "#001736", textSub: "#64748b", textMuted: "#94a3b8",
  primary: "#001736", primaryText: "#fff",
  accent: "#405f91", accentBg: "#d6e3ff",
  teal: "#2ca397", tealBg: "#e7fffe",
  inputBg: "#f0f3ff", sidebarBg: "linear-gradient(180deg,#f0f3ff 0%,#f9f9ff 100%)",
  navBg: "#001736", navText: "#fff",
  bubble: "#001736", bubbleText: "#fff",
  otherBubble: "#fff", otherBubbleText: "#111c2d",
};
const DARK = {
  bg: "#0d1b2a", surface: "#001736", surfaceContainer: "#002b5b",
  border: "#264778", borderStrong: "#405f91",
  text: "#ecf1ff", textSub: "#a9c7ff", textMuted: "#515f74",
  primary: "#a9c7ff", primaryText: "#001736",
  accent: "#a9c7ff", accentBg: "#264778",
  teal: "#6bd8cb", tealBg: "#00322d",
  inputBg: "#002b5b", sidebarBg: "linear-gradient(180deg,#001736 0%,#0d1b2a 100%)",
  navBg: "#0d1b2a", navText: "#ecf1ff",
  bubble: "#264778", bubbleText: "#ecf1ff",
  otherBubble: "#002b5b", otherBubbleText: "#ecf1ff",
};
const MEMBER_COLORS = ["#405f91","#2ca397","#264778","#515f74","#005049","#264778","#405f91","#2ca397"];
const NAV_ITEMS = (unreadAlerts = 0) => [
  { id: "messages", label: "Messages", icon: "chat" },
  { id: "meetings", label: "Meetings", icon: "event" },
  { id: "alerts", label: "Alerts", icon: "notifications", badge: unreadAlerts },
];

// ─── GOOGLE FONTS STYLE ──────────────────────────────────────
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');
  .msi { font-family:'Material Symbols Outlined'; font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; font-size:20px; display:inline-block; vertical-align:middle; line-height:1; user-select:none; }
  .msi.fill { font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24; }
  * { box-sizing:border-box; } body { margin:0; }
  ::-webkit-scrollbar{width:4px;height:4px;} ::-webkit-scrollbar-thumb{background:#c4c6d0;border-radius:9999px;}
  input,select,textarea{font-family:'Inter',sans-serif;}
`;

// ─── HELPERS ─────────────────────────────────────────────────
const fmtTime = (d) => new Date(d).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
const fmtDate = (d) => {
  if (!d) return "";
  const n = new Date(), t = new Date(d);
  if (t.toDateString()===n.toDateString()) return fmtTime(d);
  const y = new Date(n); y.setDate(y.getDate()-1);
  if (t.toDateString()===y.toDateString()) return "Yesterday";
  return t.toLocaleDateString([],{month:"short",day:"numeric"});
};

// ─── AVATAR ──────────────────────────────────────────────────
function Avatar({ name="?", size=38, idx=0, isGroup=false }) {
  return (
    <div style={{width:size,height:size,borderRadius:size/4,background:isGroup?MEMBER_COLORS[idx%MEMBER_COLORS.length]:`linear-gradient(135deg,${MEMBER_COLORS[idx%MEMBER_COLORS.length]},#6bd8cb)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Manrope',sans-serif",fontWeight:800,color:"#fff",fontSize:size*0.37,flexShrink:0}}>
      {isGroup ? <span className="msi fill" style={{fontSize:size*0.55,color:"#fff"}}>group</span> : (name||"?")[0]}
    </div>
  );
}


// ─── LAYOUT ──────────────────────────────────────────────────
function Layout({ children, navigate, page, T, darkMode, setDarkMode, unreadAlerts, setUnreadAlerts }) {
  // NAV
  const items = NAV_ITEMS(unreadAlerts);
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"'Inter',sans-serif",background:T.bg}}>
      <style>{FONTS}</style>

      {/* TOP HEADER — blue theme, search only */}
      <header style={{ height: 56, background: T.navBg, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, position: "sticky", top: 0, zIndex: 50, flexShrink: 0, borderBottom: `1px solid rgba(169,199,255,0.12)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 15, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.09em", lineHeight: 1 }}>Header</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#6bd8cb", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 1 }}>Communication Hub</div>
        </div>
        <div style={{ flex: 1, maxWidth: 400, margin: "0 auto", position: "relative" }}>
          <input placeholder="Header Search bar…" style={{ width: "100%", background: "rgba(169,199,255,0.1)", color: "#fff", fontSize: 12, padding: "7px 14px 7px 36px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", outline: "none" }} />
          <span className="msi" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: 16 }}>search</span>
        </div>
      </header>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* SIDEBAR — Messages, Meetings, Alerts only */}
        <aside style={{width:220,background:T.sidebarBg,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",padding:14,position:"sticky",top:56,height:"calc(100vh - 56px)",flexShrink:0,overflowY:"auto"}}>
          <p style={{fontSize:9,fontWeight:800,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.2em",marginBottom:10,paddingLeft:10}}>Navigation</p>
          <div style={{display:"flex",flexDirection:"column",gap:2,flex:1}}>
            {items.map(item => {
              const active = page === item.id;
              return (
                <button key={item.id} onClick={()=>{
                  // ================= ALERTS =================
                  if(item.id==="alerts"){
                    navigate("alerts");
                    setUnreadAlerts(0);
                  return;
                  }
                  // ================= NORMAL NAV =================
                  navigate(item.id);
                }} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:8,background:active?T.surface:"transparent",color:active?T.text:T.textSub,boxShadow:active?"0 1px 4px rgba(0,23,54,0.08)":"none",border:"none",cursor:"pointer",textAlign:"left",width:"100%",transition:"all 0.15s"}}>
                  
                  {/* ICON */}
                  <span className={`msi${active?" fill":""}`} style={{fontSize:18,color:active?"#6bd8cb":"inherit"}}>
                    {item.icon}
                  </span>
                  {/* LABEL */}
                  <span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",flex:1}}>
                    {item.label}
                  </span>
                  {/* BADGE */}
                  {item.id==="alerts"&&unreadAlerts>0&&<span style={{background:"#ba1a1a",color:"#fff",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:9999,minWidth:16,textAlign:"center"}}>
                    {unreadAlerts}
                  </span>}
                </button>
              );
            })}
      </div>

      {/* Settings at bottom with dark mode toggle */}
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 10, marginTop: 10 }}>
            <button onClick={() => setDarkMode(d => !d)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", background: "none", border: "none", color: T.textSub, cursor: "pointer", borderRadius: 8, width: "100%", transition: "all 0.15s" }}>
              <span className="msi" style={{ fontSize: 18 }}>{darkMode ? "light_mode" : "dark_mode"}</span>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", background: "none", border: "none", color: T.textSub, cursor: "pointer", borderRadius: 8, width: "100%" }}>
              <span className="msi" style={{ fontSize: 18 }}>contact_support</span>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Support</span>
            </button>
          </div>
        </aside>

        <main style={{ flex: 1, overflowY: "auto", background: T.bg }}>{children}</main>
      </div>
    </div>
  );
}

// ─── BACK BUTTON ─────────────────────────────────────────────
function BackBtn({ onClick, T }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: T.textSub, padding: "6px 0", marginBottom: 12, fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600 }}>
      <span className="msi" style={{ fontSize: 18 }}>arrow_back</span>Back
    </button>
  );
}


// ─── FILE UPLOAD POPUP ────────────────────────────────────────
function FileUploadPopup({ onClose, T, sendMessage }) {
  const types = [
    { label:"Image",    sub:"PNG, JPEG, GIF, WEBP", icon:"image", accept:".png,.jpg,.jpeg,.gif,.webp" },
    { label:"Video",    sub:"MP4, MOV, AVI",         icon:"video_file", accept:".mp4,.mov,.avi" },
    { label:"Document", sub:"PDF, DOCX, XLSX, TXT",  icon:"description", accept:".pdf,.docx,.xlsx,.txt" },
  ];
  const handleFile = async (e) => {
    const file = e.target.files[0];
    console.log("File selected:", file);
    if (!file) return;
    try {
      const data = await uploadFile(file);
      if (sendMessage) sendMessage({ content: data.fileUrl, type: data.type, fileName: data.fileName,});
      onClose();
    } catch (err) { console.error("Upload failed", err); }
  };
  return (
    <div style={{position:"absolute",bottom:70,left:16,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:16,boxShadow:"0 8px 24px rgba(0,23,54,0.12)",zIndex:20,width:260}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{fontFamily:"'Manrope',sans-serif",fontWeight:800,fontSize:13,color:T.text}}>Share File</span>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted}}><span className="msi" style={{fontSize:16}}>close</span></button>
      </div>
      {types.map(t => (
        <label key={t.label} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,background:T.inputBg,marginBottom:8,cursor:"pointer"}}>
          <span className="msi" style={{color:"#405f91",fontSize:20}}>{t.icon}</span>
          <div>
            <div style={{fontWeight:700,fontSize:12,color:T.text}}>{t.label}</div>
            <div style={{fontSize:10,color:T.textMuted}}>{t.sub}</div>
          </div>
          <input type="file" accept={t.accept} style={{display:"none"}} onChange={handleFile} />
        </label>
      ))}
    </div>
  );
}


// ─── MESSAGES PAGE ────────────────────────────────────────────
  //const [userId, setUserId] = useState(null);
  function MessagesPage({ userId, navigate, T, unreadAlerts, setUnreadAlerts }) {
    const socketRef   = useRef(null);
    const bottomRef   = useRef(null);
    const [view, setView]                   = useState("summary");
    const [selContact, setSelContact]       = useState(null); // a room object (direct)
    const [selGroup, setSelGroup]           = useState(null); // a room object (group)
    const [msgs, setMsgs]                   = useState({});   // keyed by room_id
    const [groupMsgs, setGroupMsgs]         = useState({});   // keyed by room_id
    const [rooms, setRooms]                 = useState([]);   // all rooms from DB
    const [contacts, setContacts]           = useState([]);   // all users from DB
    const [stats, setStats]                 = useState(null);
    const [input, setInput]                 = useState("");
    const [showFilePopup, setShowFilePopup] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [searchTerm, setSearchTerm]       = useState("");
    const [newMsgSearch, setNewMsgSearch]   = useState("");
    const [groupStep1Selected, setGroupStep1Selected] = useState([]);
    const [newGroupName, setNewGroupName]   = useState("");
    const [showAddMember, setShowAddMember] = useState(false);
    const [sharedFiles, setSharedFiles]     = useState([]);
    const [loadingMsgs, setLoadingMsgs]     = useState(false);
    const [upcomingMeetings, setUpcomingMeetings] = useState([]);
    const [groupImage, setGroupImage] = useState(null);

    //const isMyAdmin = selGroup && selGroup.adminId === 3;

    // ── Derived values ──
      const directRooms = rooms.filter(r => r.room_type === "direct");
      const groupRooms  = rooms.filter(r => r.room_type === "group");
      const allConversations = rooms; // already sorted by last message time
    
      // ── Load rooms + stats on mount ──
      useEffect(() => {
        if (!userId) return;
        fetchRooms(userId).then(setRooms).catch(console.error);
        fetchChatStats(userId).then(setStats).catch(console.error);
        fetchContacts(userId).then(setContacts).catch(console.error);
        fetchMeetings(userId).then(data => 
          setUpcomingMeetings(
            data.filter(m => m.status === "upcoming" || m.status === "scheduled").slice(0, 2)
          )
        ).catch(console.error);
      }, [userId]);
    
      // ── WebSocket setup ──
      useEffect(() => {
        if (!userId) return;
        const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3006");
        socketRef.current = socket;
        socket.on("connect", () => {
          socket.emit("join", String(userId));
        });
        return () => socket.disconnect();
      }, [userId]);

      // ── Socket listeners ──
        const handlePrivate = useCallback((message) => {
          const formattedMsg = {
            id: message.messageId || genId(),
            messageId: message.messageId,
            sender_id: Number(message.senderId),
            sender_name: message.senderName || `User ${message.senderId}`,
            content: message.content,
            message_type: message.type || "text",
            sent_at: new Date(),
            mine: false,
            status: message.status,
          };
          
          setMsgs(prev => ({ ...prev, [message.roomId || message.senderId]: [...(prev[message.roomId || message.senderId] || []), formattedMsg] }));
          /** setAlerts(prev => [{
  id: message.messageId || Date.now(),
  type:  isFileType(message.type) ? "file" : "message",
  icon:  isFileType(message.type) ? "upload_file" : "chat",
  color: isFileType(message.type) ? "#515f74" : "#405f91",
  bg:    isFileType(message.type) ? "#dee8ff"  : "#d6e3ff",
  title: isFileType(message.type) ? `File from User ${message.senderId}` : `New message from User ${message.senderId}`,
  body:  getNotifBody(message.content, message.type),
  time:  "Just now",
  read:  false,
}, ...prev]); */
          setUnreadAlerts(p => p+1);
          
          // Refresh rooms to update last message + unread count
          fetchRooms(userId).then(setRooms).catch(console.error);
          fetchChatStats(userId).then(setStats).catch(console.error);
        }, [userId, setUnreadAlerts]);
      
        const handleGroup = useCallback((message) => {
          const groupMsg = {
            id: message.messageId || genId(),
            messageId: message.messageId,
            sender_id: Number(message.senderId),
            sender_name: message.senderName || `User ${message.senderId}`,
            content: message.content,
            message_type: message.type || "text",
            sent_at: new Date(message.timestamp || Date.now()),
            mine: String(message.senderId)===String(userId),
            status: message.status || "delivered",
          };
          setGroupMsgs(prev => ({ ...prev, [message.roomId]: [...(prev[message.roomId] || []), groupMsg] }));
          if (String(message.senderId) !== String(userId)) {
            /** setAlerts(prev => [{
  id: message.messageId || Date.now(),
  type:  isFileType(message.type) ? "file" : "group",
  icon:  isFileType(message.type) ? "upload_file" : "group",
  color: isFileType(message.type) ? "#515f74" : "#264778",
  bg:    isFileType(message.type) ? "#dee8ff"  : "#e7eeff",
  title: isFileType(message.type) ? `File shared in group` : `Group message`,
  body:  getNotifBody(message.content, message.type),
  time:  "Just now",
  read:  false,
}, ...prev]); */
            setUnreadAlerts(p => p+1);
          }
          fetchRooms(userId).then(setRooms).catch(console.error);
          fetchChatStats(userId).then(setStats).catch(console.error);
        }, [userId, setUnreadAlerts]);
      
        const handleStatus = useCallback((updated) => {
          const updater = (prev) => {
            const copy = {...prev};
            Object.keys(copy).forEach(k => {
              copy[k] = copy[k].map(m => m.messageId===updated.messageId ? {...m,status:updated.status} : m);
            });
            return copy;
          };
          setMsgs(updater);
          setGroupMsgs(updater);
        }, []);
      
        useEffect(() => {
          const socket = socketRef.current;
          if (!socket||!userId) return;
          socket.off("receiveMessage");  socket.off("receiveGroupMessage"); socket.off("statusUpdate");
          socket.on("receiveMessage", handlePrivate);
          socket.on("receiveGroupMessage", handleGroup);
          socket.on("statusUpdate", handleStatus);
          return () => {
            socket.off("receiveMessage", handlePrivate);
            socket.off("receiveGroupMessage", handleGroup);
            socket.off("statusUpdate", handleStatus);
          };
        }, [userId, handlePrivate, handleGroup, handleStatus]);
      
        // ── Auto-scroll to bottom ──
        useEffect(() => {
          bottomRef.current?.scrollIntoView({ behavior:"smooth" });
        }, [msgs, groupMsgs, selContact, selGroup]);
      
        // ── Open a direct chat room ──
        const openDirectRoom = async (room) => {
          setSelContact(room);
          setSelGroup(null);
          setView("chat");
          // Join WS room
          socketRef.current?.emit("join", String(userId));
          // Load messages if not already loaded
          if (!msgs[room.room_id]) {
            setLoadingMsgs(true);
            try {
              const data = await fetchMessages(room.room_id);
              const formatted = data.map(m => ({
                ...m,
                mine: Number(m.sender_id) === Number(userId),
              }));
              setMsgs(prev => ({ ...prev, [room.room_id]: formatted }));
            } catch(e) { console.error(e); }
            setLoadingMsgs(false);
          }
          // Mark as read
          await markRoomRead(room.room_id, userId).catch(console.error);
          setRooms(prev => prev.map(r => r.room_id===room.room_id ? {...r, unread_count:0} : r));
          
          // Small delay ensures DB write is committed before reading stats
          setTimeout(() => {
            fetchChatStats(userId).then(setStats).catch(console.error);
          }, 300);
          // Also mark notifications for this room as read in DB
          markRoomNotifsRead(room.room_id, userId).catch(console.error);
        };
      
        // ── Open a group chat room ──
        const openGroupRoom = async (room) => {
          setSelGroup(room);
          setSelContact(null);
          setView("chat");
          socketRef.current?.emit("joinGroup", { roomId: room.room_id, userId });
          if (!groupMsgs[room.room_id]) {
            setLoadingMsgs(true);
            try {
              const data = await fetchMessages(room.room_id);
              const formatted = data.map(m => ({
                ...m,
                mine: Number(m.sender_id) === Number(userId),
              }));
              setGroupMsgs(prev => ({ ...prev, [room.room_id]: formatted }));
            } catch(e) { console.error(e); }
            setLoadingMsgs(false);
          }
          await markRoomRead(room.room_id, userId).catch(console.error);
          setRooms(prev => prev.map(r => r.room_id===room.room_id ? {...r, unread_count:0} : r));
          
          // Small delay ensures DB write is committed before reading stats
          setTimeout(() => {
            fetchChatStats(userId).then(setStats).catch(console.error);
          }, 300);
          // Also mark notifications for this room as read in DB
          markRoomNotifsRead(room.room_id, userId).catch(console.error);
        };
      
        // ── Open shared files for current room ──
        const openMedia = async () => {
          const roomId = selContact?.room_id || selGroup?.room_id;
          if (!roomId) return;
          try { const files = await fetchSharedFiles(roomId); setSharedFiles(files); } catch(e) { console.error(e); }
          setView("media");
        };
      
        // ── Send message ──
        const sendMsg = (fileData=null) => {
          const finalContent = fileData ? fileData.content : input.trim();
          const finalType    = fileData ? fileData.type    : "text";
          const finalFileName = fileData ? fileData.fileName : null;
          if (!finalContent || !userId) return;

          const messageId = Date.now();
          const localMsg = {
            id: messageId, messageId,
            sender_id: Number(userId),
            sender_name: "Me",
            content: finalContent,
            file_name: finalFileName,
            message_type: finalType,
            sent_at: new Date(),
            mine: true,
            status: "sending",
          };

          if (selContact) {
            setMsgs(prev => ({ ...prev, [selContact.room_id]: [...(prev[selContact.room_id]||[]), localMsg] }));
            const payload = { messageId, senderId: userId, receiverId: String(selContact.other_user_id), content: finalContent, type: finalType, fileName: finalFileName, };
            let delivered=false, retries=0;
            socketRef.current?.emit("sendMessage", payload);
            const timer = setInterval(()=>{ if(!delivered&&retries<2){retries++;socketRef.current?.emit("sendMessage",payload);} else clearInterval(timer); }, 3000);
            const onStatus = (msg) => { if(msg.messageId===messageId){delivered=true;clearInterval(timer);socketRef.current?.off("statusUpdate",onStatus);} };
            socketRef.current?.on("statusUpdate", onStatus);
          } else if (selGroup) {
            setGroupMsgs(prev => ({ ...prev, [selGroup.room_id]: [...(prev[selGroup.room_id]||[]), localMsg] }));
            const payload = { messageId, roomId: selGroup.room_id, senderId: userId, content: finalContent, type: finalType, fileName: finalFileName, };
            let delivered=false, retries=0;
            socketRef.current?.emit("sendGroupMessage", payload);
            const timer = setInterval(()=>{ if(!delivered&&retries<2){retries++;socketRef.current?.emit("sendGroupMessage",payload);} else clearInterval(timer); }, 3000);
            const onStatus = (msg) => { if(msg.messageId===messageId){delivered=true;clearInterval(timer);socketRef.current?.off("statusUpdate",onStatus);} };
            socketRef.current?.on("statusUpdate", onStatus);
          }
          setInput("");
        };
      
        // ── Current messages ──
        const currentMsgs = selGroup ? (groupMsgs[selGroup.room_id]||[]) : selContact ? (msgs[selContact.room_id]||[]) : [];
        const filteredConversations = allConversations.filter(c => (c.room_name||"").toLowerCase().includes(searchTerm.toLowerCase()));
      
        // ── Delete chat ──
        const deleteChat = () => {
          if (selContact) setMsgs(p => ({ ...p, [selContact.room_id]: [] }));
          setShowDeleteConfirm(false);
        };
      
        // ── Create group (posts to DB via future endpoint, local for now) ──
        const createGroup = async () => {
          if (!newGroupName.trim() || groupStep1Selected.length < 1) return;
          try {
            const newRoom = await createRoom(
              newGroupName.trim(),
              groupStep1Selected,
              Number(userId),
            );
            // Add to rooms list immediately
            setRooms(prev => [{ ...newRoom, room_type: 'group' }, ...prev]);
            // Open the new group chat
            setSelGroup({ ...newRoom, room_type: 'group' });
            setSelContact(null);
            setGroupMsgs(prev => ({ ...prev, [newRoom.room_id]: [] }));
            setNewGroupName("");
            setGroupStep1Selected([]);
            setGroupImage(null);
            setView("chat");
          } catch(err) {
            console.error("Failed to create group:", err);
          }
        };

  // ════════════════════ SUMMARY VIEW ════════════════════
  if (view==="summary") {
    return (
      <div style={{padding:"32px 40px",maxWidth:1100}}>
        <div style={{marginBottom:28}}>
          <h2 style={{fontFamily:"'Manrope',sans-serif",fontSize:26,fontWeight:800,color:T.text,margin:"4px 0",letterSpacing:"-0.02em"}}>Messages</h2>
          <p style={{fontSize:12,color:T.textSub,margin:0}}>{new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
        </div>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}}>
          {[
            { label:"Active Chats",    val:stats?.active_chats||"0",   icon:"chat_bubble",          c:"#405f91", bg:"#d6e3ff" },
            { label:"Unread Messages", val:stats?.unread_messages||"0", icon:"mark_unread_chat_alt", c:"#ba1a1a", bg:"#ffdad6" },
            { label:"Files Shared",    val:stats?.files_shared||"0",    icon:"folder_shared",        c:"#005049", bg:"#89f5e7" },
            { label:"Meetings",        val:stats?.meetings||"0",        icon:"video_call",           c:"#264778", bg:"#a9c7ff" },
          ].map(s => (
            <div key={s.label} style={{background:T.surface,borderRadius:12,padding:18,border:`1px solid ${T.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div style={{width:38,height:38,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span className="msi" style={{color:s.c,fontSize:20}}>{s.icon}</span>
                </div>
                <span style={{fontSize:9,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em"}}>Live</span>
              </div>
              <div style={{fontFamily:"'Manrope',sans-serif",fontSize:30,fontWeight:800,color:T.text,lineHeight:1}}>{s.val}</div>
              <div style={{fontSize:11,fontWeight:600,color:T.textSub,marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Quick actions */}
        <div style={{display:"flex",gap:10,marginBottom:28}}>
          {[
            { l:"New Message",   i:"edit",      fn:()=>setView("new_message") },
            { l:"Create Group",  i:"group_add", fn:()=>setView("create_group_step1") },
            { l:"Schedule Meet", i:"video_call",fn:()=>navigate("meetings") },
          ].map(a => (
            <button key={a.l} onClick={a.fn} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 18px",background:T.primary,color:T.primaryText,border:"none",borderRadius:8,cursor:"pointer",fontFamily:"'Manrope',sans-serif",fontWeight:700,fontSize:10,textTransform:"uppercase",letterSpacing:"0.09em"}}>
              <span className="msi" style={{fontSize:15}}>{a.i}</span>{a.l}
            </button>
          ))}
        </div>
        {/* Recent conversations */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:20}}>
          <div style={{background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,overflow:"hidden"}}>
            <div style={{padding:"16px 20px 12px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"'Manrope',sans-serif",fontWeight:800,fontSize:14,color:T.text}}>Recent Conversations</div>
                <div style={{fontSize:11,color:T.textMuted}}>{allConversations.length} active threads</div>
              </div>
              <button onClick={()=>setView("chat")} style={{fontSize:10,fontWeight:700,color:"#405f91",background:"#d6e3ff",border:"none",padding:"5px 12px",borderRadius:6,cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.08em"}}>View All</button>
            </div>
            {allConversations.slice(0,7).map((c,i) => (
              <div key={c.room_id} onClick={()=>c.room_type==="group"?openGroupRoom(c):openDirectRoom(c)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"12px 20px",borderBottom:`1px solid ${T.border}20`,cursor:"pointer",transition:"background 0.15s"}}
                onMouseOver={e=>e.currentTarget.style.background=T.inputBg}
                onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                <div style={{position:"relative",flexShrink:0}}>
                  <Avatar name={c.room_name||"?"} size={42} idx={i} isGroup={c.room_type==="group"} />
                  {c.room_type === "direct" && c.other_user_id && (
                  <span style={{position:"absolute",bottom:2,right:2,width:9,height:9,background:"#6bd8cb",borderRadius:"50%",border:"2px solid "+T.surface}}></span>
                  )}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:1}}>
                    <span style={{fontFamily:"'Manrope',sans-serif",fontWeight:700,fontSize:12,color:T.text}}>{c.room_name||"Unknown"}</span>
                    <span style={{fontSize:10,color:T.textMuted}}>{fmtDate(c.last_message_at)}</span>
                  </div>
                  <span style={{fontSize:10,color:T.textSub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block"}}>
                    {c.last_message_type === "file" || c.last_message_type === "pdf" || c.last_message_type === "image" || c.last_message_type === "video"
                    ? c.last_message_type === "image" ? "📷 Image"
                    : c.last_message_type === "video" ? "🎥 Video"
                    : "📎 File"
                    : c.last_message || "No messages yet"}
                  </span>
                  <span style={{fontSize:9,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{c.room_type==="group"?`Group · ${c.member_count} members`:c.other_user_role||""}</span>
                </div>
                {c.unread_count>0&&<span style={{background:"#405f91",color:"#fff",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:9999}}>{c.unread_count}</span>}
              </div>
            ))}
          </div>

          {/* Right: activity widget */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:"#001736",borderRadius:14,padding:20,color:"#fff"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#6bd8cb",textTransform:"uppercase",letterSpacing:"0.14em"}}>Message Activity</div>
              <div style={{fontFamily:"'Manrope',sans-serif",fontSize:26,fontWeight:800,margin:"4px 0 14px"}}>{stats?.active_chats||0} <span style={{fontSize:12,fontWeight:400,color:"#94a3b8"}}>active rooms</span></div>
              <div style={{display:"flex",alignItems:"flex-end",gap:5,height:54}}>
                {[45,70,55,85,90,60,75].map((h,i)=><div key={i} style={{flex:1,height:`${h}%`,background:i===4?"#6bd8cb":"rgba(169,199,255,0.22)",borderRadius:"3px 3px 0 0"}}></div>)}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                {["M","T","W","T","F","S","S"].map((d,i)=><span key={i} style={{fontSize:9,color:"#64748b",fontWeight:700}}>{d}</span>)}
              </div>
            </div>

          {/* Upcoming Meetings */}
          <div style={{background:T.surface,borderRadius:14,padding:18,border:`1px solid ${T.border}`}}>
  <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
    <div style={{fontFamily:"'Manrope',sans-serif",fontWeight:800,fontSize:13,color:T.text}}>
      Upcoming Meetings
    </div>
    <button onClick={()=>navigate("meetings")} style={{fontSize:10,fontWeight:700,color:"#405f91",background:"none",border:"none",cursor:"pointer",textTransform:"uppercase"}}>All →</button>
  </div>
  {upcomingMeetings.length===0 ? (
    <div style={{fontSize:11,color:T.textMuted,textAlign:"center",padding:"16px 0"}}>No upcoming meetings</div>
  ) : (
    upcomingMeetings.map((m,i) => (
      <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",background:i===0?"#d6e3ff":"#e7fffe",borderRadius:8,marginBottom:7}}>
        <span className="msi" style={{color:"#405f91",fontSize:20}}>video_call</span>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Manrope',sans-serif",fontWeight:700,fontSize:12,color:"#001736"}}>{m.title}</div>
          <div style={{fontSize:10,color:"#64748b"}}>{m.date} {m.time} · {m.platform}</div>
        </div>
        <button onClick={()=>navigate("meetings")} style={{fontSize:9,fontWeight:700,color:"#405f91",background:"none",border:"1px solid #405f91",padding:"3px 8px",borderRadius:4,cursor:"pointer",textTransform:"uppercase"}}>Join</button>
      </div>
    ))
  )}
</div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════ NEW MESSAGE ════════════════════
  if (view==="new_message") {
    const filtered = contacts.filter(c=>(c.display_name||"").toLowerCase().includes(newMsgSearch.toLowerCase()));
    return (
      <div style={{padding:"32px 40px",maxWidth:600}}>
        <BackBtn onClick={()=>setView("summary")} T={T} />
        <div style={{fontFamily:"'Manrope',sans-serif",fontWeight:800,fontSize:20,color:T.text,marginBottom:20}}>New Message</div>
        <div style={{position:"relative",marginBottom:20}}>
          <input value={newMsgSearch} onChange={e=>setNewMsgSearch(e.target.value)} placeholder="Search contacts…" style={{width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 14px 10px 36px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box"}} />
          <span className="msi" style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.textMuted,fontSize:16}}>search</span>
        </div>
        <div style={{background:T.surface,borderRadius:12,border:`1px solid ${T.border}`,overflow:"hidden"}}>
          {filtered.length===0&&<div style={{padding:24,textAlign:"center",color:T.textMuted,fontSize:13}}>No contacts found</div>}
          {filtered.map((c,i) => (
            <div key={c.id} onClick={async()=>{
              // Find or open existing direct room with this user
              const existing = rooms.find(r=>r.room_type==="direct"&&r.other_user_id===c.id);
              if (existing) { openDirectRoom(existing); }
              else {
                // Room will be auto-created by the gateway when first message is sent
                const fakeRoom = { room_id: null, room_type:"direct", room_name: c.display_name, other_user_id: c.id, other_user_role: c.role, online: c.availability_status==="available", unread_count:0, members:[] };
                setSelContact(fakeRoom); setSelGroup(null); setView("chat");
              }
            }} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<filtered.length-1?`1px solid ${T.border}`:"none",cursor:"pointer",transition:"background 0.12s"}}
              onMouseOver={e=>e.currentTarget.style.background=T.inputBg}
              onMouseOut={e=>e.currentTarget.style.background="transparent"}>
              <div style={{position:"relative"}}>
                <Avatar name={c.display_name||"?"} size={42} idx={i} />
                {c.id && <span style={{position:"absolute",bottom:2,right:2,width:9,height:9,background:"#6bd8cb",borderRadius:"50%",border:"2px solid "+T.surface}}></span>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Manrope',sans-serif",fontWeight:700,fontSize:13,color:T.text}}>{c.display_name}</div>
                <div style={{fontSize:11,color:T.textSub}}>{c.role}</div>
              </div>
              <span className="msi" style={{color:T.textMuted,fontSize:18}}>chevron_right</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ════════════════════ CREATE GROUP STEP 1 ════════════════════
  if (view==="create_group_step1") {
    return (
      <div style={{padding:"32px 40px",maxWidth:560}}>
        <BackBtn onClick={()=>setView("summary")} T={T} />
        <div style={{fontFamily:"'Manrope',sans-serif",fontWeight:800,fontSize:20,color:T.text,marginBottom:6}}>Create Group</div>
        <div style={{fontSize:12,color:T.textSub,marginBottom:20}}>Select members to add</div>
        <div style={{background:T.surface,borderRadius:12,border:`1px solid ${T.border}`,overflow:"hidden",marginBottom:20}}>
          {contacts.map((c,i) => (
            <div key={c.id} onClick={()=>setGroupStep1Selected(prev=>prev.includes(c.id)?prev.filter(x=>x!==c.id):[...prev,c.id])}
              style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<contacts.length-1?`1px solid ${T.border}`:"none",cursor:"pointer",background:groupStep1Selected.includes(c.id)?T.inputBg:"transparent",transition:"background 0.12s"}}>
              <Avatar name={c.display_name||"?"} size={40} idx={i} />
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Manrope',sans-serif",fontWeight:700,fontSize:13,color:T.text}}>{c.display_name}</div>
                <div style={{fontSize:11,color:T.textSub}}>{c.role}</div>
              </div>
              <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${groupStep1Selected.includes(c.id)?"#405f91":T.borderStrong}`,background:groupStep1Selected.includes(c.id)?"#405f91":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                {groupStep1Selected.includes(c.id)&&<span className="msi" style={{fontSize:14,color:"#fff"}}>check</span>}
              </div>
            </div>
          ))}
        </div>
        <button onClick={()=>groupStep1Selected.length>0&&setView("create_group_step2")} style={{padding:"11px 28px",background:groupStep1Selected.length>0?"#001736":T.borderStrong,color:"#fff",border:"none",borderRadius:8,cursor:groupStep1Selected.length>0?"pointer":"not-allowed",fontFamily:"'Manrope',sans-serif",fontWeight:700,fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em"}}>
          Next ({groupStep1Selected.length} selected)
        </button>
      </div>
    );
  }

  // ════════════════════ CREATE GROUP STEP 2 ════════════════════
  if (view === "create_group_step2") {
  return (
    <div style={{padding:"32px 40px",maxWidth:480}}>
      <BackBtn onClick={()=>setView("create_group_step1")} T={T} />
      <div style={{fontFamily:"'Manrope',sans-serif",fontWeight:800,fontSize:20,color:T.text,marginBottom:20}}>Name Your Group</div>

      {/* Group image picker */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24}}>
        <label style={{width:80,height:80,borderRadius:20,background:groupImage?`url(${groupImage}) center/cover`:T.inputBg,border:`2px dashed ${T.borderStrong}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",marginBottom:8,overflow:"hidden"}}>
          {!groupImage && (
            <>
              <span className="msi" style={{fontSize:32,color:T.textMuted}}>add_a_photo</span>
              <span style={{fontSize:9,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginTop:4}}>Add Photo</span>
            </>
          )}
          <input type="file" accept=".png,.jpg,.jpeg" style={{display:"none"}} onChange={async(e)=>{
            const file = e.target.files[0];
            if (!file) return;
            try {
              const data = await uploadFile(file);
              setGroupImage(data.fileUrl);
            } catch(err) { console.error("Image upload failed", err); }
          }} />
        </label>
        {groupImage && (
          <button onClick={()=>setGroupImage(null)} style={{fontSize:10,color:"#ba1a1a",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Remove photo</button>
        )}
        <div style={{fontSize:10,color:T.textMuted}}>Optional group photo</div>
      </div>

      {/* Group name input */}
      <div style={{marginBottom:16}}>
        <label style={{display:"block",fontSize:10,fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Group Name *</label>
        <input
          value={newGroupName}
          onChange={e=>setNewGroupName(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&newGroupName.trim()&&createGroup()}
          placeholder="e.g. Design Team"
          style={{width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 14px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box"}}
        />
      </div>

      {/* Selected members preview */}
      <div style={{marginBottom:24}}>
        <div style={{fontSize:10,fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{groupStep1Selected.length} Members Selected</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {groupStep1Selected.map(id => {
            const c = contacts.find(x => x.id === id);
            return c ? (
              <div key={id} style={{display:"flex",alignItems:"center",gap:6,background:T.inputBg,borderRadius:9999,padding:"4px 10px 4px 6px"}}>
                <Avatar name={c.display_name||"?"} size={22} idx={id} />
                <span style={{fontSize:11,color:T.text,fontWeight:600}}>{(c.display_name||"").split(" ")[0]}</span>
              </div>
            ) : null;
          })}
        </div>
      </div>

      {/* Buttons */}
      <div style={{display:"flex",gap:10}}>
        <button
          onClick={createGroup}
          style={{padding:"11px 28px",background:newGroupName.trim()?"#001736":T.borderStrong,color:"#fff",border:"none",borderRadius:8,cursor:newGroupName.trim()?"pointer":"not-allowed",fontFamily:"'Manrope',sans-serif",fontWeight:700,fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em"}}
        >
          Create Group
        </button>
        <button
          onClick={()=>setView("summary")}
          style={{padding:"11px 22px",background:T.inputBg,color:T.textSub,border:"none",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:700,textTransform:"uppercase"}}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

  // ════════════════════ PROFILE VIEW ════════════════════
  if (view==="profile"&&selContact) {
    return (
      <div style={{padding:"32px 40px",maxWidth:500}}>
        <BackBtn onClick={()=>setView("chat")} T={T} />
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 0"}}>
          <div style={{width:100,height:100,borderRadius:24,background:`linear-gradient(135deg,${MEMBER_COLORS[0]},#6bd8cb)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Manrope',sans-serif",fontWeight:800,color:"#fff",fontSize:38,marginBottom:16}}>{(selContact.room_name||"?")[0]}</div>
          <div style={{fontFamily:"'Manrope',sans-serif",fontWeight:800,fontSize:22,color:T.text,marginBottom:4}}>{selContact.room_name}</div>
          <div style={{fontSize:13,color:T.textSub,marginBottom:4}}>{selContact.other_user_role||""}</div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:10}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:selContact.other_user_id?"#6bd8cb":T.textMuted}}></span>
            <span style={{fontSize:12,color:selContact.other_user_id?"#2ca397":T.textMuted}}>{selContact.other_user_id?"Online":"Offline"}</span>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════ MEDIA VIEW ════════════════════
  if (view==="media") {
    return (
      <div style={{padding:"32px 40px",maxWidth:700}}>
        <BackBtn onClick={()=>setView("chat")} T={T} />
        <div style={{fontFamily:"'Manrope',sans-serif",fontWeight:800,fontSize:20,color:T.text,marginBottom:4}}>Shared Media</div>
        <div style={{fontSize:12,color:T.textSub,marginBottom:20}}>Files exchanged in this conversation</div>
        {sharedFiles.length===0?(
          <div style={{textAlign:"center",padding:"60px 0",color:T.textMuted}}>
            <span className="msi" style={{fontSize:48,display:"block",marginBottom:12}}>folder_open</span>
            <div style={{fontFamily:"'Manrope',sans-serif",fontWeight:700,fontSize:15,color:T.textSub}}>No shared files yet</div>
          </div>
        ):(
          <div style={{background:T.surface,borderRadius:12,border:`1px solid ${T.border}`,overflow:"hidden"}}>
            {sharedFiles.map((f,i)=>(
              <div key={f.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 18px",borderBottom:i<sharedFiles.length-1?`1px solid ${T.border}`:"none"}}>
                <div style={{width:40,height:40,borderRadius:9,background:f.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span className="msi" style={{color:f.color,fontSize:20}}>{f.icon}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Manrope',sans-serif",fontWeight:700,fontSize:12,color:T.text}}>{f.name}</div>
                  <div style={{fontSize:10,color:T.textMuted}}>From {f.sender} · {f.time}</div>
                </div>
                <span style={{fontSize:11,color:T.textSub,marginRight:8}}>{f.size}</span>
                <a href={f.url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",width:30,height:30,background:T.inputBg,borderRadius:6,color:"#405f91",textDecoration:"none"}}>
                  <span className="msi" style={{fontSize:15}}>download</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ════════════════════ CHAT VIEW ════════════════════
  return (
    <div style={{display:"flex",height:"calc(100vh - 56px)"}}>
      {/* Conversation list */}
      <div style={{width:290,background:T.surface,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"16px 14px 10px"}}>
          <div style={{display:"flex",alignItems:"center",marginBottom:8}}>
            <button onClick={()=>setView("summary")} style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex",padding:4,marginRight:6}}>
              <span className="msi" style={{fontSize:20}}>arrow_back</span>
            </button>
            <div style={{fontFamily:"'Manrope',sans-serif",fontWeight:800,fontSize:14,color:T.text}}>All Messages</div>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <button onClick={()=>setView("new_message")} style={{flex:1,padding:"7px 0",background:"#001736",color:"#fff",border:"none",borderRadius:7,cursor:"pointer",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
              <span className="msi" style={{fontSize:14}}>edit</span>New Message
            </button>
            <button onClick={()=>setView("create_group_step1")} style={{flex:1,padding:"7px 0",background:T.inputBg,color:"#405f91",border:"none",borderRadius:7,cursor:"pointer",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
              <span className="msi" style={{fontSize:14}}>group_add</span>New Group
            </button>
          </div>
          <input type="text" placeholder="Search messages" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:7,border:`1px solid ${T.border}`,fontSize:11,outline:"none",background:T.inputBg,color:T.text}} />
        </div>

        {/* Newly created groups appear first */}
        <div style={{flex:1,overflowY:"auto"}}>
          {filteredConversations.map((c,i) => {
            const isSelG = selGroup&&c.room_type==="group"&&c.room_id===selGroup.room_id;
            const isSelC = selContact&&c.room_type==="direct"&&c.room_id===selContact.room_id;
            const active = isSelG||isSelC;
            return (
              <div key={c.room_id} onClick={()=>c.room_type==="group"?openGroupRoom(c):openDirectRoom(c)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",cursor:"pointer",background:active?T.inputBg:"transparent",borderLeft:active?"3px solid #405f91":"3px solid transparent",transition:"all 0.12s"}}>
                <div style={{position:"relative",flexShrink:0}}>
                  <Avatar name={c.room_name||"?"} size={40} idx={i} isGroup={c.room_type==="group"} />
                  {c.room_type==="direct" && c.other_user_id &&<span style={{position:"absolute",bottom:2,right:2,width:8,height:8,background:"#6bd8cb",borderRadius:"50%",border:"2px solid "+T.surface}}></span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontFamily:"'Manrope',sans-serif",fontWeight:700,fontSize:12,color:T.text}}>{c.room_name||"Unknown"}</span>
                    {c.unread_count>0&&<span style={{background:"#405f91",color:"#fff",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:9999}}>{c.unread_count}</span>}
                  </div>
                  <span style={{fontSize:10,color:T.textSub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block"}}>
  {c.last_message_type === "file" || c.last_message_type === "pdf" || c.last_message_type === "image" || c.last_message_type === "video"
    ? c.last_message_type === "image" ? "📷 Image"
    : c.last_message_type === "video" ? "🎥 Video"
    : "📎 File"
    : c.last_message || "No messages yet"}
</span>
                  <span style={{fontSize:9,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{c.room_type==="group"?`Group · ${c.member_count} members`:c.other_user_role||""}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      {(selContact||selGroup) ? (
        <div style={{flex:1,display:"flex",flexDirection:"column",background:T.bg,minWidth:0}}>
          {/* Header */}
          <div style={{padding:"13px 20px",background:T.surface,borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Avatar name={(selGroup?.room_name||selContact?.room_name||"?")} size={40} idx={0} isGroup={!!selGroup} />
              <div>
                <div style={{fontFamily:"'Manrope',sans-serif",fontWeight:800,fontSize:14,color:T.text}}>{selGroup?.room_name||selContact?.room_name||"Unknown"}</div>
                <div style={{fontSize:11,color:selContact?.other_user_id?"#2ca397":T.textMuted,fontWeight:600}}>
                  {selGroup?`${selGroup.member_count} members`:(selContact?.other_user_id?"● Online":"○ Offline")}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>navigate("meetings")} style={{width:34,height:34,borderRadius:8,background:T.inputBg,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#405f91"}}>
                <span className="msi" style={{fontSize:18}}>video_call</span>
              </button>
              {!selGroup&&(
                <button onClick={()=>setShowDeleteConfirm(true)} style={{width:34,height:34,borderRadius:8,background:"#ffdad6",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#ba1a1a"}}>
                  <span className="msi" style={{fontSize:18}}>delete</span>
                </button>
              )}
            </div>
          </div>

          {/* Delete confirm */}
          {showDeleteConfirm&&(
            <div style={{margin:"12px 20px",background:"#ffdad6",borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
              <span className="msi" style={{color:"#ba1a1a",fontSize:20}}>warning</span>
              <div style={{flex:1,fontSize:12,color:"#93000a"}}>Delete this conversation? This cannot be undone.</div>
              <button onClick={deleteChat} style={{padding:"5px 14px",background:"#ba1a1a",color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700}}>Delete</button>
              <button onClick={()=>setShowDeleteConfirm(false)} style={{padding:"5px 14px",background:"#fff",color:"#64748b",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700}}>Cancel</button>
            </div>
          )}

          {/* Messages */}
          <div style={{flex:1,overflowY:"auto",padding:"20px 22px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <div style={{flex:1,height:1,background:T.border}}/>
              <span style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em"}}>Today</span>
              <div style={{flex:1,height:1,background:T.border}}/>
            </div>
            {loadingMsgs&&<div style={{textAlign:"center",color:T.textMuted,padding:20}}>Loading messages…</div>}
            {currentMsgs.map((msg,mi) => (
              <div key={msg.id||mi} style={{display:"flex",justifyContent:msg.mine?"flex-end":"flex-start",marginBottom:10}}>
                {/* Avatar */}
                {!msg.mine && (
                  <div style={{width:30,height:30,borderRadius:7,background:MEMBER_COLORS[mi%MEMBER_COLORS.length],display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Manrope',sans-serif",fontWeight:800,color:"#fff",fontSize:11,marginRight:8,flexShrink:0,alignSelf:"flex-end"}}>
                    {(msg.sender_name||"?")[0]}
                  </div>
                )}
                <div style={{maxWidth:"58%"}}>
                  {selGroup&&!msg.mine&&(
                    <div style={{fontSize:10,fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{msg.sender_name}</div>
                  )}
                  {/* Reply preview */}
                  {msg.reply_to_msg_id&&msg.reply_to_content&&(
                    <div style={{padding:"5px 10px",borderRadius:"8px 8px 0 0",background:msg.mine?"rgba(255,255,255,0.15)":T.inputBg,borderLeft:"3px solid #405f91",marginBottom:2,fontSize:11,color:T.textMuted}}>
                      <div style={{fontSize:9,fontWeight:700,color:"#405f91",marginBottom:2}}>{msg.reply_to_sender_name}</div>
                      {msg.reply_to_content}
                    </div>
                  )}

                  {/* Message bubble content for file upload */}
<div style={{padding:"9px 13px",borderRadius:msg.mine?"14px 14px 4px 14px":"14px 14px 14px 4px",background:msg.mine?T.bubble:T.otherBubble,color:msg.mine?T.bubbleText:T.otherBubbleText,fontSize:13,lineHeight:1.5,border:msg.mine?"none":`1px solid ${T.border}`,boxShadow:"0 1px 3px rgba(0,23,54,0.05)"}}>
  
  {/* Determine the actual URL — could be in content or file_url */}
  {(() => {
    const url = msg.file_url || msg.content;
    const type = msg.message_type;
    const isImage = type === "image" || (type === "file" && /\.(png|jpg|jpeg|gif|webp)$/i.test(url));
    const isVideo = type === "video" || (type === "file" && /\.(mp4|mov|avi)$/i.test(url));
    const isPdf   = type === "pdf"   || (type === "file" && /\.pdf$/i.test(url));
    const isDoc   = ["doc","docx","txt","xlsx","ppt","pptx"].includes(type) ||
                    (type === "file" && /\.(docx?|txt|xlsx|pptx?)$/i.test(url));

    if (isImage) return <img src={url} width="180" alt="img" style={{borderRadius:10,display:"block"}} />;
    if (isVideo) return <video src={url} width="220" controls style={{borderRadius:10,display:"block"}} />;
    if (isPdf)   return <a href={url} target="_blank" rel="noreferrer" style={{color:"inherit",display:"flex",alignItems:"center",gap:6}}>📄 <span>Open PDF</span></a>;
    if (isDoc)   return <a href={url} target="_blank" rel="noreferrer" style={{color:"inherit",display:"flex",alignItems:"center",gap:6}}>📎 <span>Open Document</span></a>;
    if (type === "file" || type === "media") return (
      <a href={url} target="_blank" rel="noreferrer" style={{color:"inherit",display:"flex",alignItems:"center",gap:6}}>
        📎 <span>{msg.file_name || url.split("/").pop() || "Open File"}</span>
      </a>
    );
    if (type === "text") return <span>{msg.content}</span>;
    return <span>{msg.content}</span>;
  })()}

</div>

                  {/*Read status + time*/}
                  <div style={{display:"flex",alignItems:"center",gap:3,marginTop:3,justifyContent:msg.mine?"flex-end":"flex-start"}}>
                    <span style={{fontSize:10,color:T.textMuted}}>{msg.sent_at?fmtTime(msg.sent_at):""}</span>
                    {msg.mine&&!selGroup&&(
                      <span style={{fontSize:11,color:msg.status==="read"?"#2ca397":T.textMuted}}>
                        {msg.status==="read"?"✓✓":msg.status==="delivered"?"✓✓":"✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input, file sharing per contact */}
          <div style={{padding:"13px 20px",background:T.surface,borderTop:`1px solid ${T.border}`,position:"relative"}}>
            {showFilePopup&&(
              <>
                <div onClick={()=>setShowFilePopup(false)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:999}} />
                <div style={{position:"absolute",bottom:65,left:20,zIndex:1000}}>
                  <FileUploadPopup onClose={()=>setShowFilePopup(false)} T={T} sendMessage={sendMsg} />
                </div>
              </>
            )}

            {/* popup box */}
            <div style={{display:"flex",alignItems:"center",gap:8,background:T.inputBg,borderRadius:10,padding:"7px 14px"}}>
              <button onClick={()=>setShowFilePopup(v=>!v)} style={{background:"none",border:"none",cursor:"pointer",color:T.textSub,display:"flex",padding:2}}>
                <span className="msi" style={{fontSize:19}}>attach_file</span>
              </button>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Type a message…" style={{flex:1,background:"none",border:"none",outline:"none",fontSize:13,color:T.text,fontFamily:"'Inter',sans-serif"}} />
              <button onClick={()=>sendMsg()} style={{background:"#001736",border:"none",cursor:"pointer",color:"#fff",width:34,height:34,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span className="msi" style={{fontSize:17}}>send</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:T.bg}}>
          <div style={{textAlign:"center",color:T.textMuted}}>
            <span className="msi" style={{fontSize:56,display:"block",marginBottom:12}}>chat_bubble_outline</span>
            <div style={{fontFamily:"'Manrope',sans-serif",fontWeight:700,fontSize:16,color:T.textSub}}>Select a conversation</div>
          </div>
        </div>
      )}

      {/* Right panel — DM info */}
      {selContact&&!selGroup&&(
        <div style={{width:230,background:T.surface,borderLeft:`1px solid ${T.border}`,padding:16,flexShrink:0,overflowY:"auto"}}>
          <div style={{textAlign:"center",marginBottom:14}}>
            <div style={{width:58,height:58,borderRadius:14,background:`linear-gradient(135deg,${MEMBER_COLORS[0]},#6bd8cb)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Manrope',sans-serif",fontWeight:800,color:"#fff",fontSize:22,margin:"0 auto 8px"}}>{(selContact.room_name||"?")[0]}</div>
            <div style={{fontFamily:"'Manrope',sans-serif",fontWeight:800,fontSize:14,color:T.text}}>{selContact.room_name}</div>
            <div style={{fontSize:11,color:T.textSub}}>{selContact.other_user_role||""}</div>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <button onClick={()=>setView("profile")} style={{flex:1,padding:"7px 0",background:T.inputBg,color:"#405f91",border:"none",borderRadius:7,cursor:"pointer",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>View Profile</button>
          </div>
          <div style={{borderTop:`1px solid ${T.border}`,paddingTop:12}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Shared Media</div>
            <button onClick={openMedia} style={{width:"100%",padding:"7px 0",background:"none",border:`1px solid ${T.border}`,color:"#405f91",borderRadius:7,cursor:"pointer",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>View All Files</button>
          </div>
        </div>
      )}

      {/* Right panel — group members */}
      {selGroup&&(
        <div style={{width:200,background:T.surface,borderLeft:`1px solid ${T.border}`,padding:14,flexShrink:0,overflowY:"auto"}}>
          <div style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Members ({selGroup.member_count})</div>
          {(selGroup.members||[]).map((m,i) => (
            <div key={m.id||i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${T.border}20`}}>
              <Avatar name={m.name||"?"} size={28} idx={i} />
              <div>
                <div style={{fontFamily:"'Manrope',sans-serif",fontWeight:700,fontSize:11,color:T.text}}>{(m.name||"").split(" ")[0]}</div>
                <div style={{fontSize:9,color:T.textMuted}}>{m.role==="admin"?"Admin":"Member"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ─── MEETINGS PAGE ────────────────────────────────────────────
function MeetingsPage({ navigate, T, userId }) {
  const [meetingTopic, setMeetingTopic] = useState("");
  const [tab, setTab]                   = useState("upcoming");
  const [meetings, setMeetings]         = useState([]);
  const [showCreate, setShowCreate]     = useState(false);
  const [copied, setCopied]             = useState(null);
  const [generatedLink, setGeneratedLink] = useState("");
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchMeetings(userId)
      .then(setMeetings)
      .catch(console.error)
      .finally(()=>setLoading(false));
  }, [userId]);

  const copy = (id, link) => {
    navigator.clipboard?.writeText(link).catch(()=>{});
    setCopied(id); setTimeout(()=>setCopied(null),2000);
  };

  const generateInstantMeeting = async () => {
    try {
      const data = await createMeeting(meetingTopic);
      setGeneratedLink(data.url);
    } catch(err) { console.error("Failed to generate meeting", err); }
  };

  const filtered = meetings.filter(m=>m.status===tab);

  return (
    <div style={{padding:"32px 40px",maxWidth:1000}}>
      <BackBtn onClick={()=>navigate("messages")} T={T} />
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div>
          <span style={{fontSize:10,fontWeight:700,color:T.teal,textTransform:"uppercase",letterSpacing:"0.1em"}}>Virtual Collaboration</span>
          <h2 style={{fontFamily:"'Manrope',sans-serif",fontSize:24,fontWeight:800,color:T.text,margin:"4px 0",letterSpacing:"-0.02em"}}>Meeting Links</h2>
          <p style={{fontSize:12,color:T.textSub,margin:0}}>Schedule Meetings</p>
        </div>
        <button onClick={()=>{setShowCreate(true);setGeneratedLink("");}} style={{display:"flex",alignItems:"center",gap:7,padding:"10px 18px",background:T.primary,color:T.primaryText,border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:10,textTransform:"uppercase"}}>
          <span className="msi" style={{fontSize:15}}>add</span>Create New Meeting
        </button>
      </div>

      {showCreate && (
  <div style={{marginBottom:24,background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,padding:22}}>
    <div style={{fontWeight:800,fontSize:15,color:T.text,marginBottom:16}}>Start Instant Meeting</div>
    {!generatedLink ? (
      <>
        <input
          value={meetingTopic}
          onChange={e => setMeetingTopic(e.target.value)}
          placeholder="Meeting topic (required)"
          style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${meetingTopic.trim()?T.border:"#ba1a1a"}`,background:T.inputBg,fontSize:12,color:T.text,marginBottom:4,boxSizing:"border-box"}}
        />
        {!meetingTopic.trim() && (
          <div style={{fontSize:10,color:"#ba1a1a",marginBottom:10,fontWeight:600}}>⚠ Please enter a meeting topic to continue</div>
        )}
        <div style={{marginBottom:12}} />
        <button
          onClick={() => meetingTopic.trim() && generateInstantMeeting()}
          style={{padding:"10px 22px",background:meetingTopic.trim()?"#001736":T.borderStrong,color:"#fff",border:"none",borderRadius:8,cursor:meetingTopic.trim()?"pointer":"not-allowed",fontWeight:700,fontSize:11,textTransform:"uppercase",opacity:meetingTopic.trim()?1:0.6}}
        >
          Generate Meeting Link
        </button>
      </>
    ) : (
      <>
        <div style={{fontSize:11,color:T.textSub,marginBottom:6}}>Your Meeting Link for <strong>{meetingTopic}</strong></div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <input value={generatedLink} readOnly style={{flex:1,padding:"8px 10px",borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,fontSize:11,color:T.text}} />
          <button onClick={()=>copy("instant",generatedLink)} style={{padding:"8px 14px",background:copied==="instant"?"#e7fffe":"#001736",color:copied==="instant"?"#2ca397":"#fff",border:"none",borderRadius:7,cursor:"pointer",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
            <span className="msi">{copied==="instant"?"check":"content_copy"}</span>
            {copied==="instant"?"Copied!":"Copy"}
          </button>
        </div>
        <button onClick={()=>window.open(generatedLink,"_blank")} style={{padding:"9px 18px",background:"#2ca397",color:"#fff",border:"none",borderRadius:7,cursor:"pointer",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>Join Now</button>
      </>
    )}
    <div style={{marginTop:12}}>
      <button onClick={()=>{setShowCreate(false);setMeetingTopic("");setGeneratedLink("");}} style={{padding:"8px 18px",background:T.inputBg,color:T.textSub,border:"none",borderRadius:7,cursor:"pointer",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>Close</button>
    </div>
  </div>
    )}

      <div style={{display:"flex",gap:0,marginBottom:20,background:T.inputBg,borderRadius:9,padding:4,width:"fit-content"}}>
        {[{k:"upcoming",l:"Upcoming"},{k:"scheduled",l:"Scheduled"},{k:"completed",l:"Completed"}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"7px 18px",borderRadius:7,border:"none",background:tab===t.k?"#001736":"transparent",color:tab===t.k?"#fff":T.textSub,fontSize:10,fontWeight:700,textTransform:"uppercase",cursor:"pointer"}}>{t.l}</button>
        ))}
      </div>

      {loading&&<div style={{textAlign:"center",color:T.textMuted,padding:40}}>Loading meetings…</div>}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {filtered.map(m=>(
          <div key={m.id} style={{background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,padding:22}}>
            <div style={{fontWeight:800,fontSize:14,color:T.text,marginBottom:4}}>{m.title}</div>
            <div style={{fontSize:11,color:T.textSub,marginBottom:8}}>{m.date} {m.time} · {m.platform}</div>
            {m.participants?.length>0&&(
              <div style={{display:"flex",gap:6,marginBottom:12}}>
                {m.participants.map((p,i)=><div key={i} style={{width:28,height:28,borderRadius:7,background:MEMBER_COLORS[i%MEMBER_COLORS.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff"}}>{p}</div>)}
              </div>
            )}
            {m.status!=="completed"?(
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>window.open(m.link,"_blank")} style={{flex:1,padding:"8px 0",background:"#001736",color:"#fff",border:"none",borderRadius:7,cursor:"pointer",fontSize:9,fontWeight:700,textTransform:"uppercase"}}>Join</button>
                <button onClick={()=>copy(m.id,m.link)} style={{flex:1,padding:"8px 0",background:copied===m.id?"#e7fffe":T.inputBg,color:copied===m.id?"#2ca397":"#405f91",border:"none",borderRadius:7,cursor:"pointer",fontSize:9,fontWeight:700,textTransform:"uppercase"}}>{copied===m.id?"Copied!":"Copy"}</button>
              </div>
            ):(
              <div style={{padding:"8px 0",textAlign:"center",fontSize:10,fontWeight:700,color:T.textSub,background:T.inputBg,borderRadius:7,textTransform:"uppercase"}}>Completed</div>
            )}
          </div>
        ))}
        {!loading&&filtered.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"40px 0",color:T.textMuted,fontSize:13}}>No {tab} meetings</div>}
      </div>
    </div>
  );
}

// ─── ALERTS / NOTIFICATIONS PAGE ─────────────────────────────
function AlertsPage({ navigate, T, userId, unreadAlerts, setUnreadAlerts }) {
  const [notifs, setNotifs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");

  const [prefs, setPrefs] = useState({ 
    "New Messages":true,
    "Group Activity":true,
    "Meeting Reminders":true,
    "File Uploads":false,
    "Push Notifications":false,
    "Email Digest":false
  });

  // Load from DB on mount
  useEffect(() => {
    if (!userId) return;
    fetchNotifications(userId).then(setNotifs).catch(console.error);
  }, [userId]);

    const markAllRead = () => {
    setNotifs(p => p.map(x => ({...x, read:true})));
    setUnreadAlerts(0);
    markAllNotifsRead(userId).catch(console.error);
  };

  const markRead = (id) => {
    setNotifs(p => p.map(x => x.id === id ? {...x, read:true} : x));
    const remaining = notifs.filter(x => x.id !== id && !x.read).length;
    setUnreadAlerts(remaining);
    markOneNotifRead(id).catch(console.error);
  };

  const unread = notifs.filter(n => !n.read).length;

  const typeToPrefs = {
  // Messages
  message:          "New Messages",
  new_message:      "New Messages",
  direct_message:   "New Messages",
  chat:             "New Messages",

  // Groups
  group:            "Group Activity",
  group_update:     "Group Activity",
  group_message:    "Group Activity",
  group_mention:    "Group Activity",

  // Meetings
  meeting:          "Meeting Reminders",
  meeting_reminder: "Meeting Reminders",
  meeting_invite:   "Meeting Reminders",
  scheduled:        "Meeting Reminders",

  // Files
  file:             "File Uploads",
  file_shared:      "File Uploads",
  image:            "File Uploads",
  video:            "File Uploads",
  pdf:              "File Uploads",
  media:            "File Uploads",
  upload:           "File Uploads",
};

  // ================= FILTER SAFE =================
  const shown = notifs.filter(n=>{
    const pk = typeToPrefs[n.type]; if(pk&&!prefs[pk]) return false;
    if(activeFilter==="All") return true;
    if(activeFilter==="Messages") return n.type==="message"||n.type==="new_message";
    if(activeFilter==="Groups")   return n.type==="group"||n.type==="group_update";
    if(activeFilter==="Meetings") return n.type==="meeting";
    if(activeFilter==="Files")    return n.type==="file"||n.type==="file_shared";
    return true;
  });

  return (
    <div style={{padding:"32px 40px",maxWidth:860}}>
      <BackBtn onClick={()=>navigate("messages")} T={T} />
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div>
          <span style={{fontSize:10,fontWeight:700,color:T.teal,textTransform:"uppercase",letterSpacing:"0.1em"}}>Activity Center</span>
          <h2 style={{fontFamily:"'Manrope',sans-serif",fontSize:24,fontWeight:800,color:T.text,margin:"4px 0",letterSpacing:"-0.02em"}}>Notifications</h2>
          <p style={{fontSize:12,color:T.textSub,margin:0}}>{unread>0?`${unread} unread notifications`:"All caught up!"}</p>
        </div>
        <button onClick={markAllRead} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",background:unread>0?"#001736":T.inputBg,color:unread>0?"#fff":T.textMuted,border:"none",borderRadius:8,cursor:"pointer",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>
          <span className="msi" style={{fontSize:15}}>done_all</span>Mark All Read
        </button>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:22}}>
        {["All","Messages","Groups","Meetings","Files"].map(f=>(
          <button key={f} onClick={()=>setActiveFilter(f)} style={{padding:"7px 15px",borderRadius:7,border:"1px solid",borderColor:activeFilter===f?"#001736":T.border,background:activeFilter===f?"#001736":T.surface,color:activeFilter===f?"#fff":T.textSub,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",cursor:"pointer"}}>
            {f}{f==="All"&&unread>0&&<span style={{marginLeft:5,background:"#ba1a1a",color:"#fff",borderRadius:9999,padding:"0 4px",fontSize:9}}>{unread}</span>}
          </button>
        ))}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:32}}>
        {shown.map(n=>(
          <div key={n.id} onClick={()=>markRead(n.id)} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"14px 18px",background:n.read?T.surface:T.inputBg,borderRadius:12,border:"1px solid",borderColor:n.read?T.border:"#c4d4f8",cursor:"pointer"}}>
            <div style={{width:40,height:40,borderRadius:10,background:n.bg||"#d6e3ff",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span className="msi" style={{color:n.color||"#405f91",fontSize:19}}>{n.icon||"notifications"}</span>
            </div>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontWeight:n.read?600:800,fontSize:13,color:T.text}}>{n.title}</span>
                <span style={{fontSize:10,color:T.textMuted}}>{n.time||n.time_ago}</span>
              </div>
              <div style={{fontSize:12,color:T.textSub}}>{n.body||n.text||n.preview||n.content}</div>
            </div>
            {!n.read&&<div style={{width:8,height:8,borderRadius:"50%",background:"#405f91",flexShrink:0,marginTop:4}} />}
          </div>
        ))}
        {shown.length===0&&(
          <div style={{textAlign:"center",padding:"50px 0",color:T.textMuted}}>
            <span className="msi" style={{fontSize:48,display:"block",marginBottom:12}}>notifications_off</span>
            <div>No notifications here</div>
          </div>
        )}
      </div>

      <div style={{background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,padding:22}}>
        <div style={{fontWeight:800,fontSize:14,color:T.text,marginBottom:14}}>Notification Preferences</div>
        
        {/* toggle button */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {Object.entries(prefs).map(([label,enabled])=>(
            <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"9px 13px",background:T.inputBg,borderRadius:8}}>
              <span style={{fontSize:12,fontWeight:600,color:T.text}}>{label}</span>
              <div onClick={()=>setPrefs(p=>({...p,[label]:!p[label]}))} style={{width:34,height:19,borderRadius:9,background:enabled?"#405f91":T.borderStrong,position:"relative",cursor:"pointer", userSelect: "none", WebkitTapHighlightColor: "transparent",}}>
                <div style={{width:13,height:13,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:enabled?18:3,transition:"left 0.2s", pointerEvents: "none",}} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
 

// ─── ROOT APP ─────────────────────────────────────────────────
export default function App() {
  const [page, setPage]           = useState("messages");
  const [darkMode, setDarkMode]   = useState(false);
  const [userId, setUserId]       = useState(null);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const askedRef = useRef(false);
  const T = darkMode ? DARK : LIGHT;

  useEffect(() => {
    if (askedRef.current) return;
    askedRef.current = true;
    let id = null;
    while (!id || isNaN(Number(id))) { id = window.prompt("Enter your User ID:"); }
    setUserId(Number(id));
  }, []);

  useEffect(() => {
  if (!userId) return;
  fetchNotifications(userId)
    .then(data => setUnreadAlerts(data.filter(n => !n.read).length))
    .catch(console.error);
}, [userId]);

  const navigate = (p) => setPage(p);

  const pages = {
    messages: <MessagesPage userId={userId} navigate={navigate} T={T} unreadAlerts={unreadAlerts} setUnreadAlerts={setUnreadAlerts} />,
    meetings: <MeetingsPage navigate={navigate} T={T} userId={userId} />,
    alerts:   <AlertsPage navigate={navigate} T={T} userId={userId} unreadAlerts={unreadAlerts} setUnreadAlerts={setUnreadAlerts} />,
  };

  return (
    <Layout 
      navigate={navigate} 
      page={page}
      T={T}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      unreadAlerts={unreadAlerts}
      setUnreadAlerts={setUnreadAlerts}>
      {pages[page]||pages.messages}
    </Layout>
  );
}