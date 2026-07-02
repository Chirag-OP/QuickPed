import React, { useState } from 'react';
import { Building2, ChevronRight, Loader2, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { createInstituteFromInput, getInstituteRevenue, type InstituteData } from '../lib/admin-data';
import { adminToast, runWithFeedback } from '../lib/admin-feedback';

interface CampusSetupProps {
  institutes: InstituteData[];
  selectedInstituteId: string | null;
  onSelectInstitute: (id: string) => void;
  onAddInstitute: (institute: InstituteData) => void;
  onNavigateDocks?: () => void;
}

export const CampusSetup: React.FC<CampusSetupProps> = ({
  institutes,
  selectedInstituteId,
  onSelectInstitute,
  onAddInstitute,
  onNavigateDocks,
}) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [mapFileName, setMapFileName] = useState('');
  const [mapPreview, setMapPreview] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Campus name is required';
    if (!city.trim()) next.city = 'City / location is required';
    if (!mapFileName) next.map = 'Campus map upload is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleMapUpload = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.name.endsWith('.svg')) {
      adminToast.error('Please upload an image or SVG file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setMapPreview(String(reader.result ?? ''));
      setMapFileName(file.name);
      setErrors((prev) => ({ ...prev, map: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      adminToast.error('Please fix the highlighted fields.');
      return;
    }
    setSaving(true);
    await runWithFeedback(
      () => {
        const campus = createInstituteFromInput({
          name: name.trim(),
          city: city.trim(),
          mapAssetName: mapFileName,
          mapPreviewDataUrl: mapPreview,
          dockCount: 0,
          vehicleCount: 0,
        });
        onAddInstitute(campus);
        setName('');
        setCity('');
        setMapFileName('');
        setMapPreview('');
        onSelectInstitute(campus.id);
        onNavigateDocks?.();
        return campus;
      },
      { loading: 'Creating campus...', success: `Campus "${name.trim()}" created successfully.` }
    );
    setSaving(false);
  };

  return (
    <div className="min-h-full bg-[#F9F9F9] p-4 md:p-6 pb-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] md:text-3xl">Campus Setup</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a campus record — it becomes the parent for docks, fleet, and fare rules.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-0 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Basic Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Campus Name</label>
                <Input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                  placeholder="e.g. IIT Ropar"
                  className="mt-1 h-11 rounded-xl"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">City / Location</label>
                <Input
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setErrors((p) => ({ ...p, city: '' })); }}
                  placeholder="e.g. Rupnagar, Punjab"
                  className="mt-1 h-11 rounded-xl"
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Campus Map Upload</label>
                <Input
                  type="file"
                  accept="image/*,.svg"
                  onChange={(e) => handleMapUpload(e.target.files?.[0])}
                  className="mt-1 h-11 rounded-xl file:mr-3 file:rounded-full file:border-0 file:bg-[#fff0df] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#FF8C42]"
                />
                {errors.map && <p className="text-xs text-red-500 mt-1">{errors.map}</p>}
                {mapFileName && <p className="text-xs text-muted-foreground mt-1">Selected: {mapFileName}</p>}
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-[#1a1a1a] hover:bg-[#333] text-white h-11"
              >
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save & Continue'}
              </Button>
            </form>
          </Card>

          <Card className="border-0 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Map Preview</h2>
            <div className="flex h-64 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#eceae6] bg-[#fafafa]">
              {mapPreview ? (
                <img src={mapPreview} alt="Campus map preview" className="h-full w-full object-contain" />
              ) : (
                <p className="text-sm text-muted-foreground px-6 text-center">Upload a map to preview it here before saving.</p>
              )}
            </div>
          </Card>
        </div>

        <Card className="border-0 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Existing Campuses</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {institutes.map((institute) => (
              <button
                key={institute.id}
                type="button"
                onClick={() => onSelectInstitute(institute.id)}
                className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                  selectedInstituteId === institute.id
                    ? 'border-[#FF8C42] bg-[#fff8f3]'
                    : 'border-[#eceae6] bg-white hover:border-[#FF8C42]/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0df]">
                    <Building2 className="text-[#FF8C42]" size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1a1a1a] truncate">{institute.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin size={12} /> {institute.city ?? 'No city'} · {institute.docks.length} docks
                    </p>
                    <p className="text-xs text-[#FF8C42] font-medium mt-0.5">
                      Revenue {getInstituteRevenue(institute).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-[#FF8C42] shrink-0" size={18} />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
