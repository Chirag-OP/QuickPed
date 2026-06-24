import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
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
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface SavedPlacesScreenProps {
  onBack: () => void;
}

type SavedPlace = {
  id: string;
  name: string;
  subtitle: string;
  favorite: boolean;
};

const campusPlaces: SavedPlace[] = [
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
  subtitle: 'Frequently Visited',
  favorite: index < 4,
}));

export const SavedPlacesScreen: React.FC<SavedPlacesScreenProps> = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState(campusPlaces);

  const filteredPlaces = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return places;
    return places.filter((place) => place.name.toLowerCase().includes(normalized));
  }, [places, query]);

  const addNewPlace = () => {
    const nextPlace: SavedPlace = {
      id: `custom-${Date.now()}`,
      name: 'New Campus Place',
      subtitle: 'Frequently Visited',
      favorite: false,
    };
    setPlaces((current) => [nextPlace, ...current]);
  };

  const editPlace = (id: string) => {
    setPlaces((current) =>
      current.map((place) =>
        place.id === id
          ? {
              ...place,
              name: place.name.endsWith(' Updated') ? place.name.replace(' Updated', '') : `${place.name} Updated`,
            }
          : place
      )
    );
  };

  const deletePlace = (id: string) => {
    setPlaces((current) => current.filter((place) => place.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] pb-10">
      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-11 w-11 rounded-full bg-white text-orange-500 shadow-[0_8px_18px_rgba(15,15,15,0.08)] hover:bg-orange-50 hover:text-orange-500"
            aria-label="Back to profile"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600">
            {places.length} saved
          </div>
        </div>

        <section className="mb-5 rounded-[30px] bg-[#ffdfbd] px-5 py-6">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white text-orange-500 shadow-[0_10px_24px_rgba(249,115,22,0.12)]">
              <MapPin size={26} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-[3px] text-orange-700">IIT Jammu</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950">Saved Places</h1>
              <p className="mt-2 text-sm font-medium text-slate-600">Fast access to frequently used campus locations.</p>
            </div>
          </div>
        </section>

        <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Saved Places"
              className="h-[52px] rounded-[18px] border-0 bg-white pl-11 font-semibold text-slate-900 shadow-[0_10px_24px_rgba(31,31,31,0.05)] placeholder:text-slate-400"
            />
          </div>
          <Button
            type="button"
            onClick={addNewPlace}
            className="h-[52px] rounded-[18px] bg-orange-500 px-5 text-white shadow-[0_12px_24px_rgba(249,115,22,0.20)] hover:bg-orange-600"
          >
            <Plus size={18} />
            Add New Place
          </Button>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPlaces.map((place, index) => (
            <motion.article
              key={place.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(31,31,31,0.05)]"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-orange-50 text-orange-500">
                  {place.name === 'Parking Area' ? <ParkingCircle size={22} /> : <MapPin size={22} />}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[16px] font-black leading-tight text-slate-950">{place.name}</h2>
                  <p className="mt-1 text-[13px] font-semibold text-slate-500">{place.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPlaces((current) =>
                      current.map((item) => (item.id === place.id ? { ...item, favorite: !item.favorite } : item))
                    )
                  }
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                    place.favorite ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-400 hover:bg-orange-100'
                  }`}
                  aria-label={`${place.favorite ? 'Remove' : 'Add'} ${place.name} favorite`}
                >
                  <Star size={18} fill={place.favorite ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className="flex h-10 items-center justify-center gap-1.5 rounded-[14px] bg-orange-50 text-xs font-bold text-orange-600 hover:bg-orange-100"
                >
                  <Navigation size={15} />
                  Navigate
                </button>
                <button
                  type="button"
                  onClick={() => editPlace(place.id)}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-[14px] bg-slate-50 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  <Edit3 size={15} />
                  Edit Place
                </button>
                <button
                  type="button"
                  onClick={() => deletePlace(place.id)}
                  className="flex h-10 items-center justify-center gap-1 rounded-[14px] bg-red-50 text-[11px] font-bold text-red-500 hover:bg-red-100"
                >
                  <Trash2 size={15} />
                  Delete Place
                </button>
              </div>
            </motion.article>
          ))}
        </section>

        {filteredPlaces.length === 0 && (
          <div className="mt-5 rounded-[24px] bg-white px-5 py-10 text-center shadow-[0_12px_30px_rgba(31,31,31,0.05)]">
            <MapPin className="mx-auto text-orange-300" size={34} />
            <p className="mt-4 text-sm font-bold text-slate-500">No saved places match your search.</p>
          </div>
        )}
      </main>
    </div>
  );
};
