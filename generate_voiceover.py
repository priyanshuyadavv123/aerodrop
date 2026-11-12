import asyncio
import os
import subprocess
import edge_tts

VOICE_MUKUL = "hi-IN-MadhurNeural"   # Warm, confident Indian male voice
VOICE_BHAWNA = "hi-IN-SwaraNeural"    # Clear, expressive Indian female voice

OUTPUT_DIR = "/Users/priyanshuyadav/Desktop/AeroDrop_Frontend_Project/audio_voiceover"

SECTIONS = [
    {
        "id": "01_intro_mukul",
        "speaker": "Mukul",
        "voice": VOICE_MUKUL,
        "text": "नमस्ते एवरीवन और रेस्पेक्टेड सर। मेरा नाम मुकुल है और मेरे साथ मेरी प्रोजेक्ट पार्टनर भावना हैं। आज हम प्रेजेंट करने जा रहे हैं हमारा वेब डेवलपमेंट प्रोजेक्ट — AeroDrop. AeroDrop एक आधुनिक Peer-to-Peer यानी P2P File Sharing वेब इंटरफेस है, जिसे बिना किसी थर्ड-पार्टी क्लाउड सर्वर पर फाइल अपलोड किए, सीधे दो डिवाइसेस के बीच ब्राउज़र-टू-ब्राउज़र फाइल शेयरिंग करने के लिए डिजाइन किया गया है।"
    },
    {
        "id": "02_problem_statement_bhawna",
        "speaker": "Bhawna",
        "voice": VOICE_BHAWNA,
        "text": "सर, आजकल जब हमें कोई हैवी फाइल एक डिवाइस से दूसरे डिवाइस में भेजनी होती है, तो हम आमतौर पर WhatsApp, Google Drive या ईमेल का इस्तेमाल करते हैं। लेकिन इसमें तीन मुख्य समस्याएं आती हैं: पहली — फाइल साइज की लिमिट होती है। बड़ी फाइल्स या ओरिजिनल क्वालिटी मीडिया आसानी से नहीं भेजा जा सकता। दूसरी — क्लाउड पर पहले फाइल अपलोड होती है, फिर सामने वाला डाउनलोड करता है, जिससे डबल डेटा और बहुत ज्यादा समय बर्बाद होता है। और तीसरी सबसे बड़ी समस्या है प्राइवेसी। जब फाइल किसी थर्ड-पार्टी क्लाउड सर्वर पर स्टोर होती है, तो डेटा लीक होने का खतरा रहता है। इन्हीं समस्याओं को हल करने के लिए हमने बनाया है AeroDrop."
    },
    {
        "id": "03_concept_architecture_mukul",
        "speaker": "Mukul",
        "voice": VOICE_MUKUL,
        "text": "AeroDrop का कांसेप्ट Apple के AirDrop जैसा है, लेकिन इसका सबसे बड़ा फायदा यह है कि यह पूरी तरह से प्लेटफॉर्म-इंडिपेंडेंट और वेब-बेस्ड है। यानी इसे चलाने के लिए न तो कोई एक्सटर्नल ऐप इंस्टॉल करने की जरूरत है और न ही किसी स्पेशल ऑपरेटिंग सिस्टम की। यह Android, iOS, Windows, Mac और Linux — किसी भी मॉडर्न वेब ब्राउज़र पर तुरंत काम करता है। इसका आर्किटेक्चर Peer-to-Peer है, जिसमें डिवाइसेस आपस में डायरेक्ट डेटा ट्रांसफर करते हैं।"
    },
    {
        "id": "04_tech_stack_bhawna",
        "speaker": "Bhawna",
        "voice": VOICE_BHAWNA,
        "text": "अगर इसके टेक्निकल स्टैक की बात करें, तो हमने इस प्रोजेक्ट को बिना किसी हैवी फ्रेमवर्क के, प्योर कोर वेब टेक्नोलॉजीज से स्क्रैच से डेवलप किया है। पहला — वेब पेज के स्ट्रक्चर और एक्सेसिबिलिटी के लिए हमने यूज किया है Semantic HTML5. दूसरा — मॉडर्न डार्क-थीम डिजाइन, ग्लासमोर्फिज्म इफेक्ट्स, Flexbox, CSS Grid और स्मूथ कीफ्रेम एनिमेशन्स के लिए CSS3. और तीसरा — सभी यूजर इंटरेक्शन्स, ड्रैग एंड ड्रॉप हैंडलिंग, रियल-टाइम प्रोग्रेस सिमुलेशन और डायनामिक पीयर डिस्कवरी के लिए Vanilla JavaScript."
    },
    {
        "id": "05_live_demo_intro_mukul",
        "speaker": "Mukul",
        "voice": VOICE_MUKUL,
        "text": "अब चलिए चलते हैं हमारी लाइव वेबसाइट की तरफ। जैसे ही यूजर AeroDrop ओपन करता है, उसे एक प्रीमियम डार्क ग्लासमोर्फिक यूजर इंटरफेस देखने को मिलता है। टॉप पर हमारा नेविगेशन बार है, जिसमें लोगो और क्लीन नेविगेशन लिंक्स हैं। हीरो सेक्शन में क्लियर कॉल-टू-एक्शन बटन्स हैं — जैसे Start Sharing और Live Simulator, जो स्मूथ स्क्रॉलिंग के साथ यूजर को सीधे वर्किंग एरिया तक ले जाते हैं।"
    },
    {
        "id": "06_dropzone_and_progress_bhawna",
        "speaker": "Bhawna",
        "voice": VOICE_BHAWNA,
        "text": "यह है हमारी वेबसाइट का कोर ट्रांसफर सिमुलेटर सेक्शन। लेफ्ट साइड में हमने बनाया है एक कस्टम ड्रैग-एंड-ड्रॉप फाइल जोन। यूजर अपनी फाइल को सीधे ड्रैग करके यहां ड्रॉप कर सकता है, या क्लिक करके फाइल ब्राउज कर सकता है। जैसे ही फाइल सेलेक्ट होती है, जावास्क्रिप्ट फाइल का नाम और साइज कैलकुलेट करके केबी या एमबी में तुरंत डिस्प्ले कर देता है। इसके बाद जब हम Send File बटन पर क्लिक करते हैं, तो हमारा डायनामिक प्रोग्रेस बार एक्टिवेट होता है। यह 0% से 100% तक रियल-टाइम डेटा ट्रांसफर को सिमुलेट करता है, और ट्रांसफर पूरा होते ही Transfer Complete का सक्सेस मैसेज शो करता है।"
    },
    {
        "id": "07_radar_peer_discovery_mukul",
        "speaker": "Mukul",
        "voice": VOICE_MUKUL,
        "text": "राइट साइड में आप देख सकते हैं हमारा रडार पीयर डिस्कवरी विजुअलाइजर। जब हम Scan for Nearby Devices बटन पर क्लिक करते हैं, तो 360-डिग्री रोटेटिंग रडार स्वीप एक्टिवेट होता है। यह एक रियल नेटवर्क स्कैन को विजुअलाइज करता है, और कुछ ही सेकंड्स में जावास्क्रिप्ट नजदीकी एक्टिव डिवाइसेस — जैसे मैकबुक प्रो और पिक्सल फोन — को डायनामिक रूप से स्क्रीन पर शो कर देता है, जिससे यूजर सीधे कनेक्ट कर सकता है।"
    },
    {
        "id": "08_responsive_design_bhawna",
        "speaker": "Bhawna",
        "voice": VOICE_BHAWNA,
        "text": "इसके अलावा, हमारी वेबसाइट पूरी तरह से रेस्पॉन्सिव है। हमने इसमें CSS3 मीडिया क्वेरीज का इस्तेमाल किया है। जब हम स्क्रीन को मोबाइल साइज पर रीसाइज करते हैं, तो हमारा टू-कॉलम ग्रिड लेआउट ऑटोमैटिकली सिंगल कॉलम में कन्वर्ट हो जाता है, जिससे मोबाइल और टैबलेट यूजर्स को भी बिल्कुल फ्लूइड और नेचुरल एक्सपीरियंस मिलता है।"
    },
    {
        "id": "09_code_html_css_bhawna",
        "speaker": "Bhawna",
        "voice": VOICE_BHAWNA,
        "text": "अब एक नजर डालते हैं इसके कोड स्ट्रक्चर पर। HTML5 में हमने बेस्ट कोडिंग प्रैक्टिसेज को फॉलो करते हुए सेमांटिक टैग्स — जैसे header, nav, main, section और footer का इस्तेमाल किया है, जिससे कोड क्लीन और एसईओ-फ्रेंडली रहता है। डिफॉल्ट ब्राउज़र फाइल इनपुट को हाइड करके हमने कस्टम ड्रॉपजोन बनाया है। CSS3 में हमने root वेरिएबल्स डिफाइन किए हैं ताकि पूरी वेबसाइट में कलर्स कंसिस्टेंट रहें। लेआउट के लिए फ्लेक्सबॉक्स और सीएसएस ग्रिड का कॉम्बिनेशन यूज किया है। और रडार के रोटेशन के लिए हमने कस्टम कीफ्रेम्स radarRotate एनिमेशन बनाया है जो स्मूथली इनफिनिट लूप में रोटेट होता है।"
    },
    {
        "id": "10_code_javascript_mukul",
        "speaker": "Mukul",
        "voice": VOICE_MUKUL,
        "text": "और अगर जावास्क्रिप्ट लॉजिक की बात करें: ड्रैग एंड ड्रॉप के लिए हमने dragover और drop इवेंट्स पर preventDefault हैंडल किया है ताकि ब्राउज़र फाइल को ओपन करने के बजाय हमारे कस्टम फंक्शन को ट्रिगर करे। प्रोग्रेस बार के लिए हमने setInterval टाइमर का उपयोग किया है जो पैकेट ट्रांसफर को सिमुलेट करता है, और 100% होते ही clearInterval कॉल होकर स्टेट रिसेट होती है। पीयर डिस्कवरी में हमने setTimeout से नेटवर्क लेटेंसी सिमुलेट की है और document.createElement से डीओएम में डायनामिकली पीयर्स इंजेक्ट किए हैं।"
    },
    {
        "id": "11_future_scope_bhawna",
        "speaker": "Bhawna",
        "voice": VOICE_BHAWNA,
        "text": "फ्यूचर स्कोप की बात करें, तो वर्तमान में हमारा फ्रंटएंड इंटरफेस और सिमुलेशन पूरी तरह से तैयार है। नेक्स्ट फेज में हम इसमें WebRTC यानी RTCDataChannel और एक नोड.जेएस सिग्नलिंग सर्वर कनेक्ट करेंगे। इससे रियल वर्ल्ड में एनक्रिप्टेड फाइल पैकेट्स सीधे ब्राउज़र-टू-ब्राउज़र बिना किसी सर्वर स्टोरेज के ट्रांसफर हो सकेंगे।"
    },
    {
        "id": "12_conclusion_mukul",
        "speaker": "Mukul",
        "voice": VOICE_MUKUL,
        "text": "निष्कर्ष के तौर पर, इस प्रोजेक्ट के माध्यम से हमने मॉडर्न वेब डिजाइन, सेमांटिक एचटीएमएल, एडवांस्ड सीएसएस एनिमेशन्स, और कॉम्प्लेक्स जावास्क्रिप्ट इवेंट हैंडलिंग को प्रैक्टिकली सीखा। थैंक यू सो मच सर आपके गाइडेंस और सपोर्ट के लिए। अब हम आपके किसी भी प्रश्न और फीडबैक के लिए तैयार हैं।"
    }
]

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    generated_files = []
    
    print("🎙️ Generating AI voice clips for Mukul and Bhawna...")
    for idx, sec in enumerate(SECTIONS, 1):
        filename = f"{sec['id']}.mp3"
        filepath = os.path.join(OUTPUT_DIR, filename)
        print(f"[{idx}/{len(SECTIONS)}] Generating ({sec['speaker']}): {filename} ...")
        
        comm = edge_tts.Communicate(sec['text'], sec['voice'], rate="+2%")
        await comm.save(filepath)
        generated_files.append((filepath, sec['speaker']))
    
    print("✅ All individual clips generated successfully!")
    
    # Create silent pause (1 second) for clean pacing between speakers
    silence_file = os.path.join(OUTPUT_DIR, "silence_1s.mp3")
    subprocess.run([
        "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", 
        "-t", "1.2", "-q:a", "9", "-acodec", "libmp3lame", silence_file
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # Create concat list
    concat_list_path = os.path.join(OUTPUT_DIR, "concat_list.txt")
    with open(concat_list_path, "w") as f:
        for idx, (filepath, speaker) in enumerate(generated_files):
            f.write(f"file '{filepath}'\n")
            if idx < len(generated_files) - 1:
                f.write(f"file '{silence_file}'\n")
                
    # Concatenate into one single master audio file
    master_audio = os.path.join(OUTPUT_DIR, "AeroDrop_Complete_Presentation_Voiceover.mp3")
    print("🎵 Merging into master audio file...")
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_list_path,
        "-c", "copy", master_audio
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # Get total duration
    dur_proc = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", master_audio
    ], capture_output=True, text=True)
    
    duration_secs = float(dur_proc.stdout.strip() or "0")
    mins = int(duration_secs // 60)
    secs = int(duration_secs % 60)
    
    print(f"\n🎉 Master Presentation Audio Created!")
    print(f"📁 Path: {master_audio}")
    print(f"⏱️ Total Duration: {mins} minutes and {secs} seconds!")

if __name__ == "__main__":
    asyncio.run(main())
