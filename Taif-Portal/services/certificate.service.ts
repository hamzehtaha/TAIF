import { httpService } from "@/services/http.service";

export interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  userName: string;
  completionDate: string;
  certificateUrl: string;
}

class CertificateService {
  async generateCertificate(courseId: string): Promise<Certificate> {
    return httpService.post<Certificate>(
      `/certificates/generate`,
      { courseId }
    );
  }

  async getCertificates(): Promise<Certificate[]> {
    return httpService.get<Certificate[]>("/certificates");
  }

  async downloadCertificate(certificateId: string): Promise<Blob> {
    const response = await fetch(`/api/certificates/${certificateId}/download`);
    return response.blob();
  }

  async generatePDF(courseId: string, userName: string): Promise<Blob> {
    return httpService.post<Blob>(`/certificates/pdf`, {
      courseId,
      userName,
    });
  }
}

export const certificateService = new CertificateService();
