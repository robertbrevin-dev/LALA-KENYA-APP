import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'sw' | 'fr' | 'es' | 'zh' | 'ar' | 'hi';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

export const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.explore': 'Explore',
    'nav.favorites': 'Favorites',
    'nav.inbox': 'Inbox',
    'nav.profile': 'Profile',
    'nav.host': 'Host',
    
    // Authentication
    'auth.welcome_back': 'Welcome back',
    'auth.sign_in_to_account': 'Sign in to your LALA account',
    'auth.continue_with_google': 'Continue with Google',
    'auth.or_continue_with': 'or continue with',
    'auth.email': 'Email',
    'auth.phone': 'Phone',
    'auth.password': 'Password',
    'auth.full_name': 'Full Name',
    'auth.email_address': 'Email Address',
    'auth.phone_number': 'Phone Number',
    'auth.remember_me': 'Remember me',
    'auth.forgot_password': 'Forgot password?',
    'auth.sign_in': 'Sign In',
    'auth.create_account': 'Create free account',
    'auth.back_to_home': '← Back to home',
    'auth.join_lala_kenya': 'Join LALA Kenya',
    'auth.how_use_lala': 'How would you like to use LALA?',
    'auth.im_guest': "I'm a Guest",
    'auth.im_host': "I'm a Host",
    'auth.find_book_stays': 'Find and book stays',
    'auth.list_space_earn': 'List your space & earn',
    'auth.already_have_account': 'Already have an account?',
    'auth.sign_up': 'Sign up',
    'auth.continue_as_guest': 'Or continue as guest – Browse properties →',
    'auth.guest_account': 'Guest Account',
    'auth.book_verified_stays': 'Book verified short stays across Nairobi',
    'auth.host_account': 'Host Account',
    'auth.personal_details': 'Personal details',
    'auth.business_details': 'Business Details',
    'auth.step_of': 'Step {step} of 2 —',
    'auth.send_code_sms': 'Send Code via SMS 📲',
    'auth.send_verification_sms': 'Send Verification SMS 📲',
    'auth.check_messages': 'Check your messages',
    'auth.code_sent_to': 'We sent a 6-digit code to',
    'auth.enter_all_digits': 'Enter all 6 digits',
    'auth.verifying': 'Verifying...',
    'auth.resend_code': 'Resend code',
    'auth.change_number': '← Change number',
    'auth.resend_in': 'Resend code in {resend}s',
    'auth.create_guest_account': 'Create Guest Account →',
    'auth.create_host_account': '🏠 Create Host Account →',
    'auth.creating_account': 'Creating account...',
    'auth.signing_in': 'Signing in...',
    'auth.opening_google': 'Opening Google...',
    'auth.sending_sms': 'Sending SMS...',
    'auth.almost_there': 'Almost there!',
    'auth.verification_link_sent': 'We sent a verification link to',
    'auth.check_spam': 'Click the link in your email to activate your account. Check your spam folder if you don\'t see it.',
    'auth.go_to_login': 'Go to Login →',
    'auth.host_account_created': 'Host account created!',
    'auth.verify_then_list': 'Verify your email then start listing your properties and earning with LALA Kenya.',
    'auth.business_property_name': 'BUSINESS / PROPERTY NAME',
    'auth.kra_pin': 'KRA PIN',
    'auth.optional_payouts': '(Optional — needed for payouts)',
    'auth.host_benefits': '✨ HOST BENEFITS',
    'auth.lala_commission': '🔐 LALA Commission: 10%',
    'auth.commission_info': 'We only earn when you earn. No upfront fees.',
    'auth.agree_host_terms': 'I agree to LALA Kenya\'s Host Terms, Privacy Policy, and 10% commission structure',
    'auth.agree_terms': 'I agree to LALA Kenya\'s Terms of Service and Privacy Policy',
    'auth.terms_of_service': 'Terms of Service',
    'auth.privacy_policy': 'Privacy Policy',
    'auth.host_terms': 'Host Terms',
    'auth.min_characters': 'Min. 6 characters',
    'auth.enter_valid_email': 'Enter a valid email address',
    'auth.enter_full_name': 'Please enter your full name',
    'auth.enter_email_address': 'Please enter your email address',
    'auth.enter_password': 'Please enter your password',
    'auth.enter_valid_phone': 'Enter a valid phone number',
    'auth.agree_to_terms': 'Please agree to the Terms & Privacy Policy to continue',
    'auth.agree_host_terms_continue': 'Please agree to Host Terms to continue',
    'auth.enter_business_name': 'Please enter your business or property name',
    'auth.password_min_length': 'Password must be at least 6 characters',
    'auth.popup_blocked': 'Popup blocked. Please allow popups and try again.',
    'auth.enter_digits': 'Enter all 6 digits',
    'auth.weak': 'Weak',
    'auth.good': 'Good',
    'auth.strong': 'Strong',
    'auth.phone_login_requires_sms': '📞 Phone login requires SMS to be enabled in Supabase. No password needed — just your number and the code we send.',
    'auth.sms_will_be_sent': 'SMS code will be sent to',
    'auth.continue': 'Continue →',
    'auth.previous_step': 'Previous step',
    'auth.back': '← Back',
    
    // Language
    'lang.select_language': 'Select Language',
    'lang.english': 'English',
    'lang.swahili': 'Kiswahili',
    'lang.french': 'Français',
    'lang.spanish': 'Español',
    'lang.chinese': '中文',
    'lang.arabic': 'العربية',
    'lang.hindi': 'हिन्दी',
  },
  sw: {
    // Navigation
    'nav.home': 'Nyumbani',
    'nav.explore': 'Chunguza',
    'nav.favorites': 'Vipendwa',
    'nav.inbox': 'Sanda',
    'nav.profile': 'Wasifu',
    'nav.host': 'Mwenyeji',
    
    // Authentication
    'auth.welcome_back': 'Karibu tena',
    'auth.sign_in_to_account': 'Ingia kwenye akaunti yako ya LALA',
    'auth.continue_with_google': 'Endelea na Google',
    'auth.or_continue_with': 'au endelea na',
    'auth.email': 'Barua pepe',
    'auth.phone': 'Simu',
    'auth.password': 'Nywila',
    'auth.full_name': 'Jina Kamili',
    'auth.email_address': 'Anwani ya Barua pepe',
    'auth.phone_number': 'Namba ya Simu',
    'auth.remember_me': 'Nikumbuke',
    'auth.forgot_password': 'Umesahau nywila?',
    'auth.sign_in': 'Ingia',
    'auth.create_account': 'Unda akaunti ya bure',
    'auth.back_to_home': '← Rudi nyumbani',
    'auth.join_lala_kenya': 'Jiunge na LALA Kenya',
    'auth.how_use_lala': 'Unataka kutumia LALA vipi?',
    'auth.im_guest': 'Mimi ni Mgeni',
    'auth.im_host': 'Mimi ni Mwenyeji',
    'auth.find_book_stays': 'Tafuta na weka nafasi za kukaa',
    'auth.list_space_earn': 'Orodhesha sehemu yako na pata pesa',
    'auth.already_have_account': 'Tayari una akaunti?',
    'auth.sign_up': 'Jiunge',
    'auth.continue_as_guest': 'Au endelea kama mgeni – Chunguza mali →',
    'auth.guest_account': 'Akaunti ya Mgeni',
    'auth.book_verified_stays': 'Weka nafasi za kukaa zilizohakikishwa hapa Nairobi',
    'auth.host_account': 'Akaunti ya Mwenyeji',
    'auth.personal_details': 'Maelezo ya kibinafsi',
    'auth.business_details': 'Maelezo ya Biashara',
    'auth.step_of': 'Hatua {step} ya 2 —',
    'auth.send_code_sms': 'Tuma nambari kwa SMS 📲',
    'auth.send_verification_sms': 'Tuma nambari ya uthibitisho kwa SMS 📲',
    'auth.check_messages': 'Angalia ujumbe wako',
    'auth.code_sent_to': 'Tumetuma nambari ya tarakimu 6 kwa',
    'auth.enter_all_digits': 'Ingiza tarakimu zote 6',
    'auth.verifying': 'Inathibitisha...',
    'auth.resend_code': 'Tuma tena nambari',
    'auth.change_number': '← Badilisha nambari',
    'auth.resend_in': 'Tuma tena baada ya {resend}s',
    'auth.create_guest_account': 'Unda Akaunti ya Mgeni →',
    'auth.create_host_account': '🏠 Unda Akaunti ya Mwenyeji →',
    'auth.creating_account': 'Inaunda akaunti...',
    'auth.signing_in': 'Inaingia...',
    'auth.opening_google': 'Inafungua Google...',
    'auth.sending_sms': 'Inatuma SMS...',
    'auth.almost_there': 'Karibu kukamilika!',
    'auth.verification_link_sent': 'Tumetuma kiungo cha uthibitisho kwa',
    'auth.check_spam': 'Bofya kiungo katika barua pepe yako kuwasha akaunti yako. Angalia folda la spam ikiwa hulioni.',
    'auth.go_to_login': 'Nenda kwenye Ingia →',
    'auth.host_account_created': 'Akaunti ya mwenyeji imeundwa!',
    'auth.verify_then_list': 'Thibitisha barua pepe yako kisha uanze kuorodhesha mali yako na kupata pesa na LALA Kenya.',
    'auth.business_property_name': 'JINA LA BIASHARA / MALI',
    'auth.kra_pin': 'KRA PIN',
    'auth.optional_payouts': '(Hiari - inahitajika kwa malipo)',
    'auth.host_benefits': '✨ MANUFAA YA MWENYEJI',
    'auth.lala_commission': '🔐 Tume ya LALA: 10%',
    'auth.commission_info': 'Tunapata pesa tu unapopata pesa. Hakuna ada ya awali.',
    'auth.agree_host_terms': 'Nakubali Masharti ya Mwenyeji ya LALA Kenya, Sera ya Faragha, na muundo wa tume ya 10%',
    'auth.agree_terms': 'Nakubali Masharti ya Huduma na Sera ya Faragha ya LALA Kenya',
    'auth.terms_of_service': 'Masharti ya Huduma',
    'auth.privacy_policy': 'Sera ya Faragha',
    'auth.host_terms': 'Masharti ya Mwenyeji',
    'auth.min_characters': 'Yasi chini ya tarakimu 6',
    'auth.enter_valid_email': 'Ingiza anwani halali ya barua pepe',
    'auth.enter_full_name': 'Tafadhali ingiza jina lako kamili',
    'auth.enter_email_address': 'Tafadhali ingiza anwani yako ya barua pepe',
    'auth.enter_password': 'Tafadhali ingiza nywila yako',
    'auth.enter_valid_phone': 'Ingiza nambari halali ya simu',
    'auth.agree_to_terms': 'Tafadhali kukubali Masharti & Sera ya Faragha kuendelea',
    'auth.agree_host_terms_continue': 'Tafadhali kukubali Masharti ya Mwenyeji kuendelea',
    'auth.enter_business_name': 'Tafadhali ingiza jina la biashara au mali yako',
    'auth.password_min_length': 'Nywila inahitaji kuwa na tarakimu 6 angalau',
    'auth.popup_blocked': 'Imezibwa popup. Tafadhali ruhusu popups na ujaribu tena.',
    'auth.enter_digits': 'Ingiza tarakimu zote 6',
    'auth.weak': 'Dhaifu',
    'auth.good': 'Yavuti',
    'auth.strong': 'Imara',
    'auth.phone_login_requires_sms': '📞 Ingia kwa simu inahitaji SMS kuwashwa katika Supabase. Hakuna nywila inahitajika — tu nambari yako na nambari tutakayotuma.',
    'auth.sms_will_be_sent': 'Nambari ya SMS itatumwa kwa',
    'auth.continue': 'Endelea →',
    'auth.previous_step': 'Hatua ya awali',
    'auth.back': '← Rudi',
    
    // Language
    'lang.select_language': 'Chagua Lugha',
    'lang.english': 'English',
    'lang.swahili': 'Kiswahili',
    'lang.french': 'Français',
    'lang.spanish': 'Español',
    'lang.chinese': '中文',
    'lang.arabic': 'العربية',
    'lang.hindi': 'हिन्दी',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.explore': 'Explorer',
    'nav.favorites': 'Favoris',
    'nav.inbox': 'Boîte de réception',
    'nav.profile': 'Profil',
    'nav.host': 'Hôte',
    
    // Authentication
    'auth.welcome_back': 'Bon retour',
    'auth.sign_in_to_account': 'Connectez-vous à votre compte LALA',
    'auth.continue_with_google': 'Continuer avec Google',
    'auth.or_continue_with': 'ou continuer avec',
    'auth.email': 'Email',
    'auth.phone': 'Téléphone',
    'auth.password': 'Mot de passe',
    'auth.full_name': 'Nom complet',
    'auth.email_address': 'Adresse email',
    'auth.phone_number': 'Numéro de téléphone',
    'auth.remember_me': 'Se souvenir de moi',
    'auth.forgot_password': 'Mot de passe oublié?',
    'auth.sign_in': 'Se connecter',
    'auth.create_account': 'Créer un compte gratuit',
    'auth.back_to_home': '← Retour à l\'accueil',
    'auth.join_lala_kenya': 'Rejoindre LALA Kenya',
    'auth.how_use_lala': 'Comment souhaitez-vous utiliser LALA?',
    'auth.im_guest': 'Je suis un invité',
    'auth.im_host': 'Je suis un hôte',
    'auth.find_book_stays': 'Trouver et réserver des séjours',
    'auth.list_space_earn': 'Lister votre espace et gagner',
    'auth.already_have_account': 'Vous avez déjà un compte?',
    'auth.sign_up': 'S\'inscrire',
    'auth.continue_as_guest': 'Ou continuer comme invité – Parcourir les propriétés →',
    'auth.guest_account': 'Compte invité',
    'auth.book_verified_stays': 'Réserver des séjours vérifiés à Nairobi',
    'auth.host_account': 'Compte hôte',
    'auth.personal_details': 'Détails personnels',
    'auth.business_details': 'Détails de l\'entreprise',
    'auth.step_of': 'Étape {step} sur 2 —',
    'auth.send_code_sms': 'Envoyer le code par SMS 📲',
    'auth.send_verification_sms': 'Envoyer le SMS de vérification 📲',
    'auth.check_messages': 'Vérifiez vos messages',
    'auth.code_sent_to': 'Nous avons envoyé un code à 6 chiffres à',
    'auth.enter_all_digits': 'Entrez tous les 6 chiffres',
    'auth.verifying': 'Vérification...',
    'auth.resend_code': 'Renvoyer le code',
    'auth.change_number': '← Changer de numéro',
    'auth.resend_in': 'Renvoyer dans {resend}s',
    'auth.create_guest_account': 'Créer un compte invité →',
    'auth.create_host_account': '🏠 Créer un compte hôte →',
    'auth.creating_account': 'Création du compte...',
    'auth.signing_in': 'Connexion...',
    'auth.opening_google': 'Ouverture de Google...',
    'auth.sending_sms': 'Envoi du SMS...',
    'auth.almost_there': 'Presque terminé!',
    'auth.verification_link_sent': 'Nous avons envoyé un lien de vérification à',
    'auth.check_spam': 'Cliquez sur le lien dans votre email pour activer votre compte. Vérifiez votre dossier spam si vous ne le voyez pas.',
    'auth.go_to_login': 'Aller à la connexion →',
    'auth.host_account_created': 'Compte hôte créé!',
    'auth.verify_then_list': 'Vérifiez votre email puis commencez à lister vos propriétés et à gagner avec LALA Kenya.',
    'auth.business_property_name': 'NOM DE L\'ENTREPRISE / PROPRIÉTÉ',
    'auth.kra_pin': 'KRA PIN',
    'auth.optional_payouts': '(Optionnel — nécessaire pour les paiements)',
    'auth.host_benefits': '✨ AVANTAGES HÔTE',
    'auth.lala_commission': '🔐 Commission LALA: 10%',
    'auth.commission_info': 'Nous ne gagnons que lorsque vous gagnez. Aucuns frais initiaux.',
    'auth.agree_host_terms': 'J\'accepte les Conditions Hôte de LALA Kenya, la Politique de Confidentialité, et la structure de commission de 10%',
    'auth.agree_terms': 'J\'accepte les Conditions d\'Utilisation et la Politique de Confidentialité de LALA Kenya',
    'auth.terms_of_service': 'Conditions d\'Utilisation',
    'auth.privacy_policy': 'Politique de Confidentialité',
    'auth.host_terms': 'Conditions Hôte',
    'auth.min_characters': 'Min. 6 caractères',
    'auth.enter_valid_email': 'Entrez une adresse email valide',
    'auth.enter_full_name': 'Veuillez entrer votre nom complet',
    'auth.enter_email_address': 'Veuillez entrer votre adresse email',
    'auth.enter_password': 'Veuillez entrer votre mot de passe',
    'auth.enter_valid_phone': 'Entrez un numéro de téléphone valide',
    'auth.agree_to_terms': 'Veuillez accepter les Conditions & Politique de Confidentialité pour continuer',
    'auth.agree_host_terms_continue': 'Veuillez accepter les Conditions Hôte pour continuer',
    'auth.enter_business_name': 'Veuillez entrer le nom de votre entreprise ou propriété',
    'auth.password_min_length': 'Le mot de passe doit contenir au moins 6 caractères',
    'auth.popup_blocked': 'Popup bloqué. Veuillez autoriser les popups et réessayer.',
    'auth.enter_digits': 'Entrez tous les 6 chiffres',
    'auth.weak': 'Faible',
    'auth.good': 'Bon',
    'auth.strong': 'Fort',
    'auth.phone_login_requires_sms': '📞 La connexion par téléphone nécessite que SMS soit activé dans Supabase. Aucun mot de passe nécessaire — juste votre numéro et le code que nous envoyons.',
    'auth.sms_will_be_sent': 'Le code SMS sera envoyé à',
    'auth.continue': 'Continuer →',
    'auth.previous_step': 'Étape précédente',
    'auth.back': '← Retour',
    
    // Language
    'lang.select_language': 'Sélectionner la langue',
    'lang.english': 'English',
    'lang.swahili': 'Kiswahili',
    'lang.french': 'Français',
    'lang.spanish': 'Español',
    'lang.chinese': '中文',
    'lang.arabic': 'العربية',
    'lang.hindi': 'हिन्दी',
  },
} as const;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  currentLanguageConfig: LanguageConfig;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('lala-language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lala-language', lang);
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    const translation = translations[language]?.[key] || translations.en[key] || key;
    
    if (params) {
      return Object.entries(params).reduce(
        (str, [param, value]) => str.replace(new RegExp(`{${param}}`, 'g'), String(value)),
        translation
      );
    }
    
    return translation;
  };

  const currentLanguageConfig = LANGUAGES.find(lang => lang.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLanguageConfig }}>
      {children}
    </LanguageContext.Provider>
  );
}
