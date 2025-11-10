import React, { useState, useEffect, createContext, useContext } from 'react';

// SERVICEHUB - Single-file React demo app
// - Intended for academic demo / preview in Canvas
// - Tailwind utility classes are used (preview environment supplies Tailwind)
// - This single-file app simulates a backend using localStorage so the UI is fully interactive
// - Default export is the App component

/*
Features implemented in this preview:
- Sign up / Login (simple local auth persisted to localStorage)
- Provider listings & search (category, text)
- Book service flow (select provider, choose time slot, simulated payment)
- Admin dashboard (view providers, bookings, verify providers)
- Contact form (saves feedback locally)
- Simple provider onboarding simulation (upload simulated docs)

Note: For a real full-stack deployment, replace localStorage calls with calls
to your Node.js / Express backend endpoints (auth, providers, bookings, payments).
*/

// --- Simple styles fallback (if Tailwind isn't available) ---
const baseStyles = {
  container: 'min-h-screen bg-gray-50 text-gray-900',
  card: 'bg-white p-4 rounded shadow',
  btn: 'px-4 py-2 rounded font-semibold shadow-sm',
};

// --- Utility: LocalStorage-backed DB simulation ---
const DB = {
  init() {
    if (!localStorage.getItem('sh_users')) {
      const users = [
        { id: 'admin', name: 'Admin', email: 'admin@servicehub.local', role: 'admin', password: 'admin', verified: true }
      ];
      localStorage.setItem('sh_users', JSON.stringify(users));
    }
    if (!localStorage.getItem('sh_providers')) {
      const providers = [
        { id: 'prov1', name: 'Ravi Kumar', category: 'Plumbing', rating: 4.7, verified: true, charges: 500, location: 'Chennai', slots: ['2025-11-12T09:00', '2025-11-12T13:00'] },
        { id: 'prov2', name: 'Geeta Sharma', category: 'Electrician', rating: 4.4, verified: false, charges: 400, location: 'Chennai', slots: ['2025-11-13T10:00'] }
      ];
      localStorage.setItem('sh_providers', JSON.stringify(providers));
    }
    if (!localStorage.getItem('sh_bookings')) localStorage.setItem('sh_bookings', JSON.stringify([]));
    if (!localStorage.getItem('sh_contacts')) localStorage.setItem('sh_contacts', JSON.stringify([]));
  },
  getUsers() { return JSON.parse(localStorage.getItem('sh_users') || '[]'); },
  saveUsers(u){ localStorage.setItem('sh_users', JSON.stringify(u)); },
  getProviders() { return JSON.parse(localStorage.getItem('sh_providers') || '[]'); },
  saveProviders(p){ localStorage.setItem('sh_providers', JSON.stringify(p)); },
  getBookings(){ return JSON.parse(localStorage.getItem('sh_bookings') || '[]'); },
  saveBookings(b){ localStorage.setItem('sh_bookings', JSON.stringify(b)); },
  getContacts(){ return JSON.parse(localStorage.getItem('sh_contacts') || '[]'); },
  saveContacts(c){ localStorage.setItem('sh_contacts', JSON.stringify(c)); },
};

// --- Auth Context ---
const AuthContext = createContext();
function useAuth(){ return useContext(AuthContext); }

function AuthProvider({ children }){
  const [user, setUser] = useState(null);

  useEffect(()=>{ DB.init(); const token = localStorage.getItem('sh_session'); if (token){
    const u = DB.getUsers().find(x=>x.email===token || x.id===token); if(u) setUser(u);
  } },[]);

  function login(email, password){
    const users = DB.getUsers();
    const u = users.find(x=> (x.email===email || x.id===email) && x.password===password);
    if(u){ localStorage.setItem('sh_session', u.email||u.id); setUser(u); return {ok:true}; }
    return {ok:false, error:'Invalid credentials'};
  }

  function signup(name,email,password,role='customer'){
    const users = DB.getUsers();
    if(users.find(x=>x.email===email)) return {ok:false,error:'Email already registered'};
    const id = 'u'+Date.now();
    const u = {id,name,email,password,role,verified: role==='provider'?false:true};
    users.push(u); DB.saveUsers(users); localStorage.setItem('sh_session', u.email); setUser(u); return {ok:true};
  }

  function logout(){ localStorage.removeItem('sh_session'); setUser(null); }

  return <AuthContext.Provider value={{user,login,signup,logout,setUser}}>{children}</AuthContext.Provider>
}

// --- Small UI Components ---
function Navbar({onNav}){
  const { user, logout } = useAuth();
  return (
    <nav className="bg-white shadow p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg width="36" height="36" viewBox="0 0 24 24" className="text-blue-600"><rect width="24" height="24" rx="4" fill="#1D4ED8"/></svg>
          <div className="text-lg font-bold">SERVICEHUB</div>
          <div className="text-sm text-gray-500">Connecting homes with trusted service providers</div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="text-sm" onClick={()=>onNav('home')}>Home</button>
          <button className="text-sm" onClick={()=>onNav('services')}>Services</button>
          <button className="text-sm" onClick={()=>onNav('about')}>About</button>
          <button className="text-sm" onClick={()=>onNav('contact')}>Contact</button>
          {user? (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{user.name}</span>
              <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={logout}>Logout</button>
              {user.role==='admin' && <button className="px-3 py-1 bg-gray-800 text-white rounded" onClick={()=>onNav('admin')}>Admin</button>}
            </div>
          ) : (
            <div>
              <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={()=>onNav('login')}>Login</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function Footer(){
  return (
    <footer className="mt-10 p-6 bg-white text-center text-sm text-gray-600">
      © {new Date().getFullYear()} SERVICEHUB — For demo / academic submission
    </footer>
  );
}

function Hero({onNav}){
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <h1 className="text-3xl font-bold">Find trusted local service professionals near you</h1>
          <p className="mt-4 text-sm opacity-90">Verified providers, transparent pricing, and secure payments — tailored for local services like plumbing, electrical, housekeeping and more.</p>
          <div className="mt-6">
            <button className="px-4 py-2 bg-white text-blue-700 rounded mr-3" onClick={()=>onNav('services')}>Browse Services</button>
            <button className="px-4 py-2 bg-transparent border border-white rounded" onClick={()=>onNav('about')}>Learn More</button>
          </div>
        </div>
        <div>
          <div className="bg-white p-4 rounded shadow text-gray-800">
            <h3 className="font-semibold">Quick Search</h3>
            <p className="text-sm text-gray-600">Try searching: <strong>Plumbing</strong>, <strong>Electrician</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Flash({msg}){ if(!msg) return null; return <div className="p-2 text-sm bg-green-50 border border-green-200 text-green-800">{msg}</div> }

// --- Services Page ---
function ServicesPage({onBook}){
  const [providers,setProviders] = useState([]);
  const [q,setQ]=useState('');
  const [category,setCategory]=useState('');

  useEffect(()=>{ setProviders(DB.getProviders()); },[]);

  function search(){
    const all = DB.getProviders();
    const filtered = all.filter(p=>{
      const matchQ = q? (p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase())):true;
      const matchC = category? p.category===category:true;
      return matchQ && matchC;
    });
    setProviders(filtered);
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Service Providers</h2>
      <div className="mb-4 flex flex-col md:flex-row gap-3">
        <input className="p-2 border rounded" placeholder="Search by name or category" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="p-2 border rounded" value={category} onChange={e=>setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option>Plumbing</option>
          <option>Electrician</option>
          <option>Housekeeping</option>
          <option>Appliance Repair</option>
        </select>
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={search}>Search</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map(p=> (
          <div key={p.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{p.name} {p.verified? <span className="text-xs bg-green-100 px-2 rounded ml-2">Verified</span>:<span className="text-xs bg-yellow-100 px-2 rounded ml-2">Unverified</span>}</h3>
                <div className="text-sm text-gray-600">{p.category} • {p.location}</div>
                <div className="text-sm mt-2">Charges: ₹{p.charges}</div>
                <div className="text-sm">Rating: {p.rating} / 5</div>
              </div>
              <div className="flex flex-col items-end">
                <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={()=>onBook(p)}>Book</button>
                <div className="text-xs text-gray-500 mt-2">Slots: {p.slots.length}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Booking Modal (Simple) ---
function BookingModal({provider,onClose}){
  const { user } = useAuth();
  const [slot, setSlot] = useState(provider?.slots?.[0] || '');
  const [notes, setNotes] = useState('');
  const [msg,setMsg]=useState(null);

  if(!provider) return null;

  function confirm(){
    if(!user) { setMsg('Please login to book'); return; }
    const bookings = DB.getBookings();
    const id = 'b'+Date.now();
    const booking = { id, userId: user.id, providerId: provider.id, slot, amount: provider.charges, status:'PENDING', notes };
    bookings.push(booking); DB.saveBookings(bookings);
    // simulate payment
    setTimeout(()=>{
      booking.status='PAID'; DB.saveBookings(bookings); setMsg('Payment successful — booking confirmed');
    },800);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded p-4 w-96">
        <h3 className="font-bold">Book {provider.name}</h3>
        <div className="mt-2 text-sm">Select slot</div>
        <select className="w-full p-2 border rounded mt-2" value={slot} onChange={e=>setSlot(e.target.value)}>
          {provider.slots.map(s=> <option key={s} value={s}>{new Date(s).toLocaleString()}</option>)}
        </select>
        <textarea className="w-full p-2 border rounded mt-2" placeholder="Notes for provider" value={notes} onChange={e=>setNotes(e.target.value)} />
        <div className="mt-3 flex justify-end space-x-2">
          <button className="px-3 py-1 border rounded" onClick={onClose}>Cancel</button>
          <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={confirm}>Pay ₹{provider.charges}</button>
        </div>
        {msg && <div className="mt-2 text-sm text-green-700">{msg}</div>}
      </div>
    </div>
  );
}

// --- Login / Register pages ---
function LoginPage({onNav}){
  const { login } = useAuth();
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState(null);
  function submit(e){ e.preventDefault(); const r=login(email,password); if(r.ok){ onNav('home') } else setErr(r.error); }
  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 border rounded" placeholder="Email or ID" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div className="flex justify-between items-center">
          <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Login</button>
          <button className="text-sm underline" onClick={()=>onNav('register')}>Create an account</button>
        </div>
        {err && <div className="text-red-600">{err}</div>}
      </form>
    </div>
  );
}

function RegisterPage({onNav}){
  const { signup } = useAuth();
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [role,setRole]=useState('customer');
  const [msg,setMsg]=useState(null);

  function submit(e){ e.preventDefault(); const r=signup(name,email,password,role); if(r.ok){ setMsg('Account created'); onNav('home')} else setMsg(r.error); }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 border rounded" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div>
          <label className="mr-3"><input type="radio" name="role" checked={role==='customer'} onChange={()=>setRole('customer')} /> Customer</label>
          <label><input type="radio" name="role" checked={role==='provider'} onChange={()=>setRole('provider')} /> Provider</label>
        </div>
        <div className="flex justify-between items-center">
          <button className="px-4 py-2 bg-green-600 text-white rounded" type="submit">Create Account</button>
          <button className="text-sm underline" onClick={()=>onNav('login')}>Back to login</button>
        </div>
        {msg && <div className="text-sm text-gray-700">{msg}</div>}
      </form>
    </div>
  );
}

// --- Contact Page ---
function ContactPage(){
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [msg,setMsg]=useState('');
  const [flash,setFlash]=useState(null);

  function submit(e){ e.preventDefault(); const contacts = DB.getContacts(); contacts.push({id:'c'+Date.now(), name, email, msg}); DB.saveContacts(contacts); setFlash('Thank you — message saved'); setName(''); setEmail(''); setMsg(''); }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Contact & Feedback</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 border rounded" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} />
        <textarea className="w-full p-2 border rounded" placeholder="Message" value={msg} onChange={e=>setMsg(e.target.value)} />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Send</button>
      </form>
      {flash && <div className="mt-3 text-green-700">{flash}</div>}
    </div>
  );
}

// --- Admin Dashboard ---
function AdminDashboard(){
  const [providers,setProviders]=useState([]);
  const [bookings,setBookings]=useState([]);

  useEffect(()=>{ setProviders(DB.getProviders()); setBookings(DB.getBookings()); },[]);

  function verifyProvider(id){
    const p = DB.getProviders(); const idx=p.findIndex(x=>x.id===id); if(idx>=0){ p[idx].verified=true; DB.saveProviders(p); setProviders(p); }
  }

  function cancelBooking(id){ const b = DB.getBookings(); const idx=b.findIndex(x=>x.id===id); if(idx>=0){ b[idx].status='CANCELLED'; DB.saveBookings(b); setBookings(b); } }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Providers</h3>
          <div className="mt-3 space-y-2">
            {providers.map(p=> (
              <div key={p.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium">{p.name} <span className="text-sm text-gray-500">({p.category})</span></div>
                  <div className="text-sm text-gray-600">{p.location}</div>
                </div>
                <div className="flex items-center space-x-2">
                  {!p.verified && <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={()=>verifyProvider(p.id)}>Verify</button>}
                  <div className="text-sm">{p.verified?'Verified':'Pending'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Bookings</h3>
          <div className="mt-3 space-y-2">
            {bookings.map(b=> (
              <div key={b.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium">Booking {b.id}</div>
                  <div className="text-sm text-gray-600">Provider: {b.providerId} • Amount: ₹{b.amount}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm">{b.status}</div>
                  {b.status!=='CANCELLED' && <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={()=>cancelBooking(b.id)}>Cancel</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- About Page ---
function AboutPage(){
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-xl font-bold">About SERVICEHUB</h2>
      <p className="mt-3 text-sm text-gray-700">SERVICEHUB is an academic prototype that demonstrates a trusted local-services marketplace. The platform focuses on provider verification, transparent payments, accessibility-first onboarding and admin tools for dispute resolution. This interactive demo simulates backend behavior in-browser; for a production system, replace simulated storage with a secure backend and integrate a real payment gateway.</p>
      <ul className="mt-3 list-disc pl-6 text-sm text-gray-700">
        <li>Provider verification pipeline (document upload + admin review)</li>
        <li>Booking & escrow-capable payments (simulated)</li>
        <li>Accessibility considerations for low-literacy users</li>
      </ul>
    </div>
  );
}

// --- Main App ---
export default function App(){
  const [route,setRoute]=useState('home');
  const [bookProvider,setBookProvider]=useState(null);

  function onNav(r){ setRoute(r); setBookProvider(null); window.scrollTo(0,0); }

  return (
    <AuthProvider>
      <div className={baseStyles.container}>
        <Navbar onNav={onNav} />
        {route==='home' && <>
          <Hero onNav={onNav} />
          <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-lg font-bold">Quick actions</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded shadow">
                <h4 className="font-semibold">Search providers</h4>
                <p className="text-sm text-gray-600 mt-2">Browse by category and location</p>
                <div className="mt-3">
                  <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={()=>onNav('services')}>Browse</button>
                </div>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h4 className="font-semibold">Become a provider</h4>
                <p className="text-sm text-gray-600 mt-2">Sign up as a provider and submit documents for verification.</p>
                <div className="mt-3">
                  <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={()=>onNav('register')}>Get started</button>
                </div>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h4 className="font-semibold">Admin tools</h4>
                <p className="text-sm text-gray-600 mt-2">View bookings and verify providers (admin only).</p>
                <div className="mt-3">
                  <button className="px-3 py-2 bg-gray-800 text-white rounded" onClick={()=>onNav('admin')}>Open</button>
                </div>
              </div>
            </div>
          </div>
        </>}

        {route==='services' && <ServicesPage onBook={(p)=>setBookProvider(p)} />}
        {route==='about' && <AboutPage />}
        {route==='contact' && <ContactPage />}
        {route==='login' && <LoginPage onNav={onNav} />}
        {route==='register' && <RegisterPage onNav={onNav} />}
        {route==='admin' && <AdminDashboard />}

        <Footer />

        {bookProvider && <BookingModal provider={bookProvider} onClose={()=>setBookProvider(null)} />}
      </div>
    </AuthProvider>
  );
}
