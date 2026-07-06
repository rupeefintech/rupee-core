// Shared bank holiday data — used by BankHolidayPage (React) and api/render.ts (bot SSR).
// Keep framework-free: plain types and constants only.

export type HolidayType = 'national' | 'regional';

export interface Holiday {
  date: string;   // YYYY-MM-DD
  name: string;
  type: HolidayType;
  states: string[];  // ['ALL'] or specific state names
  note?: string;
}

export const ALL_STATES = 'ALL';

export const HOLIDAYS_2025: Holiday[] = [
  { date: '2025-01-14', name: 'Makar Sankranti / Pongal / Lohri', type: 'regional', states: ['Tamil Nadu', 'Gujarat', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Punjab', 'Haryana', 'Himachal Pradesh', 'Uttarakhand'] },
  { date: '2025-01-23', name: 'Netaji Subhas Chandra Bose Jayanti', type: 'regional', states: ['West Bengal'] },
  { date: '2025-01-26', name: 'Republic Day', type: 'national', states: [ALL_STATES] },
  { date: '2025-02-19', name: 'Chhatrapati Shivaji Maharaj Jayanti', type: 'regional', states: ['Maharashtra'] },
  { date: '2025-02-26', name: 'Maha Shivratri', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Karnataka', 'Telangana', 'Andhra Pradesh', 'Uttarakhand'] },
  { date: '2025-03-14', name: 'Holi', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Bihar', 'Himachal Pradesh', 'Uttarakhand', 'West Bengal'] },
  { date: '2025-03-30', name: 'Ugadi / Gudi Padwa', type: 'regional', states: ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Maharashtra'] },
  { date: '2025-04-06', name: 'Ram Navami', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Bihar', 'Karnataka', 'Andhra Pradesh', 'Telangana'] },
  { date: '2025-04-10', name: 'Mahavir Jayanti', type: 'national', states: [ALL_STATES] },
  { date: '2025-04-14', name: 'Dr. B.R. Ambedkar Jayanti / Tamil New Year / Baisakhi', type: 'national', states: [ALL_STATES], note: 'Tamil New Year (Tamil Nadu), Baisakhi (Punjab/Haryana), Vishu (Kerala)' },
  { date: '2025-04-18', name: 'Good Friday', type: 'national', states: [ALL_STATES] },
  { date: '2025-05-01', name: 'Maharashtra Day / Labour Day / Gujarat Day', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Tamil Nadu', 'Kerala', 'Punjab', 'West Bengal', 'Telangana', 'Andhra Pradesh', 'Karnataka'] },
  { date: '2025-05-12', name: 'Buddha Purnima', type: 'national', states: [ALL_STATES] },
  { date: '2025-06-07', name: 'Eid ul-Adha (Bakrid)', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'West Bengal', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Tamil Nadu', 'Rajasthan', 'Madhya Pradesh', 'Bihar'], note: 'Date subject to moon sighting' },
  { date: '2025-07-06', name: 'Muharram', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'West Bengal', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Tamil Nadu', 'Rajasthan', 'Madhya Pradesh', 'Bihar'], note: 'Date subject to moon sighting' },
  { date: '2025-08-15', name: 'Independence Day', type: 'national', states: [ALL_STATES] },
  { date: '2025-08-16', name: 'Janmashtami', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Bihar', 'West Bengal', 'Himachal Pradesh', 'Uttarakhand'] },
  { date: '2025-08-27', name: 'Ganesh Chaturthi', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Goa'] },
  { date: '2025-09-05', name: 'Milad-un-Nabi (Prophet\'s Birthday)', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'West Bengal', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Tamil Nadu', 'Rajasthan', 'Madhya Pradesh'], note: 'Date subject to moon sighting' },
  { date: '2025-10-02', name: 'Gandhi Jayanti / Dussehra', type: 'national', states: [ALL_STATES], note: 'Gandhi Jayanti is a national holiday. Dussehra coincides in 2025.' },
  { date: '2025-10-20', name: 'Diwali (Lakshmi Puja)', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Bihar', 'Himachal Pradesh', 'Uttarakhand', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'West Bengal'] },
  { date: '2025-10-21', name: 'Govardhan Puja / Diwali (South)', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Bihar', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Telangana'] },
  { date: '2025-10-22', name: 'Bhai Duj', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Bihar', 'Himachal Pradesh', 'Uttarakhand'] },
  { date: '2025-11-01', name: 'Kannada Rajyotsava / AP Formation Day', type: 'regional', states: ['Karnataka', 'Andhra Pradesh', 'Telangana'] },
  { date: '2025-11-05', name: 'Guru Nanak Jayanti', type: 'national', states: [ALL_STATES] },
  { date: '2025-12-25', name: 'Christmas Day', type: 'national', states: [ALL_STATES] },
];

export const HOLIDAYS_2026: Holiday[] = [
  { date: '2026-01-14', name: 'Makar Sankranti / Pongal / Lohri', type: 'regional', states: ['Tamil Nadu', 'Gujarat', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Punjab', 'Haryana', 'Himachal Pradesh', 'Uttarakhand'] },
  { date: '2026-01-26', name: 'Republic Day', type: 'national', states: [ALL_STATES] },
  { date: '2026-02-16', name: 'Maha Shivratri', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Karnataka', 'Telangana', 'Andhra Pradesh', 'Uttarakhand'] },
  { date: '2026-03-04', name: 'Holi', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Bihar', 'Himachal Pradesh', 'Uttarakhand', 'West Bengal'] },
  { date: '2026-03-19', name: 'Ugadi / Gudi Padwa', type: 'regional', states: ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Maharashtra'] },
  { date: '2026-04-03', name: 'Good Friday', type: 'national', states: [ALL_STATES] },
  { date: '2026-04-14', name: 'Dr. B.R. Ambedkar Jayanti / Tamil New Year / Baisakhi', type: 'national', states: [ALL_STATES], note: 'Tamil New Year (Tamil Nadu), Baisakhi (Punjab/Haryana)' },
  { date: '2026-04-23', name: 'Ram Navami', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Bihar', 'Karnataka', 'Andhra Pradesh', 'Telangana'] },
  { date: '2026-05-01', name: 'Maharashtra Day / Labour Day / Gujarat Day', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Tamil Nadu', 'Kerala', 'Punjab', 'West Bengal', 'Telangana', 'Andhra Pradesh', 'Karnataka'] },
  { date: '2026-05-27', name: 'Eid ul-Adha (Bakrid)', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'West Bengal', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Tamil Nadu', 'Rajasthan', 'Madhya Pradesh', 'Bihar'], note: 'Approximate — date subject to moon sighting' },
  { date: '2026-06-26', name: 'Muharram', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'West Bengal', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Tamil Nadu', 'Rajasthan', 'Madhya Pradesh', 'Bihar'], note: 'Approximate — date subject to moon sighting' },
  { date: '2026-08-15', name: 'Independence Day', type: 'national', states: [ALL_STATES] },
  { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'national', states: [ALL_STATES] },
  { date: '2026-11-08', name: 'Diwali (Lakshmi Puja)', type: 'regional', states: ['Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Bihar', 'Himachal Pradesh', 'Uttarakhand', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'West Bengal'], note: 'Approximate — verify with RBI circular' },
  { date: '2026-11-25', name: 'Guru Nanak Jayanti', type: 'national', states: [ALL_STATES], note: 'Approximate — verify with RBI circular' },
  { date: '2026-12-25', name: 'Christmas Day', type: 'national', states: [ALL_STATES] },
];

export const HOLIDAY_DATA: Record<number, Holiday[]> = { 2025: HOLIDAYS_2025, 2026: HOLIDAYS_2026 };
