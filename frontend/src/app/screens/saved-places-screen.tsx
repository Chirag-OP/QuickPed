import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Edit3,
  MapPin,
  Navigation,
  ParkingCircle,
  Plus,
  Search,
  Star,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

interface SavedPlacesScreenProps {
  onBack: () => void;
}

type PlaceTag = 'Hostel' | 'Department' | 'Library' | 'Mess' | 'Dock' | 'Gate' | 'Sports' | 'Other';

type SavedPlace = {
  id: string;
  name: string;
  subtitle: string;
  tag: PlaceTag;
  favorite: boolean;
};

const TAG_COLORS: Record<PlaceTag, string> = {
  Hostel:     'bg-violet-500/10 text-violet-500',
  Department: 'bg-blue-500/10 text-blue-500',
  Library:    'bg-emerald-500/10 text-emerald-500 dark:text-[#10b981]',
  Mess:       'bg-amber-500/10 text-amber-500 dark:text-[#f59e0b]',
  Dock:       'bg-orange-500/10 text-orange-500',
  Gate:       'bg-slate-500/10 text-slate-500 dark:text-slate-400',
  Sports:     'bg-cyan-500/10 text-cyan-500 dark:text-[#06b6d4]',
  Other:      'bg-pink-500/10 text-pink-500',
};

function tagFromName(name: string): PlaceTag {
  const n = name.toLowerCase();
  if (n.includes('hostel')) return 'Hostel';
  if (n.includes('department') || n.includes('dept') || n.includes('cse') || n.includes('electrical') || n.includes('mechanical') || n.includes('civil')) return 'Department';
  if (n.includes('library')) return 'Library';
  if (n.includes('mess') || n.includes('nescafe') || n.includes('canteen') || n.includes('cafeteria')) return 'Mess';
  if (n.includes('dock')) return 'Dock';
  if (n.includes('gate')) return 'Gate';
  if (n.includes('sports')) return 'Sports';
  return 'Other';
}

const INITIAL_PLACES: SavedPlace[] = [
  'CSE Department',
  'Electrical Department',
  'Mechanical Department',
  'Civil Department',
  'Administration Block',
  'Library',
  'Tinkering Lab',
  'Beas Hostel',
  'Chenab Hostel',
  'Ravi Hostel',
  'Jhelum Hostel',
  'Annapurna Mess',
  'Nescafe',
  'Main Gate',
  'Academic Block',
  'Sports Complex',
  'Health Centre',
  'Parking Area',
].map((name, index) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name,
  subtitle: 'Campus Location',
  tag: tagFromName(name),
  favorite: index < 4,
}));

const PLACE_TAGS: PlaceTag[] = ['Hostel', 'Department', 'Library', 'Mess', 'Dock', 'Gate', 'Sports', 'Other'];

export const SavedPlacesScreen: React.FC<SavedPlacesScreenProps> = ({ onBack }) => {
  const [places, setPlaces] = useState<SavedPlace[]>(INITIAL_PLACES);
  const [query, setQuery] = useState('');

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTag, setNewTag] = useState<PlaceTag>('Other');

  // Edit dialog
  const [editTarget, setEditTarget] = useState<SavedPlace | null>(null);
  const [editName, setEditName] = useState('');
  const [editTag, setEditTag] = useState<PlaceTag>('Other');

  // Navigate toast
  const [navToast, setNavToast] = useState('');
  const showNavToast = (name: string) => {
    setNavToast(`Navigating to ${name}…`);
    window.setTimeout(() => setNavToast(''), 2500);
  };

  const filtered = useMemo(() => {
    const norm = query.trim().toLowerCase();
    if (!norm) return places;
    return places.filter((p) => p.name.toLowerCase().includes(norm) || p.tag.toLowerCase().includes(norm));
  }, [places, query]);

  const toggleFav = (id: string) =>
    setPlaces((cur) => cur.map((p) => p.id === id ? { ...p, favorite: !p.favorite } : p));

  const deletePlace = (id: string) =>
    setPlaces((cur) => cur.filter((p) => p.id !== id));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const place: SavedPlace = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      subtitle: 'Custom Place',
      tag: newTag,
      favorite: false,
    };
    setPlaces((cur) => [place, ...cur]);
    setNewName(''); setNewTag('Other'); setAddOpen(false);
  };

  const openEdit = (place: SavedPlace) => {
    setEditTarget(place);
    setEditName(place.name);
    setEditTag(place.tag);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editName.trim()) return;
    setPlaces((cur) =>
      cur.map((p) => p.id === editTarget.id ? { ...p, name: editName.trim(), tag: editTag } : p)
    );
    setEditTarget(null);
  };

  const favPlaces = filtered.filter((p) => p.favorite);
  const otherPlaces = filtered.filter((p) => !p.favorite);

  const PlaceCard = ({ place, index }: { place: SavedPlace; index: number }) => (
    <motion.article key={place.id}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.02 }}
      className="rounded-[24px] bg-card p-4 shadow-[0_12px_30px_rgba(0,0,0,0.02)] border border-border transition-colors duration-200"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-orange-500/10 text-orange-500">
          {place.name.toLowerCase().includes('parking') ? <ParkingCircle size={22} /> : <MapPin size={22} />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[15px] font-black leading-tight text-foreground">{place.name}</h2>
          <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${TAG_COLORS[place.tag]}`}>
            {place.tag}
          </span>
        </div>
        <button type="button" onClick={() => toggleFav(place.id)}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
            place.favorite ? 'bg-orange-500 text-white' : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
          }`} aria-label="Toggle favourite">
          <Star size={17} fill={place.favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button type="button" onClick={() => showNavToast(place.name)}
          className="flex h-10 items-center justify-center gap-1.5 rounded-[14px] bg-orange-500/10 text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-colors">
          <Navigation size={14} />Navigate
        </button>
        <button type="button" onClick={() => openEdit(place)}
          className="flex h-10 items-center justify-center gap-1.5 rounded-[14px] bg-muted/60 text-xs font-bold text-muted-foreground hover:bg-muted transition-colors">
          <Edit3 size={14} />Edit
        </button>
        <button type="button" onClick={() => deletePlace(place.id)}
          className="flex h-10 items-center justify-center gap-1.5 rounded-[14px] bg-red-500/10 text-xs font-bold text-red-500 hover:bg-red-500/20 transition-colors">
          <Trash2 size={14} />Delete
        </button>
      </div>
    </motion.article>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-10 transition-colors duration-200">
      {/* Navigation toast */}
      <AnimatePresence>
        {navToast && (
          <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-14 left-1/2 z-[100] rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-xl dark:bg-slate-900 border border-slate-800">
            {navToast}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <Button type="button" variant="ghost" size="icon" onClick={onBack}
            className="h-11 w-11 rounded-full bg-card text-orange-500 shadow-[0_8px_18px_rgba(0,0,0,0.04)] hover:bg-orange-500/10 border border-border">
            <ArrowLeft size={20} />
          </Button>
          <div className="rounded-full bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-600 dark:text-orange-400">
            {places.length} saved
          </div>
        </div>

        {/* Hero */}
        <section className="mb-5 rounded-[30px] bg-orange-100 dark:bg-orange-950/20 px-5 py-6 transition-colors duration-200">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white dark:bg-slate-900 text-orange-500 shadow-[0_10px_24px_rgba(249,115,22,0.08)] border border-border">
              <MapPin size={26} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-[3px] text-orange-700 dark:text-orange-400">Campus Map</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 dark:text-white">Saved Places</h1>
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">Quick access to your favourite campus locations.</p>
            </div>
          </div>
        </section>

        {/* Search + Add */}
        <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
            <Input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search places or tags…"
              className="h-[52px] rounded-[18px] border border-border bg-card pl-11 font-semibold text-foreground shadow-[0_10px_24px_rgba(0,0,0,0.02)] placeholder:text-muted-foreground/60 focus-visible:border-orange-500" />
            {query && (
              <button type="button" onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            )}
          </div>
          <Button type="button" onClick={() => { setNewName(''); setNewTag('Other'); setAddOpen(true); }}
            className="h-[52px] rounded-[18px] bg-orange-500 px-5 text-white shadow-[0_12px_24px_rgba(249,115,22,0.15)] hover:bg-orange-600">
            <Plus size={18} className="mr-1" />Add Place
          </Button>
        </div>

        {/* Favourites section */}
        {favPlaces.length > 0 && (
          <section className="mb-5">
            <div className="mb-3 flex items-center gap-2">
              <Star size={16} className="text-orange-500" fill="currentColor" />
              <h2 className="text-[15px] font-black text-foreground">Favourites</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence>
                {favPlaces.map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* All Other Places */}
        {otherPlaces.length > 0 && (
          <section>
            {favPlaces.length > 0 && (
              <h2 className="mb-3 text-[15px] font-black text-foreground">All Places</h2>
            )}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence>
                {otherPlaces.map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-6 rounded-[24px] bg-card px-5 py-14 text-center shadow-[0_12px_30px_rgba(0,0,0,0.02)] border border-border">
            <MapPin className="mx-auto text-orange-200 dark:text-orange-950" size={42} />
            <p className="mt-4 text-lg font-black text-muted-foreground/40">No places found</p>
            <p className="mt-1 text-sm text-muted-foreground/60">
              {query ? 'Try a different search term.' : 'Add your first campus location!'}
            </p>
            {!query && (
              <button type="button" onClick={() => setAddOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(249,115,22,0.18)] hover:bg-orange-600">
                <Plus size={17} />Add Place
              </button>
            )}
          </motion.div>
        )}
      </main>

      {/* ── Add Place Dialog ── */}
      <Dialog open={addOpen} onOpenChange={(o) => !o && setAddOpen(false)}>
        <DialogContent className="rounded-3xl border border-border bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Place</DialogTitle>
            <DialogDescription>Save a campus location for quick access.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 pt-1">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-muted-foreground">Place Name</label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Tinkering Lab" required className="rounded-xl" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-muted-foreground">Category Tag</label>
              <div className="flex flex-wrap gap-2">
                {PLACE_TAGS.map((tag) => (
                  <button key={tag} type="button" onClick={() => setNewTag(tag)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                      newTag === tag ? `${TAG_COLORS[tag]} ring-2 ring-offset-1 ring-current` : 'bg-muted/80 text-muted-foreground hover:bg-muted'
                    }`}>
                    {newTag === tag && <Check size={11} />}{tag}
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 rounded-full bg-[#ee5f13] hover:bg-[#d65a13] text-white">Save Place</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Place Dialog ── */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="rounded-3xl border border-border bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Place</DialogTitle>
            <DialogDescription>Update the name or category of this location.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-1">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-muted-foreground">Place Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} required className="rounded-xl" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-muted-foreground">Category Tag</label>
              <div className="flex flex-wrap gap-2">
                {PLACE_TAGS.map((tag) => (
                  <button key={tag} type="button" onClick={() => setEditTag(tag)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                      editTag === tag ? `${TAG_COLORS[tag]} ring-2 ring-offset-1 ring-current` : 'bg-muted/80 text-muted-foreground hover:bg-muted'
                    }`}>
                    {editTag === tag && <Check size={11} />}{tag}
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button type="submit" className="flex-1 rounded-full bg-[#ee5f13] hover:bg-[#d65a13] text-white">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
