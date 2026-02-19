import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export function QrScanner({ onScan, onError }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanner = async () => {
    try {
      setCameraError(null);
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          scanner.stop().catch(() => {});
          setIsScanning(false);
        },
        () => {
          // Ignore scan failures (e.g. no QR detected in frame)
        },
      );
      setIsScanning(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "카메라를 사용할 수 없습니다.";
      setCameraError(message);
      onError?.(message);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div
        id="qr-reader"
        ref={containerRef}
        className="w-full overflow-hidden rounded-lg bg-muted"
        style={{ minHeight: isScanning ? "300px" : "0px" }}
      />

      {cameraError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <CameraOff className="inline size-4 mr-1.5" />
          {cameraError}
        </div>
      )}

      {!isScanning ? (
        <Button onClick={startScanner} className="w-full">
          <Camera className="size-4 mr-2" />
          카메라로 QR 스캔
        </Button>
      ) : (
        <Button variant="outline" onClick={stopScanner} className="w-full">
          <CameraOff className="size-4 mr-2" />
          스캔 중지
        </Button>
      )}
    </div>
  );
}
