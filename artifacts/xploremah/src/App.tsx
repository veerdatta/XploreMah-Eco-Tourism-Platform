import { type FormEvent, type ReactNode, createContext, useContext, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Binoculars,
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock3,
  Compass,
  Heart,
  History,
  Leaf,
  ListFilter,
  Map,
  MapPin,
  Menu,
  Minus,
  Mountain,
  Navigation,
  Plus,
  ReceiptText,
  Search,
  Send,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  TreePine,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/pages/not-found';
import { allExperiences, allRegions, allStayTypes, allTags, destinations, type Destination } from '@/data/destinations';

const queryClient = new QueryClient();

type Toast = { title: string; message: string } | null;
const ToastContext = createContext<{ toast: (title: string, message: string) => void }>({ toast: () => undefined });
const WishlistContext = createContext<{ wishlist: string[]; toggleWishlist: (id: string) => void }>({
  wishlist: [],
  toggleWishlist: () => undefined,
});

type CurrencyCode = 'INR' | 'EUR' | 'USD' | 'AUD';
const currencyMeta: Record<CurrencyCode, { label: string; rate: number; locale: string }> = {
  INR: { label: 'INR', rate: 1, locale: 'en-IN' },
  EUR: { label: 'EUR', rate: 0.011, locale: 'de-DE' },
  USD: { label: 'USD', rate: 0.012, locale: 'en-US' },
  AUD: { label: 'AUD', rate: 0.018, locale: 'en-AU' },
};

function formatMoney(amountInr: number, currency: CurrencyCode) {
  const meta = currencyMeta[currency];
  return new Intl.NumberFormat(meta.locale, {
    style: 'currency',
    currency: meta.label,
    maximumFractionDigits: currency === 'INR' ? 0 : 2,
  }).format(amountInr * meta.rate);
}

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatMoney: (amountInr: number) => string;
};
const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'INR',
  setCurrency: () => undefined,
  formatMoney: (amountInr) => formatMoney(amountInr, 'INR'),
});

type Booking = {
  id: string;
  destinationId: string;
  destinationName: string;
  host: string;
  guests: number;
  nights: number;
  addOns: string[];
  totalInr: number;
  createdAt: string;
  status: 'Requested';
};
const BookingContext = createContext<{ bookings: Booking[]; addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => void }>({
  bookings: [],
  addBooking: () => undefined,
});

function useAppToast() {
  return useContext(ToastContext);
}

function useWishlist() {
  return useContext(WishlistContext);
}

function useCurrency() {
  return useContext(CurrencyContext);
}

function useBookings() {
  return useContext(BookingContext);
}

function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('xploremah-wishlist') || '[]');
    } catch {
      return [];
    }
  });
  const [toastState, setToastState] = useState<Toast>(null);
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('xploremah-currency') as CurrencyCode | null;
    return saved && saved in currencyMeta ? saved : 'INR';
  });
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('xploremah-bookings') || '[]');
    } catch {
      return [];
    }
  });
  const toggleWishlist = (id: string) => {
    setWishlist((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem('xploremah-wishlist', JSON.stringify(next));
      return next;
    });
  };
  const toast = (title: string, message: string) => {
    setToastState({ title, message });
    window.setTimeout(() => setToastState(null), 4200);
  };
  const setCurrency = (next: CurrencyCode) => {
    setCurrencyState(next);
    localStorage.setItem('xploremah-currency', next);
  };
  const addBooking = (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    setBookings((current) => {
      const next = [{ ...booking, id: `booking-${Date.now()}`, createdAt: new Date().toISOString(), status: 'Requested' as const }, ...current];
      localStorage.setItem('xploremah-bookings', JSON.stringify(next));
      return next;
    });
  };
  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatMoney: (amountInr) => formatMoney(amountInr, currency) }}>
      <ToastContext.Provider value={{ toast }}>
        <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
          <BookingContext.Provider value={{ bookings, addBooking }}>
            <div className="min-h-[100dvh] bg-background text-foreground">
              <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} wishlistCount={wishlist.length} />
              <main>{children}</main>
              <Footer />
              {toastState && (
                <div className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-start gap-3 rounded-2xl border border-accent/30 bg-primary px-4 py-3 text-primary-foreground shadow-2xl animate-rise" role="status" data-testid="status-toast">
                  <div className="mt-0.5 rounded-full bg-accent p-1 text-primary"><Check size={14} strokeWidth={3} /></div>
                  <div className="min-w-0 flex-1"><p className="font-display text-sm font-bold">{toastState.title}</p><p className="mt-0.5 text-xs text-primary-foreground/70">{toastState.message}</p></div>
                  <button onClick={() => setToastState(null)} aria-label="Dismiss notification" data-testid="button-dismiss-toast"><X size={16} /></button>
                </div>
              )}
            </div>
          </BookingContext.Provider>
        </WishlistContext.Provider>
      </ToastContext.Provider>
    </CurrencyContext.Provider>
  );
}

function Header({ menuOpen, setMenuOpen, wishlistCount }: { menuOpen: boolean; setMenuOpen: (open: boolean) => void; wishlistCount: number }) {
  const [location] = useLocation();
  const { currency, setCurrency } = useCurrency();
  const { bookings } = useBookings();
  const nav = [
    { href: '/explore', label: 'Explore' },
    { href: '/impact', label: 'Our impact' },
    { href: '/economic-impact', label: 'Economic impact' },
    { href: '/host', label: 'Become a host' },
  ];
  return (
    <header className="relative z-30 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5" data-testid="link-logo">
          <span className="grid size-9 place-items-center rounded-full bg-primary text-accent transition-transform duration-300 group-hover:rotate-12"><Compass size={21} strokeWidth={2.5} /></span>
          <span className="font-display text-[19px] font-extrabold tracking-[-0.04em]">Xplore<span className="text-accent-foreground">Mah</span><span className="text-accent">.</span></span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={`text-sm font-medium transition-colors hover:text-primary ${location === item.href ? 'text-primary' : 'text-muted-foreground'}`} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}>{item.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <label className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-2 text-xs font-bold text-muted-foreground sm:flex" aria-label="Choose currency">
            <CircleDollarSign size={15} className="text-accent-foreground" />
            <select value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)} className="bg-transparent outline-none" data-testid="select-currency">
              {(Object.keys(currencyMeta) as CurrencyCode[]).map((code) => <option key={code} value={code}>{currencyMeta[code].label}</option>)}
            </select>
          </label>
          <Link href="/bookings" className="relative hidden rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary sm:block" aria-label="View booking history" data-testid="link-booking-history">
            <History size={19} />
            {bookings.length > 0 && <span className="absolute right-0 top-0 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-primary">{bookings.length}</span>}
          </Link>
          <Link href="/explore?wishlist=true" className="relative hidden rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary sm:block" aria-label="View wishlist" data-testid="link-wishlist">
            <Heart size={19} fill={wishlistCount > 0 ? 'currentColor' : 'none'} />
            {wishlistCount > 0 && <span className="absolute right-0 top-0 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-primary">{wishlistCount}</span>}
          </Link>
          <Link href="/explore" className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 sm:flex" data-testid="link-start-exploring">Start exploring <ArrowRight size={15} /></Link>
          <button className="rounded-full p-2.5 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" data-testid="button-menu"><Menu size={21} /></button>
        </div>
      </div>
      {menuOpen && <div className="absolute left-0 right-0 top-full border-b border-border bg-background px-5 py-4 shadow-lg md:hidden animate-drop">
        <nav className="mx-auto flex max-w-[1240px] flex-col gap-1" aria-label="Mobile navigation">
          {nav.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-secondary" data-testid={`link-mobile-${item.label.toLowerCase().replaceAll(' ', '-')}`}>{item.label}</Link>)}
          <Link href="/bookings" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-secondary" data-testid="link-mobile-booking-history">Booking history {bookings.length > 0 && `(${bookings.length})`}</Link>
          <label className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold">
            Currency
            <select value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)} className="rounded-lg border border-border bg-card px-2 py-1 text-xs outline-none" data-testid="select-mobile-currency">
              {(Object.keys(currencyMeta) as CurrencyCode[]).map((code) => <option key={code} value={code}>{currencyMeta[code].label}</option>)}
            </select>
          </label>
        </nav>
      </div>}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-accent text-primary"><Compass size={18} /></span><span className="font-display text-lg font-extrabold">XploreMah.</span></div><p className="mt-5 max-w-xs text-sm leading-6 text-primary-foreground/65">A slower way into Maharashtra. Stay local, tread lightly, leave a little more behind.</p></div>
        <div><p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-accent">Discover</p><div className="flex flex-col gap-3 text-sm text-primary-foreground/70"><Link href="/explore">All stays</Link><Link href="/explore?region=Konkan">Konkan coast</Link><Link href="/explore?region=Sahyadri">Sahyadri trails</Link></div></div>
        <div><p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-accent">XploreMah</p><div className="flex flex-col gap-3 text-sm text-primary-foreground/70"><Link href="/impact">Our impact</Link><Link href="/economic-impact">Economic impact</Link><Link href="/bookings">Booking history</Link><Link href="/host">Become a host</Link><Link href="/#journal">Field journal</Link></div></div>
        <div><p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-accent">A good question</p><p className="text-sm leading-6 text-primary-foreground/70">Is it a place you’d want to return to? We think that’s the right measure.</p></div>
      </div>
      <div className="mx-auto flex max-w-[1240px] flex-col gap-2 border-t border-primary-foreground/15 px-5 py-5 text-xs text-primary-foreground/45 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© 2024 XploreMah</span><span>Made for the places between the guidebook lines.</span></div>
    </footer>
  );
}

function DestinationCard({ destination, featured = false }: { destination: Destination; featured?: boolean }) {
  const { wishlist, toggleWishlist } = useWishlist();
  const { formatMoney } = useCurrency();
  const saved = wishlist.includes(destination.id);
  return (
    <article className={`group ${featured ? 'md:col-span-2' : ''}`} data-testid={`card-destination-${destination.id}`}>
      <div className={`relative overflow-hidden rounded-[1.35rem] bg-secondary ${featured ? 'aspect-[1.35/1] md:aspect-[2.1/1]' : 'aspect-[1.08/1]'}`}>
        <img src={destination.image} alt={`${destination.name} landscape`} className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/5 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5"><span className="rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary backdrop-blur">{destination.region}</span></div>
        <button onClick={() => toggleWishlist(destination.id)} className={`absolute right-4 top-4 rounded-full p-2.5 backdrop-blur transition ${saved ? 'bg-accent text-primary' : 'bg-background/80 text-primary hover:bg-accent'}`} aria-label={saved ? `Remove ${destination.name} from wishlist` : `Save ${destination.name} to wishlist`} data-testid={`button-wishlist-${destination.id}`}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button>
        <div className="absolute inset-x-4 bottom-4 text-primary-foreground"><div className="flex items-end justify-between gap-3"><div><h3 className="font-display text-xl font-bold leading-tight tracking-[-0.03em] md:text-2xl">{destination.name}</h3><p className="mt-1 text-xs text-primary-foreground/75">{destination.district} · hosted by {destination.host}</p></div><div className="flex shrink-0 items-center gap-1 rounded-full bg-primary/70 px-2 py-1 text-xs backdrop-blur"><Star size={12} fill="currentColor" className="text-accent" /> {destination.score}</div></div></div>
      </div>
       <div className="flex items-center justify-between gap-3 px-1 pt-3"><div className="flex flex-wrap gap-1.5">{destination.tags.slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">{tag}</span>)}</div><div className="shrink-0 text-right"><p className="text-sm font-bold text-primary">{formatMoney(destination.price)} <span className="text-[10px] font-normal text-muted-foreground">/ night</span></p><Link href={`/destination/${destination.id}`} className="mt-1 flex items-center justify-end gap-1 text-xs font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100" data-testid={`link-destination-${destination.id}`}>View stay <ArrowUpRightIcon /></Link></div></div>
    </article>
  );
}

function ArrowUpRightIcon() {
  return <ArrowRight size={14} className="-rotate-45" />;
}

function Home() {
  const featured = [destinations[0], destinations[2], destinations[6]];
  const { formatMoney } = useCurrency();
  return (
    <>
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 82% 18%, hsl(44 92% 54% / .35), transparent 29%), radial-gradient(circle at 10% 90%, hsl(97 22% 46% / .35), transparent 30%)' }} />
          <div className="relative mx-auto grid min-h-[610px] max-w-[1240px] items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20">
           <div className="animate-rise"><p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-accent"><span className="h-px w-7 bg-accent" /> Maharashtra, off the map</p><h1 className="max-w-3xl font-display text-5xl font-extrabold leading-[.98] tracking-[-0.065em] sm:text-6xl lg:text-[5.7rem]">Go where the<br /><span className="text-accent">road gets quiet.</span></h1><p className="mt-7 max-w-md text-base leading-7 text-primary-foreground/70">Thoughtful stays in the Maharashtra you haven’t met yet. Hosted by people who know every bend, bird call and family recipe.</p><div className="mt-9 flex flex-wrap items-center gap-3"><Link href="/explore" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3.5 text-sm font-bold text-primary transition hover:-translate-y-1 hover:bg-accent/90" data-testid="link-hero-explore">Find your next nowhere <ArrowRight size={17} /></Link><Link href="/impact" className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-5 py-3.5 text-sm font-semibold transition hover:border-accent hover:text-accent" data-testid="link-hero-impact">Our impact</Link><Link href="/economic-impact" className="inline-flex items-center gap-2 rounded-full border border-accent/40 px-5 py-3.5 text-sm font-semibold text-accent transition hover:bg-accent hover:text-primary" data-testid="link-hero-economic-impact">Economic impact <ArrowRight size={16} /></Link></div></div>
          <div className="relative mx-auto w-full max-w-[500px] animate-fade-in lg:justify-self-end"><div className="relative aspect-[.84/1] overflow-hidden rounded-[2rem] border border-primary-foreground/15 bg-secondary/20 p-2 shadow-2xl rotate-2 transition-transform duration-700 hover:rotate-0"><img src={destinations[2].image} alt="Tarkarli backwaters at golden hour" className="size-full rounded-[1.5rem] object-cover" /><div className="absolute inset-x-6 bottom-6 rounded-2xl border border-background/20 bg-primary/70 p-4 backdrop-blur-md"><div className="flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-[.18em] text-accent">From the field notes</p><p className="mt-1 font-display text-lg font-bold">Tarkarli, before the boats</p></div><span className="rounded-full bg-accent px-2 py-1 text-[10px] font-bold text-primary">01 / 08</span></div></div></div><div className="absolute -bottom-5 -left-6 grid size-24 place-items-center rounded-full border border-accent/50 bg-primary text-center text-[10px] font-bold uppercase leading-4 tracking-wider text-accent"><span>Stay<br />local<br /><span className="text-primary-foreground/50">travel</span><br />lightly</span></div></div>
        </div>
        <div className="relative mx-auto flex max-w-[1240px] items-center gap-4 px-5 pb-6 text-xs text-primary-foreground/40 lg:px-8"><div className="h-px flex-1 bg-primary-foreground/15" /><span>scroll to wander</span><ArrowDownUp size={14} className="rotate-180" /></div>
      </section>
      <section className="mx-auto max-w-[1240px] px-5 py-20 lg:px-8 lg:py-28" id="journal"><div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr]"><div><p className="eyebrow">A different kind of guide</p><h2 className="mt-4 max-w-sm font-display text-4xl font-extrabold leading-[1.02] tracking-[-.055em] md:text-5xl">Less checklist.<br /><span className="text-accent-foreground">More connection.</span></h2></div><div className="max-w-2xl"><p className="text-xl leading-8 text-foreground/80">We find small, good places and make it easy to reach them. Your booking goes straight to local hosts, while a quiet share goes back into the village around them.</p><div className="mt-9 grid gap-7 border-t border-border pt-7 sm:grid-cols-3"><div><span className="font-display text-3xl font-extrabold text-primary">08</span><p className="mt-1 text-xs leading-5 text-muted-foreground">carefully chosen places</p></div><div><span className="font-display text-3xl font-extrabold text-primary">72%</span><p className="mt-1 text-xs leading-5 text-muted-foreground">of your stay kept local</p></div><div><span className="font-display text-3xl font-extrabold text-primary">1,240</span><p className="mt-1 text-xs leading-5 text-muted-foreground">trees supported this year</p></div></div></div></div></section>
      <section className="mx-auto max-w-[1240px] px-5 lg:px-8"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="eyebrow">The short list</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-.04em] md:text-4xl">Places worth the detour</h2></div><Link href="/explore" className="hidden items-center gap-2 text-sm font-bold text-primary sm:flex" data-testid="link-view-all">See all eight <ArrowRight size={16} /></Link></div><div className="grid gap-7 md:grid-cols-2"><DestinationCard destination={featured[0]} featured /><DestinationCard destination={featured[1]} /><DestinationCard destination={featured[2]} /></div><Link href="/explore" className="mt-7 flex items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-bold sm:hidden" data-testid="link-view-all-mobile">See all destinations <ArrowRight size={16} /></Link></section>
       <section className="mx-auto mt-24 max-w-[1240px] px-5 lg:px-8"><div className="overflow-hidden rounded-[1.8rem] bg-secondary p-7 md:p-12"><div className="grid items-center gap-10 md:grid-cols-[1fr_auto]"><div><p className="eyebrow">The XploreMah promise</p><h2 className="mt-4 max-w-xl font-display text-3xl font-extrabold leading-tight tracking-[-.045em] md:text-4xl">Come back with a story,<br /><span className="text-accent-foreground">not just a photo.</span></h2><p className="mt-5 max-w-lg text-sm leading-6 text-muted-foreground">Every stay is a small exchange: your curiosity, their welcome, and a little more reason for the next generation to stay close to home.</p><Link href="/impact" className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="link-promise-impact">How it works <ArrowRight size={15} /></Link></div><div className="grid size-44 shrink-0 place-items-center rounded-full border border-primary/20 bg-background/50 text-center md:size-52"><div><Leaf size={30} className="mx-auto mb-2 text-primary" /><p className="font-display text-3xl font-extrabold text-primary">{formatMoney(1860000)}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">shared locally</p></div></div></div></div></section>
    </>
  );
}

function FilterPanel({ region, setRegion, activeTag, setActiveTag, priceMin, setPriceMin, priceMax, setPriceMax, stayTypes, setStayTypes, experienceFilters, setExperienceFilters, clear }: { region: string; setRegion: (value: string) => void; activeTag: string; setActiveTag: (value: string) => void; priceMin: number; setPriceMin: (value: number) => void; priceMax: number; setPriceMax: (value: number) => void; stayTypes: string[]; setStayTypes: (value: string[]) => void; experienceFilters: string[]; setExperienceFilters: (value: string[]) => void; clear: () => void }) {
  const { formatMoney } = useCurrency();
  const toggleValue = (values: string[], value: string) => values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
  return <div className="space-y-7"><div className="flex items-center justify-between"><p className="font-display text-base font-bold">Refine the trail</p><button className="text-xs font-semibold text-muted-foreground hover:text-primary" onClick={clear} data-testid="button-clear-filters">Clear all</button></div><div><label className="mb-3 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Region</label><div className="flex flex-wrap gap-2"><button onClick={() => setRegion('all')} className={`filter-pill ${region === 'all' ? 'active' : ''}`} data-testid="filter-region-all">Everywhere</button>{allRegions.map((item) => <button key={item} onClick={() => setRegion(item)} className={`filter-pill ${region === item ? 'active' : ''}`} data-testid={`filter-region-${item}`}>{item}</button>)}</div></div><div><label className="mb-3 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Find your feeling</label><div className="flex flex-wrap gap-2">{allTags.slice(0, 8).map((item) => <button key={item} onClick={() => setActiveTag(activeTag === item ? 'all' : item)} className={`filter-pill ${activeTag === item ? 'active' : ''}`} data-testid={`filter-tag-${item.toLowerCase().replaceAll(' ', '-')}`}>{item}</button>)}</div></div><div><label className="mb-3 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Stay type</label><div className="flex flex-wrap gap-2">{allStayTypes.map((item) => <button key={item} onClick={() => setStayTypes(toggleValue(stayTypes, item))} className={`filter-pill ${stayTypes.includes(item) ? 'active' : ''}`} data-testid={`filter-stay-${item.toLowerCase().replaceAll(' ', '-')}`}>{item}</button>)}</div></div><div><label className="mb-3 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Add-on experiences</label><div className="flex flex-wrap gap-2">{allExperiences.map((item) => <button key={item} onClick={() => setExperienceFilters(toggleValue(experienceFilters, item))} className={`filter-pill ${experienceFilters.includes(item) ? 'active' : ''}`} data-testid={`filter-experience-${item.toLowerCase().replaceAll(' ', '-')}`}>{item}</button>)}</div></div><div><div className="mb-3 flex items-center justify-between"><label htmlFor="price-min-filter" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nightly budget</label><span className="text-xs font-bold text-primary">{formatMoney(priceMin)} – {formatMoney(priceMax)}</span></div><div className="relative h-7"><div className="absolute left-0 right-0 top-3 h-1 rounded-full bg-secondary"><div className="absolute h-1 rounded-full bg-primary" style={{ left: `${((priceMin - 1000) / 4500) * 100}%`, right: `${100 - ((priceMax - 1000) / 4500) * 100}%` }} /></div><input id="price-min-filter" type="range" min="1000" max="5500" step="100" value={priceMin} onChange={(event) => setPriceMin(Math.min(Number(event.target.value), priceMax - 100))} className="pointer-events-none absolute inset-0 w-full appearance-none bg-transparent accent-[hsl(var(--primary))] [&::-webkit-slider-thumb]:pointer-events-auto" aria-label="Minimum nightly price" data-testid="input-price-min-filter" /><input id="price-max-filter" type="range" min="1000" max="5500" step="100" value={priceMax} onChange={(event) => setPriceMax(Math.max(Number(event.target.value), priceMin + 100))} className="pointer-events-none absolute inset-0 w-full appearance-none bg-transparent accent-[hsl(var(--primary))] [&::-webkit-slider-thumb]:pointer-events-auto" aria-label="Maximum nightly price" data-testid="input-price-max-filter" /></div><div className="mt-1 flex justify-between text-[10px] text-muted-foreground"><span>{formatMoney(1000)}</span><span>{formatMoney(5500)}+</span></div></div></div>;
}

function Explore() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');
  const [activeTag, setActiveTag] = useState('all');
  const [stayTypes, setStayTypes] = useState<string[]>([]);
  const [experienceFilters, setExperienceFilters] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(1000);
  const [priceMax, setPriceMax] = useState(5500);
  const [sort, setSort] = useState('recommended');
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [location] = useLocation();
  const wishlistOnly = new URLSearchParams(location.split('?')[1] || '').get('wishlist') === 'true';
  const { wishlist } = useWishlist();
  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    const list = destinations.filter((item) => (!query || `${item.name} ${item.region} ${item.district} ${item.tags.join(' ')} ${item.stayType} ${item.experiences.join(' ')}`.toLowerCase().includes(query)) && (region === 'all' || item.region === region) && (activeTag === 'all' || item.tags.includes(activeTag)) && item.price >= priceMin && item.price <= priceMax && (stayTypes.length === 0 || stayTypes.includes(item.stayType)) && (experienceFilters.length === 0 || experienceFilters.some((experience) => item.experiences.includes(experience))) && (!wishlistOnly || wishlist.includes(item.id)));
    return [...list].sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'rating' ? b.score - a.score : b.visitors - a.visitors);
  }, [search, region, activeTag, stayTypes, experienceFilters, priceMin, priceMax, sort, wishlistOnly, wishlist]);
  const clear = () => { setSearch(''); setRegion('all'); setActiveTag('all'); setStayTypes([]); setExperienceFilters([]); setPriceMin(1000); setPriceMax(5500); };
  return <div className="mx-auto max-w-[1240px] px-5 py-10 lg:px-8 lg:py-14"><div className="max-w-2xl animate-rise"><p className="eyebrow">The field guide</p><h1 className="mt-3 font-display text-4xl font-extrabold tracking-[-.055em] md:text-6xl">Start somewhere<br /><span className="text-accent-foreground">unexpected.</span></h1><p className="mt-5 max-w-lg text-sm leading-6 text-muted-foreground">Eight stays, spread across the state. Search by mood, region, stay type, or the kind of morning you want to have.</p></div><div className="mt-10 flex flex-col gap-3 border-y border-border py-4 md:flex-row md:items-center"><div className="relative flex-1"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm outline-none transition focus:border-primary" placeholder="Try “rainforest”, “birding” or “Konkan”" aria-label="Search destinations" data-testid="input-search-destinations" /></div><div className="flex gap-2"><button onClick={() => setFiltersOpen(!filtersOpen)} className={`inline-flex h-12 items-center justify-center gap-2 rounded-full border px-4 text-sm font-bold transition md:hidden ${filtersOpen ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card'}`} data-testid="button-mobile-filters"><SlidersHorizontal size={16} /> Filters</button><div className="relative"><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-12 appearance-none rounded-full border border-border bg-card py-0 pl-4 pr-10 text-sm font-semibold outline-none" aria-label="Sort destinations" data-testid="select-sort"><option value="recommended">Recommended</option><option value="rating">Highest rated</option><option value="price-low">Price: low to high</option></select><ArrowDownUp size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" /></div><div className="hidden items-center rounded-full border border-border bg-card p-1 sm:flex"><button onClick={() => setView('grid')} className={`rounded-full p-2 ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`} aria-label="Grid view" data-testid="button-grid-view"><ListFilter size={16} /></button><button onClick={() => setView('map')} className={`rounded-full p-2 ${view === 'map' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`} aria-label="Map view" data-testid="button-map-view"><Map size={16} /></button></div></div></div><div className="mb-6 flex flex-wrap gap-2">{region !== 'all' && <button onClick={() => setRegion('all')} className="filter-pill active">{region} <X size={12} /></button>}{activeTag !== 'all' && <button onClick={() => setActiveTag('all')} className="filter-pill active">{activeTag} <X size={12} /></button>}{stayTypes.map((item) => <button key={item} onClick={() => setStayTypes(stayTypes.filter((value) => value !== item))} className="filter-pill active">{item} <X size={12} /></button>)}{experienceFilters.map((item) => <button key={item} onClick={() => setExperienceFilters(experienceFilters.filter((value) => value !== item))} className="filter-pill active">{item} <X size={12} /></button>)}{(priceMin > 1000 || priceMax < 5500) && <button onClick={() => { setPriceMin(1000); setPriceMax(5500); }} className="filter-pill active">Budget <X size={12} /></button>}</div><div className="grid gap-10 lg:grid-cols-[250px_1fr]"><aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}><FilterPanel {...{ region, setRegion, activeTag, setActiveTag, priceMin, setPriceMin, priceMax, setPriceMax, stayTypes, setStayTypes, experienceFilters, setExperienceFilters, clear }} /></aside><section><div className="mb-5 flex items-center justify-between"><p className="text-sm text-muted-foreground"><span className="font-bold text-foreground">{filtered.length}</span> places to wander</p>{wishlistOnly && <Link href="/explore" className="flex items-center gap-1 text-xs font-bold text-primary" data-testid="link-clear-wishlist">Showing saved only <X size={13} /></Link>}</div>{view === 'map' ? <MapView results={filtered} /> : filtered.length > 0 ? <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2">{filtered.map((destination, index) => <div key={destination.id} className="animate-rise" style={{ animationDelay: `${index * 60}ms` }}><DestinationCard destination={destination} /></div>)}</div> : <div className="rounded-[1.5rem] border border-dashed border-border bg-card p-12 text-center"><Compass size={28} className="mx-auto text-accent-foreground" /><h3 className="mt-4 font-display text-xl font-bold">No trail matches that brief</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Try opening the map, clearing one filter, or searching for a slower kind of morning.</p><button onClick={clear} className="mt-5 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground" data-testid="button-empty-clear">Clear filters</button></div>}</section></div></div>;
}

function MapView({ results }: { results: Destination[] }) {
  return <div className="relative min-h-[560px] overflow-hidden rounded-[1.5rem] border border-border bg-[#d9d1bc]" data-testid="map-view"><div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'linear-gradient(28deg, transparent 48%, #b8ad93 49%, transparent 50%), linear-gradient(112deg, transparent 48%, #b8ad93 49%, transparent 50%), radial-gradient(ellipse at 70% 20%, #b9c5a0 0 18%, transparent 19%), radial-gradient(ellipse at 25% 70%, #c2bd98 0 22%, transparent 23%)', backgroundSize: '150px 120px, 220px 180px, auto, auto' }} /><div className="absolute left-5 top-5 rounded-xl border border-primary/10 bg-background/90 p-3 shadow-lg backdrop-blur"><p className="text-xs font-bold text-primary">Maharashtra, in small pieces</p><p className="mt-1 text-[10px] text-muted-foreground">{results.length} stays shown</p></div>{results.map((item, index) => <Link key={item.id} href={`/destination/${item.id}`} className="absolute group" style={{ left: `${16 + ((index * 31) % 68)}%`, top: `${17 + ((index * 23) % 63)}%` }} data-testid={`map-pin-${item.id}`}><span className="block rounded-full border-2 border-background bg-primary p-2 text-accent shadow-lg transition group-hover:scale-125"><MapPin size={15} fill="currentColor" /></span><span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground opacity-0 transition group-hover:opacity-100">{item.shortName}</span></Link>)}</div>;
}

function BookingBox({ destination }: { destination: Destination }) {
  const { toast } = useAppToast();
  const { formatMoney } = useCurrency();
  const { addBooking } = useBookings();
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [pledgeOpen, setPledgeOpen] = useState(false);
  const addOnOptions = [{ id: 'guide', label: 'Local naturalist walk', price: 650, icon: Binoculars }, { id: 'meal', label: 'Seasonal home dinner', price: 900, icon: Utensils }, { id: 'transfer', label: 'Village transfer', price: 1100, icon: Navigation }];
  const totalInr = destination.price * nights * guests + addOns.reduce((sum, id) => sum + (addOnOptions.find((item) => item.id === id)?.price || 0), 0);
  const toggleAddOn = (id: string) => setAddOns((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const confirm = () => {
    addBooking({ destinationId: destination.id, destinationName: destination.name, host: destination.host, guests, nights, addOns, totalInr });
    setPledgeOpen(false);
    toast('Your trail is held.', `A note for ${destination.host} is ready. We’ll send the details shortly.`);
  };
  return <><div className="rounded-[1.4rem] border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex items-end justify-between border-b border-border pb-5"><div><span className="text-xs text-muted-foreground">From</span><p className="mt-1 font-display text-2xl font-extrabold">{formatMoney(destination.price)}<span className="text-sm font-medium text-muted-foreground"> / night</span></p></div><div className="flex items-center gap-1 text-sm font-bold"><Star size={15} fill="currentColor" className="text-accent-foreground" /> {destination.score} <span className="font-normal text-muted-foreground">({destination.visitors.toLocaleString('en-IN')})</span></div></div><div className="grid grid-cols-2 gap-3 border-b border-border py-5"><label className="text-xs font-bold text-muted-foreground">Nights<div className="mt-2 flex h-10 items-center justify-between rounded-lg border border-border px-2"><button onClick={() => setNights(Math.max(1, nights - 1))} className="rounded p-1 hover:bg-secondary" aria-label="Decrease nights" data-testid="button-decrease-nights"><Minus size={14} /></button><span className="text-sm font-bold" data-testid="text-nights">{nights}</span><button onClick={() => setNights(nights + 1)} className="rounded p-1 hover:bg-secondary" aria-label="Increase nights" data-testid="button-increase-nights"><Plus size={14} /></button></div></label><label className="text-xs font-bold text-muted-foreground">Guests<div className="mt-2 flex h-10 items-center justify-between rounded-lg border border-border px-2"><button onClick={() => setGuests(Math.max(1, guests - 1))} className="rounded p-1 hover:bg-secondary" aria-label="Decrease guests" data-testid="button-decrease-guests"><Minus size={14} /></button><span className="text-sm font-bold" data-testid="text-guests">{guests}</span><button onClick={() => setGuests(Math.min(destination.capacity, guests + 1))} className="rounded p-1 hover:bg-secondary" aria-label="Increase guests" data-testid="button-increase-guests"><Plus size={14} /></button></div></label></div><div className="space-y-2.5 border-b border-border py-5"><p className="text-xs font-bold text-muted-foreground">Make it yours</p>{addOnOptions.map(({ id, label, price, icon: Icon }) => <button key={id} onClick={() => toggleAddOn(id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${addOns.includes(id) ? 'border-primary bg-secondary' : 'border-border hover:border-primary/40'}`} data-testid={`button-addon-${id}`}><span className={`grid size-8 place-items-center rounded-lg ${addOns.includes(id) ? 'bg-accent text-primary' : 'bg-secondary text-primary'}`}><Icon size={15} /></span><span className="flex-1 text-xs font-semibold">{label}</span><span className="text-xs text-muted-foreground">+{formatMoney(price)}</span>{addOns.includes(id) && <Check size={14} className="text-primary" />}</button>)}</div><div className="flex items-center justify-between py-5"><span className="text-sm font-bold">Estimated total</span><span className="font-display text-2xl font-extrabold text-primary" data-testid="text-booking-total">{formatMoney(totalInr)}</span></div><button onClick={() => setPledgeOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90" data-testid="button-pledge-booking">Pledge this stay <ArrowRight size={16} /></button><p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground"><ShieldCheck size={13} /> No payment today · confirm directly with your host</p></div><div className="mt-4 rounded-xl bg-secondary p-4 text-xs leading-5 text-muted-foreground"><p className="flex items-center gap-2 font-bold text-foreground"><BadgeCheck size={15} className="text-accent-foreground" /> Your booking backs this place</p><p className="mt-1.5">A share of every stay funds a locally chosen project.</p></div>{pledgeOpen && <PledgeModal destination={destination} guests={guests} nights={nights} totalInr={totalInr} onClose={() => setPledgeOpen(false)} onConfirm={confirm} />}</>;
}

function PledgeModal({ destination, guests, nights, totalInr, onClose, onConfirm }: { destination: Destination; guests: number; nights: number; totalInr: number; onClose: () => void; onConfirm: () => void }) {
  const { formatMoney } = useCurrency();
  return <div className="fixed inset-0 z-50 grid place-items-center bg-primary/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="pledge-title" data-testid="modal-pledge"><div className="relative w-full max-w-md rounded-[1.5rem] bg-background p-6 shadow-2xl md:p-8"><button onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 hover:bg-secondary" aria-label="Close booking modal" data-testid="button-close-pledge"><X size={18} /></button><span className="grid size-11 place-items-center rounded-full bg-accent text-primary"><Sparkles size={20} /></span><p className="eyebrow mt-6">One good thing leads to another</p><h2 id="pledge-title" className="mt-2 font-display text-2xl font-extrabold tracking-[-.04em]">Pledge {destination.shortName}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">You’re requesting {nights} nights for {guests} {guests === 1 ? 'guest' : 'guests'} with {destination.host}. This is a soft hold; the host will confirm the details with you.</p><div className="my-6 rounded-xl bg-secondary p-4"><div className="flex justify-between text-sm"><span>Estimated stay</span><span className="font-bold">{formatMoney(totalInr)}</span></div><div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>Local share included</span><span className="font-bold text-primary">{formatMoney(Math.round(totalInr * .72))}</span></div></div><button onClick={onConfirm} className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90" data-testid="button-confirm-pledge">Send stay request</button><p className="mt-3 text-center text-[10px] text-muted-foreground">No card details needed. Your host replies within a day.</p></div></div>;
}

function DestinationPage() {
  const params = useParams<{ id: string }>();
  const destination = destinations.find((item) => item.id === params.id);
  const [activeImage, setActiveImage] = useState(0);
  const { wishlist, toggleWishlist } = useWishlist();
  const { toast } = useAppToast();
  const { formatMoney } = useCurrency();
  if (!destination) return <NotFound />;
  const saved = wishlist.includes(destination.id);
  return <div><div className="mx-auto max-w-[1240px] px-5 pt-5 lg:px-8"><Link href="/explore" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary" data-testid="link-back-explore"><ArrowLeft size={15} /> All stays</Link><div className="mt-5 grid gap-2 md:grid-cols-[1.4fr_.8fr] md:grid-rows-2 md:h-[510px]"><div className="relative min-h-[330px] overflow-hidden rounded-[1.4rem] md:row-span-2"><img src={destination.gallery[activeImage]} alt={`${destination.name} gallery image ${activeImage + 1}`} className="size-full object-cover" /><div className="absolute inset-x-4 bottom-4 flex gap-2">{destination.gallery.map((image, index) => <button key={image} onClick={() => setActiveImage(index)} className={`h-14 w-20 overflow-hidden rounded-lg border-2 transition ${activeImage === index ? 'border-accent' : 'border-background/40 opacity-75'}`} aria-label={`View image ${index + 1}`} data-testid={`button-gallery-${index}`}><img src={image} alt="" className="size-full object-cover" /></button>)}</div></div><div className="hidden overflow-hidden rounded-[1.4rem] md:block"><img src={destination.gallery[1]} alt="" className="size-full object-cover" /></div><div className="hidden overflow-hidden rounded-[1.4rem] md:block"><img src={destination.gallery[2]} alt="" className="size-full object-cover" /></div></div><div className="grid gap-10 pb-16 pt-9 lg:grid-cols-[1fr_390px]"><div><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">{destination.region} · {destination.district}</p><h1 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-[-.06em] md:text-6xl">{destination.name}</h1><p className="mt-3 text-sm text-muted-foreground">Hosted by <span className="font-semibold text-foreground">{destination.host}</span> · {destination.stay}</p></div><div className="flex gap-2"><button onClick={() => toggleWishlist(destination.id)} className={`grid size-11 place-items-center rounded-full border transition ${saved ? 'border-accent bg-accent text-primary' : 'border-border hover:border-primary'}`} aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'} data-testid="button-detail-wishlist"><Heart size={18} fill={saved ? 'currentColor' : 'none'} /></button><button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast('Link copied.', 'Send this little corner of Maharashtra to someone you love.'); }} className="grid size-11 place-items-center rounded-full border border-border hover:border-primary" aria-label="Share destination" data-testid="button-share-destination"><Share2 size={17} /></button></div></div><p className="mt-8 max-w-2xl text-lg leading-8 text-foreground/80">{destination.story}</p><div className="mt-9 flex flex-wrap gap-2">{destination.tags.map((tag) => <span key={tag} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground">{tag}</span>)}</div><div className="mt-12 grid gap-5 border-y border-border py-7 sm:grid-cols-3"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-secondary text-primary"><MapPin size={17} /></span><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Where</p><p className="mt-1 text-sm font-bold">{destination.district}, Maharashtra</p></div></div><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-secondary text-primary"><Users size={17} /></span><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sleeps</p><p className="mt-1 text-sm font-bold">Up to {destination.capacity} guests</p></div></div><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-secondary text-primary"><Mountain size={17} /></span><div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Best for</p><p className="mt-1 text-sm font-bold">{destination.bestFor.split(',')[0]}</p></div></div></div><div className="mt-10 rounded-[1.3rem] bg-secondary p-6 md:p-8"><p className="eyebrow">A note from {destination.host.split(' ')[0]}</p><p className="mt-3 max-w-xl font-display text-xl font-bold leading-8 tracking-[-.03em]">“Leave a little time for doing nothing. That’s when the hills usually say hello.”</p><div className="mt-5 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-bold text-accent">{destination.host.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span className="text-xs font-semibold text-muted-foreground">Your local host · XploreMah verified</span></div></div></div><aside className="lg:pt-1"><div className="lg:sticky lg:top-24"><BookingBox destination={destination} /></div></aside></div></div><div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-3 shadow-2xl backdrop-blur lg:hidden"><div className="mx-auto flex max-w-xl items-center gap-3"><div className="flex-1"><p className="text-[10px] text-muted-foreground">From</p><p className="font-display text-lg font-extrabold">{formatMoney(destination.price)} <span className="text-xs font-normal text-muted-foreground">/ night</span></p></div><a href="#top" className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" onClick={(event) => { event.preventDefault(); document.querySelector('[data-testid="button-pledge-booking"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} data-testid="button-mobile-book">Book this stay</a></div></div></div>;
}

function Host() {
  const { toast } = useAppToast();
  const [form, setForm] = useState({ name: '', email: '', place: '', region: '', story: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const update = (field: keyof typeof form, value: string) => { setForm((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: '' })); };
  const submit = (event: FormEvent) => { event.preventDefault(); const next: Record<string, string> = {}; if (form.name.trim().length < 3) next.name = 'Tell us your full name'; if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email'; if (form.place.trim().length < 3) next.place = 'Add the name of your place'; if (!form.region) next.region = 'Choose a region'; if (form.story.trim().length < 30) next.story = 'Share a little more — at least 30 characters'; setErrors(next); if (Object.keys(next).length === 0) { setSubmitted(true); toast('Your story is on its way.', 'Our local team will be in touch within three days.'); } };
  return <div><section className="bg-primary text-primary-foreground"><div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[1fr_.8fr] lg:items-end lg:px-8 lg:py-24"><div><p className="eyebrow text-accent">For the people who know the way</p><h1 className="mt-4 max-w-2xl font-display text-5xl font-extrabold leading-[.98] tracking-[-.06em] md:text-7xl">Your place<br /><span className="text-accent">has a story.</span></h1></div><p className="max-w-sm text-sm leading-7 text-primary-foreground/70 lg:pb-2">XploreMah helps thoughtful travelers find your corner of Maharashtra — on your terms, at your pace.</p></div></section><div className="mx-auto grid max-w-[1240px] gap-14 px-5 py-16 lg:grid-cols-[.75fr_1fr] lg:px-8 lg:py-24"><div><p className="eyebrow">Before you begin</p><h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-[-.05em]">Good hosting starts<br />with being yourself.</h2><p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">We are not looking for polished resorts. We are looking for the family kitchen, the trail you walk every Sunday, the view you never got tired of.</p><div className="mt-9 space-y-5"><div className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-primary"><Check size={15} strokeWidth={3} /></span><div><p className="text-sm font-bold">Keep it local</p><p className="mt-1 text-xs leading-5 text-muted-foreground">You set the rhythm and welcome guests in a way that feels right.</p></div></div><div className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-primary"><Check size={15} strokeWidth={3} /></span><div><p className="text-sm font-bold">Keep more</p><p className="mt-1 text-xs leading-5 text-muted-foreground">You choose your price. We keep our commission intentionally small.</p></div></div><div className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-primary"><Check size={15} strokeWidth={3} /></span><div><p className="text-sm font-bold">Keep the place well</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Every stay includes a contribution to a project chosen by your village.</p></div></div></div></div>{submitted ? <div className="rounded-[1.5rem] bg-secondary p-8 md:p-10"><span className="grid size-12 place-items-center rounded-full bg-accent text-primary"><Check size={24} strokeWidth={3} /></span><h2 className="mt-6 font-display text-3xl font-extrabold tracking-[-.04em]">We’ll come say hello.</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">Thank you, {form.name.split(' ')[0]}. Your place sounds like exactly the kind of find we built XploreMah for. Keep an eye on {form.email}.</p><button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', place: '', region: '', story: '' }); }} className="mt-7 rounded-full border border-border px-5 py-3 text-sm font-bold" data-testid="button-submit-another">Share another place</button></div> : <form onSubmit={submit} className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm md:p-9" noValidate><p className="font-display text-xl font-bold">Tell us about your place</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Five minutes now. A thoughtful conversation next.</p><div className="mt-7 grid gap-5 sm:grid-cols-2"><Field label="Your name" value={form.name} onChange={(value) => update('name', value)} error={errors.name} placeholder="e.g. Madhuri Shinde" id="host-name" /><Field label="Email address" type="email" value={form.email} onChange={(value) => update('email', value)} error={errors.email} placeholder="you@example.com" id="host-email" /><Field label="Name of your place" value={form.place} onChange={(value) => update('place', value)} error={errors.place} placeholder="e.g. The old mango orchard" id="host-place" /><label className="text-xs font-bold text-muted-foreground">Region<select value={form.region} onChange={(event) => update('region', event.target.value)} className={`mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm font-medium outline-none focus:border-primary ${errors.region ? 'border-destructive' : 'border-border'}`} data-testid="select-host-region"><option value="">Choose one</option>{allRegions.map((item) => <option key={item} value={item}>{item}</option>)}</select>{errors.region && <span className="mt-1 block text-[10px] font-medium text-destructive">{errors.region}</span>}</label><label className="text-xs font-bold text-muted-foreground sm:col-span-2">What should a guest know? <textarea value={form.story} onChange={(event) => update('story', event.target.value)} rows={5} className={`mt-2 w-full resize-none rounded-lg border bg-background p-3 text-sm font-medium outline-none focus:border-primary ${errors.story ? 'border-destructive' : 'border-border'}`} placeholder="The view, the food, the walk, or the reason you stayed..." data-testid="textarea-host-story" />{errors.story && <span className="mt-1 block text-[10px] font-medium text-destructive">{errors.story}</span>}</label></div><button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90" data-testid="button-submit-host">Send my story <Send size={15} /></button></form>}</div></div>;
}

function Field({ label, value, onChange, error, placeholder, id, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; error?: string; placeholder: string; id: string; type?: string }) {
  return <label className="text-xs font-bold text-muted-foreground">{label}<input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm font-medium outline-none placeholder:text-muted-foreground/55 focus:border-primary ${error ? 'border-destructive' : 'border-border'}`} data-testid={`input-${id}`} />{error && <span className="mt-1 block text-[10px] font-medium text-destructive">{error}</span>}</label>;
}

function Impact() {
  const { formatMoney } = useCurrency();
  const [year, setYear] = useState<'2025' | '2026'>('2026');
  const metrics = year === '2026'
    ? [{ value: formatMoney(1860000), label: 'shared with host communities', change: '+34%' }, { value: '1,240', label: 'native trees supported', change: '+280' }, { value: '72%', label: 'of each stay kept locally', change: 'steady' }]
    : [{ value: formatMoney(1390000), label: 'shared with host communities', change: '+28%' }, { value: '960', label: 'native trees supported', change: '+210' }, { value: '69%', label: 'of each stay kept locally', change: 'steady' }];
  return <div><section className="border-b border-border bg-secondary"><div className="mx-auto flex max-w-[1240px] flex-col gap-8 px-5 py-14 md:flex-row md:items-end md:justify-between lg:px-8 lg:py-20"><div><p className="eyebrow">The good trail</p><h1 className="mt-4 font-display text-5xl font-extrabold tracking-[-.065em] md:text-7xl">Travel that<br /><span className="text-accent-foreground">stays close.</span></h1><p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">We measure what matters after checkout: who benefits, what gets protected, and whether the welcome still feels human.</p></div><div className="flex items-center gap-2 rounded-full border border-border bg-background p-1"><button onClick={() => setYear('2025')} className={`rounded-full px-4 py-2 text-xs font-bold ${year === '2025' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`} data-testid="button-impact-2025">2025</button><button onClick={() => setYear('2026')} className={`rounded-full px-4 py-2 text-xs font-bold ${year === '2026' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`} data-testid="button-impact-2026">2026</button></div></div></section><div className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8 lg:py-20"><div className="grid gap-4 md:grid-cols-3">{metrics.map((metric) => <div key={metric.label} className="rounded-[1.3rem] border border-border bg-card p-6"><p className="font-display text-4xl font-extrabold tracking-[-.05em] text-primary">{metric.value}</p><p className="mt-3 max-w-[160px] text-sm leading-5 text-muted-foreground">{metric.label}</p><p className="mt-7 text-xs font-bold text-accent-foreground">{metric.change} <span className="font-normal text-muted-foreground">since last year</span></p></div>)}</div><div className="mt-16 grid gap-12 lg:grid-cols-[1fr_.9fr]"><div><p className="eyebrow">Where a booking travels</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-.05em]">The shape of a stay</h2><p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">Of every {formatMoney(100)} paid for a night on XploreMah, {formatMoney(72)} moves through the host family and their nearby makers.</p><div className="mt-9 space-y-5"><ImpactBar label="Host & household" value={72} color="bg-primary" amount={formatMoney(72)} /><ImpactBar label="Village projects" value={12} color="bg-accent" amount={formatMoney(12)} /><ImpactBar label="Local guides & makers" value={9} color="bg-[#b5764d]" amount={formatMoney(9)} /><ImpactBar label="XploreMah operations" value={7} color="bg-muted-foreground/40" amount={formatMoney(7)} /></div></div><div className="rounded-[1.5rem] bg-primary p-7 text-primary-foreground md:p-9"><p className="eyebrow text-accent">This year, together</p><div className="mt-8 space-y-7"><div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-foreground/10 text-accent"><TreePine size={19} /></span><div><p className="font-display text-lg font-bold">1,240 trees in the ground</p><p className="mt-1 text-xs leading-5 text-primary-foreground/60">Native jamun, hirda and ain planted with three Sahyadri villages.</p></div></div><div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-foreground/10 text-accent"><Utensils size={19} /></span><div><p className="font-display text-lg font-bold">{formatMoney(420000)} into local kitchens</p><p className="mt-1 text-xs leading-5 text-primary-foreground/60">Directly paid to home cooks, farms and village food collectives.</p></div></div><div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-foreground/10 text-accent"><Binoculars size={19} /></span><div><p className="font-display text-lg font-bold">38 new local guides</p><p className="mt-1 text-xs leading-5 text-primary-foreground/60">Trained to lead walks that respect the forest and its seasons.</p></div></div></div></div></div><div className="mt-16 border-t border-border pt-12"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">A small promise</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-.05em]">Leave places better known,<br />not more crowded.</h2></div><Link href="/explore" className="inline-flex items-center gap-2 text-sm font-bold text-primary" data-testid="link-impact-explore">Choose a thoughtful stay <ArrowRight size={16} /></Link></div></div></div></div>;
}

function EconomicImpact() {
  const { formatMoney } = useCurrency();
  return <div><section className="bg-primary text-primary-foreground"><div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[1fr_.8fr] lg:items-end lg:px-8 lg:py-24"><div><p className="eyebrow text-accent">The economics of a good stay</p><h1 className="mt-4 max-w-3xl font-display text-5xl font-extrabold leading-[.98] tracking-[-.065em] md:text-7xl">Your money<br /><span className="text-accent">knows the way home.</span></h1></div><p className="max-w-sm text-sm leading-7 text-primary-foreground/70">A stay is more than a room. It is wages for a local guide, ingredients for a village kitchen, and the confidence to keep a community’s welcome alive.</p></div></section><div className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8 lg:py-20"><div className="grid gap-4 md:grid-cols-3"><div className="rounded-[1.3rem] bg-secondary p-6"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Shared in 2026</p><p className="mt-4 font-display text-4xl font-extrabold text-primary">{formatMoney(1860000)}</p><p className="mt-2 text-sm leading-5 text-muted-foreground">directly with host communities</p></div><div className="rounded-[1.3rem] bg-secondary p-6"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kept local</p><p className="mt-4 font-display text-4xl font-extrabold text-primary">72%</p><p className="mt-2 text-sm leading-5 text-muted-foreground">of every stay remains close to the place</p></div><div className="rounded-[1.3rem] bg-secondary p-6"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">People supported</p><p className="mt-4 font-display text-4xl font-extrabold text-primary">340+</p><p className="mt-2 text-sm leading-5 text-muted-foreground">hosts, cooks, makers and guides</p></div></div><div className="mt-16 grid gap-12 lg:grid-cols-[1fr_.85fr]"><div><p className="eyebrow">Where your booking goes</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-.05em]">A little more stays here.</h2><p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">The split is designed to keep the most valuable part of a trip in the village that made it possible.</p><div className="mt-9 space-y-5"><ImpactBar label="Host family & stay" value={65} color="bg-primary" amount={formatMoney(65)} /><ImpactBar label="Local guides & experiences" value={15} color="bg-accent" amount={formatMoney(15)} /><ImpactBar label="Village eco-fund" value={5} color="bg-[#b5764d]" amount={formatMoney(5)} /><ImpactBar label="Community infrastructure" value={5} color="bg-[#8b9e67]" amount={formatMoney(5)} /><ImpactBar label="Platform operations" value={10} color="bg-muted-foreground/40" amount={formatMoney(10)} /></div></div><div className="rounded-[1.5rem] border border-border bg-card p-7 md:p-9"><p className="eyebrow">In the field</p><div className="mt-8 space-y-7"><div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary"><Utensils size={19} /></span><div><p className="font-display text-lg font-bold">{formatMoney(420000)} into local kitchens</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Seasonal ingredients, village breakfasts, and home cooks paid fairly.</p></div></div><div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary"><TreePine size={19} /></span><div><p className="font-display text-lg font-bold">1,240 native trees supported</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Community-led planting in three Sahyadri villages.</p></div></div><div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary"><Users size={19} /></span><div><p className="font-display text-lg font-bold">38 new local guides</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Training and work for people who know these paths best.</p></div></div></div></div></div><div className="mt-16 rounded-[1.5rem] bg-secondary p-7 md:p-10"><div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><p className="eyebrow">See the wider picture</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-.05em]">Impact is a trail, not a headline.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Read the annual view of the places, people and projects your stays help sustain.</p></div><Link href="/impact" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="link-economic-to-impact">Our impact report <ArrowRight size={15} /></Link></div></div></div></div>;
}

function BookingHistory() {
  const { bookings } = useBookings();
  const { formatMoney } = useCurrency();
  return <div className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8 lg:py-20"><div className="max-w-2xl"><p className="eyebrow">Your trail log</p><h1 className="mt-3 font-display text-5xl font-extrabold tracking-[-.06em] md:text-7xl">Booking<br /><span className="text-accent-foreground">history.</span></h1><p className="mt-5 max-w-lg text-sm leading-6 text-muted-foreground">Keep the places you have requested close at hand. Your stay requests live on this device until you are ready to revisit them.</p></div>{bookings.length === 0 ? <div className="mt-14 rounded-[1.5rem] border border-dashed border-border bg-card p-12 text-center"><ReceiptText size={32} className="mx-auto text-accent-foreground" /><h2 className="mt-5 font-display text-2xl font-bold">No stay requests yet</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">When you find a place worth the detour, send a stay request and it will appear here.</p><Link href="/explore" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="link-history-explore">Find a stay <ArrowRight size={15} /></Link></div> : <div className="mt-14 space-y-4">{bookings.map((booking) => <article key={booking.id} className="rounded-[1.4rem] border border-border bg-card p-5 shadow-sm md:p-7"><div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-accent/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">{booking.status}</span><span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock3 size={13} /> {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(booking.createdAt))}</span></div><h2 className="mt-3 font-display text-2xl font-bold">{booking.destinationName}</h2><p className="mt-1 text-sm text-muted-foreground">Hosted by {booking.host}</p></div><div className="text-left md:text-right"><p className="text-xs text-muted-foreground">Estimated total</p><p className="mt-1 font-display text-2xl font-extrabold text-primary">{formatMoney(booking.totalInr)}</p></div></div><div className="mt-6 grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-3"><div className="flex items-center gap-2 text-muted-foreground"><CalendarDays size={16} className="text-primary" /><span>{booking.nights} {booking.nights === 1 ? 'night' : 'nights'}</span></div><div className="flex items-center gap-2 text-muted-foreground"><Users size={16} className="text-primary" /><span>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</span></div><div className="flex items-center gap-2 text-muted-foreground"><CircleDollarSign size={16} className="text-primary" /><span>{booking.addOns.length ? `${booking.addOns.length} add-on${booking.addOns.length > 1 ? 's' : ''} selected` : 'No add-ons selected'}</span></div></div><Link href={`/destination/${booking.destinationId}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary" data-testid={`link-history-${booking.destinationId}`}>View this stay <ArrowRight size={15} /></Link></article>)}</div>}</div>;
}

function ImpactBar({ label, value, color, amount }: { label: string; value: number; color: string; amount: string }) {
  return <div><div className="mb-2 flex justify-between text-xs font-semibold"><span>{label}</span><span className="text-muted-foreground">{amount}</span></div><div className="h-3 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full ${color} animate-grow`} style={{ width: `${value}%` }} /></div></div>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><AppShell><Switch><Route path="/" component={Home} /><Route path="/explore" component={Explore} /><Route path="/destination/:id" component={DestinationPage} /><Route path="/host" component={Host} /><Route path="/impact" component={Impact} /><Route path="/economic-impact" component={EconomicImpact} /><Route path="/bookings" component={BookingHistory} /><Route component={NotFound} /></Switch></AppShell></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;