import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      general: {
        english: 'English',
        arabic: 'Arabic',
      },
      ai_assistant: {
        proofread: 'Proofread',
        rewrite: 'Rewrite',
        friendly: 'Friendly',
        professional: 'Professional',
        concise: 'Concise',
        compose: 'Compose',
        compose_placeholder: 'Describe what to write…',
        writing_tools: 'Writing Tools',
        auto_translation: 'Auto Translation',
        go_back: 'Go back',
        confirm: 'Confirm',
        show_original: 'Show original',
        show_rewrite: 'Show rewrite',
        original: 'Original',
        like: 'Like',
        dislike: 'Dislike',
        share_feedback: 'Share feedback',
        enter_text_to_rewrite: 'Please enter text to rewrite',
        enter_text_to_translate: 'Please enter text to translate',
        enter_text_to_compose: 'Please enter a prompt to compose',
        enter_english_to_add_to_chat: 'Please enter English text to add to chat',
        enter_arabic_to_add_to_chat: 'Please enter Arabic text to add to chat',
        add_to_chat: 'Add to chat',
        translation_failed: 'Translation failed. Please try again.',
        something_went_wrong: 'Something went wrong. Please try again.',
      },
    },
  },
  ar: {
    translation: {
      general: {
        english: 'English',
        arabic: 'Arabic',
      },
      ai_assistant: {
        proofread: 'تدقيق',
        rewrite: 'إعادة صياغة',
        friendly: 'ودود',
        professional: 'احترافي',
        concise: 'موجز',
        compose: 'كتابة',
        compose_placeholder: 'صف ما تريد كتابته…',
        writing_tools: 'أدوات الكتابة',
        auto_translation: 'ترجمة تلقائية',
        go_back: 'رجوع',
        confirm: 'تأكيد',
        show_original: 'إظهار النص الأصلي',
        show_rewrite: 'إظهار إعادة الصياغة',
        original: 'الأصلي',
        like: 'إعجاب',
        dislike: 'عدم إعجاب',
        share_feedback: 'شاركنا رأيك',
        enter_text_to_rewrite: 'الرجاء إدخال نص لإعادة صياغته',
        enter_text_to_translate: 'الرجاء إدخال نص للترجمة',
        enter_text_to_compose: 'الرجاء إدخال وصف للكتابة',
        enter_english_to_add_to_chat: 'الرجاء إدخال نص إنجليزي لإضافته إلى الدردشة',
        enter_arabic_to_add_to_chat: 'الرجاء إدخال نص عربي لإضافته إلى الدردشة',
        add_to_chat: 'إضافة إلى الدردشة',
        translation_failed: 'فشلت الترجمة. حاول مرة أخرى.',
        something_went_wrong: 'حدث خطأ ما. حاول مرة أخرى.',
      },
    },
  },
};

void i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
