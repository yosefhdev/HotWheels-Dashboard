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
import Carrusel from '@/components/Carrusel';
import EditForm from '@/components/EditForm';
import StatsCards from '@/components/StatsCards';
import Filters from '@/components/Filters';
import CarsTable from '@/components/CarsTable';

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
                value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )) &&
            (filters.brands.length === 0 || filters.brands.includes(car.marca)) &&
            (filters.anios.length === 0 || filters.anios.includes(car.anio?.toString())) &&
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
        // if (!car.addedDate) newErrors.addedDate = 'La fecha de adición es requerida'
        // if (!car.image_url) newErrors.image = 'La imagen es requerida'
        // if (!car.image_path) newErrors.image = 'La imagen es requerida'
        return newErrors
    }

    // Actualizar Carro
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
                                <StatsCards
                                    cars={cars}
                                    carsByType={carsByType}
                                />

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
                                    <Filters
                                        uniqueBrands={uniqueBrands}
                                        uniqueanios={uniqueanios}
                                        carTypes={carTypes}
                                        filters={filters}
                                        handleFilterChange={handleFilterChange}
                                    />
                                </div>
                                {/* CarsTable({requestSort, getSortIcon, user, paginatedCars, formatDate, setSelectedCar, setIsEditModalOpen, deleteCar, itemsPerPage, setItemsPerPage, setCurrentPage, currentPage, totalPages}) */}
                                <CarsTable
                                    requestSort={requestSort}
                                    getSortIcon={getSortIcon}
                                    user={user}
                                    paginatedCars={paginatedCars}
                                    formatDate={formatDate}
                                    setSelectedCar={setSelectedCar}
                                    setIsEditModalOpen={setIsEditModalOpen}
                                    deleteCar={deleteCar}
                                    itemsPerPage={itemsPerPage}
                                    setItemsPerPage={setItemsPerPage}
                                    setCurrentPage={setCurrentPage}
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                />

                                <dir>
                                    <Carrusel />
                                </dir>
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

                            {/* setNotification, errors, setErrors, setActiveTab, validateCar, updateCarInList, selectedCar  */}
                            <EditForm
                                setNotification={setNotification}
                                setActiveTab={setActiveTab}
                                updateCarInList={updateCar}
                                selectedCar={selectedCar}
                                setIsEditModalOpen={setIsEditModalOpen}
                                setCars={setCars}
                            />
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