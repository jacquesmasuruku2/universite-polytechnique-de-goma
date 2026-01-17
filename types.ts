
export interface Faculty {
  id: string;
  name: string;
  description: string;
  departments: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  content: string;
  image?: string;
  category: 'Actualité' | 'Événement' | 'Annonce';
}

export interface NavItem {
  label: string;
  href: string;
}

export enum FormStep {
  IDENTITY = 'IDENTITY',
  ACADEMIC = 'ACADEMIC',
  DOCUMENTS = 'DOCUMENTS',
  CONFIRMATION = 'CONFIRMATION'
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  middleName: string; // Ajouté pour le Post-nom
  email: string;
  phone: string;
  birthDate: string;
  birthPlace: string;
  gender: 'M' | 'F';
  maritalStatus: 'Célibataire' | 'Marié(e)' | 'Divorcé(e)' | 'Veuf(ve)';
  previousSchool: string;
  targetFaculty: string;
  targetDepartment: string;
  passportPhoto: File | null;
  documents: FileList | null;
}
