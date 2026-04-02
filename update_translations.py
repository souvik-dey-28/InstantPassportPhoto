import json
import os

i18n_path = r'I:\deepakguptabca\InstantPhotos\static\translations\i18n.json'

with open(i18n_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# The new keys that exist in 'en'
en_keys = {
    "li_title": "💼 LinkedIn Profile Frame Generator",
    "li_hint": "Customize your LinkedIn profile picture with a banner or frame in just a few clicks.",
    "li_click_hint": "Click canvas or use the uploader →",
    "li_download": "⬇️ Download Image",
    "li_upload_title": "📁 Upload Photo",
    "li_remove_bg": "✨ Remove Background (AI)",
    "li_banner_color": "🎨 Banner Color (Hex)",
    "li_text_color": "🖊️ Text Color (Hex)",
    "li_bg_pattern": "🖼️ Background Pattern",
    "li_banner_text": "✍️ Banner Text",
    "li_banner_text_placeholder": "#CashNee",
    "li_adjust_photo": "✂️ Adjust Photo"
}

# Simplified translations for demonstration. 
# We'll put a language indicator so it's visibly translated, or try actual translations.
translations_map = {
    "hi": {"li_title":"💼 लिंक्डइन प्रोफाइल फ्रेम जेनरेटर", "li_hint":"कुछ ही क्लिक में अपनी लिंक्डइन प्रोफाइल तस्वीर को कस्टमाइज़ करें।", "li_click_hint":"कैनवास पर क्लिक करें या अपलोडर का उपयोग करें →", "li_download":"⬇️ छवि डाउनलोड करें", "li_upload_title":"📁 फोटो अपलोड करें", "li_remove_bg":"✨ पृष्ठभूमि हटाएं (AI)", "li_banner_color":"🎨 बैनर रंग (हेक्स)", "li_text_color":"🖊️ टेक्स्ट रंग (हेक्स)", "li_bg_pattern":"🖼️ पृष्ठभूमि पैटर्न", "li_banner_text":"✍️ बैनर टेक्स्ट", "li_adjust_photo":"✂️ फोटो समायोजित करें"},
    "bn": {"li_title":"💼 লিঙ্কডইন প্রোফাইল ফ্রেম জেনারেটর", "li_hint":"কয়েকটি ক্লিকে আপনার লিঙ্কডইন প্রোফাইল ছবি কাস্টমাইজ করুন।", "li_click_hint":"ক্যানভাসে ক্লিক করুন অথবা আপলোডার ব্যবহার করুন →", "li_download":"⬇️ ছবি ডাউনলোড করুন", "li_upload_title":"📁 ছবি আপলোড করুন", "li_remove_bg":"✨ পটভূমি সরান (AI)", "li_banner_color":"🎨 ব্যানার রঙ (হেক্স)", "li_text_color":"🖊️ টেক্সট রঙ (হেক্স)", "li_bg_pattern":"🖼️ পটভূমি প্যাটার্ন", "li_banner_text":"✍️ ব্যানার টেক্সট", "li_adjust_photo":"✂️ ছবি সামঞ্জস্য করুন"},
    "ta": {"li_title":"💼 லிங்க்ட்இன் சுயவிவர சட்ட ஜெனரேட்டர்", "li_hint":"உங்கள் லிங்க்ட்இன் சுயவிவரப் படத்தை சில கிளிக்குகளில் தனிப்பயனாக்குங்கள்.", "li_click_hint":"கேன்வாஸைக் கிளிக் செய்யவும் அல்லது பதிவேற்றியைப் பயன்படுத்தவும் →", "li_download":"⬇️ படத்தைப் பதிவிறக்குக", "li_upload_title":"📁 புகைப்படத்தைப் பதிவேற்றவும்", "li_remove_bg":"✨ பின்னணியை அகற்று (AI)", "li_banner_color":"🎨 பேனர் நிறம் (ஹெக்ஸ்)", "li_text_color":"🖊️ உரை நிறம் (ஹெக்ஸ்)", "li_bg_pattern":"🖼️ பின்னணி முறை", "li_banner_text":"✍️ பேனர் உரை", "li_adjust_photo":"✂️ புகைப்படத்தை சரிசெய்யவும்"},
    "gu": {"li_title":"💼 લિંક્ડઇન પ્રોફાઇલ ફ્રેમ જનરેટર", "li_hint":"માત્ર થોડી ક્લિક્સમાં તમારા લિંક્ડઇન પ્રોફાઇલ ચિત્રને કસ્ટમાઇઝ કરો.", "li_upload_title":"📁 ફોટો અપલોડ કરો", "li_download":"⬇️ છબી ડાઉનલોડ કરો"},
    "fr": {"li_title":"💼 Générateur de cadres LinkedIn", "li_hint":"Personnalisez votre photo de profil LinkedIn en quelques clics.", "li_click_hint":"Cliquez sur le canevas ou utilisez l'outil de téléchargement →", "li_download":"⬇️ Télécharger l'image", "li_upload_title":"📁 Télécharger une photo", "li_remove_bg":"✨ Supprimer l'arrière-plan (IA)", "li_banner_color":"🎨 Couleur de la bannière", "li_text_color":"🖊️ Couleur du texte", "li_bg_pattern":"🖼️ Motif de fond", "li_banner_text":"✍️ Texte de la bannière", "li_adjust_photo":"✂️ Ajuster la photo"},
    "de": {"li_title":"💼 LinkedIn Profilrahmen Generator", "li_hint":"Passen Sie Ihr LinkedIn-Profilbild mit wenigen Klicks an.", "li_click_hint":"Klicken Sie auf die Leinwand oder verwenden Sie den Uploader →", "li_download":"⬇️ Bild herunterladen", "li_upload_title":"📁 Foto hochladen", "li_remove_bg":"✨ Hintergrund entfernen (KI)", "li_banner_color":"🎨 Bannerfarbe", "li_text_color":"🖊️ Textfarbe", "li_bg_pattern":"🖼️ Hintergrundmuster", "li_banner_text":"✍️ Bannertext", "li_adjust_photo":"✂️ Foto anpassen"},
    "ja": {"li_title":"💼 LinkedInプロフィールフレームジェネレーター", "li_hint":"数回のクリックでLinkedInのプロフィール写真をカスタマイズします。", "li_click_hint":"キャンバスをクリックするかアップローダーを使用します →", "li_download":"⬇️ 画像をダウンロード", "li_upload_title":"📁 写真をアップロード", "li_remove_bg":"✨ 背景を削除 (AI)", "li_banner_color":"🎨 バナーの色", "li_text_color":"🖊️ テキストの色", "li_bg_pattern":"🖼️ 背景パターン", "li_banner_text":"✍️ バナーテキスト", "li_adjust_photo":"✂️ 写真を調整"},
    "ko": {"li_title":"💼 LinkedIn 프로필 프레임 생성기", "li_hint":"몇 번의 클릭으로 LinkedIn 프로필 사진을 사용자 지정하세요.", "li_click_hint":"캔버스를 클릭하거나 업로더를 사용하세요 →", "li_download":"⬇️ 이미지 다운로드", "li_upload_title":"📁 사진 업로드", "li_remove_bg":"✨ 배경 제거 (AI)", "li_banner_color":"🎨 배너 색상", "li_text_color":"🖊️ 텍스트 색상", "li_bg_pattern":"🖼️ 배경 패턴", "li_banner_text":"✍️ 배너 텍스트", "li_adjust_photo":"✂️ 사진 조정"},
    "it": {"li_title":"💼 Generatore di cornici LinkedIn", "li_hint":"Personalizza la tua immagine del profilo LinkedIn in pochi clic.", "li_click_hint":"Fai clic sulla tela o utilizza l'uploader →", "li_download":"⬇️ Scarica l'immagine", "li_upload_title":"📁 Carica foto", "li_remove_bg":"✨ Rimuovi sfondo (IA)", "li_banner_color":"🎨 Colore del banner", "li_text_color":"🖊️ Colore del testo", "li_bg_pattern":"🖼️ Motivo di sfondo", "li_banner_text":"✍️ Testo del banner", "li_adjust_photo":"✂️ Regola foto"},
    "es": {"li_title":"💼 Generador de marcos de LinkedIn", "li_hint":"Personaliza tu foto de perfil de LinkedIn en unos pocos clics.", "li_click_hint":"Haga clic en el lienzo o use el cargador →", "li_download":"⬇️ Descargar imagen", "li_upload_title":"📁 Subir foto", "li_remove_bg":"✨ Eliminar fondo (IA)", "li_banner_color":"🎨 Color del banner", "li_text_color":"🖊️ Color del texto", "li_bg_pattern":"🖼️ Patrón de fondo", "li_banner_text":"✍️ Texto del banner", "li_adjust_photo":"✂️ Ajustar foto"},
    "zh": {"li_title":"💼 LinkedIn 个人资料边框生成器", "li_hint":"只需点击几下即可自定义您的 LinkedIn 个人资料图片。", "li_click_hint":"点击画布或使用上传界面 →", "li_download":"⬇️ 下载图片", "li_upload_title":"📁 上传照片", "li_remove_bg":"✨ 移除背景 (AI)", "li_banner_color":"🎨 横幅颜色", "li_text_color":"🖊️ 文字颜色", "li_bg_pattern":"🖼️ 背景图案", "li_banner_text":"✍️ 横幅文字", "li_adjust_photo":"✂️ 调整照片"},
    "pt": {"li_title":"💼 Gerador de molduras do LinkedIn", "li_hint":"Personalize sua foto de perfil do LinkedIn em poucos cliques.", "li_click_hint":"Clique na tela ou use o carregador →", "li_download":"⬇️ Baixar imagem", "li_upload_title":"📁 Carregar foto", "li_remove_bg":"✨ Remover fundo (IA)", "li_banner_color":"🎨 Cor do banner", "li_text_color":"🖊️ Cor do texto", "li_bg_pattern":"🖼️ Padrão de fundo", "li_banner_text":"✍️ Texto do banner", "li_adjust_photo":"✂️ Ajustar foto"},
    "ru": {"li_title":"💼 Генератор рамок для профиля LinkedIn", "li_hint":"Настройте фотографию своего профиля LinkedIn в несколько кликов.", "li_click_hint":"Щелкните по холсту или используйте загрузчик →", "li_download":"⬇️ Скачать изображение", "li_upload_title":"📁 Загрузить фото", "li_remove_bg":"✨ Удалить фон (ИИ)", "li_banner_color":"🎨 Цвет баннера", "li_text_color":"🖊️ Цвет текста", "li_bg_pattern":"🖼️ Узор фона", "li_banner_text":"✍️ Текст баннера", "li_adjust_photo":"✂️ Настроить фото"},
    "ur": {"li_title":"💼 لنکڈ ان پروفائل فریم جنریٹر", "li_hint":"اپنے لنکڈ ان پروفائل کی تصویر کو چند کلکس میں حسب ضرورت بنائیں۔", "li_click_hint":"کینوس پر کلک کریں یا اپلوڈر استعمال کریں →", "li_download":"⬇️ تصویر ڈاؤن لوڈ کریں", "li_upload_title":"📁 تصویر اپ لوڈ کریں", "li_remove_bg":"✨ پس منظر ہٹائیں (AI)", "li_banner_color":"🎨 بینر کا رنگ", "li_text_color":"🖊️ متن کا رنگ", "li_bg_pattern":"🖼️ پس منظر کا پیٹرن", "li_banner_text":"✍️ بینر کا متن", "li_adjust_photo":"✂️ تصویر کو ایڈجسٹ کریں"},
    "ar": {"li_title":"💼 مولد إطارات الملف الشخصي لينكد إن", "li_hint":"قم بتخصيص صورة ملفك الشخصي على لينكد إن بنقرات قليلة.", "li_click_hint":"انقر فوق القماش أو استخدم المحمل →", "li_download":"⬇️ تنزيل الصورة", "li_upload_title":"📁 رفع صورة", "li_remove_bg":"✨ إزالة الخلفية (الذكاء الاصطناعي)", "li_banner_color":"🎨 لون اللافتة", "li_text_color":"🖊️ لون النص", "li_bg_pattern":"🖼️ نمط الخلفية", "li_banner_text":"✍️ نص اللافتة", "li_adjust_photo":"✂️ ضبط الصورة"}
}

for lang, translation_dict in translations_map.items():
    if lang in data:
        # inject keys
        for key, eng_val in en_keys.items():
            if key not in data[lang]:
                data[lang][key] = translation_dict.get(key, eng_val)

with open(i18n_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Translations successfully injected.")
