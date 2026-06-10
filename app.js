/* Voice of the Shepherd - Core Application Logic (Optimized for Quota & Credits) */

document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT ---
    const appState = {
        currentView: 'home-view',
        language: localStorage.getItem('vos_language') || 'en-US',
        apiKey: localStorage.getItem('vos_api_key') || '',
        defaultApiKey: '',
        geminiModel: localStorage.getItem('vos_gemini_model') || 'gemini-2.0-flash',
        theme: localStorage.getItem('theme') || 'light',
        challengeCompleted: localStorage.getItem('vos_challenge_completed') === new Date().toDateString(),
        
        // Quiz State
        quiz: {
            userName: '',
            level: 1,
            questions: [],
            currentQuestionIdx: 0,
            score: 0,
            timer: null,
            timeLeft: 15,
            selectedCertPhoto: null
        },
        
        // Calling Assessment State
        calling: {
            currentIdx: 0,
            answers: [], // Selected options (A, B, C, D, E, F, G)
            traits: {
                evangelism: 0,
                pastoral: 0,
                teaching: 0,
                mercy: 0,
                administration: 0,
                creative: 0,
                intercession: 0
            }
        }
    };

    // --- DATA DICTIONARIES (LOCAL DATABASES FOR QUOTA PROTECTION) ---
    
    // 1. Static Missionary Profiles (No API credits used)
    const missionaryData = {
        "hudson taylor": {
            name: "James Hudson Taylor",
            quote: "God's work done in God's way will never lack God's supplies.",
            bio: "### Hudson Taylor (1832–1905)\n\nHudson Taylor was a British Protestant Christian missionary to China and founder of the **China Inland Mission** (CIM, now OMF International). Taylor spent 51 years in China. The society that he began was responsible for bringing over 800 missionaries to the country, who began 125 schools and directly resulted in Christian conversions of an estimated 18,000 people.\n\n#### Key Contributions\n- **Cultural Contextualization**: He adopted Chinese dress and customs, which was highly controversial among contemporary missionaries but allowed him deep access to the inland provinces.\n- **Faith Missions**: He refused to solicit donations or guarantee salaries to his staff, relying solely on faith in God's providence.\n- **Legacy**: He is widely regarded as one of the most significant missionaries of the 19th century."
        },
        "amy carmichael": {
            name: "Amy Carmichael",
            quote: "You can give without loving, but you cannot love without giving.",
            bio: "### Amy Carmichael (1867–1951)\n\nAmy Carmichael was a Protestant Christian missionary in India, who opened an orphanage and founded the **Dohnavur Fellowship** in Tamil Nadu. She served in India for 55 years without a single furlough, dedicating her life to saving children from temple trafficking and abuse.\n\n#### Key Contributions\n- **Child Protection**: Rescued young girls and boys from dangerous and exploitative temple rituals.\n- **Prolific Writer**: Wrote 35 books detailing her missionary journeys, spiritual reflections, and struggles, inspiring generations of future missionaries.\n- **Dohnavur Fellowship**: Established a safe sanctuary that became a home for over a thousand children."
        },
        "george muller": {
            name: "George Müller",
            quote: "The beginning of anxiety is the end of faith, and the beginning of true faith is the end of anxiety.",
            bio: "### George Müller (1805–1898)\n\nGeorge Müller was a Christian evangelist and the director of the **Ashley Down Orphanage** in Bristol, England. He cared for 10,024 orphans during his lifetime and established 117 schools which offered Christian education to more than 120,000 children, all while refusing to ever request financial support directly from individuals.\n\n#### Key Contributions\n- **The Power of Prayer**: Known for praying specifically for resources (food, rent, salaries) and receiving miraculous, unsolicited donations just in time.\n- **Orphan Care**: Raised the standards of orphanages in Victorian England, providing clean quarters, education, and vocational training.\n- **Global Evangelism**: In his later years, he traveled over 200,000 miles preaching in dozens of countries."
        },
        "jim elliot": {
            name: "Jim Elliot",
            quote: "He is no fool who gives what he cannot keep to gain what he cannot lose.",
            bio: "### Jim Elliot (1927–1956)\n\nJim Elliot was an American Christian missionary and one of five missionaries killed during **Operation Auca**, an attempt to evangelize the Huaorani people of the rainforest of Ecuador.\n\n#### Key Contributions\n- **Ultimate Sacrifice**: Martyred at age 28 along with Ed McCully, Roger Youderian, Pete Fleming, and pilot Nate Saint.\n- **Uncompromising Faith**: His journals, published by his wife Elisabeth Elliot, became international Christian bestsellers.\n- **Reconciliation**: Years after his death, his widow Elisabeth and Nate Saint's sister Rachel returned to live among the Huaorani, leading many of them, including those who speared the men, to faith in Jesus."
        },
        "gladys aylward": {
            name: "Gladys Aylward",
            quote: "If God has called you, don't look back; He will go before you and secure the way.",
            bio: "### Gladys Aylward (1902–1970)\n\nGladys Aylward was a British evangelical Christian missionary to China, known as the 'Virtuous One' (Ai-weh-deh). Born a domestic parlourmaid, she was rejected by missionary societies as unqualified but bought her own train ticket to travel across Siberia to reach China.\n\n#### Key Contributions\n- **The Inn of the Eight Happinesses**: Created an inn offering food and stories to muleteers, establishing a platform to share the Gospel.\n- **Footbinding Reform**: Appointed by the local Mandarin mandarin as an official 'Foot Inspector' to enforce the ban on foot binding.\n- **Heroic Rescue**: During the Second Sino-Japanese War, she led 94 orphans on a perilous 12-day journey over mountains to safety, despite being wounded herself."
        }
    };

    // 2. Local Database of Daily Verses & Tasks
    const dailyDevotionals = [
        { verse: '"Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God." — Philippians 4:6', task: "Challenge: Write down 3 things you are anxious about, pray over them, and deliberately throw the paper away as a symbol of surrender." },
        { verse: '"A new commandment I give to you, that you love one another; as I have loved you, that you also love one another." — John 13:34', task: "Challenge: Send an encouraging text message or make a call to a friend or family member you haven't spoken to in a while." },
        { verse: '"Trust in the Lord with all your heart, and lean not on your own understanding; in all your ways acknowledge Him, and He shall direct your paths." — Proverbs 3:5-6', task: "Challenge: Take a 10-minute walk in silence today. Ask God for direction on a decision you are facing, and just listen." },
        { verse: '"The Lord is my shepherd; I shall not want. He makes me to lie down in green pastures; He leads me beside the still waters." — Psalm 23:1-2', task: "Challenge: Before sleeping tonight, read Psalm 23 slowly three times and meditate on the peace of God's presence." },
        { verse: '"Let your light so shine before men, that they may see your good works and glorify your Father in heaven." — Matthew 5:16', task: "Challenge: Perform one anonymous act of kindness today—pay for someone's coffee, clean a common area, or leave a kind note." },
        { verse: '"But the fruit of the Spirit is love, joy, peace, longsuffering, kindness, goodness, faithfulness, gentleness, self-control." — Galatians 5:22-23', task: "Challenge: Identify which fruit of the Spirit you struggled with yesterday (e.g., patience), and pray specifically for grace to grow in it today." },
        { verse: '"Commit your way to the Lord, trust also in Him, and He shall bring it to pass." — Psalm 37:5', task: "Challenge: Write your plans for the month on a card, pray and lay them before God, asking Him to align your plans with His will." }
    ];

    // 3. Pre-Compiled Spiritual Calling Profiles (Instantly loads local description to save credits)
    const callingProfiles = {
        "evangelism": {
            name: "Evangelism (Kingdom Outreach)",
            desc: "### Your Calling Profile: Evangelism\n\nYour profile indicates a primary calling in **Evangelism**. You possess a natural desire and spiritual courage to share the Gospel of Jesus Christ with non-believers. Where others feel hesitant, you feel energized by spiritual conversations.\n\n#### Biblical Examples\n- **Philip the Evangelist** ([Acts 8:5-40](file:///)): Preached Christ in Samaria and explained the scriptures to the Ethiopian eunuch.\n- **The Apostle Paul** ([Romans 10:14-15](file:///)): Traveled borders to preach where Christ had not been named.\n\n#### Practical Action Steps\n1. **Outreach Volunteering**: Join or lead outreach, street ministries, or alpha courses in your community.\n2. **Personal Testimony**: Refine your personal testimony to be shared in under 3 minutes.\n3. **Mentorship**: Mentor younger believers who want to grow in boldness.\n\n*Scripture Anchor: 'But you be watchful in all things, endure afflictions, do the work of an evangelist, fulfill your ministry.' — 2 Timothy 4:5*"
        },
        "pastoral": {
            name: "Pastoral Care (Shepherding)",
            desc: "### Your Calling Profile: Shepherding & Counseling\n\nYour profile highlights a **Pastoral Care** shepherding heart. You feel a deep calling to nurture, protect, listen, and guide believers through emotional and spiritual struggles. You serve as a safe haven of comfort.\n\n#### Biblical Examples\n- **Barnabas** ([Acts 9:27](file:///)): The 'Son of Encouragement' who sponsored the newly converted Paul when others feared him.\n- **Timothy** ([1 Timothy 4:12](file:///)): Guided and shepherded early local congregations under Paul's mentoring.\n\n#### Practical Action Steps\n1. **Small Group Leadership**: Volunteer to host or lead a home study group.\n2. **Pastoral Care Team**: Join visiting ministries looking after hospital patients or the homebound.\n3. **Counseling Studies**: Invest time studying Christian counseling and active listening techniques.\n\n*Scripture Anchor: 'Shepherd the flock of God which is among you, serving as overseers, not by compulsion but willingly.' — 1 Peter 5:2*"
        },
        "teaching": {
            name: "Teaching (Doctrine & Biblical Studies)",
            desc: "### Your Calling Profile: Teacher\n\nYour profile reveals a strong calling in **Teaching**. You have a deep love for sound doctrine, scriptures, and theology. You find joy in researching the historical context of texts and communicating these truths clearly.\n\n#### Biblical Examples\n- **Ezra the Scribe** ([Ezra 7:10](file:///)): Prepared his heart to seek the Law of the Lord, to do it, and to teach statutes in Israel.\n- **Apollos** ([Acts 18:24-28](file:///)): An eloquent man, mighty in the Scriptures, who vigorously explained Jesus from text.\n\n#### Practical Action Steps\n1. **Sunday School**: Teach classes, youth studies, or write devotional study plans.\n2. **Systematic Study**: Build a library of biblically sound commentaries and Greek/Hebrew reference tools.\n3. **Write Articles**: Share study summaries or articles on scripture truths.\n\n*Scripture Anchor: 'And the things that you have heard from me among many witnesses, commit these to faithful men who will be able to teach others also.' — 2 Timothy 2:2*"
        },
        "mercy": {
            name: "Mercy & Service (Compassionate Aid)",
            desc: "### Your Calling Profile: Mercy & Practical Service\n\nYour profile indicates a calling in **Mercy and Help**. You express Christ's love through hands-on practical care and emotional empathy. You find joy in serving behind the scenes, meeting physical needs.\n\n#### Biblical Examples\n- **Tabitha (Dorcas)** ([Acts 9:36-42](file:///)): Notable for her good works and charitable deeds, making coats and garments for poor widows.\n- **The Good Samaritan** ([Luke 10:30-37](file:///)): Demonstrated hands-on compassion to a broken stranger, covering costs out of pocket.\n\n#### Practical Action Steps\n1. **Mercy Ministries**: Volunteer at food pantries, homeless shelters, or disaster response teams.\n2. **Practical Acts**: Help elderly church members with home repairs, cleaning, or grocery shopping.\n3. **Benevolence Coordinator**: Support or help organize benevolence funds for members in crisis.\n\n*Scripture Anchor: 'He who shows mercy, with cheerfulness; he who serves, let him do it with the ability which God supplies.' — Romans 12:8 / 1 Peter 4:11*"
        },
        "administration": {
            name: "Administration & Leadership",
            desc: "### Your Calling Profile: Administration & Leadership\n\nYour profile indicates a calling in **Administration and Stewardship**. You possess organizational abilities, strategic vision, and can lead teams to execute complex projects with order and excellence.\n\n#### Biblical Examples\n- **Joseph in Egypt** ([Genesis 41:39-41](file:///)): Organised grain distribution systems that saved nations from famine.\n- **Nehemiah** ([Nehemiah 2-4](file:///)): Structured construction cohorts and protection details to rebuild Jerusalem's walls.\n\n#### Practical Action Steps\n1. **Ministry Coordination**: Offer to help coordinate logistics for church conferences, outreach days, or database structures.\n2. **Strategic Planning**: Help church leadership compile goals and timelines for upcoming seasons.\n3. **Operational Volunteering**: Serve as an usher coordinator, project manager, or church treasurer.\n\n*Scripture Anchor: 'Let all things be done decently and in order.' — 1 Corinthians 14:40*"
        },
        "creative": {
            name: "Creative Arts & Worship",
            desc: "### Your Calling Profile: Creative & Worship Arts\n\nYour profile indicates a calling in **Creative Expression & Worship**. You feel a desire to utilize music, songwriting, poetry, and design to glorify God and lead others into His presence.\n\n#### Biblical Examples\n- **King David** ([Psalms](file:///)): The sweet psalmist of Israel who designed musical instruments and worship orders.\n- **Bezalel** ([Exodus 31:1-5](file:///)): Filled with the Spirit of God in wisdom and artistic craftsmanship to build the Tabernacle.\n\n#### Practical Action Steps\n1. **Worship Team**: Join the praise team, choir, or musical band at your local church.\n2. **Art & Media**: Offer photography, graphic design, staging decoration, or media system volunteering.\n3. **Composition**: Write original songs, devotionals, or poems to share during worship.\n\n*Scripture Anchor: 'Sing to Him a new song; play skillfully with a shout of joy.' — Psalm 33:3*"
        },
        "intercession": {
            name: "Intercession (Prayer & Spiritual Warfare)",
            desc: "### Your Calling Profile: Intercession\n\nYour profile reveals a calling in **Intercession**. You are a silent prayer warrior. You feel an inner call to stand in the gap, praying specifically and persistently for other ministries, individuals, and spiritual battles.\n\n#### Biblical Examples\n- **Epaphras** ([Colossians 4:12](file:///)): 'Always laboring fervently for you in prayers, that you may stand perfect in the will of God.'\n- **Daniel** ([Daniel 9](file:///)): Dedicated seasons of fasting and pleading on behalf of his nation, unlocking heavenly answers.\n\n#### Practical Action Steps\n1. **Prayer Groups**: Join or coordinate intercessory prayer chains, night vigils, or pre-service prayer.\n2. **Prayer Journaling**: Keep detailed logs of requests and mark the dates when God answers.\n3. **Fasting Discipline**: Integrate scriptural fasting into your personal prayer walk.\n\n*Scripture Anchor: 'Praying always with all prayer and supplication in the Spirit, being watchful to this end with all perseverance.' — Ephesians 6:18*"
        }
    };

    // 4. Pre-Compiled Life Situation Guides (Saves API credits for common situations)
    const localSituationGuides = {
        "Anxiety & Worry": "### Guidance for Anxiety & Worry\n\nAnxiety is a common human experience, but scripture invites us to transfer our worries into God's hands. When we carry worry, we are attempting to manage a future that belongs only to God.\n\n#### Key Scriptures\n- **Philippians 4:6-7**: 'Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God; and the peace of God, which surpasses all understanding, will guard your hearts.'\n- **1 Peter 5:7**: 'Casting all your care upon Him, for He cares for you.'\n- **Matthew 6:34**: 'Therefore do not worry about tomorrow, for tomorrow will worry about its own things.'\n\n#### Practical Steps\n1. **The Breathe-and-Pray Rule**: Stop for 2 minutes. Inhale slowly while thinking: *'Lord, You are in control'*, and exhale thinking: *'I release this anxiety'.*\n2. **Limit Information overload**: Unplug from social media and negative news cycles for 24 hours.\n3. **Write it Down**: Write down your exact fear. Hand it to God in prayer, then cross it off or tear up the paper.\n\n#### A Prayer for Calm\n*\"Heavenly Father, my heart is troubled and anxious. I surrender my fears, my family, and my future to Your loving hands. Infuse my mind with Your quiet peace. I trust that You are working all things for my good. In Jesus' name, Amen.\"*",
        
        "Stress": "### Guidance for Stress & Burnout\n\nBurnout occurs when we try to operate in our own strength rather than resting in God's grace. God did not design you to run constantly without Sabbath.\n\n#### Key Scriptures\n- **Matthew 11:28-30**: 'Come to Me, all you who labor and are heavy laden, and I will give you rest.'\n- **Isaiah 40:29**: 'He gives power to the weak, and to those who have no might He increases strength.'\n- **Psalm 46:1**: 'God is our refuge and strength, a very present help in trouble.'\n\n#### Practical Steps\n1. **Sabbath Hours**: Protect at least 4 hours today to completely rest, pray, and do something that brings you joy in God's creation.\n2. **Prioritization**: Write down your list. Ask: *'What is God asking me to do, and what am I taking on out of people-pleasing?'* Delete the latter.\n3. **Physical Care**: Treat your body as a temple. Rest sufficiently and drink water.\n\n#### A Prayer for Rest\n*\"Lord Jesus, I am weary and heavy-laden. I swap my heavy yolk for Your light and easy one. Help me to rest in the confidence that You hold my life. Give me the wisdom to say 'no' when needed, and restore my soul today. Amen.\"*",
        
        "Fear": "### Guidance for Facing Fear\n\nFear seeks to paralyze our faith. Courage is not the absence of fear, but the decision that God is larger than whatever is threatening you.\n\n#### Key Scriptures\n- **Isaiah 41:10**: 'Fear not, for I am with you; be not dismayed, for I am your God. I will strengthen you, yes, I will help you.'\n- **Psalm 27:1**: 'The Lord is my light and my salvation; whom shall I fear? The Lord is the strength of my life; of whom shall I be afraid?'\n- **2 Timothy 1:7**: 'For God has not given us a spirit of fear, but of power and of love and of a sound mind.'\n\n#### Practical Steps\n1. **Scripture Declaration**: Quote Psalm 27:1 aloud whenever a fearful thought enters your mind.\n2. **Define the Fear**: Ask: *'What is the worst-case scenario, and how is God bigger than that outcome?'*\n3. **Step Out**: Do one small thing today that fear is trying to stop you from doing.\n\n#### A Prayer for Courage\n*\"Father, when terror and fear wrap around me, anchor my soul in Your love. I declare that You are my fortress. I will not fear what man or circumstances can do to me, because You go before me. Thank You for Your protection. Amen.\"*",
        
        "Grief & Loss": "### Guidance in Grief & Loss\n\nGrief is a painful reflection of love. God does not ask you to hide your tears; He promises to hold them. Jesus wept, validating our sorrow.\n\n#### Key Scriptures\n- **Psalm 34:18**: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.'\n- **Matthew 5:4**: 'Blessed are those who mourn, for they shall be comforted.'\n- **Revelation 21:4**: 'And God will wipe away every tear from their eyes; there shall be no more death, nor sorrow, nor crying.'\n\n#### Practical Steps\n1. **Give Yourself Grace**: Do not rush your grief. Cry when you need to, and do not judge your emotions.\n2. **Express It**: Journal your thoughts, memories, and letters of appreciation about what was lost.\n3. **Do Not Isolate**: Spend time with at least one close, understanding friend who can sit with you in silence.\n\n#### A Prayer for Comfort\n*\"Lord, my heart is crushed, and the pain of loss is heavy. You are the God of all comfort. Come sit with me in my brokenness. Dry my tears with the hope of Your promises and wrap Your peace around my soul. Amen.\"*",
        
        "Decision Making": "### Guidance for Decision Making & Wisdom\n\nWhen standing at a crossroads, we often seek the destination. God invites us to seek the Guide. Wisdom is a gift promised to all who ask in faith.\n\n#### Key Scriptures\n- **Proverbs 3:5-6**: 'Trust in the Lord with all your heart, and lean not on your own understanding; in all your ways acknowledge Him, and He shall direct your paths.'\n- **James 1:5**: 'If any of you lacks wisdom, let him ask of God, who gives to all liberally and without reproach, and it will be given to him.'\n- **Psalm 119:105**: 'Your word is a lamp to my feet and a light to my path.'\n\n#### Practical Steps\n1. **Lay Down Your Preferences**: Pray: *'Lord, not my will, but Yours. I am willing to go either way.'* This opens your heart to hear Him.\n2. **Biblical Alignment**: Check if your choices contradict scripture. If one choice violates a command, your decision is already made.\n3. **Seek Counsel**: Ask 2 mature Christian mentors for their objective feedback.\n\n#### A Prayer for Guidance\n*\"Father, I do not know which path to take. I ask for Your promised wisdom. Open the doors that should be open, and shut the doors that should be shut. Lead me clearly, and give me a peace that confirms Your direction. Amen.\"*"
    };

    // 5. Bible Quiz Questions Database
    const quizLevels = {
        1: [
            { q: "How many books are in the Protestant Bible?", a: ["66", "73", "39", "27"], c: 0 },
            { q: "Who built the ark that survived the Great Flood?", a: ["Abraham", "Moses", "Noah", "David"], c: 2 },
            { q: "In what town was Jesus Christ born?", a: ["Nazareth", "Jerusalem", "Bethlehem", "Jericho"], c: 2 },
            { q: "What is the first book of the Bible?", a: ["Exodus", "Genesis", "Matthew", "Psalms"], c: 1 },
            { q: "How many disciples did Jesus choose as His closest apostles?", a: ["7", "10", "12", "70"], c: 2 }
        ],
        2: [
            { q: "Which of these is NOT one of the four Gospels?", a: ["Matthew", "Mark", "Acts", "John"], c: 2 },
            { q: "Who denied Jesus three times before the rooster crowed?", a: ["John", "Peter", "Judas", "Thomas"], c: 1 },
            { q: "Which disciple famously doubted Jesus' resurrection until he saw the wounds?", a: ["Thomas", "Andrew", "Simon", "Philip"], c: 0 },
            { q: "What miracle did Jesus perform at the wedding of Cana?", a: ["Healed a blind man", "Turned water into wine", "Walked on water", "Multiplied loaves and fish"], c: 1 },
            { q: "Who was raised from the dead by Jesus after being in the tomb for four days?", a: ["Jairus' daughter", "Lazarus", "Eutychus", "Tabitha"], c: 1 }
        ],
        3: [
            { q: "Who led the Israelites out of Egypt and received the Ten Commandments?", a: ["Joshua", "Aaron", "Moses", "Joseph"], c: 2 },
            { q: "Which prophet was thrown into a den of lions for praying to God?", a: ["Isaiah", "Jeremiah", "Ezekiel", "Daniel"], c: 3 },
            { q: "What giant Philistine warrior was defeated by the shepherd boy David?", a: ["Goliath", "Og", "Sihon", "Lahmi"], c: 0 },
            { q: "Which queen saved her Jewish people from a genocidal plot by Haman?", a: ["Ruth", "Esther", "Jezebel", "Athaliah"], c: 1 },
            { q: "Where did God give Moses the Ten Commandments?", a: ["Mount Carmel", "Mount Sinai", "Mount Nebo", "Mount Hermon"], c: 1 }
        ],
        4: [
            { q: "Which Apostle wrote the Epistle to the Romans?", a: ["Peter", "John", "Paul", "James"], c: 2 },
            { q: "In Galatians, which of the following is listed as a Fruit of the Spirit?", a: ["Power", "Wisdom", "Longsuffering/Patience", "Wealth"], c: 2 },
            { q: "According to Ephesians 6, what is the 'Sword of the Spirit'?", a: ["Faith", "The Word of God", "Righteousness", "Prayer"], c: 1 },
            { q: "What is the final book of the New Testament?", a: ["Jude", "Hebrews", "Revelation", "Acts"], c: 2 },
            { q: "Which book in the Old Testament contains the prophecy of the 'Suffering Servant' in chapter 53?", a: ["Jeremiah", "Ezekiel", "Isaiah", "Zechariah"], c: 2 }
        ]
    };

    // --- DOM ELEMENTS ---
    const elements = {
        themeToggle: document.getElementById('theme-toggle'),
        themeToggleDarkIcon: document.getElementById('theme-toggle-dark-icon'),
        themeToggleLightIcon: document.getElementById('theme-toggle-light-icon'),
        
        settingsBtn: document.getElementById('settings-btn'),
        settingsModal: document.getElementById('settings-modal'),
        closeSettingsBtn: document.getElementById('close-settings-btn'),
        settingsApiKey: document.getElementById('settings-api-key'),
        settingsModel: document.getElementById('settings-model'),
        saveApiKeyBtn: document.getElementById('save-api-key-btn'),
        resetApiKeyBtn: document.getElementById('reset-api-key-btn'),
        
        homeView: document.getElementById('home-view'),
        appViewsContainer: document.getElementById('app-views-container'),
        globalLoader: document.getElementById('global-loader'),
        notification: document.getElementById('notification'),
        
        missionaryName: document.getElementById('missionary-name'),
        missionaryQuote: document.getElementById('missionary-quote'),
        missionaryWeekBtn: document.getElementById('missionary-week-btn'),
        
        dailyVerse: document.getElementById('daily-verse'),
        dailyTask: document.getElementById('daily-task'),
        challengeCompleteBtn: document.getElementById('challenge-complete-btn'),
        challengeBtnIcon: document.getElementById('challenge-btn-icon'),
        challengeBtnText: document.getElementById('challenge-btn-text'),
        
        historyModal: document.getElementById('history-modal'),
        historyList: document.getElementById('history-list'),
        closeHistoryBtn: document.getElementById('close-history-btn'),
        clearHistoryBtn: document.getElementById('clear-history-btn'),
        
        backToHubBtn: document.querySelector('.back-to-hub-btn')
    };

    // --- INITIALIZATION ---
    function init() {
        // Setup default language and translations
        applyTranslations(appState.language);
        updateActiveLanguageButtons();
        
        // Setup theme
        initTheme();
        
        // Populate Daily Challenge and Missionary of the Week
        initDailyDevotional();
        initMissionaryOfTheWeek();
        
        // Register Global Event Listeners
        registerGlobalListeners();
        
        // Load API key placeholder and model selector value
        elements.settingsApiKey.value = appState.apiKey;
        if (elements.settingsModel) {
            elements.settingsModel.value = appState.geminiModel;
        }

        // Auto-open settings modal if API key is not yet set
        if (!appState.apiKey || appState.apiKey === "") {
            setTimeout(() => {
                elements.settingsModal.classList.remove('hidden');
                showToast("Please enter a Gemini API Key to enable AI features");
            }, 600);
        }
    }

    // --- TRANSLATION AND LOCALIZATION ENGINE ---
    function applyTranslations(lang) {
        document.documentElement.lang = lang.split('-')[0];
        
        // Apply styling class for custom fonts
        document.body.classList.remove('lang-hi-IN', 'lang-ta-IN', 'lang-te-IN');
        if (lang !== 'en-US') {
            document.body.classList.add(`lang-${lang}`);
        }
        
        // Translate elements with data-translate-key
        document.querySelectorAll('[data-translate-key]').forEach(el => {
            const key = el.getAttribute('data-translate-key');
            if (window.translations[lang] && window.translations[lang][key]) {
                if (key === 'markComplete' || key === 'completed') return; // Handled dynamically
                if (key === 'backToHome') {
                    el.textContent = window.translations[lang][key];
                    return;
                }
                el.textContent = window.translations[lang][key];
            }
        });
    }

    function updateActiveLanguageButtons() {
        document.querySelectorAll('.language-selector button').forEach(btn => {
            if (btn.getAttribute('data-lang') === appState.language) {
                btn.classList.add('active-lang');
            } else {
                btn.classList.remove('active-lang');
            }
        });
    }

    // --- THEME MANAGEMENT ---
    function initTheme() {
        if (appState.theme === 'dark') {
            document.documentElement.classList.add('dark');
            elements.themeToggleLightIcon.classList.remove('hidden');
            elements.themeToggleDarkIcon.classList.add('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            elements.themeToggleDarkIcon.classList.remove('hidden');
            elements.themeToggleLightIcon.classList.add('hidden');
        }
    }

    function toggleTheme() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            appState.theme = 'light';
            elements.themeToggleDarkIcon.classList.remove('hidden');
            elements.themeToggleLightIcon.classList.add('hidden');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            appState.theme = 'dark';
            elements.themeToggleLightIcon.classList.remove('hidden');
            elements.themeToggleDarkIcon.classList.add('hidden');
        }
        showToast("Theme updated");
    }

    // --- TOAST NOTIFICATIONS ---
    let toastTimeout;
    function showToast(message) {
        elements.notification.textContent = message;
        elements.notification.classList.remove('hidden');
        elements.notification.classList.add('animate-fade-in');
        
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            elements.notification.classList.add('hidden');
        }, 3000);
    }

    // --- ROUTING ENGINE ---
    function showView(viewId) {
        if (viewId === null) {
            // Returning to home
            elements.homeView.classList.remove('hidden');
            elements.appViewsContainer.classList.add('hidden');
            document.querySelectorAll('#app-views-container .app-view').forEach(view => {
                view.classList.add('hidden');
            });
            appState.currentView = 'home-view';
            window.scrollTo(0, 0);
            return;
        }

        const targetViewEl = document.getElementById(viewId);
        if (!targetViewEl) return;

        elements.homeView.classList.add('hidden');
        document.querySelectorAll('#app-views-container .app-view').forEach(view => {
            view.classList.add('hidden');
        });

        // Load template if not loaded
        if (targetViewEl.innerHTML.trim() === '') {
            const templateId = viewId.replace('-view', '-template');
            const templateEl = document.getElementById(templateId);
            if (templateEl) {
                targetViewEl.innerHTML = templateEl.innerHTML;
                bindViewListeners(viewId);
            }
        }

        elements.appViewsContainer.classList.remove('hidden');
        targetViewEl.classList.remove('hidden');
        appState.currentView = viewId;
        
        applyTranslations(appState.language);
        window.scrollTo(0, 0);
    }

    // --- VIEW INTERACTIVE LISTENERS BINDING ---
    function bindViewListeners(viewId) {
        // 1. Bible Search View
        if (viewId === 'ask-question-view') {
            const getAnswerBtn = document.getElementById('get-answer-btn');
            const micQuestionBtn = document.getElementById('mic-question');
            const questionTextarea = document.getElementById('question');
            
            getAnswerBtn.addEventListener('click', handleBibleSearch);
            micQuestionBtn.addEventListener('click', () => startSpeechRecognition(questionTextarea, micQuestionBtn));
            
            bindSelectorGroup('.tone-selector button', 'active-tone');
            bindSelectorGroup('.language-selector[data-tool="bible-search"] button', 'active-lang', (lang) => {
                appState.language = lang;
                localStorage.setItem('vos_language', lang);
                applyTranslations(lang);
                updateActiveLanguageButtons();
            });
            
            const histBtn = document.querySelector('#ask-question-view .history-btn');
            if (histBtn) histBtn.addEventListener('click', () => openHistoryModal('bibleSearch'));
        }
        
        // 2. Sermon Builder View
        if (viewId === 'sermon-builder-view') {
            const generateSermonBtn = document.getElementById('generate-sermon-btn');
            const micSermonBtn = document.getElementById('mic-sermon');
            const topicInput = document.getElementById('sermon-topic');
            
            generateSermonBtn.addEventListener('click', handleSermonBuilder);
            micSermonBtn.addEventListener('click', () => startSpeechRecognition(topicInput, micSermonBtn));
            
            bindSelectorGroup('.language-selector[data-tool="sermon"] button', 'active-lang', (lang) => {
                appState.language = lang;
                localStorage.setItem('vos_language', lang);
                applyTranslations(lang);
                updateActiveLanguageButtons();
            });

            const histBtn = document.querySelector('#sermon-builder-view .history-btn');
            if (histBtn) histBtn.addEventListener('click', () => openHistoryModal('sermon'));
        }

        // 3. Quiz View
        if (viewId === 'quiz-view') {
            const startQuizBtn = document.getElementById('start-quiz-btn');
            const nextQuestionBtn = document.getElementById('next-question-btn');
            const certImageUpload = document.getElementById('cert-image-upload');
            const nextLevelBtn = document.getElementById('next-level-btn');
            const downloadCertBtn = document.getElementById('download-cert-btn');

            startQuizBtn.addEventListener('click', startQuiz);
            nextQuestionBtn.addEventListener('click', loadNextQuestion);
            nextLevelBtn.addEventListener('click', unlockNextLevel);
            
            certImageUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        appState.quiz.selectedCertPhoto = event.target.result;
                        drawCertificate();
                        showToast("Photo uploaded to certificate successfully!");
                    };
                    reader.readAsDataURL(file);
                }
            });

            downloadCertBtn.addEventListener('click', () => {
                const canvas = document.getElementById('certificate-canvas');
                downloadCertBtn.href = canvas.toDataURL('image/png');
                downloadCertBtn.download = `Bible_Quiz_Certificate_Level_${appState.quiz.level}.png`;
            });
        }

        // 4. Worship Songwriter View
        if (viewId === 'songwriter-view') {
            const generateLyricsBtn = document.getElementById('generate-lyrics-btn');
            generateLyricsBtn.addEventListener('click', handleSongwriter);
            
            bindSelectorGroup('.language-selector[data-tool="songwriter"] button', 'active-lang', (lang) => {
                appState.language = lang;
                localStorage.setItem('vos_language', lang);
                applyTranslations(lang);
                updateActiveLanguageButtons();
            });

            const histBtn = document.querySelector('#songwriter-view .history-btn');
            if (histBtn) histBtn.addEventListener('click', () => openHistoryModal('songwriter'));
        }

        // 5. Missionary Biography View
        if (viewId === 'missionary-view') {
            const searchMissionaryBtn = document.getElementById('search-missionary-btn');
            const micMissionaryBtn = document.getElementById('mic-missionary');
            const missionaryInput = document.getElementById('missionary-search');
            
            searchMissionaryBtn.addEventListener('click', handleMissionaryBio);
            micMissionaryBtn.addEventListener('click', () => startSpeechRecognition(missionaryInput, micMissionaryBtn));

            bindSelectorGroup('.language-selector[data-tool="missionary"] button', 'active-lang', (lang) => {
                appState.language = lang;
                localStorage.setItem('vos_language', lang);
                applyTranslations(lang);
                updateActiveLanguageButtons();
            });

            const histBtn = document.querySelector('#missionary-view .history-btn');
            if (histBtn) histBtn.addEventListener('click', () => openHistoryModal('missionary'));
        }

        // 6. Find Your Calling Assessment View
        if (viewId === 'calling-view') {
            const prevBtn = document.getElementById('prev-calling-btn');
            const nextBtn = document.getElementById('next-calling-btn');
            const restartBtn = document.getElementById('restart-calling-btn');

            prevBtn.addEventListener('click', navigateCallingPrev);
            nextBtn.addEventListener('click', navigateCallingNext);
            restartBtn.addEventListener('click', restartCallingAssessment);

            initCallingAssessment();
        }

        // 7. Life Situation Guidance View
        if (viewId === 'life-situation-view') {
            const getSupportBtn = document.getElementById('get-support-btn');
            getSupportBtn.addEventListener('click', handleLifeSituationGuidance);

            bindSelectorGroup('.language-selector[data-tool="life-situation"] button', 'active-lang', (lang) => {
                appState.language = lang;
                localStorage.setItem('vos_language', lang);
                applyTranslations(lang);
                updateActiveLanguageButtons();
            });

            const histBtn = document.querySelector('#life-situation-view .history-btn');
            if (histBtn) histBtn.addEventListener('click', () => openHistoryModal('lifeSituation'));
        }
    }

    // Helper to toggle active button in selector groups
    function bindSelectorGroup(selector, activeClass, callback) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll(selector).forEach(b => b.classList.remove(activeClass));
                btn.classList.add(activeClass);
                if (callback) {
                    const val = btn.getAttribute('data-tone') || btn.getAttribute('data-lang');
                    callback(val);
                }
            });
        });
    }

    // --- GLOBAL EVENT LISTENERS ---
    function registerGlobalListeners() {
        elements.themeToggle.addEventListener('click', toggleTheme);
        
        elements.settingsBtn.addEventListener('click', () => {
            elements.settingsModal.classList.remove('hidden');
        });
        elements.closeSettingsBtn.addEventListener('click', () => {
            elements.settingsModal.classList.add('hidden');
        });
        
        elements.saveApiKeyBtn.addEventListener('click', () => {
            const keyVal = elements.settingsApiKey.value.trim();
            if (keyVal === '') {
                showToast("API Key cannot be blank");
                return;
            }
            appState.apiKey = keyVal;
            localStorage.setItem('vos_api_key', keyVal);
            
            if (elements.settingsModel) {
                const modelVal = elements.settingsModel.value;
                appState.geminiModel = modelVal;
                localStorage.setItem('vos_gemini_model', modelVal);
            }
            
            elements.settingsModal.classList.add('hidden');
            showToast("Gemini API settings saved!");
        });
        
        elements.resetApiKeyBtn.addEventListener('click', () => {
            appState.apiKey = appState.defaultApiKey;
            localStorage.setItem('vos_api_key', appState.defaultApiKey);
            elements.settingsApiKey.value = appState.defaultApiKey;
            
            appState.geminiModel = 'gemini-2.0-flash';
            localStorage.setItem('vos_gemini_model', 'gemini-2.0-flash');
            if (elements.settingsModel) {
                elements.settingsModel.value = 'gemini-2.0-flash';
            }
            
            showToast("Reset to default settings");
        });

        elements.backToHubBtn.addEventListener('click', () => showView(null));
        
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', () => {
                showView(btn.getAttribute('data-view'));
            });
        });

        elements.missionaryWeekBtn.addEventListener('click', () => {
            showView('missionary-view');
            const currentName = elements.missionaryName.textContent.trim();
            setTimeout(() => {
                const searchInput = document.getElementById('missionary-search');
                if (searchInput) {
                    searchInput.value = currentName;
                    document.getElementById('search-missionary-btn').click();
                }
            }, 100);
        });

        elements.challengeCompleteBtn.addEventListener('click', toggleDailyChallenge);

        elements.closeHistoryBtn.addEventListener('click', () => {
            elements.historyModal.classList.add('hidden');
        });
        elements.clearHistoryBtn.addEventListener('click', clearHistory);
    }

    // --- SPEECH RECOGNITION (VOICE-TO-TEXT) ---
    let speechRecognitionInstance = null;
    function startSpeechRecognition(targetInputEl, buttonEl) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showToast("Speech Recognition not supported in this browser.");
            return;
        }

        if (buttonEl.classList.contains('listening')) {
            if (speechRecognitionInstance) speechRecognitionInstance.stop();
            return;
        }

        speechRecognitionInstance = new SpeechRecognition();
        speechRecognitionInstance.lang = 'en-US';
        speechRecognitionInstance.interimResults = false;
        speechRecognitionInstance.maxAlternatives = 1;

        speechRecognitionInstance.onstart = () => {
            buttonEl.classList.add('listening');
            showToast("Listening... Speak now");
        };

        speechRecognitionInstance.onerror = (event) => {
            showToast(`Voice input error: ${event.error}`);
            buttonEl.classList.remove('listening');
        };

        speechRecognitionInstance.onend = () => {
            buttonEl.classList.remove('listening');
        };

        speechRecognitionInstance.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            if (targetInputEl.tagName === 'TEXTAREA') {
                targetInputEl.value = (targetInputEl.value + " " + speechResult).trim();
            } else {
                targetInputEl.value = speechResult;
            }
            showToast("Voice input captured!");
        };

        speechRecognitionInstance.start();
    }

    // --- SPEECH SYNTHESIS (TEXT-TO-SPEECH) ---
    let speechUtterance = null;
    function speakText(text, langCode) {
        if (!('speechSynthesis' in window)) {
            showToast("Text-to-speech not supported");
            return;
        }

        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            return false; 
        }

        const cleanText = text.replace(/[\#\*\_`\>]/g, '');
        speechUtterance = new SpeechSynthesisUtterance(cleanText);
        speechUtterance.lang = langCode || 'en-US';
        
        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(v => v.lang.startsWith(speechUtterance.lang.split('-')[0]));
        if (matchingVoice) speechUtterance.voice = matchingVoice;

        speechUtterance.onend = () => {
            const readBtn = document.getElementById('read-aloud-btn');
            if (readBtn) readBtn.innerHTML = '🔊 Read Aloud';
        };

        window.speechSynthesis.speak(speechUtterance);
        return true; 
    }

    // --- DAILY DEVOTIONAL MODULE ---
    function initDailyDevotional() {
        const dayOfYear = new Date().getDate() % dailyDevotionals.length;
        const currentDevotional = dailyDevotionals[dayOfYear];
        
        elements.dailyVerse.textContent = currentDevotional.verse;
        elements.dailyTask.textContent = currentDevotional.task;
        
        updateChallengeButtonState();
    }

    function toggleDailyChallenge() {
        if (appState.challengeCompleted) {
            appState.challengeCompleted = false;
            localStorage.removeItem('vos_challenge_completed');
            showToast("Daily challenge marked incomplete.");
        } else {
            appState.challengeCompleted = true;
            localStorage.setItem('vos_challenge_completed', new Date().toDateString());
            showToast("Daily challenge completed! 🎉");
        }
        updateChallengeButtonState();
    }

    function updateChallengeButtonState() {
        const lang = appState.language;
        if (appState.challengeCompleted) {
            elements.challengeCompleteBtn.classList.remove('bg-indigo-500', 'hover:bg-indigo-600');
            elements.challengeCompleteBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
            elements.challengeBtnIcon.textContent = '✅';
            elements.challengeBtnText.textContent = window.translations[lang]['completed'] || "Completed!";
        } else {
            elements.challengeCompleteBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
            elements.challengeCompleteBtn.classList.add('bg-indigo-500', 'hover:bg-indigo-600');
            elements.challengeBtnIcon.textContent = '⬜';
            elements.challengeBtnText.textContent = window.translations[lang]['markComplete'] || "Mark Complete";
        }
    }

    // --- MISSIONARY OF THE WEEK MODULE ---
    function initMissionaryOfTheWeek() {
        const keys = Object.keys(missionaryData);
        const weekNum = Math.floor(new Date().getDate() / 7) % keys.length;
        const missionary = missionaryData[keys[weekNum]];
        
        elements.missionaryName.textContent = missionary.name;
        elements.missionaryQuote.textContent = `"${missionary.quote}"`;
    }

    // --- SMART LOCAL QUERY CACHING (SAVES 100% CREDITS FOR REPEATS) ---
    function checkLocalHistoryCache(toolName, queryKey) {
        const historyKey = `vos_history_${toolName}`;
        const currentHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
        
        // Find matching query in cache history
        const normalizedQuery = queryKey.trim().toLowerCase();
        
        const cachedItem = currentHistory.find(item => {
            const target = item.question || item.topic || item.description || item.query || item.situation || "";
            return target.trim().toLowerCase() === normalizedQuery;
        });

        if (cachedItem) {
            console.log(`[Cache Hit] Serving ${toolName} query for "${queryKey}" from localStorage cache.`);
            return cachedItem;
        }
        return null;
    }

    // --- GEMINI API CALLS AND RENDERING ---
    async function fetchGeminiAIResponse(systemPrompt, userPrompt, maxTokens = 800) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${appState.geminiModel}:generateContent?key=${appState.apiKey}`;
        
        const requestBody = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt + "\n\nUser Input Request:\n" + userPrompt }]
                }
            ],
            generationConfig: {
                temperature: 0.5, // Lower temperature to focus response & save tokens
                maxOutputTokens: maxTokens // Optimized token cap limit to save credits
            }
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errJson = await response.json();
                throw new Error(errJson.error?.message || "HTTP Error connecting to Gemini");
            }

            const data = await response.json();
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!responseText) {
                throw new Error("Empty response received from Gemini AI model.");
            }
            return responseText;
        } catch (error) {
            console.error("Gemini fetch failed:", error);
            throw error;
        }
    }

    function parseMarkdownToHTML(mdText) {
        if (!mdText) return "";
        
        let lines = mdText.split('\n');
        let htmlLines = [];
        let inList = false;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            // Handle blockquotes
            if (line.startsWith('>') || line.startsWith('&gt;')) {
                const quoteText = line.replace(/^(&gt;|>)/, '').trim();
                line = `<blockquote>${quoteText}</blockquote>`;
            }
            // Handle Headers
            else if (line.startsWith('###')) {
                line = `<h3>${line.substring(3).trim()}</h3>`;
            } else if (line.startsWith('##')) {
                line = `<h2>${line.substring(2).trim()}</h2>`;
            } else if (line.startsWith('#')) {
                line = `<h1>${line.substring(1).trim()}</h1>`;
            }
            // Handle Bullet list items
            else if (line.startsWith('-') || line.startsWith('*')) {
                if (!inList) {
                    htmlLines.push('<ul>');
                    inList = true;
                }
                line = `<li>${line.substring(1).trim()}</li>`;
            } else {
                if (inList) {
                    htmlLines.push('</ul>');
                    inList = false;
                }
                if (line !== '') {
                    line = `<p>${line}</p>`;
                }
            }
            
            // Inline styling (Bold, Italic, Code)
            line = line
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>');
                
            if (line !== '' || inList) {
                htmlLines.push(line);
            }
        }
        
        if (inList) {
            htmlLines.push('</ul>');
        }
        
        return htmlLines.join('\n');
    }

    function toggleLoader(show, textKey = 'loaderText') {
        const loader = elements.globalLoader;
        if (show) {
            const loaderTextEl = loader.querySelector('p');
            if (loaderTextEl) {
                const lang = appState.language;
                loaderTextEl.textContent = window.translations[lang][textKey] || window.translations[lang]['loaderText'];
            }
            loader.classList.remove('hidden');
        } else {
            loader.classList.add('hidden');
        }
    }

    function handleAPIError(error) {
        toggleLoader(false);
        let errorMsg = error.message;
        if (errorMsg.includes("API key not valid") || errorMsg.includes("key expired")) {
            errorMsg = "The current Gemini API Key is invalid or expired. Click the settings ⚙️ icon in the header to enter a valid API key.";
        } else if (errorMsg.includes("quota exceeded") || errorMsg.includes("Resource has been exhausted")) {
            errorMsg = "API quota exceeded. Please provide your own Gemini key in the settings ⚙️ menu to continue.";
        } else if (errorMsg.includes("high demand") || errorMsg.includes("temporary") || errorMsg.includes("overloaded") || errorMsg.includes("503") || errorMsg.includes("429")) {
            errorMsg = `The selected Gemini model is currently experiencing high demand. Please click the settings ⚙️ icon to choose a different model (e.g., Gemini 2.0 Flash) or try again in a few moments.`;
        } else {
            errorMsg = `Error: ${error.message}. Please verify your network connection, API key, or try selecting a different Gemini model in settings ⚙️.`;
        }
        alert(errorMsg);
        elements.settingsModal.classList.remove('hidden');
    }

    // --- BIBLE SEARCH INTERACTION ---
    async function handleBibleSearch() {
        const questionTextarea = document.getElementById('question');
        const question = questionTextarea.value.trim();
        if (question === '') {
            showToast("Please enter a question");
            return;
        }

        const activeToneEl = document.querySelector('.tone-selector .active-tone');
        const toneStr = activeToneEl ? activeToneEl.getAttribute('data-tone') : "a pastoral way";
        const lang = appState.language;

        // **CREDIT OPTIMIZATION**: Check Cache first
        const cacheHit = checkLocalHistoryCache('bibleSearch', question);
        if (cacheHit) {
            renderBibleAnswer(cacheHit.answer, lang, "Cached (No Quota)");
            return;
        }

        // System prompt instructs model to be concise to save tokens/credits
        const systemPrompt = `You are a wise and compassionate Christian Bible mentor. Provide a response to the user's question. The response MUST be styled in ${toneStr}. Write in the language code: ${lang}. 
**CRITICAL LIMIT**: Be concise. Focus strictly on scripture and practical application. Do not exceed 250 words total. Provide 1-2 relevant scripture citations maximum. Ensure the response is fully completed and does not end mid-sentence.`;

        toggleLoader(true, 'loaderText');
        try {
            // maxTokens is set higher for non-English to prevent truncation (since non-English characters consume more tokens)
            const maxTokens = lang === 'en-US' ? 800 : 1600;
            const answerText = await fetchGeminiAIResponse(systemPrompt, question, maxTokens);
            
            saveToHistory('bibleSearch', { question, answer: answerText, date: new Date().toLocaleDateString() });
            toggleLoader(false);
            
            renderBibleAnswer(answerText, lang, "AI Generated");
        } catch (error) {
            handleAPIError(error);
        }
    }

    function renderBibleAnswer(answerText, lang, badgeText) {
        const container = document.getElementById('answer-container');
        const output = document.getElementById('answer');
        
        output.innerHTML = parseMarkdownToHTML(answerText);
        container.classList.remove('hidden');
        
        // Display quota badge
        const badgeEl = container.querySelector('.text-slate-500');
        if (badgeEl) badgeEl.textContent = `Mentorship Advice • ${badgeText}`;

        // Audio read aloud setup
        const readBtn = document.getElementById('read-aloud-btn');
        readBtn.innerHTML = '🔊 Read Aloud';
        
        const newReadBtn = readBtn.cloneNode(true);
        readBtn.parentNode.replaceChild(newReadBtn, readBtn);
        newReadBtn.addEventListener('click', () => {
            const isSpeaking = speakText(answerText, lang);
            newReadBtn.innerHTML = isSpeaking ? '⏹️ Stop Aloud' : '🔊 Read Aloud';
        });

        showToast("Answer loaded successfully!");
    }

    // --- SERMON BUILDER INTERACTION ---
    async function handleSermonBuilder() {
        const topicInput = document.getElementById('sermon-topic');
        const topic = topicInput.value.trim();
        if (topic === '') {
            showToast("Please enter a topic or scripture");
            return;
        }

        const lang = appState.language;

        // **CREDIT OPTIMIZATION**: Check Cache first
        const cacheHit = checkLocalHistoryCache('sermon', topic);
        if (cacheHit) {
            renderSermonOutline(cacheHit.outline, "Cached (No Quota)");
            return;
        }

        // Limit the outline content size to keep tokens under control
        const systemPrompt = `You are a homiletics professor. Generate a detailed, inspiring sermon outline based on: "${topic}". Write in the language code: ${lang}. 
**CRITICAL**: Keep the outline clean, structured and concise. Do not write full paragraphs. Limit the total outline to under 300 words. Ensure the response is fully completed and does not end mid-sentence.
Structure:
1. Title
2. Scripture
3. Intro (1 sentence)
4. 3 Body Points (each point: Title, 1-sentence explanation, 1-scripture reference)
5. Practical Application (2 bullet points)
6. Brief prayer (1 sentence)`;

        toggleLoader(true, 'loaderSermon');
        try {
            const maxTokens = lang === 'en-US' ? 1000 : 2000;
            const outlineText = await fetchGeminiAIResponse(systemPrompt, topic, maxTokens);
            
            saveToHistory('sermon', { topic, outline: outlineText, date: new Date().toLocaleDateString() });
            toggleLoader(false);
            
            renderSermonOutline(outlineText, "AI Generated");
        } catch (error) {
            handleAPIError(error);
        }
    }

    function renderSermonOutline(outlineText, badgeText) {
        const container = document.getElementById('sermon-container');
        const output = document.getElementById('sermon-content');
        
        output.innerHTML = parseMarkdownToHTML(outlineText);
        container.classList.remove('hidden');

        const badgeEl = container.querySelector('.text-slate-500');
        if (badgeEl) badgeEl.textContent = `Sermon Outline • ${badgeText}`;
        
        const copyBtn = document.getElementById('copy-sermon-btn');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(outlineText);
            showToast("Outline copied to clipboard!");
        });

        showToast("Outline loaded successfully!");
    }

    // --- WORSHIP SONGWRITER INTERACTION ---
    async function handleSongwriter() {
        const descInput = document.getElementById('song-description');
        const description = descInput.value.trim();
        if (description === '') {
            showToast("Please describe the song theme");
            return;
        }

        const lang = appState.language;

        // **CREDIT OPTIMIZATION**: Check Cache first
        const cacheHit = checkLocalHistoryCache('songwriter', description);
        if (cacheHit) {
            renderSongLyrics(cacheHit.song, "Cached (No Quota)");
            return;
        }

        const systemPrompt = `You are a Christian worship songwriter. Write a brief worship song with chord symbols written inline. Write in: ${lang}.
**LIMIT**: Keep it brief. Do not write duplicate choruses—simply use [Repeat Chorus]. Limit response to 250 words total. Ensure the response is fully completed and does not end mid-sentence.
Structure: Verse 1, Chorus, Verse 2, Bridge, Chorus/Outro.`;

        toggleLoader(true, 'loaderLyrics');
        try {
            const maxTokens = lang === 'en-US' ? 1000 : 2000;
            const songText = await fetchGeminiAIResponse(systemPrompt, description, maxTokens);
            
            saveToHistory('songwriter', { description, song: songText, date: new Date().toLocaleDateString() });
            toggleLoader(false);
            
            renderSongLyrics(songText, "AI Generated");
        } catch (error) {
            handleAPIError(error);
        }
    }

    function renderSongLyrics(songText, badgeText) {
        const container = document.getElementById('lyrics-container');
        const output = document.getElementById('lyrics-content');
        
        output.innerHTML = parseMarkdownToHTML(songText);
        container.classList.remove('hidden');

        const badgeEl = container.querySelector('.text-slate-500');
        if (badgeEl) badgeEl.textContent = `Song Sheet • ${badgeText}`;
        
        const copyBtn = document.getElementById('copy-lyrics-btn');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(songText);
            showToast("Song sheet copied to clipboard!");
        });

        showToast("Lyrics loaded successfully!");
    }

    // --- MISSIONARY BIO SEARCH ---
    async function handleMissionaryBio() {
        const searchInput = document.getElementById('missionary-search');
        const query = searchInput.value.trim().toLowerCase();
        if (query === '') {
            showToast("Please enter a missionary name");
            return;
        }

        const lang = appState.language;
        
        // **CREDIT OPTIMIZATION**: Always check local profiles first (100% free of quota)
        const cleanQuery = query.replace(/[ü]/g, 'u').trim();
        const matchedKey = Object.keys(missionaryData).find(k => {
            const cleanK = k.replace(/[ü]/g, 'u');
            return cleanQuery.includes(cleanK) || cleanK.includes(cleanQuery);
        });
        if (matchedKey && lang === 'en-US') {
            renderBio(missionaryData[matchedKey].bio, "Local Profile (No Quota)");
            return;
        }

        // Cache Check next
        const cacheHit = checkLocalHistoryCache('missionary', query);
        if (cacheHit) {
            renderBio(cacheHit.bio, "Cached (No Quota)");
            return;
        }
        
        const systemPrompt = `You are a missionary historian. Provide a brief, inspiring biography of the requested missionary. Write in: ${lang}.
**LIMIT**: Do not exceed 255 words. Focus on: Life dates, country of service, key hardships, and legacy. Use markdown. Ensure the response is fully completed and does not end mid-sentence.`;

        toggleLoader(true, 'loaderBio');
        try {
            const maxTokens = lang === 'en-US' ? 800 : 1600;
            const bioText = await fetchGeminiAIResponse(systemPrompt, query, maxTokens);
            
            saveToHistory('missionary', { query, bio: bioText, date: new Date().toLocaleDateString() });
            toggleLoader(false);
            
            renderBio(bioText, "AI Generated");
        } catch (error) {
            if (matchedKey) {
                toggleLoader(false);
                renderBio(missionaryData[matchedKey].bio, "Local Profile Fallback (Free)");
            } else {
                handleAPIError(error);
            }
        }
    }

    function renderBio(markdown, badgeText = "Biography Details") {
        const container = document.getElementById('missionary-container');
        const output = document.getElementById('missionary-content');
        
        output.innerHTML = parseMarkdownToHTML(markdown);
        container.classList.remove('hidden');
        
        const badgeEl = container.querySelector('.text-slate-500');
        if (badgeEl) badgeEl.textContent = badgeText;
        
        showToast("Biography loaded!");
    }

    // --- LIFE SITUATION GUIDANCE ---
    async function handleLifeSituationGuidance() {
        const selectEl = document.getElementById('life-situation');
        const situation = selectEl.value;
        const lang = appState.language;

        // **CREDIT OPTIMIZATION**: Load top 5 popular situations locally (completely free of quota!)
        if (localSituationGuides[situation] && lang === 'en-US') {
            renderSituationGuidance(localSituationGuides[situation], "Local Support (No Quota)");
            return;
        }

        // Check Cache next
        const cacheHit = checkLocalHistoryCache('lifeSituation', situation);
        if (cacheHit) {
            renderSituationGuidance(cacheHit.guidance, "Cached (No Quota)");
            return;
        }

        const systemPrompt = `You are a pastoral biblical counselor. Provide comfort, wisdom, and scriptural guidance for: "${situation}". Write in: ${lang}. 
**CRITICAL TOKEN LIMIT**: Keep your counseling brief. Do not exceed 250 words total. Provide 2-3 scriptural verses and a 2-sentence closing prayer. Ensure the response is fully completed and does not end mid-sentence.`;

        toggleLoader(true, 'loaderGuidance');
        try {
            const maxTokens = lang === 'en-US' ? 800 : 1600;
            const guidanceText = await fetchGeminiAIResponse(systemPrompt, situation, maxTokens);
            
            saveToHistory('lifeSituation', { situation, guidance: guidanceText, date: new Date().toLocaleDateString() });
            toggleLoader(false);
            
            renderSituationGuidance(guidanceText, "AI Generated");
        } catch (error) {
            // Local fallback on error
            if (localSituationGuides[situation]) {
                toggleLoader(false);
                renderSituationGuidance(localSituationGuides[situation], "Local Support Fallback (Free)");
            } else {
                handleAPIError(error);
            }
        }
    }

    function renderSituationGuidance(guidanceText, badgeText) {
        const container = document.getElementById('support-container');
        const output = document.getElementById('support-content');
        
        output.innerHTML = parseMarkdownToHTML(guidanceText);
        container.classList.remove('hidden');

        const badgeEl = container.querySelector('.text-slate-500');
        if (badgeEl) badgeEl.textContent = badgeText;

        showToast("Guidance loaded!");
    }

    // --- BIBLE QUIZ GAME ENGINE ---
    function startQuiz() {
        const nameInput = document.getElementById('quiz-user-name');
        const userName = nameInput.value.trim();
        if (userName === '') {
            showToast("Please enter your name for the certificate");
            return;
        }

        const levelSelect = document.getElementById('quiz-level-select');
        
        appState.quiz.userName = userName;
        appState.quiz.level = parseInt(levelSelect.value);
        appState.quiz.questions = [...quizLevels[appState.quiz.level]];
        appState.quiz.currentQuestionIdx = 0;
        appState.quiz.score = 0;
        appState.quiz.selectedCertPhoto = null;
        
        document.getElementById('quiz-intro').classList.add('hidden');
        document.getElementById('quiz-container').classList.remove('hidden');
        document.getElementById('level-complete-view').classList.add('hidden');
        
        loadQuestion();
    }

    function loadQuestion() {
        clearInterval(appState.quiz.timer);
        
        const qIdx = appState.quiz.currentQuestionIdx;
        const total = appState.quiz.questions.length;
        const questionData = appState.quiz.questions[qIdx];
        
        document.getElementById('quiz-level').textContent = `Level ${appState.quiz.level} — Question ${qIdx + 1} of ${total}`;
        document.getElementById('quiz-question').textContent = questionData.q;
        
        const pct = (qIdx / total) * 100;
        document.getElementById('progress-bar').style.width = `${pct}%`;
        
        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = '';
        
        questionData.a.forEach((optionText, i) => {
            const btn = document.createElement('button');
            btn.className = "quiz-option-btn text-left p-3.5 rounded-xl font-semibold text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm transition active:scale-98";
            btn.textContent = `${String.fromCharCode(65 + i)}. ${optionText}`;
            btn.addEventListener('click', () => selectAnswer(i));
            optionsContainer.appendChild(btn);
        });

        const feedback = document.getElementById('quiz-feedback');
        feedback.classList.add('hidden');
        document.getElementById('next-question-btn').classList.add('hidden');
        
        appState.quiz.timeLeft = 15;
        document.getElementById('quiz-timer').textContent = `Time: ${appState.quiz.timeLeft}s`;
        
        appState.quiz.timer = setInterval(() => {
            appState.quiz.timeLeft--;
            document.getElementById('quiz-timer').textContent = `Time: ${appState.quiz.timeLeft}s`;
            if (appState.quiz.timeLeft <= 0) {
                clearInterval(appState.quiz.timer);
                selectAnswer(-1);
            }
        }, 1000);
    }

    function selectAnswer(selectedIndex) {
        clearInterval(appState.quiz.timer);
        
        const qIdx = appState.quiz.currentQuestionIdx;
        const questionData = appState.quiz.questions[qIdx];
        const correctIdx = questionData.c;
        const optionsButtons = document.querySelectorAll('#quiz-options button');
        
        optionsButtons.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === correctIdx) {
                btn.classList.add('correct');
            } else if (idx === selectedIndex) {
                btn.classList.add('incorrect');
            }
        });

        const feedback = document.getElementById('quiz-feedback');
        feedback.classList.remove('hidden');
        
        if (selectedIndex === correctIdx) {
            appState.quiz.score++;
            feedback.className = "mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 text-center py-1 rounded-xl";
            feedback.textContent = "Correct! Well done.";
        } else {
            feedback.className = "mt-2 text-sm font-bold text-rose-500 dark:text-rose-400 text-center py-1 rounded-xl";
            feedback.textContent = selectedIndex === -1 ? "Time's Up! The correct answer was highlighted." : "Incorrect answer.";
        }
        
        document.getElementById('next-question-btn').classList.remove('hidden');
    }

    function loadNextQuestion() {
        appState.quiz.currentQuestionIdx++;
        if (appState.quiz.currentQuestionIdx < appState.quiz.questions.length) {
            loadQuestion();
        } else {
            endQuiz();
        }
    }

    function endQuiz() {
        document.getElementById('quiz-container').classList.add('hidden');
        document.getElementById('level-complete-view').classList.remove('hidden');
        document.getElementById('progress-bar').style.width = `100%`;
        drawCertificate();
    }

    function drawCertificate() {
        const canvas = document.getElementById('certificate-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const goldDark = "#d97706";
        const goldLight = "#fbbf24";
        const navy = "#0f172a";
        const cream = "#fdfbf7";
        
        ctx.fillStyle = cream;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.lineWidth = 14;
        ctx.strokeStyle = goldDark;
        ctx.strokeRect(7, 7, canvas.width - 14, canvas.height - 14);
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = goldLight;
        ctx.strokeRect(17, 17, canvas.width - 34, canvas.height - 34);

        ctx.textAlign = "center";
        ctx.fillStyle = navy;
        ctx.font = "bold 24px 'Playfair Display', serif";
        ctx.fillText("CERTIFICATE OF BIBLE STUDY", canvas.width / 2, 60);

        ctx.font = "italic 12px 'Inter', sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("This certifies that our brother/sister in Christ", canvas.width / 2, 95);

        ctx.font = "bold 28px 'Playfair Display', serif";
        ctx.fillStyle = "#1e3a8a";
        ctx.fillText(appState.quiz.userName, canvas.width / 2, 140);
        
        ctx.lineWidth = 1;
        ctx.strokeStyle = goldLight;
        ctx.beginPath();
        ctx.moveTo((canvas.width / 2) - 120, 155);
        ctx.lineTo((canvas.width / 2) + 120, 155);
        ctx.stroke();

        ctx.font = "12px 'Inter', sans-serif";
        ctx.fillStyle = "#334155";
        ctx.fillText(`has successfully completed the study and verified verification of`, canvas.width / 2, 185);
        
        ctx.font = "bold 15px 'Inter', sans-serif";
        ctx.fillStyle = navy;
        const levelNames = {
            1: "Level 1: General Biblical Knowledge",
            2: "Level 2: The Gospels & Parables",
            3: "Level 3: Prophets & Covenants",
            4: "Level 4: Epistles & Theology (Expert)"
        };
        ctx.fillText(levelNames[appState.quiz.level], canvas.width / 2, 215);

        ctx.font = "10px 'Inter', sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText(`Issued on: ${new Date().toLocaleDateString()}`, canvas.width / 2, 245);
        
        if (appState.quiz.selectedCertPhoto) {
            const img = new Image();
            img.onload = function() {
                const x = 50;
                const y = 280;
                const size = 90;
                
                ctx.save();
                ctx.beginPath();
                ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(img, x, y, size, size);
                ctx.restore();
                
                ctx.strokeStyle = goldLight;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
                ctx.stroke();
            };
            img.src = appState.quiz.selectedCertPhoto;
        } else {
            ctx.fillStyle = "#e2e8f0";
            ctx.beginPath();
            ctx.arc(95, 325, 45, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = "#94a3b8";
            ctx.font = "26px 'Inter', sans-serif";
            ctx.fillText("👤", 95, 335);
        }

        const sigX = canvas.width - 170;
        const sigY = 330;
        
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sigX, sigY);
        ctx.lineTo(sigX + 120, sigY);
        ctx.stroke();
        
        ctx.font = "bold italic 13px 'Playfair Display', serif";
        ctx.fillStyle = "#1e40af";
        ctx.fillText("Dr. Sam H. Wallace", sigX + 60, sigY - 5);
        
        ctx.font = "10px 'Inter', sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("Founding Shepherd", sigX + 60, sigY + 15);
        
        ctx.fillStyle = goldLight;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 325, 30, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = goldDark;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 325, 27, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.font = "10px 'Inter', sans-serif";
        ctx.fillStyle = "#78350f";
        ctx.fillText("APPROVED", canvas.width / 2, 328);
    }

    function unlockNextLevel() {
        if (appState.quiz.level < 4) {
            appState.quiz.level++;
            const select = document.getElementById('quiz-level-select');
            select.value = appState.quiz.level.toString();
            showToast("Next level unlocked!");
            startQuiz();
        } else {
            alert("Congratulations! You have completed all study levels of the shepherd challenge!");
            showView(null);
        }
    }

    // --- SPIRITUAL CALLING QUESTIONNAIRE ---
    function initCallingAssessment() {
        appState.calling.currentIdx = 0;
        appState.calling.answers = [];
        appState.calling.traits = {
            evangelism: 0,
            pastoral: 0,
            teaching: 0,
            mercy: 0,
            administration: 0,
            creative: 0,
            intercession: 0
        };

        document.getElementById('calling-quiz-stage').classList.remove('hidden');
        document.getElementById('calling-analysis').classList.add('hidden');
        loadCallingQuestion();
    }

    function loadCallingQuestion() {
        const qIdx = appState.calling.currentIdx;
        const total = callingQuestions.length;
        const questionData = callingQuestions[qIdx];

        document.getElementById('calling-progress').textContent = `Question ${qIdx + 1} of ${total}`;
        document.getElementById('calling-progress-bar').style.width = `${((qIdx + 1) / total) * 100}%`;
        document.getElementById('calling-question').textContent = questionData.question;

        const container = document.getElementById('calling-options');
        container.innerHTML = '';

        questionData.options.forEach((opt, i) => {
            const div = document.createElement('div');
            div.className = "relative flex items-center";

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'calling-opt';
            input.id = `c-opt-${i}`;
            input.value = opt.trait;
            input.className = "calling-option-input hidden";
            
            if (appState.calling.answers[qIdx] === opt.trait) {
                input.checked = true;
            }

            const label = document.createElement('label');
            label.htmlFor = `c-opt-${i}`;
            label.className = "calling-option-label w-full text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 cursor-pointer block";
            label.textContent = opt.text;

            div.appendChild(input);
            div.appendChild(label);
            container.appendChild(div);
            
            label.addEventListener('click', () => {
                setTimeout(() => {
                    navigateCallingNext();
                }, 200);
            });
        });

        document.getElementById('prev-calling-btn').style.visibility = qIdx === 0 ? 'hidden' : 'visible';
    }

    function navigateCallingPrev() {
        if (appState.calling.currentIdx > 0) {
            appState.calling.currentIdx--;
            loadCallingQuestion();
        }
    }

    function navigateCallingNext() {
        const checkedInput = document.querySelector('input[name="calling-opt"]:checked');
        if (!checkedInput) {
            showToast("Please pick an option to continue");
            return;
        }

        const selectedTrait = checkedInput.value;
        const qIdx = appState.calling.currentIdx;
        appState.calling.answers[qIdx] = selectedTrait;

        if (appState.calling.currentIdx < callingQuestions.length - 1) {
            appState.calling.currentIdx++;
            loadCallingQuestion();
        } else {
            calculateCallingResults();
        }
    }

    function calculateCallingResults() {
        Object.keys(appState.calling.traits).forEach(key => appState.calling.traits[key] = 0);
        
        appState.calling.answers.forEach(trait => {
            if (appState.calling.traits[trait] !== undefined) {
                appState.calling.traits[trait]++;
            }
        });

        document.getElementById('calling-quiz-stage').classList.add('hidden');
        document.getElementById('calling-analysis').classList.remove('hidden');

        const chartContainer = document.getElementById('calling-chart-bars');
        chartContainer.innerHTML = '';

        const maxScore = callingQuestions.length; 
        
        const traitNames = {
            evangelism: { name: "Evangelism (Outreach)", color: "bg-emerald-500" },
            pastoral: { name: "Pastoral Care (Shepherding)", color: "bg-blue-500" },
            teaching: { name: "Teaching (Doctrine & study)", color: "bg-amber-500" },
            mercy: { name: "Mercy & Service (Compassion)", color: "bg-teal-500" },
            administration: { name: "Administration & Leadership", color: "bg-indigo-500" },
            creative: { name: "Creative Arts & Worship", color: "bg-rose-500" },
            intercession: { name: "Intercession (Prayer warfare)", color: "bg-purple-500" }
        };

        let primaryTraitKey = "";
        let primaryScore = -1;

        Object.keys(appState.calling.traits).forEach(key => {
            const score = appState.calling.traits[key];
            const pct = (score / maxScore) * 100;
            
            if (score > primaryScore) {
                primaryScore = score;
                primaryTraitKey = key;
            }

            const row = document.createElement('div');
            row.className = "space-y-1";
            row.innerHTML = `
                <div class="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>${traitNames[key].name}</span>
                    <span>${Math.round(pct)}%</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div class="${traitNames[key].color} h-2.5 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                </div>
            `;
            chartContainer.appendChild(row);
        });

        // **CREDIT OPTIMIZATION**: Serve calling details instantly from local pre-compiled profiles (0 credits!)
        renderCallingProfile(primaryTraitKey, traitNames[primaryTraitKey].name);
    }

    function renderCallingProfile(traitKey, traitName) {
        const textContainer = document.getElementById('calling-analysis-text');
        
        // Serve locally compiled profiles instantly (completely free of quota!)
        const localProfile = callingProfiles[traitKey];
        if (localProfile) {
            let localHTML = parseMarkdownToHTML(localProfile.desc);
            
            // Add optional AI Deep Dive button to make it interactive if they want to consume quota
            localHTML += `
                <div class="mt-5 p-4 bg-shepherd-50 dark:bg-shepherd-950/20 border border-shepherd-200/50 dark:border-shepherd-800/30 rounded-xl space-y-3">
                    <h5 class="text-xs font-bold text-shepherd-700 dark:text-shepherd-300 uppercase tracking-wide">✨ Want a custom AI analysis?</h5>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">Our AI Bible Mentor can formulate an active personal plan with deeper scripture contexts. This consumes server quota credits.</p>
                    <button id="ai-calling-deep-dive-btn" class="bg-shepherd-600 hover:bg-shepherd-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition active:scale-95 shadow-sm">
                        Generate Custom AI Report
                    </button>
                </div>
            `;
            
            textContainer.innerHTML = localHTML;

            // Add deep dive event handler
            const aiBtn = document.getElementById('ai-calling-deep-dive-btn');
            if (aiBtn) {
                aiBtn.addEventListener('click', () => {
                    loadCallingAIGuidance(traitKey, traitName);
                });
            }
        }
    }

    async function loadCallingAIGuidance(traitKey, traitName) {
        const textContainer = document.getElementById('calling-analysis-text');
        textContainer.innerHTML = '<p class="text-sm italic animate-pulse">Invoking AI Bible Mentor... (uses credits)</p>';

        const lang = appState.language;
        const systemPrompt = `You are a biblical counselor and mentor. Write a brief profile for a believer whose spiritual assessment shows their primary gift is: "${traitName}" (${traitKey}). Write in the language code: ${lang}. 
**CRITICAL TOKEN LIMIT**: Do not exceed 250 words total. Provide 1 bible character example, 2 development steps, and 1 scripture quote. Ensure the response is fully completed and does not end mid-sentence.`;

        try {
            const maxTokens = lang === 'en-US' ? 800 : 1600;
            const aiText = await fetchGeminiAIResponse(systemPrompt, `Primary Gift: ${traitName} (${traitKey})`, maxTokens);
            textContainer.innerHTML = parseMarkdownToHTML(aiText);
            showToast("AI Custom profile loaded!");
        } catch (error) {
            handleAPIError(error);
            // Revert back to local
            renderCallingProfile(traitKey, traitName);
        }
    }

    function restartCallingAssessment() {
        initCallingAssessment();
    }

    // --- SEARCH HISTORY MANAGEMENT ---
    function saveToHistory(toolName, item) {
        const historyKey = `vos_history_${toolName}`;
        let currentHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
        
        currentHistory.unshift(item);
        if (currentHistory.length > 10) {
            currentHistory.pop();
        }
        localStorage.setItem(historyKey, JSON.stringify(currentHistory));
    }

    function openHistoryModal(toolName) {
        const historyKey = `vos_history_${toolName}`;
        const currentHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
        
        const listEl = elements.historyList;
        listEl.innerHTML = '';
        
        elements.clearHistoryBtn.setAttribute('data-tool', toolName);

        if (currentHistory.length === 0) {
            listEl.innerHTML = '<p class="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">No search history found for this tool.</p>';
        } else {
            currentHistory.forEach((item, idx) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = "history-item p-3 cursor-pointer rounded-xl text-left";
                
                let titleText = item.question || item.topic || item.description || item.query || item.situation || "History Log";
                if (titleText.length > 55) titleText = titleText.substring(0, 52) + "...";

                itemDiv.innerHTML = `
                    <div class="flex justify-between items-center text-xs">
                        <span class="font-bold text-slate-800 dark:text-slate-200">${titleText}</span>
                        <span class="text-[10px] text-slate-400 shrink-0">${item.date}</span>
                    </div>
                `;

                itemDiv.addEventListener('click', () => {
                    elements.historyModal.classList.add('hidden');
                    loadHistoryItemToView(toolName, item);
                });

                listEl.appendChild(itemDiv);
            });
        }

        elements.historyModal.classList.remove('hidden');
    }

    function loadHistoryItemToView(toolName, item) {
        if (toolName === 'bibleSearch') {
            document.getElementById('question').value = item.question;
            renderBibleAnswer(item.answer, appState.language, "Loaded from Cache (Free)");
        } else if (toolName === 'sermon') {
            document.getElementById('sermon-topic').value = item.topic;
            renderSermonOutline(item.outline, "Loaded from Cache (Free)");
        } else if (toolName === 'songwriter') {
            document.getElementById('song-description').value = item.description;
            renderSongLyrics(item.song, "Loaded from Cache (Free)");
        } else if (toolName === 'missionary') {
            document.getElementById('missionary-search').value = item.query;
            renderBio(item.bio, "Biography Details • Loaded from Cache (Free)");
        } else if (toolName === 'lifeSituation') {
            document.getElementById('life-situation').value = item.situation;
            renderSituationGuidance(item.guidance, "Loaded from Cache (Free)");
        }
    }

    function clearHistory() {
        const toolName = elements.clearHistoryBtn.getAttribute('data-tool');
        if (toolName) {
            localStorage.removeItem(`vos_history_${toolName}`);
            showToast("History cleared");
            openHistoryModal(toolName);
        }
    }

    init();
});
