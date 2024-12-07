/* eslint-disable react/prop-types */

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Car, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock, Palette, PenSquare, Tag, X } from 'lucide-react';

function CarsTable({ requestSort, getSortIcon, user, paginatedCars, formatDate, setSelectedCar, setIsEditModalOpen, deleteCar, itemsPerPage, setItemsPerPage, setCurrentPage, currentPage, totalPages }) {

    return (
        <div>
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
        </div>
    );
}

export default CarsTable;