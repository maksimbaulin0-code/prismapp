import { useState, useRef } from 'react';
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
  portfolio: string[];
}

const CATEGORIES = [
  { id: 'tattoo', name: 'Тату', icon: '🎨' },
  { id: 'nails', name: 'Ногти', icon: '💅' },
  { id: 'piercing', name: 'Пирсинг', icon: '✨' },
  { id: 'makeup', name: 'Макияж', icon: '💄' },
  { id: 'hair', name: 'Волосы', icon: '💇' },
  { id: 'lashes', name: 'Ресницы', icon: '👁️' },
];

export function ProOnboardingForm({ onComplete, onCancel }: ProOnboardingFormProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<ProProfileData>({
    name: '',
    bio: '',
    categories: [],
    services: [],
    portfolio: [],
  });
  const [newService, setNewService] = useState({ name: '', price: '', duration: '' });
  const [errors, setErrors] = useState<{ name?: string; price?: string; duration?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setErrors({});
    const name = newService.name.trim();
    const price = parseFloat(newService.price);
    const duration = parseInt(newService.duration);
    
    if (!name) {
      setErrors({ name: 'Введите название' });
      return;
    }
    if (!price || price <= 0) {
      setErrors({ price: 'Введите цену' });
      return;
    }
    if (!duration || duration <= 0) {
      setErrors({ duration: 'Введите длительность' });
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, { name, price, duration }],
    }));
    setNewService({ name: '', price: '', duration: '' });
  };

  const removeService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой (макс 5МБ)');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData((prev) => ({
          ...prev,
          portfolio: [...prev.portfolio, ev.target?.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index),
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 overflow-y-auto"
    >
      <div className="sticky top-0 glass border-b border-border px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-sharp">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold">Регистрация мастера</h2>
          <div className="w-9" />
        </div>

        <div className="relative h-1 bg-border rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">Шаг {step + 1} из {totalSteps}</p>
      </div>

      <div className="px-4 py-6 pb-32">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Основная информация</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Ваше имя / Название студии</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-card border border-border rounded-soft outline-none focus:border-white/30"
                    placeholder="Введите имя"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">О себе</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3 bg-card border border-border rounded-soft outline-none focus:border-white/30 resize-none"
                    placeholder="Расскажите о себе..."
                    rows={4}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Выберите категории</h3>
              <p className="text-sm text-gray-400 mb-4">Выберите все подходящие варианты</p>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      'p-4 rounded-soft border flex flex-col items-center gap-2',
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
            <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Добавьте услуги</h3>
              
              <div className="glass p-4 rounded-soft space-y-3">
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="Название услуги"
                  className={cn(
                    'w-full px-3 py-2 bg-card border border-border rounded-sharp outline-none text-sm',
                    errors.name && 'border-red-500'
                  )}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      placeholder="Цена (₽)"
                      className={cn(
                        'w-full px-3 py-2 bg-card border border-border rounded-sharp outline-none text-sm',
                        errors.price && 'border-red-500'
                      )}
                    />
                    {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                      placeholder="Минуты"
                      className={cn(
                        'w-full px-3 py-2 bg-card border border-border rounded-sharp outline-none text-sm',
                        errors.duration && 'border-red-500'
                      )}
                    />
                    {errors.duration && <p className="text-xs text-red-500">{errors.duration}</p>}
                  </div>
                </div>
                <button
                  onClick={addService}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-sharp text-sm font-medium"
                >
                  Добавить услугу
                </button>
              </div>

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
                        <p className="text-xs text-gray-400">{service.price}₽ • {service.duration} мин</p>
                      </div>
                      <button
                        onClick={() => removeService(index)}
                        className="p-2 hover:bg-red-500/20 rounded-sharp"
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
            <motion.div key="step-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Портфолио</h3>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/jpeg,image/png"
                multiple
                className="hidden"
              />
              
              <motion.div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-soft p-8 text-center hover:border-white/30 transition-colors cursor-pointer"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex flex-col items-center gap-3">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium">Нажмите или перетащите фото</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG до 5МБ</p>
                  </div>
                </div>
              </motion.div>

              {formData.portfolio.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {formData.portfolio.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-soft overflow-hidden">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="glass p-4 rounded-soft space-y-3 mt-6">
                <h4 className="font-semibold">Итого</h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <p><span className="text-accent">Имя:</span> {formData.name || 'Не задано'}</p>
                  <p><span className="text-accent">Категории:</span> {formData.categories.length} выбрано</p>
                  <p><span className="text-accent">Услуги:</span> {formData.services.length} добавлено</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 glass border-t border-border p-4 safe-area-bottom">
        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="flex-1 py-3 border border-border rounded-soft font-medium hover:bg-white/5"
          >
            Назад
          </button>
          <button
            onClick={handleNext}
            disabled={step === 0 && !formData.name}
            className="flex-1 py-3 bg-accent text-background rounded-soft font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === totalSteps - 1 ? 'Готово' : 'Далее'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}