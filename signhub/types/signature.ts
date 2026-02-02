// Cấu trúc dữ liệu tọa độ chữ ký để gửi lên Backend
export interface SignaturePosition {
  id: string;
  pageNumber: number;
  // Tọa độ tương đối (0-1) so với kích thước trang PDF gốc
  // Điều này đảm bảo tọa độ chính xác bất kể zoom level hay độ phân giải màn hình
  xCoordinate: number; // 0-1 relative to page width
  yCoordinate: number; // 0-1 relative to page height
  width: number; // Relative width (0-1)
  height: number; // Relative height (0-1)
  type: SignatureElementType;
}

export type SignatureElementType =
  | "VISUAL_SIGNATURE"
  | "STAMP"
  | "DATE"
  | "NAME"
  | "TEXT";

// Dữ liệu chữ ký nội bộ (với pixel coordinates cho UI)
export interface SignatureElement {
  id: string;
  pageNumber: number;
  x: number; // Pixel position on current view
  y: number;
  width: number; // Pixel width
  height: number;
  type: SignatureElementType;
}

// Cấu hình công cụ ký
export interface SigningTool {
  id: SignatureElementType;
  icon: string;
  label: string;
  defaultWidth: number;
  defaultHeight: number;
}

// PDF Page dimensions for coordinate calculation
export interface PDFPageDimensions {
  originalWidth: number;
  originalHeight: number;
  scaledWidth: number;
  scaledHeight: number;
  scale: number;
}

// JSON output structure for Backend API
export interface SignaturePositionOutput {
  pageNumber: number;
  xCoordinate: number;
  yCoordinate: number;
  width: number;
  height: number;
  type: SignatureElementType;
}

// Function to convert UI coordinates to relative coordinates
export function convertToRelativePosition(
  element: SignatureElement,
  pageDimensions: PDFPageDimensions,
): SignaturePositionOutput {
  return {
    pageNumber: element.pageNumber,
    xCoordinate: element.x / pageDimensions.scaledWidth,
    yCoordinate: element.y / pageDimensions.scaledHeight,
    width: element.width / pageDimensions.scaledWidth,
    height: element.height / pageDimensions.scaledHeight,
    type: element.type,
  };
}

// Function to convert relative coordinates back to UI coordinates
export function convertToPixelPosition(
  position: SignaturePositionOutput,
  pageDimensions: PDFPageDimensions,
): SignatureElement {
  return {
    id: crypto.randomUUID(),
    pageNumber: position.pageNumber,
    x: position.xCoordinate * pageDimensions.scaledWidth,
    y: position.yCoordinate * pageDimensions.scaledHeight,
    width: position.width * pageDimensions.scaledWidth,
    height: position.height * pageDimensions.scaledHeight,
    type: position.type,
  };
}
