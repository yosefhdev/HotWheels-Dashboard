

import { Button } from '@/components/ui/button'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback } from 'react'

const carData = [
    {
        id: "1",
        marca: "Toyota",
        modelo: "Corolla",
        version: "LE",
        anio: 2023,
        color: "#FF0000",
        image_url: "https://img.asmedia.epimg.net/resizer/v2/P24KNJ2V4VAHXFYOCY35F5G57A.jpg?auth=0e439f9bd4ca9ba6b99f6e42cccc8c82f010632ffdb642869841e9ff148f531f&width=1472&height=828&focal=976%2C427",
        tipo: "Básico"
    },
    {
        id: "2",
        marca: "Ford",
        modelo: "Mustang",
        version: "GT",
        anio: 2022,
        color: "#0000FF",
        image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8H_G9BnlFsb_w5cx_pEXhSb-vSf0ct7zzRGrOjEv-zA3vH3aVak6WXjFC3gdN6KKcfxM&usqp=CAU",
        tipo: "Premium"
    },
    {
        id: "3",
        marca: "Honda",
        modelo: "Civic",
        version: "Sport",
        anio: 2023,
        color: "#00FF00",
        image_url: "https://img.remediosdigitales.com/ba2fee/honda-civic-type-r-2023-4/1366_2000.jpeg",
        tipo: "Básico"
    },
    {
        id: "4",
        marca: "BMW",
        modelo: "X5",
        version: "xDrive40i",
        anio: 2022,
        color: "#000000",
        image_url: "https://cdn.buttercms.com/3Yp573tPRHym9jqQkrLa",
        tipo: "Premium"
    },
    {
        id: "5",
        marca: "Chevrolet",
        modelo: "Camaro",
        version: "SS",
        anio: 2023,
        color: "#FFFF00",
        image_url: "https://es.valleychevy.com/wp-content/uploads/2021/11/22Camaro-gallery3.jpg",
        tipo: "Premium"
    },
    {
        id: "6",
        marca: "Nissan",
        modelo: "Altima",
        version: "SV",
        anio: 2022,
        color: "#808080",
        image_url: "https://www.autosur.mx/resourcefiles/blogsmallimages/nissan-altima-2022-precio.png",
        tipo: "Básico"
    },
    {
        id: "7",
        marca: "Mercedes-Benz",
        modelo: "C-Class",
        version: "C300",
        anio: 2023,
        color: "#FFFFFF",
        image_url: "https://media.ed.edmunds-media.com/mercedes-benz/c-class/2023/oem/2023_mercedes-benz_c-class_sedan_amg-c-43_fq_oem_1_1600.jpg",
        tipo: "Premium"
    },
    {
        id: "8",
        marca: "Volkswagen",
        modelo: "Golf",
        version: "GTI",
        anio: 2022,
        color: "#FF00FF",
        image_url: "https://acnews.blob.core.windows.net/imgnews/medium/NAZ_a9e1ff8fbe54453c9dc94b36a97af934.jpg",
        tipo: "Básico"
    },
    {
        id: "9",
        marca: "Audi",
        modelo: "A4",
        version: "Premium",
        anio: 2023,
        color: "#800000",
        image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRYepU29X8pKsgN3-RV1UutK9lCZ57ucXPrQ&s",
        tipo: "Premium"
    },
    {
        id: "10",
        marca: "Hyundai",
        modelo: "Elantra",
        version: "SEL",
        anio: 2022,
        color: "#008080",
        image_url: "https://docs.spm247.com/ftpcs/2022/Hyundai/Elantra/2022HyundaiElantra-exterior-01.jpg",
        tipo: "Básico"
    }
];

export default function Carrusel() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()])

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])
    return (
        <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {carData.map((car) => (
                        <div className="flex-[0_0_100%] min-w-0 relative" key={car.id}>
                            <img
                                src={car.image_url}
                                alt={`${car.marca} ${car.modelo}`}
                                className="w-full h-[400px] object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                                <h2 className="text-2xl font-bold">{car.marca} {car.modelo}</h2>
                                <p className="text-lg">{car.version} - {car.anio}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75"
                onClick={scrollPrev}
            >
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75"
                onClick={scrollNext}
            >
                <ChevronRight className="h-6 w-6" />
            </Button>
        </div>
    )
}