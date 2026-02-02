import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Eraser,
  RotateCcw,
  Upload,
  PenTool,
  Type,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onCancel: () => void;
  className?: string;
}

export function SignaturePad({
  onSave,
  onCancel,
  className,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState("#1e40af");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [typedName, setTypedName] = useState("");
  const [selectedFont, setSelectedFont] = useState("cursive");

  const colors = [
    { name: "Xanh dương", value: "#1e40af" },
    { name: "Đen", value: "#000000" },
    { name: "Xanh đậm", value: "#1e3a5f" },
  ];

  const fonts = [
    {
      name: "Chữ viết tay",
      value: "cursive",
      style: "'Dancing Script', cursive",
    },
    { name: "Thanh lịch", value: "elegant", style: "'Great Vibes', cursive" },
    { name: "Đơn giản", value: "simple", style: "'Caveat', cursive" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Set initial styles
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Fill white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
  }, [strokeColor, strokeWidth]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (type: "draw" | "upload" | "type") => {
    let signatureData = "";

    if (type === "draw") {
      const canvas = canvasRef.current;
      if (canvas) {
        signatureData = canvas.toDataURL("image/png");
      }
    } else if (type === "upload" && uploadedImage) {
      signatureData = uploadedImage;
    } else if (type === "type" && typedName) {
      // Create a canvas with typed signature
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 400;
      tempCanvas.height = 150;
      const ctx = tempCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        const font = fonts.find((f) => f.value === selectedFont);
        ctx.font = `48px ${font?.style || "cursive"}`;
        ctx.fillStyle = strokeColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(typedName, tempCanvas.width / 2, tempCanvas.height / 2);

        signatureData = tempCanvas.toDataURL("image/png");
      }
    }

    if (signatureData) {
      onSave(signatureData);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs defaultValue="draw" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="draw" className="gap-2">
            <PenTool className="h-4 w-4" />
            Vẽ tay
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Tải lên
          </TabsTrigger>
          <TabsTrigger value="type" className="gap-2">
            <Type className="h-4 w-4" />
            Nhập tên
          </TabsTrigger>
        </TabsList>

        {/* Draw Tab */}
        <TabsContent value="draw" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Màu:</Label>
              {colors.map((color) => (
                <button
                  key={color.value}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all",
                    strokeColor === color.value
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-transparent",
                  )}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setStrokeColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 flex-1 max-w-32">
              <Label className="text-sm whitespace-nowrap">Nét:</Label>
              <Slider
                value={[strokeWidth]}
                onValueChange={(value) => setStrokeWidth(value[0])}
                min={1}
                max={5}
                step={1}
              />
            </div>
            <Button variant="outline" size="sm" onClick={clearCanvas}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Xóa
            </Button>
          </div>

          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              className="w-full h-40 cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Sử dụng chuột hoặc ngón tay để vẽ chữ ký
          </p>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button className="flex-1" onClick={() => handleSave("draw")}>
              <Check className="h-4 w-4 mr-2" />
              Sử dụng chữ ký
            </Button>
          </div>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center">
            {uploadedImage ? (
              <div className="space-y-4">
                <Image
                  src={uploadedImage as string}
                  alt="Uploaded signature"
                  className="max-h-32 mx-auto object-contain"
                  width={256}
                  height={128}
                  unoptimized
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadedImage(null)}
                >
                  <Eraser className="h-4 w-4 mr-1" />
                  Xóa
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Nhấn để tải lên</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG (tối đa 5MB)
                </p>
              </label>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleSave("upload")}
              disabled={!uploadedImage}
            >
              <Check className="h-4 w-4 mr-2" />
              Sử dụng ảnh
            </Button>
          </div>
        </TabsContent>

        {/* Type Tab */}
        <TabsContent value="type" className="space-y-4">
          <div className="space-y-2">
            <Label>Nhập tên của bạn</Label>
            <Input
              placeholder="Nguyễn Văn A"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Chọn kiểu chữ</Label>
            <div className="grid grid-cols-3 gap-2">
              {fonts.map((font) => (
                <button
                  key={font.value}
                  className={cn(
                    "p-3 border-2 rounded-lg text-center transition-all",
                    selectedFont === font.value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/30",
                  )}
                  onClick={() => setSelectedFont(font.value)}
                >
                  <span
                    className="text-xl"
                    style={{
                      fontFamily: font.style,
                      color: strokeColor,
                    }}
                  >
                    {typedName || "Tên"}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {font.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-white text-center">
            <span
              className="text-3xl"
              style={{
                fontFamily: fonts.find((f) => f.value === selectedFont)?.style,
                color: strokeColor,
              }}
            >
              {typedName || "Xem trước chữ ký"}
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleSave("type")}
              disabled={!typedName}
            >
              <Check className="h-4 w-4 mr-2" />
              Sử dụng chữ ký
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
