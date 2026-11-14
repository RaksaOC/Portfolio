// Shared state for the project image viewer (ImageLightbox.vue, mounted once in App.vue).
import { reactive } from 'vue'

export const lightbox = reactive({
  open: false,
  images: [],
  index: 0,
  title: '',
  project: null, // project shown alongside the cover (first) image, with its details panel
  origin: null, // DOMRect of the thumbnail it opened from (the genie pours out of / back into it)
})

/** Open `images` at `index`, growing out of the clicked element. */
export function openLightbox(images, index, fromEl, title = '', project = null) {
  if (!images?.length) return
  lightbox.images = images
  lightbox.index = Math.max(0, Math.min(index, images.length - 1))
  lightbox.title = title
  lightbox.project = project
  lightbox.origin = fromEl?.getBoundingClientRect?.() || null
  lightbox.open = true
}

/** A project's slides: its cover first (shown with the project's details), then the other screenshots. */
export function projectSlides(project) {
  const cover = project.mainImage || (Array.isArray(project.image) ? project.image[0] : null)
  const rest = Array.isArray(project.image) ? project.image : []
  return [...new Set([cover, ...rest].filter(Boolean))]
}

/** Open a project in the viewer at `src` (default: its cover). */
export function openProject(project, fromEl, src = null) {
  const slides = projectSlides(project)
  openLightbox(slides, Math.max(0, src ? slides.indexOf(src) : 0), fromEl, project.title, project)
}
