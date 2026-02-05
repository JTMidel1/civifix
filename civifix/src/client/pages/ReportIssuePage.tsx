import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { modelenceMutation, createQueryKey } from '@modelence/react-query';
import DashboardLayout from '@/client/components/DashboardLayout';
import { Button } from '@/client/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { Input } from '@/client/components/ui/Input';
import { Label } from '@/client/components/ui/Label';
import { toast } from 'react-hot-toast';
import { cn } from '@/client/lib/utils';

type LocationState = {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
};

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    loading: true,
    error: null,
  });

  const { mutateAsync: createIssue } = useMutation({
    ...modelenceMutation('fixnet.createIssue'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('fixnet.getMyIssues') });
      const result = data as { issueId: string; priority: string };
      if (result.priority === 'High') {
        toast.success('Issue reported as HIGH PRIORITY due to nearby reports!');
      } else {
        toast.success('Issue reported successfully!');
      }
      navigate('/citizen');
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });

  const requestLocation = useCallback(() => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            loading: false,
            error: null,
          });
          setUseManualLocation(false);
        },
        (error) => {
          let errorMessage = 'Unable to get location.';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please allow location access in your browser settings or enter coordinates manually.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please try again or enter coordinates manually.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again or enter coordinates manually.';
              break;
          }

          setLocation({
            latitude: null,
            longitude: null,
            loading: false,
            error: errorMessage,
          });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    } else {
      setLocation({
        latitude: null,
        longitude: null,
        loading: false,
        error: 'Geolocation is not supported by your browser. Please enter coordinates manually.',
      });
    }
  }, []);

  // Get user's location on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const handlePhotoChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        setPhotoBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const getEffectiveLocation = useCallback(() => {
    if (useManualLocation) {
      const lat = parseFloat(manualLat);
      const lng = parseFloat(manualLng);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { latitude: lat, longitude: lng };
      }
      return null;
    }
    if (location.latitude && location.longitude) {
      return { latitude: location.latitude, longitude: location.longitude };
    }
    return null;
  }, [useManualLocation, manualLat, manualLng, location.latitude, location.longitude]);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('title'));
    const description = String(formData.get('description'));
    const category = String(formData.get('category'));

    const effectiveLocation = getEffectiveLocation();

    if (!effectiveLocation) {
      toast.error('Valid location is required. Please enable location services or enter valid coordinates.');
      setIsSubmitting(false);
      return;
    }

    try {
      await createIssue({
        title,
        description,
        category,
        photo: photoBase64,
        latitude: effectiveLocation.latitude,
        longitude: effectiveLocation.longitude,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [createIssue, getEffectiveLocation, photoBase64]);

  const effectiveLocation = getEffectiveLocation();
  const canSubmit = !isSubmitting && !location.loading && effectiveLocation !== null;

  return (
    <DashboardLayout title="Report an Issue">
      <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-soft border border-sage-100 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-forest-900">Report Infrastructure Problem</CardTitle>
          <p className="text-sm text-sage-600 mt-1">
            Help improve your community by reporting issues you've found.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="block mb-2 text-forest-800 font-medium">
                Title *
              </Label>
              <Input
                type="text"
                name="title"
                id="title"
                placeholder="Brief description of the issue"
                required
                maxLength={100}
                className="border-sage-200 focus:border-forest-400 focus:ring-forest-400 rounded-xl"
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="block mb-2 text-forest-800 font-medium">
                Category *
              </Label>
              <select
                name="category"
                id="category"
                required
                className="flex h-10 w-full rounded-xl border border-sage-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400 focus-visible:ring-offset-2"
              >
                <option value="">Select a category</option>
                <option value="Road">Road - Potholes, damaged pavement, etc.</option>
                <option value="Water">Water - Leaks, flooding, contamination</option>
                <option value="Power">Power - Outages, damaged lines, streetlights</option>
                <option value="Waste">Waste - Garbage, illegal dumping</option>
                <option value="Other">Other - Other infrastructure issues</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="block mb-2 text-forest-800 font-medium">
                Description *
              </Label>
              <textarea
                name="description"
                id="description"
                placeholder="Provide more details about the issue..."
                required
                rows={4}
                className="flex w-full rounded-xl border border-sage-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-sage-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400 focus-visible:ring-offset-2"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <Label htmlFor="photo" className="block mb-2 text-forest-800 font-medium">
                Photo (optional)
              </Label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-sage-50 rounded-xl cursor-pointer hover:bg-sage-100 transition-colors border border-sage-200">
                    <svg className="w-5 h-5 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-forest-700 font-medium">Take or Upload Photo</span>
                    <input
                      type="file"
                      name="photo"
                      id="photo"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview(null);
                        setPhotoBase64('');
                      }}
                      className="text-sm text-red-600 hover:underline font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {photoPreview && (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full max-w-sm rounded-xl object-cover border border-sage-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <Label className="block mb-2 text-forest-800 font-medium">
                Location *
              </Label>

              <div className={cn(
                "p-4 rounded-xl border transition-colors",
                location.error && !useManualLocation
                  ? "bg-red-50/50 border-red-200"
                  : effectiveLocation
                    ? "bg-forest-50/50 border-forest-200"
                    : "bg-sage-50/50 border-sage-200"
              )}>
                {location.loading ? (
                  <div className="flex items-center gap-2 text-sage-600">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm">Getting your location...</span>
                  </div>
                ) : (
                  <>
                    {/* Auto location result */}
                    {!useManualLocation && (
                      <>
                        {location.error ? (
                          <div className="space-y-3">
                            <div className="flex items-start gap-2 text-red-600">
                              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span className="text-sm">{location.error}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={requestLocation}
                                className="text-forest-600 border-forest-300 hover:bg-forest-50"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Try Again
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setUseManualLocation(true)}
                                className="text-sage-600 border-sage-300 hover:bg-sage-50"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Enter Manually
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-forest-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <div className="text-sm">
                                <span className="font-medium">Location captured</span>
                                <span className="text-sage-500 ml-2">
                                  ({location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)})
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={requestLocation}
                              className="text-sage-500 hover:text-forest-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </Button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Manual location entry */}
                    {useManualLocation && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-forest-700">Enter coordinates manually</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUseManualLocation(false);
                              requestLocation();
                            }}
                            className="text-sage-500 hover:text-forest-600 text-xs"
                          >
                            Use GPS instead
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="manualLat" className="text-xs text-sage-600 mb-1 block">
                              Latitude (-90 to 90)
                            </Label>
                            <Input
                              type="number"
                              id="manualLat"
                              step="any"
                              min="-90"
                              max="90"
                              placeholder="e.g., 40.7128"
                              value={manualLat}
                              onChange={(e) => setManualLat(e.target.value)}
                              className="border-sage-200 focus:border-forest-400 focus:ring-forest-400 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="manualLng" className="text-xs text-sage-600 mb-1 block">
                              Longitude (-180 to 180)
                            </Label>
                            <Input
                              type="number"
                              id="manualLng"
                              step="any"
                              min="-180"
                              max="180"
                              placeholder="e.g., -74.0060"
                              value={manualLng}
                              onChange={(e) => setManualLng(e.target.value)}
                              className="border-sage-200 focus:border-forest-400 focus:ring-forest-400 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                        {effectiveLocation && (
                          <div className="flex items-center gap-1 text-forest-600 text-xs">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Valid coordinates entered
                          </div>
                        )}
                        <p className="text-xs text-sage-500">
                          Tip: You can find coordinates on Google Maps by right-clicking a location.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white shadow-soft hover:shadow-glow transition-all duration-300 rounded-xl py-3"
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : 'Submit Report'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
