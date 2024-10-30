/* eslint-disable no-unused-vars */
import { supabase } from '@/db/supabase';
import { createContext, useEffect, useMemo, useState } from 'react';

import AddForm from '@/components/AddForm';
import Graficas from '@/components/Graficas';
import Header from '@/components/Header';
import Loader2 from '@/components/Loader2';
import NavBar from '@/components/NavBar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { motion } from 'framer-motion';
import { AlertCircle, Calendar, Car, CarFront, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, Clock, Filter, Link, Palette, PenSquare, Search, Sparkles, Tag, X } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
)

// Tema context
const ThemeContext = createContext({ isDark: false, toggleTheme: () => { } })

// eslint-disable-next-line react/prop-types
function Notification({ message, success, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, 5000)

        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md flex items-center space-x-2 ${success ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span>{message}</span>
        </div>
    )
}

// eslint-disable-next-line react/prop-types
function Dashboard({ carsData = [] }) {
    const [cars, setCars] = useState(carsData);
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('home')
    const [isDark, setIsDark] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCar, setSelectedCar] = useState(null)
    const [open, setOpen] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [filters, setFilters] = useState({ brands: [], anios: [], types: [] })
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' })
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [errors, setErrors] = useState({})
    const [notification, setNotification] = useState(null)
    const [loading, setLoading] = useState(true);

    const toggleTheme = () => {
        setIsDark(!isDark)
    }

    // Ordenar coches
    const sortedCars = useMemo(() => {
        return [...cars].sort((a, b) => {
            if (sortConfig.key !== null) {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
            }
            return 0;
        });
    }, [cars, sortConfig]);

    // Filtrar coches
    const filteredCars = useMemo(() => {
        return sortedCars.filter(car =>
            (searchTerm === '' || Object.values(car).some(value =>
                value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )) &&
            (filters.brands.length === 0 || filters.brands.includes(car.marca)) &&
            (filters.anios.length === 0 || filters.anios.includes(car.anio.toString())) &&
            (filters.types.length === 0 || filters.types.includes(car.tipo))
        );
    }, [sortedCars, searchTerm, filters]);

    // Paginación
    const paginatedCars = useMemo(() => {
        return filteredCars.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredCars, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredCars.length / itemsPerPage)

    const uniqueBrands = [...new Set(cars.map(car => car.marca))]
    const uniqueanios = [...new Set(cars.map(car => car.anio))]


    const carTypes = ['Básico', 'Premium']
    const carsByType = useMemo(() => {
        return carTypes.map(tipo => cars.filter(car => car.tipo === tipo).length);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cars]);

    // funciones 
    const validateCar = (car) => {
        const newErrors = {}
        if (!car.brand) newErrors.brand = 'La marca es requerida'
        if (!car.model) newErrors.model = 'El modelo es requerido'
        if (!car.version) newErrors.version = 'La versión es requerida'
        if (!car.color) newErrors.color = 'El color es requerido'
        if (!car.tipo) newErrors.tipo = 'El tipo es requerido'
        if (!car.addedDate) newErrors.addedDate = 'La fecha de adición es requerida'
        // if (!car.image_url) newErrors.image = 'La imagen es requerida'
        // if (!car.image_path) newErrors.image = 'La imagen es requerida'
        return newErrors
    }

    // Falta terminar esta funcion
    const updateCar = async () => {
        const newErrors = validateCar(selectedCar)
        if (Object.keys(newErrors).length === 0) {
            setCars(cars.map(car => car.id === selectedCar.id ? selectedCar : car))
            setSelectedCar(null)
            setIsEditModalOpen(false)
            setNotification({ message: 'Coche actualizado con éxito', success: true })
        } else {
            setErrors(newErrors)
        }
    }

    const deleteCar = async (carId, imagePath) => {
        setLoading(true)

        try {
            // Eliminar la imagen del almacenamiento de Supabase
            if (imagePath) {
                const { error: deleteImageError } = await supabase.storage
                    .from('auto_images') // Nombre de tu bucket
                    .remove([imagePath]);

                if (deleteImageError) {
                    setLoading(false)
                    console.error('Error al eliminar la imagen:', deleteImageError.message);
                    return;
                }
            }

            // Eliminar el auto de la base de datos
            const { error } = await supabase
                .from('cars')
                .delete()
                .match({ id: carId }); // Asumiendo que el ID es la clave primaria

            if (error) {
                setLoading(false)
                console.error('Error al eliminar el coche:', error.message);
                return;
            }

            setCars(cars.filter(car => car.id !== carId))
            setSelectedCar(null)
            setNotification({ message: 'Coche eliminado con éxito', success: true })
            setLoading(false)
            // Aquí puedes agregar código para actualizar el estado o notificar al usuario
        } catch (err) {
            console.error('Error al eliminar el coche:', err);
        }

    }

    const handleFilterChange = (filterType, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [filterType]: prevFilters[filterType].includes(value)
                ? prevFilters[filterType].filter(item => item !== value)
                : [...prevFilters[filterType], value]
        }))
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const options = { day: '2-digit', month: 'long', anio: 'numeric' }
        return date.toLocaleDateString('es-MX', options)
    }

    const requestSort = (key) => {
        let direction = 'ascending'
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending'
        }
        setSortConfig({ key, direction })
    }

    const getSortIcon = (columnName) => {
        if (sortConfig.key === columnName) {
            return sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        }
        return null
    }
    // ----------------------------------------------------------------

    useEffect(() => {
        // Obtener la información del usuario actual
        const getCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);

        };

        getCurrentUser();
    }, []);

    // Función para añadir un nuevo coche y actualizar el estado
    const addCarToList = (newCar) => {
        setCars((prevCars) => [...prevCars, newCar]);
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {loading && (
                <Loader2 />
            )}
            <div>
                <div className={`min-h-screen ${isDark ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}>
                    {/* Header */}
                    <Header activeTab='dashboard' isDark={isDark} toggleTheme={toggleTheme} />

                    <main className="container mx-auto p-4 pb-20">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsContent value="home" className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5"
                                >
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total de Autos</CardTitle>
                                            <Car className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{cars.length}</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Autos Básicos</CardTitle>
                                            <CarFront className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{carsByType[0]}</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Autos Premium</CardTitle>
                                            <Sparkles className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{carsByType[1]}</div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                <div className="flex flex-wrap gap-4 mb-4">
                                    <div className="flex-grow relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <Input
                                            type="search"
                                            placeholder="Buscar autos..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">
                                                <Filter className="mr-2 h-4 w-4" /> Filtros
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[750px] h-[80%]">
                                            <DialogHeader>
                                                <DialogTitle>Filtros</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid grid-cols-1 gap-4">
                                                <ScrollArea className="h-[90%] w-full rounded-md border p-4">
                                                    <div className="flex gap-20 justify-center">
                                                        <div>
                                                            <h3 className="mb-2 font-semibold flex items-center"><Car className="mr-2 h-4 w-4" /> Marca</h3>
                                                            {uniqueBrands.map(brand => (
                                                                <div key={brand} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`brand-${brand}`}
                                                                        checked={filters.brands.includes(brand)}
                                                                        onCheckedChange={() => handleFilterChange('brands', brand)}
                                                                    />
                                                                    <label htmlFor={`brand-${brand}`}>{brand}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className='flex flex-col gap-5'>
                                                            <div>
                                                                <h3 className="mb-2 font-semibold flex items-center"><Calendar className="mr-2 h-4 w-4" /> Año</h3>
                                                                {uniqueanios.map(anio => (
                                                                    <div key={anio} className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id={`anio-${anio}`}
                                                                            checked={filters.anios.includes(anio.toString())}
                                                                            onCheckedChange={() => handleFilterChange('anios', anio.toString())}
                                                                        />
                                                                        <label htmlFor={`anio-${anio}`}>{anio}</label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div>
                                                                <h3 className="mb-2 font-semibold flex items-center"><Tag className="mr-2 h-4 w-4" /> Tipo</h3>
                                                                {carTypes.map(type => (
                                                                    <div key={type} className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id={`type-${type}`}
                                                                            checked={filters.types.includes(type)}
                                                                            onCheckedChange={() => handleFilterChange('types', type)}
                                                                        />
                                                                        <label htmlFor={`type-${type}`}>{type}</label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Imagen</TableHead>
                                                <TableHead onClick={() => requestSort('marca')} className="cursor-pointer">
                                                    <div className='flex items-center justify-center'>
                                                        <Car className="inline-block mr-2 h-4 w-4" />Marca {getSortIcon('marca')}
                                                    </div>
                                                </TableHead>
                                                <TableHead onClick={() => requestSort('modelo')} className="cursor-pointer">
                                                    <div className='flex items-center justify-center'>
                                                        <PenSquare className="inline-block mr-2 h-4 w-4" />Modelo {getSortIcon('modelo')}
                                                    </div>
                                                </TableHead>
                                                <TableHead onClick={() => requestSort('version')} className="cursor-pointer">
                                                    <div className='flex items-center justify-center'>
                                                        <Tag className="inline-block mr-2 h-4 w-4" />Versión {getSortIcon('version')}
                                                    </div>
                                                </TableHead>
                                                <TableHead onClick={() => requestSort('anio')} className="cursor-pointer">
                                                    <div className='flex items-center justify-center'>
                                                        <Calendar className="inline-block mr-2 h-4 w-4" />Año{getSortIcon('anio')}
                                                    </div>
                                                </TableHead>
                                                <TableHead onClick={() => requestSort('tipo')} className="cursor-pointer">
                                                    <div className='flex items-center justify-center'>
                                                        <Tag className="inline-block mr-2 h-4 w-4" />Tipo {getSortIcon('tipo')}
                                                    </div>
                                                </TableHead>
                                                <TableHead>
                                                    <div className='flex items-center justify-center'>
                                                        <Palette className="inline-block mr-2 h-4 w-4" />Color
                                                    </div>
                                                </TableHead>
                                                <TableHead onClick={() => requestSort('addedDate')} className="cursor-pointer">
                                                    <div className='flex items-center justify-center text-nowrap'>
                                                        <Clock className="inline-block mr-2 h-4 w-4" />Fecha de Adición {getSortIcon('addedDate')}
                                                    </div>
                                                </TableHead>
                                                {user == null ? null : <TableHead>Acciones</TableHead>}
                                                {/* <TableHead>Acciones</TableHead> */}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedCars.map((car) => (
                                                <TableRow key={car.id}>
                                                    <TableCell>
                                                        <img src={car.image_url} alt={`${car.brand} ${car.model}`} className="w-10 h-10 object-cover rounded" />
                                                    </TableCell>
                                                    <TableCell>{car.marca}</TableCell>
                                                    <TableCell>{car.modelo}</TableCell>
                                                    <TableCell>{car.version}</TableCell>
                                                    <TableCell>{car.anio}</TableCell>
                                                    <TableCell>{car.tipo}</TableCell>
                                                    <TableCell>
                                                        <div className='flex flex-row items-center text-nowrap'>
                                                            <span className="w-6 h-6 rounded-full inline-block mr-2" style={{ backgroundColor: car.color }}></span>
                                                            {car.color}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{formatDate(car.createdAt)}</TableCell>
                                                    {user == null ? null : (
                                                        <TableCell>
                                                            <Button variant="ghost" size="sm" onClick={() => { setSelectedCar(car); setIsEditModalOpen(true); }}>
                                                                <PenSquare className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => deleteCar(car.id, car.image_path)}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    )}

                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center space-x-2">
                                        <span>Autos por página:</span>
                                        <Select
                                            value={itemsPerPage.toString()}
                                            onValueChange={(value) => {
                                                setItemsPerPage(Number(value));
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <SelectTrigger className="w-[70px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[5, 10, 20, 50].map((value) => (
                                                    <SelectItem key={value} value={value.toString()}>
                                                        {value}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span>
                                        {currentPage} de {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* Add form */}
                            <TabsContent value="add">
                                <AddForm
                                    setNotification={setNotification}
                                    errors={errors}
                                    setErrors={setErrors}
                                    setActiveTab={setActiveTab}
                                    validateCar={validateCar}
                                    addCarToList={addCarToList}
                                />
                            </TabsContent>

                            {/* Graficas */}
                            <TabsContent value="stats" className="space-y-4">
                                <Graficas
                                    cars={cars}
                                    carTypes={carTypes}
                                />
                            </TabsContent>
                        </Tabs>
                    </main>

                    {/* Navbar */}
                    <NavBar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        user={user}
                    />

                    {/* Edit form modal */}
                    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Editar Auto</DialogTitle>
                            </DialogHeader>
                            {selectedCar && (
                                <form onSubmit={(e) => { e.preventDefault(); updateCar(); }}
                                    className="flex flex-col gap-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className='max-w-sm mx-auto md:max-w-full'>
                                            <div className="aspect-[5/6] overflow-hidden rounded-lg">
                                                <img
                                                    src={selectedCar.image_url}
                                                    alt={`${selectedCar.marca} ${selectedCar.model}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-2">
                                                <Car className="h-4 w-4 flex-shrink-0" />
                                                <Input
                                                    placeholder="Marca"
                                                    value={selectedCar.marca}
                                                    onChange={(e) => setSelectedCar({ ...selectedCar, marca: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            {errors.marca && <p className="text-red-500 text-sm">{errors.marca}</p>}

                                            <div className="flex items-center space-x-2">
                                                <PenSquare className="h-4 w-4" />
                                                <Input
                                                    placeholder="Modelo"
                                                    value={selectedCar.modelo}
                                                    onChange={(e) => setSelectedCar({ ...selectedCar, modelo: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            {errors.modelo && <p className="text-red-500 text-sm">{errors.modelo}</p>}

                                            <div className="flex items-center space-x-2">
                                                <Tag className="h-4 w-4" />
                                                <Input
                                                    placeholder="Versión"
                                                    value={selectedCar.version}
                                                    onChange={(e) => setSelectedCar({ ...selectedCar, version: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            {errors.version && <p className="text-red-500 text-sm">{errors.version}</p>}

                                            <div className="flex items-center space-x-2">
                                                <Calendar className="h-4 w-4" />
                                                <Input
                                                    placeholder="Año"
                                                    type="number"
                                                    value={selectedCar.anio}
                                                    onChange={(e) => setSelectedCar({ ...selectedCar, anio: e.target.value })}
                                                />
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Palette className="h-4 w-4" />
                                                <Input
                                                    type="color"
                                                    value={selectedCar.color}
                                                    onChange={(e) => setSelectedCar({ ...selectedCar, color: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            {errors.color && <p className="text-red-500 text-sm">{errors.color}</p>}

                                            <div className="flex items-center space-x-2">
                                                <Tag className="h-4 w-4" />
                                                <Select
                                                    value={selectedCar.tipo}
                                                    onValueChange={(value) => setSelectedCar({ ...selectedCar, tipo: value })}
                                                    required
                                                >
                                                    <SelectTrigger className="w-full">
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
                                                    value={selectedCar.image_url}
                                                    onChange={(e) => setSelectedCar({ ...selectedCar, image_url: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            {errors.image_url && <p className="text-red-500 text-sm">{errors.image_url}</p>}
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full mt-auto">Guardar Cambios</Button>

                                </form>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>


            {notification && (
                <Notification
                    message={notification.message}
                    success={notification.success}
                    onClose={() => setNotification(null)}
                />
            )}
        </ThemeContext.Provider>
    );
}

export default Dashboard;