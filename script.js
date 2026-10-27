'use strict';

const motionToggle = document.getElementById('motion-toggle');
const systemReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let manualReducedMotion = document.documentElement.dataset.reduceMotion === 'true';
function syncMotionPreference() {
  const reduce = systemReducedMotion.matches || manualReducedMotion;
  document.documentElement.dataset.reduceMotion = String(reduce);
  motionToggle.setAttribute('aria-pressed', String(reduce));
  motionToggle.disabled = systemReducedMotion.matches;
  motionToggle.textContent = systemReducedMotion.matches ? 'Movimento reduzido no dispositivo' : 'Reduzir movimento';
}
motionToggle.addEventListener('click', () => {
  manualReducedMotion = !manualReducedMotion;
  try { localStorage.setItem('regis-reduce-motion', String(manualReducedMotion)); } catch {}
  syncMotionPreference();
});
systemReducedMotion.addEventListener('change', syncMotionPreference);
syncMotionPreference();

const projects = {
  joalheria: {
    title: 'Joalheria',
    video: 'assets/projeto-01-720p-sem-audio.mp4',
    poster: 'assets/joalheria-projeto.webp',
    images: [
      {src: 'assets/joalheria-projeto.webp', label: 'Vista geral'},
      {src: 'assets/joalheria-expositor.webp', label: 'Expositor'},
      {src: 'assets/joalheria-bancada.webp', label: 'Bancadas e exposição'},
      {src: 'assets/joalheria-cafe.webp', label: 'Área de apoio'}
    ]
  },
  boutique: {
    title: 'Boutique feminina',
    video: 'assets/projeto-02-720p-sem-audio.mp4',
    poster: 'assets/boutique-vista-loja.webp',
    images: [
      {src: 'assets/boutique-vista-loja.webp', label: 'Vista em direção à vitrine'},
      {src: 'assets/boutique-provadores.webp', label: 'Provadores'},
      {src: 'assets/boutique-balcao.webp', label: 'Balcão de atendimento'},
      {src: 'assets/boutique-exposicao.webp', label: 'Exposição de roupas'},
      {src: 'assets/boutique-circulacao.webp', label: 'Circulação e exposição'},
      {src: 'assets/boutique-recepcao.webp', label: 'Detalhe da recepção'}
    ]
  }
};

// Somente relatos reais aprovados entram nesta coleção.
// A seção e sua navegação permanecem ausentes quando não há material.
const testimonials = [];
if (testimonials.length) {
  const section = document.getElementById('depoimentos');
  const list = document.getElementById('testimonial-list');
  testimonials.forEach(({quote, name}) => {
    const figure = document.createElement('figure');
    const blockquote = document.createElement('blockquote');
    const caption = document.createElement('figcaption');
    blockquote.textContent = quote;
    caption.textContent = name;
    figure.append(blockquote, caption);
    list.append(figure);
  });
  section.hidden = false;
}

const gallery = document.getElementById('gallery-dialog');
const galleryImage = document.getElementById('gallery-image');
const galleryTitle = document.getElementById('gallery-title');
const galleryCaption = document.getElementById('gallery-caption');
const previous = document.getElementById('gallery-prev');
const next = document.getElementById('gallery-next');
const videoDialog = document.getElementById('video-dialog');
const video = document.getElementById('project-video');
let activeProject = null;
let activeIndex = 0;
let imageRequest = 0;
let returnFocus = null;

function openDialog(dialog, trigger) {
  returnFocus = trigger;
  document.body.classList.add('modal-open');
  dialog.showModal();
  dialog.querySelector('.close-dialog').focus();
}

function showImage(index) {
  const project = projects[activeProject];
  if (!project || index < 0 || index >= project.images.length) return;
  activeIndex = index;
  const item = project.images[index];
  const request = ++imageRequest;
  previous.disabled = index === 0;
  next.disabled = index === project.images.length - 1;
  galleryTitle.textContent = project.title;
  galleryCaption.textContent = `${index + 1} de ${project.images.length} | ${item.label}`;
  const incoming = new Image();
  incoming.onload = () => {
    if (request !== imageRequest) return;
    galleryImage.classList.remove('image-changed');
    galleryImage.src = item.src;
    galleryImage.alt = `${project.title}: ${item.label}. Visualização 3D do projeto de Regis Carvalho.`;
    void galleryImage.offsetWidth;
    galleryImage.classList.add('image-changed');
  };
  incoming.onerror = () => {
    if (request === imageRequest) galleryCaption.textContent = 'Não foi possível carregar esta imagem. Tente outra vista.';
  };
  incoming.src = item.src;
}

document.querySelectorAll('[data-gallery]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    activeProject = link.dataset.gallery;
    galleryImage.removeAttribute('src');
    galleryImage.alt = '';
    showImage(Number(link.dataset.index));
    openDialog(gallery, link);
  });
});
previous.addEventListener('click', () => showImage(activeIndex - 1));
next.addEventListener('click', () => showImage(activeIndex + 1));
gallery.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showImage(activeIndex + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});

document.querySelectorAll('[data-video]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const project = projects[link.dataset.video];
    document.getElementById('video-title').textContent = project.title;
    video.src = project.video;
    video.poster = project.poster;
    video.setAttribute('aria-label', `Vídeo do projeto: ${project.title}`);
    video.load();
    openDialog(videoDialog, link);
  });
});

[gallery, videoDialog].forEach(dialog => {
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (dialog === videoDialog) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    if (dialog === gallery) imageRequest++;
    returnFocus?.focus({preventScroll: true});
  });
});

const mobileMenu = document.querySelector('.mobile-menu');
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { mobileMenu.open = false; }));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mobileMenu.open) {
    mobileMenu.open = false;
    mobileMenu.querySelector('summary').focus();
  }
});

const motionTarget = document.querySelector('.detail-motion');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-seen');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: .2});
  observer.observe(motionTarget);
}
