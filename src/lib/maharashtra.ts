export interface MaharashtraVillage {
  name: string;
}

export interface MaharashtraTaluka {
  name: string;
  villages: string[];
}

export interface MaharashtraDistrict {
  name: string;
  talukas: { [key: string]: string[] };
}

export interface MaharashtraDivision {
  name: string;
  districts: string[];
}

export const divisions: MaharashtraDivision[] = [
  {
    name: "Konkan",
    districts: ["Mumbai", "Thane", "Palghar", "Raigad", "Ratnagiri", "Sindhudurg"],
  },
  {
    name: "Pune",
    districts: ["Pune", "Satara", "Sangli", "Solapur", "Kolhapur"],
  },
  {
    name: "Nashik",
    districts: ["Nashik", "Ahmednagar", "Dhule", "Jalgaon", "Nandurbar"],
  },
  {
    name: "Aurangabad",
    districts: ["Chhatrapati Sambhajinagar", "Jalna", "Parbhani", "Hingoli", "Beed", "Nanded", "Dharashiv", "Latur"],
  },
  {
    name: "Amravati",
    districts: ["Amravati", "Akola", "Washim", "Buldhana", "Yavatmal"],
  },
  {
    name: "Nagpur",
    districts: ["Nagpur", "Wardha", "Bhandara", "Gondia", "Chandrapur", "Gadchiroli"],
  },
];

export const districtTalukas: { [districtName: string]: string[] } = {
  Pune: ["Pune City", "Haveli", "Khed", "Baramati", "Shirur", "Maval", "Mulshi", "Indapur", "Daund", "Purandar", "Bhor", "Junna", "Ambegaon", "Velhe"],
  Satara: ["Satara", "Karad", "Wai", "Mahabaleshwar", "Phaltan", "Koregaon", "Patan", "Jawali", "Khandala", "Khatav", "Maan"],
  Thane: ["Thane", "Kalyan", "Murbad", "Bhiwandi", "Shahapur", "Ulhasnagar", "Ambernath"],
  Nashik: ["Nashik", "Sinnar", "Igatpuri", "Dindori", "Niphad", "Yeola", "Nandgaon", "Satana", "Kalwan", "Deola", "Surgana", "Peint", "Trimbakeshwar", "Baglan"],
  Nagpur: ["Nagpur City", "Nagpur Rural", "Kamptee", "Hingna", "Katol", "Narkhed", "Savner", "Kalmeshwar", "Ramtek", "Parseoni", "Mauda", "Umred", "Bhiwapur", "Kuhi"],
  "Chhatrapati Sambhajinagar": ["Chhatrapati Sambhajinagar", "Kannad", "Gangapur", "Vaijapur", "Paithan", "Khuldabad", "Sillod", "Soegaon", "Phulambri"],
  Sindhudurg: ["Kudal", "Sawantwadi", "Vengurla", "Malvan", "Devgad", "Kankavli", "Oras", "Dodamarg", "Vaibhavwadi"],
};

export const talukaVillages: { [talukaName: string]: string[] } = {
  Haveli: ["Manjari", "Hadapsar", "Wagholi", "Loni Kalbhor", "Uruli Kanchan", "Khadewadi", "Kondhwa", "Pisoli"],
  Khed: ["Chakan", "Rajgurunagar", "Alandi", "Kharpudi", "Pait", "Kadus", "Wada", "Shelpimpalgaon"],
  Karad: ["Koparde", "Kale", "Wathar", "Shenoli", "Umbraj", "Wing", "Masur", "Ond"],
  Sinnar: ["Demo Village", "Wavi", "Pangri", "Dodi", "Nandur Shingote", "Chas", "Musalgaon", "Deopur"],
  Kudal: ["Kasal", "Pinguli", "Oros", "Zarap", "Humarmala", "Chendvan", "Salgaon", "Nerur"],
  Paithan: ["Bidkin", "Pachod", "Balegaon", "Adul", "Wahegaon", "Kadethan", "Dhupkhed"],
};

export function getDistrictsForDivision(divisionName: string): string[] {
  const div = divisions.find((d) => d.name === divisionName);
  return div ? div.districts : [];
}

export function getTalukasForDistrict(districtName: string): string[] {
  return districtTalukas[districtName] || ["General Taluka"];
}

export function getVillagesForTaluka(talukaName: string): string[] {
  return talukaVillages[talukaName] || ["Demo Village", "Vikaswadi", "Swarupnagar", "Pimpalgaon", "Shivajinagar"];
}
