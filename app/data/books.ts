// ─── Full written content for the Islamic Legacy books ───────────────────────
// Keyed by product slug. Each entry is an ordered list of chapters with a title
// and body (paragraphs separated by blank lines). Rendered by Printable so each
// book is a complete, readable booklet — not just a table of contents.

export interface BookChapter {
  title: string;
  body: string;
}

export const bookContent: Record<string, BookChapter[]> = {
  // ── The Rightly-Guided Caliphs ──────────────────────────────────────────────
  "the-rightly-guided-caliphs": [
    {
      title: "Abu Bakr as-Siddiq — The Trustworthy",
      body: `When the Prophet Muhammad ﷺ passed away in 11 AH, the young Muslim community faced the gravest crisis of its history. The man chosen to lead them was Abu Bakr ibn Abi Quhafa — a quiet, gentle merchant who had been the Prophet's closest friend and the first adult man to accept Islam.

He earned the title as-Siddiq, "the truthful one who affirms," because when the Prophet ﷺ described his miraculous night journey to Jerusalem and the heavens, others doubted, but Abu Bakr said simply: "If he said it, then it is true." His faith never wavered.

As Caliph, Abu Bakr's gentleness concealed great resolve. When tribes across Arabia rebelled and refused the zakat after the Prophet's death, his advisors urged compromise. He refused: "By Allah, if they withhold even a rope they used to give, I will fight them for it." His firmness held the community together at the moment it could have shattered. He ruled for just over two years, lived simply, and died having stabilized the religion for those who came after him.`,
    },
    {
      title: "Umar ibn al-Khattab — The Just",
      body: `Before Islam, Umar was among its fiercest opponents — a man of towering strength and temper. His acceptance of Islam was so significant that the Muslims, who had worshipped in secret, prayed openly at the Ka'bah for the first time. The Prophet ﷺ called him al-Faruq, "the one who distinguishes truth from falsehood."

As the second Caliph, Umar built the institutions of a state: a treasury (bayt al-mal), a judiciary with independent judges, a postal system, a census, and the Islamic (Hijri) calendar still used today. Under his leadership the Muslim world expanded across Persia, Syria, Egypt, and beyond — yet he himself wore patched garments and slept on the ground.

His justice was legendary. He would walk the streets of Madinah at night to learn the true condition of his people. He once said that if a lost animal stumbled in Iraq, he feared Allah would question him about why he had not paved its road. He was assassinated while leading the Fajr prayer in 23 AH, leaving behind a model of accountable, fearless leadership.`,
    },
    {
      title: "Uthman ibn Affan — The Generous",
      body: `Uthman ibn Affan was among the earliest converts, a man of wealth, modesty, and extraordinary generosity. When the Muslims of Madinah suffered from a lack of fresh water, he bought the well of Rumah and gave it freely to the community. When the army marched in hardship, he equipped a third of it from his own pocket. The Prophet ﷺ married two of his daughters to Uthman, who was given the title Dhun-Nurayn, "Possessor of the Two Lights."

His twelve-year caliphate saw the empire reach its greatest extent yet. But his most enduring contribution was the standardization of the Quran. As Islam spread among peoples of different dialects, disputes arose over recitation. Uthman commissioned a single authoritative written text, copied it, and sent it to the major cities — preserving the unity of the Quran for all time.

The latter years of his rule were troubled by rebellion and unrest. A group of rebels besieged his home, and Uthman — refusing to spill Muslim blood in his own defense — was martyred while reading the Quran. His patience in the face of trial remains a lesson in restraint.`,
    },
    {
      title: "Ali ibn Abi Talib — The Knowledgeable",
      body: `Ali ibn Abi Talib was the Prophet's cousin, raised in his household, and the first young person to accept Islam. On the night the Prophet ﷺ emigrated to Madinah, it was Ali who slept in his bed to deceive the assassins waiting outside — risking his life out of pure devotion. He was renowned for his courage in battle, his eloquence, and his deep knowledge. The Prophet ﷺ said, "I am the city of knowledge and Ali is its gate."

As the fourth Caliph, Ali inherited a community fractured by the unrest that followed Uthman's death. His caliphate was consumed by civil strife (fitna), and he strove throughout to uphold justice and unity amid impossibly difficult circumstances. His sermons and letters, later collected, remain masterpieces of wisdom and Arabic eloquence.

Ali lived with severe simplicity, mending his own sandals and sharing the food of the poor. He taught that true nobility lies in character, not lineage: "Do not let your hardship in doing good make you abandon it, for the reward outlasts the hardship." He was martyred in the masjid of Kufa in 40 AH, struck while in prostration.`,
    },
    {
      title: "The Compilation of the Quran",
      body: `The preservation of the Quran is one of the great achievements of this era. During the Prophet's life, revelation was both memorized by hundreds of companions and written on available materials — palm leaves, stone, and parchment. It existed complete, but scattered.

Under Abu Bakr, after the Battle of Yamama killed many memorizers, Umar urged that the written fragments be gathered into one place. Zayd ibn Thabit, the Prophet's scribe, led the task, accepting nothing without verification from multiple witnesses. The result was the first complete written Mushaf, kept safe in Madinah.

Under Uthman, as the community spread, this Mushaf became the master from which standardized copies were made and distributed across the empire, each with a qualified teacher. Through this careful, multi-layered process — memorized in hearts and fixed in text — the Quran has reached us today exactly as it was revealed, unchanged across fourteen centuries.`,
    },
    {
      title: "Lessons in Leadership",
      body: `The four Rightly-Guided Caliphs led in very different styles — Abu Bakr with gentle firmness, Umar with structured justice, Uthman with generous patience, Ali with principled wisdom — yet they shared the same foundation: a leadership rooted in service, accountability, and fear of Allah rather than love of power.

They held no royal courts. They could be questioned by the lowest member of society in the open mosque. Umar famously accepted public correction during a sermon. They distributed wealth to the people while living among the poorest, understanding that authority is a trust (amanah) for which they would answer before Allah.

For us, their example is not a relic of history but a living standard. Whether we lead a nation, a community, a classroom, or a household, the principles remain: be just even against your own interest, serve those under your care, remain humble in success, and never separate leadership from accountability to the Creator.`,
    },
  ],

  // ── Lives of the Sahaba ─────────────────────────────────────────────────────
  "lives-of-the-sahaba": [
    {
      title: "Abu Bakr as-Siddiq",
      body: `The first adult man to embrace Islam and the dearest friend of the Prophet ﷺ. A successful merchant known for his honesty, Abu Bakr spent his wealth freeing enslaved Muslims who were tortured for their faith, including Bilal ibn Rabah. He accompanied the Prophet ﷺ on the emigration to Madinah, hiding with him in the cave of Thawr, where Allah revealed of him: "Do not grieve; indeed Allah is with us." He became the first Caliph and a model of steadfast, humble faith.`,
    },
    {
      title: "Umar ibn al-Khattab",
      body: `Once a fierce enemy of Islam, Umar's heart was softened when he heard verses of the Quran recited in his sister's home. His conversion strengthened the Muslims immensely. Known as al-Faruq, he became the second Caliph and one of history's great administrators and just rulers, building the institutions of a state while living in austerity and walking among his people to know their needs.`,
    },
    {
      title: "Uthman ibn Affan",
      body: `A wealthy, modest, and exceedingly generous early convert, Uthman gave freely for the sake of Allah — buying a well for the thirsty and equipping armies from his own fortune. As the third Caliph he standardized the written Quran, preserving its unity for all generations. He met his end with patience, refusing to shed Muslim blood in his own defense.`,
    },
    {
      title: "Ali ibn Abi Talib",
      body: `The Prophet's cousin and son-in-law, raised in his household and the first youth to accept Islam. Famous for courage, eloquence, and knowledge, Ali risked his life sleeping in the Prophet's bed during the emigration. As the fourth Caliph he upheld justice through years of turmoil, leaving behind sermons and sayings treasured for their wisdom.`,
    },
    {
      title: "Khadijah bint Khuwaylid",
      body: `The first person to accept Islam and the beloved wife of the Prophet ﷺ. A respected and successful businesswoman, she supported him with her wealth, her counsel, and her unwavering belief at the very moment revelation began and others doubted. The Prophet ﷺ never forgot her loyalty, saying, "She believed in me when the people disbelieved." She is among the greatest women of all time.`,
    },
    {
      title: "Bilal ibn Rabah",
      body: `An enslaved African man brutally tortured for refusing to renounce Islam, Bilal repeated only "Ahad, Ahad" — "One, One" — affirming the oneness of Allah. Freed by Abu Bakr, he became the first mu'adhin of Islam, his powerful voice calling the believers to prayer. His story is an eternal testimony that nobility lies in faith and character, not in race or status.`,
    },
    {
      title: "Salman al-Farsi",
      body: `Born in Persia, Salman left a life of comfort on a long search for the true religion, passing through several faiths and even enslavement before finding the Prophet ﷺ in Madinah. His knowledge proved decisive: at the Battle of the Trench, he proposed digging a defensive ditch around the city, a strategy that saved the Muslims. The Prophet ﷺ honored him as "one of us, the family of the Prophet."`,
    },
    {
      title: "Mus'ab ibn Umayr",
      body: `Once the most pampered youth of Makkah, dressed in the finest clothes, Mus'ab gave it all up for Islam and was disowned by his family. The Prophet ﷺ sent him as the first teacher of Islam to Madinah, where his gentle wisdom brought many to faith. He was martyred at Uhud holding the banner aloft; when he was buried, his shroud was too short to cover him fully — a sign of how completely he had traded the world for the Hereafter.`,
    },
    {
      title: "Khalid ibn al-Walid",
      body: `A brilliant general who once led the Makkans against the Muslims, Khalid embraced Islam and became "the Drawn Sword of Allah." Undefeated across dozens of battles, his military genius opened vast lands to Islam. Yet his greatest victory was over himself: when Umar removed him from command to remind the people that victory comes from Allah alone, Khalid obeyed without complaint and fought on as an ordinary soldier.`,
    },
    {
      title: "Aisha bint Abi Bakr",
      body: `The daughter of Abu Bakr and a wife of the Prophet ﷺ, Aisha became one of the greatest scholars in Islamic history. Sharp of memory and intellect, she narrated over two thousand hadith and taught the law, the Quran, medicine, and poetry. Companions and scholars traveled to learn from her. She stands as a towering example of female scholarship at the heart of the faith.`,
    },
    {
      title: "Abu Hurairah",
      body: `Though he accompanied the Prophet ﷺ for only a few years, Abu Hurairah devoted himself entirely to memorizing his words, becoming the most prolific narrator of hadith. Poor and often hungry, he chose the company of the Prophet over trade or comfort, and prayed for a memory that would never forget. Through him, an immense portion of the Prophet's teachings reached the world.`,
    },
    {
      title: "Sa'd ibn Abi Waqqas",
      body: `One of the earliest converts and among the ten promised Paradise, Sa'd was the first to shed blood in the defense of Islam and a famed archer. The Prophet ﷺ would say to him, "Shoot, may my father and mother be sacrificed for you." A devoted son who honored his mother even when she opposed his faith, he later led the Muslims to a historic victory at al-Qadisiyyah.`,
    },
  ],

  // ── Stories of the Prophets ─────────────────────────────────────────────────
  "stories-of-the-prophets": [
    {
      title: "Adam — The First Human",
      body: `Allah created Adam from clay, breathed into him from His spirit, and taught him the names of all things — granting humankind knowledge above the angels. He honored Adam by commanding the angels to prostrate to him, and all did except Iblis, who refused out of pride and was cast out.

Adam and his wife Hawwa dwelt in Paradise but were deceived by Iblis into eating from the forbidden tree. They repented sincerely, and Allah, the Most Merciful, accepted their repentance and sent them to the earth as the first of humanity. Adam's story teaches the dignity of knowledge, the danger of pride, and the boundless mercy that meets sincere repentance.`,
    },
    {
      title: "Nuh — The Patient Caller",
      body: `Prophet Nuh called his people to worship Allah alone for 950 years, meeting ridicule and rejection with unbroken patience. Only a few believed. When they persisted in arrogance and corruption, Allah commanded him to build an ark.

The great flood came, and Nuh carried the believers and pairs of every creature to safety, while the deniers — including his own son, who refused to board — were lost. His story is the supreme example of patience in calling to the truth, and a reminder that guidance is from Allah alone, not even a prophet can force a heart to believe.`,
    },
    {
      title: "Ibrahim — The Friend of Allah",
      body: `Ibrahim reasoned his way to the truth, rejecting the idols of his people and even the kingship of the tyrant Nimrod. Thrown into a blazing fire for smashing the idols, he was saved when Allah commanded, "O fire, be coolness and safety upon Ibrahim." He never lost faith.

Tested with the command to leave his wife Hajar and infant son Isma'il in the barren valley of Makkah, and later to sacrifice that beloved son, Ibrahim submitted completely — and Allah ransomed his son and made his sacrifice a rite for all time. With Isma'il he raised the Ka'bah, the first house of worship. He is honored as Khalilullah, the intimate friend of Allah.`,
    },
    {
      title: "Yusuf — The Trusted",
      body: `The beloved son of Ya'qub, Yusuf was thrown into a well by his jealous brothers, sold into slavery, and later imprisoned though innocent. Through every trial he held to patience, honesty, and trust in Allah, refusing temptation and interpreting dreams by Allah's leave.

Raised at last to govern the treasures of Egypt, he saved the land from famine and was reunited with the very brothers who had wronged him. His response was not revenge but forgiveness: "No blame upon you today." The Quran calls his the "most beautiful of stories" — a lesson that patience and integrity, however long tested, are crowned by Allah's relief.`,
    },
    {
      title: "Musa — The One Who Spoke with Allah",
      body: `Born under Pharaoh's decree to kill the sons of the Israelites, Musa was placed by his mother in a basket upon the Nile and raised, by Allah's plan, in Pharaoh's own palace. Called to prophethood at the sacred valley, he was sent with his brother Harun to confront the tyrant who claimed to be a god.

Through clear signs Musa challenged Pharaoh, and when the oppressor pursued the fleeing Israelites, Allah parted the sea to save the believers and drowned the tyrant. Musa received the Torah and led his people through years of further testing. His life is a study in courage before tyranny and reliance upon Allah in the face of overwhelming odds.`,
    },
    {
      title: "Dawud & Sulayman — The Kings",
      body: `Prophet Dawud was granted kingship, prophethood, and a voice so beautiful that the mountains and birds joined his praise of Allah. He was given the Zabur (Psalms) and the wisdom to judge justly among the people, and Allah taught him to fashion armor from iron.

His son Sulayman inherited his wisdom and received a kingdom unlike any other — command over the wind, understanding of the speech of birds and ants, and authority over the jinn. Yet for all his power and wealth, Sulayman remained a humble servant who attributed every blessing to Allah, teaching that the greatest gift is a heart that remains grateful.`,
    },
    {
      title: "Yunus — The Companion of the Whale",
      body: `Prophet Yunus called his people to Allah, but when they rejected him he left in anger before Allah permitted it. Aboard a ship in a violent storm, lots were cast and he was thrown into the sea, where a great whale swallowed him.

In the darkness of the whale's belly, Yunus turned to Allah with the words: "There is no god but You; glory be to You; indeed I was among the wrongdoers." Allah heard him, rescued him, and returned him to his people — who by then had all believed. His story teaches that no darkness is beyond the reach of sincere repentance and the remembrance of Allah.`,
    },
    {
      title: "Isa — The Messiah",
      body: `Isa, the son of Maryam, was born by the miracle of Allah without a father, and spoke from the cradle to defend his mother's honor. A messenger to the Children of Israel, he was given the Injil (Gospel) and, by Allah's permission, healed the blind and the leper and revived the dead — clear signs that he was a servant and prophet of Allah, not a god.

When his enemies plotted to kill him, Allah raised him up to Himself. The Quran honors Maryam and her son with the deepest reverence, affirming Isa as a mighty messenger in the unbroken chain of prophets calling to the worship of the One God.`,
    },
    {
      title: "Muhammad ﷺ — The Final Messenger",
      body: `Born in Makkah and known even before prophethood as al-Amin, "the Trustworthy," Muhammad ﷺ received revelation at the age of forty in the cave of Hira. For twenty-three years he conveyed the Quran and a complete way of life, calling humanity from idolatry to the worship of Allah alone with patience, mercy, and unmatched character.

Persecuted in Makkah, he emigrated to Madinah and there built the first Muslim community — a society of justice, brotherhood, and faith. By the end of his life, Arabia had been transformed. He is the Seal of the Prophets, sent as a mercy to all the worlds, and his example (Sunnah) remains, alongside the Quran, the guidance for every believer until the end of time.`,
    },
  ],

  // ── Foundations of Islam ────────────────────────────────────────────────────
  "foundations-of-islam": [
    {
      title: "Shahada — The Testimony of Faith",
      body: `The foundation of Islam is the shahada: "La ilaha illa Allah, Muhammadun rasul Allah" — there is no god but Allah, and Muhammad is the Messenger of Allah. To say it with sincerity and understanding is to enter Islam.

The first half affirms tawhid, the absolute oneness of Allah: He alone deserves worship, has no partner, and nothing resembles Him. The second half affirms that Muhammad ﷺ is His final messenger, whose teachings we follow. Every other pillar and belief flows from this single testimony — that life itself is to be devoted to the One who created it.`,
    },
    {
      title: "Salah — The Prayer",
      body: `Salah is the five daily prayers — Fajr, Dhuhr, Asr, Maghrib, and Isha — the first deed a person will be asked about on the Day of Judgment. It is a direct, recurring connection between the servant and the Creator, anchoring the whole day in remembrance of Allah.

Performed in a state of purity (wudu), facing the Ka'bah, the prayer combines standing, bowing, and prostration with recitation of the Quran and supplication. More than a ritual, it is meant to cleanse the heart and restrain a person from wrongdoing. Whoever guards their prayers guards their faith.`,
    },
    {
      title: "Zakat — The Purifying Charity",
      body: `Zakat is the obligatory annual charity — typically 2.5% of accumulated wealth above a threshold — given to the poor and other deserving categories named in the Quran. Its name means both "purification" and "growth": it purifies wealth and the heart from greed, and it grows blessing.

Zakat is not a favor to the poor but their right within the wealth of the rich. It binds the community together, narrows the gap between rich and poor, and reminds the believer that all provision comes from Allah and is held in trust. Through it, worship and social justice become one.`,
    },
    {
      title: "Sawm — The Fast of Ramadan",
      body: `In the month of Ramadan, Muslims fast from dawn until sunset, abstaining from food, drink, and desires. The fast is an act of worship known only between the servant and Allah, building taqwa — God-consciousness — and self-restraint.

Beyond hunger, the fast trains the soul: it softens the heart toward the poor who go without, sharpens gratitude for daily blessings, and frees time for extra prayer and recitation of the Quran, which was first revealed in this month. Ramadan is a yearly renewal of discipline, mercy, and closeness to Allah.`,
    },
    {
      title: "Hajj — The Pilgrimage",
      body: `Hajj is the pilgrimage to Makkah, obligatory once in a lifetime upon those with the means and ability. Millions gather from every nation, all in simple white garments, erasing every distinction of wealth and rank before Allah.

Retracing the legacy of Ibrahim, the pilgrims circle the Ka'bah, stand together on the plain of Arafat in humble supplication, and renew their submission to the One God. Hajj is a powerful image of unity and equality, and a rehearsal for the Day all of humanity will stand before their Lord. The one whose Hajj is accepted returns as pure as a newborn.`,
    },
    {
      title: "The Articles of Faith",
      body: `While the five pillars are the actions of Islam, the six articles are the beliefs of Iman. A Muslim believes in: Allah, the One Creator; His angels, created from light to carry out His commands; His revealed books, including the Torah, Gospel, and the final Quran; His messengers, from Adam to Muhammad ﷺ; the Last Day, when all will be raised and judged; and divine decree (qadar), that all things occur by Allah's knowledge and will.

Together, belief and action form a complete way of life. The pillars give the body its worship; the articles give the heart its certainty. To hold both with sincerity is to walk the straight path Allah has laid out for those who seek Him.`,
    },
  ],
};
