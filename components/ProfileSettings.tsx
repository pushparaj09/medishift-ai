
import React, { useState, useRef } from 'react';
import { Employee } from '../types';
import { Save, User, MapPin, Briefcase, Building2, Mail, Phone, Navigation, Loader2, Camera, Upload } from 'lucide-react';

interface ProfileSettingsProps {
  currentUser: Employee;
  onSave: (updatedEmployee: Employee) => void;
  onNotify: (title: string, message: string, type: 'info' | 'warning' | 'success' | 'error') => void;
}

// Simulator Hospital Coordinates (Central Park, NY for demo)
const HOSPITAL_COORDS = { lat: 40.785091, lng: -73.968285 };

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentUser, onSave, onNotify }) => {
  const [formData, setFormData] = useState<Employee>(currentUser);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof Employee, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onNotify("Profile Updated", "Your changes have been saved successfully.", "success");
  };

  // Handle Image Upload via File Reader (Client-side simulation)
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB for demo)
      if (file.size > 5 * 1024 * 1024) {
        onNotify("Upload Failed", "Image size should be less than 5MB", "error");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        handleChange('avatar', result);
        onNotify("Photo Updated", "Profile picture updated successfully.", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Haversine Formula to calculate distance between two points on Earth
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
        onNotify("Error", "Geolocation is not supported by your browser", "error");
        return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            const dist = calculateDistance(userLat, userLng, HOSPITAL_COORDS.lat, HOSPITAL_COORDS.lng);
            
            // Round to 1 decimal place
            const roundedDist = Math.round(dist * 10) / 10;
            
            handleChange('distanceFromHospital', roundedDist);
            setIsLoadingLocation(false);
            onNotify("Location Updated", `Distance updated to ${roundedDist} km based on your current location.`, "success");
        },
        (error) => {
            setIsLoadingLocation(false);
            // Explicitly handle the error object to prevent [object Object]
            let errorMessage = "Unable to retrieve your location.";
            if (error.message) {
                errorMessage = error.message;
            }
            onNotify("Location Error", errorMessage, "error");
            console.error(error);
        }
    );
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h2>
                <p className="text-slate-500 mt-2 font-medium">Manage your personal information and preferences</p>
            </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header Background */}
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                 <div className="absolute -bottom-12 left-8">
                     <div className="relative group cursor-pointer" onClick={triggerFileUpload}>
                        <img 
                            src={formData.avatar} 
                            alt={formData.name} 
                            className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white transition-opacity group-hover:opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/30 rounded-2xl absolute inset-0"></div>
                            <Camera className="w-8 h-8 text-white relative z-10 drop-shadow-md" />
                        </div>
                        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 bg-white rounded-full p-1.5 shadow-md border border-slate-100 text-blue-600">
                            <Upload className="w-4 h-4" />
                        </div>
                     </div>
                     {/* Hidden File Input */}
                     <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                     />
                 </div>
            </div>

            <div className="pt-16 px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Personal Info Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Personal Information</h3>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="email" 
                                        value={formData.email || ''}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder="you@medishift.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="tel" 
                                        value={formData.phoneNumber || ''}
                                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional Info Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Professional Details</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="text" 
                                            value={formData.role}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Department</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="text" 
                                            value={formData.department}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Emergency Proximity</label>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <MapPin className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-bold">Distance from Hospital</span>
                                        </div>
                                        <span className="text-2xl font-bold text-slate-900">{formData.distanceFromHospital} <span className="text-sm text-slate-500 font-medium">km</span></span>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={handleUpdateLocation}
                                        disabled={isLoadingLocation}
                                        className="w-full py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isLoadingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                                        {isLoadingLocation ? 'Locating...' : 'Update via GPS'}
                                    </button>
                                    <p className="text-[10px] text-slate-400 mt-2 text-center">
                                        Used for emergency call-outs only. Your precise location is not stored.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <button 
                            type="submit"
                            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default ProfileSettings;
