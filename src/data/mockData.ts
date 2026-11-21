import {
  User,
  Question,
  Material,
  PremiumPackage,
  PracticePackage,
  Payment,
  GroupSession,
  LeaderboardEntry,
  ExamResult,
  AppSettings,
  AuditLog,
  AppNotification,
  AdminAnnouncement,
  ShortVideo,
  CommissionWithdrawal,
  EmailNotificationLog
} from '../types';

export const SEED_USERS: User[] = [
  {
    id: 'usr-1',
    full_name: 'Frizal Pratama',
    email: 'frizaltrader@gmail.com',
    phone: '081234567890',
    password_hash: 'sha256_mock_hash_frizal',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'MEMBER',
    account_status: 'ACTIVE',
    membership_type: 'FREE',
    created_at: '2025-01-10T08:00:00Z',
    targetAgency: 'Kementerian Keuangan RI',
    targetFormation: 'Analis Kebijakan Ahli Pertama',
    info_source: 'Instagram (IG)',
    education: 'S1 Ekonomi Pembangunan',
    current_job: 'Staf Administrasi Swasta',
    address: 'Kampung Jawa, Blangkejeren, Gayo Lues',
    age: 25
  },
  {
    id: 'usr-2',
    full_name: 'Dian Paramitha, S.T.',
    email: 'dian.premium@cpns.id',
    phone: '081298765432',
    password_hash: 'sha256_mock_hash_dian',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'MEMBER',
    account_status: 'ACTIVE',
    membership_type: 'PREMIUM',
    premium_start: '2025-01-01T00:00:00Z',
    premium_end: '2026-12-31T23:59:59Z',
    created_at: '2025-01-01T10:00:00Z',
    targetAgency: 'Badan Kepegawaian Negara (BKN)',
    targetFormation: 'Pranata Komputer Ahli Pertama',
    info_source: 'Teman',
    education: 'S1 Teknik Informatika',
    current_job: 'Freelance Web Developer',
    address: 'Jl. Cut Nyak Dhien No. 14, Banda Aceh',
    age: 26,
    is_affiliate: true,
    affiliate_status: 'APPROVED',
    affiliate_joined_at: '2025-02-01T09:00:00Z',
    affiliate_approved_at: '2025-02-01T09:10:00Z',
    affiliate_approved_by: 'Dr. Hendra Wijaya',
    affiliate_terms_accepted_at: '2025-02-01T09:00:00Z',
    referral_code: 'DIANCPNS',
    affiliate_bank_name: 'BSI (Bank Syariah Indonesia)',
    affiliate_account_number: '7098123456',
    affiliate_account_holder: 'Dian Paramitha'
  },
  {
    id: 'usr-standar',
    full_name: 'Raka Pratama, S.E.',
    email: 'raka.standar@cpns.id',
    phone: '081344556677',
    password_hash: 'sha256_mock_hash_raka',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'MEMBER',
    account_status: 'ACTIVE',
    membership_type: 'STANDAR',
    premium_start: '2026-01-10T00:00:00Z',
    premium_end: '2027-01-10T23:59:59Z',
    created_at: '2026-01-10T10:00:00Z',
    targetAgency: 'Kementerian Hukum & HAM',
    targetFormation: 'Analis Keimigrasian Pertama',
    info_source: 'TikTok',
    education: 'S1 Manajemen',
    current_job: 'Karyawan Swasta',
    address: 'Jakarta Selatan',
    age: 24
  },
  {
    id: 'usr-intensif',
    full_name: 'Nadia Kusuma, S.Pd.',
    email: 'nadia.intensif@cpns.id',
    phone: '081277889900',
    password_hash: 'sha256_mock_hash_nadia',
    photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    role: 'MEMBER',
    account_status: 'ACTIVE',
    membership_type: 'INTENSIF',
    premium_start: '2026-10-01T00:00:00Z',
    premium_end: '2027-01-01T23:59:59Z',
    created_at: '2026-10-01T08:00:00Z',
    targetAgency: 'Kementerian Pendidikan & Kebudayaan',
    targetFormation: 'Pengembang Kurikulum Ahli Pertama',
    info_source: 'Instagram (IG)',
    education: 'S1 Pendidikan Matematika',
    current_job: 'Guru Honorer',
    address: 'Bandung, Jawa Barat',
    age: 25
  },
  {
    id: 'usr-superadmin',
    full_name: 'Dr. Hendra Wijaya',
    email: 'loginbimbelasn@gmail.com',
    phone: '081312139893',
    password_hash: 'sha256_mock_hash_superadmin',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'SUPER_ADMIN',
    account_status: 'ACTIVE',
    membership_type: 'PREMIUM',
    premium_start: '2024-01-01T00:00:00Z',
    premium_end: '2030-12-31T23:59:59Z',
    created_at: '2024-01-01T00:00:00Z',
    targetAgency: 'Super Administrator LOGIN CPNS',
    targetFormation: 'Pengelola Sistem Utama',
    is_affiliate: true,
    affiliate_status: 'APPROVED',
    affiliate_joined_at: '2024-01-01T00:00:00Z',
    affiliate_approved_at: '2024-01-01T00:00:00Z',
    referral_code: 'LOGINCPNS'
  }
];

export const SEED_QUESTIONS: Question[] = [
  // TWK 1
  {
    id: 'twk-001',
    category: 'TWK',
    topic: 'Nasionalisme & Pembukaan UUD 1945',
    question_text: 'Nasionalisme Indonesia bukanlah nasionalisme yang sempit (chauvinisme), melainkan nasionalisme yang berlandaskan kemanusiaan yang adil dan beradab. Wujud sikap yang paling tepat mencerminkan prinsip tersebut dalam pergaulan internasional adalah...',
    option_a: 'Mengutamakan kepentingan bangsa sendiri tanpa mempedulikan stabilitas negara tetangga',
    option_b: 'Mendukung terciptanya perdamaian dunia yang berdasarkan kemerdekaan dan keadilan sosial',
    option_c: 'Menutup diri dari kerja sama internasional untuk menghindari intervensi ideologi asing',
    option_d: 'Membantu negara lain hanya apabila negara tersebut memberikan imbalan ekonomi langsung',
    option_e: 'Menerima seluruh pengaruh budaya asing sebagai bentuk penghormatan hak asasi global',
    correct_answer: 'B',
    weight_a: 0,
    weight_b: 5,
    weight_c: 0,
    weight_d: 0,
    weight_e: 0,
    explanation: 'Sesuai dengan Pembukaan UUD 1945 alinea ke-4: "...ikut melaksanakan ketertiban dunia yang berdasarkan kemerdekaan, perdamaian abadi, dan keadilan sosial". Nasionalisme Indonesia menentang chauvinisme dan menjunjung tinggi persaudaraan antarbangsa.',
    difficulty: 'Sedang',
    is_active: true,
    created_at: '2025-01-15T10:00:00Z'
  },
  // TWK 2
  {
    id: 'twk-002',
    category: 'TWK',
    topic: 'Integritas & Antikorupsi',
    question_text: 'Seorang pejabat pengadaan barang dan jasa menolak pemberian tiket liburan dan voucher hotel bintang lima dari rekanan pemenang tender proyek komputer instansi. Sikap pejabat tersebut mencerminkan nilai integritas utama berupa...',
    option_a: 'Disiplin dan loyalitas institusional tanpa batas',
    option_b: 'Kejujuran dan ketegasan menolak gratifikasi',
    option_c: 'Efisiensi dan tanggung jawab pemakaian anggaran',
    option_d: 'Kemandirian dan kerja keras personal semata',
    option_e: 'Ketegasan dalam persaingan usaha dagang',
    correct_answer: 'B',
    weight_a: 0,
    weight_b: 5,
    weight_c: 0,
    weight_d: 0,
    weight_e: 0,
    explanation: 'Sesuai UU Tindak Pidana Korupsi dan 9 Nilai Integritas Antikorupsi KPK (Jujur, Peduli, Mandiri, Disiplin, Tanggung Jawab, Kerja Keras, Sederhana, Berani, Adil). Penolakan fasilitas dari vendor rekanan merupakan implementasi Kejujuran dan Penolakan Gratifikasi.',
    difficulty: 'Sedang',
    is_active: true,
    created_at: '2025-01-16T10:00:00Z'
  },
  // TWK 3
  {
    id: 'twk-003',
    category: 'TWK',
    topic: 'Pilar Negara (UUD 1945 Legislasi)',
    question_text: 'Pasal 22D UUD NRI 1945 mengatur kewenangan Dewan Perwakilan Daerah (DPD). Berikut ini yang BUKAN merupakan kewenangan DPD dalam bidang perundang-undangan adalah...',
    option_a: 'Dapat mengajukan RUU tentang otonomi daerah kepada DPR',
    option_b: 'Ikut membahas RUU yang berkaitan dengan hubungan pusat dan daerah',
    option_c: 'Memberikan persetujuan akhir terhadap pengesahan undang-undang bersama Presiden',
    option_d: 'Memberikan pertimbangan kepada DPR atas RUU APBN',
    option_e: 'Melakukan pengawasan atas pelaksanaan undang-undang mengenai pengelolaan sumber daya alam',
    correct_answer: 'C',
    weight_a: 0,
    weight_b: 0,
    weight_c: 5,
    weight_d: 0,
    weight_e: 0,
    explanation: 'Memberikan persetujuan akhir terhadap pengesahan RUU menjadi UU merupakan wewenang DPR bersama Presiden (Pasal 20 ayat 2 UUD 1945). DPD tidak memiliki hak memberikan persetujuan akhir undang-undang.',
    difficulty: 'Sukar',
    is_active: true,
    created_at: '2025-01-17T10:00:00Z'
  },
  // TWK 4
  {
    id: 'twk-004',
    category: 'TWK',
    topic: 'Bela Negara & Pengabdian Profesi',
    question_text: 'Berdasarkan UU No. 23 Tahun 2019 tentang Pengelolaan Sumber Daya Nasional untuk Pertahanan Negara, keikutsertaan warga negara dalam upaya bela negara bagi seorang Aparatur Sipil Negara (ASN) secara nyata diwujudkan melalui...',
    option_a: 'Kewajiban mengikuti wajib militer setiap kali masa promosi kenaikan pangkat',
    option_b: 'Pengabdian sesuai dengan profesi dengan mengutamakan pelayanan prima kepada masyarakat',
    option_c: 'Menyebarkan informasi program kerja instansi di media sosial pribadi setiap hari',
    option_d: 'Mengambil cuti untuk menjadi relawan bantuan logistik di perbatasan negara',
    option_e: 'Membuat kebijakan proteksionisme terhadap komoditas impor di lingkungan kantor',
    correct_answer: 'B',
    weight_a: 0,
    weight_b: 5,
    weight_c: 0,
    weight_d: 0,
    weight_e: 0,
    explanation: 'Bentuk keikutsertaan warga negara dalam bela negara salah satunya adalah pengabdian sesuai dengan profesi. Bagi ASN, bela negara diwujudkan melalui pelayanan publik profesional, integritas, dan menjaga netralitas.',
    difficulty: 'Sedang',
    is_active: true,
    created_at: '2025-01-18T10:00:00Z'
  },
  // TIU 1
  {
    id: 'tiu-001',
    category: 'TIU',
    topic: 'Silogisme Logika Analitis',
    question_text: 'Semua calon pegawai yang lolos tahap SKD wajib mengikuti tes SKB.\nBeberapa orang yang berpendidikan S1 lolos tahap SKD.\nKesimpulan yang paling tepat dan sah adalah...',
    option_a: 'Semua orang yang berpendidikan S1 wajib mengikuti tes SKB',
    option_b: 'Beberapa orang yang berpendidikan S1 wajib mengikuti tes SKB',
    option_c: 'Hanya orang yang berpendidikan S1 yang wajib mengikuti tes SKB',
    option_d: 'Semua orang yang mengikuti tes SKB berpendidikan S1',
    option_e: 'Ada orang yang tidak berpendidikan S1 tidak perlu mengikuti tes SKB',
    correct_answer: 'B',
    weight_a: 0,
    weight_b: 5,
    weight_c: 0,
    weight_d: 0,
    weight_e: 0,
    explanation: 'Premis mayor: Semua yang lolos SKD (A) -> Wajib SKB (B). Premis minor: Sebagian lulusan S1 (C) -> Lolos SKD (A). Kesimpulan: Sebagian C adalah B (Beberapa orang yang berpendidikan S1 wajib mengikuti tes SKB).',
    difficulty: 'Sedang',
    is_active: true,
    created_at: '2025-01-15T10:00:00Z'
  },
  // TIU 2
  {
    id: 'tiu-002',
    category: 'TIU',
    topic: 'Deret Angka & Barisan',
    question_text: 'Perhatikan barisan bilangan berikut:\n3, 7, 15, 31, 63, ... , ...\nDua bilangan selanjutnya yang melengkapi barisan tersebut adalah...',
    option_a: '127, 255',
    option_b: '126, 252',
    option_c: '125, 250',
    option_d: '128, 256',
    option_e: '127, 254',
    correct_answer: 'A',
    weight_a: 5,
    weight_b: 0,
    weight_c: 0,
    weight_d: 0,
    weight_e: 0,
    explanation: 'Pola selisih melipat ganda: +4, +8, +16, +32, +64, +128. Sehingga: 63 + 64 = 127; 127 + 128 = 255. Atau menggunakan rumus Un = 2 * Un-1 + 1.',
    difficulty: 'Sedang',
    is_active: true,
    created_at: '2025-01-16T10:00:00Z'
  },
  // TIU 3
  {
    id: 'tiu-003',
    category: 'TIU',
    topic: 'Aritmetika Sosial & Beban Kerja',
    question_text: 'Sebuah proyek renovasi gedung pelayanan direncanakan selesai dalam waktu 30 hari oleh 18 orang pekerja. Setelah bekerja selama 10 hari, proyek terhenti selama 5 hari karena cuaca ekstrem. Agar proyek tetap selesai tepat waktu sesuai jadwal semula, jumlah tambahan pekerja yang diperlukan adalah...',
    option_a: '4 orang',
    option_b: '6 orang',
    option_c: '8 orang',
    option_d: '9 orang',
    option_e: '12 orang',
    correct_answer: 'B',
    weight_a: 0,
    weight_b: 5,
    weight_c: 0,
    weight_d: 0,
    weight_e: 0,
    explanation: 'Sisa beban kerja = (30 - 10) x 18 = 360 orang-hari. Sisa hari kerja setelah libur 5 hari = 20 - 5 = 15 hari. Pekerja dibutuhkan = 360 / 15 = 24 orang. Tambahan pekerja = 24 - 18 = 6 orang.',
    difficulty: 'Sedang',
    is_active: true,
    created_at: '2025-01-17T10:00:00Z'
  },
  // TIU 4
  {
    id: 'tiu-004',
    category: 'TIU',
    topic: 'Kemampuan Verbal - Analogi',
    question_text: 'KERTAS : PENA = ... : ...',
    option_a: 'DINDING : KUAS',
    option_b: 'MOBIL : BENSIN',
    option_c: 'KAYU : GERGAJI',
    option_d: 'KANVAS : CAT AIR',
    option_e: 'SEPATU : KAOS KAKI',
    correct_answer: 'A',
    weight_a: 5,
    weight_b: 0,
    weight_c: 0,
    weight_d: 0,
    weight_e: 0,
    explanation: 'Hubungan analogi: [Media yang diberi goresan/warna] : [Alat toreh/tulis]. Kertas ditulisi dengan Pena, Dinding dicat dengan Kuas.',
    difficulty: 'Mudah',
    is_active: true,
    created_at: '2025-01-18T10:00:00Z'
  },
  // TKP 1 (Bobot 1 - 5)
  {
    id: 'tkp-001',
    category: 'TKP',
    topic: 'Pelayanan Publik Prima',
    question_text: 'Menjelang jam istirahat siang, seorang warga lanjut usia datang tergesa-gesa ke loket pelayanan Anda untuk mengurus dokumen pensiun yang sangat mendesak. Rekan kerja Anda sudah mulai merapikan meja untuk makan siang. Tindakan Anda adalah...',
    option_a: 'Meminta warga tersebut menunggu di ruang tunggu sampai jam istirahat selesai tepat pukul 13.00',
    option_b: 'Menyapa dengan ramah, mempersilakan duduk, dan menyelesaikan pelayanan dokumen beliau terlebih dahulu sebelum saya beristirahat',
    option_c: 'Melimpahkan berkas tersebut kepada petugas piket pengganti agar saya tetap dapat makan siang tepat waktu',
    option_d: 'Menerima berkasnya lalu berjanji akan menyelesaikannya nanti sore tanpa memberikan tanda terima',
    option_e: 'Menjelaskan peraturan jam kantor secara tegas bahwa loket telah tutup dan memintanya datang besok pagi',
    correct_answer: 'B',
    weight_a: 2,
    weight_b: 5,
    weight_c: 4,
    weight_d: 3,
    weight_e: 1,
    explanation: 'Indikator Pelayanan Publik: Mengedepankan empati, santun, responsif, dan tuntas menyelesaikan kebutuhan pemohon lanjut usia dalam kondisi mendesak sebelum beristirahat (Bobot opsi B = 5).',
    difficulty: 'Sedang',
    is_active: true,
    created_at: '2025-01-15T10:00:00Z'
  },
  // TKP 2 (Bobot 1 - 5)
  {
    id: 'tkp-002',
    category: 'TKP',
    topic: 'Teknologi Informasi & Komunikasi (TIK)',
    question_text: 'Instansi Anda baru saja mengimplementasikan sistem aplikasi digital terpadu untuk pengarsipan surat dinas. Beberapa pegawai senior merasa kesulitan mengoperasikannya dan lebih memilih sistem manual cetak kertas. Sebagai pegawai yang memahami teknologi, sikap Anda adalah...',
    option_a: 'Membiarkan mereka tetap menggunakan cara manual asalkan pekerjaan mereka selesai dan tidak mengganggu saya',
    option_b: 'Mengeluhkan sikap pegawai senior tersebut kepada atasan agar diberikan sanksi kedisiplinan',
    option_c: 'Menawarkan bantuan dengan sabar, membuatkan panduan ringkas bergambar, dan mendampingi mereka saat input berkas',
    option_d: 'Mengambil alih seluruh pekerjaan pengarsipan surat milik pegawai senior agar proses cepat selesai',
    option_e: 'Menyarankan tim IT membuat sistem baru yang jauh lebih sederhana khusus bagi mereka',
    correct_answer: 'C',
    weight_a: 2,
    weight_b: 1,
    weight_c: 5,
    weight_d: 3,
    weight_e: 4,
    explanation: 'Indikator TIK & Adaptabilitas: Proaktif membantu rekan kerja beradaptasi dengan teknologi baru melalui pendampingan konstruktif dan panduan yang memudahkan tanpa mengambil alih tugas mereka (Bobot C = 5).',
    difficulty: 'Sedang',
    is_active: true,
    created_at: '2025-01-16T10:00:00Z'
  },
  // TKP 3 (Bobot 1 - 5)
  {
    id: 'tkp-003',
    category: 'TKP',
    topic: 'Profesionalisme & Tanggung Jawab',
    question_text: 'Anda ditugaskan menyusun draf laporan kinerja tahunan instansi dengan batas waktu penyerahan besok pagi. Pada saat bersamaan, sahabat dekat Anda mengajak berkumpul merayakan hari ulang tahunnya yang sudah direncanakan sejak lama. Respon Anda adalah...',
    option_a: 'Menghadiri pesta ulang tahun sahabat sebentar lalu begadang mengerjakan laporan semalam suntuk',
    option_b: 'Menjelaskan situasi tugas kedinasan kepada sahabat dengan santun dan berfokus menyelesaikan laporan kinerja hingga selesai sempurna',
    option_c: 'Mengerjakan laporan seadanya agar cepat beres sehingga bisa segera pergi ke pesta ulang tahun',
    option_d: 'Meminta rekan kerja lain menggantikan tugas penyusunan laporan dengan imbalan traktiran',
    option_e: 'Meminta perpanjangan waktu pengumpulan laporan kepada atasan dengan alasan urusan mendadak',
    correct_answer: 'B',
    weight_a: 3,
    weight_b: 5,
    weight_c: 1,
    weight_d: 2,
    weight_e: 2,
    explanation: 'Indikator Profesionalisme: Menempatkan komitmen dan integritas tugas kedinasan publik di atas kepentingan relasi personal dengan tetap mengomunikasikannya secara bijak (Bobot B = 5).',
    difficulty: 'Sedang',
    is_active: true,
    created_at: '2025-01-17T10:00:00Z'
  },
  // TKP 4 (Bobot 1 - 5)
  {
    id: 'tkp-004',
    category: 'TKP',
    topic: 'Anti Radikalisme & Komitmen Kebangsaan',
    question_text: 'Di grup pesan instan kantor, seorang rekan kerja membagikan narasi dan video provokatif yang mengajak menolak ideologi Pancasila serta mencela simbol-simbol negara. Sikap yang harus Anda ambil adalah...',
    option_a: 'Mendiamkan saja dan segera keluar dari grup tersebut agar tidak terlibat masalah',
    option_b: 'Mengingatkan dengan tegas namun santun di ruang pribadi agar tidak menyebarkan paham tersebut, serta melaporkan ke unit kepatuhan internal',
    option_c: 'Mendebatnya secara kasar di dalam grup agar orang lain tahu bahwa dia bersalah',
    option_d: 'Membagikan video tersebut ke grup lain untuk meminta opini rekan-rekan kerja',
    option_e: 'Mengunggah tangkapan layar chat rekan tersebut ke media sosial publik agar viral',
    correct_answer: 'B',
    weight_a: 2,
    weight_b: 5,
    weight_c: 3,
    weight_d: 1,
    weight_e: 2,
    explanation: 'Indikator Anti Radikalisme: Tegas menolak paham anti-Pancasila melalui jalur persuasif personal dan pelaporan resmi kepatuhan internal instansi (Bobot B = 5).',
    difficulty: 'Sedang',
    is_active: true,
    created_at: '2025-01-18T10:00:00Z'
  }
];

export const SEED_MATERIALS: Material[] = [
  {
    id: 'mat-004',
    title: 'Pancasila: Kedudukan, Fungsi & 45 Butir Pengamalan',
    category: 'TWK',
    summary: 'Pancasila berkedudukan sebagai Dasar Negara (Philosophische Grondslag), Pandangan Hidup Bangsa (Weltanschauung), Ideologi Terbuka, dan Sumber dari Segala Sumber Hukum.',
    intro: 'Pancasila berkedudukan sebagai Dasar Negara (Philosophische Grondslag), Pandangan Hidup Bangsa (Weltanschauung), Ideologi Terbuka, dan Sumber dari Segala Sumber Hukum.',
    key_points: [
      'Sila 1 (Bintang Emas): Kebebasan memeluk agama, toleransi, kerukunan antarumat beragama, tidak memaksakan agama.',
      'Sila 2 (Rantai Emas): Persamaan derajat, hak asasi manusia, menjunjung tinggi martabat kemanusiaan, tenggang rasa, aksi kemanusiaan (bencana).',
      'Sila 3 (Pohon Beringin): Cinta tanah air, rela berkorban demi bangsa, menempatkan persatuan di atas kepentingan golongan, bangga produk lokal.',
      'Sila 4 (Kepala Banteng): Mengutamakan musyawarah untuk mufakat, akal sehat, menghormati hasil keputusan bersama, tidak memaksakan kehendak.',
      'Sila 5 (Padi dan Kapas): Keadilan sosial, menjaga keseimbangan hak dan kewajiban, suka bekerja keras, menghargai karya orang lain, tidak bergaya hidup mewah/boros.'
    ],
    quick_formulas: [
      'Hirarki Nilai: Nilai Dasar (Abstrak & Tetap) → Nilai Instrumental (UUD 1945, UU, Perpres) → Nilai Praksis (Tindakan nyata sehari-hari).',
      'Pancasila sebagai Ideologi Terbuka memiliki 3 dimensi: Dimensi Realitas, Dimensi Idealitas, dan Dimensi Fleksibilitas.'
    ],
    example: {
      question: 'Membeli dan mempromosikan produk sepatu buatan perajin lokal di pasar internasional merupakan wujud pengamalan...',
      answer: 'Kunci: Sila ke-3 (Persatuan Indonesia)',
      analysis: 'Mencintai dan menggunakan produk dalam negeri adalah bentuk patriotisme dan cinta tanah air yang memperkuat ketahanan ekonomi nasional.'
    },
    content: `Pancasila berkedudukan sebagai Dasar Negara (Philosophische Grondslag), Pandangan Hidup Bangsa (Weltanschauung), Ideologi Terbuka, dan Sumber dari Segala Sumber Hukum.

POIN-POIN KUNCI WAJIB HAFAL:
- Sila 1 (Bintang Emas): Kebebasan memeluk agama, toleransi, kerukunan antarumat beragama, tidak memaksakan agama.
- Sila 2 (Rantai Emas): Persamaan derajat, hak asasi manusia, menjunjung tinggi martabat kemanusiaan, tenggang rasa, aksi kemanusiaan (bencana).
- Sila 3 (Pohon Beringin): Cinta tanah air, rela berkorban demi bangsa, menempatkan persatuan di atas kepentingan golongan, bangga produk lokal.
- Sila 4 (Kepala Banteng): Mengutamakan musyawarah untuk mufakat, akal sehat, menghormati hasil keputusan bersama, tidak memaksakan kehendak.
- Sila 5 (Padi dan Kapas): Keadilan sosial, menjaga keseimbangan hak dan kewajiban, suka bekerja keras, menghargai karya orang lain, tidak bergaya hidup mewah/boros.`,
    is_premium: false,
    is_active: true,
    file_url: 'https://drive.google.com/file/d/sample-twk-pancasila-lengkap/view',
    drive_file_id: 'drive-file-twk-pancasila',
    created_at: '2025-01-09T10:00:00Z'
  },
  {
    id: 'mat-001',
    title: 'UUD 1945 & Sejarah Amandemen I s.d. IV',
    category: 'TWK',
    summary: 'Undang-Undang Dasar Negara Republik Indonesia Tahun 1945 telah mengalami 4 kali amandemen bertahap dalam kurun waktu 1999–2002.',
    intro: 'Undang-Undang Dasar Negara Republik Indonesia Tahun 1945 telah mengalami 4 kali amandemen bertahap dalam kurun waktu 1999–2002.',
    key_points: [
      'Amandemen I (19–21 Okt 1999): Pembatasan kekuasaan Presiden (Pasal 7: masa jabatan max 2 periode; Pasal 20: kewenangan membentuk UU di tangan DPR).',
      'Amandemen II (7–18 Ags 2000): Otonomi daerah (Pasal 18), penambahan Bab HAM lengkap (Pasal 28A–28J), lambang dan lagu kebangsaan.',
      'Amandemen III (1–9 Nov 2001): Pemilihan Presiden langsung oleh rakyat, pembentukan Mahkamah Konstitusi (MK), Komisi Yudisial (KY), dan DPD.',
      'Amandemen IV (1–11 Ags 2002): Penghapusan Dewan Pertimbangan Agung (DPA), pengaturan Bank Sentral, sistem pendidikan nasional (Pasal 31: alokasi 20% APBN).',
      'Pasal 37 ayat (5): Khusus mengenai bentuk Negara Kesatuan Republik Indonesia TIDAK DAPAT DILAKUKAN PERUBAHAN.'
    ],
    quick_formulas: [
      'Uji Materiil: MK menguji Undang-Undang terhadap UUD 1945. MA menguji Peraturan di bawah UU terhadap UU.',
      'Hak Prerogatif Presiden (Pasal 14): Grasi & Rehabilitasi (dengan pertimbangan MA); Amnesti & Abolisi (dengan pertimbangan DPR).'
    ],
    example: {
      question: 'Presiden hendak memberikan amnesti kepada narapidana politik tertentu. Berdasarkan Pasal 14 ayat (2) UUD 1945, Presiden harus memperhatikan pertimbangan dari...',
      answer: 'Kunci: Dewan Perwakilan Rakyat (DPR)',
      analysis: 'Ingat rumus GR-MA dan AA-DPR: Grasi & Rehabilitasi dengan pertimbangan Mahkamah Agung (MA), sedangkan Amnesti & Abolisi dengan pertimbangan DPR.'
    },
    content: `Undang-Undang Dasar Negara Republik Indonesia Tahun 1945 telah mengalami 4 kali amandemen bertahap dalam kurun waktu 1999–2002.

POIN-POIN KUNCI WAJIB HAFAL:
- Amandemen I (19–21 Okt 1999): Pembatasan kekuasaan Presiden (Pasal 7: masa jabatan max 2 periode; Pasal 20: kewenangan membentuk UU di tangan DPR).
- Amandemen II (7–18 Ags 2000): Otonomi daerah (Pasal 18), penambahan Bab HAM lengkap (Pasal 28A–28J), lambang dan lagu kebangsaan.
- Amandemen III (1–9 Nov 2001): Pemilihan Presiden langsung oleh rakyat, pembentukan Mahkamah Konstitusi (MK), Komisi Yudisial (KY), dan DPD.
- Amandemen IV (1–11 Ags 2002): Penghapusan Dewan Pertimbangan Agung (DPA), pengaturan Bank Sentral, sistem pendidikan nasional (Pasal 31: alokasi 20% APBN).
- Pasal 37 ayat (5): Khusus mengenai bentuk Negara Kesatuan Republik Indonesia TIDAK DAPAT DILAKUKAN PERUBAHAN.`,
    is_premium: true,
    is_active: true,
    file_url: 'https://drive.google.com/file/d/sample-uud-1945-modul/view',
    drive_file_id: 'drive-file-twk-uud45',
    created_at: '2025-01-10T12:00:00Z'
  },
  {
    id: 'mat-005',
    title: 'Bela Negara & Wawasan Kebangsaan',
    category: 'TWK',
    summary: 'Bela negara adalah tekad, sikap, dan perilaku serta tindakan warga negara yang dijiwai oleh kecintaannya kepada NKRI berdasarkan Pancasila dan UUD 1945.',
    intro: 'Bela negara adalah tekad, sikap, dan perilaku serta tindakan warga negara yang dijiwai oleh kecintaannya kepada NKRI berdasarkan Pancasila dan UUD 1945.',
    key_points: [
      '5 Nilai Dasar Bela Negara: (1) Cinta Tanah Air, (2) Sadar Berbangsa & Bernegara, (3) Setia pada Pancasila, (4) Rela Berkorban, (5) Kemampuan Awal Bela Negara.',
      'Dasar Hukum Konstitusi: Pasal 27 ayat (3) - "Setiap warga negara berhak dan wajib ikut serta dalam upaya pembelaan negara" & Pasal 30 ayat (1) - "Pertahanan dan keamanan negara".',
      'Sistem Pertahanan Keamanan: Sishanneg bersifat Semesta (Sishankamrata) dengan TNI & Polri sebagai kekuatan utama, dan rakyat sebagai kekuatan pendukung.',
      'Wujud Bela Negara ASN (UU No. 23 Tahun 2019): Pengabdian sesuai profesi melalui pelayanan publik prima, netralitas ASN, dan menjaga keutuhan NKRI.'
    ],
    quick_formulas: [
      '4 Bentuk Keikutsertaan Bela Negara: (1) Pendidikan Kewarganegaraan, (2) Pelatihan Dasar Kemiliteran, (3) Pengabdian Prajurit TNI, (4) Pengabdian sesuai Profesi.',
      '4 Pilar Kebangsaan: Pancasila, UUD NRI 1945, NKRI, dan Bhinneka Tunggal Ika.'
    ],
    example: {
      question: 'Seorang tenaga kesehatan ASN yang bertugas di wilayah perbatasan tetap melayani masyarakat dengan penuh dedikasi meski fasilitas terbatas. Tindakan ini merupakan wujud bela negara melalui...',
      answer: 'Kunci: Pengabdian sesuai dengan profesi',
      analysis: 'Sesuai UU No. 23 Tahun 2019 tentang PSDN, warga negara yang bekerja profesional dan berintegritas di bidangnya masing-masing termasuk keikutsertaan bela negara lewat pengabdian sesuai profesi.'
    },
    content: `Bela negara adalah tekad, sikap, dan perilaku serta tindakan warga negara yang dijiwai oleh kecintaannya kepada NKRI berdasarkan Pancasila dan UUD 1945.

POIN-POIN KUNCI WAJIB HAFAL:
- 5 Nilai Dasar Bela Negara: (1) Cinta Tanah Air, (2) Sadar Berbangsa & Bernegara, (3) Setia pada Pancasila, (4) Rela Berkorban, (5) Kemampuan Awal Bela Negara.
- Dasar Hukum Konstitusi: Pasal 27 ayat (3) & Pasal 30 ayat (1) UUD 1945.
- Sistem Pertahanan Keamanan: Sishankamrata dengan TNI & Polri sebagai kekuatan utama, dan rakyat sebagai kekuatan pendukung.`,
    is_premium: true,
    is_active: true,
    file_url: 'https://drive.google.com/file/d/sample-twk-bela-negara/view',
    drive_file_id: 'drive-file-twk-bela-negara',
    created_at: '2025-01-11T09:00:00Z'
  },
  {
    id: 'mat-002',
    title: 'Trik Kilat Deret Angka & Huruf (TIU Numerik)',
    category: 'TIU',
    summary: 'Kunci menaklukkan soal deret angka BKN dalam waktu di bawah 30 detik tanpa terjebak rumus rumit.',
    intro: 'Kunci menaklukkan soal deret angka BKN dalam waktu di bawah 30 detik tanpa terjebak rumus rumit.',
    key_points: [
      'Langkah 1: Selalu cek selisih (tingkat 1). Jika selisih bertambah konstan (+2, +3, +4), deret bertingkat aritmatika.',
      'Langkah 2: Cek apakah ada pola selang-seling (larik lompat 1 atau lompat 2 angka).',
      'Langkah 3: Periksa bentuk kuadrat (n² ± 1) atau kubik (n³ ± 1): 1, 4, 9, 16, 25, 36, 49, 64, 81, 100.',
      'Langkah 4: Periksa deret Fibonacci (Un = Un-1 + Un-2): 2, 3, 5, 8, 13, 21, 34, 55.'
    ],
    quick_formulas: [
      'Pola Lompat 1: Suku ganjil (1, 3, 5) punya operasi sendiri; Suku genap (2, 4, 6) punya operasi sendiri.',
      'Pola Gabungan: (x2, -1), (x2, -1) atau (+5, /2), (+5, /2).'
    ],
    example: {
      question: 'Berapakah suku berikutnya dari 4, 9, 19, 39, 79, ...?',
      answer: 'Kunci: 159',
      analysis: 'Polanya: (x 2) + 1. 4x2+1 = 9; 9x2+1 = 19; 19x2+1 = 39; 39x2+1 = 79; 79x2+1 = 159.'
    },
    content: `Kunci menaklukkan soal deret angka BKN dalam waktu di bawah 30 detik tanpa terjebak rumus rumit.

POIN-POIN KUNCI WAJIB HAFAL:
- Langkah 1: Selalu cek selisih (tingkat 1). Jika selisih bertambah konstan (+2, +3, +4), deret bertingkat aritmatika.
- Langkah 2: Cek apakah ada pola selang-seling (larik lompat 1 atau lompat 2 angka).
- Langkah 3: Periksa bentuk kuadrat (n² ± 1) atau kubik (n³ ± 1): 1, 4, 9, 16, 25, 36, 49, 64, 81, 100.
- Langkah 4: Periksa deret Fibonacci (Un = Un-1 + Un-2): 2, 3, 5, 8, 13, 21, 34, 55.`,
    is_premium: true,
    is_active: true,
    file_url: 'https://drive.google.com/file/d/sample-tiu-deret/view',
    drive_file_id: 'drive-file-tiu-deret',
    created_at: '2025-01-12T10:00:00Z'
  },
  {
    id: 'mat-006',
    title: 'Rumus Sakti Berhitung Cepat & Aljabar',
    category: 'TIU',
    summary: 'Hafalan pecahan istimewa dan faktorisasi aljabar untuk menyelesaikan soal operasi matematika dalam hitungan detik.',
    intro: 'Hafalan pecahan istimewa dan faktorisasi aljabar untuk menyelesaikan soal operasi matematika dalam hitungan detik.',
    key_points: [
      'Faktorisasi Ajaib: a² - b² = (a - b)(a + b). Jika di soal ada (888² - 112²)/(888 - 112), jawabannya langsung 888 + 112 = 1.000!',
      'Pecahan Istimewa Wajib Hafal: 1/2 = 50% | 1/3 = 33,33% | 1/4 = 25% | 1/5 = 20% | 1/6 = 16,67% | 1/8 = 12,5% | 3/8 = 37,5% | 5/8 = 62,5% | 1/9 = 11,11%.',
      'Rumus Pekerja Tambahan: (Hari Terhenti x Pekerja Awal) / Sisa Hari Aktif.'
    ],
    quick_formulas: [
      'Rumus Bekerja Bersama: Waktu Total = (A x B) / (A + B).',
      'Kecepatan Rata-Rata Pulang Pergi: V_avg = (2 x V1 x V2) / (V1 + V2).'
    ],
    example: {
      question: 'Hitung cepat nilai dari (725² - 275²) / (725 - 275) + 37,5% dari 80 adalah...',
      answer: 'Kunci: 1.030',
      analysis: 'Gunakan faktorisasi a² - b²: (725² - 275²)/(725 - 275) = 725 + 275 = 1.000. Lalu 37,5% = 3/8, maka (3/8) x 80 = 30. Jadi totalnya 1.000 + 30 = 1.030.'
    },
    content: `Hafalan pecahan istimewa dan faktorisasi aljabar untuk menyelesaikan soal operasi matematika dalam hitungan detik.

POIN-POIN KUNCI WAJIB HAFAL:
- Faktorisasi Ajaib: a² - b² = (a - b)(a + b).
- Pecahan Istimewa: 1/2 = 50% | 1/3 = 33,33% | 1/4 = 25% | 1/5 = 20% | 1/6 = 16,67% | 1/8 = 12,5% | 3/8 = 37,5% | 5/8 = 62,5% | 1/9 = 11,11%.
- Rumus Pekerja Tambahan: (Hari Terhenti x Pekerja Awal) / Sisa Hari Aktif.`,
    is_premium: true,
    is_active: true,
    file_url: 'https://drive.google.com/file/d/sample-tiu-berhitung-cepat/view',
    drive_file_id: 'drive-file-tiu-aljabar',
    created_at: '2025-01-13T10:00:00Z'
  },
  {
    id: 'mat-007',
    title: 'Hukum Penarikan Kesimpulan & Silogisme',
    category: 'TIU',
    summary: 'Aturan baku logika formal BKN agar tidak terjebak opini pribadi atau penalaran yang keliru.',
    intro: 'Aturan baku logika formal BKN agar tidak terjebak opini pribadi atau penalaran yang keliru.',
    key_points: [
      'Aturan Kuantor: Jika ada premis "Semua" + "Sebagian/Beberapa", kesimpulan WAJIB diawali kata "Sebagian/Beberapa".',
      'Aturan Negatif: Jika salah satu premis bernilai negatif ("tidak/bukan"), kesimpulan WAJIB bernilai negatif.',
      'Modus Ponens: Jika p -> q, dan p terjadi, maka q pasti terjadi.',
      'Modus Tollens: Jika p -> q, dan ~q (q tidak terjadi), maka ~p (p tidak terjadi).',
      'Silogisme Hipotesis: Jika p -> q, dan q -> r, maka p -> r.'
    ],
    quick_formulas: [
      'Ekuivalensi Implikasi: "Jika p maka q" (p -> q) setara dengan "Tidak p atau q" (~p v q) dan Kontraposisinya (~q -> ~p).',
      'Ingkaran (Negasi) Implikasi: ~(p -> q) ≡ p ∧ ~q (p terjadi TETAPI q tidak terjadi).'
    ],
    example: {
      question: 'Semua peserta SKD yang datang terlambat tidak diperkenankan masuk ruangan. Sebagian peserta dari Jakarta datang terlambat. Kesimpulan yang sah adalah...',
      answer: 'Kunci: Sebagian peserta dari Jakarta tidak diperkenankan masuk ruangan',
      analysis: 'Terapkan Aturan Kuantor (Semua + Sebagian = Sebagian) dan Aturan Negatif (ada kata "tidak"), sehingga kesimpulan wajib diawali "Sebagian" dan memuat "tidak".'
    },
    content: `Aturan baku logika formal BKN agar tidak terjebak opini pribadi atau penalaran yang keliru.

POIN-POIN KUNCI WAJIB HAFAL:
- Aturan Kuantor: Jika ada premis "Semua" + "Sebagian/Beberapa", kesimpulan WAJIB diawali kata "Sebagian/Beberapa".
- Aturan Negatif: Jika salah satu premis bernilai negatif ("tidak/bukan"), kesimpulan WAJIB bernilai negatif.
- Modus Ponens, Modus Tollens, dan Silogisme Hipotesis.`,
    is_premium: true,
    is_active: true,
    file_url: 'https://drive.google.com/file/d/sample-tiu-silogisme/view',
    drive_file_id: 'drive-file-tiu-silogisme',
    created_at: '2025-01-13T14:00:00Z'
  },
  {
    id: 'mat-003',
    title: 'Formula Menembus Skor TKP > 200 (Bedah Opsi Nilai 5)',
    category: 'TKP',
    summary: 'TKP tidak memiliki jawaban salah (skor 1–5). Untuk lulus passing grade 166 dan meraih ranking 1, Anda harus membiasakan diri memilih opsi berbobot 5.',
    intro: 'TKP tidak memiliki jawaban salah (skor 1–5). Untuk lulus passing grade 166 dan meraih ranking 1, Anda harus membiasakan diri memilih opsi berbobot 5.',
    key_points: [
      '1. Pelayanan Publik (Kata Kunci: Cepat, Tepat, Empati, Solutif): Pilih opsi yang mendahulukan kepentingan masyarakat, turun langsung menenangkan warga, tidak lempar tanggung jawab ke satpam/orang lain.',
      '2. Jejaring Kerja (Kata Kunci: Kolaboratif, Terbuka, Empat Mata): Jika rekan kerja bermasalah, ajak diskusi empat mata mencari solusi, jangan permalukan di muka umum, jangan langsung lapor atasan sebelum diajak bicara.',
      '3. Sosial Budaya (Kata Kunci: Inklusif, Toleran, Adaptif): Hormati adat istiadat setempat, jangan mengeluh atas perbedaan tradisi, jangan memaksakan budaya asal.',
      '4. TIK (Kata Kunci: Adaptif, Pembelajar Cepat, Agen Perubahan): Bersedia belajar sistem digital baru, sabar membimbing rekan kerja senior yang gagap teknologi.',
      '5. Profesionalisme (Kata Kunci: Tuntas, Tanggung Jawab, Loyalitas): Utamakan tugas dinas saat mendesak, selesaikan sebelum tenggat, pisahkan urusan pribadi dengan kantor.',
      '6. Anti-Radikalisme (Kata Kunci: Tegas, Proaktif, Sesuai Prosedur): ASN adalah benteng NKRI. Jika ada ujaran intoleran, ingatkan secara santun tapi tegas, lalu laporkan lewat mekanisme internal resmi.'
    ],
    quick_formulas: [
      'Filter Opsi Skor 5: Hindari opsi yang pasif ("diam saja"), impulsif ("marah/mempermalukan"), atau lempar tanggung jawab ("menyuruh orang lain").',
      'Prinsip ASN BerAKHLAK: Berorientasi Pelayanan, Akuntabel, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif.'
    ],
    example: {
      question: 'Saat jam istirahat baru dimulai, seorang warga lansia kebingungan mengurus dokumen pensiun yang sangat mendesak. Pilihan sikap berbobot 5 adalah...',
      answer: 'Kunci: Menyapa dengan ramah, mempersilakan duduk, dan menyelesaikan dokumen beliau terlebih dahulu sebelum beristirahat',
      analysis: 'Mengutamakan empati, pelayanan publik prima, dan memprioritaskan kelompok rentan secara tuntas tanpa melempar tugas kepada petugas lain.'
    },
    content: `TKP tidak memiliki jawaban salah (skor 1–5). Untuk lulus passing grade 166 dan meraih ranking 1, Anda harus membiasakan diri memilih opsi berbobot 5.

POIN-POIN KUNCI WAJIB HAFAL:
- 1. Pelayanan Publik (Kata Kunci: Cepat, Tepat, Empati, Solutif)
- 2. Jejaring Kerja (Kata Kunci: Kolaboratif, Terbuka, Empat Mata)
- 3. Sosial Budaya (Kata Kunci: Inklusif, Toleran, Adaptif)
- 4. TIK (Kata Kunci: Adaptif, Pembelajar Cepat, Agen Perubahan)
- 5. Profesionalisme (Kata Kunci: Tuntas, Tanggung Jawab, Loyalitas)
- 6. Anti-Radikalisme (Kata Kunci: Tegas, Proaktif, Sesuai Prosedur)`,
    is_premium: true,
    is_active: true,
    file_url: 'https://drive.google.com/file/d/sample-tkp-poin5/view',
    drive_file_id: 'drive-file-tkp-poin5',
    created_at: '2025-01-14T15:00:00Z'
  },
  {
    id: 'mat-008',
    title: 'Manajemen Waktu 100 Menit di Ujian CAT BKN',
    category: 'STRATEGI',
    summary: '110 Soal dalam 100 Menit berarti Anda hanya punya rata-rata 54 detik per butir soal!',
    intro: '110 Soal dalam 100 Menit berarti Anda hanya punya rata-rata 54 detik per butir soal!',
    key_points: [
      'Urutan Pengerjaan Terbaik: Kerjakan TKP dahulu (30 menit, soal bacaan cepat, semua ada poinnya) -> Lanjut TWK (20 menit, hafalan & penalaran) -> Terakhir TIU (45 menit, butuh hitungan & coretan).',
      'Sisa 5 Menit: Periksa kembali lembar jawaban, pastikan tidak ada satupun soal kosong! (Di SKD tidak ada sistem minus untuk jawaban salah).',
      'Strategi Ragu-Ragu: Jika ragu antara 2 opsi di TIU/TWK, pilih salah satu tebakan terbaik lalu tandai kuning. Jangan biarkan kosong!'
    ],
    quick_formulas: [
      'Alokasi Waktu Ideal 100 Menit: TKP (45 soal) = 30 menit | TWK (30 soal) = 20 menit | TIU (35 soal) = 45 menit | Cek Ulang = 5 menit.',
      'Aturan Emas 60 Detik: Jika satu soal hitungan TIU buntu lebih dari 60 detik, segera pilih estimasi terbaik, tandai kuning, dan lanjut ke soal berikutnya.'
    ],
    example: {
      question: 'Anda menjumpai soal TIU perbandingan kuantitatif dengan hitungan panjang, sementara waktu tersisa 25 menit untuk 20 soal. Langkah paling tepat adalah...',
      answer: 'Kunci: Pilih jawaban estimasi terdekat, tandai kuning (Ragu-Ragu), lalu lanjut ke soal lebih mudah',
      analysis: 'Setiap soal bernilai maksimal sama (5 poin). Mengamankan poin dari soal yang lebih cepat dikerjakan jauh lebih strategis daripada terjebak di 1 soal sulit.'
    },
    content: `110 Soal dalam 100 Menit berarti Anda hanya punya rata-rata 54 detik per butir soal!

POIN-POIN KUNCI WAJIB HAFAL:
- Urutan Pengerjaan Terbaik: Kerjakan TKP dahulu (30 menit) -> Lanjut TWK (20 menit) -> Terakhir TIU (45 menit).
- Sisa 5 Menit: Periksa kembali lembar jawaban, pastikan tidak ada satupun soal kosong!
- Strategi Ragu-Ragu: Pilih salah satu tebakan terbaik lalu tandai kuning. Jangan biarkan kosong!`,
    is_premium: true,
    is_active: true,
    file_url: 'https://drive.google.com/file/d/sample-strategi-cat-bkn/view',
    drive_file_id: 'drive-file-strategi-cat',
    created_at: '2025-01-15T10:00:00Z'
  }
];

export const SEED_PACKAGES: PremiumPackage[] = [
  {
    id: 'pkg-standar',
    tier_key: 'STANDAR',
    package_name: 'Paket Standar (Hanya Latihan Soal)',
    price: 150000,
    allow_discount: false,
    duration_days: 365,
    description:
      'Akses khusus latihan soal dan simulasi ujian CAT BKN saja tanpa modul materi lengkap, tanpa video pembahasan, dan tanpa sesi Zoom bimbel.',
    is_active: true,
    is_recommended: false,
    features: [
      'Akses Tanpa Batas Tryout SKD Lengkap (110 Soal CAT BKN)',
      'Akses Seluruh Tryout Per Kategori (TWK, TIU, TKP)',
      'Latihan Harian & Drill Soal Sepuasnya Tanpa Batas',
      'Ikut Sesi Ujian Tryout Bareng & Leaderboard',
      'Pembahasan Lengkap & Trik Cepat Poin 5'
    ],
    feature_items: [
      { label: 'Akses Tanpa Batas Tryout SKD Lengkap (110 Soal CAT BKN)', included: true },
      { label: 'Akses Seluruh Tryout Per Kategori (TWK, TIU, TKP)', included: true },
      { label: 'Latihan Harian & Drill Soal Sepuasnya Tanpa Batas', included: true },
      { label: 'Ikut Sesi Ujian Tryout Bareng & Leaderboard', included: true },
      { label: 'Pembahasan Lengkap & Trik Cepat Poin 5', included: true },
      { label: 'Modul Lengkap PDF, Materi SKD & Akses Google Drive', included: false },
      { label: 'Short Video Pembahasan & Kiat Belajar', included: false },
      { label: 'Sesi Coaching & Gabung Zoom Bimbel (Jadwal Malam Hari)', included: false },
      { label: 'Kalkulator Nilai SKD & SKB (Simulasi Peluang Lulus)', included: false },
      { label: 'Grup Diskusi WhatsApp Eksklusif bersama Tutor', included: false },
      { label: 'Sesi Tanya Jawab Pembahasan Soal Sulit 1-on-1', included: false },
      { label: 'Analisis Pemetaan Nilai & Formasi Instansi', included: false }
    ]
  },
  {
    id: 'pkg-1',
    tier_key: 'PREMIUM',
    package_name: 'Paket Premium (Belajar Mandiri)',
    price: 150000,
    original_price: 200000,
    promo_badge: 'PROMO TAHUN BARU',
    allow_discount: true,
    duration_days: 365,
    description:
      'Akses penuh seluruh fitur ujian, bank soal, modul lengkap materi PDF/Drive, dan short video untuk belajar mandiri selama 1 tahun penuh.',
    is_active: true,
    is_recommended: true,
    features: [
      'Akses Tanpa Batas Tryout SKD Lengkap (110 Soal CAT BKN)',
      'Akses Seluruh Tryout Per Kategori (TWK, TIU, TKP)',
      'Latihan Harian & Drill Soal Sepuasnya Tanpa Batas',
      'Ikut Sesi Ujian Tryout Bareng & Leaderboard',
      'Pembahasan Lengkap & Trik Cepat Poin 5',
      'Modul Lengkap PDF, Materi SKD & Akses Google Drive',
      'Short Video Pembahasan & Kiat Belajar'
    ],
    feature_items: [
      { label: 'Akses Tanpa Batas Tryout SKD Lengkap (110 Soal CAT BKN)', included: true },
      { label: 'Akses Seluruh Tryout Per Kategori (TWK, TIU, TKP)', included: true },
      { label: 'Latihan Harian & Drill Soal Sepuasnya Tanpa Batas', included: true },
      { label: 'Ikut Sesi Ujian Tryout Bareng & Leaderboard', included: true },
      { label: 'Pembahasan Lengkap & Trik Cepat Poin 5', included: true },
      { label: 'Modul Lengkap PDF, Materi SKD & Akses Google Drive', included: true },
      { label: 'Short Video Pembahasan & Kiat Belajar', included: true },
      { label: 'Sesi Coaching & Gabung Zoom Bimbel (Jadwal Malam Hari)', included: false },
      { label: 'Kalkulator Nilai SKD & SKB (Simulasi Peluang Lulus)', included: false },
      { label: 'Grup Diskusi WhatsApp Eksklusif bersama Tutor', included: false },
      { label: 'Sesi Tanya Jawab Pembahasan Soal Sulit 1-on-1', included: false },
      { label: 'Analisis Pemetaan Nilai & Formasi Instansi', included: false }
    ]
  },
  {
    id: 'pkg-2',
    tier_key: 'INTENSIF',
    package_name: 'Paket Intensif Bimbel (Belajar Bersama)',
    price: 189000,
    allow_discount: true,
    duration_days: 90,
    description:
      'Program bimbingan belajar bersama secara intensif via Zoom (jadwal disesuaikan pada malam hari) lengkap dengan Kalkulator Nilai SKD & SKB menjelang seleksi resmi CPNS.',
    is_active: true,
    is_recommended: false,
    features: [
      'Semua fasilitas Paket Premium (Belajar Mandiri)',
      'Zoom Bimbel Belajar Bersama (Jadwal Disesuaikan Malam Hari)',
      'Kalkulator Nilai SKD & SKB (Simulasi Peluang Lulus)',
      'Grup Diskusi WhatsApp Eksklusif bersama Tutor',
      'Sesi Tanya Jawab Pembahasan Soal Sulit 1-on-1',
      'Analisis Pemetaan Nilai & Formasi Instansi'
    ],
    feature_items: [
      { label: 'Akses Tanpa Batas Tryout SKD Lengkap (110 Soal CAT BKN)', included: true },
      { label: 'Akses Seluruh Tryout Per Kategori (TWK, TIU, TKP)', included: true },
      { label: 'Latihan Harian & Drill Soal Sepuasnya Tanpa Batas', included: true },
      { label: 'Ikut Sesi Ujian Tryout Bareng & Leaderboard', included: true },
      { label: 'Pembahasan Lengkap & Trik Cepat Poin 5', included: true },
      { label: 'Modul Lengkap PDF, Materi SKD & Akses Google Drive', included: true },
      { label: 'Short Video Pembahasan & Kiat Belajar', included: true },
      { label: 'Sesi Coaching & Gabung Zoom Bimbel (Jadwal Malam Hari)', included: true },
      { label: 'Kalkulator Nilai SKD & SKB (Simulasi Peluang Lulus)', included: true },
      { label: 'Grup Diskusi WhatsApp Eksklusif bersama Tutor', included: true },
      { label: 'Sesi Tanya Jawab Pembahasan Soal Sulit 1-on-1', included: true },
      { label: 'Analisis Pemetaan Nilai & Formasi Instansi', included: true }
    ]
  }
];

export const SEED_PRACTICE_PACKAGES: PracticePackage[] = [
  // --- TRY OUT SKD (Cards like image_6bde8d2f.png & image_ad747473.png) ---
  {
    id: 'pkg-to-1',
    title: 'Try Out SKD 2026 – Platinum #2',
    subtitle: 'Simulasi Lengkap HOTS BKN Standar PermenPAN-RB',
    package_type: 'TRYOUT_SKD',
    category: 'CAMPURAN',
    access_tier: 'PLATINUM',
    question_count: 110,
    duration_minutes: 100,
    rating: 4.5,
    review_count: 203,
    completed_count: 3420,
    is_popular: true,
    is_active: true,
    created_at: '2026-01-10T08:00:00Z'
  },
  {
    id: 'pkg-to-2',
    title: 'Try Out SKD FR Nasional Gratis 2026',
    subtitle: 'Soal Field Report Teraktual Seluruh Wilayah',
    package_type: 'TRYOUT_SKD',
    category: 'CAMPURAN',
    access_tier: 'GRATIS',
    question_count: 110,
    duration_minutes: 100,
    rating: 4.6,
    review_count: 596,
    completed_count: 12450,
    is_popular: true,
    is_active: true,
    created_at: '2026-01-15T08:00:00Z'
  },
  {
    id: 'pkg-to-3',
    title: 'Try Out SKD 2026 – Premium #3',
    subtitle: 'Prediksi Soal Akurat Berstandar CAT BKN',
    package_type: 'TRYOUT_SKD',
    category: 'CAMPURAN',
    access_tier: 'PREMIUM',
    question_count: 110,
    duration_minutes: 100,
    rating: 4.5,
    review_count: 302,
    completed_count: 5120,
    is_popular: false,
    is_active: true,
    created_at: '2026-01-20T08:00:00Z'
  },
  {
    id: 'pkg-to-4',
    title: 'Try Out SKD 2026 – Platinum #1',
    subtitle: 'Simulasi Spesialis Ambang Batas Maksimal',
    package_type: 'TRYOUT_SKD',
    category: 'CAMPURAN',
    access_tier: 'PLATINUM',
    question_count: 110,
    duration_minutes: 100,
    rating: 4.7,
    review_count: 193,
    completed_count: 2980,
    is_popular: false,
    is_active: true,
    created_at: '2026-01-22T08:00:00Z'
  },
  {
    id: 'pkg-to-5',
    title: 'Try Out SKD 2026 – Premium #2',
    subtitle: 'Pendalaman Penalaran Analitis & Integritas',
    package_type: 'TRYOUT_SKD',
    category: 'CAMPURAN',
    access_tier: 'PREMIUM',
    question_count: 110,
    duration_minutes: 100,
    rating: 4.4,
    review_count: 362,
    completed_count: 6740,
    is_popular: false,
    is_active: true,
    created_at: '2026-01-25T08:00:00Z'
  },
  {
    id: 'pkg-to-6',
    title: 'Try Out SKD 2026 – Premium #1',
    subtitle: 'Edisi Perdana Penyesuaian Kisi-kisi Terkini',
    package_type: 'TRYOUT_SKD',
    category: 'CAMPURAN',
    access_tier: 'PREMIUM',
    question_count: 110,
    duration_minutes: 100,
    rating: 4.4,
    review_count: 609,
    completed_count: 9840,
    is_popular: true,
    is_active: true,
    created_at: '2026-02-01T08:00:00Z'
  },
  {
    id: 'pkg-to-7',
    title: 'Try Out Pemanasan SKD CPNS 2026 Part 2',
    subtitle: 'Uji Kecepatan dan Ketepatan Waktu Ujian',
    package_type: 'TRYOUT_SKD',
    category: 'CAMPURAN',
    access_tier: 'PREMIUM',
    question_count: 110,
    duration_minutes: 100,
    rating: 4.6,
    review_count: 2378,
    completed_count: 15300,
    is_popular: true,
    is_active: true,
    created_at: '2026-02-05T08:00:00Z'
  },
  {
    id: 'pkg-to-8',
    title: 'Try Out Pemanasan SKD CPNS 2026 Part 1',
    subtitle: 'Tes Diagnostik Kemampuan Dasar Peserta',
    package_type: 'TRYOUT_SKD',
    category: 'CAMPURAN',
    access_tier: 'GRATIS',
    question_count: 110,
    duration_minutes: 100,
    rating: 4.6,
    review_count: 6378,
    completed_count: 24100,
    is_popular: true,
    is_active: true,
    created_at: '2026-02-08T08:00:00Z'
  },
  {
    id: 'pkg-to-9',
    title: 'Try Out SKD 2024 – Premium #1',
    subtitle: 'Bank Soal Evaluasi Historis Terpilih',
    package_type: 'TRYOUT_SKD',
    category: 'CAMPURAN',
    access_tier: 'PREMIUM',
    question_count: 110,
    duration_minutes: 100,
    rating: 4.7,
    review_count: 12271,
    completed_count: 42100,
    is_popular: true,
    is_active: true,
    created_at: '2025-11-01T08:00:00Z'
  },
  {
    id: 'pkg-to-10',
    title: 'Try Out Akbar Nasional SKD CPNS 2026',
    subtitle: 'Simulasi Serentak Pemeringkatan Nasional Terbuka',
    package_type: 'TRYOUT_AKBAR',
    category: 'CAMPURAN',
    access_tier: 'PREMIUM',
    question_count: 110,
    duration_minutes: 100,
    rating: 4.9,
    review_count: 14820,
    completed_count: 38900,
    is_popular: true,
    is_active: true,
    created_at: '2026-02-10T08:00:00Z'
  },

  // --- LATIHAN & DRILL (Cards like image_22b09d6e.png & user prompt) ---
  {
    id: 'pkg-lat-tiu-1',
    title: 'TIU 1 : Penalaran Logis',
    subtitle: 'Silogisme, Modus Ponens & Tollens',
    package_type: 'LATIHAN_HARIAN',
    category: 'TIU',
    access_tier: 'GRATIS',
    question_count: 15,
    duration_minutes: 15,
    completed_count: 16800,
    is_popular: true,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'pkg-lat-tiu-50',
    title: 'Latihan TIU 50 – Penalaran Logis',
    subtitle: 'Penalaran Analitis Tingkat Mahir',
    package_type: 'LATIHAN_HARIAN',
    category: 'TIU',
    access_tier: 'PREMIUM',
    question_count: 10,
    duration_minutes: 10,
    completed_count: 7300,
    is_popular: false,
    is_active: true,
    created_at: '2026-02-01T08:00:00Z'
  },
  {
    id: 'pkg-lat-tiu-49',
    title: 'Latihan TIU 49 – Penalaran Logis',
    subtitle: 'Pola Premis dan Kesimpulan Majemuk',
    package_type: 'LATIHAN_HARIAN',
    category: 'TIU',
    access_tier: 'PREMIUM',
    question_count: 10,
    duration_minutes: 10,
    completed_count: 6890,
    is_popular: false,
    is_active: true,
    created_at: '2026-02-02T08:00:00Z'
  },
  {
    id: 'pkg-lat-tiu-48',
    title: 'Latihan TIU 48 – Penalaran Logis',
    subtitle: 'Logika Urutan Posisi & Posisi Meja',
    package_type: 'LATIHAN_HARIAN',
    category: 'TIU',
    access_tier: 'PREMIUM',
    question_count: 10,
    duration_minutes: 10,
    completed_count: 5940,
    is_popular: false,
    is_active: true,
    created_at: '2026-02-03T08:00:00Z'
  },
  {
    id: 'pkg-lat-tiu-47',
    title: 'Latihan TIU 47 – Analitis Kombinasi',
    subtitle: 'Peluang, Urutan Pemilihan Tim',
    package_type: 'LATIHAN_HARIAN',
    category: 'TIU',
    access_tier: 'PREMIUM',
    question_count: 10,
    duration_minutes: 10,
    completed_count: 8200,
    is_popular: true,
    is_active: true,
    created_at: '2026-02-04T08:00:00Z'
  },
  {
    id: 'pkg-lat-tiu-46',
    title: 'Latihan TIU 46 – Analitis Kombinasi',
    subtitle: 'Syarat Khusus Jadwal Kerja Pegawai',
    package_type: 'LATIHAN_HARIAN',
    category: 'TIU',
    access_tier: 'PREMIUM',
    question_count: 10,
    duration_minutes: 10,
    completed_count: 7450,
    is_popular: false,
    is_active: true,
    created_at: '2026-02-05T08:00:00Z'
  },
  {
    id: 'pkg-lat-tiu-45',
    title: 'Latihan TIU 45 – Analitis Kombinasi',
    subtitle: 'Rute Perjalanan & Prioritas Proyek',
    package_type: 'LATIHAN_HARIAN',
    category: 'TIU',
    access_tier: 'PREMIUM',
    question_count: 10,
    duration_minutes: 10,
    completed_count: 6120,
    is_popular: false,
    is_active: true,
    created_at: '2026-02-06T08:00:00Z'
  },
  {
    id: 'pkg-lat-tiu-44',
    title: 'Latihan TIU 44 – Perbandingan Hasil Operasi',
    subtitle: 'Hubungan Kuantitatif X dan Y',
    package_type: 'LATIHAN_HARIAN',
    category: 'TIU',
    access_tier: 'PREMIUM',
    question_count: 10,
    duration_minutes: 10,
    completed_count: 9800,
    is_popular: true,
    is_active: true,
    created_at: '2026-02-07T08:00:00Z'
  },
  {
    id: 'pkg-lat-tiu-43',
    title: 'Latihan TIU 43 – Perbandingan Hasil Operasi',
    subtitle: 'Perbandingan Pecahan & Eksponen',
    package_type: 'LATIHAN_HARIAN',
    category: 'TIU',
    access_tier: 'PREMIUM',
    question_count: 10,
    duration_minutes: 10,
    completed_count: 8650,
    is_popular: false,
    is_active: true,
    created_at: '2026-02-08T08:00:00Z'
  },
  {
    id: 'pkg-lat-tiu-42',
    title: 'Latihan TIU 42 – Perbandingan Hasil Operasi',
    subtitle: 'Aljabar Lanjutan & Persamaan Kuadrat',
    package_type: 'LATIHAN_HARIAN',
    category: 'TIU',
    access_tier: 'PREMIUM',
    question_count: 10,
    duration_minutes: 10,
    completed_count: 7300,
    is_popular: false,
    is_active: true,
    created_at: '2026-02-09T08:00:00Z'
  },
  {
    id: 'pkg-lat-tiu-41',
    title: 'Latihan TIU 41 – Kecukupan Data',
    subtitle: 'Pernyataan (1) dan (2) Cukup Menjawab?',
    package_type: 'LATIHAN_HARIAN',
    category: 'TIU',
    access_tier: 'PREMIUM',
    question_count: 10,
    duration_minutes: 10,
    completed_count: 10450,
    is_popular: true,
    is_active: true,
    created_at: '2026-02-10T08:00:00Z'
  },
  {
    id: 'pkg-lat-tiu-40',
    title: 'Latihan TIU 40 – Kecukupan Data',
    subtitle: 'Statistika, Rata-rata & Median Data',
    package_type: 'LATIHAN_HARIAN',
    category: 'TIU',
    access_tier: 'PREMIUM',
    question_count: 10,
    duration_minutes: 10,
    completed_count: 8900,
    is_popular: false,
    is_active: true,
    created_at: '2026-02-11T08:00:00Z'
  },
  {
    id: 'pkg-lat-twk-1',
    title: 'TWK 1 : Pilar Kebangsaan & UUD 1945',
    subtitle: 'Pasal-pasal Krusial & Amandemen I-IV',
    package_type: 'DRILL_KATEGORI',
    category: 'TWK',
    access_tier: 'GRATIS',
    question_count: 15,
    duration_minutes: 15,
    completed_count: 18900,
    is_popular: true,
    is_active: true,
    created_at: '2026-01-05T08:00:00Z'
  },
  {
    id: 'pkg-lat-twk-2',
    title: 'TWK 2 : Integritas & Bela Negara',
    subtitle: 'Sikap Menolak Gratifikasi & Cinta Tanah Air',
    package_type: 'DRILL_KATEGORI',
    category: 'TWK',
    access_tier: 'PREMIUM',
    question_count: 30,
    duration_minutes: 25,
    completed_count: 11200,
    is_popular: false,
    is_active: true,
    created_at: '2026-01-18T08:00:00Z'
  },
  {
    id: 'pkg-lat-twk-3',
    title: 'TWK 3 : Nasionalisme & Sejarah Perjuangan',
    subtitle: 'Tokoh Bangsa, BPUPKI & Perjanjian Bersejarah',
    package_type: 'DRILL_KATEGORI',
    category: 'TWK',
    access_tier: 'PREMIUM',
    question_count: 30,
    duration_minutes: 25,
    completed_count: 9400,
    is_popular: false,
    is_active: true,
    created_at: '2026-01-20T08:00:00Z'
  },
  {
    id: 'pkg-lat-tkp-1',
    title: 'TKP 1 : Pelayanan Publik & Keramahan',
    subtitle: 'Orientasi Kepuasan Masyarakat Skor 5',
    package_type: 'DRILL_KATEGORI',
    category: 'TKP',
    access_tier: 'GRATIS',
    question_count: 15,
    duration_minutes: 15,
    completed_count: 22100,
    is_popular: true,
    is_active: true,
    created_at: '2026-01-08T08:00:00Z'
  },
  {
    id: 'pkg-lat-tkp-2',
    title: 'TKP 2 : Jejaring Kerja & Kolaborasi ASN',
    subtitle: 'Kerja Sama Tim & Komunikasi Efektif',
    package_type: 'DRILL_KATEGORI',
    category: 'TKP',
    access_tier: 'PREMIUM',
    question_count: 45,
    duration_minutes: 40,
    completed_count: 13500,
    is_popular: false,
    is_active: true,
    created_at: '2026-01-25T08:00:00Z'
  },
  {
    id: 'pkg-lat-tkp-3',
    title: 'TKP 3 : Anti-Radikalisme & Integritas Publik',
    subtitle: 'Sikap Toleransi & Ketahanan Ideologi ASN',
    package_type: 'DRILL_KATEGORI',
    category: 'TKP',
    access_tier: 'PREMIUM',
    question_count: 45,
    duration_minutes: 40,
    completed_count: 14700,
    is_popular: true,
    is_active: true,
    created_at: '2026-02-01T08:00:00Z'
  }
];

export const SEED_PAYMENTS: Payment[] = [
  {
    id: 'pay-001',
    user_id: 'usr-1',
    user_name: 'Frizal Pratama',
    user_email: 'frizaltrader@gmail.com',
    user_phone: '081234567890',
    user_registered_at: '2025-01-10T08:00:00Z',
    package_id: 'pkg-1',
    package_name: 'Paket Premium 1 Tahun',
    original_amount: 200000,
    promo_discount: 50000,
    referral_code: 'DIANCPNS',
    referral_discount: 20000,
    amount: 130000,
    affiliate_user_id: 'usr-2',
    affiliate_name: 'Dian Paramitha, S.T.',
    affiliate_commission: 10000,
    commission_status: 'UNPAID',
    payment_method: 'TRANSFER_BANK',
    bank_name: 'BCA (Bank Central Asia)',
    sender_name: 'Frizal Pratama',
    proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    status: 'WAITING_VERIFICATION',
    created_at: '2026-11-12T09:15:00Z'
  },
  {
    id: 'pay-002',
    user_id: 'usr-2',
    user_name: 'Dian Paramitha, S.T.',
    user_email: 'dian.premium@cpns.id',
    user_phone: '081298765432',
    user_registered_at: '2025-01-01T10:00:00Z',
    package_id: 'pkg-1',
    package_name: 'Paket Premium 1 Tahun',
    original_amount: 200000,
    promo_discount: 50000,
    referral_code: 'LOGINCPNS',
    referral_discount: 20000,
    amount: 130000,
    affiliate_user_id: 'usr-superadmin',
    affiliate_name: 'Official LOGIN CPNS (Admin)',
    affiliate_commission: 0,
    commission_status: 'NOT_APPLICABLE',
    payment_method: 'QRIS',
    sender_name: 'Dian Paramitha',
    proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    verified_by: 'Dr. Hendra Wijaya',
    verified_at: '2025-01-01T10:15:00Z',
    created_at: '2025-01-01T10:00:00Z'
  },
  {
    id: 'pay-003',
    user_id: 'usr-3',
    user_name: 'Rahmat Hidayat, S.Pd',
    user_email: 'rahmat.hidayat@gmail.com',
    user_phone: '081377889900',
    user_registered_at: '2026-11-01T09:00:00Z',
    package_id: 'pkg-1',
    package_name: 'Paket Premium 1 Tahun',
    original_amount: 200000,
    promo_discount: 50000,
    referral_code: 'DIANCPNS',
    referral_discount: 20000,
    amount: 130000,
    affiliate_user_id: 'usr-2',
    affiliate_name: 'Dian Paramitha, S.T.',
    affiliate_commission: 10000,
    commission_status: 'PAID',
    commission_paid_at: '2026-11-06T10:00:00Z',
    commission_paid_by: 'Dr. Hendra Wijaya',
    payment_method: 'TRANSFER_BANK',
    bank_name: 'Bank Mandiri',
    sender_name: 'Rahmat Hidayat',
    proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    verified_by: 'Dr. Hendra Wijaya',
    verified_at: '2026-11-05T14:30:00Z',
    created_at: '2026-11-05T14:00:00Z'
  },
  {
    id: 'pay-004',
    user_id: 'usr-4',
    user_name: 'Siti Nurhaliza, S.E.',
    user_email: 'siti.nurhaliza@yahoo.com',
    user_phone: '081922334455',
    user_registered_at: '2026-11-04T11:20:00Z',
    package_id: 'pkg-1',
    package_name: 'Paket Premium 1 Tahun',
    original_amount: 200000,
    promo_discount: 50000,
    referral_code: 'DIANCPNS',
    referral_discount: 20000,
    amount: 130000,
    affiliate_user_id: 'usr-2',
    affiliate_name: 'Dian Paramitha, S.T.',
    affiliate_commission: 10000,
    commission_status: 'UNPAID',
    payment_method: 'QRIS',
    sender_name: 'Siti Nurhaliza',
    proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    verified_by: 'Dr. Hendra Wijaya',
    verified_at: '2026-11-08T11:20:00Z',
    created_at: '2026-11-08T11:00:00Z'
  },
  {
    id: 'pay-005',
    user_id: 'usr-5',
    user_name: 'Budi Santoso, S.Kom',
    user_email: 'budi.santoso@gmail.com',
    user_phone: '082155667788',
    user_registered_at: '2026-11-11T15:00:00Z',
    package_id: 'pkg-1',
    package_name: 'Paket Premium 1 Tahun',
    original_amount: 200000,
    promo_discount: 50000,
    referral_code: 'LOGINCPNS',
    referral_discount: 20000,
    amount: 130000,
    affiliate_user_id: 'usr-superadmin',
    affiliate_name: 'Official LOGIN CPNS (Admin)',
    affiliate_commission: 0,
    commission_status: 'NOT_APPLICABLE',
    payment_method: 'COD_WHATSAPP',
    sender_name: 'Budi Santoso',
    proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    status: 'WAITING_VERIFICATION',
    created_at: '2026-11-12T07:45:00Z'
  },
  {
    id: 'pay-006',
    user_id: 'usr-6',
    user_name: 'Mega Utami, S.Ked',
    user_email: 'mega.utami@outlook.com',
    user_phone: '085211223344',
    user_registered_at: '2026-11-08T10:15:00Z',
    package_id: 'pkg-2',
    package_name: 'Paket Intensif Bimbel (3 Bulan)',
    original_amount: 189000,
    promo_discount: 0,
    referral_discount: 0,
    amount: 189000,
    commission_status: 'NOT_APPLICABLE',
    payment_method: 'TRANSFER_BANK',
    bank_name: 'Bank BRI',
    sender_name: 'Mega Utami',
    proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    status: 'REJECTED',
    rejection_reason: 'Bukti transfer tidak terbaca / buram, mohon kirim ulang via WA 081312139893',
    verified_by: 'Dr. Hendra Wijaya',
    verified_at: '2026-11-09T16:00:00Z',
    created_at: '2026-11-09T15:30:00Z'
  }
];

export const SEED_WITHDRAWALS: CommissionWithdrawal[] = [
  {
    id: 'wd-001',
    affiliate_user_id: 'usr-2',
    affiliate_name: 'Dian Paramitha, S.T.',
    affiliate_email: 'dian.premium@cpns.id',
    affiliate_phone: '081298765432',
    referral_code: 'DIANCPNS',
    amount: 50000,
    bank_name: 'BSI (Bank Syariah Indonesia)',
    account_number: '7098123456',
    account_holder: 'Dian Paramitha',
    status: 'PAID',
    requested_at: '2026-11-06T08:30:00Z',
    paid_at: '2026-11-06T10:00:00Z',
    paid_by: 'Dr. Hendra Wijaya'
  }
];

export const SEED_GROUP_SESSIONS: GroupSession[] = [
  {
    id: 'sess-001',
    title: 'Tryout Bareng Nasional Akbar SKD CPNS 2026 #Sesi 1',
    description: 'Simulasi serentak nasional sistem CAT BKN 110 soal dalam 100 menit diikuti pembahasan tuntas via Zoom bersama Master Tutor.',
    exam_type: 'TRYOUT_BERSAMA',
    question_count: 110,
    duration_minutes: 100,
    start_at: '2026-11-20T09:00:00Z',
    end_at: '2026-11-20T12:00:00Z',
    quota: 1000,
    zoom_url: 'https://zoom.us/j/8833441122?pwd=LOGINCPNSAKBAR',
    coach_name: 'Dr. Hendra Wijaya & Tim Tutor BKN',
    status: 'UPCOMING',
    session_category: 'TRYOUT_BARENG',
    schedule_note: 'Pembahasan Zoom Malam Hari · 19.30 WIB',
    created_at: '2026-11-10T08:00:00Z'
  },
  {
    id: 'sess-002',
    title: 'Zoom Bimbel Malam: Bedah Tuntas Soal HOTS TKP Skor 5 & TIU Numerik',
    description: 'Kelas bimbel interaktif belajar bersama via Zoom pada malam hari (jadwal fleksibel malam) khusus peserta Paket Intensif Bimbel.',
    exam_type: 'TRYOUT_BERSAMA',
    question_count: 30,
    duration_minutes: 90,
    start_at: '2026-11-25T19:30:00Z',
    end_at: '2026-11-25T21:15:00Z',
    quota: 500,
    zoom_url: 'https://zoom.us/j/9900112233?pwd=TKPHOTSSESI',
    coach_name: 'Dr. Hendra Wijaya · Master Tutor BKN',
    status: 'UPCOMING',
    session_category: 'ZOOM_BIMBEL_MALAM',
    schedule_note: 'Jadwal Malam Hari · 19.30 – 21.15 WIB',
    created_at: '2026-11-11T14:00:00Z'
  },
  {
    id: 'sess-003',
    title: 'Zoom Bimbel Malam: Penalaran Analitis, Silogisme & Strategi SKB',
    description: 'Pertemuan kelas malam rutin bersama mentor: bedah trik cepat silogisme, hitung cepat pecahan, serta strategi mendongkrak skor akhir SKD & SKB.',
    exam_type: 'TRYOUT_BERSAMA',
    question_count: 35,
    duration_minutes: 90,
    start_at: '2026-11-28T19:45:00Z',
    end_at: '2026-11-28T21:30:00Z',
    quota: 500,
    zoom_url: 'https://zoom.us/j/7744556688?pwd=BIMBELMALAM',
    coach_name: 'Tim BKN Master & Coach Nadia',
    status: 'UPCOMING',
    session_category: 'ZOOM_BIMBEL_MALAM',
    schedule_note: 'Jadwal Malam Hari · 19.45 – 21.30 WIB',
    created_at: '2026-11-12T10:00:00Z'
  },
  {
    id: 'sess-004',
    title: 'Zoom Bimbel Malam: Bedah Kisi-Kisi TWK Pilar Negara & Integritas ASN',
    description: 'Sesi bimbingan malam membahas soal TWK penalaran tingkat tinggi serta simulasi manajemen waktu 100 menit CAT BKN.',
    exam_type: 'TRYOUT_BERSAMA',
    question_count: 30,
    duration_minutes: 90,
    start_at: '2026-11-08T19:30:00Z',
    end_at: '2026-11-08T21:00:00Z',
    quota: 500,
    zoom_url: 'https://zoom.us/j/5544332211?pwd=SELESAIMALAM',
    coach_name: 'Dr. Hendra Wijaya & Coach Nadia',
    status: 'FINISHED',
    session_category: 'ZOOM_BIMBEL_MALAM',
    schedule_note: 'Terlaksana · 19.30 – 21.00 WIB',
    attendance_count: 148,
    summary_notes: 'Sesi berjalan kondusif dengan 148 peserta aktif. Pembahasan fokus pada pasal krusial UUD 1945 dan studi kasus Anti-Radikalisme TKP.',
    evidence_screenshots: [
      'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&auto=format&fit=crop&q=80'
    ],
    created_at: '2026-11-01T08:00:00Z'
  },
  {
    id: 'sess-005',
    title: 'Tryout Bareng Pra-Akbar SKD CPNS Batch #0 (Pemanasan Nasional)',
    description: 'Sesi Tryout Bareng perdana untuk mengukur kemampuan awal peserta sebelum memasuki periode intensif.',
    exam_type: 'TRYOUT_BERSAMA',
    question_count: 110,
    duration_minutes: 100,
    start_at: '2026-11-05T09:00:00Z',
    end_at: '2026-11-05T11:30:00Z',
    quota: 1000,
    zoom_url: 'https://zoom.us/j/6677889900?pwd=BATCHNOL',
    coach_name: 'Tim BKN Master & Dr. Hendra Wijaya',
    status: 'FINISHED',
    session_category: 'TRYOUT_BARENG',
    schedule_note: 'Terlaksana · Pembahasan Zoom Selesai',
    attendance_count: 426,
    summary_notes: '426 peserta menyelesaikan simulasi serentak dengan skor rata-rata nasional 378.',
    evidence_screenshots: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
    ],
    created_at: '2026-10-28T08:00:00Z'
  }
];

export const SEED_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lb-1',
    session_id: 'sess-001',
    user_id: 'usr-2',
    user_name: 'Dian Paramitha, S.T.',
    twk_score: 110,
    tiu_score: 145,
    tkp_score: 198,
    total_score: 453,
    completion_time_seconds: 4890,
    rank: 1
  },
  {
    id: 'lb-2',
    session_id: 'sess-001',
    user_id: 'usr-mock-1',
    user_name: 'Ahmad Fauzan',
    twk_score: 105,
    tiu_score: 140,
    tkp_score: 195,
    total_score: 440,
    completion_time_seconds: 5120,
    rank: 2
  },
  {
    id: 'lb-3',
    session_id: 'sess-001',
    user_id: 'usr-intensif',
    user_name: 'Nadia Kusuma, S.E.',
    twk_score: 100,
    tiu_score: 135,
    tkp_score: 192,
    total_score: 427,
    completion_time_seconds: 5010,
    rank: 3
  },
  {
    id: 'lb-4',
    session_id: 'sess-001',
    user_id: 'usr-1',
    user_name: 'Frizal Pratama',
    twk_score: 85,
    tiu_score: 115,
    tkp_score: 182,
    total_score: 382,
    completion_time_seconds: 5400,
    rank: 4
  },
  {
    id: 'lb-5',
    session_id: 'sess-005',
    user_id: 'usr-intensif',
    user_name: 'Nadia Kusuma, S.E.',
    twk_score: 115,
    tiu_score: 150,
    tkp_score: 201,
    total_score: 466,
    completion_time_seconds: 4720,
    rank: 1
  },
  {
    id: 'lb-6',
    session_id: 'sess-005',
    user_id: 'usr-standar',
    user_name: 'Raka Pratama, S.Kom',
    twk_score: 90,
    tiu_score: 120,
    tkp_score: 184,
    total_score: 394,
    completion_time_seconds: 5340,
    rank: 2
  }
];

export const SEED_RESULTS: ExamResult[] = [
  {
    id: 'res-001',
    exam_id: 'ex-skd-demo-1',
    user_id: 'usr-1',
    user_name: 'Frizal Pratama',
    exam_title: 'Simulasi Tryout SKD Lengkap (Standar BKN)',
    exam_type: 'TRYOUT_SKD_LENGKAP',
    completed_at: '2026-11-10T14:35:00Z',
    duration_seconds: 5200,
    total_questions: 110,
    answered_count: 99,
    unanswered_count: 11,
    twk_score: 85,
    tiu_score: 115,
    tkp_score: 182,
    total_score: 382,
    pass_status: 'MEMENUHI_AMBANG_BATAS',
    passing_grade_snapshot: {
      twk: 65,
      tiu: 80,
      tkp: 166,
      regulation_info: 'KepmenPAN-RB No. 321 Tahun 2024'
    },
    user_answers: {
      'twk-001': 'B',
      'twk-002': 'B',
      'twk-003': 'C',
      'twk-004': 'B',
      'tiu-001': 'B',
      'tiu-002': 'A',
      'tiu-003': 'B',
      'tiu-004': 'A',
      'tkp-001': 'B',
      'tkp-002': 'C',
      'tkp-003': 'B',
      'tkp-004': 'B'
    },
    flagged_map: {},
    questions_snapshot: SEED_QUESTIONS
  },
  {
    id: 'res-002',
    exam_id: 'ex-daily-demo-1',
    user_id: 'usr-1',
    user_name: 'Frizal Pratama',
    exam_title: 'Latihan Harian Kategori TIU',
    exam_type: 'LATIHAN_HARIAN',
    category: 'TIU',
    completed_at: '2026-11-11T16:20:00Z',
    duration_seconds: 540,
    total_questions: 15,
    answered_count: 14,
    unanswered_count: 1,
    twk_score: 0,
    tiu_score: 65,
    tkp_score: 0,
    total_score: 65,
    pass_status: 'MEMENUHI_AMBANG_BATAS',
    passing_grade_snapshot: {
      twk: 0,
      tiu: 50,
      tkp: 0,
      regulation_info: 'Ambang Batas Latihan Harian'
    },
    user_answers: {
      'tiu-001': 'B',
      'tiu-002': 'A',
      'tiu-003': 'B',
      'tiu-004': 'A'
    },
    flagged_map: {},
    questions_snapshot: SEED_QUESTIONS.filter(q => q.category === 'TIU')
  },
  {
    id: 'res-003',
    exam_id: 'ex-skd-demo-2',
    user_id: 'usr-2',
    user_name: 'Dian Paramitha, S.T.',
    exam_title: 'Tryout Bareng Nasional Akbar SKD CPNS 2026 #Sesi 1',
    exam_type: 'TRYOUT_BERSAMA',
    completed_at: '2026-11-12T10:25:00Z',
    duration_seconds: 4890,
    total_questions: 110,
    answered_count: 110,
    unanswered_count: 0,
    twk_score: 110,
    tiu_score: 145,
    tkp_score: 198,
    total_score: 453,
    pass_status: 'MEMENUHI_AMBANG_BATAS',
    passing_grade_snapshot: {
      twk: 65,
      tiu: 80,
      tkp: 166,
      regulation_info: 'KepmenPAN-RB No. 321 Tahun 2024'
    },
    user_answers: {},
    flagged_map: {},
    questions_snapshot: SEED_QUESTIONS
  },
  {
    id: 'res-004',
    exam_id: 'ex-skd-demo-3',
    user_id: 'usr-intensif',
    user_name: 'Nadia Kusuma, S.E.',
    exam_title: 'Tryout Bareng Pra-Akbar SKD CPNS Batch #0 (Pemanasan Nasional)',
    exam_type: 'TRYOUT_BERSAMA',
    completed_at: '2026-11-05T10:18:00Z',
    duration_seconds: 4720,
    total_questions: 110,
    answered_count: 110,
    unanswered_count: 0,
    twk_score: 115,
    tiu_score: 150,
    tkp_score: 201,
    total_score: 466,
    pass_status: 'MEMENUHI_AMBANG_BATAS',
    passing_grade_snapshot: {
      twk: 65,
      tiu: 80,
      tkp: 166,
      regulation_info: 'KepmenPAN-RB No. 321 Tahun 2024'
    },
    user_answers: {},
    flagged_map: {},
    questions_snapshot: SEED_QUESTIONS
  },
  {
    id: 'res-005',
    exam_id: 'ex-kat-demo-1',
    user_id: 'usr-standar',
    user_name: 'Raka Pratama, S.Kom',
    exam_title: 'Tryout Kategori TWK (Pilar Negara & UUD 1945)',
    exam_type: 'TRYOUT_KATEGORI',
    category: 'TWK',
    completed_at: '2026-11-14T15:10:00Z',
    duration_seconds: 1380,
    total_questions: 30,
    answered_count: 30,
    unanswered_count: 0,
    twk_score: 105,
    tiu_score: 0,
    tkp_score: 0,
    total_score: 105,
    pass_status: 'MEMENUHI_AMBANG_BATAS',
    passing_grade_snapshot: {
      twk: 65,
      tiu: 0,
      tkp: 0,
      regulation_info: 'KepmenPAN-RB No. 321 Tahun 2024'
    },
    user_answers: {},
    flagged_map: {},
    questions_snapshot: SEED_QUESTIONS.filter(q => q.category === 'TWK')
  },
  {
    id: 'res-006',
    exam_id: 'ex-skd-demo-4',
    user_id: 'usr-standar',
    user_name: 'Raka Pratama, S.Kom',
    exam_title: 'Simulasi Tryout SKD Lengkap (Standar BKN)',
    exam_type: 'TRYOUT_SKD_LENGKAP',
    completed_at: '2026-11-15T09:40:00Z',
    duration_seconds: 5600,
    total_questions: 110,
    answered_count: 103,
    unanswered_count: 7,
    twk_score: 60,
    tiu_score: 95,
    tkp_score: 174,
    total_score: 329,
    pass_status: 'BELUM_MEMENUHI_AMBANG_BATAS',
    passing_grade_snapshot: {
      twk: 65,
      tiu: 80,
      tkp: 166,
      regulation_info: 'KepmenPAN-RB No. 321 Tahun 2024'
    },
    user_answers: {},
    flagged_map: {},
    questions_snapshot: SEED_QUESTIONS
  }
];

export const SEED_SETTINGS: AppSettings = {
  app_name: 'LOGIN CPNS',
  headline: 'Persiapkan Dirimu, Raih Kelulusan CPNS.',
  admin_whatsapp: '081312139893',
  admin_email: 'loginbimbelasn@gmail.com',
  affiliate_commission_amount: 10000,
  referral_discount_amount: 20000,
  min_commission_withdrawal: 50000,
  lock_materials_for_premium_only: true,
  standar_questions_only: true,
  default_passing_grade: {
    twk: 65,
    tiu: 80,
    tkp: 166,
    regulation_info: 'KepmenPAN-RB No. 321 Tahun 2024 (SKD CPNS)'
  },
  skd_calculator_config: {
    enabled: true,
    access_tier: 'INTENSIF_ONLY',
    enable_auto_import_110: true,
    skd_weight_percent: 40,
    skb_weight_percent: 60,
    max_twk: 150,
    max_tiu: 175,
    max_tkp: 225,
    max_skb_cat: 500,
    default_competitor_skd: 420,
    default_competitor_skb: 72,
    calculator_note:
      'Gunakan skor Try Out SKD 110 Soal untuk memetakan peluang kelulusan akhir dan target nilai SKB bersama tutor di sesi Zoom Bimbel malam.'
  },
  daily_limit_free_user: 3,
  maintenance_mode: false,
  bank_accounts: [
    {
      bank_name: 'BSI (Bank Syariah Indonesia)',
      account_number: '721506012',
      account_holder: 'Syafrizal'
    },
    {
      bank_name: 'Bank BPD Aceh',
      account_number: '07002200023195',
      account_holder: 'Syafriza'
    }
  ],
  google_drive_folder_id: '1aB2cD3eFgHiJkLmNoPqRsTuVwXyZ',
  google_drive_status: 'CONNECTED_SIMULATED'
};

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    actor_id: 'usr-1',
    actor_name: 'Frizal Pratama',
    action: 'SUBMIT_PAYMENT',
    entity_type: 'PAYMENT',
    entity_id: 'pay-001',
    details: 'Mengunggah bukti pembayaran Paket Premium 1 Tahun senilai Rp 99.000',
    created_at: '2026-11-12T09:15:00Z'
  },
  {
    id: 'log-002',
    actor_id: 'usr-superadmin',
    actor_name: 'Dr. Hendra Wijaya',
    action: 'APPROVE_PAYMENT',
    entity_type: 'PAYMENT',
    entity_id: 'pay-002',
    details: 'Menyetujui pembayaran Rp 99.000 dan mengaktifkan status Premium Dian Paramitha',
    created_at: '2025-01-01T10:15:00Z'
  },
  {
    id: 'log-003',
    actor_id: 'usr-superadmin',
    actor_name: 'Dr. Hendra Wijaya',
    action: 'UPDATE_PASSING_GRADE',
    entity_type: 'SETTINGS',
    entity_id: 'settings-1',
    details: 'Menetapkan passing grade resmi referensi: TWK 65, TIU 80, TKP 166',
    created_at: '2024-11-01T08:00:00Z'
  }
];

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Pendaftaran Akun Berhasil',
    message: 'Selamat datang di LOGIN CPNS! Mulai persiapan SKD dengan materi gratis dan latihan harian.',
    type: 'ANNOUNCEMENT',
    created_at: '2025-01-10T08:05:00Z',
    is_read: true
  },
  {
    id: 'notif-2',
    title: 'Pembayaran Menunggu Verifikasi',
    message: 'Bukti transfer Paket Premium 1 Tahun Anda telah diterima dan sedang diperiksa admin.',
    type: 'PAYMENT',
    created_at: '2026-11-12T09:16:00Z',
    is_read: false
  },
  {
    id: 'notif-3',
    title: 'Tryout Bareng Nasional Akbar',
    message: 'Sesi Tryout Bareng Akbar SKD CPNS 2026 #Sesi 1 dibuka pada 20 November 2026 pukul 09.00 WIB.',
    type: 'TRYOUT',
    created_at: '2026-11-10T08:00:00Z',
    is_read: false
  }
];

export const SEED_ANNOUNCEMENTS: AdminAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Info Jadwal Resmi Pendaftaran & Seleksi CPNS 2026/2027',
    summary: 'Pantau estimasi jadwal pembukaan portal SSCASN BKN, tahapan seleksi administrasi, hingga pelaksanaan SKD CAT CPNS 2026/2027.',
    content: `Halo Pejuang NIP LOGIN CPNS!\n\nBerikut informasi terbaru mengenai persiapan jadwal resmi seleksi CPNS Tahun Anggaran 2026/2027:\n\n1. Persiapan Dokumen Administrasi\nPastikan KTP, Kartu Keluarga, Ijazah, Transkrip Nilai, dan Pas Foto berlatar merah sudah dipindai dengan jelas sesuai ketentuan portal SSCASN BKN.\n\n2. Fokus Ambang Batas (Passing Grade) SKD\nBerdasarkan acuan standar BKN terbaru, pastikan skor latihan Anda konsisten melampaui Passing Grade:\n- TWK: Minimal 65 (30 Soal)\n- TIU: Minimal 80 (35 Soal)\n- TKP: Minimal 166 (45 Soal)\n\n3. Update Modul & Soal Terbaru 2026/2027\nSeluruh paket Tryout Lengkap dan Latihan Terpilah di LOGIN CPNS sudah disesuaikan dengan kisi-kisi HOTS terbaru. Segera manfaatkan fitur pembahasan soal secara rutin.`,
    category: 'JADWAL_CPNS',
    is_pinned: true,
    is_active: true,
    author_name: 'Dr. Hendra Wijaya (Admin)',
    created_at: '2026-11-13T08:00:00Z'
  },
  {
    id: 'ann-2',
    title: 'Informasi Pemeliharaan Server & Optimalisasi Jaringan CAT',
    summary: 'Jika mengalami kendala koneksi atau lambat saat memuat soal, simak informasi status server dan panduan pemeliharaan rutin berikut.',
    content: `Pemberitahuan Teknis & Pemeliharaan Sistem:\n\nTim teknis LOGIN CPNS secara berkala melakukan optimalisasi server pada pukul 01.00 - 02.30 WIB untuk menjaga kestabilan sistem CAT.\n\nApabila terjadi gangguan jaringan saat mengakses aplikasi:\n- Pastikan koneksi internet Anda stabil (minimal 4G/WiFi).\n- Gunakan browser terbaru (Chrome, Edge, atau Safari).\n- Untuk kenyamanan tampilan layar simulasi ujian 110 soal, disarankan menggunakan Tablet, Laptop, atau PC.\n- Jika butuh bantuan cepat terkait akun atau kendala teknis, silakan tekan tombol WhatsApp Bantuan di pojok kanan bawah atau hubungi 0813-1213-9893.`,
    category: 'MAINTENANCE',
    is_pinned: false,
    is_active: true,
    author_name: 'Tim Teknis LOGIN CPNS',
    created_at: '2026-11-12T10:30:00Z'
  },
  {
    id: 'ann-3',
    title: 'Tryout Bareng Nasional Akbar SKD CPNS 2026/2027',
    summary: 'Pendaftaran Tryout Bareng Akbar serentak nasional dengan pemeringkatan leaderboard & pembahasan Zoom telah dibuka.',
    content: `Segera amankan kursi Anda di Sesi Tryout Bareng Nasional Akbar!\n\nDetail Pelaksanaan:\n- Jumlah Soal: 110 Butir (Standar CAT BKN)\n- Durasi Ujian: 100 Menit\n- Fasilitas: Peringkat Nasional Realtime & Sesi Bedah Soal Live via Zoom bersama Master Tutor BKN.\n\nMasuk ke menu "Tryout & Latihan" lalu pilih tab "Tryout Bareng" untuk melihat jadwal lengkap dan tautan Zoom.`,
    category: 'TRYOUT',
    is_pinned: false,
    is_active: true,
    author_name: 'Dr. Hendra Wijaya (Admin)',
    created_at: '2026-11-10T08:00:00Z'
  }
];

export const SEED_SHORT_VIDEOS: ShortVideo[] = [
  {
    id: 'sv-001',
    title: 'Trik Hitung Cepat Pecahan Istimewa & Faktorisasi Aljabar',
    category: 'TIU',
    topic: 'Matematika TIU · Berhitung Cepat',
    description: `Pembahasan singkat cara menyelesaikan soal hitung cepat SKD dalam waktu kurang dari 20 detik tanpa menghitung manual perkalian panjang:

1. Gunakan faktorisasi selisih kuadrat: a² - b² = (a - b)(a + b).
   Contoh: (725² - 275²) / (725 - 275) langsung dicoret (725 - 275), hasilnya tinggal 725 + 275 = 1.000.
2. Hafalkan konversi pecahan istimewa ke persen:
   1/8 = 12,5% | 3/8 = 37,5% | 5/8 = 62,5% | 7/8 = 87,5% | 1/6 = 16,67% | 1/3 = 33,33%.`,
    source_type: 'URL',
    video_url: '',
    duration_label: '01:45',
    is_premium: false,
    is_active: true,
    author_name: 'Dr. Hendra Wijaya',
    created_at: '2026-11-12T08:00:00Z'
  },
  {
    id: 'sv-002',
    title: 'Kiat Membagi Waktu 100 Menit untuk 110 Soal CAT BKN',
    category: 'KIAT_BELAJAR',
    topic: 'Kiat Belajar · Manajemen Waktu Ujian',
    description: `Strategi agar tidak kehabisan waktu saat menghadapi 110 soal SKD:

- Menit 0–25: Kerjakan TKP (45 soal) terlebih dahulu saat pikiran masih segar, target skor aman ≥ 185.
- Menit 25–50: Lanjut ke TWK (30 soal), gunakan teknik baca kalimat terakhir pertanyaan lebih dulu.
- Menit 50–85: Fokus ke TIU (35 soal) — lewati sementara soal hitungan panjang dengan tombol "Ragu-Ragu".
- Menit 85–100: Review soal yang masih kosong dan periksa ulang nomor yang ditandai kuning.`,
    source_type: 'URL',
    video_url: '',
    duration_label: '01:20',
    is_premium: true,
    is_active: true,
    author_name: 'Dr. Hendra Wijaya',
    created_at: '2026-11-11T10:30:00Z'
  },
  {
    id: 'sv-003',
    title: 'Rumus Perbandingan Berbalik Nilai: Pekerja Berhenti di Tengah Proyek',
    category: 'TIU',
    topic: 'Matematika TIU · Perbandingan',
    description: `Soal favorit yang hampir selalu keluar di TIU Matematika! Jika proyek dikerjakan oleh P pekerja, terhenti H hari, dengan sisa hari efektif S:

Rumus Kilat Tambahan Pekerja:
Tambahan Pekerja = (Pekerja Awal × Hari Terhenti) / Sisa Hari Aktif

Contoh: Proyek 20 hari oleh 15 orang. Setelah jalan 8 hari, libur 4 hari. Sisa hari aktif = 20 - 8 - 4 = 8 hari.
Tambahan = (15 × 4) / 8 = 60 / 8 = 7,5 → dibulatkan ke atas menjadi 8 orang.`,
    source_type: 'URL',
    video_url: '',
    duration_label: '02:10',
    is_premium: true,
    is_active: true,
    author_name: 'Dr. Hendra Wijaya',
    created_at: '2026-11-10T14:15:00Z'
  },
  {
    id: 'sv-004',
    title: 'Cara Membedakan Kewenangan MK vs MA & Hak Prerogatif Presiden',
    category: 'TWK',
    topic: 'TWK · Tata Negara & UUD 1945',
    description: `Jangan sampai tertukar saat ujian TWK:

- Uji Materi UU terhadap UUD 1945 → Mahkamah Konstitusi (MK).
- Uji Materi Peraturan di bawah UU (PP/Perpres/Perda) terhadap UU → Mahkamah Agung (MA).
- Jembatan keledai Hak Prerogatif Pasal 14:
  GR - MA (Grasi & Rehabilitasi pertimbangan Mahkamah Agung)
  AA - DPR (Amnesti & Abolisi pertimbangan DPR).`,
    source_type: 'URL',
    video_url: '',
    duration_label: '01:35',
    is_premium: true,
    is_active: true,
    author_name: 'Dr. Hendra Wijaya',
    created_at: '2026-11-09T09:00:00Z'
  }
];

export const SEED_EMAIL_LOGS: EmailNotificationLog[] = [
  {
    id: 'eml-001',
    recipient_user_id: 'usr-1',
    recipient_name: 'Frizal Pratama',
    recipient_email: 'frizaltrader@gmail.com',
    sender_email: 'loginbimbelasn@gmail.com',
    subject: '[LOGIN CPNS] Menunggu Verifikasi Pembayaran - Paket Premium 1 Tahun',
    body: `Halo Frizal Pratama,\n\nTerima kasih telah melakukan pengajuan pembayaran di LOGIN CPNS.\n\nDetail Transaksi:\n- Paket: Paket Premium 1 Tahun\n- Kode Referral: LOGINCPNS (-Rp 20.000)\n- Total Transfer: Rp 130.000\n- Status: MENUNGGU VERIFIKASI ADMIN\n\nTim kami akan memverifikasi bukti pembayaran Anda secepatnya dan mengirimkan email konfirmasi saat akun Premium Anda aktif.\n\nSalam Sukses ASN,\nTim LOGIN CPNS (loginbimbelasn@gmail.com)`,
    category: 'WAITING_PAYMENT',
    related_entity_id: 'pay-001',
    is_read: false,
    created_at: '2026-11-12T09:16:00Z'
  },
  {
    id: 'eml-002',
    recipient_user_id: 'usr-2',
    recipient_name: 'Dian Paramitha, S.T.',
    recipient_email: 'dian.premium@cpns.id',
    sender_email: 'loginbimbelasn@gmail.com',
    subject: '[LOGIN CPNS] Pembayaran Berhasil & Akun Anda Aktif Premium - Silakan Belajar!',
    body: `Halo Dian Paramitha, S.T.,\n\nPembayaran Anda telah BERHASIL diverifikasi!\nAkun Anda kini berstatus PREMIUM AKTIF.\n\nSilakan langsung belajar melalui menu Materi Belajar, Tryout SKD 110 Soal Standar BKN, dan Tryout Bareng Zoom.\n\nSalam Sukses ASN,\nTim LOGIN CPNS (loginbimbelasn@gmail.com)`,
    category: 'PAYMENT_APPROVED',
    related_entity_id: 'pay-002',
    is_read: true,
    created_at: '2025-01-01T10:15:00Z'
  },
  {
    id: 'eml-003',
    recipient_user_id: 'usr-2',
    recipient_name: 'Dian Paramitha, S.T.',
    recipient_email: 'dian.premium@cpns.id',
    sender_email: 'loginbimbelasn@gmail.com',
    subject: '[LOGIN CPNS] Pencairan Komisi Mitra Berhasil Dibayarkan',
    body: `Halo Dian Paramitha, S.T.,\n\nPengajuan pencairan komisi afiliasi Anda (Kode: DIANCPNS) sebesar Rp 50.000 telah DIBAYARKAN ke rekening BSI 7098123456 a.n. Dian Paramitha.\n\nTerima kasih telah menjadi Mitra Afiliasi LOGIN CPNS!\n\nSalam Sukses,\nTim LOGIN CPNS (loginbimbelasn@gmail.com)`,
    category: 'COMMISSION_PAID',
    related_entity_id: 'wd-001',
    is_read: true,
    created_at: '2026-11-06T10:00:00Z'
  }
];


