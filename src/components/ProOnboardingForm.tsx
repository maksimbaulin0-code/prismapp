import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import { type ProProfileData } from '@/lib/api';
import { compressFileToJpegDataUrl } from '@/lib/imageCompress';
import { normalizeSpecialistTelegramInput } from '@/lib/telegramLinks';

export { type ProProfileData };

interface ProOnboardingFormProps {
  initialData?: ProProfileData | null;
  onComplete: (data: ProProfileData) => void;
  onCancel: () => void;
}

function initialFormFromPro(initialData?: ProProfileData | null): ProProfileData {
  return {
    id: initialData?.id,
    user_id: initialData?.user_id,
    name: initialData?.name || '',
    bio: initialData?.bio || '',
    address: initialData?.address || '',
    categories: initialData?.categories || [],
    services: initialData?.services || [],
    portfolio: initialData?.portfolio || [],
    coverImage: initialData?.coverImage || initialData?.portfolio?.[0] || '',
    telegram: initialData?.telegram || '',
  };
}

const CATEGORIES = [
  { id: 'tattoo', name: 'Тату', icon: '🎨' },
  { id: 'nails', name: 'Ногти', icon: '💅' },
  { id: 'piercing', name: 'Пирсинг', icon: '✨' },
  { id: 'makeup', name: 'Макияж', icon: '💄' },
  { id: 'hair', name: 'Волосы', icon: '💇' },
  { id: 'lashes', name: 'Ресницы', icon: '👁️' },
];

export function ProOnboardingForm({ initialData, onComplete, onCancel }: ProOnboardingFormProps) {
  const isEditing = !!initialData;
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<ProProfileData>(() => initialFormFromPro(initialData));
  const [newService, setNewService] = useState({ name: '', price: '', duration: '' });
  const [errors, setErrors] = useState<{ name?: string; price?: string; duration?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else {
      onComplete({
        ...formData,
        address: formData.address?.trim() ?? '',
        telegram: normalizeSpecialistTelegramInput(formData.telegram || ''),
      });
    }
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

    if (!name) { setErrors({ name: 'Введите название' }); return; }
    if (!price || price <= 0) { setErrors({ price: 'Введите цену' }); return; }
    if (!duration || duration <= 0) { setErrors({ duration: 'Введите длительность' }); return; }

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover = false) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          alert('Файл слишком большой (макс 5МБ)');
          continue;
        }
        urls.push(await compressFileToJpegDataUrl(file));
      }
      if (isCover && urls[0]) {
        setFormData((prev) => ({ ...prev, coverImage: urls[0] }));
      } else if (!isCover && urls.length > 0) {
        setFormData((prev) => ({ ...prev, portfolio: [...prev.portfolio, ...urls] }));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Не удалось обработать фото');
    }
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => {
      const newPortfolio = prev.portfolio.filter((_, i) => i !== index);
      const removedUrl = prev.portfolio[index];
      return {
        ...prev,
        portfolio: newPortfolio,
        coverImage: prev.coverImage === removedUrl ? newPortfolio[0] || '' : prev.coverImage,
      };
    });
  };

  const setCoverFromPortfolio = (url: string) => {
    setFormData((prev) => ({ ...prev, coverImage: url }));
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
          <h2 className="text-lg font-semibold">{isEditing ? 'Редактирование профиля' : 'Регистрация мастера'}</h2>
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
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Основная информация</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Название салона / Имя мастера *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-card border border-border rounded-soft outline-none focus:border-white/30"
                    placeholder="Введите название"
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
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Адрес / как добраться</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-card border border-border rounded-soft outline-none focus:border-white/30"
                    placeholder="Город, улица, ориентир"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Telegram для связи</label>
                  <input
                    type="text"
                    value={formData.telegram || ''}
                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                    className="w-full px-4 py-3 bg-card border border-border rounded-soft outline-none focus:border-white/30"
                    placeholder="username, @ник или ссылка t.me/…"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">Символ @ не обязателен</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1: Categories */}
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

          {/* Step 2: Services */}
          {step === 2 && (
            <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">Добавьте услуги</h3>
                <p className="text-sm text-gray-400">Заполните поля и нажмите «Добавить услугу». Можно добавить несколько.</p>
              </div>

              <div className="glass p-4 rounded-soft space-y-3">
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && addService()}
                  placeholder="Название услуги"
                  className={cn(
                    'w-full px-3 py-2 bg-card border border-border rounded-sharp outline-none text-sm',
                    errors.name && 'border-red-500'
                  )}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                <div className="flex gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <input
                      type="number"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && addService()}
                      placeholder="Цена (₽)"
                      className={cn(
                        'w-full min-w-0 px-3 py-2 bg-card border border-border rounded-sharp outline-none text-sm',
                        errors.price && 'border-red-500'
                      )}
                    />
                    {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                  </div>
                  <div className="w-[4.75rem] shrink-0">
                    <input
                      type="number"
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && addService()}
                      placeholder="Мин."
                      inputMode="numeric"
                      className={cn(
                        'w-full min-w-0 px-2 py-2 bg-card border border-border rounded-sharp outline-none text-sm tabular-nums',
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
                  + Добавить услугу
                </button>
              </div>

              {formData.services.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Добавлено услуг: {formData.services.length}</p>
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
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Услуги пока не добавлены
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Portfolio + Cover */}
          {step === 3 && (
            <motion.div key="step-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Портфолио и обложка</h3>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="block text-sm text-gray-400">Обложка для поиска</label>
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={(e) => handlePhotoUpload(e, true)}
                  accept="image/jpeg,image/png"
                  className="hidden"
                />
                {formData.coverImage ? (
                  <div className="relative aspect-video rounded-soft overflow-hidden">
                    <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setFormData((prev) => ({ ...prev, coverImage: '' }))}
                      className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    className="w-full aspect-video border-2 border-dashed border-border rounded-soft flex flex-col items-center justify-center gap-2 hover:border-white/30 transition-colors"
                  >
                    <Camera className="w-8 h-8 text-gray-500" />
                    <span className="text-sm text-gray-400">Загрузить обложку</span>
                  </button>
                )}
              </div>

              {/* Portfolio Photos */}
              <div className="space-y-2">
                <label className="block text-sm text-gray-400">Фото портфолио</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handlePhotoUpload(e)}
                  accept="image/jpeg,image/png"
                  multiple
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 border-2 border-dashed border-border rounded-soft flex items-center justify-center gap-2 hover:border-white/30 transition-colors"
                >
                  <ImageIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-400">Добавить фото в портфолио</span>
                </button>

                {formData.portfolio.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {formData.portfolio.map((photo, index) => (
                      <div key={index} className="relative aspect-square rounded-soft overflow-hidden group">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setCoverFromPortfolio(photo)}
                          className={`absolute bottom-1 left-1 px-2 py-0.5 text-[10px] rounded-full transition-opacity ${
                            formData.coverImage === photo
                              ? 'bg-accent text-background opacity-100'
                              : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {formData.coverImage === photo ? 'Обложка' : 'На обложку'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass p-4 rounded-soft space-y-3 mt-6">
                <h4 className="font-semibold">Итого</h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <p><span className="text-accent">Название:</span> {formData.name || 'Не задано'}</p>
                  <p><span className="text-accent">Категории:</span> {formData.categories.length} выбрано</p>
                  <p><span className="text-accent">Услуги:</span> {formData.services.length} добавлено</p>
                  <p><span className="text-accent">Фото:</span> {formData.portfolio.length} в портфолио</p>
                  <p><span className="text-accent">Обложка:</span> {formData.coverImage ? 'Установлена' : 'Не выбрана'}</p>
                  <p><span className="text-accent">Адрес:</span> {formData.address?.trim() || 'Не указан'}</p>
                  <p><span className="text-accent">Telegram:</span> {formData.telegram || 'Не указан'}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 glass border-t border-border p-4 safe-area-bottom">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 py-3 border border-border rounded-soft font-medium hover:bg-white/5"
          >
            {step === 0 ? 'Отмена' : 'Назад'}
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={step === 0 && !formData.name}
            className="flex-1 py-3 bg-accent text-background rounded-soft font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === totalSteps - 1 ? (isEditing ? 'Сохранить' : 'Готово') : 'Далее'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
