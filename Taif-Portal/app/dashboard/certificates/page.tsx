"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CertificateViewer } from "@/components/CertificateViewer";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/authService";
import { Certificate } from "@/services/certificateService";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Award, Download, ChevronRight, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock certificates data
const mockCertificates: Certificate[] = [
  {
    id: "cert-1",
    courseId: "1",
    courseName: "Introduction to Web Development",
    userName: "Student User",
    completionDate: "2024-12-15T10:30:00Z",
    certificateUrl: "/certificates/cert-1.pdf",
  },
  {
    id: "cert-2",
    courseId: "2",
    courseName: "React Fundamentals",
    userName: "Student User",
    completionDate: "2024-11-20T14:00:00Z",
    certificateUrl: "/certificates/cert-2.pdf",
  },
  {
    id: "cert-3",
    courseId: "3",
    courseName: "TypeScript Essentials",
    userName: "Student User",
    completionDate: "2024-10-05T09:15:00Z",
    certificateUrl: "/certificates/cert-3.pdf",
  },
];

export default function CertificatesPage() {
  const t = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/signin");
      return;
    }

    // Load certificates (using mock data for now)
    const timer = setTimeout(() => {
      const user = authService.getUser();
      if (user) {
        // Update certificates with actual user name
        const userCertificates = mockCertificates.map((cert) => ({
          ...cert,
          userName: `${user.firstName} ${user.lastName}`,
        }));
        setCertificates(userCertificates);
      } else {
        setCertificates(mockCertificates);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setDialogOpen(true);
  };

  const handleDownload = () => {
    // In a real app, this would download the actual certificate PDF
    alert("Certificate download started!");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="bg-muted rounded-lg h-96 animate-pulse" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.dashboard.certificates}</h1>
          <p className="text-muted-foreground">
            {t.dashboard.viewDownloadCertificates}
          </p>
        </div>

        {certificates.length === 0 ? (
          /* Empty State */
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">{t.dashboard.noCertificates}</h3>
              <p className="text-muted-foreground mb-6">
                {t.dashboard.completeCourses}
              </p>
              <Link href="/dashboard/courses">
                <Button className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  {t.courses.allCourses}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Certificates Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <Card
                key={certificate.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewCertificate(certificate)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2 line-clamp-2">
                    {certificate.courseName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t.certificate.completedOn}{" "}
                    {new Date(certificate.completionDate).toLocaleDateString()}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                  >
                    <Download className="w-4 h-4" />
                    {t.certificate.download}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Certificate Viewer Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{t.certificate.title}</DialogTitle>
            </DialogHeader>
            {selectedCertificate && (
              <CertificateViewer
                certificate={selectedCertificate}
                onDownload={handleDownload}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
