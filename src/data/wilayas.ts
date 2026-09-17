export interface Wilaya {
  code: string;
  nameFr: string;
  nameAr: string;
  zone: 'centre' | 'est' | 'ouest' | 'hauts_plateaux' | 'sud' | 'grand_sud';
  homeDeliveryFee: number;
  deskDeliveryFee: number;
  estimatedDays: string;
}

export const WILAYAS: Wilaya[] = [
  { code: '01', nameFr: 'Adrar', nameAr: 'أدرار', zone: 'sud', homeDeliveryFee: 1000, deskDeliveryFee: 650, estimatedDays: '3-4' },
  { code: '02', nameFr: 'Chlef', nameAr: 'الشلف', zone: 'centre', homeDeliveryFee: 600, deskDeliveryFee: 350, estimatedDays: '1-2' },
  { code: '03', nameFr: 'Laghouat', nameAr: 'الأغواط', zone: 'hauts_plateaux', homeDeliveryFee: 750, deskDeliveryFee: 450, estimatedDays: '2-3' },
  { code: '04', nameFr: 'Oum El Bouaghi', nameAr: 'أم البواقي', zone: 'est', homeDeliveryFee: 650, deskDeliveryFee: 400, estimatedDays: '2-3' },
  { code: '05', nameFr: 'Batna', nameAr: 'باتنة', zone: 'est', homeDeliveryFee: 650, deskDeliveryFee: 400, estimatedDays: '2' },
  { code: '06', nameFr: 'Béjaïa', nameAr: 'بجاية', zone: 'centre', homeDeliveryFee: 600, deskDeliveryFee: 350, estimatedDays: '1-2' },
  { code: '07', nameFr: 'Biskra', nameAr: 'بسكرة', zone: 'hauts_plateaux', homeDeliveryFee: 750, deskDeliveryFee: 450, estimatedDays: '2-3' },
  { code: '08', nameFr: 'Béchar', nameAr: 'بشار', zone: 'sud', homeDeliveryFee: 950, deskDeliveryFee: 600, estimatedDays: '3-4' },
  { code: '09', nameFr: 'Blida', nameAr: 'البليدة', zone: 'centre', homeDeliveryFee: 450, deskDeliveryFee: 250, estimatedDays: '1' },
  { code: '10', nameFr: 'Bouira', nameAr: 'البويرة', zone: 'centre', homeDeliveryFee: 550, deskDeliveryFee: 300, estimatedDays: '1-2' },
  { code: '11', nameFr: 'Tamanrasset', nameAr: 'تمنراست', zone: 'grand_sud', homeDeliveryFee: 1350, deskDeliveryFee: 850, estimatedDays: '4-5' },
  { code: '12', nameFr: 'Tébessa', nameAr: 'تبسة', zone: 'est', homeDeliveryFee: 700, deskDeliveryFee: 400, estimatedDays: '2-3' },
  { code: '13', nameFr: 'Tlemcen', nameAr: 'تلمسان', zone: 'ouest', homeDeliveryFee: 650, deskDeliveryFee: 400, estimatedDays: '2' },
  { code: '14', nameFr: 'Tiaret', nameAr: 'تيارت', zone: 'hauts_plateaux', homeDeliveryFee: 700, deskDeliveryFee: 400, estimatedDays: '2' },
  { code: '15', nameFr: 'Tizi Ouzou', nameAr: 'تيزي وزو', zone: 'centre', homeDeliveryFee: 500, deskDeliveryFee: 300, estimatedDays: '1-2' },
  { code: '16', nameFr: 'Alger', nameAr: 'الجزائر العاصمة', zone: 'centre', homeDeliveryFee: 400, deskDeliveryFee: 200, estimatedDays: '1' },
  { code: '17', nameFr: 'Djelfa', nameAr: 'الجلفة', zone: 'hauts_plateaux', homeDeliveryFee: 700, deskDeliveryFee: 400, estimatedDays: '2-3' },
  { code: '18', nameFr: 'Jijel', nameAr: 'جيجل', zone: 'est', homeDeliveryFee: 650, deskDeliveryFee: 350, estimatedDays: '2' },
  { code: '19', nameFr: 'Sétif', nameAr: 'سطيف', zone: 'est', homeDeliveryFee: 600, deskDeliveryFee: 350, estimatedDays: '1-2' },
  { code: '20', nameFr: 'Saïda', nameAr: 'سعيدة', zone: 'ouest', homeDeliveryFee: 700, deskDeliveryFee: 400, estimatedDays: '2-3' },
  { code: '21', nameFr: 'Skikda', nameAr: 'سكيكدة', zone: 'est', homeDeliveryFee: 650, deskDeliveryFee: 350, estimatedDays: '2' },
  { code: '22', nameFr: 'Sidi Bel Abbès', nameAr: 'سيدي بلعباس', zone: 'ouest', homeDeliveryFee: 650, deskDeliveryFee: 350, estimatedDays: '2' },
  { code: '23', nameFr: 'Annaba', nameAr: 'عنابة', zone: 'est', homeDeliveryFee: 650, deskDeliveryFee: 350, estimatedDays: '2' },
  { code: '24', nameFr: 'Guelma', nameAr: 'قالمة', zone: 'est', homeDeliveryFee: 650, deskDeliveryFee: 350, estimatedDays: '2' },
  { code: '25', nameFr: 'Constantine', nameAr: 'قسنطينة', zone: 'est', homeDeliveryFee: 600, deskDeliveryFee: 350, estimatedDays: '1-2' },
  { code: '26', nameFr: 'Médéa', nameAr: 'المدية', zone: 'centre', homeDeliveryFee: 500, deskDeliveryFee: 300, estimatedDays: '1-2' },
  { code: '27', nameFr: 'Mostaganem', nameAr: 'مستغانم', zone: 'ouest', homeDeliveryFee: 650, deskDeliveryFee: 350, estimatedDays: '2' },
  { code: '28', nameFr: "M'Sila", nameAr: 'المسيلة', zone: 'hauts_plateaux', homeDeliveryFee: 700, deskDeliveryFee: 400, estimatedDays: '2' },
  { code: '29', nameFr: 'Mascara', nameAr: 'معسكر', zone: 'ouest', homeDeliveryFee: 650, deskDeliveryFee: 350, estimatedDays: '2' },
  { code: '30', nameFr: 'Ouargla', nameAr: 'ورقلة', zone: 'sud', homeDeliveryFee: 850, deskDeliveryFee: 500, estimatedDays: '2-3' },
  { code: '31', nameFr: 'Oran', nameAr: 'وهران', zone: 'ouest', homeDeliveryFee: 550, deskDeliveryFee: 300, estimatedDays: '1-2' },
  { code: '32', nameFr: 'El Bayadh', nameAr: 'البيض', zone: 'hauts_plateaux', homeDeliveryFee: 800, deskDeliveryFee: 500, estimatedDays: '2-3' },
  { code: '33', nameFr: 'Illizi', nameAr: 'إليزي', zone: 'grand_sud', homeDeliveryFee: 1400, deskDeliveryFee: 900, estimatedDays: '4-5' },
  { code: '34', nameFr: 'Bordj Bou Arreridj', nameAr: 'برج بوعريريج', zone: 'est', homeDeliveryFee: 600, deskDeliveryFee: 350, estimatedDays: '1-2' },
  { code: '35', nameFr: 'Boumerdès', nameAr: 'بومرداس', zone: 'centre', homeDeliveryFee: 450, deskDeliveryFee: 250, estimatedDays: '1' },
  { code: '36', nameFr: 'El Tarf', nameAr: 'الطارف', zone: 'est', homeDeliveryFee: 700, deskDeliveryFee: 400, estimatedDays: '2-3' },
  { code: '37', nameFr: 'Tindouf', nameAr: 'تندوف', zone: 'grand_sud', homeDeliveryFee: 1400, deskDeliveryFee: 900, estimatedDays: '4-6' },
  { code: '38', nameFr: 'Tissemsilt', nameAr: 'تيسمسيلت', zone: 'hauts_plateaux', homeDeliveryFee: 700, deskDeliveryFee: 400, estimatedDays: '2' },
  { code: '39', nameFr: 'El Oued', nameAr: 'الوادي', zone: 'sud', homeDeliveryFee: 800, deskDeliveryFee: 500, estimatedDays: '2-3' },
  { code: '40', nameFr: 'Khenchela', nameAr: 'خنشلة', zone: 'est', homeDeliveryFee: 700, deskDeliveryFee: 400, estimatedDays: '2' },
  { code: '41', nameFr: 'Souk Ahras', nameAr: 'سوق أهراس', zone: 'est', homeDeliveryFee: 700, deskDeliveryFee: 400, estimatedDays: '2' },
  { code: '42', nameFr: 'Tipaza', nameAr: 'تيبازة', zone: 'centre', homeDeliveryFee: 450, deskDeliveryFee: 250, estimatedDays: '1' },
  { code: '43', nameFr: 'Mila', nameAr: 'ميلة', zone: 'est', homeDeliveryFee: 650, deskDeliveryFee: 350, estimatedDays: '2' },
  { code: '44', nameFr: 'Aïn Defla', nameAr: 'عين الدفلى', zone: 'centre', homeDeliveryFee: 550, deskDeliveryFee: 300, estimatedDays: '1-2' },
  { code: '45', nameFr: 'Naâma', nameAr: 'النعامة', zone: 'hauts_plateaux', homeDeliveryFee: 800, deskDeliveryFee: 500, estimatedDays: '2-3' },
  { code: '46', nameFr: 'Aïn Témouchent', nameAr: 'عين تموشنت', zone: 'ouest', homeDeliveryFee: 650, deskDeliveryFee: 350, estimatedDays: '2' },
  { code: '47', nameFr: 'Ghardaïa', nameAr: 'غرداية', zone: 'sud', homeDeliveryFee: 800, deskDeliveryFee: 500, estimatedDays: '2-3' },
  { code: '48', nameFr: 'Relizane', nameAr: 'غليزان', zone: 'ouest', homeDeliveryFee: 650, deskDeliveryFee: 350, estimatedDays: '2' },
  { code: '49', nameFr: "El M'Ghair", nameAr: 'المغير', zone: 'sud', homeDeliveryFee: 850, deskDeliveryFee: 500, estimatedDays: '2-3' },
  { code: '50', nameFr: 'El Meniaa', nameAr: 'المنيعة', zone: 'sud', homeDeliveryFee: 900, deskDeliveryFee: 550, estimatedDays: '3' },
  { code: '51', nameFr: 'Ouled Djellal', nameAr: 'أولاد جلال', zone: 'hauts_plateaux', homeDeliveryFee: 750, deskDeliveryFee: 450, estimatedDays: '2' },
  { code: '52', nameFr: 'Bordj Baji Mokhtar', nameAr: 'برج باجي مختار', zone: 'grand_sud', homeDeliveryFee: 1450, deskDeliveryFee: 950, estimatedDays: '4-6' },
  { code: '53', nameFr: 'Béni Abbès', nameAr: 'بني عباس', zone: 'sud', homeDeliveryFee: 950, deskDeliveryFee: 600, estimatedDays: '3-4' },
  { code: '54', nameFr: 'Timimoun', nameAr: 'تيميمون', zone: 'sud', homeDeliveryFee: 950, deskDeliveryFee: 600, estimatedDays: '3-4' },
  { code: '55', nameFr: 'Touggourt', nameAr: 'تقرت', zone: 'sud', homeDeliveryFee: 850, deskDeliveryFee: 500, estimatedDays: '2-3' },
  { code: '56', nameFr: 'Djanet', nameAr: 'جانت', zone: 'grand_sud', homeDeliveryFee: 1450, deskDeliveryFee: 950, estimatedDays: '4-6' },
  { code: '57', nameFr: 'In Salah', nameAr: 'عين صالح', zone: 'grand_sud', homeDeliveryFee: 1200, deskDeliveryFee: 750, estimatedDays: '3-5' },
  { code: '58', nameFr: 'In Guezzam', nameAr: 'عين قزام', zone: 'grand_sud', homeDeliveryFee: 1500, deskDeliveryFee: 1000, estimatedDays: '4-6' },
  // Delegated / Recent Wilayas (59-68)
  { code: '59', nameFr: 'Aflou', nameAr: 'أفلو', zone: 'hauts_plateaux', homeDeliveryFee: 750, deskDeliveryFee: 450, estimatedDays: '2-3' },
  { code: '60', nameFr: 'Barika', nameAr: 'بريكة', zone: 'est', homeDeliveryFee: 650, deskDeliveryFee: 400, estimatedDays: '2' },
  { code: '61', nameFr: 'Ksar Chellala', nameAr: 'قصر الشلالة', zone: 'hauts_plateaux', homeDeliveryFee: 750, deskDeliveryFee: 450, estimatedDays: '2' },
  { code: '62', nameFr: 'Messaad', nameAr: 'مسعد', zone: 'hauts_plateaux', homeDeliveryFee: 750, deskDeliveryFee: 450, estimatedDays: '2-3' },
  { code: '63', nameFr: 'Aïn Oussera', nameAr: 'عين وسارة', zone: 'hauts_plateaux', homeDeliveryFee: 700, deskDeliveryFee: 400, estimatedDays: '2' },
  { code: '64', nameFr: 'Bousaâda', nameAr: 'بوسعادة', zone: 'hauts_plateaux', homeDeliveryFee: 700, deskDeliveryFee: 400, estimatedDays: '2' },
  { code: '65', nameFr: 'El Eulma', nameAr: 'العلمة', zone: 'est', homeDeliveryFee: 600, deskDeliveryFee: 350, estimatedDays: '1-2' },
  { code: '66', nameFr: 'Sour El Ghozlane', nameAr: 'سور الغزلان', zone: 'centre', homeDeliveryFee: 550, deskDeliveryFee: 300, estimatedDays: '1-2' },
  { code: '67', nameFr: 'Akbou', nameAr: 'أقبو', zone: 'centre', homeDeliveryFee: 600, deskDeliveryFee: 350, estimatedDays: '1-2' },
  { code: '68', nameFr: 'El Abiodh Sidi Cheikh', nameAr: 'الأبيض سيدي الشيخ', zone: 'sud', homeDeliveryFee: 900, deskDeliveryFee: 550, estimatedDays: '3' },
];

export function getWilayaByCode(code: string): Wilaya | undefined {
  return WILAYAS.find((w) => w.code === code);
}
