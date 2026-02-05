import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Slide } from './slidesStore';

export const exportSlidesToPDF = async (slides: Slide[], topic: string) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [1280, 720] // Match our slide aspect ratio
  });

  // Create a hidden container to render slides
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  document.body.appendChild(container);

  try {
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      
      // Create DOM element for the slide
      const slideEl = document.createElement('div');
      slideEl.style.width = '1280px';
      slideEl.style.height = '720px';
      slideEl.style.backgroundColor = slide.backgroundColor;
      slideEl.style.color = slide.textColor;
      slideEl.style.display = 'flex';
      slideEl.style.flexDirection = 'column';
      slideEl.style.alignItems = 'center';
      slideEl.style.justifyContent = 'center';
      slideEl.style.padding = '64px';
      slideEl.style.fontFamily = 'sans-serif'; // Use system font for reliable rendering

      const title = document.createElement('h1');
      title.innerText = slide.title;
      title.style.fontSize = '64px';
      title.style.fontWeight = 'bold';
      title.style.marginBottom = '48px';
      title.style.textAlign = 'center';
      slideEl.appendChild(title);

      const ul = document.createElement('ul');
      ul.style.textAlign = 'left';
      
      slide.bullets.forEach(bullet => {
        const li = document.createElement('li');
        li.innerText = bullet;
        li.style.fontSize = '32px';
        li.style.marginBottom = '16px';
        li.style.listStyleType = 'disc';
        ul.appendChild(li);
      });
      slideEl.appendChild(ul);

      container.appendChild(slideEl);

      // Capture
      const canvas = await html2canvas(slideEl, { scale: 1 });
      const imgData = canvas.toDataURL('image/png');

      if (i > 0) doc.addPage([1280, 720], 'landscape');
      doc.addImage(imgData, 'PNG', 0, 0, 1280, 720);
      
      container.removeChild(slideEl);
    }

    doc.save(`${topic.replace(/\s+/g, '_')}_presentation.pdf`);
  } catch (error) {
    console.error('PDF Export Failed:', error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
};
