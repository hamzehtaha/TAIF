import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { Certificate } from "@/services/certificate.service";

interface CertificateViewerProps {
  certificate: Certificate;
  onDownload?: () => void;
}

export function CertificateViewer({
  certificate,
  onDownload,
}: CertificateViewerProps) {
  const t = useTranslation();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Certificate",
        text: `I completed the ${certificate.courseName} course on SELS!`,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Certificate Display */}
      <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border-2 border-primary p-8 aspect-video flex flex-col items-center justify-center min-h-[400px]">
        {/* Certificate Content */}
        <div className="text-center space-y-4 w-full">
          {/* SELS Logo */}
          <div className="text-5xl font-bold text-primary mb-8">SELS</div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-foreground">
            {t.certificate.title}
          </h1>

          {/* Divider */}
          <div className="w-24 h-1 bg-primary mx-auto"></div>

          {/* Message */}
          <div className="space-y-2">
            <p className="text-foreground text-lg">
              {t.certificate.thisIs}
            </p>
            <p className="text-primary font-bold text-2xl">
              {certificate.userName}
            </p>
            <p className="text-foreground">
              {t.certificate.hasCompleted}
            </p>
            <p className="text-accent font-bold text-xl">
              {certificate.courseName}
            </p>
          </div>

          {/* Date */}
          <div className="text-sm text-muted-foreground">
            {t.certificate.completedOn} {new Date(certificate.completionDate).toLocaleDateString()}
          </div>

          {/* Footer Message */}
          <div className="text-xs text-muted-foreground max-w-xs mx-auto">
            {t.certificate.celebrateMessage}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <Button
          onClick={onDownload}
          className="flex-1 gap-2"
        >
          <Download className="w-4 h-4" />
          {t.dashboard.downloadCertificate}
        </Button>
        <Button
          variant="outline"
          onClick={handleShare}
          className="flex-1 gap-2"
        >
          <Share2 className="w-4 h-4" />
          {t.certificate.share}
        </Button>
      </div>
    </div>
  );
}
