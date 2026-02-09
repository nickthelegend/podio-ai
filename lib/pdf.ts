import { jsPDF } from 'jspdf';
import { EnhancedSlide, BrandKit } from './slidesStore';

export const exportSlidesToPDF = async (
  slides: EnhancedSlide[],
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
    format: [w, h],
    hotfixes: ['px_scaling']
  });

  try {
    for (let i = 0; i < slides.length; i++) {
      if (i > 0) doc.addPage([w, h], orientation as any);

      const slide = slides[i];

      // Background
      const bgColor = slide.backgroundColor || '#0a0a0f';
      doc.setFillColor(bgColor);
      doc.rect(0, 0, w, h, 'F');

      // Decorative Gradient (Simplified as 2 rectangles)
      const accentColor = brand?.primaryColor || slide.accentColor || '#ec4899';
      doc.setFillColor(accentColor);
      doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
      doc.circle(w, 0, 400, 'F');
      doc.setGState(new (doc as any).GState({ opacity: 1.0 }));

      // Text Color
      const textColor = slide.textColor || '#ffffff';
      doc.setTextColor(textColor);

      // Title
      doc.setFontSize(format === '9:16' ? 44 : 56);
      doc.setFont('helvetica', 'bold');

      const titleLines = doc.splitTextToSize(slide.title, w - 160);
      const isTitleLayout = slide.layoutType === 'title' || slide.layoutType === 'conclusion';
      const titleY = isTitleLayout ? h * 0.4 : (format === '16:9' ? h * 0.25 : h * 0.15);
      doc.text(titleLines, w / 2, titleY, { align: 'center' });

      let currentY = titleY + (titleLines.length * (format === '9:16' ? 50 : 70));

      if (slide.layoutType === 'statistics' && slide.bullets && slide.bullets.length > 0) {
        // Statistics Grid
        const itemW = (w - 200) / 2;
        slide.bullets.slice(0, 4).forEach((stat, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const x = 100 + col * itemW + itemW / 2;
          const y = currentY + row * 120;

          const colonIndex = stat.indexOf(':');
          let value = stat;
          let label = '';
          if (colonIndex > 0) {
            value = stat.substring(0, colonIndex).trim();
            label = stat.substring(colonIndex + 1).trim();
          }

          doc.setFontSize(40);
          doc.setTextColor(accentColor);
          doc.text(value, x, y, { align: 'center' });

          if (label) {
            doc.setFontSize(16);
            doc.setTextColor(`${textColor}80`);
            doc.text(doc.splitTextToSize(label, itemW - 20), x, y + 25, { align: 'center' });
          }
        });
      } else if (slide.layoutType === 'conclusion') {
        // Conclusion Tags
        if (slide.bullets && slide.bullets.length > 0) {
          doc.setFontSize(18);
          let tagX = 100;
          slide.bullets.forEach((tag) => {
            const tagW = doc.getTextWidth(tag) + 40;
            if (tagX + tagW > w - 100) {
              tagX = 100;
              currentY += 50;
            }
            doc.setFillColor(`${textColor}15`);
            doc.roundedRect(tagX, currentY, tagW, 40, 20, 20, 'F');
            doc.setTextColor(textColor);
            doc.text(tag, tagX + 20, currentY + 25);
            tagX += tagW + 15;
          });
        }
      } else {
        // Default / Content Layout
        // Subtitle / Description
        const subContent = slide.subtitle || slide.description;
        if (subContent) {
          doc.setFontSize(format === '9:16' ? 24 : 32);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(`${textColor}cc`); // Slightly transparent
          const subLines = doc.splitTextToSize(subContent, w - 200);
          doc.text(subLines, w / 2, currentY, { align: 'center' });
          currentY += subLines.length * (format === '9:16' ? 35 : 45) + 30;
        }

        // Bullets
        if (slide.bullets && slide.bullets.length > 0) {
          doc.setFontSize(format === '9:16' ? 20 : 28);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(textColor);

          slide.bullets.forEach((bullet: string) => {
            const bulletLines = doc.splitTextToSize(`• ${bullet}`, w - 240);
            doc.text(bulletLines, 120, currentY);
            currentY += bulletLines.length * (format === '9:16' ? 30 : 40) + 15;
          });
        }
      }

      // Footer (Slide Number)
      doc.setFontSize(14);
      doc.setTextColor(`${textColor}80`);
      doc.text(`${i + 1} / ${slides.length}`, w - 60, h - 40, { align: 'right' });

      // Brand Mark
      if (brand?.name) {
        doc.setFontSize(14);
        doc.setTextColor(brand.primaryColor || '#ec4899');
        doc.text(brand.name.toUpperCase(), 60, h - 40, { align: 'left' });
      }
    }

    doc.save(`${topic.replace(/\s+/g, '_')}_presentation.pdf`);
  } catch (error) {
    console.error('PDF Export Failed:', error);
    throw error;
  }
};
