export type DiseaseSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface LeafDiagnosisResult {
  id?: string;
  cropName: string;
  disease: string;
  scientificName?: string;
  confidence: number; // 0 - 100
  severity: DiseaseSeverity;
  severityScore: number; // 0 - 100
  symptoms: string[];
  organicTreatments: string[];
  chemicalTreatments: string[];
  preventiveMeasures: string[];
  prognosis: string;
  imageUrl?: string;
  analyzedAt: string;
}
