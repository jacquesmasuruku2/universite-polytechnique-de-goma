
import React, { useState, useMemo } from 'react';
import { FormStep, RegistrationData } from '../types';
import { FACULTIES } from '../constants';
import { CheckCircle2, ChevronRight, ChevronLeft, Upload, User, Camera, BookOpen, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

const RegistrationForm: React.FC = () => {
  const [step, setStep] = useState<FormStep>(FormStep.IDENTITY);
  const [formData, setFormData] = useState<Partial<RegistrationData>>({
    gender: 'M',
    maritalStatus: 'Célibataire'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  const availableDepartments = useMemo(() => {
    const faculty = FACULTIES.find(f => f.name === formData.targetFaculty);
    return faculty ? faculty.departments : [];
  }, [formData.targetFaculty]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorFeedback) setErrorFeedback(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    if (name === 'passportPhoto') {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("La photo passeport ne doit pas dépasser 5Mo.");
        e.target.value = "";
        return;
      }
      setFormData({ ...formData, passportPhoto: file });
    } else {
      setFormData({ ...formData, documents: files });
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === FormStep.IDENTITY) setStep(FormStep.ACADEMIC);
    else if (step === FormStep.ACADEMIC) setStep(FormStep.DOCUMENTS);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConfigured()) {
      setErrorFeedback("Veuillez configurer vos clés Supabase réelles dans supabaseClient.ts avant de soumettre.");
      return;
    }

    setIsSubmitting(true);
    setErrorFeedback(null);
    
    try {
      let passportPhotoUrl = "";
      
      // 1. Upload de la photo vers le bucket 'passport_photos'
      if (formData.passportPhoto) {
        const fileExt = formData.passportPhoto.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('passport_photos')
          .upload(fileName, formData.passportPhoto);
        
        if (uploadError) {
          throw new Error(`Erreur Upload Photo: ${uploadError.message}. Avez-vous créé le bucket 'passport_photos' ?`);
        }
        passportPhotoUrl = uploadData.path;
      }

      // 2. Insertion des données
      const { error } = await supabase.from('registrations').insert([
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          marital_status: formData.maritalStatus,
          birth_date: formData.birthDate,
          birth_place: formData.birthPlace,
          previous_school: formData.previousSchool,
          target_faculty: formData.targetFaculty,
          target_department: formData.targetDepartment,
          passport_photo_url: passportPhotoUrl,
        }
      ]);

      if (error) throw error;
      setStep(FormStep.CONFIRMATION);
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      setErrorFeedback(error.message || "Erreur de connexion au serveur. Vérifiez votre configuration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === FormStep.CONFIRMATION) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-xl text-center max-w-2xl mx-auto border-t-8 border-upgGold transition-colors">
        <div className="bg-green-100 dark:bg-green-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-upgBlue dark:text-white mb-4">Pré-inscription Enregistrée !</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          Merci <strong>{formData.firstName} {formData.lastName}</strong>. Votre dossier pour la faculté de <strong>{formData.targetFaculty}</strong> ({formData.targetDepartment}) a été transmis avec succès.
        </p>
        <button 
          onClick={() => { setFormData({}); setStep(FormStep.IDENTITY); setErrorFeedback(null); }}
          className="bg-upgBlue dark:bg-upgGold dark:text-upgBlue text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg"
        >
          Nouvelle Inscription
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-w-5xl mx-auto flex flex-col md:flex-row min-h-[700px] transition-colors border border-slate-100 dark:border-slate-800">
      <div className="bg-upgBlue dark:bg-slate-950 md:w-1/4 p-8 text-white flex flex-col justify-between border-r border-white/5">
        <div>
          <h2 className="text-2xl font-bold mb-12 tracking-tighter">Portail<br/><span className="text-upgGold">Admission</span></h2>
          <div className="space-y-10 relative">
            <div className={`flex items-center gap-4 transition-all ${step === FormStep.IDENTITY ? 'scale-110' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${step === FormStep.IDENTITY ? 'bg-upgGold border-upgGold text-upgBlue' : 'border-white'}`}>1</div>
              <span className="text-sm font-bold uppercase tracking-widest">Identité</span>
            </div>
            <div className={`flex items-center gap-4 transition-all ${step === FormStep.ACADEMIC ? 'scale-110' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${step === FormStep.ACADEMIC ? 'bg-upgGold border-upgGold text-upgBlue' : 'border-white'}`}>2</div>
              <span className="text-sm font-bold uppercase tracking-widest">Cursus</span>
            </div>
            <div className={`flex items-center gap-4 transition-all ${step === FormStep.DOCUMENTS ? 'scale-110' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${step === FormStep.DOCUMENTS ? 'bg-upgGold border-upgGold text-upgBlue' : 'border-white'}`}>3</div>
              <span className="text-sm font-bold uppercase tracking-widest">Pièces</span>
            </div>
          </div>
        </div>
        <div className="text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold">
          Designed by UPG 2026
        </div>
      </div>

      <form onSubmit={step === FormStep.DOCUMENTS ? handleSubmit : handleNext} className="p-8 md:p-12 flex-1 space-y-6">
        {errorFeedback && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-xs text-red-700 dark:text-red-400 font-semibold">{errorFeedback}</p>
          </div>
        )}

        {step === FormStep.IDENTITY && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-3 border-b dark:border-slate-800 pb-4">
              <User className="text-upgGold" size={24} />
              <h3 className="text-xl font-bold text-upgBlue dark:text-white uppercase tracking-tight">Informations Personnelles</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Prénom</label>
                <input required name="firstName" value={formData.firstName || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-upgGold dark:text-white" placeholder="Prénom" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nom & Post-nom</label>
                <input required name="lastName" value={formData.lastName || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-upgGold dark:text-white" placeholder="Nom complet" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sexe</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-upgGold dark:text-white">
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">État Civil</label>
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-upgGold dark:text-white">
                  <option value="Célibataire">Célibataire</option>
                  <option value="Marié(e)">Marié(e)</option>
                  <option value="Divorcé(e)">Divorcé(e)</option>
                  <option value="Veuf(ve)">Veuf(ve)</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Date de Naissance</label>
                <input required type="date" name="birthDate" value={formData.birthDate || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-upgGold dark:text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Lieu de Naissance</label>
              <input required name="birthPlace" value={formData.birthPlace || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-upgGold dark:text-white" placeholder="Ville ou Territoire" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Numéro de Téléphone</label>
                <input required type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-upgGold dark:text-white font-mono" placeholder="+243973380XXX" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Email Académique/Perso</label>
                <input required type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-upgGold dark:text-white" placeholder="exemple@mail.com" />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button type="submit" className="flex items-center gap-2 bg-upgBlue dark:bg-upgGold dark:text-upgBlue text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg">
                Continuer <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === FormStep.ACADEMIC && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-3 border-b dark:border-slate-800 pb-4">
              <BookOpen className="text-upgGold" size={24} />
              <h3 className="text-xl font-bold text-upgBlue dark:text-white uppercase tracking-tight">Parcours & Orientation</h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">École de Provenance (Humanités)</label>
              <input required name="previousSchool" value={formData.previousSchool || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-upgGold dark:text-white" placeholder="Nom de l'Institut / Complexe Scolaire" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Faculté / Domaine</label>
                <select required name="targetFaculty" value={formData.targetFaculty || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-upgGold dark:text-white">
                  <option value="">Choisir un Domaine</option>
                  {FACULTIES.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Filière spécifique</label>
                <select 
                  required 
                  name="targetDepartment" 
                  value={formData.targetDepartment || ''} 
                  onChange={handleChange} 
                  disabled={!formData.targetFaculty}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-upgGold dark:text-white transition-opacity ${!formData.targetFaculty ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                >
                  <option value="">{formData.targetFaculty ? 'Choisir la filière' : 'Sélectionnez d\'abord une faculté'}</option>
                  {availableDepartments.map((dept, i) => (
                    <option key={i} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-10">
              <button type="button" onClick={() => setStep(FormStep.IDENTITY)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-upgBlue dark:hover:text-upgGold transition-all">
                <ChevronLeft size={20} /> Retour
              </button>
              <button type="submit" className="flex items-center gap-2 bg-upgBlue dark:bg-upgGold dark:text-upgBlue text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg">
                Suivant <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === FormStep.DOCUMENTS && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-3 border-b dark:border-slate-800 pb-4">
              <Camera className="text-upgGold" size={24} />
              <h3 className="text-xl font-bold text-upgBlue dark:text-white uppercase tracking-tight">Pièces Justificatives</h3>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Photo Passeport (Format identité - Max 5Mo)</label>
              <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-upgGold transition-all">
                <div className="w-20 h-24 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden relative group">
                  {formData.passportPhoto ? (
                    <img src={URL.createObjectURL(formData.passportPhoto)} className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="text-slate-300" size={32} />
                  )}
                </div>
                <div className="flex-1">
                  <input type="file" name="passportPhoto" accept="image/*" onChange={handleFileChange} className="hidden" id="photo-upload" />
                  <label htmlFor="photo-upload" className="bg-upgBlue dark:bg-upgGold text-white dark:text-upgBlue px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:opacity-90 transition-all inline-block">
                    {formData.passportPhoto ? 'Changer la photo' : 'Charger ma photo'}
                  </label>
                  <p className="text-[10px] text-slate-400 mt-2 italic">Format recommandé: 4x4 ou 3.5x4.5 (JPG, PNG)</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Dossier Académique (PDF)</label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center hover:border-upgGold transition-all cursor-pointer group bg-slate-50 dark:bg-slate-800">
                <input type="file" multiple name="documents" onChange={handleFileChange} className="hidden" id="docs-upload" />
                <label htmlFor="docs-upload" className="cursor-pointer">
                  <Upload className="mx-auto mb-4 text-slate-400 group-hover:text-upgGold transition-all" size={40} />
                  <span className="block text-sm font-bold text-slate-600 dark:text-slate-300">Cliquez pour joindre vos documents</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-10">
              <button type="button" onClick={() => setStep(FormStep.ACADEMIC)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-upgBlue dark:hover:text-upgGold transition-all">
                <ChevronLeft size={20} /> Retour
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || !formData.passportPhoto}
                className={`flex items-center justify-center gap-3 bg-upgGold text-upgBlue px-10 py-4 rounded-2xl font-bold transition-all shadow-xl min-w-[200px] ${isSubmitting || !formData.passportPhoto ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:bg-upgLightGold'}`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-upgBlue border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>Finaliser l'Inscription <CheckCircle2 size={20} /></>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default RegistrationForm;
