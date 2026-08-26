export interface OfflinePatient {
  id?: string;
  name: string;
  age: number;
  dateOfBirth: string;
  gender: string;
  mobile: string;
  email?: string;
  division: string;
  district: string;
  taluka: string;
  village: string;
  preferredLanguage: string;
  emergencyContact: {
    name: string;
    relation: string;
    mobile: string;
  };
  createdAt: number;
}

export interface OfflineTriage {
  id?: string;
  patientId: string; // patient reference or local offline patient id
  vitals: {
    temperature?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    heartRate?: number;
    spo2?: number;
    respiratoryRate?: number;
  };
  symptoms: Array<{
    name: string;
    durationDays: number;
    severity: "Mild" | "Moderate" | "Severe";
  }>;
  createdAt: number;
}

const DB_NAME = "jancare_offline_db";
const DB_VERSION = 1;

export function openOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB is only available in browser environments"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("patients")) {
        db.createObjectStore("patients", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("triage")) {
        db.createObjectStore("triage", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
}

export async function saveOfflinePatient(patient: Omit<OfflinePatient, "id">): Promise<number> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("patients", "readwrite");
    const store = tx.objectStore("patients");
    const request = store.add({ ...patient, id: Date.now().toString() });

    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
  });
}

export async function getOfflinePatients(): Promise<OfflinePatient[]> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("patients", "readonly");
    const store = tx.objectStore("patients");
    const request = store.getAll();

    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
  });
}

export async function clearOfflinePatients(): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("patients", "readwrite");
    const store = tx.objectStore("patients");
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = (event: any) => reject(event.target.error);
  });
}

export async function deleteOfflinePatient(id: string): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("patients", "readwrite");
    const store = tx.objectStore("patients");
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event: any) => reject(event.target.error);
  });
}

export async function saveOfflineTriage(triage: Omit<OfflineTriage, "id">): Promise<number> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("triage", "readwrite");
    const store = tx.objectStore("triage");
    const request = store.add({ ...triage, id: Date.now().toString() });

    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
  });
}

export async function getOfflineTriage(): Promise<OfflineTriage[]> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("triage", "readonly");
    const store = tx.objectStore("triage");
    const request = store.getAll();

    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
  });
}

export async function deleteOfflineTriage(id: string): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("triage", "readwrite");
    const store = tx.objectStore("triage");
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event: any) => reject(event.target.error);
  });
}
