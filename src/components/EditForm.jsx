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
import { fetchCars } from "@/actions/carActions";

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



function EditForm({ setNotification, setActiveTab, updateCarInList, selectedCar, setIsEditModalOpen, setCars }) {
    const [editedCar, setEditedCar] = useState(selectedCar)
    const [marcas, setMarcas] = useState([])
    const [marcaToAdd, setMarcaToAdd] = useState("")
    const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        getMarcas();
        if (selectedCar) {
            setEditedCar({
                id: selectedCar.id,
                marca: selectedCar.marca || '',
                modelo: selectedCar.modelo || '',
                version: selectedCar.version || '',
                anio: selectedCar.anio || '',
                tipo: selectedCar.tipo || '',
                color: selectedCar.color || '#000000',
                image_url: selectedCar.image_url || '',
                image_path: selectedCar.image_path || ''
            });
        }
    }, [selectedCar]);

    const validateCar = (car) => {
        let newErrors = {};
        if (!car.marca) newErrors.marca = "La marca es requerida";
        if (!car.modelo) newErrors.modelo = "El modelo es requerido";
        if (!car.version) newErrors.version = "La versión es requerida";
        if (!car.anio) newErrors.anio = "El año es requerido";
        else if (isNaN(car.anio) || car.anio < 1900 || car.anio > new Date().getFullYear() + 1) {
            newErrors.anio = "El año debe ser un número válido entre 1900 y el próximo año";
        }
        if (!car.tipo) newErrors.tipo = "El tipo es requerido";
        if (!car.color) newErrors.color = "El color es requerido";
        return newErrors;
    };

    const updateCar = async (e) => {
        e.preventDefault();
        setLoading(true)
        const newErrors = validateCar(editedCar)
        if (Object.keys(newErrors).length === 0) {
            let imagePath = editedCar.image_path;
            let imageUrl = editedCar.image_url;

            if (imageFile) {
                try {
                    const webpBlob = await convertToWebP(imageFile);
                    const fileName = `auto_${editedCar.marca}_${editedCar.modelo}_${Date.now()}.webp`;

                    const { data, error } = await supabase.storage
                        .from('auto_images')
                        .upload(`${fileName}`, webpBlob);

                    if (error) {
                        setLoading(false)
                        console.error('Error al subir la imagen:', error.message);
                        setNotification({ message: 'Error al subir la imagen', success: false });
                        return;
                    }

                    imagePath = data.path;
                    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                    imageUrl = `${supabaseUrl}/storage/v1/object/public/auto_images/${imagePath}`;

                } catch (error) {
                    setLoading(false)
                    setNotification({ message: 'Error al convertir la imagen a WebP: ' + error, success: false });
                    return;
                }
            }

            console.log("🚀 ~ updateCar ~ editedCar:", editedCar)
            const { data, error } = await supabase
                .from('cars')
                .update({
                    marca: editedCar.marca,
                    modelo: editedCar.modelo,
                    version: editedCar.version,
                    anio: editedCar.anio,
                    tipo: editedCar.tipo,
                    color: editedCar.color,
                    image_url: imageUrl,
                    image_path: imagePath,
                })
                .eq('id', editedCar.id)
                .select()

            if (data && data.length > 0) {
                console.log("🚀 ~ updateCar ~ data:", data[0])
                setLoading(false)
                setNotification({ message: 'Coche actualizado con éxito', success: true })
                updateCarInList(data[0])
                setActiveTab('home')
                setIsEditModalOpen(false)
                const cars = await fetchCars()
                setCars(cars)
            }

            if (error) {
                setLoading(false)
                setNotification({ message: 'Error al actualizar coche: ' + error.message, success: false })
            }
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
                setMarcas([])
            }

            if (error) {
                console.log("Error al obtener marcas: " + error)
            }
        } catch (e) {
            setNotification({ message: 'No se pudieron obtener las marcas: ' + e, success: false })
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
                setNotification({ message: 'La marca no se pudo agregar: ' + error, success: false })
            }
            setLoading(false)
        } catch (e) {
            setLoading(false)
            setNotification({ message: 'No se pudo agregar la marca: ' + e, success: false })
        }
    }

    if (!selectedCar) {
        return <div>No se ha seleccionado ningún auto para editar.</div>
    }

    return (
        <div>
            {loading && <Loader2 />}
            <div className="flex flex-col items-center space-y-4">
                <Card className={"max-w-3xl w-full"}>
                    <CardHeader>
                        <CardTitle>Editar Auto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={updateCar} className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Car className="h-4 w-4" />
                                <Select
                                    value={editedCar.marca}
                                    onValueChange={(value) => setEditedCar({ ...editedCar, marca: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Marca" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {marcas.map((marca) => (
                                            <SelectItem key={marca.id} value={marca.marca}>
                                                {marca.marca}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="button" onClick={() => setIsAddBrandModalOpen(true)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {errors.marca && <p className="text-red-500 text-sm">{errors.marca}</p>}
                            <div className="flex items-center space-x-2">
                                <PenSquare className="h-4 w-4" />
                                <Input
                                    placeholder="Modelo"
                                    value={editedCar.modelo}
                                    onChange={(e) => setEditedCar({ ...editedCar, modelo: e.target.value })}
                                    required
                                />
                            </div>
                            {errors.modelo && <p className="text-red-500 text-sm">{errors.modelo}</p>}
                            <div className="flex items-center space-x-2">
                                <Tag className="h-4 w-4" />
                                <Input
                                    placeholder="Versión"
                                    value={editedCar.version}
                                    onChange={(e) => setEditedCar({ ...editedCar, version: e.target.value })}
                                    required
                                />
                            </div>
                            {errors.version && <p className="text-red-500 text-sm">{errors.version}</p>}
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <Input
                                    placeholder="Año"
                                    type="number"
                                    value={editedCar.anio}
                                    onChange={(e) => setEditedCar({ ...editedCar, anio: e.target.value })}
                                    required
                                />
                            </div>
                            {errors.anio && <p className="text-red-500 text-sm">{errors.anio}</p>}
                            <div className="flex items-center space-x-2">
                                <Tag className="h-4 w-4" />
                                <Select
                                    value={editedCar.tipo}
                                    onValueChange={(value) => setEditedCar({ ...editedCar, tipo: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Básico">Básico</SelectItem>
                                        <SelectItem value="Premium">Premium</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.tipo && <p className="text-red-500 text-sm">{errors.tipo}</p>}
                            <div className="flex items-center space-x-2">
                                <Link className="h-4 w-4" />
                                <Input
                                    placeholder="URL de la imagen"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                />
                            </div>
                            {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
                            {editedCar.image_url && (
                                <div className="mt-2">
                                    <img src={editedCar.image_url} alt="Imagen actual del auto" className="w-32 h-32 object-cover rounded" />
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                <Palette className="h-4 w-4" />
                                <Input
                                    type="color"
                                    value={editedCar.color}
                                    onChange={(e) => setEditedCar({ ...editedCar, color: e.target.value })}
                                    required
                                />
                            </div>
                            {errors.color && <p className="text-red-500 text-sm">{errors.color}</p>}
                            <Button type="submit">
                                <PenSquare className="mr-2 h-4 w-4" /> Actualizar Auto
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

export default EditForm;