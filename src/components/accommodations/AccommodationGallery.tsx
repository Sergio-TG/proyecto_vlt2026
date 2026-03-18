
"use client"

import * as React from "react"
import { X } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"

interface AccommodationGalleryProps {
  images: string[]
  title: string
}

export function AccommodationGallery({ images, title }: AccommodationGalleryProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [initialSlide, setInitialSlide] = React.useState(0)

  const openLightbox = (index: number) => {
    setInitialSlide(index)
    setIsOpen(true)
  }

  // Handle escape key to close lightbox
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      // Prevent scrolling when lightbox is open
      document.body.style.overflow = "hidden"
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900">Galería de Fotos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((img, index) => (
            <div 
              key={index} 
              className={`relative rounded-xl overflow-hidden shadow-md group cursor-pointer ${index === 0 ? 'md:col-span-2 aspect-video' : 'aspect-[4/3]'}`}
              onClick={() => openLightbox(index)}
            >
              <img 
                src={img} 
                alt={`${title} - Foto ${index + 1}`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="bg-white/90 text-black px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm">
                  Ver foto completa
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-12">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-50 rounded-full h-12 w-12"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-8 w-8" />
            <span className="sr-only">Cerrar</span>
          </Button>

          <Carousel
            opts={{
              align: "start",
              loop: true,
              startIndex: initialSlide,
            }}
            className="w-full max-w-5xl max-h-[90vh]"
          >
            <CarouselContent>
              {images.map((img, index) => (
                <CarouselItem key={index} className="flex items-center justify-center h-[80vh]">
                  <img
                    src={img}
                    alt={`${title} - Foto ${index + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 md:-left-12 bg-white/10 hover:bg-white/20 text-white border-none h-12 w-12" />
            <CarouselNext className="right-2 md:-right-12 bg-white/10 hover:bg-white/20 text-white border-none h-12 w-12" />
          </Carousel>
          
          <div className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm">
            Presiona ESC para cerrar
          </div>
        </div>
      )}
    </>
  )
}
