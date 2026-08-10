// ─── Du'as against Injustice & Oppression ────────────────────────────────────
// Authentic supplications for times of hardship, fear, and oppression — Arabic,
// transliteration, meaning, and source. Reconstructed & completed from the
// NoorulFirdaws "Fortress of Righteousness" collection; the two du'as whose
// Arabic had been truncated by the generator are restored in full here.

export interface Dua {
  arabic: string;
  transliteration: string;
  meaning: string;
  occasion?: string;      // for everyday du'as: the moment it is said
  source?: string;
  repeat?: string;        // e.g. "Recite 3 times"
  restored?: boolean;     // true where we completed previously-truncated Arabic
}

export interface DuaSection {
  id: string;
  title: string;
  duas: Dua[];
}

export const duaIntro =
  "Whenever the Prophet Muhammad ﷺ was worried, he turned to prayer. Du'a is our most powerful weapon, and no crisis should deter us from it. Please keep those in dire situations in your prayers — they are, most certainly, in need of it.";

export const duaSections: DuaSection[] = [
  {
    id: "worried",
    title: "When Worried or Concerned",
    duas: [
      {
        arabic:
          "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْفَوْزَ فِي الْقَضَاءِ، وَنُزُلَ الشُّهَدَاءِ، وَعَيْشَ السُّعَدَاءِ، وَمُرَافَقَةَ الْأَنْبِيَاءِ، وَالنَّصْرَ عَلَى الْأَعْدَاءِ، إِنَّكَ سَمِيعُ الدُّعَاءِ",
        transliteration:
          "Allāhumma innī as'aluka al-fawza fil-qaḍā', wa nuzula ash-shuhadā', wa ʿaysha as-suʿadā', wa murāfaqata al-anbiyā', wan-naṣra ʿalā al-aʿdā', innaka samīʿu ad-duʿā'",
        meaning:
          "O Allah, I ask You for success concerning my destiny, the rank of the martyrs, the life of the fortunate, the companionship of the Prophets, and victory over my enemies — for You are the Hearer of prayer.",
      },
      {
        arabic: "اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي",
        transliteration: "Allāhumma-stur ʿawrātī wa āmin rawʿātī",
        meaning: "O Allah, conceal my faults and calm my fears.",
      },
      {
        arabic:
          "حَسْبِيَ اللَّهُ لِمَا أَهَمَّنِي، حَسْبِيَ اللَّهُ لِمَنْ بَغَى عَلَيَّ، حَسْبِيَ اللَّهُ لِمَنْ حَسَدَنِي، حَسْبِيَ اللَّهُ لِمَنْ كَادَنِي بِسُوءٍ، حَسْبِيَ اللَّهُ عِنْدَ الْمَوْتِ",
        transliteration:
          "Ḥasbiya Allāhu limā ahammanī, ḥasbiya Allāhu liman baghā ʿalayya, ḥasbiya Allāhu liman ḥasadanī, ḥasbiya Allāhu liman kādanī bi-sū', ḥasbiya Allāhu ʿinda al-mawt",
        meaning:
          "Allah is sufficient for me in whatever worries me; against whoever wrongs me; against whoever envies me; against whoever plots evil for me; and in the moment of death.",
      },
    ],
  },
  {
    id: "ummah",
    title: "For the Ummah",
    duas: [
      {
        arabic:
          "اللَّهُمَّ اغْفِرْ لَنَا وَلِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ، وَأَصْلِحْهُمْ وَأَصْلِحْ ذَاتَ بَيْنِهِمْ، وَأَلِّفْ بَيْنَ قُلُوبِهِمْ، وَاجْعَلْ فِي قُلُوبِهِمُ الْإِيمَانَ وَالْحِكْمَةَ، وَانْصُرْهُمْ عَلَى عَدُوِّكَ وَعَدُوِّهِمْ",
        transliteration:
          "Allāhumma-ghfir lanā wa lil-mu'minīna wal-mu'mināt, wa aṣliḥhum wa aṣliḥ dhāta baynihim, wa allif bayna qulūbihim, waj-ʿal fī qulūbihimu al-īmāna wal-ḥikmata, wan-ṣurhum ʿalā ʿaduwwika wa ʿaduwwihim",
        meaning:
          "O Allah, forgive us and the believing men and women, set right their affairs, unite their hearts, place faith and wisdom in their hearts, and grant them victory over Your enemy and theirs.",
      },
      {
        arabic:
          "اللَّهُمَّ إِنَّا نَعُوذُ بِكَ مِنْ أَنْ نَزِلَّ أَوْ نُزَلَّ، أَوْ نَضِلَّ أَوْ نُضَلَّ، أَوْ نَظْلِمَ أَوْ نُظْلَمَ، أَوْ نَجْهَلَ أَوْ يُجْهَلَ عَلَيْنَا",
        transliteration:
          "Allāhumma innā naʿūdhu bika min an nazilla aw nuzalla, aw naḍilla aw nuḍalla, aw naẓlima aw nuẓlama, aw najhala aw yujhala ʿalaynā",
        meaning:
          "O Allah, we seek refuge in You from slipping or being made to slip, from going astray or being led astray, from wronging or being wronged, and from behaving ignorantly or being treated with ignorance.",
        source: "Sunan Abu Dawud",
      },
      {
        arabic: "رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِلْقَوْمِ الظَّالِمِينَ، وَنَجِّنَا بِرَحْمَتِكَ مِنَ الْقَوْمِ الْكَافِرِينَ",
        transliteration: "Rabbanā lā tajʿalnā fitnatan lil-qawmi aẓ-ẓālimīn, wa najjinā bi-raḥmatika mina al-qawmi al-kāfirīn",
        meaning: "Our Lord, make us not a trial for the wrongdoing people, and deliver us by Your mercy from the disbelieving people.",
        source: "Qur'an — Yunus 10:85–86",
      },
      {
        arabic: "رَبِّ إِنِّي مَغْلُوبٌ فَانْتَصِرْ",
        transliteration: "Rabbi innī maghlūbun fa-ntaṣir",
        meaning: "My Lord, I am overpowered, so help me.",
        source: "Qur'an — Al-Qamar 54:10",
      },
    ],
  },
  {
    id: "protection",
    title: "Protection & Steadfastness",
    duas: [
      {
        arabic:
          "اللَّهُمَّ إِلَهَ جِبْرِيلَ وَمِيكَائِيلَ وَإِسْرَافِيلَ، وَإِلَهَ إِبْرَاهِيمَ وَإِسْمَاعِيلَ وَإِسْحَاقَ، عَافِنِي وَلَا تُسَلِّطَنَّ عَلَيَّ أَحَدًا مِنْ خَلْقِكَ بِشَيْءٍ لَا طَاقَةَ لِي بِهِ",
        transliteration:
          "Allāhumma ilāha Jibrīla wa Mīkā'īla wa Isrāfīl, wa ilāha Ibrāhīma wa Ismāʿīla wa Isḥāq, ʿāfinī wa lā tusalliṭanna ʿalayya aḥadan min khalqika bi-shay'in lā ṭāqata lī bih",
        meaning:
          "O Allah, God of Jibrīl, Mīkā'īl and Isrāfīl, and God of Ibrāhīm, Ismāʿīl and Isḥāq — grant me well-being, and do not let any of Your creation overpower me with anything I have no strength to bear.",
        source: "Ḥiṣn al-Ḥaṣīn",
      },
      {
        arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
        transliteration: "Rabbanā afrigh ʿalaynā ṣabran wa thabbit aqdāmanā wan-ṣurnā ʿalā al-qawmi al-kāfirīn",
        meaning: "Our Lord, pour upon us patience, make our steps firm, and help us against the disbelieving people.",
        source: "Qur'an — Al-Baqarah 2:250",
      },
      {
        arabic:
          "رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا، رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا، رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ، وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا، أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
        transliteration:
          "Rabbanā lā tu'ākhidhnā in nasīnā aw akhṭa'nā, rabbanā wa lā taḥmil ʿalaynā iṣran kamā ḥamaltahu ʿalā alladhīna min qablinā, rabbanā wa lā tuḥammilnā mā lā ṭāqata lanā bih, waʿfu ʿannā wa-ghfir lanā wa-rḥamnā, anta mawlānā fa-nṣurnā ʿalā al-qawmi al-kāfirīn",
        meaning:
          "Our Lord, take us not to task if we forget or err. Our Lord, lay not on us a burden like that which You laid on those before us. Our Lord, burden us not with more than we can bear. Pardon us, forgive us, and have mercy on us. You are our Protector, so help us against the disbelieving people.",
        source: "Qur'an — Al-Baqarah 2:286",
      },
      {
        arabic: "رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
        transliteration: "Rabbanā-ghfir lanā dhunūbanā wa isrāfanā fī amrinā wa thabbit aqdāmanā wan-ṣurnā ʿalā al-qawmi al-kāfirīn",
        meaning: "Our Lord, forgive us our sins and our excesses in our affairs, make our steps firm, and help us against the disbelieving people.",
        source: "Qur'an — Ali 'Imran 3:147",
      },
    ],
  },
  {
    id: "adversary",
    title: "When Meeting an Adversary or Oppressor",
    duas: [
      {
        arabic: "اللَّهُمَّ إِنَّا نَجْعَلُكَ فِي نُحُورِهِمْ، وَنَعُوذُ بِكَ مِنْ شُرُورِهِمْ",
        transliteration: "Allāhumma innā najʿaluka fī nuḥūrihim, wa naʿūdhu bika min shurūrihim",
        meaning: "O Allah, we place You before them (to restrain them), and we seek refuge in You from their evil.",
        source: "Abu Dawud; al-Ḥākim",
      },
      {
        arabic:
          "اللَّهُ أَكْبَرُ، اللَّهُ أَعَزُّ مِنْ خَلْقِهِ جَمِيعًا، اللَّهُ أَعَزُّ مِمَّا أَخَافُ وَأَحْذَرُ، أَعُوذُ بِاللَّهِ الَّذِي لَا إِلَهَ إِلَّا هُوَ، الْمُمْسِكِ السَّمَاوَاتِ السَّبْعَ أَنْ يَقَعْنَ عَلَى الْأَرْضِ إِلَّا بِإِذْنِهِ، مِنْ شَرِّ عَبْدِكَ فُلَانٍ وَجُنُودِهِ وَأَتْبَاعِهِ وَأَشْيَاعِهِ، اللَّهُمَّ كُنْ لِي جَارًا مِنْ شَرِّهِمْ",
        transliteration:
          "Allāhu akbar, Allāhu aʿazzu min khalqihi jamīʿā, Allāhu aʿazzu mimmā akhāfu wa aḥdhar, aʿūdhu billāhi alladhī lā ilāha illā huwa, al-mumsiki as-samāwāti as-sabʿa an yaqaʿna ʿalā al-arḍi illā bi-idhnih, min sharri ʿabdika fulānin wa junūdihi wa atbāʿihi wa ashyāʿih, Allāhumma kun lī jāran min sharrihim",
        meaning:
          "Allah is greatest — Mightier than all His creation, Mightier than what I fear and dread. I seek refuge in Allah, whom there is none worthy of worship but Him, the One who holds the seven heavens from falling upon the earth except by His command — from the evil of Your servant [so-and-so], his soldiers, his followers, and his supporters. O Allah, be my protector against their evil.",
        source: "al-Adab al-Mufrad 708",
        repeat: "Recite 3 times",
        restored: true,
      },
      {
        arabic: "اللَّهُمَّ مُنْزِلَ الْكِتَابِ، سَرِيعَ الْحِسَابِ، اهْزِمِ الْأَحْزَابَ، اللَّهُمَّ اهْزِمْهُمْ وَزَلْزِلْهُمْ",
        transliteration: "Allāhumma munzila al-kitāb, sarīʿa al-ḥisāb, ihzimi al-aḥzāb, Allāhumma-hzimhum wa zalzilhum",
        meaning: "O Allah, Revealer of the Book, Swift in reckoning, defeat the confederates. O Allah, defeat them and shake them.",
        source: "Sahih Muslim 1742",
      },
      {
        arabic: "رَبِّ انْصُرْنِي عَلَى الْقَوْمِ الْمُفْسِدِينَ",
        transliteration: "Rabbi-nṣurnī ʿalā al-qawmi al-mufsidīn",
        meaning: "My Lord, help me against the people who spread corruption.",
        source: "Qur'an — Al-Ankabut 29:30",
      },
    ],
  },
  {
    id: "comprehensive",
    title: "General Comprehensive Du'as",
    duas: [
      {
        arabic: "اللَّهُمَّ انْصُرِ الْإِسْلَامَ وَالْمُسْلِمِينَ",
        transliteration: "Allāhumma-nṣuri al-Islāma wal-muslimīn",
        meaning: "O Allah, grant victory to Islam and the Muslims.",
      },
      {
        arabic: "اللَّهُمَّ أَعِزَّ الْإِسْلَامَ وَالْمُسْلِمِينَ، وَاجْعَلْ هَذَا الْبَلَدَ آمِنًا مُطْمَئِنًّا رَخَاءً وَسَائِرَ بِلَادِ الْمُسْلِمِينَ، بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِينَ",
        transliteration:
          "Allāhumma aʿizzi al-Islāma wal-muslimīn, waj-ʿal hādhā al-balada āminan muṭma'innan rakhā'an wa sā'ira bilādi al-muslimīn, bi-raḥmatika yā arḥama ar-rāḥimīn",
        meaning:
          "O Allah, honour Islam and the Muslims, and make this land — and all the lands of the Muslims — safe, secure, and prosperous. By Your mercy, O Most Merciful of the merciful.",
      },
      {
        arabic: "اللَّهُمَّ انْصُرْ دِينَكَ وَكِتَابَكَ وَسُنَّةَ نَبِيِّكَ وَعِبَادَكَ الْمُوَحِّدِينَ",
        transliteration: "Allāhumma-nṣur dīnaka wa kitābaka wa sunnata nabiyyika wa ʿibādaka al-muwaḥḥidīn",
        meaning: "O Allah, grant victory to Your religion, Your Book, the Sunnah of Your Prophet ﷺ, and Your servants who worship You alone.",
      },
      {
        arabic: "اللَّهُمَّ فُكَّ قَيْدَ أَسْرَانَا وَأَسْرَى الْمُسْلِمِينَ، وَرُدَّهُمْ إِلَى أَهْلِهِمْ سَالِمِينَ",
        transliteration: "Allāhumma fukka qayda asrānā wa asrā al-muslimīn, wa ruddahum ilā ahlihim sālimīn",
        meaning: "O Allah, release the captivity of our prisoners and the prisoners of the Muslims, and return them safely to their families.",
      },
    ],
  },
  {
    id: "qunut",
    title: "Qunut al-Nazila — In Times of Calamity",
    duas: [
      {
        arabic:
          "اللَّهُمَّ اهْدِنَا فِيمَنْ هَدَيْتَ، وَعَافِنَا فِيمَنْ عَافَيْتَ، وَتَوَلَّنَا فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لَنَا فِيمَا أَعْطَيْتَ، وَقِنَا وَاصْرِفْ عَنَّا شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَى عَلَيْكَ، إِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ وَلَا يَعِزُّ مَنْ عَادَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ",
        transliteration:
          "Allāhumma-hdinā fīman hadayt, wa ʿāfinā fīman ʿāfayt, wa tawallanā fīman tawallayt, wa bārik lanā fīmā aʿṭayt, wa qinā wa-ṣrif ʿannā sharra mā qaḍayt, fa-innaka taqḍī wa lā yuqḍā ʿalayk, innahu lā yadhillu man wālayt wa lā yaʿizzu man ʿādayt, tabārakta rabbanā wa taʿālayt",
        meaning:
          "O Allah, guide us among those You have guided, grant us well-being among those You have granted well-being, take us into Your care among those You care for, bless us in what You have given, and protect us from the evil of what You have decreed. For You decree and none decrees against You; none is abased whom You befriend, and none is honoured whom You oppose. Blessed and Exalted are You, our Lord.",
        source: "Recited in times of major difficulty facing the ummah",
      },
      {
        arabic:
          "اللَّهُمَّ يَا خَالِقَ السَّمَاوَاتِ وَالْأَرْضِ، يَا حَامِي، يَا حَافِظُ، احْمِ أَهْلَنَا فِي الْعِرَاقِ وَفِلَسْطِينَ وَالشِّيشَانِ وَكَشْمِيرَ وَأَفْغَانِسْتَانَ وَفِي كُلِّ مَكَانٍ يُظْلَمُونَ فِيهِ، وَاحْفَظْهُمْ مِنْ كُلِّ شَرٍّ وَأَذًى، وَانْصُرْهُمْ فِي كُلِّ مَكَانٍ، آمِينَ يَا اللَّهُ، آمِينَ، آمِينَ",
        transliteration:
          "Allāhumma yā khāliqa as-samāwāti wal-arḍ, yā ḥāmī, yā ḥāfiẓ, iḥmi ahlanā fī al-ʿIrāqi wa Filasṭīna wa ash-Shīshāni wa Kashmīra wa Afghānistān wa fī kulli makānin yuẓlamūna fīh, waḥfaẓhum min kulli sharrin wa adhā, wan-ṣurhum fī kulli makān, āmīn yā Allāh, āmīn, āmīn",
        meaning:
          "O Allah, Creator of the heavens and the earth, O Protector, O Preserver — protect our people in Iraq, Palestine, Chechnya, Kashmir, Afghanistan, and everywhere they are oppressed. Guard them from every evil and harm, and grant them victory in every place. Āmīn, O Allah. Āmīn. Āmīn.",
        restored: true,
      },
    ],
  },
  {
    id: "everyday",
    title: "Everyday Sunnah Du'as",
    duas: [
      { occasion: "Before eating", arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ", transliteration: "Bismillāhi wa ʿalā barakatillāh", meaning: "In the name of Allah, and with the blessings of Allah." },
      { occasion: "If you forget, then remember while eating", arabic: "بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ", transliteration: "Bismillāhi awwalahu wa ākhirah", meaning: "In the name of Allah at its beginning and its end." },
      { occasion: "After eating", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ", transliteration: "Alhamdu lillāhi alladhī aṭʿamanā wa saqānā wa jaʿalanā muslimīn", meaning: "All praise is for Allah, who fed us, gave us drink, and made us of the Muslims." },
      { occasion: "Before sleeping", arabic: "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا", transliteration: "Allāhumma bismika amūtu wa aḥyā", meaning: "O Allah, in Your name I die and I live." },
      { occasion: "On waking", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", transliteration: "Alhamdu lillāhi alladhī aḥyānā baʿda mā amātanā wa ilayhi an-nushūr", meaning: "All praise is for Allah, who gave us life after causing us to die, and to Him is the resurrection." },
      { occasion: "Entering the bathroom", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ", transliteration: "Allāhumma innī aʿūdhu bika mina al-khubuthi wal-khabā'ith", meaning: "O Allah, I seek refuge in You from all evil and impurity." },
      { occasion: "Leaving the bathroom", arabic: "غُفْرَانَكَ", transliteration: "Ghufrānak", meaning: "I seek Your forgiveness." },
      { occasion: "After wudu", arabic: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ", transliteration: "Ashhadu an lā ilāha illā Allāhu waḥdahu lā sharīka lah, wa ashhadu anna Muḥammadan ʿabduhu wa rasūluh", meaning: "I testify that there is no god but Allah alone, without partner, and that Muhammad is His servant and Messenger." },
      { occasion: "Entering the masjid", arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", transliteration: "Allāhumma-ftaḥ lī abwāba raḥmatik", meaning: "O Allah, open for me the gates of Your mercy." },
      { occasion: "Leaving the masjid", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ", transliteration: "Allāhumma innī as'aluka min faḍlik", meaning: "O Allah, I ask You from Your bounty." },
      { occasion: "Leaving home", arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", transliteration: "Bismillāhi tawakkaltu ʿalā Allāh, lā ḥawla wa lā quwwata illā billāh", meaning: "In the name of Allah, I place my trust in Allah; there is no might nor power except with Allah." },
      { occasion: "Wearing new clothes", arabic: "الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ", transliteration: "Alhamdu lillāhi alladhī kasānī hādhā wa razaqanīhi min ghayri ḥawlin minnī wa lā quwwah", meaning: "All praise is for Allah, who clothed me with this and provided it for me with no power or strength of my own." },
      { occasion: "When it rains", arabic: "اللَّهُمَّ صَيِّبًا نَافِعًا", transliteration: "Allāhumma ṣayyiban nāfiʿā", meaning: "O Allah, make it a beneficial rainfall." },
      { occasion: "For an increase in knowledge", arabic: "رَبِّ زِدْنِي عِلْمًا", transliteration: "Rabbi zidnī ʿilmā", meaning: "My Lord, increase me in knowledge.", source: "Qur'an — Ta-Ha 20:114" },
      { occasion: "In hardship & distress — the du'a of Yunus ﷺ", arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", transliteration: "Lā ilāha illā anta subḥānaka innī kuntu mina aẓ-ẓālimīn", meaning: "There is no god but You; glory be to You; indeed, I have been among the wrongdoers.", source: "Qur'an — Al-Anbiya 21:87" },
      { occasion: "The master of seeking forgiveness — Sayyid al-Istighfār", arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", transliteration: "Allāhumma anta rabbī lā ilāha illā ant, khalaqtanī wa anā ʿabduk, wa anā ʿalā ʿahdika wa waʿdika mā-staṭaʿt, aʿūdhu bika min sharri mā ṣanaʿt, abū'u laka bi-niʿmatika ʿalayya, wa abū'u bi-dhanbī fa-ghfir lī fa-innahu lā yaghfiru adh-dhunūba illā ant", meaning: "O Allah, You are my Lord; there is no god but You. You created me and I am Your servant. I keep Your covenant and promise as best I can. I seek refuge in You from the evil I have done. I acknowledge Your favour upon me, and I confess my sin — so forgive me, for none forgives sins but You.", source: "Sahih al-Bukhari 6306" },
      { occasion: "The most comprehensive du'a", arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", transliteration: "Rabbanā ātinā fid-dunyā ḥasanah wa fil-ākhirati ḥasanah wa qinā ʿadhāba an-nār", meaning: "Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.", source: "Qur'an — Al-Baqarah 2:201" },
    ],
  },
];
