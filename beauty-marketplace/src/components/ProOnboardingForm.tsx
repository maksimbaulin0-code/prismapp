import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProOnboardingFormProps {
  onComplete: (data: ProProfileData) => void;
  onCancel: () => void;
}

export interface ProProfileData {
  name: string;
  bio: string;
  categories: string[];
  services: { name: string; price: number; duration: number }[];
}

const CATEGORIES = [
  { id: 'tattoo', name: 'Tattoo', icon: '🎨' },
  { id: 'nails', name: 'Nails', icon: '💅' },
  { id: 'piercing', name: 'Piercing', icon: '✨' },
  { id: 'makeup', name: 'Makeup', icon: '💄' },
  { id: 'hair', name: 'Hair', icon: '💇' },
  { id: 'lashes', name: 'Lashes', icon: '👁️' },
];

export function ProOnboardingForm({ onComplete, onCancel }: ProOnboardingFormProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<ProProfileData>({
    name: '',
    bio: '',
    categories: [],
    services: [],
  });
  const [newService, setNewService] = useState({ name: '', price: '', duration: '' });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else onComplete(formData);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else onCancel();
  };

  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((c) => c !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const addService = () => {
    if (newService.name && newService.price && newService.duration) {
      setFormData((prev) => ({
        ...prev,
        services: [
          ...prev.services,
          {
            name: newService.name,
            price: parseFloat(newService.price),
            duration: parseInt(newService.duration),
          },
        ],
      }));
      setNewService({ name: '', price: '', duration: '' });
    }
  };

  const removeService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 glass border-b border-border px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-sharp">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold">Create Pro Profile</h2>
          <div className="w-9" /> {/* Spacer for alignment */}
        </div>

        {/* Progress Bar */}
        <div className="relative h-1 bg-border rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">Step {step + 1} of {totalSteps}</p>
      </div>

      {/* Form Content */}
      <div className="px-4 py-6 pb-32">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Your Name / Studio Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-card border border-border rounded-soft outline-none focus:border-white/30 transition-colors"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3 bg-card border border-border rounded-soft outline-none focus:border-white/30 transition-colors resize-none"
                    placeholder="Tell clients about yourself..."
                    rows={4}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold mb-4">Select Categories</h3>
              <p className="text-sm text-gray-400 mb-4">Choose all that apply</p>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      'p-4 rounded-soft border flex flex-col items-center gap-2 transition-all',
                      formData.categories.includes(cat.id)
                        ? 'bg-accent text-background border-accent'
                        : 'bg-card text-gray-400 border-border hover:border-white/20'
                    )}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold mb-4">Add Services</h3>
              
              {/* Service Input */}
              <div className="glass p-4 rounded-soft space-y-3">
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="Service name (e.g., Gel Manicure)"
                  className="w-full px-3 py-2 bg-card border border-border rounded-sharp outline-none text-sm"
                />
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    placeholder="Price ($)"
                    className="flex-1 px-3 py-2 bg-card border border-border rounded-sharp outline-none text-sm"
                  />
                  <input
                    type="number"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                    placeholder="Duration (min)"
                    className="flex-1 px-3 py-2 bg-card border border-border rounded-sharp outline-none text-sm"
                  />
                </div>
                <button
                  onClick={addService}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-sharp text-sm font-medium transition-colors"
                >
                  Add Service
                </button>
              </div>

              {/* Service List */}
              {formData.services.length > 0 && (
                <div className="space-y-2">
                  {formData.services.map((service, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-card border border-border rounded-soft"
                    >
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-xs text-gray-400">
                          ${service.price} • {service.duration} min
                        </p>
                      </div>
                      <button
                        onClick={() => removeService(index)}
                        className="p-2 hover:bg-red-500/20 rounded-sharp transition-colors"
                      >
                        <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold mb-4">Portfolio</h3>
              
              {/* Photo Upload Zone */}
              <motion.div
                className="border-2 border-dashed border-border rounded-soft p-8 text-center hover:border-white/30 transition-colors cursor-pointer"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex flex-col items-center gap-3">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium">Drop photos here or click to upload</p>
                    <p className="text-xs text-gray-500 mt-1">Support for JPG, PNG (max 5MB)</p>
                  </div>
                </div>
              </motion.div>

              {/* Summary */}
              <div className="glass p-4 rounded-soft space-y-3 mt-6">
                <h4 className="font-semibold">Profile Summary</h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <p><span className="text-accent">Name:</span> {formData.name || 'Not set'}</p>
                  <p><span className="text-accent">Categories:</span> {formData.categories.length} selected</p>
                  <p><span className="text-accent">Services:</span> {formData.services.length} added</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-border p-4 safe-area-bottom">
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 border border-border rounded-soft font-medium hover:bg-white/5 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={step === 0 && !formData.name}
            className="flex-1 py-3 bg-accent text-background rounded-soft font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === totalSteps - 1 ? 'Complete' : 'Continue'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
