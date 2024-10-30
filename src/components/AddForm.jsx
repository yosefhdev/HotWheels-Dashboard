/* eslint-disable react/prop-types */
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/db/supabase"
import { Calendar, Car, Palette, PenSquare, Plus, Tag, Link } from 'lucide-react'
import { useEffect, useState } from "react"
import Loader2 from "./Loader2"

const convertToWebP = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/webp', 0.8); // El último parámetro ajusta la calidad (0.8 es un buen balance)
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};


function AddForm({ setNotification, errors, setErrors, setActiveTab, validateCar, addCarToList }) {

    const [newCar, setNewCar] = useState({ brand: '', model: '', version: '', year: '', color: '#000000', tipo: '', addedDate: new Date(), image_url: '', image_path: '' })
    const [marcas, setMarcas] = useState()
    const [marcaToAdd, setMarcaToAdd] = useState("")
    const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getMarcas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const addCar = async () => {
        setLoading(true)
        const newErrors = validateCar(newCar)
        if (Object.keys(newErrors).length === 0) {

            let imagePath = '';
            let imageUrl = '';

            // Subir la nueva imagen si se seleccionó un archivo
            if (imageFile) {
                try {
                    // Convertir a WebP y obtener el Blob
                    const webpBlob = await convertToWebP(imageFile);
                    const fileName = `auto_${newCar.brand}_${newCar.model}_${Date.now()}.webp`;

                    // Subir la imagen
                    const { data, error } = await supabase.storage
                        .from('auto_images') // Asegúrate de que el bucket existe
                        .upload(`${fileName}`, webpBlob);

                    if (error) {
                        setLoading(false)
                        console.error('Error al subir la imagen:', error.message);
                        setNotification({ message: 'Error al subir la imagen', success: false });
                        return;
                    }

                    // Guardar el path de la imagen
                    imagePath = data.path; // Asignar el path del archivo subido
                    console.log("🚀 ~ addCar ~ imagePath:", imagePath)

                    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                    // Crear la URL pública para mostrar la imagen
                    imageUrl = `${supabaseUrl}/storage/v1/object/public/auto_images/${imagePath}`;

                } catch (error) {
                    setLoading(false)
                    setNotification({ message: 'Error al convertir la imagen a WebP: ' + error, success: false });
                    return;
                }
            }

            const { data, error } = await supabase
                .from('cars')
                .insert([{
                    created_at: new Date(),
                    marca: newCar.brand,
                    modelo: newCar.model,
                    version: newCar.version,
                    anio: newCar.year,
                    tipo: newCar.tipo,
                    color: newCar.color,
                    image_url: imageUrl,  // URL pública para mostrar la imagen
                    image_path: imagePath, // Path en el bucket para gestión de imágenes
                }])
                .select()

            if (data && data.length > 0) {
                setLoading(false)
                setNotification({ message: 'Coche añadido con éxito', success: true })
                addCarToList(data[0])
                setNewCar({ brand: '', model: '', version: '', year: '', color: '#000000', tipo: '', addedDate: new Date(), image: null })
                setActiveTab('home')
            }

            if (error) {
                setLoading(false)
                setNotification({ message: 'Error al añadir coche', success: false })
            }
            setLoading(false)
        } else {
            setLoading(false)
            setErrors(newErrors)
        }
    }

    const getMarcas = async () => {
        try {
            let { data: marcas, error } = await supabase
                .from('marcas')
                .select('*')

            if (marcas) {
                setMarcas(marcas)
            } else {
                setMarcas(null)
            }

            if (error) {
                console.log("Error al obtener marcas: " + error)
            }
        } catch (e) {
            setNotification({ message: 'No se puedieron obtener las marcas: ' + e, success: false })
        }
    }

    const addMarca = async () => {
        setLoading(true)
        if (marcaToAdd === '') {
            setNotification({ message: 'Ingrese el nombre de la marca', success: false })
            setLoading(false)
            return
        }

        try {
            const { data, error } = await supabase
                .from('marcas')
                .insert([
                    { marca: marcaToAdd },
                ])
                .select()

            if (data) {
                setIsAddBrandModalOpen(false)
                setNotification({ message: 'Marca añadida con éxito', success: true })
                getMarcas()
            } else {
                setNotification({ message: 'La marca no se puso agregar: ' + error, success: true })
            }
            setLoading(false)
        } catch (e) {
            setLoading(false)
            setNotification({ message: 'No se pudo agregar la marca: ' + e, success: false })
        }
        setLoading(false)
    }

    return (
        <div>
            {loading && <Loader2 />}
            <div className="flex flex-col items-center space-y-4"            >
                <Card className={"max-w-3xl w-full"}>
                    <CardHeader>
                        <CardTitle>Agregar Nuevo Auto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => { e.preventDefault(); addCar(); }} className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Car className="h-4 w-4" />
                                <Select
                                    onValueChange={(value) => setNewCar({ ...newCar, brand: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Marca" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Mapear las marcas obtenidas */}
                                        {marcas ? marcas.map((marca) => (
                                            <SelectItem key={marca.id} value={marca.marca}>
                                                {marca.marca}
                                            </SelectItem>
                                        )) : (
                                            <SelectItem value="0">
                                                Sin Marcas
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                <Button type="button" onClick={() => setIsAddBrandModalOpen(true)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {errors.brand && <p className="text-red-500 text-sm">{errors.brand}</p>}
                            <div className="flex items-center space-x-2">
                                <PenSquare className="h-4 w-4" />
                                <Input
                                    placeholder="Modelo"
                                    value={newCar.model}
                                    onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                                    required
                                />
                            </div>
                            {errors.model && <p className="text-red-500 text-sm">{errors.model}</p>}
                            <div className="flex items-center space-x-2">
                                <Tag className="h-4 w-4" />
                                <Input
                                    placeholder="Versión"
                                    value={newCar.version}
                                    onChange={(e) => setNewCar({ ...newCar, version: e.target.value })}
                                    required
                                />
                            </div>
                            {errors.version && <p className="text-red-500 text-sm">{errors.version}</p>}
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <Input
                                    placeholder="Año"
                                    type="number"
                                    value={newCar.year}
                                    onChange={(e) => setNewCar({ ...newCar, year: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Tag className="h-4 w-4" />
                                <Select onValueChange={(value) => setNewCar({ ...newCar, tipo: value })} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Básico">Básico</SelectItem>
                                        <SelectItem value="Premium">Premium</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.tipo && <p className="text-red-500 text-sm">{errors.type}</p>}
                            <div className="flex items-center space-x-2">
                                <Link className="h-4 w-4" />
                                <Input
                                    placeholder="URL de la imagen"
                                    type="file"
                                    accept="image/*"
                                    value={newCar.image}
                                    onChange={(e) => setImageFile(e.target.files[0])} // Guardar el archivo en imageFile
                                    required
                                />
                            </div>
                            {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
                            <div className="flex items-center space-x-2">
                                <Palette className="h-4 w-4" />
                                <Input
                                    type="color"
                                    value={newCar.color}
                                    onChange={(e) => setNewCar({ ...newCar, color: e.target.value })}
                                    required
                                />
                            </div>
                            {errors.color && <p className="text-red-500 text-sm">{errors.color}</p>}
                            <Button type="submit" disabled={newCar.brand === '' || newCar.model === '' || newCar.version === '' || newCar.year === '' || newCar.tipo === '' || !imageFile}>
                                <Plus className="mr-2 h-4 w-4" /> Agregar Auto
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <Dialog open={isAddBrandModalOpen} onOpenChange={setIsAddBrandModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Añadir Nueva Marca</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); addMarca(); }} className="space-y-4">
                            <div>
                                <Label htmlFor="new-brand">
                                    Nombre de la Marca
                                </Label>
                                <Input
                                    id="new-brand"
                                    value={marcaToAdd}
                                    className="mt-2"
                                    onChange={(e) => setMarcaToAdd(e.target.value)}
                                    placeholder="Ingrese el nombre de la nueva marca"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={marcaToAdd === ''}>Añadir Marca</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default AddForm;