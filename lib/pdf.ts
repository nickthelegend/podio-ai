import { jsPDF } from 'jspdf';
import { Slide, BrandKit } from './slidesStore';

export const exportSlidesToPDF = async (
  slides: Slide[],
  topic: string,
  format: '16:9' | '4:5' | '9:16' = '16:9',
  brand?: BrandKit | null
) => {
  // Dimensions map
  const dimensions = {
    '16:9': { w: 1280, h: 720 },
    '4:5': { w: 1080, h: 1350 },
    '9:16': { w: 720, h: 1280 }
  };

  const { w, h } = dimensions[format];
  const orientation = format === '16:9' ? 'landscape' : 'portrait';

  // Initialize jsPDF
  const doc = new jsPDF({
    orientation: orientation as any,
    unit: 'px',
    format: [w, h]
  });

  try {
    for (let i = 0; i < slides.length; i++) {
      if (i > 0) doc.addPage([w, h], orientation as any);

      const slide = slides[i];

      // Background
      doc.setFillColor(slide.backgroundColor || '#ffffff');
      doc.rect(0, 0, w, h, 'F');

      // Text Color
      doc.setTextColor(slide.textColor || '#000000');

      // Title
      doc.setFontSize(format === '9:16' ? 48 : 64);
      doc.setFont('helvetica', 'bold');

      const titleLines = doc.splitTextToSize(slide.title, w - 100);
      const titleY = format === '16:9' ? h * 0.2 : h * 0.15;
      doc.text(titleLines, w / 2, titleY, { align: 'center' });

      // Content
      doc.setFontSize(format === '9:16' ? 24 : 32);
      doc.setFont('helvetica', 'normal');

      let contentY = titleY + (titleLines.length * (format === '9:16' ? 60 : 80));

      slide.bullets.forEach((bullet) => {
        const bulletLines = doc.splitTextToSize(`• ${bullet}`, w - 120);
        doc.text(bulletLines, 60, contentY);
        contentY += bulletLines.length * (format === '9:16' ? 30 : 40) + 20;
      });

      // Footer (Slide Number)
      doc.setFontSize(14);
      doc.text(`${i + 1} / ${slides.length}`, w - 40, h - 30, { align: 'right' });

      // Branding/Footer for 4:5
      if (format === '4:5') {
        doc.setFontSize(12);
        doc.setTextColor('#888888');
        doc.text('Swipe for more ->', w / 2, h - 30, { align: 'center' });
      }

      // Brand Mark
      if (brand?.name) {
        doc.setFontSize(12);
        doc.setTextColor(brand.primaryColor || '#888888');
        doc.text(brand.name, 40, h - 30, { align: 'left' });
      }
    }

    doc.save(`${topic.replace(/\s+/g, '_')}_${format.replace(':', '-')}.pdf`);
  } catch (error) {
    console.error('PDF Export Failed:', error);
    throw error;
  }
};
